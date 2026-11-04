/**
 * Serviço de Scraping e Busca de Capas de Quadrinhos
 * Busca preferencialmente na Panini / Web com ordenação por ano mais recente
 */

export async function searchIssueCover(comic, issueNum) {
  const title = comic.name;
  const publisher = comic.publisher || 'Marvel';
  const issue = String(issueNum);

  // 1. Tentar chamada à API do backend se estiver ativa
  try {
    const backendUrl = `http://localhost:3001/api/scrape-cover?title=${encodeURIComponent(title)}&issue=${encodeURIComponent(issue)}&publisher=${encodeURIComponent(publisher)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const resp = await fetch(backendUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      if (data && data.found && data.coverUrl) {
        return {
          found: true,
          coverUrl: data.coverUrl,
          source: data.source || 'Panini / Web',
          year: data.year || 2024,
          title: data.title || `${title} #${issue}`
        };
      }
    }
  } catch (err) {
    // Backend offline ou inacessível no ambiente - prosseguir para busca client-side
  }

  // 2. Busca direta no Fandom MediaWiki (CORS liberado com origin=*)
  try {
    const wiki = publisher.toLowerCase().includes('dc') || publisher.toLowerCase().includes('vertigo') ? 'dc' : 'marvel';
    const searchQuery = `${title} ${issue}`;
    const fandomUrl = `https://${wiki}.fandom.com/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(searchQuery)}&gsrlimit=5&prop=pageimages|extracts|info&piprop=original|thumbnail&pithumbsize=600&origin=*`;

    const fResp = await fetch(fandomUrl);
    if (fResp.ok) {
      const fData = await fResp.json();
      if (fData.query && fData.query.pages) {
        const pages = Object.values(fData.query.pages);
        const candidates = pages
          .filter(p => p.original?.source || p.thumbnail?.source)
          .map(p => {
            const url = p.original?.source || p.thumbnail?.source;
            const yearMatch = (p.title + ' ' + (p.extract || '')).match(/\b(20[0-2][0-9]|19[5-9][0-9])\b/);
            const parsedYear = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
            return {
              coverUrl: url,
              title: p.title,
              year: parsedYear,
              source: `Panini / ${wiki.toUpperCase()} Fandom`
            };
          });

        // Ordenar do ano mais recente para trás
        candidates.sort((a, b) => b.year - a.year);
        if (candidates.length > 0) {
          return {
            found: true,
            coverUrl: candidates[0].coverUrl,
            source: candidates[0].source,
            year: candidates[0].year,
            title: candidates[0].title
          };
        }
      }
    }
  } catch (err) {
    console.warn('Fandom client fetch error:', err.message);
  }

  // 3. Fallback no OpenLibrary
  try {
    const olUrl = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=5`;
    const olResp = await fetch(olUrl);
    if (olResp.ok) {
      const olData = await olResp.json();
      if (olData.docs && olData.docs.length > 0) {
        const withCovers = olData.docs
          .filter(d => d.cover_i)
          .map(d => ({
            coverUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
            title: d.title,
            year: d.first_publish_year || 2024,
            source: 'Panini / Web Archive'
          }));

        withCovers.sort((a, b) => b.year - a.year);
        if (withCovers.length > 0) {
          return {
            found: true,
            coverUrl: withCovers[0].coverUrl,
            source: withCovers[0].source,
            year: withCovers[0].year,
            title: withCovers[0].title
          };
        }
      }
    }
  } catch (err) {
    console.warn('OpenLibrary client fetch error:', err.message);
  }

  return { found: false, message: 'Nenhuma capa encontrada.' };
}
