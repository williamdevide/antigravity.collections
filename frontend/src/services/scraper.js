/**
 * Serviço de Scraping e Busca de Capas de Quadrinhos
 * Busca preferencialmente na Panini / Web com ordenação estrita do mais recente para trás
 * e suporte a fallback progressivo para anos anteriores quando uma capa for rejeitada
 */

export function matchIssueNumber(title, comicOrIssue, maybeIssue) {
  const comicName = maybeIssue !== undefined ? comicOrIssue : '';
  const issueNum = maybeIssue !== undefined ? maybeIssue : comicOrIssue;

  if (!title) return false;
  const num = parseInt(issueNum, 10);
  if (isNaN(num)) return false;

  const normTitle = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normComic = comicName ? comicName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

  // 1. Validar que o produto pertence à HQ pesquisada (evita títulos totalmente divergentes como Deadpool para Wolverine)
  if (normComic) {
    const stopWords = new Set(['star', 'wars', 'starwars', 'the', 'hq', 'revista', 'livro', 'edicao', 'especial', 'volume', 'comic', 'comics', 'marvel', 'dc', 'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em', 'para', 'com']);
    const comicWords = normComic.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (comicWords.length > 0) {
      const engMapped = getEnglishTitle(normComic).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const engWords = engMapped.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
      const hasMatch = comicWords.some(w => normTitle.includes(w)) || engWords.some(w => normTitle.includes(w));
      if (!hasMatch) {
        return false;
      }
    }
  }

  // 2. Remover anos de 4 dígitos (1950 a 2035) para não confundir anos como 2025 ou 2026 com edições
  const withoutYears = normTitle.replace(/\b(19\d{2}|20[0-3]\d)\b/g, ' ');

  // 3. Tratar padrão Fandom internacional: "Wolverine Vol 8 2" (volume 8, edição 2)
  const fandomVolMatch = withoutYears.match(/\bvol(?:ume|\.)?\s+(\d+)\s+(\d+)\b/i);
  if (fandomVolMatch) {
    const pageIssue = parseInt(fandomVolMatch[2], 10);
    return pageIssue === num;
  }

  // 4. Padrão Panini Brasil: "Wolverine (2022) Vol. 16" onde "Vol. 16" é a própria edição
  const volMatch = withoutYears.match(/\bvol(?:ume|\.)?\s*(\d+)\b/i);
  if (volMatch && parseInt(volMatch[1], 10) === num) {
    return true;
  }

  // 5. Extrair números avulsos (desconsiderando Vol/Volume)
  const withoutVol = withoutYears.replace(/\bvol(?:ume|\.)?\s*\d+\b/gi, ' ');
  const standaloneNumbers = [...withoutVol.matchAll(/\b0*(\d+)\b/g)].map(m => parseInt(m[1], 10));

  if (standaloneNumbers.length > 0) {
    return standaloneNumbers.includes(num);
  }

  // 6. Suporte a Edição #01 para Graphic Novels, Encadernados e Volumes Únicos:
  // Se a edição buscada for 1 (ou 01) e o título encontrado não contiver numeração explícita ou volume conflitante (como Vol. 2),
  // aceita a capa como a edição única/volume 1 da publicação (ex: "Vader's Little Princess", "A Princesinha de Vader", "Watchmen")
  if (num === 1 && standaloneNumbers.length === 0 && !volMatch) {
    return true;
  }

  return false;
}

export const TITLE_MAP = {
  // Star Wars & Jeffrey Brown
  'star wars a princesinha de vader': "Vader's Little Princess",
  'starwars a princesinha de vader': "Vader's Little Princess",
  'a princesinha de vader': "Vader's Little Princess",
  'princesinha de vader': "Vader's Little Princess",
  'star wars darth vader e filho': 'Darth Vader and Son',
  'starwars darth vader e filho': 'Darth Vader and Son',
  'darth vader e filho': 'Darth Vader and Son',
  'boa noite darth vader': 'Goodnight Darth Vader',
  'doutora aphra': 'Doctor Aphra',
  'star wars doutora aphra': 'Star Wars: Doctor Aphra',
  'imperio despedacado': 'Shattered Empire',
  'star wars imperio despedacado': 'Star Wars: Shattered Empire',

  // Marvel
  'homem-aranha': 'Spider-Man',
  'homem aranha': 'Spider-Man',
  'o espetacular homem-aranha': 'The Amazing Spider-Man',
  'o espetacular homem aranha': 'The Amazing Spider-Man',
  'vingadores': 'Avengers',
  'os vingadores': 'Avengers',
  'homem de ferro': 'Iron Man',
  'capitao america': 'Captain America',
  'capitão américa': 'Captain America',
  'quarteto fantastico': 'Fantastic Four',
  'quarteto fantástico': 'Fantastic Four',
  'demolidor': 'Daredevil',
  'novissima wolverine': 'All-New Wolverine',
  'novíssima wolverine': 'All-New Wolverine',
  'justiceiro': 'The Punisher',
  'o justiceiro': 'The Punisher',
  'gaviao arqueiro': 'Hawkeye',
  'gavião arqueiro': 'Hawkeye',
  'viuva negra': 'Black Widow',
  'viúva negra': 'Black Widow',
  'feiticeira escarlate': 'Scarlet Witch',
  'pantera negra': 'Black Panther',
  'cavaleiro da lua': 'Moon Knight',
  'motoqueiro fantasma': 'Ghost Rider',
  'guerra civil': 'Civil War',
  'guerras secretas': 'Secret Wars',
  'guerra secreta': 'Secret War',
  'desafio infinito': 'Infinity Gauntlet',
  'guerra infinita': 'Infinity War',
  'cruzada infinita': 'Infinity Crusade',
  'dinastia m': 'House of M',
  'velho logan': 'Old Man Logan',

  // DC Comics & Vertigo
  'a brigada dos encapotados': 'The Trenchcoat Brigade',
  'brigada dos encapotados': 'The Trenchcoat Brigade',
  'trenchcoat brigade': 'The Trenchcoat Brigade',
  'os livros da magia': 'The Books of Magic',
  'livros da magia': 'The Books of Magic',
  'patrulha do destino': 'Doom Patrol',
  'monstro do pantano': 'Swamp Thing',
  'monstro do pântano': 'Swamp Thing',
  'homem animal': 'Animal Man',
  'homem-animal': 'Animal Man',
  'esquadrao suicida': 'Suicide Squad',
  'esquadrão suicida': 'Suicide Squad',
  'novos titas': 'Teen Titans',
  'novos titãs': 'Teen Titans',
  'titas': 'Titans',
  'titãs': 'Titans',
  'asa noturna': 'Nightwing',
  'capuz vermelho': 'Red Hood',
  'mulher gato': 'Catwoman',
  'mulher-gato': 'Catwoman',
  'gaviao negro': 'Hawkman',
  'gavião negro': 'Hawkman',
  'mulher gaviao': 'Hawkgirl',
  'mulher gavião': 'Hawkgirl',
  'sociedade da justica': 'Justice Society of America',
  'sociedade da justiça': 'Justice Society of America',
  'legiao dos super-herois': 'Legion of Super-Heroes',
  'legião dos super-heróis': 'Legion of Super-Heroes',
  'aves de rapina': 'Birds of Prey',
  'fabulas': 'Fables',
  'fábulas': 'Fables',
  'hellblazer': 'John Constantine, Hellblazer',
  'sandman': 'The Sandman',
  'lucifer': 'Lucifer',
  'lúcifer': 'Lucifer',
  'preacher': 'Preacher',
  'transmetropolitan': 'Transmetropolitan',
  'y o ultimo homem': 'Y: The Last Man',
  'y o último homem': 'Y: The Last Man',
  'liga da justica': 'Justice League',
  'liga da justiça': 'Justice League',
  'mulher-maravilha': 'Wonder Woman',
  'mulher maravilha': 'Wonder Woman',
  'arqueiro verde': 'Green Arrow',
  'lanterna verde': 'Green Lantern',
  'a piada mortal': 'Batman: The Killing Joke',
  'o cavaleiro das trevas': 'Batman: The Dark Knight Returns',
  'cavaleiro das trevas': 'Batman: The Dark Knight Returns',
  'ano um': 'Batman: Year One',
  'o longo dia das bruxas': 'Batman: The Long Halloween',
  'a morte do superman': 'The Death of Superman',
  'o retorno do superman': 'The Return of Superman',
  'reino do amanha': 'Kingdom Come',
  'reino do amanhã': 'Kingdom Come',
  'ponto de ignicao': 'Flashpoint',
  'ponto de ignição': 'Flashpoint',
  'crise nas infinitas terras': 'Crisis on Infinite Earths',
  'crise infinita': 'Infinite Crisis',
  'crise final': 'Final Crisis',
  'asilo arkham': 'Arkham Asylum',

  // Image & Outros
  'mortos-vivos': 'The Walking Dead',
  'os mortos vivos': 'The Walking Dead',
  'invencivel': 'Invincible',
  'invencível': 'Invincible',
  'tartarugas ninja': 'Teenage Mutant Ninja Turtles',
  'as tartarugas ninja': 'Teenage Mutant Ninja Turtles',
  'tio patinhas': 'Uncle Scrooge',
  'pato donald': 'Donald Duck'
};

// Cache dinâmico de tradução e mapeamento de títulos descobertos via Wikipédia / Wikidata
const DYNAMIC_TITLE_CACHE = new Map();

/**
 * Tradução e Descoberta Dinâmica de Títulos PT-BR ➔ EN
 * 1. Consulta o mapa estático de alta velocidade (TITLE_MAP)
 * 2. Consulta o cache dinâmico em memória da sessão
 * 3. Faz busca na API da Wikipédia em português (pt.wikipedia.org) e extrai o interwiki link para inglês (lllang=en)
 */
export async function resolveEnglishTitle(title) {
  if (!title) return '';
  const syncMatch = getEnglishTitle(title);
  if (syncMatch && syncMatch !== title) {
    return syncMatch;
  }

  const norm = title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[:\-]/g, ' ').replace(/\s+/g, ' ');
  if (DYNAMIC_TITLE_CACHE.has(norm)) {
    return DYNAMIC_TITLE_CACHE.get(norm);
  }

  try {
    const cleanSearch = title.replace(/\b(especial|minisserie|minissérie|colecao|coleção|mensal|hq|livro|edicao|edição|vol(?:ume|\.)?\s*\d+)\b/gi, '').trim();
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearch || title)}&format=json&origin=*`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const searchResp = await fetch(searchUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (searchResp.ok) {
      const searchData = await searchResp.json();
      const topPage = searchData.query?.search?.[0]?.title;
      if (topPage) {
        const langUrl = `https://pt.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=en&titles=${encodeURIComponent(topPage)}&format=json&origin=*`;
        const lController = new AbortController();
        const lTimeoutId = setTimeout(() => lController.abort(), 2500);
        const langResp = await fetch(langUrl, { signal: lController.signal });
        clearTimeout(lTimeoutId);

        if (langResp.ok) {
          const langData = await langResp.json();
          const pages = langData.query?.pages || {};
          const pageObj = Object.values(pages)[0];
          const engLink = pageObj?.langlinks?.[0]?.['*'];
          if (engLink) {
            // Remove sufixos como " (comics)" ou " (comic book)"
            const cleanedEng = engLink.replace(/\s*\((?:comics|comic\s+book|limited\s+series|character|graphic\s+novel)\)$/i, '').trim();
            DYNAMIC_TITLE_CACHE.set(norm, cleanedEng);
            return cleanedEng;
          }
        }
      }
    }
  } catch {
    // Falha silenciosa no fallback da Wikipédia
  }

  DYNAMIC_TITLE_CACHE.set(norm, title);
  return title;
}

export function getEnglishTitle(title) {
  if (!title) return '';
  const norm = title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[:\-]/g, ' ').replace(/\s+/g, ' ');
  if (TITLE_MAP[norm]) return TITLE_MAP[norm];
  if (DYNAMIC_TITLE_CACHE.has(norm)) return DYNAMIC_TITLE_CACHE.get(norm);
  for (const [k, v] of Object.entries(TITLE_MAP)) {
    if (norm.includes(k)) return v;
  }
  return title;
}

export function getRelevantWikis(title, publisher) {
  const normTitle = (title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normPub = (publisher || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const wikis = [];

  if (normTitle.includes('star') || normTitle.includes('wars') || normTitle.includes('vader') || 
      normTitle.includes('jedi') || normTitle.includes('sith') || normTitle.includes('yoda') || 
      normTitle.includes('mandalorian') || normTitle.includes('aphra') || normPub.includes('star')) {
    wikis.push('starwars');
  }

  if (normPub.includes('dc') || normPub.includes('vertigo') || normTitle.includes('batman') || 
      normTitle.includes('superman') || normTitle.includes('coringa') || normTitle.includes('joker') || 
      normTitle.includes('flash') || normTitle.includes('lantern') || normTitle.includes('mulher-maravilha') || 
      normTitle.includes('wonder woman') || normTitle.includes('justica') || normTitle.includes('justice') ||
      normTitle.includes('encapotados') || normTitle.includes('trenchcoat') || normTitle.includes('constantine') ||
      normTitle.includes('hellblazer') || normTitle.includes('sandman') || normTitle.includes('magia')) {
    wikis.push('dc');
  }

  if (normPub.includes('image') || normTitle.includes('spawn') || normTitle.includes('invincible') || 
      normTitle.includes('invencivel') || normTitle.includes('walking dead') || normTitle.includes('saga')) {
    wikis.push('imagecomics');
  }

  if (normPub.includes('dark horse') || normTitle.includes('hellboy') || normTitle.includes('sin city') || 
      normTitle.includes('conan') || normTitle.includes('umbrella')) {
    wikis.push('darkhorse');
  }

  if (normPub.includes('disney') || normPub.includes('abril') || normTitle.includes('patinhas') || 
      normTitle.includes('donald') || normTitle.includes('mickey') || normTitle.includes('ducktales')) {
    wikis.push('disney');
  }

  if (normPub.includes('marvel') || normTitle.includes('aranha') || normTitle.includes('spider') || 
      normTitle.includes('wolverine') || normTitle.includes('x-men') || normTitle.includes('vingadores') || 
      normTitle.includes('avengers') || normTitle.includes('hulk') || normTitle.includes('thor') || 
      normTitle.includes('ferro') || normTitle.includes('capitao')) {
    wikis.push('marvel');
  }

  // Priorização baseada na editora selecionada pelo usuário
  if (normPub.includes('dc') || normPub.includes('vertigo')) {
    if (!wikis.includes('dc')) {
      wikis.unshift('dc');
    } else {
      const idx = wikis.indexOf('dc');
      if (idx > 0) {
        wikis.splice(idx, 1);
        wikis.unshift('dc');
      }
    }
  }

  if (!wikis.includes('starwars')) wikis.push('starwars');
  if (!wikis.includes('marvel')) wikis.push('marvel');
  if (!wikis.includes('dc')) wikis.push('dc');
  if (!wikis.includes('imagecomics')) wikis.push('imagecomics');
  if (!wikis.includes('darkhorse')) wikis.push('darkhorse');

  return wikis;
}

export function getWikiLabel(wiki) {
  switch (wiki) {
    case 'starwars': return 'Star Wars Fandom (Wookieepedia)';
    case 'marvel': return 'Marvel Fandom';
    case 'dc': return 'DC Fandom';
    case 'imagecomics': return 'Image Comics Fandom';
    case 'darkhorse': return 'Dark Horse Fandom';
    case 'disney': return 'Disney Fandom';
    default: return `${wiki.toUpperCase()} Fandom`;
  }
}

export function scoreCandidate(candidate, cleanTitle, issueNum, prefSeries) {
  const normCandidate = (candidate.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normComic = (cleanTitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const engMapped = getEnglishTitle(cleanTitle).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let score = (candidate.volume ? candidate.volume * 10000 : (candidate.source?.includes('Panini') ? 90000 : 0)) + (candidate.year || 1990);

  const cleanEng = engMapped.replace(/^(the|a|an|o|a|os|as)\s+/i, '');
  const cleanCand = normCandidate.replace(/^(the|a|an|o|a|os|as)\s+/i, '');

  if (normCandidate === engMapped || normCandidate === normComic) {
    score += 500000;
  } else if (cleanCand.includes(cleanEng) || cleanEng.includes(cleanCand) || normCandidate.includes(engMapped) || engMapped.includes(normCandidate)) {
    score += 450000;
  }

  // Bônus prioritário para candidato com número de edição explícito correspondente à edição pesquisada
  const num = parseInt(issueNum, 10);
  const withoutYears = normCandidate.replace(/\b(19\d{2}|20[0-3]\d)\b/g, ' ');
  const hasExplicitVolIssue = withoutYears.match(new RegExp(`\\bvol(?:ume|\\.)?\\s*\\d+\\s+0*${num}\\b`, 'i'));
  const hasExplicitNumber = withoutYears.match(new RegExp(`\\b0*${num}\\b`));
  if (hasExplicitVolIssue || hasExplicitNumber) {
    score += 500000;
  }

  // Bônus massivo para correspondência exata do título base da série (evita spinoffs como Novíssima Wolverine para Wolverine)
  const normS = cleanTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const baseTitle = normCandidate.replace(/\s*\(\d{4}\).*$/, '').replace(/\s+vol(?:ume|\.)?\s*\d+.*$/i, '').trim();
  if (baseTitle === normS || normCandidate.startsWith(normS + ' ') || normCandidate.startsWith(normS + '(')) {
    score += 600000;
  }

  // Penalização para capas variantes de revendedores ou páginas de equipes/universos
  if (normCandidate.includes('variant') || normCandidate.includes('exclusive') || normCandidate.includes('homage')) {
    score -= 200000;
  }
  if (normCandidate.includes('universe') || normCandidate.includes('earth') || normCandidate.includes('character')) {
    score -= 300000;
  }

  if ((normComic.includes('princesinha') || engMapped.includes('princess')) && normCandidate.includes('princess')) {
    score += 200000;
  }
  if ((normComic.includes('filho') || engMapped.includes('son')) && normCandidate.includes('son')) {
    score += 200000;
  }

  const itemSrc = (candidate.source || '').toLowerCase();
  if (prefSeries?.source && itemSrc.includes(prefSeries.source.toLowerCase())) score += 300000;
  if (prefSeries?.year && candidate.year === prefSeries.year) score += 400000;
  if (prefSeries?.volume && candidate.volume === prefSeries.volume) score += 350000;

  return score;
}

/**
 * Busca de contingência da Panini Brasil direto no cliente via proxy CORS público
 * Usado se o backend local ou endpoint serverless estiverem inacessíveis
 */
export async function searchPaniniClientSide(title, issueNum, rejectedUrls = [], returnAll = false, prefSeries = null) {
  try {
    const issueStr = String(issueNum || '1').trim();
    const issuePad = issueStr.padStart(2, '0');
    // Consulta prioritária por edição formatada em 2 dígitos (padrão Panini Brasil: "Wolverine 01", "Wolverine 16")
    const queries = [
      `${title} ${issuePad}`,
      `${title} ${issueStr}`,
      `${title}`
    ];

    const allFound = [];
    const seenUrls = new Set();

    for (const q of queries) {
      try {
        const targetUrl = `https://panini.com.br/catalogsearch/result/?q=${encodeURIComponent(q)}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const resp = await fetch(proxyUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!resp.ok) continue;
        const html = await resp.text();
        if (!html) continue;

        let items = [];
        if (typeof DOMParser !== 'undefined') {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const liList = doc.querySelectorAll('li.product-item');
          liList.forEach(li => {
            const titleEl = li.querySelector('.product-item-link');
            const imgEl = li.querySelector('img.product-image-photo') || li.querySelector('img');
            const prodTitle = titleEl ? titleEl.textContent.trim().replace(/\s+/g, ' ') : '';
            const imgUrl = imgEl ? (imgEl.getAttribute('src') || '') : '';
            if (prodTitle && imgUrl) {
              items.push({ prodTitle, imgUrl });
            }
          });
        } else {
          const itemRegex = /<li[^>]*class=["'][^"']*product-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
          const matches = [...html.matchAll(itemRegex)];
          for (const m of matches) {
            const content = m[1];
            const titleMatch = content.match(/class=["'][^"']*product-item-link[^"']*["'][^>]*>\s*([\s\S]*?)\s*<\/a>/i);
            const prodTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
            const imgMatch = content.match(/<img[^>]*class=["'][^"']*product-image-photo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                             content.match(/<img[^>]*src=["']([^"']+)["']/i);
            const imgUrl = imgMatch ? imgMatch[1] : '';
            if (prodTitle && imgUrl) {
              items.push({ prodTitle, imgUrl });
            }
          }
        }

        for (const item of items) {
          let { prodTitle, imgUrl } = item;
          if (!matchIssueNumber(prodTitle, title, issueNum)) continue;

          imgUrl = imgUrl.replace(/&amp;/g, '&');
          if (imgUrl.includes('-S170-')) {
            imgUrl = imgUrl.replace('-S170-', '-S300-');
          }
          if (imgUrl.includes('/media/catalog/product/')) {
            imgUrl = imgUrl.split('?')[0];
          }

          if (rejectedUrls.includes(imgUrl) || seenUrls.has(imgUrl)) continue;
          seenUrls.add(imgUrl);

          const yearMatch = prodTitle.match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
          const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2020;

          allFound.push({
            title: prodTitle,
            coverUrl: imgUrl,
            source: 'Panini Brasil (panini.com.br)',
            year: parsedYear
          });
        }

        if (allFound.length > 0 && !returnAll) {
          allFound.sort((a, b) => scoreCandidate(b, title, issueNum, prefSeries) - scoreCandidate(a, title, issueNum, prefSeries));
          return allFound[0];
        }
      } catch {
        // prosseguir para próxima query
      }
    }

    if (allFound.length > 0) {
      allFound.sort((a, b) => scoreCandidate(b, title, issueNum, prefSeries) - scoreCandidate(a, title, issueNum, prefSeries));
      return returnAll ? allFound : allFound[0];
    }
    return returnAll ? [] : null;
  } catch {
    return returnAll ? [] : null;
  }
}

export async function searchIssueCover(comic, issueNum, rejectedUrls = []) {
  const title = comic.name;
  const publisher = comic.publisher || 'Marvel';
  const issue = String(issueNum);
  const rejectedParam = rejectedUrls.length > 0 ? `&rejected=${encodeURIComponent(rejectedUrls.join(','))}` : '';

  // Parâmetros da série confirmada para guiar as outras edições
  const prefSeries = comic.preferredSeries;
  const prefYearParam = prefSeries?.year ? `&prefYear=${encodeURIComponent(prefSeries.year)}` : '';
  const prefVolParam = prefSeries?.volume ? `&prefVol=${encodeURIComponent(prefSeries.volume)}` : '';
  const prefSrcParam = prefSeries?.source ? `&prefSource=${encodeURIComponent(prefSeries.source)}` : '';
  const prefParams = `${prefYearParam}${prefVolParam}${prefSrcParam}`;

  // 1. Tentar primeiro o endpoint relativo /api/scrape-cover (Vercel Serverless / Proxy local)
  try {
    const relativeUrl = `/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}${rejectedParam}${prefParams}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const resp = await fetch(relativeUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.found && data.coverUrl && !rejectedUrls.includes(data.coverUrl)) {
        return {
          found: true,
          coverUrl: data.coverUrl,
          source: data.source || 'Panini Brasil (panini.com.br)',
          year: data.year || 2025,
          title: data.title || `${title} #${issue}`,
          candidates: data.candidates || []
        };
      }
    }
  } catch {
    // Prosseguir para tentar o servidor Express local na porta 3001
  }

  // 2. Tentar endpoint do backend Express local se estiver ativo na porta 3001
  try {
    const backendUrl = `http://localhost:3001/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}${rejectedParam}${prefParams}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const resp = await fetch(backendUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.found && data.coverUrl && !rejectedUrls.includes(data.coverUrl)) {
        return {
          found: true,
          coverUrl: data.coverUrl,
          source: data.source || 'Panini Brasil (panini.com.br)',
          year: data.year || 2025,
          title: data.title || `${title} #${issue}`,
          candidates: data.candidates || []
        };
      }
    }
  } catch (err) {
    // Prosseguir para contingência no cliente
  }

  // 3. Contingência: Forçar busca direta no site da Panini Brasil via proxy de cliente
  try {
    const paniniDirect = await searchPaniniClientSide(title, issueNum, rejectedUrls, false, prefSeries);
    if (paniniDirect && paniniDirect.coverUrl) {
      return {
        found: true,
        coverUrl: paniniDirect.coverUrl,
        source: paniniDirect.source,
        year: paniniDirect.year,
        title: paniniDirect.title
      };
    }
  } catch (err) {
    // Prosseguir para Fandom
  }

  // 4. Busca direta no Fandom MediaWiki (Multi-Wiki inteligente)
  try {
    const fandomResult = await searchFandomClient(title, issueNum, publisher, rejectedUrls, prefSeries, false);
    if (fandomResult && fandomResult.coverUrl) {
      return {
        found: true,
        coverUrl: fandomResult.coverUrl,
        source: fandomResult.source,
        year: fandomResult.year,
        title: fandomResult.title
      };
    }
  } catch (err) {
    console.warn('Fandom client fetch error:', err);
  }

  // 5. Fallback no OpenLibrary
  try {
    const olResult = await searchOpenLibraryClient(title, issueNum, rejectedUrls, prefSeries, false);
    if (olResult && olResult.coverUrl) {
      return {
        found: true,
        coverUrl: olResult.coverUrl,
        source: olResult.source,
        year: olResult.year,
        title: olResult.title
      };
    }
  } catch (err) {
    console.warn('OpenLibrary client fetch error:', err);
  }

  return { found: false, message: 'Nenhuma capa encontrada.' };
}

export async function searchFandomClient(title, issueNum, publisher, rejectedUrls = [], prefSeries = null, returnAll = false) {
  const cleanTitle = String(title).trim();
  const engTitle = await resolveEnglishTitle(cleanTitle);
  const issueStr = String(issueNum);
  const wikis = getRelevantWikis(cleanTitle, publisher);

  // Variações abrangentes de títulos (com e sem artigos 'The', 'A', 'An', 'O', 'Os', etc.)
  const titleVariants = new Set();
  [engTitle, cleanTitle].forEach(t => {
    if (!t) return;
    titleVariants.add(t);
    const withoutArticle = t.replace(/^(the|a|an|o|a|os|as)\s+/i, '').trim();
    if (withoutArticle) titleVariants.add(withoutArticle);
  });

  const allCandidates = [];
  const seenUrls = new Set();

  for (const wiki of wikis) {
    const wikiLabel = getWikiLabel(wiki);

    // Passo A: Consultar diretamente títulos de volumes (Titles API) para todas as variações
    const directTitles = [];
    for (const tv of titleVariants) {
      for (let v = 10; v >= 1; v--) {
        directTitles.push(`${tv.replace(/\s+/g, '_')}_Vol_${v}_${issueStr}`);
      }
      if (issueStr === '1') {
        directTitles.push(tv.replace(/\s+/g, '_'));
      }
    }

    try {
      const titlesUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&titles=${encodeURIComponent(directTitles.slice(0, 50).join('|'))}&prop=pageimages|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
      const titlesResp = await fetch(titlesUrl);
      if (titlesResp.ok) {
        const titlesData = await titlesResp.json();
        if (titlesData.query?.pages) {
          const pages = Object.values(titlesData.query.pages).filter(p => !p.missing);
          for (const p of pages) {
            const url = p.original?.source || p.thumbnail?.source;
            if (!url || rejectedUrls.includes(url) || seenUrls.has(url)) continue;
            if (!matchIssueNumber(p.title, cleanTitle, issueNum)) continue;

            const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
            const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
            const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
            const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : 2020;

            seenUrls.add(url);
            allCandidates.push({
              title: p.title,
              coverUrl: url,
              year: yr,
              volume: vol,
              source: wikiLabel
            });
          }
        }
      }
    } catch {}

    // Passo B: Generator search para todas as variações
    const queries = [];
    for (const tv of titleVariants) {
      queries.push(`${tv} ${issueStr}`);
      if (issueStr === '1') {
        queries.push(tv);
      }
    }

    for (const q of queries) {
      try {
        const fandomUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=12&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
        const fResp = await fetch(fandomUrl);
        if (fResp.ok) {
          const fData = await fResp.json();
          if (fData.query?.pages) {
            const pages = Object.values(fData.query.pages);
            for (const p of pages) {
              const url = p.original?.source || p.thumbnail?.source;
              if (!url || rejectedUrls.includes(url) || seenUrls.has(url)) continue;
              if (!matchIssueNumber(p.title, cleanTitle, issueNum)) continue;

              const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
              const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
              const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
              const textYearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
              const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : (textYearMatch ? parseInt(textYearMatch[1], 10) : 2015);

              seenUrls.add(url);
              allCandidates.push({
                title: p.title,
                coverUrl: url,
                year: yr,
                volume: vol,
                source: wikiLabel
              });
            }
          }
        }
      } catch {}
    }

    // Se já encontramos candidatos na wiki principal relevante e não precisamos de todos, encerra busca
    if (allCandidates.length > 0 && !returnAll) {
      break;
    }
  }

  allCandidates.sort((a, b) => scoreCandidate(b, cleanTitle, issueNum, prefSeries) - scoreCandidate(a, cleanTitle, issueNum, prefSeries));
  return returnAll ? allCandidates : (allCandidates[0] || null);
}

export async function searchOpenLibraryClient(title, issueNum, rejectedUrls = [], prefSeries = null, returnAll = false) {
  const cleanTitle = String(title).trim();
  const engTitle = getEnglishTitle(cleanTitle);
  const queries = [cleanTitle];
  if (engTitle && engTitle !== cleanTitle) queries.push(engTitle);

  const candidates = [];
  const seenUrls = new Set();

  for (const q of queries) {
    try {
      const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=10`;
      const olResp = await fetch(olUrl);
      if (olResp.ok) {
        const olData = await olResp.json();
        if (olData.docs?.length > 0) {
          for (const d of olData.docs) {
            if (!d.cover_i) continue;
            const coverUrl = `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`;
            if (rejectedUrls.includes(coverUrl) || seenUrls.has(coverUrl)) continue;
            if (!matchIssueNumber(d.title, cleanTitle, issueNum)) continue;

            seenUrls.add(coverUrl);
            candidates.push({
              title: d.title,
              coverUrl,
              year: d.first_publish_year || 2015,
              source: 'Open Library'
            });
          }
        }
      }
    } catch {}
  }

  candidates.sort((a, b) => scoreCandidate(b, cleanTitle, issueNum, prefSeries) - scoreCandidate(a, cleanTitle, issueNum, prefSeries));
  return returnAll ? candidates : (candidates[0] || null);
}

/**
 * Busca todas as ocorrências de capas disponíveis para uma HQ e número de edição
 * Retorna uma lista completa de alternativas com ano, volume, fonte e imagem
 */
export async function searchAllIssueCovers(comic, issueNum, rejectedUrls = []) {
  const title = comic.name;
  const publisher = comic.publisher || 'Marvel';
  const issue = String(issueNum);
  const rejectedParam = rejectedUrls.length > 0 ? `&rejected=${encodeURIComponent(rejectedUrls.join(','))}` : '';

  // Parâmetros da série confirmada para ordenar todas as ocorrências
  const prefSeries = comic.preferredSeries;
  const prefYearParam = prefSeries?.year ? `&prefYear=${encodeURIComponent(prefSeries.year)}` : '';
  const prefVolParam = prefSeries?.volume ? `&prefVol=${encodeURIComponent(prefSeries.volume)}` : '';
  const prefSrcParam = prefSeries?.source ? `&prefSource=${encodeURIComponent(prefSeries.source)}` : '';
  const prefParams = `${prefYearParam}${prefVolParam}${prefSrcParam}`;

  // 1. Tentar endpoint com all=true (Vercel Serverless / Proxy Vite local)
  try {
    const url = `/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}&all=true${rejectedParam}${prefParams}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.candidates && data.candidates.length > 0) {
        return {
          found: true,
          candidates: data.candidates,
          coverUrl: data.coverUrl || data.candidates[0].coverUrl
        };
      }
    }
  } catch {
    // Prosseguir para fallback
  }

  // 2. Tentar backend local porta 3001
  try {
    const backendUrl = `http://localhost:3001/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}&all=true${rejectedParam}${prefParams}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const resp = await fetch(backendUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.candidates && data.candidates.length > 0) {
        return {
          found: true,
          candidates: data.candidates,
          coverUrl: data.coverUrl || data.candidates[0].coverUrl
        };
      }
    }
  } catch {
    // Prosseguir para fallback no cliente
  }

  // 3. Fallback no cliente: Combinar Panini Client-Side, Fandom Multi-Wiki e OpenLibrary
  try {
    const [paniniCandidates, fandomCandidates, olCandidates] = await Promise.all([
      searchPaniniClientSide(title, issueNum, rejectedUrls, true, prefSeries).catch(() => []),
      searchFandomClient(title, issueNum, publisher, rejectedUrls, prefSeries, true).catch(() => []),
      searchOpenLibraryClient(title, issueNum, rejectedUrls, prefSeries, true).catch(() => [])
    ]);

    const seenUrls = new Set();
    const combined = [];

    for (const item of [...(paniniCandidates || []), ...(fandomCandidates || []), ...(olCandidates || [])]) {
      if (item && item.coverUrl && !seenUrls.has(item.coverUrl) && !rejectedUrls.includes(item.coverUrl)) {
        seenUrls.add(item.coverUrl);
        combined.push(item);
      }
    }

    combined.sort((a, b) => scoreCandidate(b, title, issueNum, prefSeries) - scoreCandidate(a, title, issueNum, prefSeries));

    if (combined.length > 0) {
      return {
        found: true,
        candidates: combined,
        coverUrl: combined[0].coverUrl
      };
    }
  } catch (err) {
    console.warn('Client fallback search error:', err);
  }

  return { found: false, candidates: [] };
}
