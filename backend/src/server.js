import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import https from 'https';

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
    // 1. Tentar busca no Fandom MediaWiki (DC / Marvel / Star Wars)
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

    // 2. Fallback para OpenLibrary
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
