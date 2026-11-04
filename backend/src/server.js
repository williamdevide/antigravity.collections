import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Carregar variáveis de ambiente do .env raiz se existir
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

app.listen(PORT, () => {
  console.log(`🚀 [Backend Express] HQ Tracker API rodando na porta ${PORT}`);
});

