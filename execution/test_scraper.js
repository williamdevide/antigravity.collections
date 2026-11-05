/**
 * Script de Teste Automatizado do Scraper Multi-Wiki e Panini Brasil
 * Camada 3: Execução Determinística (Framework Agente Orquestrador)
 */

import { searchFandomClient, scoreCandidate, matchIssueNumber, resolveEnglishTitle } from '../frontend/src/services/scraper.js';
import { searchPaniniBrasil } from '../api/scrape-cover.js';

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

  // Teste 4: Algoritmo de Pontuação (scoreCandidate) priorizando série exata contra spinoffs
  console.log('--- Teste 4: Validação do Algoritmo de Pontuação para "Wolverine" vs "Novíssima Wolverine" ---');
  try {
    const candidateMain = { title: 'Wolverine (2025) 01', source: 'Panini Brasil', year: 2025 };
    const candidateSpinoff = { title: 'Novíssima Wolverine Vol. 1', source: 'Panini Brasil', year: 2017 };
    const scoreMain = scoreCandidate(candidateMain, 'Wolverine', 1);
    const scoreSpinoff = scoreCandidate(candidateSpinoff, 'Wolverine', 1);

    console.log(`Pontuação Wolverine (2025) 01: ${scoreMain}`);
    console.log(`Pontuação Novíssima Wolverine Vol. 1: ${scoreSpinoff}`);

    if (scoreMain > scoreSpinoff) {
      console.log('✅ Teste 4 PASSOU: Título exato da série pontuou substancialmente mais alto que o spinoff.\n');
      passed++;
    } else {
      console.error('❌ Teste 4 FALHOU: O spinoff pontuou mais ou igual à série exata.');
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 4 ERRO:', err.message);
    failed++;
  }

  // Teste 5: Busca Oficial Panini Brasil para Wolverine Edição 01
  console.log('--- Teste 5: Busca Panini Brasil Oficial para Wolverine #01 ---');
  try {
    const panini01 = await searchPaniniBrasil('Wolverine', 1, [], false);
    console.log('Resultado Panini #01:', panini01?.title, panini01?.coverUrl);
    if (panini01 && panini01.coverUrl && matchIssueNumber(panini01.title, 'Wolverine', 1)) {
      console.log('✅ Teste 5 PASSOU: Capa oficial brasileira encontrada para Wolverine #01.\n');
      passed++;
    } else {
      console.error('❌ Teste 5 FALHOU: Wolverine #01 não retornou edição válida da Panini.', panini01);
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 5 ERRO:', err.message);
    failed++;
  }

  // Teste 6: Busca Oficial Panini Brasil para Wolverine Edição 16
  console.log('--- Teste 6: Busca Panini Brasil Oficial para Wolverine #16 ---');
  try {
    const panini16 = await searchPaniniBrasil('Wolverine', 16, [], false);
    console.log('Resultado Panini #16:', panini16?.title, panini16?.coverUrl);
    if (panini16 && panini16.coverUrl && matchIssueNumber(panini16.title, 'Wolverine', 16)) {
      console.log('✅ Teste 6 PASSOU: Capa oficial brasileira encontrada para Wolverine #16.\n');
      passed++;
    } else {
      console.error('❌ Teste 6 FALHOU: Wolverine #16 não retornou edição válida da Panini.', panini16);
      failed++;
    }
  } catch (err) {
    console.error('❌ Teste 6 ERRO:', err.message);
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
