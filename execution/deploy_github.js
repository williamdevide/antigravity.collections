/**
 * Script de Deploy e Versionamento Automático no GitHub
 * Camada 3: Execução Determinística
 */

import { execSync } from 'child_process';
import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const rootEnvPath = path.resolve(rootDir, '.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
} else {
  dotenv.config();
}

const token = process.env.GITHUB_TOKEN;
const repoName = 'antigravity.collections';

function execCommand(cmd, cwd = rootDir) {
  try {
    return execSync(cmd, { cwd, encoding: 'utf-8', stdio: 'pipe' }).trim();
  } catch (err) {
    return null;
  }
}

async function requestGitHub(path, method, body = null) {
  return new Promise((resolve) => {
    const dataString = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: 'api.github.com',
      path,
      method,
      headers: {
        'User-Agent': 'Antigravity-Orchestrator',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        ...(dataString ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(dataString) } : {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => resolve({ status: 500, error: err.message }));
    if (dataString) req.write(dataString);
    req.end();
  });
}

async function run() {
  console.log('🚀 [GitHub Deploy] Iniciando processo de versionamento e sincronização...');

  // 1. Inicializar Git local se não existir
  if (!fs.existsSync(path.join(rootDir, '.git'))) {
    console.log('📦 Inicializando repositório Git local...');
    execCommand('git init');
  }

  // 2. Configurar user.name e user.email temporários se não existirem
  const currentName = execCommand('git config user.name');
  if (!currentName) {
    execCommand('git config user.name "Antigravity Assistant"');
    execCommand('git config user.email "antigravity@deepmind.google"');
  }

  // 3. Adicionar arquivos e criar commit
  console.log('📑 Preparando arquivos e commit inicial...');
  execCommand('git add .');
  execCommand('git commit -m "feat: initial commit - HQ Tracker Mobile First Collection Manager"');

  if (!token) {
    console.error('❌ [Erro]: GITHUB_TOKEN não configurado no arquivo .env.');
    return;
  }

  // 4. Testar autenticação no GitHub
  console.log('🔑 Validando GITHUB_TOKEN junto à API do GitHub...');
  const userCheck = await requestGitHub('/user', 'GET');
  if (userCheck.status === 401) {
    console.warn('⚠️ GITHUB_TOKEN inválido ou expirado (Bad credentials).');
    console.warn('👉 Para publicar no GitHub:');
    console.warn('   1. Acesse: https://github.com/settings/tokens/new');
    console.warn('   2. Marque a permissão "repo" e gere o token.');
    console.warn('   3. Atualize GITHUB_TOKEN no arquivo .env e execute novamente: npm run deploy:github');
    return;
  }

  const username = userCheck.data.login;
  console.log(`👤 Autenticado no GitHub como: ${username}`);

  // 5. Verificar se repositório já existe ou criar
  console.log(`📁 Verificando repositório "${repoName}"...`);
  let repoCheck = await requestGitHub(`/repos/${username}/${repoName}`, 'GET');
  if (repoCheck.status === 404) {
    console.log(`🔨 Criando repositório público "${repoName}" no GitHub...`);
    repoCheck = await requestGitHub('/user/repos', 'POST', {
      name: repoName,
      description: 'HQ Tracker - Aplicação Web First Mobile para Controle Rápido de Coleções de HQs (Google Antigravity)',
      private: false
    });
  }

  const remoteUrl = `https://${token}@github.com/${username}/${repoName}.git`;
  console.log('🔗 Configurando remote origin...');
  execCommand('git remote remove origin');
  execCommand(`git remote add origin ${remoteUrl}`);
  execCommand('git branch -M main');

  console.log('⬆️ Enviando commits para o GitHub...');
  const pushResult = execCommand('git push -u origin main --force');
  console.log('✅ Repositório publicado com sucesso no GitHub!');
  console.log(`🌐 Link: https://github.com/${username}/${repoName}`);
}

run();

