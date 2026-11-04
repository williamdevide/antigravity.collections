import { exec } from 'child_process';
import https from 'https';

/**
 * Endpoint Serverless Vercel para busca de capas de quadrinhos
 * Força a busca no site da Panini Brasil (panini.com.br)
 * Fallback para Fandom MediaWiki (DC / Marvel / Vertigo) e OpenLibrary
 */
function searchPaniniBrasil(title, issueNum) {
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
              imgUrl = imgUrl.replace(/&amp;/g, '&');
              if (imgUrl.includes('-S170-')) {
                imgUrl = imgUrl.replace('-S170-', '-S600-');
              }
              if (imgUrl.includes('/media/catalog/product/')) {
                imgUrl = imgUrl.split('?')[0];
              }

              const numRegex = new RegExp(`(^|\\D)(0?${issueStr}|#0?${issueStr}|vol\\.?\\s*0?${issueStr}|n[º°]\\s*0?${issueStr})($|\\D)`, 'i');
              const hasNum = numRegex.test(prodTitle);
              const yearMatch = prodTitle.match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
              const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2025;

              candidates.push({
                title: prodTitle,
                coverUrl: imgUrl,
                source: 'Panini Brasil (panini.com.br)',
                year: parsedYear,
                hasNum
              });
            }
          }

          if (candidates.length > 0) {
            candidates.sort((a, b) => {
              if (a.hasNum && !b.hasNum) return -1;
              if (!a.hasNum && b.hasNum) return 1;
              return b.year - a.year;
            });
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

export default async function handler(req, res) {
  // Configurar cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, issue, publisher } = req.query;
  if (!title) {
    return res.status(400).json({ found: false, message: 'Parâmetro "title" é obrigatório.' });
  }

  const issueNum = issue || '1';
  const cleanTitle = String(title).trim();

  try {
    // 1. Forçar a busca na Panini Brasil
    const paniniResult = await searchPaniniBrasil(cleanTitle, issueNum);
    if (paniniResult) {
      return res.status(200).json({
        found: true,
        coverUrl: paniniResult.coverUrl,
        source: paniniResult.source,
        year: paniniResult.year,
        title: paniniResult.title
      });
    }

    // 2. Fandom MediaWiki
    let wiki = 'marvel';
    if (publisher && String(publisher).toLowerCase().includes('dc')) {
      wiki = 'dc';
    } else if (publisher && String(publisher).toLowerCase().includes('vertigo')) {
      wiki = 'dc';
    }

    const searchQuery = `${cleanTitle} ${issueNum}`;
    const fandomPath = `/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=5&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;

    const fandomResult = await new Promise((resolve) => {
      https.get({
        hostname: `${wiki}.fandom.com`,
        path: fandomPath,
        headers: { 'User-Agent': 'HQTrackerBot/1.0 (Mozilla/5.0)' }
      }, (resp) => {
        let body = '';
        resp.on('data', c => body += c);
        resp.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            if (parsed.query && parsed.query.pages) {
              const pages = Object.values(parsed.query.pages);
              const candidates = pages
                .filter(p => p.original?.source || p.thumbnail?.source)
                .map(p => {
                  const url = p.original?.source || p.thumbnail?.source;
                  const yearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
                  const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
                  return {
                    url,
                    title: p.title,
                    year: parsedYear,
                    source: `${wiki.toUpperCase()} Fandom`
                  };
                });

              candidates.sort((a, b) => b.year - a.year);
              if (candidates.length > 0) {
                return resolve(candidates[0]);
              }
            }
            resolve(null);
          } catch {
            resolve(null);
          }
        });
      }).on('error', () => resolve(null));
    });

    if (fandomResult) {
      return res.status(200).json({
        found: true,
        coverUrl: fandomResult.url,
        source: fandomResult.source,
        year: fandomResult.year,
        title: fandomResult.title
      });
    }

    // 3. Fallback OpenLibrary
    const olPath = `/search.json?title=${encodeURIComponent(cleanTitle)}&limit=5`;
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
                  year: d.first_publish_year || 2024,
                  source: 'Open Library'
                }));

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
