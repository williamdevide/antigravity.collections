/**
 * Script de Build e Validação Global do Sistema
 * Camada 3: Execução Determinística
 */

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🏗️ [Build Global] Iniciando compilação do HQ Tracker...');

try {
  console.log('⚡ 1. Compilando Frontend com Vite + Tailwind CSS...');
  execSync('npm --prefix frontend run build', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Frontend compilado com sucesso em frontend/dist!');

  console.log('⚡ 2. Verificando sintaxe e módulos do Backend...');
  execSync('node --check backend/src/server.js', { cwd: rootDir, stdio: 'inherit' });
  console.log('✅ Backend validado com sucesso!');

  console.log('\n🎉 [Sucesso Total] Toda a aplicação está pronta para produção!');
} catch (err) {
  console.error('\n❌ Erro durante o processo de build:', err.message);
  process.exit(1);
}

