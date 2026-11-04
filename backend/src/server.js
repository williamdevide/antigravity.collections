import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Armazenamento em memória / cache local de apoio para persistência complementar
let localComicsCache = [];

// Rota de Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'HQ Tracker API (Backend Express)',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Configurações públicas do Firebase
app.get('/api/firebase-config', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTHDOMAIN || '',
    projectId: process.env.FIREBASE_projectId || 'antigravitycollections',
    storageBucket: process.env.FIREBASE_storageBucket || '',
    messagingSenderId: process.env.FIREBASE_messagingSenderId || '',
    appId: process.env.FIREBASE_appId || ''
  });
});

// Obter coleções salvas no backend
app.get('/api/comics', (req, res) => {
  res.json({ success: true, count: localComicsCache.length, data: localComicsCache });
});

// Salvar/Sincronizar coleções no backend
app.post('/api/comics', (req, res) => {
  const { comics } = req.body;
  if (!Array.isArray(comics)) {
    return res.status(400).json({ success: false, message: 'Formato inválido. Esperado array "comics".' });
  }
  localComicsCache = comics;
  res.json({ success: true, count: localComicsCache.length, message: 'Coleções sincronizadas no backend com sucesso.' });
});

/**
 * Busca forçada no site oficial da Panini Brasil (panini.com.br)
 * Utiliza o binário curl para ultrapassar firewalls/Fastly e extrair capas originais
 */
function searchPaniniBrasil(title, issueNum) {
  return new Promise((resolve) => {
    const issueStr = String(issueNum || '1').trim();
    const issuePad = issueStr.padStart(2, '0');

    // Múltiplas variações de busca para tentar a todo custo
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
              // Se for Cloudfront, converter thumbnail -S170- para alta resolução -S600-
              if (imgUrl.includes('-S170-')) {
                imgUrl = imgUrl.replace('-S170-', '-S600-');
              }
              // Se for media/catalog/product, remover parâmetros para obter a arte original em alta resolução
              if (imgUrl.includes('/media/catalog/product/')) {
                imgUrl = imgUrl.split('?')[0];
              }

              // Detectar se o título possui o número da edição desejada
              const numRegex = new RegExp(`(^|\\D)(0?${issueStr}|#0?${issueStr}|vol\\.?\\s*0?${issueStr}|n[º°]\\s*0?${issueStr})($|\\D)`, 'i');
              const hasNum = numRegex.test(prodTitle);

              // Detectar ano
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
            // Prioriza correspondência com o número da edição e ano mais recente decrescente
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

/**
 * Endpoint de Scraping / Busca de Capas de Quadrinhos
 * Busca preferencialmente na Panini / Web com ordenação do ano mais recente para trás
 */
app.get('/api/scrape-cover', async (req, res) => {
  const { title, issue, publisher, year } = req.query;
  if (!title) {
    return res.status(400).json({ found: false, message: 'Parâmetro "title" é obrigatório.' });
  }

  const issueNum = issue || '1';
  const cleanTitle = String(title).trim();

  try {
    // 1. Tentar forçar a busca a todo custo no site oficial da Panini Brasil (panini.com.br)
    const paniniResult = await searchPaniniBrasil(cleanTitle, issueNum);
    if (paniniResult) {
      return res.json({
        found: true,
        coverUrl: paniniResult.coverUrl,
        source: paniniResult.source,
        year: paniniResult.year,
        title: paniniResult.title
      });
    }

    // 2. Se não encontrar na Panini, tentar busca no Fandom MediaWiki (DC / Marvel / Vertigo / Star Wars)
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
              // Procurar páginas que tenham imagem
              const candidates = pages
                .filter(p => p.original?.source || p.thumbnail?.source)
                .map(p => {
                  const url = p.original?.source || p.thumbnail?.source;
                  // Tentar extrair ano do título ou texto
                  const yearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
                  const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
                  return {
                    url,
                    title: p.title,
                    year: parsedYear,
                    source: `${wiki.toUpperCase()} Fandom`
                  };
                });

              // Ordenar do ano mais recente para trás
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
      return res.json({
        found: true,
        coverUrl: fandomResult.url,
        source: fandomResult.source,
        year: fandomResult.year,
        title: fandomResult.title
      });
    }

    // 3. Fallback para OpenLibrary
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
      return res.json({
        found: true,
        coverUrl: olResult.url,
        source: olResult.source,
        year: olResult.year,
        title: olResult.title
      });
    }

    return res.json({ found: false, message: 'Nenhuma capa encontrada para esta edição.' });
  } catch (error) {
    res.status(500).json({ found: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 [Backend Express] HQ Tracker API rodando na porta ${PORT}`);
});
