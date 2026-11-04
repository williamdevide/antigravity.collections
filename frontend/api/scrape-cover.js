import { exec } from 'child_process';
import https from 'https';

/**
 * Validador estrito de número de edição
 * Impede que edições diferentes recebam a mesma capa genérica
 * e garante que anos de 4 dígitos (ex: 2025) não sejam confundidos com o número do fascículo
 */
function matchIssueNumber(title, issueNum) {
  const num = parseInt(issueNum, 10);
  if (isNaN(num)) return false;

  let cleaned = title.replace(/\b(19\d{2}|20[0-3]\d)\b/g, ' ');

  const fandomVolMatch = cleaned.match(/\bVol(?:ume|\.)?\s+(\d+)\s+(\d+)\b/i);
  if (fandomVolMatch) {
    const pageIssue = parseInt(fandomVolMatch[2], 10);
    return pageIssue === num;
  }

  if (/\bVol(?:ume|\.)?\s+\d+\b/i.test(cleaned) && !/\b(?:#|n[º°]|ed(?:ição|\.)?)\s*\d+/i.test(cleaned)) {
    return false;
  }

  const numRegex = new RegExp(`(?:^|[\\s#nº°\\-/:,(])0*${num}(?:$|[\\s\\-/:,)])`, 'i');
  if (!numRegex.test(cleaned)) {
    return false;
  }

  const candidates = [...cleaned.matchAll(/\b0*(\d+)\b/g)].map(m => parseInt(m[1], 10));
  return candidates.includes(num);
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
function searchPaniniBrasil(title, issueNum, rejectedUrls = []) {
  return new Promise((resolve) => {
    const issueStr = String(issueNum || '1').trim();
    const issuePad = issueStr.padStart(2, '0');

    const queries = [
      `${title} ${issueStr}`,
      `${title} ${issuePad}`,
      `${title}`
    ];

    let currentIdx = 0;

    function tryNextQuery() {
      if (currentIdx >= queries.length) {
        return resolve(null);
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

          const candidates = [];
          for (const item of items) {
            const content = item[1];
            const titleMatch = content.match(/class=["'][^"']*product-item-link[^"']*["'][^>]*>\s*([\s\S]*?)\s*<\/a>/i);
            const prodTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
            const imgMatch = content.match(/<img[^>]*class=["'][^"']*product-image-photo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                             content.match(/<img[^>]*src=["']([^"']+)["']/i);
            let imgUrl = imgMatch ? imgMatch[1] : '';

            if (imgUrl && prodTitle) {
              // Validação estrita do número da edição
              if (!matchIssueNumber(prodTitle, issueNum)) {
                continue;
              }

              imgUrl = imgUrl.replace(/&amp;/g, '&');
              if (imgUrl.includes('-S170-')) {
                imgUrl = imgUrl.replace('-S170-', '-S600-');
              }
              if (imgUrl.includes('/media/catalog/product/')) {
                imgUrl = imgUrl.split('?')[0];
              }

              // Pular capas já rejeitadas
              if (rejectedUrls.includes(imgUrl)) {
                continue;
              }

              // Detectar ano de publicação
              const yearMatch = prodTitle.match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
              const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2020;

              candidates.push({
                title: prodTitle,
                coverUrl: imgUrl,
                source: 'Panini Brasil (panini.com.br)',
                year: parsedYear
              });
            }
          }

          if (candidates.length > 0) {
            // Ordenar estritamente do ano mais recente para trás (2026 > 2025 > 2024...)
            candidates.sort((a, b) => b.year - a.year);
            return resolve(candidates[0]);
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
function searchFandom(title, issueNum, publisher, rejectedUrls = []) {
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

    if (directCandidates.length > 0) {
      return resolve(directCandidates[0]);
    }

    // Passo B: Fallback para busca genérica do Fandom com limite expandido (gsrlimit=30)
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
          if (!parsed.query || !parsed.query.pages) return resolve(null);

          const pages = Object.values(parsed.query.pages);
          const candidates = [];

          for (const p of pages) {
            const url = p.original?.source || p.thumbnail?.source;
            if (!url || rejectedUrls.includes(url)) continue;

            if (!matchIssueNumber(p.title, issueNum)) continue;

            const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
            const vol = volMatch ? parseInt(volMatch[1], 10) : 1;

            const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
            const textYearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
            const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : (textYearMatch ? parseInt(textYearMatch[1], 10) : 1990);

            candidates.push({
              title: p.title,
              coverUrl: url,
              source: `${wiki.toUpperCase()} Fandom`,
              volume: vol,
              year: yr,
              rank: (vol * 10000) + yr
            });
          }

          candidates.sort((a, b) => b.rank - a.rank);
          if (candidates.length > 0) {
            return resolve(candidates[0]);
          }
          resolve(null);
        } catch {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
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
  const rejectedUrls = rejected 
    ? String(rejected).split(',').map(u => decodeURIComponent(u.trim())).filter(Boolean)
    : [];

  try {
    // 1. Forçar a busca na Panini Brasil
    const paniniResult = await searchPaniniBrasil(cleanTitle, issueNum, rejectedUrls);
    if (paniniResult) {
      return res.status(200).json({
        found: true,
        coverUrl: paniniResult.coverUrl,
        source: paniniResult.source,
        year: paniniResult.year,
        title: paniniResult.title
      });
    }

    // 2. Fandom MediaWiki (maior volume / mais recente primeiro)
    const fandomResult = await searchFandom(cleanTitle, issueNum, publisher, rejectedUrls);
    if (fandomResult) {
      return res.status(200).json({
        found: true,
        coverUrl: fandomResult.coverUrl,
        source: fandomResult.source,
        year: fandomResult.year,
        title: fandomResult.title
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
                  url: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
                  title: d.title,
                  year: d.first_publish_year || 1995,
                  source: 'Open Library'
                }))
                .filter(c => matchIssueNumber(c.title, issueNum) && !rejectedUrls.includes(c.url));

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
        coverUrl: olResult.url,
        source: olResult.source,
        year: olResult.year,
        title: olResult.title
      });
    }

    return res.status(200).json({ found: false, message: 'Nenhuma capa encontrada.' });
  } catch (err) {
    return res.status(500).json({ found: false, error: err.message });
  }
}
