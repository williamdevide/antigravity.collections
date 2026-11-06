/**
 * Serviço de Busca e Normalização por ISBN
 * Consulta BrasilAPI, Google Books API e Open Library para obter metadados de HQs
 */

export function cleanISBN(isbn = '') {
  return String(isbn).replace(/[^0-9X]/gi, '').trim();
}

/**
 * Tenta inferir o Herói ou Grupo Principal a partir do título e descrição
 */
export function inferMainHero(text = '') {
  const t = text.toLowerCase();
  
  const heroesMap = [
    { name: 'Homem-Aranha', match: ['homem-aranha', 'homem aranha', 'spider-man', 'spiderman', 'peter parker', 'miles morales'] },
    { name: 'Batman', match: ['batman', 'cavaleiro das trevas', 'dark knight', 'bruce wayne', 'gotham'] },
    { name: 'Superman', match: ['superman', 'super-homem', 'super homem', 'clark kent', 'homem de aço', 'man of steel'] },
    { name: 'X-Men', match: ['x-men', 'x men', 'mutantes', 'wolverine', 'ciclope', 'magneto', 'xavier'] },
    { name: 'Vingadores', match: ['vingadores', 'avengers', 'capitão américa', 'captain america', 'homem de ferro', 'iron man', 'thor', 'hulk'] },
    { name: 'Demolidor', match: ['demolidor', 'daredevil', 'matt murdock'] },
    { name: 'Mulher-Maravilha', match: ['mulher-maravilha', 'mulher maravilha', 'wonder woman', 'diana prince'] },
    { name: 'Flash', match: ['flash', 'barry allen', 'wally west'] },
    { name: 'Lanterna Verde', match: ['lanterna verde', 'green lantern', 'hal jordan'] },
    { name: 'Liga da Justiça', match: ['liga da justiça', 'justice league'] },
    { name: 'Deadpool', match: ['deadpool', 'wade wilson'] },
    { name: 'Quarteto Fantástico', match: ['quarteto fantástico', 'fantastic four'] },
    { name: 'Sandman', match: ['sandman', 'morfeu', 'neil gaiman'] },
    { name: 'Turma da Mônica', match: ['turma da mônica', 'monica', 'cebolinha', 'cascão', 'magali'] },
    { name: 'Spawn', match: ['spawn', 'al simmons'] },
    { name: 'Coringa', match: ['coringa', 'joker'] }
  ];

  for (const item of heroesMap) {
    if (item.match.some(m => t.includes(m))) {
      return item.name;
    }
  }

  return '';
}

/**
 * Tenta inferir a Editora Original (Marvel / DC / Vertigo / Outras)
 */
export function inferPublisher(text = '') {
  const t = text.toLowerCase();
  if (t.includes('marvel') || t.includes('stan lee') || t.includes('spider-man') || t.includes('avengers') || t.includes('x-men')) {
    return 'Marvel';
  }
  if (t.includes('vertigo') || t.includes('sandman') || t.includes('hellblazer') || t.includes('preacher')) {
    return 'Vertigo';
  }
  if (t.includes('dc') || t.includes('dc comics') || t.includes('batman') || t.includes('superman') || t.includes('gotham')) {
    return 'DC';
  }
  return 'Outras';
}

/**
 * Tenta extrair o número do fascículo/volume do título
 */
export function extractIssueNumber(text = '') {
  if (!text) return 1;
  
  // Padrões como: #5, Vol. 3, Volume 3, Edição 12, Nº 4, N° 4
  const patterns = [
    /(?:vol(?:ume)?\.?|v\.)\s*(\d+)/i,
    /#\s*(\d+)/,
    /(?:edição|edicao|ed\.)\s*(\d+)/i,
    /(?:n[º°o]\.?)\s*(\d+)/i,
    /(?:fascículo|parte)\s*(\d+)/i
  ];

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  return 1;
}

/**
 * Consulta APIs públicas de livros/HQs com o ISBN
 */
export async function searchComicByISBN(rawIsbn) {
  const clean = cleanISBN(rawIsbn);
  if (!clean || (clean.length !== 10 && clean.length !== 13)) {
    throw new Error('Informe um ISBN válido com 10 ou 13 dígitos.');
  }

  let result = null;

  // 1. Tentar BrasilAPI (ótimo para lançamentos nacionais da Panini, Abril, etc.)
  try {
    const res = await fetch(`https://brasilapi.com.br/api/isbn/v1/${clean}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.title) {
        result = {
          title: data.title,
          subtitle: data.subtitle || '',
          publisherBrazil: data.publisher || '',
          year: data.year ? String(data.year) : '',
          synopsis: data.synopsis || '',
          authors: data.authors || [],
          coverUrl: null
        };
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar BrasilAPI:', err.message);
  }

  // 2. Tentar Google Books API (caso BrasilAPI falhe ou para obter capa e dados adicionais)
  try {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${clean}`);
    if (res.ok) {
      const data = await res.json();
      if (data.totalItems > 0 && data.items?.[0]?.volumeInfo) {
        const info = data.items[0].volumeInfo;
        const gYear = info.publishedDate ? info.publishedDate.substring(0, 4) : '';
        const gCover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || null;

        if (!result) {
          result = {
            title: info.title || '',
            subtitle: info.subtitle || '',
            publisherBrazil: info.publisher || '',
            year: gYear,
            synopsis: info.description || '',
            authors: info.authors || [],
            coverUrl: gCover ? gCover.replace('http://', 'https://') : null
          };
        } else {
          // Enriquece com capa se não tinha
          if (!result.coverUrl && gCover) {
            result.coverUrl = gCover.replace('http://', 'https://');
          }
          if (!result.year && gYear) {
            result.year = gYear;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar Google Books API:', err.message);
  }

  // 3. Tentar Open Library API como contingência
  if (!result) {
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${clean}&format=json&jscmd=data`);
      if (res.ok) {
        const data = await res.json();
        const book = data[`ISBN:${clean}`];
        if (book && book.title) {
          result = {
            title: book.title,
            subtitle: book.subtitle || '',
            publisherBrazil: book.publishers?.[0]?.name || '',
            year: book.publish_date ? book.publish_date.replace(/[^0-9]/g, '').substring(0, 4) : '',
            synopsis: typeof book.notes === 'string' ? book.notes : '',
            authors: (book.authors || []).map(a => a.name),
            coverUrl: book.cover?.large || book.cover?.medium || null
          };
        }
      }
    } catch (err) {
      console.warn('Erro ao consultar Open Library:', err.message);
    }
  }

  if (!result || !result.title) {
    throw new Error(`Nenhuma HQ encontrada para o ISBN ${clean}. Verifique o número ou preencha manualmente.`);
  }

  // Normalização final dos dados
  const fullText = `${result.title} ${result.subtitle} ${result.synopsis} ${(result.authors || []).join(' ')}`;
  const mainHero = inferMainHero(fullText);
  const publisher = inferPublisher(fullText);
  const issueNum = extractIssueNumber(`${result.title} ${result.subtitle}`);

  // Se o título incluir subtítulo ou volume, limpa o nome principal da HQ
  let cleanName = result.title;
  // Ex: "Batman - Volume 3: Morte da Família" -> "Batman" ou título amigável
  if (cleanName.includes(':')) {
    const parts = cleanName.split(':');
    cleanName = parts[0].trim();
  } else if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    cleanName = parts[0].trim();
  }

  return {
    isbn: clean,
    name: cleanName || result.title,
    fullTitle: result.title,
    subtitle: result.subtitle,
    publisher: publisher,
    brazilPublisher: result.publisherBrazil || '',
    startYear: result.year || '',
    mainHero: mainHero || '',
    issueNum: issueNum,
    coverUrl: result.coverUrl,
    synopsis: result.synopsis
  };
}

