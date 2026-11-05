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

  // 1. Validar que o produto pertence à HQ pesquisada
  if (normComic) {
    const comicWords = normComic.split(/\s+/).filter(w => w.length > 2);
    const hasComicTitle = comicWords.length === 0 || comicWords.every(w => normTitle.includes(w));
    if (!hasComicTitle) {
      return false;
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

  // 4. Extrair números avulsos (desconsiderando Vol/Volume)
  const withoutVol = withoutYears.replace(/\bvol(?:ume|\.)?\s*\d+\b/gi, ' ');
  const standaloneNumbers = [...withoutVol.matchAll(/\b0*(\d+)\b/g)].map(m => parseInt(m[1], 10));

  if (standaloneNumbers.length > 0) {
    return standaloneNumbers.includes(num);
  }

  // 5. Padrão Panini Brasil: "Wolverine (2022) Vol. 16" onde "Vol. 16" é a própria edição
  const volMatch = withoutYears.match(/\bvol(?:ume|\.)?\s*(\d+)\b/i);
  if (volMatch && parseInt(volMatch[1], 10) === num) {
    return true;
  }

  return false;
}

const TITLE_MAP = {
  'homem-aranha': 'Spider-Man',
  'homem aranha': 'Spider-Man',
  'o espetacular homem-aranha': 'The Amazing Spider-Man',
  'vingadores': 'Avengers',
  'os vingadores': 'Avengers',
  'homem de ferro': 'Iron Man',
  'capitao america': 'Captain America',
  'capitão américa': 'Captain America',
  'quarteto fantastico': 'Fantastic Four',
  'quarteto fantástico': 'Fantastic Four',
  'liga da justica': 'Justice League',
  'liga da justiça': 'Justice League',
  'demolidor': 'Daredevil',
  'mulher-maravilha': 'Wonder Woman',
  'mulher maravilha': 'Wonder Woman',
  'arqueiro verde': 'Green Arrow',
  'lanterna verde': 'Green Lantern',
  'novissima wolverine': 'All-New Wolverine',
  'novíssima wolverine': 'All-New Wolverine',
  'justiceiro': 'The Punisher',
  'o justiceiro': 'The Punisher'
};

function getEnglishTitle(title) {
  const normalized = title.trim().toLowerCase();
  return TITLE_MAP[normalized] || title;
}

/**
 * Busca de contingência da Panini Brasil direto no cliente via proxy CORS público
 * Usado se o backend local ou endpoint serverless estiverem inacessíveis
 */
export async function searchPaniniClientSide(title, issueNum, rejectedUrls = [], returnAll = false) {
  try {
    const issueStr = String(issueNum || '1').trim();
    const issuePad = issueStr.padStart(2, '0');
    const queries = [
      `${title} ${issueStr}`,
      `${title} ${issuePad}`,
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
          allFound.sort((a, b) => b.year - a.year);
          return allFound[0];
        }
      } catch {
        // prosseguir para próxima query
      }
    }

    if (allFound.length > 0) {
      allFound.sort((a, b) => b.year - a.year);
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

  // 1. Tentar primeiro o endpoint relativo /api/scrape-cover (Vercel Serverless / Proxy local)
  try {
    const relativeUrl = `/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}${rejectedParam}`;
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
    const backendUrl = `http://localhost:3001/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}${rejectedParam}`;
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
    const paniniDirect = await searchPaniniClientSide(title, issueNum, rejectedUrls, false);
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

  // 4. Busca direta no Fandom MediaWiki (CORS liberado com origin=*)
  try {
    const wiki = publisher.toLowerCase().includes('dc') || publisher.toLowerCase().includes('vertigo') ? 'dc' : 'marvel';
    const engTitle = getEnglishTitle(title);

    // Passo A: Consultar diretamente os volumes de 10 a 1 em lote (Titles API)
    const directTitles = [];
    for (let v = 10; v >= 1; v--) {
      directTitles.push(`${engTitle.replace(/\s+/g, '_')}_Vol_${v}_${issue}`);
    }
    if (engTitle !== title) {
      for (let v = 10; v >= 1; v--) {
        directTitles.push(`${title.replace(/\s+/g, '_')}_Vol_${v}_${issue}`);
      }
    }

    const titlesUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&titles=${encodeURIComponent(directTitles.join('|'))}&prop=pageimages|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
    const titlesResp = await fetch(titlesUrl);
    if (titlesResp.ok) {
      const titlesData = await titlesResp.json();
      if (titlesData.query && titlesData.query.pages) {
        const pages = Object.values(titlesData.query.pages).filter(p => !p.missing);
        const candidates = [];

        for (const p of pages) {
          const url = p.original?.source || p.thumbnail?.source;
          if (!url || rejectedUrls.includes(url)) continue;
          if (!matchIssueNumber(p.title, title, issueNum)) continue;

          const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
          const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
          const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
          const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : 2020;

          candidates.push({
            coverUrl: url,
            title: p.title,
            year: yr,
            volume: vol,
            rank: (vol * 10000) + yr,
            source: `${wiki.toUpperCase()} Fandom (Vol ${vol})`
          });
        }

        candidates.sort((a, b) => b.rank - a.rank);
        if (candidates.length > 0) {
          return {
            found: true,
            coverUrl: candidates[0].coverUrl,
            source: candidates[0].source,
            year: candidates[0].year,
            title: candidates[0].title
          };
        }
      }
    }

    // Passo B: Fallback para busca genérica do Fandom com gsrlimit=30
    const searchQuery = `${engTitle} ${issue}`;
    const fandomUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=30&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;

    const fResp = await fetch(fandomUrl);
    if (fResp.ok) {
      const fData = await fResp.json();
      if (fData.query && fData.query.pages) {
        const pages = Object.values(fData.query.pages);
        const candidates = [];

        for (const p of pages) {
          const url = p.original?.source || p.thumbnail?.source;
          if (!url || rejectedUrls.includes(url)) continue;

          // Validação estrita de número de edição e título da HQ
          if (!matchIssueNumber(p.title, title, issueNum)) continue;

          const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
          const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
          const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
          const textYearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
          const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : (textYearMatch ? parseInt(textYearMatch[1], 10) : 1990);

          candidates.push({
            coverUrl: url,
            title: p.title,
            year: yr,
            volume: vol,
            rank: (vol * 10000) + yr,
            source: `${wiki.toUpperCase()} Fandom`
          });
        }

        candidates.sort((a, b) => b.rank - a.rank);
        if (candidates.length > 0) {
          return {
            found: true,
            coverUrl: candidates[0].coverUrl,
            source: candidates[0].source,
            year: candidates[0].year,
            title: candidates[0].title
          };
        }
      }
    }
  } catch (err) {
    console.warn('Fandom client fetch error:', err.message);
  }

  // 5. Fallback no OpenLibrary
  try {
    const olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=15`;
    const olResp = await fetch(olUrl);
    if (olResp.ok) {
      const olData = await olResp.json();
      if (olData.docs && olData.docs.length > 0) {
        const withCovers = olData.docs
          .filter(d => d.cover_i)
          .map(d => ({
            coverUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
            title: d.title,
            year: d.first_publish_year || 1995,
            source: 'Open Library'
          }))
          .filter(c => matchIssueNumber(c.title, title, issueNum) && !rejectedUrls.includes(c.coverUrl));

        withCovers.sort((a, b) => b.year - a.year);
        if (withCovers.length > 0) {
          return {
            found: true,
            coverUrl: withCovers[0].coverUrl,
            source: withCovers[0].source,
            year: withCovers[0].year,
            title: withCovers[0].title
          };
        }
      }
    }
  } catch (err) {
    console.warn('OpenLibrary client fetch error:', err.message);
  }

  return { found: false, message: 'Nenhuma capa encontrada.' };
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

  // 1. Tentar endpoint com all=true (Vercel Serverless / Proxy Vite local)
  try {
    const url = `/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}&all=true${rejectedParam}`;
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
    const backendUrl = `http://localhost:3001/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}&all=true${rejectedParam}`;
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

  // 3. Fallback no cliente: Combinar Panini Client-Side e Fandom MediaWiki
  try {
    const [paniniCandidates, fandomCandidates] = await Promise.all([
      searchPaniniClientSide(title, issueNum, rejectedUrls, true).catch(() => []),
      (async () => {
        const wiki = publisher.toLowerCase().includes('dc') || publisher.toLowerCase().includes('vertigo') ? 'dc' : 'marvel';
        const engTitle = getEnglishTitle(title);
        const directTitles = [];
        for (let v = 10; v >= 1; v--) {
          directTitles.push(`${engTitle.replace(/\s+/g, '_')}_Vol_${v}_${issue}`);
        }
        if (engTitle !== title) {
          for (let v = 10; v >= 1; v--) {
            directTitles.push(`${title.replace(/\s+/g, '_')}_Vol_${v}_${issue}`);
          }
        }

        const titlesUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&titles=${encodeURIComponent(directTitles.join('|'))}&prop=pageimages|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
        const titlesResp = await fetch(titlesUrl);
        if (titlesResp.ok) {
          const titlesData = await titlesResp.json();
          if (titlesData.query && titlesData.query.pages) {
            const pages = Object.values(titlesData.query.pages).filter(p => !p.missing);
            const found = [];

            for (const p of pages) {
              const url = p.original?.source || p.thumbnail?.source;
              if (!url || rejectedUrls.includes(url)) continue;
              if (!matchIssueNumber(p.title, title, issueNum)) continue;

              const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
              const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
              const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
              const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : 2020;

              found.push({
                coverUrl: url,
                title: p.title,
                year: yr,
                volume: vol,
                rank: (vol * 10000) + yr,
                source: `${wiki.toUpperCase()} Fandom (Vol ${vol})`
              });
            }

            return found;
          }
        }
        return [];
      })().catch(() => [])
    ]);

    const seenUrls = new Set();
    const combined = [];

    for (const item of [...(paniniCandidates || []), ...(fandomCandidates || [])]) {
      if (item && item.coverUrl && !seenUrls.has(item.coverUrl) && !rejectedUrls.includes(item.coverUrl)) {
        seenUrls.add(item.coverUrl);
        combined.push(item);
      }
    }

    combined.sort((a, b) => {
      const scoreA = (a.volume ? a.volume * 10000 : (a.source?.includes('Panini') ? 90000 : 0)) + (a.year || 1990);
      const scoreB = (b.volume ? b.volume * 10000 : (b.source?.includes('Panini') ? 90000 : 0)) + (b.year || 1990);
      return scoreB - scoreA;
    });

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
