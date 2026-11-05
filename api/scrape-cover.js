/**
 * Vercel Serverless Function: /api/scrape-cover
 * Robô híbrido de alta performance para busca e curadoria de capas de HQs:
 * 1. Panini Brasil oficial (panini.com.br) com priorização estrita de título exato
 * 2. Multi-Wiki Fandom internacional com tradução dinâmica via Wikipédia/Wikidata
 * 3. OpenLibrary fallback global
 */

const TITLE_MAP = {
  // DC Comics & Vertigo
  'a brigada dos encapotados': 'The Trenchcoat Brigade',
  'brigada dos encapotados': 'The Trenchcoat Brigade',
  'trenchcoat brigade': 'The Trenchcoat Brigade',
  'os livros da magia': 'The Books of Magic',
  'livros da magia': 'The Books of Magic',
  'patrulha do destino': 'Doom Patrol',
  'monstro do pantano': 'Swamp Thing',
  'monstro do pântano': 'Swamp Thing',
  'homem animal': 'Animal Man',
  'homem-animal': 'Animal Man',
  'esquadrao suicida': 'Suicide Squad',
  'esquadrão suicida': 'Suicide Squad',
  'novos titas': 'Teen Titans',
  'novos titãs': 'Teen Titans',
  'titas': 'Titans',
  'titãs': 'Titans',
  'asa noturna': 'Nightwing',
  'capuz vermelho': 'Red Hood',
  'mulher gato': 'Catwoman',
  'mulher-gato': 'Catwoman',
  'gaviao negro': 'Hawkman',
  'gavião negro': 'Hawkman',
  'mulher gaviao': 'Hawkgirl',
  'mulher gavião': 'Hawkgirl',
  'sociedade da justica': 'Justice Society of America',
  'sociedade da justiça': 'Justice Society of America',
  'legiao dos super-herois': 'Legion of Super-Heroes',
  'legião dos super-heróis': 'Legion of Super-Heroes',
  'aves de rapina': 'Birds of Prey',
  'fabulas': 'Fables',
  'fábulas': 'Fables',
  'hellblazer': 'John Constantine, Hellblazer',
  'sandman': 'The Sandman',
  'lucifer': 'Lucifer',
  'lúcifer': 'Lucifer',
  'preacher': 'Preacher',
  'transmetropolitan': 'Transmetropolitan',
  'y o ultimo homem': 'Y: The Last Man',
  'y o último homem': 'Y: The Last Man',
  'liga da justica': 'Justice League',
  'liga da justiça': 'Justice League',
  'mulher-maravilha': 'Wonder Woman',
  'mulher maravilha': 'Wonder Woman',
  'arqueiro verde': 'Green Arrow',
  'lanterna verde': 'Green Lantern',
  'a piada mortal': 'Batman: The Killing Joke',
  'o cavaleiro das trevas': 'Batman: The Dark Knight Returns',
  'cavaleiro das trevas': 'Batman: The Dark Knight Returns',
  'ano um': 'Batman: Year One',
  'o longo dia das bruxas': 'Batman: The Long Halloween',
  'a morte do superman': 'The Death of Superman',
  'o retorno do superman': 'The Return of Superman',
  'reino do amanha': 'Kingdom Come',
  'reino do amanhã': 'Kingdom Come',
  'ponto de ignicao': 'Flashpoint',
  'ponto de ignição': 'Flashpoint',
  'crise nas infinitas terras': 'Crisis on Infinite Earths',
  'crise infinita': 'Infinite Crisis',
  'crise final': 'Final Crisis',
  'asilo arkham': 'Arkham Asylum',

  // Star Wars & Jeffrey Brown
  'star wars a princesinha de vader': "Vader's Little Princess",
  'starwars a princesinha de vader': "Vader's Little Princess",
  'a princesinha de vader': "Vader's Little Princess",
  'princesinha de vader': "Vader's Little Princess",
  'star wars darth vader e filho': 'Darth Vader and Son',
  'starwars darth vader e filho': 'Darth Vader and Son',
  'darth vader e filho': 'Darth Vader and Son',
  'boa noite darth vader': 'Goodnight Darth Vader',
  'doutora aphra': 'Doctor Aphra',
  'star wars doutora aphra': 'Star Wars: Doctor Aphra',
  'imperio despedacado': 'Shattered Empire',
  'star wars imperio despedacado': 'Star Wars: Shattered Empire',

  // Marvel
  'homem-aranha': 'Spider-Man',
  'homem aranha': 'Spider-Man',
  'o espetacular homem-aranha': 'The Amazing Spider-Man',
  'o espetacular homem aranha': 'The Amazing Spider-Man',
  'vingadores': 'Avengers',
  'os vingadores': 'Avengers',
  'homem de ferro': 'Iron Man',
  'capitao america': 'Captain America',
  'capitão américa': 'Captain America',
  'quarteto fantastico': 'Fantastic Four',
  'quarteto fantástico': 'Fantastic Four',
  'demolidor': 'Daredevil',
  'novissima wolverine': 'All-New Wolverine',
  'novíssima wolverine': 'All-New Wolverine',
  'justiceiro': 'The Punisher',
  'o justiceiro': 'The Punisher',
  'gaviao arqueiro': 'Hawkeye',
  'gavião arqueiro': 'Hawkeye',
  'viuva negra': 'Black Widow',
  'viúva negra': 'Black Widow',
  'feiticeira escarlate': 'Scarlet Witch',
  'pantera negra': 'Black Panther',
  'cavaleiro da lua': 'Moon Knight',
  'motoqueiro fantasma': 'Ghost Rider',
  'guerra civil': 'Civil War',
  'guerras secretas': 'Secret Wars',
  'guerra secreta': 'Secret War',
  'desafio infinito': 'Infinity Gauntlet',
  'guerra infinita': 'Infinity War',
  'cruzada infinita': 'Infinity Crusade',
  'dinastia m': 'House of M',
  'velho logan': 'Old Man Logan',

  // Image & Outros
  'mortos-vivos': 'The Walking Dead',
  'os mortos vivos': 'The Walking Dead',
  'invencivel': 'Invincible',
  'invencível': 'Invincible',
  'tartarugas ninja': 'Teenage Mutant Ninja Turtles',
  'as tartarugas ninja': 'Teenage Mutant Ninja Turtles',
  'tio patinhas': 'Uncle Scrooge',
  'pato donald': 'Donald Duck'
};

const DYNAMIC_TITLE_CACHE = new Map();

function getEnglishTitle(title) {
  if (!title) return '';
  const norm = title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[:\-]/g, ' ').replace(/\s+/g, ' ');
  if (TITLE_MAP[norm]) return TITLE_MAP[norm];
  if (DYNAMIC_TITLE_CACHE.has(norm)) return DYNAMIC_TITLE_CACHE.get(norm);
  for (const [k, v] of Object.entries(TITLE_MAP)) {
    if (norm.includes(k)) return v;
  }
  return title;
}

async function resolveEnglishTitle(title) {
  if (!title) return '';
  const syncMatch = getEnglishTitle(title);
  if (syncMatch && syncMatch !== title) {
    return syncMatch;
  }

  const norm = title.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[:\-]/g, ' ').replace(/\s+/g, ' ');
  if (DYNAMIC_TITLE_CACHE.has(norm)) {
    return DYNAMIC_TITLE_CACHE.get(norm);
  }

  try {
    const cleanSearch = title.replace(/\b(especial|minisserie|minissérie|colecao|coleção|mensal|hq|livro|edicao|edição|vol(?:ume|\.)?\s*\d+)\b/gi, '').trim();
    const searchUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanSearch || title)}&format=json`;
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 2500);
    const searchResp = await fetch(searchUrl, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
    clearTimeout(tid);

    if (searchResp.ok) {
      const searchData = await searchResp.json();
      const topPage = searchData?.query?.search?.[0]?.title;
      if (topPage) {
        const langUrl = `https://pt.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=en&titles=${encodeURIComponent(topPage)}&format=json`;
        const lController = new AbortController();
        const lTid = setTimeout(() => lController.abort(), 2500);
        const langResp = await fetch(langUrl, { signal: lController.signal, headers: { 'User-Agent': 'Mozilla/5.0' } });
        clearTimeout(lTid);

        if (langResp.ok) {
          const langData = await langResp.json();
          const pages = langData?.query?.pages || {};
          const pageObj = Object.values(pages)[0];
          const engLink = pageObj?.langlinks?.[0]?.['*'];
          if (engLink) {
            const cleanedEng = engLink.replace(/\s*\((?:comics|comic\s+book|limited\s+series|character|graphic\s+novel)\)$/i, '').trim();
            DYNAMIC_TITLE_CACHE.set(norm, cleanedEng);
            return cleanedEng;
          }
        }
      }
    }
  } catch {}

  DYNAMIC_TITLE_CACHE.set(norm, title);
  return title;
}

function matchIssueNumber(title, comicOrIssue, maybeIssue) {
  const comicName = maybeIssue !== undefined ? comicOrIssue : '';
  const issueNum = maybeIssue !== undefined ? maybeIssue : comicOrIssue;

  if (!title) return false;
  const num = parseInt(issueNum, 10);
  if (isNaN(num)) return false;

  const normTitle = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normComic = comicName ? comicName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

  if (normComic) {
    const stopWords = new Set(['star', 'wars', 'starwars', 'the', 'hq', 'revista', 'livro', 'edicao', 'especial', 'volume', 'comic', 'comics', 'marvel', 'dc', 'de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em', 'para', 'com']);
    const comicWords = normComic.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
    if (comicWords.length > 0) {
      const engMapped = getEnglishTitle(normComic).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const engWords = engMapped.split(/[^a-z0-9]+/).filter(w => w.length > 2 && !stopWords.has(w));
      const hasMatch = comicWords.some(w => normTitle.includes(w)) || engWords.some(w => normTitle.includes(w));
      if (!hasMatch) {
        return false;
      }
    }
  }

  const withoutYears = normTitle.replace(/\b(19\d{2}|20[0-3]\d)\b/g, ' ');

  const fandomVolMatch = withoutYears.match(/\bvol(?:ume|\.)?\s+(\d+)\s+(\d+)\b/i);
  if (fandomVolMatch) {
    const pageIssue = parseInt(fandomVolMatch[2], 10);
    return pageIssue === num;
  }

  const volMatch = withoutYears.match(/\bvol(?:ume|\.)?\s*(\d+)\b/i);
  if (volMatch && parseInt(volMatch[1], 10) === num) {
    return true;
  }

  const withoutVol = withoutYears.replace(/\bvol(?:ume|\.)?\s*\d+\b/gi, ' ');
  const standaloneNumbers = [...withoutVol.matchAll(/\b0*(\d+)\b/g)].map(m => parseInt(m[1], 10));

  if (standaloneNumbers.length > 0) {
    return standaloneNumbers.includes(num);
  }

  if (num === 1 && standaloneNumbers.length === 0 && !volMatch) {
    return true;
  }

  return false;
}

function scoreCandidate(candidate, cleanTitle, issueNum, prefSeries) {
  const normCandidate = (candidate.title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normComic = (cleanTitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const engMapped = getEnglishTitle(cleanTitle).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let score = (candidate.volume ? candidate.volume * 10000 : (candidate.source?.includes('Panini') ? 120000 : 0)) + (candidate.year || 1990);

  const cleanEng = engMapped.replace(/^(the|a|an|o|a|os|as)\s+/i, '');
  const cleanCand = normCandidate.replace(/^(the|a|an|o|a|os|as)\s+/i, '');

  if (normCandidate === engMapped || normCandidate === normComic) {
    score += 500000;
  } else if (cleanCand.includes(cleanEng) || cleanEng.includes(cleanCand) || normCandidate.includes(engMapped) || engMapped.includes(normCandidate)) {
    score += 450000;
  }

  // Bônus massivo para correspondência exata do título base (evita spinoffs como Novíssima Wolverine para Wolverine)
  const normS = cleanTitle.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const baseTitle = normCandidate.replace(/\s*\(\d{4}\).*$/, '').replace(/\s+vol(?:ume|\.)?\s*\d+.*$/i, '').trim();
  if (baseTitle === normS || normCandidate.startsWith(normS + ' ') || normCandidate.startsWith(normS + '(')) {
    score += 600000;
  }

  // Bônus prioritário para candidato com número de edição explícito correspondente à edição pesquisada
  const num = parseInt(issueNum, 10);
  const withoutYears = normCandidate.replace(/\b(19\d{2}|20[0-3]\d)\b/g, ' ');
  const hasExplicitVolIssue = withoutYears.match(new RegExp(`\\bvol(?:ume|\\.)?\\s*\\d+\\s+0*${num}\\b`, 'i'));
  const hasExplicitNumber = withoutYears.match(new RegExp(`\\b0*${num}\\b`));
  if (hasExplicitVolIssue || hasExplicitNumber) {
    score += 500000;
  }

  // Penalização para capas variantes de revendedores ou páginas de equipes/universos
  if (normCandidate.includes('variant') || normCandidate.includes('exclusive') || normCandidate.includes('homage')) {
    score -= 200000;
  }
  if (normCandidate.includes('universe') || normCandidate.includes('earth') || normCandidate.includes('character')) {
    score -= 300000;
  }

  if ((normComic.includes('princesinha') || engMapped.includes('princess')) && normCandidate.includes('princess')) {
    score += 200000;
  }
  if ((normComic.includes('filho') || engMapped.includes('son')) && normCandidate.includes('son')) {
    score += 200000;
  }

  const itemSrc = (candidate.source || '').toLowerCase();
  if (prefSeries?.source && itemSrc.includes(prefSeries.source.toLowerCase())) score += 350000;
  if (prefSeries?.year && candidate.year === prefSeries.year) score += 450000;
  if (prefSeries?.volume && candidate.volume === prefSeries.volume) score += 350000;

  return score;
}

function getRelevantWikis(title, publisher) {
  const normTitle = (title || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const normPub = (publisher || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const wikis = [];

  if (normTitle.includes('star') || normTitle.includes('wars') || normTitle.includes('vader') || 
      normTitle.includes('jedi') || normTitle.includes('sith') || normTitle.includes('yoda') || 
      normTitle.includes('mandalorian') || normTitle.includes('aphra') || normPub.includes('star')) {
    wikis.push('starwars');
  }

  if (normPub.includes('dc') || normPub.includes('vertigo') || normTitle.includes('batman') || 
      normTitle.includes('superman') || normTitle.includes('coringa') || normTitle.includes('joker') || 
      normTitle.includes('flash') || normTitle.includes('lantern') || normTitle.includes('mulher-maravilha') || 
      normTitle.includes('wonder woman') || normTitle.includes('justica') || normTitle.includes('justice') ||
      normTitle.includes('encapotados') || normTitle.includes('trenchcoat') || normTitle.includes('constantine') ||
      normTitle.includes('hellblazer') || normTitle.includes('sandman') || normTitle.includes('magia')) {
    wikis.push('dc');
  }

  if (normPub.includes('image') || normTitle.includes('spawn') || normTitle.includes('invincible') || 
      normTitle.includes('invencivel') || normTitle.includes('walking dead') || normTitle.includes('saga')) {
    wikis.push('imagecomics');
  }

  if (normPub.includes('dark horse') || normTitle.includes('hellboy') || normTitle.includes('sin city') || 
      normTitle.includes('conan') || normTitle.includes('umbrella')) {
    wikis.push('darkhorse');
  }

  if (normPub.includes('disney') || normPub.includes('abril') || normTitle.includes('patinhas') || 
      normTitle.includes('donald') || normTitle.includes('mickey') || normTitle.includes('ducktales')) {
    wikis.push('disney');
  }

  if (normPub.includes('marvel') || normTitle.includes('aranha') || normTitle.includes('spider') || 
      normTitle.includes('wolverine') || normTitle.includes('x-men') || normTitle.includes('vingadores') || 
      normTitle.includes('avengers') || normTitle.includes('hulk') || normTitle.includes('thor') || 
      normTitle.includes('ferro') || normTitle.includes('capitao')) {
    wikis.push('marvel');
  }

  if (normPub.includes('dc') || normPub.includes('vertigo')) {
    if (!wikis.includes('dc')) wikis.unshift('dc');
    else {
      const idx = wikis.indexOf('dc');
      if (idx > 0) {
        wikis.splice(idx, 1);
        wikis.unshift('dc');
      }
    }
  }

  if (!wikis.includes('starwars')) wikis.push('starwars');
  if (!wikis.includes('marvel')) wikis.push('marvel');
  if (!wikis.includes('dc')) wikis.push('dc');
  if (!wikis.includes('imagecomics')) wikis.push('imagecomics');
  if (!wikis.includes('darkhorse')) wikis.push('darkhorse');

  return wikis;
}

function getWikiLabel(wiki) {
  switch (wiki) {
    case 'starwars': return 'Star Wars Fandom (Wookieepedia)';
    case 'marvel': return 'Marvel Fandom';
    case 'dc': return 'DC Fandom';
    case 'imagecomics': return 'Image Comics Fandom';
    case 'darkhorse': return 'Dark Horse Fandom';
    case 'disney': return 'Disney Fandom';
    default: return `${wiki.toUpperCase()} Fandom`;
  }
}

/**
 * Busca Direta e Otimizada no site da Panini Brasil (panini.com.br)
 */
export async function searchPaniniBrasil(title, issueNum, rejectedUrls = [], returnAll = false, prefSeries = null) {
  const issueStr = String(issueNum || '1').trim();
  const issuePad = issueStr.padStart(2, '0');

  // Consulta prioritária por edição formatada em 2 dígitos (padrão Panini Brasil: "Wolverine 01", "Wolverine 16")
  const queries = [
    `${title} ${issuePad}`,
    `${title} ${issueStr}`,
    `${title}`
  ];

  const allFound = [];
  const seenUrls = new Set();

  for (const q of queries) {
    try {
      const url = `https://panini.com.br/catalogsearch/result/?q=${encodeURIComponent(q)}`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
        }
      });
      clearTimeout(tid);

      if (!res.ok) continue;
      const html = await res.text();
      if (!html) continue;

      const itemRegex = /<li[^>]*class=["'][^"']*product-item[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
      const items = [...html.matchAll(itemRegex)];

      for (const item of items) {
        const content = item[1];
        const titleMatch = content.match(/class=["'][^"']*product-item-link[^"']*["'][^>]*>\s*([\s\S]*?)\s*<\/a>/i);
        const prodTitle = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
        const imgMatch = content.match(/<img[^>]*class=["'][^"']*product-image-photo[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
                         content.match(/<img[^>]*src=["']([^"']+)["']/i);
        let imgUrl = imgMatch ? imgMatch[1] : '';

        if (imgUrl && prodTitle) {
          if (!matchIssueNumber(prodTitle, title, issueNum)) continue;

          imgUrl = imgUrl.replace(/&amp;/g, '&');
          if (imgUrl.includes('-S170-')) imgUrl = imgUrl.replace('-S170-', '-S300-');
          if (imgUrl.includes('/media/catalog/product/')) imgUrl = imgUrl.split('?')[0];

          if (rejectedUrls.includes(imgUrl) || seenUrls.has(imgUrl)) continue;
          seenUrls.add(imgUrl);

          const yearMatch = prodTitle.match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
          const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2020;

          allFound.push({
            title: prodTitle,
            coverUrl: imgUrl,
            source: 'Panini Brasil (panini.com.br)',
            year: parsedYear
          });
        }
      }

      if (allFound.length > 0 && !returnAll) {
        allFound.sort((a, b) => scoreCandidate(b, title, issueNum, prefSeries) - scoreCandidate(a, title, issueNum, prefSeries));
        return allFound[0];
      }
    } catch {}
  }

  if (allFound.length > 0) {
    allFound.sort((a, b) => scoreCandidate(b, title, issueNum, prefSeries) - scoreCandidate(a, title, issueNum, prefSeries));
    return returnAll ? allFound : allFound[0];
  }

  return returnAll ? [] : null;
}

/**
 * Busca no Fandom MediaWiki
 */
async function searchFandom(title, issueNum, publisher, rejectedUrls = [], returnAll = false, prefSeries = null) {
  const cleanTitle = String(title).trim();
  const engTitle = await resolveEnglishTitle(cleanTitle);
  const issueStr = String(issueNum);
  const wikis = getRelevantWikis(cleanTitle, publisher);

  const titleVariants = new Set();
  [engTitle, cleanTitle].forEach(t => {
    if (!t) return;
    titleVariants.add(t);
    const withoutArticle = t.replace(/^(the|a|an|o|a|os|as)\s+/i, '').trim();
    if (withoutArticle) titleVariants.add(withoutArticle);
  });

  const allCandidates = [];
  const seenUrls = new Set();

  for (const wiki of wikis) {
    const wikiLabel = getWikiLabel(wiki);

    const directTitles = [];
    for (const tv of titleVariants) {
      for (let v = 10; v >= 1; v--) {
        directTitles.push(`${tv.replace(/\s+/g, '_')}_Vol_${v}_${issueStr}`);
      }
      if (issueStr === '1') {
        directTitles.push(tv.replace(/\s+/g, '_'));
      }
    }

    try {
      const titlesUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&titles=${encodeURIComponent(directTitles.slice(0, 50).join('|'))}&prop=pageimages|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 3500);
      const titlesResp = await fetch(titlesUrl, { signal: controller.signal });
      clearTimeout(tid);

      if (titlesResp.ok) {
        const titlesData = await titlesResp.json();
        if (titlesData.query?.pages) {
          const pages = Object.values(titlesData.query.pages).filter(p => !p.missing);
          for (const p of pages) {
            const url = p.original?.source || p.thumbnail?.source;
            if (!url || rejectedUrls.includes(url) || seenUrls.has(url)) continue;
            if (!matchIssueNumber(p.title, cleanTitle, issueNum)) continue;

            const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
            const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
            const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
            const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : 2020;

            seenUrls.add(url);
            allCandidates.push({
              title: p.title,
              coverUrl: url,
              year: yr,
              volume: vol,
              source: wikiLabel
            });
          }
        }
      }
    } catch {}

    const queries = [];
    for (const tv of titleVariants) {
      queries.push(`${tv} ${issueStr}`);
      if (issueStr === '1') queries.push(tv);
    }

    for (const q of queries) {
      try {
        const fandomUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(q)}&gsrlimit=12&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 3500);
        const fResp = await fetch(fandomUrl, { signal: controller.signal });
        clearTimeout(tid);

        if (fResp.ok) {
          const fData = await fResp.json();
          if (fData.query?.pages) {
            const pages = Object.values(fData.query.pages);
            for (const p of pages) {
              const url = p.original?.source || p.thumbnail?.source;
              if (!url || rejectedUrls.includes(url) || seenUrls.has(url)) continue;
              if (!matchIssueNumber(p.title, cleanTitle, issueNum)) continue;

              const volMatch = p.title.match(/\bVol(?:ume|\.)?\s*(\d+)\b/i);
              const vol = volMatch ? parseInt(volMatch[1], 10) : 1;
              const cbYearMatch = url.match(/[?&]cb=(20[0-2][0-9]|19[5-9][0-9])/);
              const textYearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
              const yr = cbYearMatch ? parseInt(cbYearMatch[1], 10) : (textYearMatch ? parseInt(textYearMatch[1], 10) : 2015);

              seenUrls.add(url);
              allCandidates.push({
                title: p.title,
                coverUrl: url,
                year: yr,
                volume: vol,
                source: wikiLabel
              });
            }
          }
        }
      } catch {}
    }
  }

  if (allCandidates.length > 0) {
    allCandidates.sort((a, b) => scoreCandidate(b, cleanTitle, issueNum, prefSeries) - scoreCandidate(a, cleanTitle, issueNum, prefSeries));
    return returnAll ? allCandidates : allCandidates[0];
  }

  return returnAll ? [] : null;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, issue, publisher, rejected, prefYear, prefVol, prefSource, all } = req.query;

  if (!title || !issue) {
    return res.status(400).json({ error: 'Parâmetros "title" e "issue" são obrigatórios.' });
  }

  const returnAll = all === 'true' || all === '1';
  const rejectedUrls = rejected ? rejected.split(',').filter(Boolean) : [];
  const prefSeries = (prefYear || prefVol || prefSource) ? {
    year: prefYear ? parseInt(prefYear, 10) : null,
    volume: prefVol ? parseInt(prefVol, 10) : null,
    source: prefSource || null
  } : null;

  try {
    // 1. Tentar Panini Brasil Oficial primeiro
    const paniniResult = await searchPaniniBrasil(title, issue, rejectedUrls, returnAll, prefSeries);

    if (returnAll) {
      const fandomResult = await searchFandom(title, issue, publisher, rejectedUrls, true, prefSeries).catch(() => []);
      const combined = [...(paniniResult || []), ...(fandomResult || [])];
      combined.sort((a, b) => scoreCandidate(b, title, issue, prefSeries) - scoreCandidate(a, title, issue, prefSeries));

      if (combined.length > 0) {
        return res.json({
          found: true,
          coverUrl: combined[0].coverUrl,
          source: combined[0].source,
          year: combined[0].year,
          title: combined[0].title,
          candidates: combined
        });
      }
    } else {
      if (paniniResult && paniniResult.coverUrl) {
        return res.json({
          found: true,
          coverUrl: paniniResult.coverUrl,
          source: paniniResult.source,
          year: paniniResult.year,
          title: paniniResult.title,
          candidates: [paniniResult]
        });
      }

      // 2. Fallback no Fandom Multi-Wiki se a Panini não publicou ou não tem a capa
      const fandomResult = await searchFandom(title, issue, publisher, rejectedUrls, false, prefSeries);
      if (fandomResult && fandomResult.coverUrl) {
        return res.json({
          found: true,
          coverUrl: fandomResult.coverUrl,
          source: fandomResult.source,
          year: fandomResult.year,
          title: fandomResult.title,
          candidates: [fandomResult]
        });
      }
    }

    return res.json({ found: false, message: 'Nenhuma capa encontrada.' });
  } catch (err) {
    console.error('Erro no handler /api/scrape-cover:', err);
    return res.status(500).json({ error: 'Erro interno ao buscar capa.' });
  }
}
