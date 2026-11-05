/**
 * Script de Teste Automatizado do Scraper Multi-Wiki e Tradução Dinâmica
 * Camada 3: Execução Determinística (Framework Agente Orquestrador)
 */

import { searchFandomClient, scoreCandidate, matchIssueNumber, resolveEnglishTitle } from '../frontend/src/services/scraper.js';

async function runTests() {
  console.log('🧪 Iniciando Testes de Validação do Scraper...\n');

  let passed = 0;
  let failed = 0;

  // Teste 1: Tradução Dinâmica e Mapeamento de Títulos
  console.log('--- Teste 1: Resolução de Título "A Brigada dos Encapotados" ---');
  try {
    const resolved = await resolveEnglishTitle('A Brigada dos Encapotados');
    console.log('Título resolvido:', resolved);
    if (resolved.toLowerCase().includes('trenchcoat brigade')) {
      console.log('✅ Teste 1 PASSOU: "A Brigada dos Encapotados" mapeado com sucesso para The Trenchcoat Brigade.\n');
      passed++;
    } else {
      console.error('❌ Teste 1 FALHOU: mapeamento incorreto.', resolved);
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 1 ERRO:', err.message);
    failed++;
  }

  // Teste 2: Busca da Capa da Edição 01 de "A Brigada dos Encapotados" na DC Fandom
  console.log('--- Teste 2: Busca de Capa #01 para "A Brigada dos Encapotados" (DC) ---');
  try {
    const result = await searchFandomClient('A Brigada dos Encapotados', 1, 'DC', [], null, false);
    console.log('Resultado Fandom:', result);
    if (result && result.coverUrl && result.coverUrl.includes('Trenchcoat_Brigade_Vol_1_1')) {
      console.log('✅ Teste 2 PASSOU: Capa #01 da DC Fandom localizada com sucesso:', result.coverUrl, '\n');
      passed++;
    } else {
      console.error('❌ Teste 2 FALHOU: Capa não encontrada ou URL divergente.', result);
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 2 ERRO:', err.message);
    failed++;
  }

  // Teste 3: Busca de Todas as Capas (#01 a #04) no Modo returnAll
  console.log('--- Teste 3: Busca de Candidatos Multi-Capas (returnAll=true) ---');
  try {
    const allResults = await searchFandomClient('A Brigada dos Encapotados', 1, 'DC', [], null, true);
    console.log(`Candidatos encontrados: ${allResults?.length || 0}`);
    if (allResults && allResults.length > 0) {
      console.log('Primeiro candidato:', allResults[0].title, allResults[0].coverUrl);
      console.log('✅ Teste 3 PASSOU: Galeria de candidatos populada.\n');
      passed++;
    } else {
      console.error('❌ Teste 3 FALHOU: Nenhum candidato retornado.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 3 ERRO:', err.message);
    failed++;
  }

  console.log(`========================================`);
  console.log(`Resumo dos Testes: ${passed} passaram, ${failed} falharam.`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
