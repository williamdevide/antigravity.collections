/**
 * Serviço de Reconhecimento e Parser Inteligente de Entrada por Voz (PT-BR)
 * Interpreta comandos em linguagem natural e extrai estruturadamente:
 * - Nome da HQ (ex: "Wolverine")
 * - Editora (ex: "Marvel", "DC", "Panini")
 * - Tipo de Publicação (ex: "Mensal", "Minissérie", "Especial")
 * - Intervalo de Edições (ex: "edições 01 até 09" -> [1, 2, 3, 4, 5, 6, 7, 8, 9])
 */

export const PUBLISHERS_LIST = ['Marvel', 'DC', 'Panini', 'Vertigo', 'Image', 'Disney', 'Mangá'];
export const COMIC_TYPES_LIST = ['Mensal', 'Minissérie', 'Especial', 'Coleção', 'Livro'];

/**
 * Converte palavras numéricas em português para inteiros (ex: "um" -> 1, "dez" -> 10)
 */
const WORD_NUMBERS = {
  'um': 1, 'uma': 1, 'dois': 2, 'duas': 2, 'tres': 3, 'três': 3,
  'quatro': 4, 'cinco': 5, 'seis': 6, 'sete': 7, 'oito': 8, 'nove': 9,
  'dez': 10, 'onze': 11, 'doze': 12, 'treze': 13, 'quatorze': 14,
  'catorze': 14, 'quinze': 15, 'dezesseis': 16, 'dezessete': 17,
  'dezoito': 18, 'dezenove': 19, 'vinte': 20
};

/**
 * Capitaliza cada palavra de um título mantendo conectivos em minúsculas
 */
function formatComicTitle(rawTitle) {
  if (!rawTitle) return '';
  const lowercaseWords = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com']);
  
  // Trata hifens comuns (ex: homem-aranha)
  const normalized = rawTitle.trim().replace(/\s+/g, ' ');
  const parts = normalized.split(/(\s+|-)/);

  return parts.map((part, index) => {
    if (part === ' ' || part === '-') return part;
    const lower = part.toLowerCase();
    if (index > 0 && lowercaseWords.has(lower)) {
      return lower;
    }
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }).join('');
}

/**
 * Analisa o texto transcrito por voz e extrai as propriedades da HQ
 */
export function parseVoiceComicCommand(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return null;
  }

  let text = rawText.trim();
  let workingText = text.toLowerCase();

  // 1. Detectar Editora
  let publisher = 'Marvel';
  if (/\b(?:da\s+|do\s+|de\s+)?dc\b/i.test(workingText)) {
    publisher = 'DC';
  } else if (/\b(?:da\s+|do\s+|de\s+)?panini\b/i.test(workingText)) {
    publisher = 'Panini';
  } else if (/\b(?:da\s+|do\s+|de\s+)?vertigo\b/i.test(workingText)) {
    publisher = 'Vertigo';
  } else if (/\b(?:da\s+|do\s+|de\s+)?image\b/i.test(workingText)) {
    publisher = 'Image';
  } else if (/\b(?:da\s+|do\s+|de\s+)?disney\b/i.test(workingText)) {
    publisher = 'Disney';
  } else if (/\b(?:de\s+)?mang[aá]\b/i.test(workingText)) {
    publisher = 'Mangá';
  } else if (/\b(?:da\s+|do\s+|de\s+)?marvel\b/i.test(workingText)) {
    publisher = 'Marvel';
  }

  // 2. Detectar Tipo
  let type = 'Mensal';
  if (/\bminiss[eé]rie\b/i.test(workingText)) {
    type = 'Minissérie';
  } else if (/\bespecial\b/i.test(workingText)) {
    type = 'Especial';
  } else if (/\bcole[çc][aã]o\b/i.test(workingText)) {
    type = 'Coleção';
  } else if (/\b(?:livro|encadernado)\b/i.test(workingText)) {
    type = 'Livro';
  } else if (/\bmensal\b/i.test(workingText)) {
    type = 'Mensal';
  }

  // 3. Extrair Intervalo ou Lista de Edições
  let ownedNumbers = [];
  let issuePhrase = '';

  // Padrão A: Intervalo "das edições 01 até 09" ou "de 1 a 15" ou "edições 1 a 6"
  const rangeRegex = /(?:das|de|desde|entre)?\s*(?:edi[çc][oõ]es|n[úu]meros|ed\.?|n[ºo]\.?)?\s*(\d+)\s*(?:at[ée]|a|-)\s*(\d+)/i;
  const rangeMatch = workingText.match(rangeRegex);

  if (rangeMatch) {
    const startNum = parseInt(rangeMatch[1], 10);
    const endNum = parseInt(rangeMatch[2], 10);
    if (!isNaN(startNum) && !isNaN(endNum) && startNum <= endNum && endNum - startNum <= 100) {
      issuePhrase = rangeMatch[0];
      for (let i = startNum; i <= endNum; i++) {
        ownedNumbers.push(i);
      }
    }
  }

  // Padrão B: Lista avulsa de edições (ex: "edições 1, 2, 5 e 8")
  if (ownedNumbers.length === 0) {
    const listRegex = /(?:edi[çc][oõ]es|n[úu]meros)\s*([\d\s,eE\-]+)/i;
    const listMatch = workingText.match(listRegex);
    if (listMatch) {
      issuePhrase = listMatch[0];
      const numbers = listMatch[1].match(/\b\d+\b/g);
      if (numbers && numbers.length > 0) {
        ownedNumbers = numbers.map(n => parseInt(n, 10)).filter(n => !isNaN(n));
      }
    }
  }

  // Padrão C: Edição única (ex: "edição 16", "número 4")
  if (ownedNumbers.length === 0) {
    const singleRegex = /(?:edi[çc][aã]o|n[úu]mero|ed\.?|n[ºo]\.?)\s*(\d+)/i;
    const singleMatch = workingText.match(singleRegex);
    if (singleMatch) {
      issuePhrase = singleMatch[0];
      const num = parseInt(singleMatch[1], 10);
      if (!isNaN(num)) {
        ownedNumbers.push(num);
      }
    }
  }

  // Se não foi identificada nenhuma edição, sugere a edição 1 por padrão
  if (ownedNumbers.length === 0) {
    ownedNumbers = [1];
  } else {
    // Garante números únicos ordenados
    ownedNumbers = Array.from(new Set(ownedNumbers)).sort((a, b) => a - b);
  }

  // 4. Extrair Nome da HQ (limpando conectivos, editora, tipo e frase de edições)
  let cleaned = workingText;

  // Remove a frase de edições
  if (issuePhrase) {
    cleaned = cleaned.replace(issuePhrase, ' ');
  } else {
    cleaned = cleaned.replace(/(?:das|de|desde)?\s*(?:edi[çc][oõ]es|n[úu]meros|edi[çc][aã]o|n[úu]mero).*/i, ' ');
  }

  // Remove prefixos verbais comuns
  cleaned = cleaned.replace(/^(?:eu\s+)?(?:tenho|gostaria de|quero|cadastrar|adicionar|incluir|novo|nova)\s*(?:a|o|um|uma)?\s*(?:hq|gibi|revista|quadrinho|cole[çc][aã]o)?\s*(?:do|da|de)?\s*/i, ' ');

  // Remove palavras de editora
  cleaned = cleaned.replace(/\b(?:da|do|de)?\s*(?:marvel|dc|panini|vertigo|image|disney|mang[aá])\b/gi, ' ');

  // Remove palavras de tipo
  cleaned = cleaned.replace(/\b(?:mensal|miniss[eé]rie|especial|cole[çc][aã]o|livro|encadernado)\b/gi, ' ');

  // Remove pontuações e sobras
  cleaned = cleaned.replace(/[.,;:!?]/g, ' ').replace(/\s+/g, ' ').trim();

  let finalTitle = formatComicTitle(cleaned);
  if (!finalTitle || finalTitle.length < 2) {
    finalTitle = 'HQ Sem Título';
  }

  const startFrom = ownedNumbers.length > 0 ? Math.min(...ownedNumbers) : 1;

  return {
    rawText: text,
    name: finalTitle,
    publisher,
    type,
    startFrom: startFrom > 1 ? startFrom : 1,
    ownedNumbers
  };
}
