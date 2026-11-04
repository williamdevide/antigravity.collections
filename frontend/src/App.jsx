import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  CheckCircle2, 
  Check, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronDown, 
  Flag, 
  Cloud, 
  HardDrive, 
  AlertTriangle, 
  X, 
  Layers, 
  Building2, 
  ListFilter, 
  Eye, 
  EyeOff, 
  SlidersHorizontal, 
  GripVertical, 
  ArrowDownAZ, 
  ArrowDownZA, 
  Tag, 
  ArrowUp, 
  ArrowDown, 
  Pencil, 
  Calendar, 
  Shield, 
  Sparkles, 
  Image as ImageIcon,
  RotateCw,
  Bookmark,
  CheckCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { 
  subscribeComics, 
  saveComic, 
  deleteComic, 
  saveAllComicsOrder 
} from './firebase';
import { APP_NAME, APP_VERSION } from './version';
import { searchIssueCover } from './services/scraper';

const COMIC_TYPES = ['Mensal', 'Especial', 'Minissérie', 'Coleção'];
const PUBLISHERS = ['Marvel', 'DC', 'Vertigo', 'Outras'];

export default function App() {
  const [comics, setComics] = useState([]);
  
  // Modo de Operação: 'consulta' (padrão) | 'edicao'
  const [appMode, setAppMode] = useState('consulta');

  // Cadastro Rápido
  const [newComicName, setNewComicName] = useState('');
  const [newComicType, setNewComicType] = useState('Mensal');
  const [newComicPublisher, setNewComicPublisher] = useState('Marvel');
  const [newComicStartFrom, setNewComicStartFrom] = useState('');
  
  // Modal de Inclusão Detalhada
  const [showDetailedAddModal, setShowDetailedAddModal] = useState(false);
  const [detailedName, setDetailedName] = useState('');
  const [detailedType, setDetailedType] = useState('Mensal');
  const [detailedPublisher, setDetailedPublisher] = useState('Marvel');
  const [detailedStartFrom, setDetailedStartFrom] = useState('1');
  const [detailedStartYear, setDetailedStartYear] = useState('');
  const [detailedBrazilPublisher, setDetailedBrazilPublisher] = useState('');
  const [detailedMainHero, setDetailedMainHero] = useState('');

  // Ordenação
  const [sortOrder, setSortOrder] = useState('A-Z'); // 'A-Z' | 'Z-A' | 'personal'

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos'); // 'Todos' | 'Mensal' | 'Especial' | 'Minissérie' | 'Coleção'
  const [filterPublisher, setFilterPublisher] = useState('Todas'); // 'Todas' | 'Marvel' | 'DC' | 'Vertigo' | 'Outras'
  const [filterStatus, setFilterStatus] = useState('Todos'); // 'Todos' | 'Em Andamento' | 'Encerrados'
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'owned' | 'read' | 'wishlist' | 'none'
  const [showFilters, setShowFilters] = useState(false);

  // Status de Conexão
  const [connectionStatus, setConnectionStatus] = useState({ status: 'connecting', message: 'Conectando...' });
  
  // Estado de Scraping em Segundo Plano
  const [isScrapingActive, setIsScrapingActive] = useState(false);
  const scrapingQueueRef = useRef(new Set());

  // Modal de Edição Completa da HQ
  const [editingComic, setEditingComic] = useState(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [editTypeInput, setEditTypeInput] = useState('Mensal');
  const [editPublisherInput, setEditPublisherInput] = useState('Marvel');
  const [editStartFromInput, setEditStartFromInput] = useState('1');
  const [editStartYearInput, setEditStartYearInput] = useState('');
  const [editBrazilPublisherInput, setEditBrazilPublisherInput] = useState('');
  const [editMainHeroInput, setEditMainHeroInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Modal de Consulta de Detalhes da Edição (Modo Consulta com Visual Ampliado)
  const [viewingIssueDetail, setViewingIssueDetail] = useState(null); // { comic, issueNum }
  const [isSearchingSingleCover, setIsSearchingSingleCover] = useState(false);

  // Modal Detalhado de Status da Busca de Capas
  const [showCoverSearchModal, setShowCoverSearchModal] = useState(false);
  const [coverModalTab, setCoverModalTab] = useState('all'); // 'all' | 'searching' | 'found' | 'missing'
  const [coverModalSearchText, setCoverModalSearchText] = useState('');

  // Modal de Título de Edição Específica (Minissérie e Coleção no Modo Edição)
  const [issueTitleModal, setIssueTitleModal] = useState(null); // { comic, issueNum, currentTitle }
  const [issueTitleInput, setIssueTitleInput] = useState('');

  // Drag and Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const inputRef = useRef(null);

  // Sincronização em tempo real (Firestore com fallback para LocalStorage)
  useEffect(() => {
    const unsubscribe = subscribeComics(
      (updatedComics) => {
        setComics(updatedComics);
      },
      (status) => {
        setConnectionStatus(status);
      }
    );
    return () => unsubscribe();
  }, []);

  // Cálculo da Porcentagem de Buscas de Capas Concluídas em relação às edições
  const coverStats = useMemo(() => {
    let totalIssues = 0;
    let searchedCount = 0;
    let fixedCount = 0;
    let pendingCount = 0;

    comics.forEach((comic) => {
      const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
      const initialChunkStart = Math.floor((startFrom - 1) / 10) * 10 + 1;
      const ownedNumbers = comic.ownedNumbers || [];
      
      let currentLimit = initialChunkStart + 9;
      if (ownedNumbers.length > 0) {
        const highestOwned = Math.max(...ownedNumbers);
        if (highestOwned % 10 === 0) {
          currentLimit = Math.max(currentLimit, highestOwned + 10);
        } else {
          currentLimit = Math.max(currentLimit, Math.ceil(highestOwned / 10) * 10);
        }
      }

      const covers = comic.issueCovers || {};
      const pending = comic.pendingCovers || {};
      const searched = comic.searchedIssues || {};
      const rejected = comic.rejectedCovers || {};

      for (let n = initialChunkStart; n <= currentLimit; n++) {
        totalIssues++;
        if (covers[n]) {
          fixedCount++;
          searchedCount++;
        } else if (pending[n]) {
          pendingCount++;
          searchedCount++;
        } else if (rejected[n] && rejected[n].length > 0) {
          searchedCount++;
        } else if (searched[n]) {
          searchedCount++;
        }
      }
    });

    const percentage = totalIssues > 0 ? Math.round((searchedCount / totalIssues) * 100) : 100;
    return { totalIssues, searchedCount, fixedCount, pendingCount, percentage };
  }, [comics]);

  // Lista unificada de todas as edições monitoradas para o modal de status de capas
  const allTrackedIssues = useMemo(() => {
    const list = [];
    comics.forEach((comic) => {
      const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
      const initialChunkStart = Math.floor((startFrom - 1) / 10) * 10 + 1;
      const ownedNumbers = comic.ownedNumbers || [];
      
      let currentLimit = initialChunkStart + 9;
      if (ownedNumbers.length > 0) {
        const highestOwned = Math.max(...ownedNumbers);
        if (highestOwned % 10 === 0) {
          currentLimit = Math.max(currentLimit, highestOwned + 10);
        } else {
          currentLimit = Math.max(currentLimit, Math.ceil(highestOwned / 10) * 10);
        }
      }

      const covers = comic.issueCovers || {};
      const pending = comic.pendingCovers || {};
      const searched = comic.searchedIssues || {};
      const rejected = comic.rejectedCovers || {};

      for (let n = initialChunkStart; n <= currentLimit; n++) {
        let status = 'searching';
        let coverUrl = null;
        let source = null;

        if (covers[n]) {
          status = 'fixed';
          coverUrl = covers[n];
        } else if (pending[n]) {
          status = 'pending';
          coverUrl = pending[n].coverUrl;
          source = pending[n].source;
        } else if (rejected[n] && rejected[n].length > 0) {
          status = 'rejected';
        } else if (searched[n]) {
          status = 'missing';
        }

        list.push({
          comicId: comic.id,
          comicName: comic.name,
          comicType: comic.type || 'Mensal',
          comicPublisher: comic.publisher || 'Marvel',
          issueNum: n,
          status,
          coverUrl,
          source,
          comic
        });
      }
    });
    return list;
  }, [comics]);

  // Efeito do Scraper em Segundo Plano (Background Worker)
  useEffect(() => {
    if (comics.length === 0) return;

    let isMounted = true;
    const runBackgroundScraper = async () => {
      for (const comic of comics) {
        if (!isMounted) break;

        const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
        const initialChunkStart = Math.floor((startFrom - 1) / 10) * 10 + 1;
        const ownedNumbers = comic.ownedNumbers || [];
        
        let currentLimit = initialChunkStart + 9;
        if (ownedNumbers.length > 0) {
          const highestOwned = Math.max(...ownedNumbers);
          if (highestOwned % 10 === 0) {
            currentLimit = Math.max(currentLimit, highestOwned + 10);
          } else {
            currentLimit = Math.max(currentLimit, Math.ceil(highestOwned / 10) * 10);
          }
        }

        const covers = comic.issueCovers || {};
        const pending = comic.pendingCovers || {};
        const searched = comic.searchedIssues || {};
        const rejected = comic.rejectedCovers || {};

        for (let n = initialChunkStart; n <= currentLimit; n++) {
          if (!isMounted) break;
          const key = `${comic.id}_${n}`;

          // Se já tem capa fixada, ou capa pendente aguardando aprovação, ou já está sendo buscado, pula
          if (covers[n] || pending[n] || scrapingQueueRef.current.has(key)) {
            continue;
          }

          // Se já foi pesquisado e não possui rejeições novas a explorar, pula
          if (searched[n] && (!rejected[n] || rejected[n].length === 0)) {
            continue;
          }

          // Coletar capas já usadas em outras edições desta mesma HQ para garantir 100% de unicidade
          const otherCoverUrls = Object.entries(comic.issueCovers || {})
            .filter(([k]) => k !== String(n))
            .map(([, url]) => url)
            .concat(
              Object.entries(comic.pendingCovers || {})
                .filter(([k]) => k !== String(n))
                .map(([, p]) => p?.coverUrl)
                .filter(Boolean)
            );

          const issueRejected = comic.rejectedCovers?.[n] || [];
          const excludedUrls = Array.from(new Set([...issueRejected, ...otherCoverUrls]));

          scrapingQueueRef.current.add(key);
          setIsScrapingActive(true);

          try {
            const res = await searchIssueCover(comic, n, excludedUrls);
            if (!isMounted) break;

            const updatedSearched = { ...(comic.searchedIssues || {}), [n]: true };
            let updatedPending = { ...(comic.pendingCovers || {}) };

            if (res.found && res.coverUrl && !excludedUrls.includes(res.coverUrl)) {
              updatedPending[n] = {
                coverUrl: res.coverUrl,
                source: res.source,
                year: res.year,
                title: res.title
              };
            }

            const updatedComic = {
              ...comic,
              searchedIssues: updatedSearched,
              pendingCovers: updatedPending
            };

            await saveComic(updatedComic);
          } catch (e) {
            console.warn(`Scraper erro na edição ${n} de ${comic.name}:`, e);
          }

          // Intervalo gentil entre buscas para não saturar a rede móvel
          await new Promise(r => setTimeout(r, 600));
        }
      }

      if (isMounted) {
        setIsScrapingActive(false);
      }
    };

    const timer = setTimeout(runBackgroundScraper, 1500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [comics]);

  // Alternar o tipo do novo título
  const handleCycleNewType = () => {
    const currentIndex = COMIC_TYPES.indexOf(newComicType);
    const nextIndex = (currentIndex + 1) % COMIC_TYPES.length;
    setNewComicType(COMIC_TYPES[nextIndex]);
  };

  // Alternar a editora do novo título
  const handleCycleNewPublisher = () => {
    const currentIndex = PUBLISHERS.indexOf(newComicPublisher);
    const nextIndex = (currentIndex + 1) % PUBLISHERS.length;
    setNewComicPublisher(PUBLISHERS[nextIndex]);
  };

  // Cadastro Rápido de HQ
  const handleAddComic = async (e) => {
    e?.preventDefault();
    const trimmed = newComicName.trim();
    if (!trimmed) return;

    const nextPosition = comics.length > 0 
      ? Math.max(...comics.map(c => typeof c.position === 'number' ? c.position : 0)) + 1 
      : 0;

    const parsedStart = parseInt(newComicStartFrom, 10);
    const startFrom = !isNaN(parsedStart) && parsedStart > 1 ? parsedStart : 1;

    const newComic = {
      id: 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: trimmed,
      type: newComicType,
      publisher: newComicPublisher,
      startFrom,
      showHiddenChunks: false,
      ownedNumbers: [],
      issueStates: {},
      issueCovers: {},
      pendingCovers: {},
      searchedIssues: {},
      issueTitles: {},
      position: nextPosition,
      isCompleted: false,
      completedUntil: null,
      expandedChunks: [],
      startYear: '',
      brazilPublisher: '',
      mainHero: '',
      createdAt: new Date().toISOString()
    };

    const updated = await saveComic(newComic);
    setComics(updated);
    setNewComicName('');
    setNewComicStartFrom('');
    inputRef.current?.focus();
  };

  // Cadastro Detalhado de HQ
  const handleDetailedAddSubmit = async (e) => {
    e?.preventDefault();
    const trimmed = detailedName.trim();
    if (!trimmed) return;

    const nextPosition = comics.length > 0 
      ? Math.max(...comics.map(c => typeof c.position === 'number' ? c.position : 0)) + 1 
      : 0;

    const parsedStart = parseInt(detailedStartFrom, 10);
    const startFrom = !isNaN(parsedStart) && parsedStart > 1 ? parsedStart : 1;

    const newComic = {
      id: 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: trimmed,
      type: detailedType,
      publisher: detailedPublisher,
      startFrom,
      showHiddenChunks: false,
      startYear: detailedStartYear.trim(),
      brazilPublisher: detailedBrazilPublisher.trim(),
      mainHero: detailedMainHero.trim(),
      ownedNumbers: [],
      issueStates: {},
      issueCovers: {},
      pendingCovers: {},
      searchedIssues: {},
      issueTitles: {},
      position: nextPosition,
      isCompleted: false,
      completedUntil: null,
      expandedChunks: [],
      createdAt: new Date().toISOString()
    };

    const updated = await saveComic(newComic);
    setComics(updated);
    setShowDetailedAddModal(false);
    setDetailedName('');
    setDetailedStartYear('');
    setDetailedBrazilPublisher('');
    setDetailedMainHero('');
    setDetailedStartFrom('1');
  };

  // Ciclo dos 4 Estágios por Edição (Modo Edição)
  // none ➔ owned (amarelo) ➔ read (amarelo com borda azul neon) ➔ wishlist (desmarcado com borda pink neon) ➔ none
  const handleCycleIssueState = async (comic, num) => {
    // Obter estágio atual
    let currentStage = 'none';
    if (comic.issueStates && comic.issueStates[num]) {
      currentStage = comic.issueStates[num];
    } else if (comic.ownedNumbers?.includes(num)) {
      currentStage = 'owned';
    }

    let nextStage;
    if (currentStage === 'none') {
      nextStage = 'owned';     // 1. Comprei / Tenho (amarelo)
    } else if (currentStage === 'owned') {
      nextStage = 'read';      // 2. Tenho e já li (borda azul neon)
    } else if (currentStage === 'read') {
      nextStage = 'wishlist';  // 3. Quero comprar (borda pink neon)
    } else {
      nextStage = 'none';      // 4. Não tenho e não pretendo comprar (original)
    }

    const updatedStates = { ...(comic.issueStates || {}) };
    if (nextStage === 'none') {
      delete updatedStates[num];
    } else {
      updatedStates[num] = nextStage;
    }

    // Sincronizar com ownedNumbers (apenas 'owned' e 'read' contam como possuídos)
    let newOwned = [...(comic.ownedNumbers || [])];
    if (nextStage === 'owned' || nextStage === 'read') {
      if (!newOwned.includes(num)) newOwned.push(num);
    } else {
      newOwned = newOwned.filter(n => n !== num);
    }
    newOwned.sort((a, b) => a - b);

    const updatedComic = {
      ...comic,
      ownedNumbers: newOwned,
      issueStates: updatedStates
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);

    // Se estiver visualizando detalhes, atualiza também a visualização
    if (viewingIssueDetail && viewingIssueDetail.comic.id === comic.id && viewingIssueDetail.issueNum === num) {
      setViewingIssueDetail({ comic: updatedComic, issueNum: num });
    }
  };

  // Aprovar Capa Pendente (Botão com V verde sem texto)
  const handleApproveCover = async (comicId, issueNum) => {
    const comic = comics.find(c => c.id === comicId);
    if (!comic) return;

    const pendingCover = comic.pendingCovers?.[issueNum];
    if (!pendingCover) return;

    const updatedCovers = { ...(comic.issueCovers || {}), [issueNum]: pendingCover.coverUrl };
    const updatedPending = { ...(comic.pendingCovers || {}) };
    delete updatedPending[issueNum];

    const updatedComic = {
      ...comic,
      issueCovers: updatedCovers,
      pendingCovers: updatedPending
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);

    if (viewingIssueDetail && viewingIssueDetail.comic.id === comicId) {
      setViewingIssueDetail({ comic: updatedComic, issueNum });
    }
  };

  // Rejeitar Capa Pendente (Botão com X vermelho sem texto)
  // Ao rejeitar, busca progressivamente edições mais antigas e impede repetição de capas
  const handleRejectCover = async (comicId, issueNum) => {
    const comic = comics.find(c => c.id === comicId);
    if (!comic) return;

    const pendingCover = comic.pendingCovers?.[issueNum];
    const rejectedUrl = pendingCover?.coverUrl;

    const updatedPending = { ...(comic.pendingCovers || {}) };
    delete updatedPending[issueNum];

    const updatedRejected = { ...(comic.rejectedCovers || {}) };
    if (rejectedUrl) {
      const prevList = updatedRejected[issueNum] || [];
      if (!prevList.includes(rejectedUrl)) {
        updatedRejected[issueNum] = [...prevList, rejectedUrl];
      }
    }

    // Libera a fila para permitir buscar a próxima (mais antiga)
    const queueKey = `${comicId}_${issueNum}`;
    scrapingQueueRef.current.delete(queueKey);

    const updatedComic = {
      ...comic,
      pendingCovers: updatedPending,
      rejectedCovers: updatedRejected
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);

    if (viewingIssueDetail && viewingIssueDetail.comic.id === comicId) {
      setViewingIssueDetail({ comic: updatedComic, issueNum });
    }

    // Buscar imediatamente o próximo candidato mais antigo disponível
    setTimeout(async () => {
      const otherCoverUrls = Object.entries(updatedComic.issueCovers || {})
        .filter(([k]) => k !== String(issueNum))
        .map(([, url]) => url)
        .concat(
          Object.entries(updatedComic.pendingCovers || {})
            .filter(([k]) => k !== String(issueNum))
            .map(([, p]) => p?.coverUrl)
            .filter(Boolean)
        );

      const allExcluded = Array.from(new Set([...(updatedRejected[issueNum] || []), ...otherCoverUrls]));

      try {
        const nextRes = await searchIssueCover(updatedComic, issueNum, allExcluded);
        if (nextRes.found && nextRes.coverUrl && !allExcluded.includes(nextRes.coverUrl)) {
          const freshPending = {
            ...(updatedComic.pendingCovers || {}),
            [issueNum]: {
              coverUrl: nextRes.coverUrl,
              source: nextRes.source,
              year: nextRes.year,
              title: nextRes.title
            }
          };
          const nextComic = {
            ...updatedComic,
            pendingCovers: freshPending
          };
          const saved = await saveComic(nextComic);
          setComics(saved);
          if (viewingIssueDetail && viewingIssueDetail.comic.id === comicId) {
            setViewingIssueDetail({ comic: nextComic, issueNum });
          }
        }
      } catch (err) {
        console.warn('Erro ao buscar alternativa mais antiga:', err);
      }
    }, 150);
  };

  // Desvincular / Remover Capa Fixada
  const handleRemoveFixedCover = async (comicId, issueNum) => {
    const comic = comics.find(c => c.id === comicId);
    if (!comic) return;

    const updatedCovers = { ...(comic.issueCovers || {}) };
    delete updatedCovers[issueNum];

    const updatedComic = {
      ...comic,
      issueCovers: updatedCovers
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);

    if (viewingIssueDetail && viewingIssueDetail.comic.id === comicId) {
      setViewingIssueDetail({ comic: updatedComic, issueNum });
    }
  };

  // Forçar busca manual de capa na tela de detalhes
  const handleManualSearchCover = async (comic, issueNum) => {
    setIsSearchingSingleCover(true);
    try {
      const otherCoverUrls = Object.entries(comic.issueCovers || {})
        .filter(([k]) => k !== String(issueNum))
        .map(([, url]) => url)
        .concat(
          Object.entries(comic.pendingCovers || {})
            .filter(([k]) => k !== String(issueNum))
            .map(([, p]) => p?.coverUrl)
            .filter(Boolean)
        );

      const allExcluded = Array.from(new Set([...(comic.rejectedCovers?.[issueNum] || []), ...otherCoverUrls]));

      const res = await searchIssueCover(comic, issueNum, allExcluded);
      if (res.found && res.coverUrl && !allExcluded.includes(res.coverUrl)) {
        const updatedPending = {
          ...(comic.pendingCovers || {}),
          [issueNum]: {
            coverUrl: res.coverUrl,
            source: res.source,
            year: res.year,
            title: res.title
          }
        };
        const updatedComic = { ...comic, pendingCovers: updatedPending };
        const updated = await saveComic(updatedComic);
        setComics(updated);
        setViewingIssueDetail({ comic: updatedComic, issueNum });
      } else {
        alert('Nenhuma capa localizada nos servidores para esta edição.');
      }
    } catch (e) {
      alert('Falha ao pesquisar capa.');
    } finally {
      setIsSearchingSingleCover(false);
    }
  };

  // Ciclar tipo diretamente no card
  const handleCycleComicType = async (comic) => {
    const currentIndex = COMIC_TYPES.indexOf(comic.type || 'Mensal');
    const nextIndex = (currentIndex + 1) % COMIC_TYPES.length;
    const updatedComic = { ...comic, type: COMIC_TYPES[nextIndex] };
    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Ciclar editora diretamente no card
  const handleCycleComicPublisher = async (comic) => {
    const currentIndex = PUBLISHERS.indexOf(comic.publisher || 'Marvel');
    const nextIndex = (currentIndex + 1) % PUBLISHERS.length;
    const updatedComic = { ...comic, publisher: PUBLISHERS[nextIndex] };
    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Alternar visualização de dezenas ocultas anteriores
  const handleToggleHiddenChunks = async (comic) => {
    const updatedComic = {
      ...comic,
      showHiddenChunks: !comic.showHiddenChunks
    };
    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Alternar expandir/recolher bloco resumido (ex: 01..10)
  const handleToggleChunkExpand = async (comic, chunkStart) => {
    const currentExpanded = comic.expandedChunks || [];
    const isExpanded = currentExpanded.includes(chunkStart);
    const newExpanded = isExpanded
      ? currentExpanded.filter(c => c !== chunkStart)
      : [...currentExpanded, chunkStart];

    const updatedComic = {
      ...comic,
      expandedChunks: newExpanded
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Encerrar item / Minissérie (conclui e resume até o maior número marcado)
  const handleToggleCompleteSeries = async (comic) => {
    if (comic.isCompleted) {
      const updatedComic = {
        ...comic,
        isCompleted: false,
        completedUntil: null
      };
      const updated = await saveComic(updatedComic);
      setComics(updated);
      return;
    }

    const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
    const maxNum = comic.ownedNumbers && comic.ownedNumbers.length > 0 
      ? Math.max(...comic.ownedNumbers) 
      : startFrom;

    const count = Math.max(1, maxNum - startFrom + 1);
    const completeRange = Array.from({ length: count }, (_, i) => startFrom + i);

    const updatedComic = {
      ...comic,
      isCompleted: true,
      completedUntil: maxNum,
      ownedNumbers: completeRange,
      expandedChunks: []
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Iniciar modo de edição completa da HQ
  const handleStartEdit = (comic) => {
    setEditingComic(comic);
    setEditNameInput(comic.name);
    setEditTypeInput(comic.type || 'Mensal');
    setEditPublisherInput(comic.publisher || 'Marvel');
    setEditStartFromInput(String(comic.startFrom || 1));
    setEditStartYearInput(comic.startYear || '');
    setEditBrazilPublisherInput(comic.brazilPublisher || '');
    setEditMainHeroInput(comic.mainHero || '');
  };

  // Salvar alteração no modal de edição
  const handleSaveEdit = async () => {
    if (!editingComic) return;
    const trimmed = editNameInput.trim();
    if (!trimmed) return;
    const parsedStart = parseInt(editStartFromInput, 10);
    const startFrom = !isNaN(parsedStart) && parsedStart > 1 ? parsedStart : 1;

    const updatedComic = {
      ...editingComic,
      name: trimmed,
      type: editTypeInput,
      publisher: editPublisherInput,
      startFrom,
      startYear: editStartYearInput.trim(),
      brazilPublisher: editBrazilPublisherInput.trim(),
      mainHero: editMainHeroInput.trim()
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
    setEditingComic(null);
  };

  // Confirmar e excluir HQ
  const handleDeleteComic = async (comicId) => {
    const updated = await deleteComic(comicId);
    setComics(updated);
    setConfirmDeleteId(null);
    setEditingComic(null);
  };

  // Abertura do Modal de Título de Edição Específica
  const handleOpenIssueTitleModal = (comic, issueNum) => {
    if (comic.type !== 'Minissérie' && comic.type !== 'Coleção') return;
    const currentTitle = comic.issueTitles?.[issueNum] || '';
    setIssueTitleModal({ comic, issueNum, currentTitle });
    setIssueTitleInput(currentTitle);
  };

  // Salvar Título de Edição
  const handleSaveIssueTitle = async () => {
    if (!issueTitleModal) return;
    const { comic, issueNum } = issueTitleModal;
    const trimmed = issueTitleInput.trim();
    const updatedTitles = { ...(comic.issueTitles || {}) };
    
    if (trimmed) {
      updatedTitles[issueNum] = trimmed;
    } else {
      delete updatedTitles[issueNum];
    }

    const updatedComic = {
      ...comic,
      issueTitles: updatedTitles
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
    setIssueTitleModal(null);
  };

  // Remover Título de Edição
  const handleRemoveIssueTitle = async () => {
    if (!issueTitleModal) return;
    const { comic, issueNum } = issueTitleModal;
    const updatedTitles = { ...(comic.issueTitles || {}) };
    delete updatedTitles[issueNum];

    const updatedComic = {
      ...comic,
      issueTitles: updatedTitles
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
    setIssueTitleModal(null);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedList = [...sortedAndFilteredComics];
    const [movedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, movedItem);

    setSortOrder('personal');
    setDraggedIndex(null);
    setDragOverIndex(null);

    const reindexedList = updatedList.map((item, idx) => ({
      ...item,
      position: idx
    }));

    const fullComicsMap = new Map(comics.map(c => [c.id, c]));
    reindexedList.forEach(item => fullComicsMap.set(item.id, item));
    const fullList = Array.from(fullComicsMap.values());

    setComics(fullList);
    await saveAllComicsOrder(fullList);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Mover card para cima/baixo manualmente
  const handleMoveCard = async (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedAndFilteredComics.length) return;

    const updatedList = [...sortedAndFilteredComics];
    const [movedItem] = updatedList.splice(index, 1);
    updatedList.splice(targetIndex, 0, movedItem);

    setSortOrder('personal');

    const reindexedList = updatedList.map((item, idx) => ({
      ...item,
      position: idx
    }));

    const fullComicsMap = new Map(comics.map(c => [c.id, c]));
    reindexedList.forEach(item => fullComicsMap.set(item.id, item));
    const fullList = Array.from(fullComicsMap.values());

    setComics(fullList);
    await saveAllComicsOrder(fullList);
  };

  // Filtragem e Ordenação (A-Z, Z-A, Ordem Pessoal)
  const sortedAndFilteredComics = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = comics.filter((comic) => {
      if (query && !comic.name.toLowerCase().includes(query)) {
        return false;
      }
      if (filterType !== 'Todos' && (comic.type || 'Mensal') !== filterType) {
        return false;
      }
      if (filterPublisher !== 'Todas' && (comic.publisher || 'Marvel') !== filterPublisher) {
        return false;
      }
      if (filterStatus === 'Em Andamento' && comic.isCompleted) {
        return false;
      }
      if (filterStatus === 'Encerrados' && !comic.isCompleted) {
        return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      if (sortOrder === 'A-Z') {
        return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' });
      }
      if (sortOrder === 'Z-A') {
        return b.name.localeCompare(a.name, 'pt-BR', { sensitivity: 'base' });
      }
      const posA = typeof a.position === 'number' ? a.position : 0;
      const posB = typeof b.position === 'number' ? b.position : 0;
      return posA - posB;
    });
  }, [comics, searchQuery, filterType, filterPublisher, filterStatus, sortOrder]);

  const totalComics = comics.length;
  const totalIssuesOwned = useMemo(() => {
    return comics.reduce((acc, c) => acc + (c.ownedNumbers?.length || 0), 0);
  }, [comics]);

  const format2 = (n) => String(n).padStart(2, '0');

  // Helpers de Estilização por Tipo
  const getTypeBadgeStyle = (type) => {
    switch (type) {
      case 'Especial':
        return 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30';
      case 'Minissérie':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30';
      case 'Coleção':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30';
      case 'Mensal':
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30';
    }
  };

  // Helpers de Estilização por Editora
  const getPublisherBadgeStyle = (pub) => {
    switch (pub) {
      case 'Marvel':
        return 'bg-red-700 text-white font-black tracking-wider';
      case 'DC':
        return 'bg-blue-700 text-white font-black tracking-wider';
      case 'Vertigo':
        return 'bg-neutral-800 text-amber-300 border border-amber-500/40 font-bold';
      case 'Outras':
      default:
        return 'bg-purple-900 text-purple-200 border border-purple-600/40 font-bold';
    }
  };

  const hasActiveFilters = filterType !== 'Todos' || filterPublisher !== 'Todas' || filterStatus !== 'Todos' || viewMode !== 'all';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col font-sans ${
      appMode === 'edicao' ? 'bg-[#0c1e38] text-slate-100' : 'bg-[#070B14] text-slate-100'
    }`}>
      {/* HEADER MOBILE-FIRST COM VERSÃO, MODO E PROGRESSO DE CAPAS */}
      <header className={`sticky top-0 z-30 backdrop-blur-md border-b px-4 py-2.5 shadow-md transition-colors duration-300 ${
        appMode === 'edicao' 
          ? 'bg-[#0e274a]/95 border-cyan-500/40' 
          : 'bg-[#0A0F1D]/95 border-slate-800/80'
      }`}>
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Marca com Slogan e Badges */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shadow-lg transition shrink-0 ${
              appMode === 'edicao'
                ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 shadow-cyan-500/30'
                : 'bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-amber-500/20'
            }`}>
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  {APP_NAME}
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 shrink-0">
                  v{APP_VERSION}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  Mobile
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5 truncate">Controle Ágil de Coleções</p>
            </div>
          </div>

          {/* ÁREA DIREITA DO HEADER: MODO + PROGRESSO DE CAPAS + CONEXÃO & STATS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Indicador de Progresso de Busca de Capas (Apenas Ícone e % sem texto "Capas", Clicável) */}
            <button 
              type="button"
              onClick={() => setShowCoverSearchModal(true)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-xs border transition shadow-sm active:scale-95 cursor-pointer ${
                isScrapingActive
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 text-slate-300'
              }`}
              title={`Busca de capas: ${coverStats.percentage}% (${coverStats.searchedCount}/${coverStats.totalIssues}) - Toque para detalhes`}
              aria-label="Status da busca de capas"
            >
              <ImageIcon className={`w-3.5 h-3.5 text-amber-400 shrink-0 ${isScrapingActive ? 'animate-pulse' : ''}`} />
              <span className="font-black text-[11px] text-amber-400">
                {coverStats.percentage}%
              </span>
              {isScrapingActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping shrink-0" />
              )}
            </button>

            {/* Botão de Alternância de Modo (Consulta / Edição) - Somente Ícone */}
            <button
              type="button"
              onClick={() => setAppMode(appMode === 'consulta' ? 'edicao' : 'consulta')}
              className={`p-2 rounded-xl border text-xs font-bold transition flex items-center justify-center active:scale-95 shadow-sm ${
                appMode === 'edicao'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border-cyan-300 shadow-cyan-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title={appMode === 'edicao' ? 'Modo Edição Ativo (Toque para voltar ao Modo Consulta)' : 'Modo Consulta Ativo (Toque para entrar no Modo Edição)'}
              aria-label={appMode === 'edicao' ? 'Modo Edição' : 'Modo Consulta'}
            >
              {appMode === 'edicao' ? (
                <Pencil className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[2.5]" />
              )}
            </button>

            {/* BADGE DE CONEXÃO & ESTATÍSTICAS RESTAURADO */}
            <div className="flex flex-col items-end text-right border-l border-slate-700/60 pl-2 shrink-0">
              <div className="flex items-center gap-1 text-[11px]">
                {connectionStatus.status === 'connected' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Cloud className="w-3 h-3" /> <span className="hidden xs:inline">Nuvem</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-medium" title={connectionStatus.message}>
                    <HardDrive className="w-3 h-3" /> <span className="hidden xs:inline">Local</span>
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">
                <span className="text-white font-semibold">{totalComics}</span> HQs • <span className="text-amber-400 font-semibold">{totalIssuesOwned}</span> ed.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - TELA ÚNICA */}
      <main className="flex-1 max-w-xl w-full mx-auto p-3.5 sm:p-4 space-y-3.5">
        
        {/* BARRA DE ADICIONAR NOVO TÍTULO COM TIPO, EDITORA, INÍCIO E BOTÃO DETALHADO */}
        <section className={`p-3 rounded-2xl border shadow-xl space-y-2.5 transition ${
          appMode === 'edicao' 
            ? 'bg-[#132c50] border-cyan-700/50' 
            : 'bg-[#12192B] border-slate-700/70'
        }`}>
          <form onSubmit={handleAddComic} className="space-y-2">
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newComicName}
                onChange={(e) => setNewComicName(e.target.value)}
                placeholder="Nome da HQ (ex: Batman, Sandman)..."
                className="flex-1 bg-slate-900/90 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
              />
              <button
                type="submit"
                disabled={!newComicName.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1 transition shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
                title="Adicionar HQ"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>

            {/* BOTÕES DE ALTERNÂNCIA: TIPO, EDITORA, INÍCIO E BOTÃO DE INCLUSÃO DETALHADA */}
            <div className="flex items-center justify-between text-xs pt-0.5 flex-wrap gap-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Botão Tipo */}
                <button
                  type="button"
                  onClick={handleCycleNewType}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${getTypeBadgeStyle(newComicType)}`}
                  title="Clique para alternar o Tipo (Mensal / Especial / Minissérie / Coleção)"
                >
                  <Layers className="w-3 h-3 opacity-70" />
                  <span>Tipo: <strong>{newComicType}</strong></span>
                </button>

                {/* Botão Editora */}
                <button
                  type="button"
                  onClick={handleCycleNewPublisher}
                  className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${getPublisherBadgeStyle(newComicPublisher)}`}
                  title="Clique para alternar a Editora (Marvel / DC / Vertigo / Outras)"
                >
                  <Building2 className="w-3 h-3 opacity-80" />
                  <span>{newComicPublisher}</span>
                </button>

                {/* Campo de Início da Coleção */}
                <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700/80 rounded-lg px-2 py-1 text-xs">
                  <span className="text-slate-400 text-[11px]">Início nº:</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={newComicStartFrom}
                    onChange={(e) => setNewComicStartFrom(e.target.value)}
                    className="w-10 bg-transparent text-amber-300 font-bold text-center focus:outline-none text-xs"
                    title="Defina o número inicial se começou adiante (ex: 32)"
                  />
                </div>

                {/* Botão de Inclusão Detalhada - Somente Ícone */}
                <button
                  type="button"
                  onClick={() => {
                    setDetailedName(newComicName);
                    setDetailedType(newComicType);
                    setDetailedPublisher(newComicPublisher);
                    setDetailedStartFrom(newComicStartFrom || '1');
                    setShowDetailedAddModal(true);
                  }}
                  className="p-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition flex items-center justify-center active:scale-95 shadow-sm"
                  title="Abrir Formulário de Inclusão Detalhada (com Ano, Editora BR e Herói)"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                </button>
              </div>

              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Toque nos botões para alternar
              </span>
            </div>
          </form>
        </section>

        {/* CONTROLES: ORDENAÇÃO + BUSCA + FILTROS */}
        <section className="space-y-2">
          {/* BARRA DE ORDENAÇÃO (A-Z / Z-A / ORDEM PESSOAL) */}
          <div className="flex items-center justify-between bg-[#0F1626] p-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 pl-2">Ordenar por:</span>
            <div className="flex gap-1">
              <button
                onClick={() => setSortOrder('A-Z')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  sortOrder === 'A-Z'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Ordem Alfabética Crescente (A-Z)"
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
                <span>A-Z</span>
              </button>

              <button
                onClick={() => setSortOrder('Z-A')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  sortOrder === 'Z-A'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Ordem Alfabética Decrescente (Z-A)"
              >
                <ArrowDownZA className="w-3.5 h-3.5" />
                <span>Z-A</span>
              </button>

              <button
                onClick={() => setSortOrder('personal')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  sortOrder === 'personal'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Ordem Pessoal (Arrastar e Soltar)"
              >
                <GripVertical className="w-3.5 h-3.5" />
                <span>Pessoal</span>
              </button>
            </div>
          </div>

          {/* BUSCA RÁPIDA E BOTÃO FILTROS */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por título na coleção..."
                className="w-full bg-[#0F1626] text-white placeholder-slate-500 pl-10 pr-8 py-2.5 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-slate-600 transition"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                showFilters || hasActiveFilters
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-[#0F1626] text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
              title="Filtros e Modo de Visualização"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-slate-950 sm:hidden"></span>
              )}
            </button>
          </div>

          {/* PAINEL DE FILTROS AVANÇADOS */}
          {showFilters && (
            <div className="bg-[#12192B] border border-slate-800 rounded-2xl p-3.5 space-y-3 animate-fadeIn shadow-lg">
              {/* Filtro por Tipo */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-amber-400" /> Tipo de Publicação
                </label>
                <div className="flex flex-wrap gap-1">
                  {['Todos', ...COMIC_TYPES].map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        filterType === t
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Editora */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-amber-400" /> Editora
                </label>
                <div className="flex flex-wrap gap-1">
                  {['Todas', ...PUBLISHERS].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPublisher(p)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        filterPublisher === p
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filtro por Status */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <ListFilter className="w-3 h-3 text-amber-400" /> Status da Coleção
                </label>
                <div className="flex flex-wrap gap-1">
                  {['Todos', 'Em Andamento', 'Encerrados'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterStatus(s)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        filterStatus === s
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modo de Visualização dos 4 Estágios */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" /> Visualização por Estágio de Edição
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'all'
                        ? 'bg-slate-200 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Todas as Edições
                  </button>
                  <button
                    onClick={() => setViewMode('owned')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'owned'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Compradas (Tenho)
                  </button>
                  <button
                    onClick={() => setViewMode('read')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'read'
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-700'
                    }`}
                  >
                    Lidas (Azul Neon)
                  </button>
                  <button
                    onClick={() => setViewMode('wishlist')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'wishlist'
                        ? 'bg-pink-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-pink-300 hover:bg-slate-700'
                    }`}
                  >
                    Quero Comprar (Pink)
                  </button>
                  <button
                    onClick={() => setViewMode('none')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'none'
                        ? 'bg-slate-500 text-white font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    Não Pretendo
                  </button>
                </div>
              </div>

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => {
                      setFilterType('Todos');
                      setFilterPublisher('Todas');
                      setFilterStatus('Todos');
                      setViewMode('all');
                      setSearchQuery('');
                    }}
                    className="text-[11px] text-amber-400 hover:underline font-semibold"
                  >
                    Limpar todos os filtros
                  </button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* LISTAGEM DE QUADRINHOS */}
        <section className="space-y-3 pb-8">
          {sortedAndFilteredComics.length === 0 ? (
            <div className="bg-[#101726]/80 rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                {comics.length === 0 ? 'Nenhuma coleção cadastrada ainda' : 'Nenhuma HQ encontrada com os filtros selecionados'}
              </p>
              <p className="text-xs text-slate-500">
                {comics.length === 0 
                  ? 'Digite o nome do quadrinho acima e escolha o tipo/editora para começar!' 
                  : 'Tente alterar os filtros ou o termo de busca.'}
              </p>
            </div>
          ) : (
            sortedAndFilteredComics.map((comic, index) => (
              <div
                key={comic.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`transition-all duration-150 ${
                  dragOverIndex === index ? 'border-t-4 border-amber-400 pt-1' : ''
                } ${draggedIndex === index ? 'opacity-40 scale-[0.98]' : 'opacity-100'}`}
              >
                <ComicRow 
                  comic={comic} 
                  index={index}
                  totalItems={sortedAndFilteredComics.length}
                  appMode={appMode}
                  viewMode={viewMode}
                  onCycleIssueState={(num) => handleCycleIssueState(comic, num)}
                  onViewIssueDetail={(num) => setViewingIssueDetail({ comic, issueNum: num })}
                  onToggleChunkExpand={(chunkStart) => handleToggleChunkExpand(comic, chunkStart)}
                  onToggleHiddenChunks={() => handleToggleHiddenChunks(comic)}
                  onToggleComplete={() => handleToggleCompleteSeries(comic)}
                  onCycleType={() => handleCycleComicType(comic)}
                  onCyclePublisher={() => handleCycleComicPublisher(comic)}
                  onStartEdit={() => handleStartEdit(comic)}
                  onOpenIssueTitleModal={(num) => handleOpenIssueTitleModal(comic, num)}
                  onMoveCard={(dir) => handleMoveCard(index, dir)}
                  getTypeBadgeStyle={getTypeBadgeStyle}
                  getPublisherBadgeStyle={getPublisherBadgeStyle}
                  format2={format2}
                />
              </div>
            ))
          )}
        </section>
      </main>

      {/* MODAL DE INCLUSÃO DETALHADA DE HQ */}
      {showDetailedAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-indigo-500/50 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Cadastro Detalhado de HQ
              </h3>
              <button 
                onClick={() => setShowDetailedAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDetailedAddSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome da HQ *</label>
                <input
                  type="text"
                  required
                  value={detailedName}
                  onChange={(e) => setDetailedName(e.target.value)}
                  placeholder="Ex: Demolidor: O Homem Sem Medo"
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Tipo</label>
                  <select
                    value={detailedType}
                    onChange={(e) => setDetailedType(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {COMIC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Editora Original</label>
                  <select
                    value={detailedPublisher}
                    onChange={(e) => setDetailedPublisher(e.target.value)}
                    className="w-full bg-slate-900 text-white px-3 py-2 rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {PUBLISHERS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Começar no nº</span>
                  <span className="text-[10px] text-slate-500">Dezenas anteriores ocultas</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={detailedStartFrom}
                  onChange={(e) => setDetailedStartFrom(e.target.value)}
                  placeholder="1"
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Ano de Início
                </label>
                <input
                  type="text"
                  value={detailedStartYear}
                  onChange={(e) => setDetailedStartYear(e.target.value)}
                  placeholder="Ex: 1986, 2002, 2024"
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Editora de Venda no Brasil
                </label>
                <input
                  type="text"
                  value={detailedBrazilPublisher}
                  onChange={(e) => setDetailedBrazilPublisher(e.target.value)}
                  placeholder="Ex: Panini Comics, Editora Abril, Mythos..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Herói / Grupo Principal
                </label>
                <input
                  type="text"
                  value={detailedMainHero}
                  onChange={(e) => setDetailedMainHero(e.target.value)}
                  placeholder="Ex: Demolidor, Batman, X-Men..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDetailedAddModal(false)}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!detailedName.trim()}
                  className="flex-1 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30"
                >
                  Cadastrar HQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONSULTA DE DETALHES DA EDIÇÃO COM CAPA AMPLIADA E APROVAÇÃO (V VERDE) */}
      {viewingIssueDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-[#101726] border border-cyan-500/40 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 my-auto">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>Edição #{format2(viewingIssueDetail.issueNum)}</span>
              </h3>
              <button 
                onClick={() => setViewingIssueDetail(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nome da HQ e Badges */}
            <div className="space-y-1">
              <h4 className="text-lg font-black text-white leading-tight">
                {viewingIssueDetail.comic.name}
              </h4>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getTypeBadgeStyle(viewingIssueDetail.comic.type || 'Mensal')}`}>
                  {viewingIssueDetail.comic.type || 'Mensal'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded ${getPublisherBadgeStyle(viewingIssueDetail.comic.publisher || 'Marvel')}`}>
                  {viewingIssueDetail.comic.publisher || 'Marvel'}
                </span>
                {/* Estágio Atual da Edição */}
                {(() => {
                  const stage = viewingIssueDetail.comic.issueStates?.[viewingIssueDetail.issueNum] || 
                    (viewingIssueDetail.comic.ownedNumbers?.includes(viewingIssueDetail.issueNum) ? 'owned' : 'none');
                  
                  if (stage === 'read') {
                    return (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border-2 border-cyan-400 bg-amber-500 text-slate-950 shadow-[0_0_8px_rgba(34,211,238,0.8)]">
                        ✓ Tenho e Já Li
                      </span>
                    );
                  }
                  if (stage === 'owned') {
                    return (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                        ✓ Comprada (Tenho)
                      </span>
                    );
                  }
                  if (stage === 'wishlist') {
                    return (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded border-2 border-pink-500 text-pink-300 bg-slate-900 shadow-[0_0_8px_rgba(236,72,153,0.8)]">
                        ★ Quero Comprar
                      </span>
                    );
                  }
                  return (
                    <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      Não Pretendo Comprar
                    </span>
                  );
                })()}
              </div>

              {viewingIssueDetail.comic.issueTitles?.[viewingIssueDetail.issueNum] && (
                <div className="mt-1 p-2 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Título: <strong>"{viewingIssueDetail.comic.issueTitles[viewingIssueDetail.issueNum]}"</strong></span>
                </div>
              )}
            </div>

            {/* ÁREA DE CAPA AMPLIADA COM VISUAL ESTÉTICO DE GIBI */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
              {/* CENÁRIO 1: Capa Fixada Oficialmente */}
              {viewingIssueDetail.comic.issueCovers?.[viewingIssueDetail.issueNum] ? (
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="relative group max-w-[220px] rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
                    <img 
                      src={viewingIssueDetail.comic.issueCovers[viewingIssueDetail.issueNum]} 
                      alt={`Capa da edição #${viewingIssueDetail.issueNum}`}
                      className="w-full h-auto max-h-[300px] object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                      <Check className="w-3 h-3 stroke-[3]" /> Fixada
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveFixedCover(viewingIssueDetail.comic.id, viewingIssueDetail.issueNum)}
                    className="text-xs text-slate-400 hover:text-red-400 transition underline pt-1"
                  >
                    Desvincular capa desta edição
                  </button>
                </div>
              ) : viewingIssueDetail.comic.pendingCovers?.[viewingIssueDetail.issueNum] ? (
                /* CENÁRIO 2: Capa Encontrada Pendente de Aprovação (Com Botão Verde V) */
                <div className="space-y-3 w-full flex flex-col items-center">
                  <div className="w-full bg-amber-500/15 border border-amber-500/40 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-semibold flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      Capa Encontrada (Aguardando Aprovação)
                    </span>
                    <span className="text-[10px] text-amber-400/80">
                      {viewingIssueDetail.comic.pendingCovers[viewingIssueDetail.issueNum].source || 'Panini / Web'}
                    </span>
                  </div>

                  <div className="relative group max-w-[220px] rounded-xl overflow-hidden shadow-2xl border-2 border-emerald-500/50 bg-slate-900">
                    <img 
                      src={viewingIssueDetail.comic.pendingCovers[viewingIssueDetail.issueNum].coverUrl} 
                      alt="Capa pendente de aprovação"
                      className="w-full h-auto max-h-[300px] object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Botões de Ação: Aprovar (Verde ✓) e Rejeitar (Vermelho ✗) - Ambos SEM TEXTO */}
                  <div className="flex items-center justify-center gap-3 w-full max-w-[220px]">
                    <button
                      type="button"
                      onClick={() => handleApproveCover(viewingIssueDetail.comic.id, viewingIssueDetail.issueNum)}
                      className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition border border-emerald-400/40"
                      title="Aprovar e fixar capa oficial"
                      aria-label="Aprovar capa"
                    >
                      <Check className="w-5 h-5 stroke-[3]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectCover(viewingIssueDetail.comic.id, viewingIssueDetail.issueNum)}
                      className="flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm flex items-center justify-center shadow-lg shadow-rose-600/30 active:scale-95 transition border border-rose-400/40"
                      title="Rejeitar esta capa"
                      aria-label="Rejeitar capa"
                    >
                      <X className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                </div>
              ) : (
                /* CENÁRIO 3: Sem Capa / Em Busca */
                <div className="space-y-3 py-6 px-4">
                  <div className="w-16 h-24 mx-auto rounded-xl bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 shadow-inner">
                    <ImageIcon className="w-7 h-7 text-slate-500 mb-1" />
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Sem Capa</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-300">
                      {isSearchingSingleCover ? 'Buscando capa nos servidores Panini/Web...' : 'Nenhuma capa aprovada para esta edição'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      O sistema busca capas em segundo plano automaticamente.
                    </p>
                  </div>
                  <button
                    onClick={() => handleManualSearchCover(viewingIssueDetail.comic, viewingIssueDetail.issueNum)}
                    disabled={isSearchingSingleCover}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 mx-auto"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSearchingSingleCover ? 'animate-spin' : ''}`} />
                    <span>Buscar Capa Agora</span>
                  </button>
                </div>
              )}
            </div>

            {/* Metadados Complementares da HQ */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800 space-y-1.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block text-[10px]">Editora no Brasil:</span>
                  <span className="font-semibold text-slate-200">
                    {viewingIssueDetail.comic.brazilPublisher || 'Não informada'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ano de Início:</span>
                  <span className="font-semibold text-slate-200">
                    {viewingIssueDetail.comic.startYear || 'Não informado'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Herói / Grupo Principal:</span>
                  <span className="font-semibold text-slate-200">
                    {viewingIssueDetail.comic.mainHero || 'Não informado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-1">
              <button
                onClick={() => setViewingIssueDetail(null)}
                className="w-full py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO E EXCLUSÃO DO TÍTULO */}
      {editingComic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" /> Editar Coleção
              </h3>
              <button 
                onClick={() => { setEditingComic(null); setConfirmDeleteId(null); }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome da HQ</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Começar no nº</span>
                  <span className="text-[10px] text-amber-400 font-normal">Oculta dezenas anteriores</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={editStartFromInput}
                  onChange={(e) => setEditStartFromInput(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                  placeholder="1"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tipo de Publicação</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COMIC_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditTypeInput(t)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition border ${
                        editTypeInput === t
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Editora Original</label>
                <div className="grid grid-cols-4 gap-1">
                  {PUBLISHERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setEditPublisherInput(p)}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition border text-center ${
                        editPublisherInput === p
                          ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ano de Início
                </label>
                <input
                  type="text"
                  value={editStartYearInput}
                  onChange={(e) => setEditStartYearInput(e.target.value)}
                  placeholder="Ex: 1986, 2024"
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> Editora de Venda no Brasil
                </label>
                <input
                  type="text"
                  value={editBrazilPublisherInput}
                  onChange={(e) => setEditBrazilPublisherInput(e.target.value)}
                  placeholder="Ex: Panini Comics, Abril..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Herói / Grupo Principal
                </label>
                <input
                  type="text"
                  value={editMainHeroInput}
                  onChange={(e) => setEditMainHeroInput(e.target.value)}
                  placeholder="Ex: Demolidor, Batman, X-Men..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingComic(null); setConfirmDeleteId(null); }}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={!editNameInput.trim()}
                  className="flex-1 px-3 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 disabled:opacity-40 transition"
                >
                  Salvar
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800">
                {confirmDeleteId === editingComic.id ? (
                  <div className="bg-red-950/40 border border-red-800/80 p-3 rounded-xl space-y-2">
                    <p className="text-[11px] text-red-200 font-medium flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      Tem certeza que deseja excluir esta coleção inteira?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium"
                      >
                        Não, manter
                      </button>
                      <button
                        onClick={() => handleDeleteComic(editingComic.id)}
                        className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-[11px] font-bold hover:bg-red-500 transition"
                      >
                        Sim, Excluir
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(editingComic.id)}
                    className="w-full flex items-center justify-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-medium py-2 rounded-xl hover:bg-red-950/30 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Excluir esta coleção
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TÍTULO DA EDIÇÃO ESPECÍFICA */}
      {issueTitleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-purple-800/80 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" /> Título da Edição #{format2(issueTitleModal.issueNum)}
              </h3>
              <button 
                onClick={() => setIssueTitleModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Defina um nome específico para o fascículo #{format2(issueTitleModal.issueNum)} de <strong>"{issueTitleModal.comic.name}"</strong>:
            </p>

            <div className="space-y-2">
              <input
                type="text"
                value={issueTitleInput}
                onChange={(e) => setIssueTitleInput(e.target.value)}
                placeholder="Ex: Ano Um, O Longo Dia das Bruxas..."
                className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-purple-500"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveIssueTitle();
                }}
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setIssueTitleModal(null)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveIssueTitle}
                  className="flex-1 px-3 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition shadow-md shadow-purple-600/30"
                >
                  Salvar Título
                </button>
              </div>

              {issueTitleModal.currentTitle && (
                <button
                  onClick={handleRemoveIssueTitle}
                  className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 hover:underline transition"
                >
                  Remover título personalizado
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALHADO DE STATUS DA BUSCA DE CAPAS */}
      {showCoverSearchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-[#101726] border border-cyan-500/40 w-full max-w-lg rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4 my-auto max-h-[90vh] flex flex-col">
            {/* Header do Modal */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white leading-tight">
                    Status da Busca de Capas
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Monitoramento assíncrono Panini Brasil & Web
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowCoverSearchModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Estatísticas em Tempo Real */}
            <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center shrink-0">
              <div className="p-1">
                <div className="text-base font-black text-amber-400">{coverStats.percentage}%</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Progresso</div>
              </div>
              <div className="p-1 border-l border-slate-800">
                <div className="text-base font-black text-white">{coverStats.searchedCount}/{coverStats.totalIssues}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Buscadas</div>
              </div>
              <div className="p-1 border-l border-slate-800">
                <div className="text-base font-black text-emerald-400">{coverStats.fixedCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Fixadas</div>
              </div>
              <div className="p-1 border-l border-slate-800">
                <div className="text-base font-black text-amber-300">{coverStats.pendingCount}</div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Pendentes</div>
              </div>
            </div>

            {/* Status da Fila em Segundo Plano */}
            <div className={`p-2.5 rounded-xl text-xs flex items-center justify-between border shrink-0 ${
              isScrapingActive 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' 
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}>
              <span className="flex items-center gap-2">
                {isScrapingActive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" />
                    <span>Scraper ativo em segundo plano (consultando Panini Brasil)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Busca de capas ociosa (todas as edições foram consultadas)</span>
                  </>
                )}
              </span>
            </div>

            {/* Abas e Filtro por Nome */}
            <div className="space-y-2 shrink-0">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setCoverModalTab('all')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    coverModalTab === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Todas ({allTrackedIssues.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCoverModalTab('found')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    coverModalTab === 'found'
                      ? 'bg-emerald-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Encontradas ({allTrackedIssues.filter(i => i.status === 'fixed' || i.status === 'pending').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCoverModalTab('searching')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    coverModalTab === 'searching'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Em Busca ({allTrackedIssues.filter(i => i.status === 'searching').length})
                </button>
                <button
                  type="button"
                  onClick={() => setCoverModalTab('missing')}
                  className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    coverModalTab === 'missing'
                      ? 'bg-rose-900/60 text-rose-200 border border-rose-700/50 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sem Capa ({allTrackedIssues.filter(i => i.status === 'missing' || i.status === 'rejected').length})
                </button>
              </div>

              {/* Input de filtro por nome */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filtrar por título de HQ..."
                  value={coverModalSearchText}
                  onChange={(e) => setCoverModalSearchText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Lista com Scroll das Edições */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {(() => {
                const filtered = allTrackedIssues.filter(item => {
                  if (coverModalTab === 'found' && !(item.status === 'fixed' || item.status === 'pending')) return false;
                  if (coverModalTab === 'searching' && item.status !== 'searching') return false;
                  if (coverModalTab === 'missing' && !(item.status === 'missing' || item.status === 'rejected')) return false;
                  if (coverModalSearchText) {
                    return item.comicName.toLowerCase().includes(coverModalSearchText.toLowerCase());
                  }
                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-slate-500 text-xs">
                      Nenhuma edição encontrada nesta aba com os filtros atuais.
                    </div>
                  );
                }

                return filtered.map((item) => {
                  return (
                    <div 
                      key={`${item.comicId}_${item.issueNum}`}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between gap-3"
                    >
                      {/* Miniatura ou Placeholder */}
                      <div className="w-10 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {item.coverUrl ? (
                          <img 
                            src={item.coverUrl} 
                            alt={`${item.comicName} #${item.issueNum}`} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-slate-600" />
                        )}
                        {item.status === 'fixed' && (
                          <div className="absolute top-0.5 right-0.5 bg-emerald-600 text-white rounded p-0.5 shadow">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      {/* Informações da Edição */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-white truncate">
                            {item.comicName}
                          </h4>
                          <span className="font-mono text-xs font-black text-amber-400 shrink-0">
                            #{format2(item.issueNum)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400">
                          <span className={`px-1.5 py-0.2 rounded border ${getTypeBadgeStyle(item.comicType)}`}>
                            {item.comicType}
                          </span>
                          <span>•</span>
                          <span>{item.comicPublisher}</span>
                          {item.source && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400/80 truncate max-w-[120px]">{item.source}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-1">
                          {item.status === 'fixed' && (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/50 border border-emerald-800/60 px-1.5 py-0.5 rounded">
                              ✓ Capa Fixada
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/50 border border-amber-800/60 px-1.5 py-0.5 rounded animate-pulse">
                              ⏳ Pendente de Aprovação
                            </span>
                          )}
                          {item.status === 'searching' && (
                            <span className="text-[10px] font-semibold text-blue-300 bg-blue-950/50 border border-blue-800/60 px-1.5 py-0.5 rounded flex items-center gap-1 w-max">
                              <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Na Fila / Buscando
                            </span>
                          )}
                          {item.status === 'missing' && (
                            <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                              Sem Capa Localizada
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="text-[10px] text-rose-300 bg-rose-950/50 border border-rose-800/60 px-1.5 py-0.5 rounded">
                              ✗ Capa Rejeitada
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botões Rápidos de Ação (Aprovar / Rejeitar / Re-buscar) SEM TEXTO */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.status === 'pending' && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveCover(item.comicId, item.issueNum)}
                              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm active:scale-95 transition"
                              title="Aprovar capa"
                              aria-label="Aprovar capa"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectCover(item.comicId, item.issueNum)}
                              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:scale-95 transition"
                              title="Rejeitar capa"
                              aria-label="Rejeitar capa"
                            >
                              <X className="w-4 h-4 stroke-[3]" />
                            </button>
                          </>
                        )}

                        {item.status === 'fixed' && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFixedCover(item.comicId, item.issueNum)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700/80 active:scale-95 transition"
                            title="Desvincular capa"
                            aria-label="Desvincular capa"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {(item.status === 'missing' || item.status === 'rejected' || item.status === 'searching') && (
                          <button
                            type="button"
                            onClick={() => handleManualSearchCover(item.comic, item.issueNum)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 active:scale-95 transition"
                            title="Buscar na Panini Brasil"
                            aria-label="Buscar na Panini Brasil"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de Linha de Quadrinho com 4 Estágios, 10 Bolinhas Estritas em 1 Linha e Botões de Largura Fixa
 */
function ComicRow({ 
  comic, 
  index,
  totalItems,
  appMode,
  viewMode,
  onCycleIssueState, 
  onViewIssueDetail,
  onToggleChunkExpand, 
  onToggleHiddenChunks,
  onToggleComplete, 
  onCycleType,
  onCyclePublisher,
  onStartEdit, 
  onOpenIssueTitleModal,
  onMoveCard,
  getTypeBadgeStyle,
  getPublisherBadgeStyle,
  format2 
}) {
  const ownedSet = useMemo(() => new Set(comic.ownedNumbers || []), [comic.ownedNumbers]);
  const expandedChunksSet = useMemo(() => new Set(comic.expandedChunks || []), [comic.expandedChunks]);

  const comicType = comic.type || 'Mensal';
  const comicPublisher = comic.publisher || 'Marvel';
  const issueTitles = comic.issueTitles || {};
  const issueStates = comic.issueStates || {};

  const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
  const initialChunkStart = Math.floor((startFrom - 1) / 10) * 10 + 1;
  const hasHiddenPriorChunks = initialChunkStart > 1;

  const supportsIssueTitles = comicType === 'Minissérie' || comicType === 'Coleção';

  const getCardThemeClasses = (type) => {
    switch (type) {
      case 'Especial':
        return 'bg-[#220B10] border-red-950/80 hover:border-red-800/80 shadow-red-950/20';
      case 'Minissérie':
        return 'bg-[#0B2117] border-emerald-950/80 hover:border-emerald-800/80 shadow-emerald-950/20';
      case 'Coleção':
        return 'bg-[#200A2C] border-purple-950/80 hover:border-purple-800/80 shadow-purple-950/30';
      case 'Mensal':
      default:
        return 'bg-[#0E1A30] border-blue-950/80 hover:border-blue-800/80 shadow-blue-950/20';
    }
  };

  // Determinar o estágio da edição: 'none' | 'owned' | 'read' | 'wishlist'
  const getStage = (num) => {
    if (issueStates[num]) return issueStates[num];
    if (ownedSet.has(num)) return 'owned';
    return 'none';
  };

  // Classes Visuais dos 4 Estágios
  const getIssueClasses = (num) => {
    const stage = getStage(num);
    switch (stage) {
      case 'owned':
        // 1. Comprei / Tenho: amarelo sólido
        return 'bg-amber-500 text-slate-950 font-black border border-amber-400 shadow-md shadow-amber-500/30';
      case 'read':
        // 2. Tenho e já li: amarelo com borda azul neon vibrante
        return 'bg-amber-500 text-slate-950 font-black border-2 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.95)]';
      case 'wishlist':
        // 3. Quero comprar: desmarcado com borda pink neon
        return 'bg-slate-900 text-pink-300 font-bold border-2 border-pink-500 shadow-[0_0_12px_rgba(236,72,153,0.95)]';
      case 'none':
      default:
        // 4. Não tenho e não pretendo comprar: desmarcado original
        return 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white';
    }
  };

  // Se estiver encerrada como minissérie/coleção
  if (comic.isCompleted && comic.completedUntil) {
    const endNum = comic.completedUntil;
    const isExpanded = expandedChunksSet.has('completed');
    const countIssues = Math.max(1, endNum - startFrom + 1);
    const summaryLabel = startFrom > 1 
      ? `${format2(startFrom)}..${format2(endNum)}` 
      : `01..${format2(endNum)}`;

    return (
      <div className={`border rounded-2xl p-3 sm:p-3.5 shadow-md transition space-y-2.5 ${getCardThemeClasses(comicType)}`}>
        {/* LINHA 1: SOMENTE O TÍTULO */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-0.5 text-slate-500 shrink-0">
            <span className="cursor-grab active:cursor-grabbing p-1 hover:text-white" title="Arraste para reordenar">
              <GripVertical className="w-4 h-4" />
            </span>
            <button onClick={() => onMoveCard('up')} disabled={index === 0} className="disabled:opacity-20 hover:text-white p-0.5">
              <ArrowUp className="w-3 h-3" />
            </button>
            <button onClick={() => onMoveCard('down')} disabled={index === totalItems - 1} className="disabled:opacity-20 hover:text-white p-0.5">
              <ArrowDown className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={onStartEdit}
            className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5 min-w-0 flex-1"
            title="Clique para editar detalhes desta HQ"
          >
            <span className="truncate">{comic.name}</span>
            <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
          </button>
        </div>

        {/* LINHA 2: OS 3 BOTÕES COM LARGURA IGUAL E FIXA ALINHADOS À DIREITA */}
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={onCyclePublisher}
            className={`w-24 text-[11px] py-1 rounded-lg transition active:scale-95 text-center font-bold truncate ${getPublisherBadgeStyle(comicPublisher)}`}
            title="Editora Original (Toque para alternar)"
          >
            {comicPublisher}
          </button>

          <button
            onClick={onCycleType}
            className={`w-24 text-[11px] py-1 rounded-lg border transition active:scale-95 text-center font-bold truncate ${getTypeBadgeStyle(comicType)}`}
            title="Tipo de Publicação (Toque para alternar)"
          >
            {comicType}
          </button>

          <button
            onClick={onToggleComplete}
            className="w-24 text-[11px] py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition font-bold flex items-center justify-center gap-1 shrink-0"
            title="Coleção Encerrada. Toque para reabrir."
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Concluída</span>
          </button>
        </div>

        {/* Resumo da Coleção */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <button
            onClick={() => onToggleChunkExpand('completed')}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
          >
            <span>{summaryLabel}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">({countIssues} edições)</span>
            {isExpanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {/* Edições expandidas em grid */}
        {isExpanded && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-2">
            <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
              {Array.from({ length: countIssues }, (_, i) => startFrom + i).map((n) => {
                const stage = getStage(n);
                if (viewMode === 'owned' && stage !== 'owned' && stage !== 'read') return null;
                if (viewMode === 'read' && stage !== 'read') return null;
                if (viewMode === 'wishlist' && stage !== 'wishlist') return null;
                if (viewMode === 'none' && stage !== 'none') return null;

                const specificTitle = issueTitles[n];
                const hasCover = comic.issueCovers?.[n];

                return (
                  <button
                    key={n}
                    onClick={() => {
                      if (appMode === 'edicao') {
                        onCycleIssueState(n);
                      } else {
                        onViewIssueDetail(n);
                      }
                    }}
                    onDoubleClick={() => {
                      if (appMode === 'edicao') {
                        onOpenIssueTitleModal(n);
                      }
                    }}
                    className={`relative h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${getIssueClasses(n)}`}
                    title={specificTitle ? `Edição #${format2(n)}: ${specificTitle}` : `Edição #${format2(n)}`}
                  >
                    {format2(n)}
                    {hasCover && (
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" title="Capa fixada" />
                    )}
                    {specificTitle && (
                      <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-purple-400 border border-slate-950" title={`Título: ${specificTitle}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // CÁLCULO ESTRITO DE DEZENAS
  const ownedNumbers = comic.ownedNumbers || [];
  let currentChunkLimit = initialChunkStart + 9;
  if (ownedNumbers.length > 0) {
    const highestOwned = Math.max(...ownedNumbers);
    if (highestOwned % 10 === 0) {
      currentChunkLimit = Math.max(currentChunkLimit, highestOwned + 10);
    } else {
      currentChunkLimit = Math.max(currentChunkLimit, Math.ceil(highestOwned / 10) * 10);
    }
  }

  const normalChunkStarts = [];
  for (let start = initialChunkStart; start <= currentChunkLimit; start += 10) {
    normalChunkStarts.push(start);
  }

  const priorChunkStarts = [];
  if (hasHiddenPriorChunks) {
    for (let start = 1; start < initialChunkStart; start += 10) {
      priorChunkStarts.push(start);
    }
  }

  // Renderizador de um bloco de 10 bolinhas estritas em 1 linha única
  const renderChunkBlock = (chunkStart) => {
    const chunkEnd = chunkStart + 9;
    const chunkNumbers = Array.from({ length: 10 }, (_, i) => chunkStart + i);
    
    const ownedCountInChunk = chunkNumbers.filter(n => {
      const s = getStage(n);
      return s === 'owned' || s === 'read';
    }).length;

    const isChunkComplete = ownedCountInChunk === 10;
    const isManuallyExpanded = expandedChunksSet.has(chunkStart);

    // Se estiver 100% completo e não foi expandido: resume como 01..10
    if (isChunkComplete && !isManuallyExpanded) {
      return (
        <div key={chunkStart} className="inline-block mr-2 mb-1">
          <button
            onClick={() => onToggleChunkExpand(chunkStart)}
            className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm active:scale-95"
            title="Clique para expandir e alterar números"
          >
            <Check className="w-3.5 h-3.5 stroke-[3] text-amber-400" />
            <span>{format2(chunkStart)}..{format2(chunkEnd)}</span>
            <ChevronRight className="w-3 h-3 text-amber-400/60" />
          </button>
        </div>
      );
    }

    // Filtragem visual dos estágios
    const visibleNumbers = chunkNumbers.filter((n) => {
      const s = getStage(n);
      if (viewMode === 'owned') return s === 'owned' || s === 'read';
      if (viewMode === 'read') return s === 'read';
      if (viewMode === 'wishlist') return s === 'wishlist';
      if (viewMode === 'none') return s === 'none';
      return true;
    });

    return (
      <div key={chunkStart} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
          <span>Edições {format2(chunkStart)} a {format2(chunkEnd)}</span>
          <span className="text-amber-400 text-[10px]">
            {ownedCountInChunk > 0 ? `${ownedCountInChunk}/10 adquiridas` : 'Disponíveis'}
          </span>
        </div>

        {/* AS 10 BOLINHAS SEMPRE EM UMA ÚNICA LINHA RIGOROSA */}
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
          {chunkNumbers.map((num) => {
            const isVisible = visibleNumbers.includes(num);
            const specificTitle = issueTitles[num];
            const hasCover = comic.issueCovers?.[num];
            const stage = getStage(num);

            if (!isVisible) {
              return (
                <div 
                  key={num} 
                  className="h-8 sm:h-9 rounded-full border border-slate-800/40 bg-slate-950/20 opacity-20 flex items-center justify-center text-[10px] text-slate-600 font-mono"
                >
                  {format2(num)}
                </div>
              );
            }

            return (
              <button
                key={num}
                onClick={() => {
                  if (appMode === 'edicao') {
                    onCycleIssueState(num);
                  } else {
                    onViewIssueDetail(num);
                  }
                }}
                onDoubleClick={() => {
                  if (appMode === 'edicao') {
                    onOpenIssueTitleModal(num);
                  }
                }}
                className={`relative h-8 sm:h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${getIssueClasses(num)}`}
                title={
                  specificTitle 
                    ? `Edição #${format2(num)}: ${specificTitle} [${stage === 'read' ? 'Tenho e Já Li' : stage === 'owned' ? 'Tenho' : stage === 'wishlist' ? 'Quero Comprar' : 'Não Pretendo'}]` 
                    : `Edição #${format2(num)} [${stage === 'read' ? 'Tenho e Já Li' : stage === 'owned' ? 'Tenho' : stage === 'wishlist' ? 'Quero Comprar' : 'Não Pretendo'}]`
                }
              >
                {format2(num)}
                {hasCover && (
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" title="Capa fixada" />
                )}
                {specificTitle && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-purple-400 border border-slate-950" title={`Título: ${specificTitle}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`border rounded-2xl p-3 sm:p-3.5 shadow-md transition space-y-2.5 ${getCardThemeClasses(comicType)}`}>
      {/* LINHA 1: SOMENTE O TÍTULO */}
      <div className="flex items-center gap-1.5 min-w-0">
        <div className="flex items-center gap-0.5 text-slate-500 shrink-0">
          <span className="cursor-grab active:cursor-grabbing p-1 hover:text-white" title="Arraste para reordenar">
            <GripVertical className="w-4 h-4" />
          </span>
          <button onClick={() => onMoveCard('up')} disabled={index === 0} className="disabled:opacity-20 hover:text-white p-0.5">
            <ArrowUp className="w-3 h-3" />
          </button>
          <button onClick={() => onMoveCard('down')} disabled={index === totalItems - 1} className="disabled:opacity-20 hover:text-white p-0.5">
            <ArrowDown className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={onStartEdit}
          className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5 min-w-0 flex-1"
          title="Clique para editar detalhes desta HQ"
        >
          <span className="truncate">{comic.name}</span>
          <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
        </button>
      </div>

      {/* LINHA 2: OS 3 BOTÕES COM LARGURA IGUAL E FIXA ALINHADOS À DIREITA (EDITORA, TIPO, ENCERRAR) */}
      <div className="flex items-center justify-end gap-1.5">
        <button
          onClick={onCyclePublisher}
          className={`w-24 text-[11px] py-1 rounded-lg transition active:scale-95 text-center font-bold truncate ${getPublisherBadgeStyle(comicPublisher)}`}
          title="Editora Original (Toque para alternar)"
        >
          {comicPublisher}
        </button>

        <button
          onClick={onCycleType}
          className={`w-24 text-[11px] py-1 rounded-lg border transition active:scale-95 text-center font-bold truncate ${getTypeBadgeStyle(comicType)}`}
          title="Tipo de Publicação (Toque para alternar)"
        >
          {comicType}
        </button>

        <button
          onClick={onToggleComplete}
          className="w-24 text-[11px] py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:text-amber-300 transition font-bold flex items-center justify-center gap-1 shrink-0"
          title="Encerrar minissérie/coleção no número atual"
        >
          <Flag className="w-3 h-3 text-amber-400 shrink-0" />
          <span>Encerrar</span>
        </button>
      </div>

      {/* ÁREA DE INTERVALOS DE 10 EM 10 */}
      <div className="space-y-2.5">
        {hasHiddenPriorChunks && (
          <div>
            {!comic.showHiddenChunks ? (
              <button
                onClick={onToggleHiddenChunks}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 text-xs font-medium transition shadow-sm"
              >
                <span className="flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edições 01..{format2(initialChunkStart - 1)}</span>
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-normal">
                  Ocultas (Início nº {startFrom}) • Toque para ver
                </span>
              </button>
            ) : (
              <div className="space-y-2 p-2 rounded-xl bg-slate-950/50 border border-dashed border-slate-700/80">
                <div className="flex items-center justify-between text-[11px] text-amber-400 font-medium px-1">
                  <span>Edições Anteriores (01 a {format2(initialChunkStart - 1)})</span>
                  <button
                    onClick={onToggleHiddenChunks}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 underline"
                  >
                    <EyeOff className="w-3 h-3" /> Recolher anteriores
                  </button>
                </div>
                {priorChunkStarts.map((chunkStart) => renderChunkBlock(chunkStart))}
              </div>
            )}
          </div>
        )}

        {normalChunkStarts.map((chunkStart) => renderChunkBlock(chunkStart))}
      </div>
    </div>
  );
}
