/**
 * Script de Deploy e Configuração para a Vercel
 * Camada 3: Execução Determinística
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('⚡ [Vercel Deploy] Preparando publicação na Vercel...');

// 1. Executar build de produção
try {
  console.log('📦 Gerando build de produção da aplicação Frontend...');
  execSync('npm run build:frontend', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Build concluído com sucesso em frontend/dist!');
} catch (err) {
  console.error('❌ Falha ao compilar build:', err.message);
  process.exit(1);
}

// 2. Verificar se o Vercel CLI está instalado
try {
  execSync('npx vercel --version', { stdio: 'pipe' });
  console.log('🚀 Iniciando deploy via Vercel CLI...');
  console.log('Execute o comando abaixo para vincular sua conta e publicar:');
  console.log('\n   npx vercel --prod\n');
} catch (err) {
  console.log('ℹ️ Para publicar diretamente na Vercel:');
  console.log('1. Conecte o repositório GitHub criado na Vercel (https://vercel.com/new)');
  console.log('2. Ou execute "npx vercel" no terminal raiz.');
}

