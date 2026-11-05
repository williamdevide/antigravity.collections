import { exec } from 'child_process';
import https from 'https';

/**
 * Validador estrito de número de edição e identificador de HQ
 * Impede que edições diferentes recebam a mesma capa genérica,
 * garante que o título pertença à HQ pesquisada (ex: não sugerir Deadpool para Wolverine)
 * e reconhece edições tanto no padrão Panini ("Wolverine (2022) Vol. 16") quanto Fandom ("Wolverine Vol 8 2")
 */
function matchIssueNumber(title, comicOrIssue, maybeIssue) {
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
 * Busca forçada no site oficial da Panini Brasil (panini.com.br)
 * Utiliza o binário curl para ultrapassar firewalls/Fastly e extrair capas originais
 * Prioriza estritamente os anos mais recentes (2026 > 2025 > 2024...) e filtra URLs rejeitadas
 */
function searchPaniniBrasil(title, issueNum, rejectedUrls = [], returnAll = false) {
  return new Promise((resolve) => {
    const issueStr = String(issueNum || '1').trim();
    const issuePad = issueStr.padStart(2, '0');

    const queries = [
      `${title} ${issueStr}`,
      `${title} ${issuePad}`,
      `${title}`
    ];

    let currentIdx = 0;
    const allFound = [];
    const seenUrls = new Set();

    function tryNextQuery() {
      if (currentIdx >= queries.length) {
        if (allFound.length > 0) {
          allFound.sort((a, b) => b.year - a.year);
          return resolve(returnAll ? allFound : allFound[0]);
        }
        return resolve(returnAll ? [] : null);
      }

      const q = queries[currentIdx++];
      const url = `https://panini.com.br/catalogsearch/result/?q=${encodeURIComponent(q)}`;
      const curlBin = process.platform === 'win32' ? 'curl.exe' : 'curl';
      const cmd = `${curlBin} -s -L --max-time 8 "${url}"`;

      exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err, stdout) => {
        if (err || !stdout) {
          return tryNextQuery();
        }

        try {
          const itemRegex = /<li[^>]*class=["'][^"']*product-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
          const items = [...stdout.matchAll(itemRegex)];
          if (!items || items.length === 0) {
            return tryNextQuery();
          }

          for (const item of items) {
            const content = item[1];
            const titleMatch = content.match(/class=["'][^"']*product-item-link[^"']*["'][^>]*>\s*([\s\S]*?)\s*<\/a>/i);
            const prodTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
            const imgMatch = content.match(/<img[^>]*class=["'][^"']*product-image-photo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                             content.match(/<img[^>]*src=["']([^"']+)["']/i);
            let imgUrl = imgMatch ? imgMatch[1] : '';

            if (imgUrl && prodTitle) {
              // Validação estrita do título da HQ e número da edição
              if (!matchIssueNumber(prodTitle, title, issueNum)) {
                continue;
              }

              imgUrl = imgUrl.replace(/&amp;/g, '&');
              // Elevação de resolução segura (S300 é suportado pelo CDN Cloudfront da Panini sem erro 302)
              if (imgUrl.includes('-S170-')) {
                imgUrl = imgUrl.replace('-S170-', '-S300-');
              }
              if (imgUrl.includes('/media/catalog/product/')) {
                imgUrl = imgUrl.split('?')[0];
              }

              // Pular capas já rejeitadas ou já registradas
              if (rejectedUrls.includes(imgUrl) || seenUrls.has(imgUrl)) {
                continue;
              }
              seenUrls.add(imgUrl);

              // Detectar ano de publicação
              const yearMatch = prodTitle.match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
              const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2020;

              allFound.push({
                title: prodTitle,
                coverUrl: imgUrl,
                source: 'Panini Brasil (panini.com.br)',
                year: parsedYear
              });
            }
          }

          if (allFound.length > 0 && !returnAll) {
            allFound.sort((a, b) => b.year - a.year);
            return resolve(allFound[0]);
          }

          tryNextQuery();
        } catch {
          tryNextQuery();
        }
      });
    }

    tryNextQuery();
  });
}

/**
 * Busca no Fandom MediaWiki com ordenação estrita do maior volume (mais novo) para o menor
 * e fallback progressivo para volumes anteriores caso uma capa seja rejeitada
 */
function searchFandom(title, issueNum, publisher, rejectedUrls = [], returnAll = false) {
  return new Promise(async (resolve) => {
    let wiki = 'marvel';
    if (publisher && (String(publisher).toLowerCase().includes('dc') || String(publisher).toLowerCase().includes('vertigo'))) {
      wiki = 'dc';
    }

    const engTitle = getEnglishTitle(title);
    const issueStr = String(issueNum);

    // Passo A: Consultar diretamente os volumes de 10 a 1 em lote (Titles API)
    // Volumes maiores correspondem às publicações mais recentes (ex: Wolverine Vol 8 = 2024-2026)
    const directTitles = [];
    for (let v = 10; v >= 1; v--) {
      directTitles.push(`${engTitle.replace(/\s+/g, '_')}_Vol_${v}_${issueStr}`);
    }
    if (engTitle !== title) {
      for (let v = 10; v >= 1; v--) {
        directTitles.push(`${title.replace(/\s+/g, '_')}_Vol_${v}_${issueStr}`);
      }
    }

    const titlesParam = encodeURIComponent(directTitles.join('|'));
    const directPath = `/api.php?action=query&format=json&titles=${titlesParam}&prop=pageimages|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;

    const directCandidates = await new Promise((resDirect) => {
      https.get({
        hostname: `${wiki}.fandom.com`,
        path: directPath,
        headers: { 'User-Agent': 'HQTrackerBot/1.0' }
      }, (resp) => {
        let body = '';
        resp.on('data', c => body += c);
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (!parsed.query || !parsed.query.pages) return resDirect([]);

            const pages = Object.values(parsed.query.pages).filter(p => !p.missing);
            const found = [];

            for (const p of pages) {
              const url = p.original?.source || p.thumbnail?.source;
              if (!url || rejectedUrls.includes(url)) continue;

              if (!matchIssueNumber(p.title, issueNum)) continue;

              const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
              const vol = volMatch ? parseInt(volMatch[1], 10) : 1;

              const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
              const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : 2020;

              found.push({
                title: p.title,
                coverUrl: url,
                source: `${wiki.toUpperCase()} Fandom (Vol ${vol})`,
                volume: vol,
                year: yr,
                rank: (vol * 10000) + yr
              });
            }

            found.sort((a, b) => b.rank - a.rank);
            resDirect(found);
          } catch {
            resDirect([]);
          }
        });
      }).on('error', () => resDirect([]));
    });

    if (directCandidates.length > 0 && !returnAll) {
      return resolve(directCandidates[0]);
    }

    // Passo B: Fallback ou complemento para busca genérica do Fandom com limite expandido (gsrlimit=30)
    const searchQuery = `${engTitle} ${issueStr}`;
    const fandomPath = `/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=30&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;

    https.get({
      hostname: `${wiki}.fandom.com`,
      path: fandomPath,
      headers: { 'User-Agent': 'HQTrackerBot/1.0' }
    }, (resp) => {
      let body = '';
      resp.on('data', c => body += c);
      resp.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const pages = parsed.query?.pages ? Object.values(parsed.query.pages) : [];
          const candidates = [...directCandidates];
          const seenUrls = new Set(candidates.map(c => c.coverUrl));

          for (const p of pages) {
            const url = p.original?.source || p.thumbnail?.source;
            if (!url || rejectedUrls.includes(url) || seenUrls.has(url)) continue;

            if (!matchIssueNumber(p.title, issueNum)) continue;

            const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
            const vol = volMatch ? parseInt(volMatch[1], 10) : 1;

            const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
            const textYearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
            const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : (textYearMatch ? parseInt(textYearMatch[1], 10) : 1990);

            seenUrls.add(url);
            candidates.push({
              title: p.title,
              coverUrl: url,
              source: `${wiki.toUpperCase()} Fandom (Vol ${vol})`,
              volume: vol,
              year: yr,
              rank: (vol * 10000) + yr
            });
          }

          candidates.sort((a, b) => b.rank - a.rank);
          if (candidates.length > 0) {
            return resolve(returnAll ? candidates : candidates[0]);
          }
          resolve(returnAll ? [] : null);
        } catch {
          resolve(returnAll ? directCandidates : (directCandidates[0] || null));
        }
      });
    }).on('error', () => resolve(returnAll ? directCandidates : (directCandidates[0] || null)));
  });
}

export default async function handler(req, res) {
  // Configurar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, issue, publisher, rejected } = req.query;
  if (!title) {
    return res.status(400).json({ found: false, message: 'Parâmetro "title" é obrigatório.' });
  }

  const issueNum = issue || '1';
  const cleanTitle = String(title).trim();
  const returnAll = req.query.all === 'true' || req.query.all === '1';

  const rejectedUrls = rejected 
    ? String(rejected).split(',').map(u => decodeURIComponent(u.trim())).filter(Boolean)
    : [];

  try {
    if (returnAll) {
      // Coleta todas as ocorrências encontradas em todas as fontes
      const [paniniList, fandomList] = await Promise.all([
        searchPaniniBrasil(cleanTitle, issueNum, rejectedUrls, true),
        searchFandom(cleanTitle, issueNum, publisher, rejectedUrls, true)
      ]);

      const seenUrls = new Set();
      const combined = [];

      for (const item of [...(paniniList || []), ...(fandomList || [])]) {
        if (item && item.coverUrl && !seenUrls.has(item.coverUrl) && !rejectedUrls.includes(item.coverUrl)) {
          seenUrls.add(item.coverUrl);
          combined.push(item);
        }
      }

      // Ordenar por relevância (Panini mais recentes e Fandom maiores volumes/anos)
      combined.sort((a, b) => {
        const scoreA = (a.volume ? a.volume * 10000 : (a.source?.includes('Panini') ? 90000 : 0)) + (a.year || 1990);
        const scoreB = (b.volume ? b.volume * 10000 : (b.source?.includes('Panini') ? 90000 : 0)) + (b.year || 1990);
        return scoreB - scoreA;
      });

      return res.status(200).json({
        found: combined.length > 0,
        coverUrl: combined[0]?.coverUrl || null,
        source: combined[0]?.source || null,
        year: combined[0]?.year || null,
        title: combined[0]?.title || null,
        candidates: combined
      });
    }

    // 1. Forçar a busca na Panini Brasil
    const paniniResult = await searchPaniniBrasil(cleanTitle, issueNum, rejectedUrls, false);
    if (paniniResult) {
      return res.status(200).json({
        found: true,
        coverUrl: paniniResult.coverUrl,
        source: paniniResult.source,
        year: paniniResult.year,
        title: paniniResult.title,
        candidates: [paniniResult]
      });
    }

    // 2. Fandom MediaWiki (maior volume / mais recente primeiro)
    const fandomResult = await searchFandom(cleanTitle, issueNum, publisher, rejectedUrls, false);
    if (fandomResult) {
      return res.status(200).json({
        found: true,
        coverUrl: fandomResult.coverUrl,
        source: fandomResult.source,
        year: fandomResult.year,
        title: fandomResult.title,
        candidates: [fandomResult]
      });
    }

    // 3. Fallback OpenLibrary
    const olPath = `/search.json?title=${encodeURIComponent(cleanTitle)}&limit=15`;
    const olResult = await new Promise((resolve) => {
      https.get({
        hostname: 'openlibrary.org',
        path: olPath,
        headers: { 'User-Agent': 'HQTrackerBot/1.0' }
      }, (resp) => {
        let body = '';
        resp.on('data', c => body += c);
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.docs && parsed.docs.length > 0) {
              const withCovers = parsed.docs
                .filter(d => d.cover_i)
                .map(d => ({
                  coverUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
                  title: d.title,
                  year: d.first_publish_year || 1995,
                  source: 'Open Library'
                }))
                .filter(c => matchIssueNumber(c.title, issueNum) && !rejectedUrls.includes(c.coverUrl));

              withCovers.sort((a, b) => b.year - a.year);
              if (withCovers.length > 0) {
                return resolve(withCovers[0]);
              }
            }
            resolve(null);
          } catch {
            resolve(null);
          }
        });
      }).on('error', () => resolve(null));
    });

    if (olResult) {
      return res.status(200).json({
        found: true,
        coverUrl: olResult.coverUrl,
        source: olResult.source,
        year: olResult.year,
        title: olResult.title,
        candidates: [olResult]
      });
    }

    return res.status(200).json({ found: false, message: 'Nenhuma capa encontrada.', candidates: [] });
  } catch (err) {
    return res.status(500).json({ found: false, error: err.message });
  }
}
