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
  FileText,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { 
  subscribeComics, 
  saveComic, 
  deleteComic,
  saveAllComicsOrder
} from './firebase';

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
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'owned' | 'missing'
  const [showFilters, setShowFilters] = useState(false);

  // Status de Conexão
  const [connectionStatus, setConnectionStatus] = useState({ status: 'connecting', message: 'Conectando...' });
  
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

  // Modal de Consulta de Detalhes da Edição (Modo Consulta)
  const [viewingIssueDetail, setViewingIssueDetail] = useState(null); // { comic, issueNum }

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

  // Alternar o tipo do novo título (Inclusão rápida)
  const handleCycleNewType = () => {
    const currentIndex = COMIC_TYPES.indexOf(newComicType);
    const nextIndex = (currentIndex + 1) % COMIC_TYPES.length;
    setNewComicType(COMIC_TYPES[nextIndex]);
  };

  // Alternar a editora do novo título (Inclusão rápida)
  const handleCycleNewPublisher = () => {
    const currentIndex = PUBLISHERS.indexOf(newComicPublisher);
    const nextIndex = (currentIndex + 1) % PUBLISHERS.length;
    setNewComicPublisher(PUBLISHERS[nextIndex]);
  };

  // Adicionar nova HQ rápida
  const handleAddComic = async (e) => {
    e?.preventDefault();
    const trimmed = newComicName.trim();
    if (!trimmed) return;

    // Próxima posição na ordem pessoal
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
      startYear: '',
      brazilPublisher: '',
      mainHero: '',
      showHiddenChunks: false,
      ownedNumbers: [],
      issueTitles: {},
      position: nextPosition,
      isCompleted: false,
      completedUntil: null,
      expandedChunks: [],
      createdAt: new Date().toISOString()
    };

    const updated = await saveComic(newComic);
    setComics(updated);
    setNewComicName('');
    setNewComicStartFrom('');
    inputRef.current?.focus();
  };

  // Abrir Modal de Inclusão Detalhada
  const handleOpenDetailedAdd = () => {
    setDetailedName(newComicName.trim());
    setDetailedType(newComicType);
    setDetailedPublisher(newComicPublisher);
    setDetailedStartFrom(newComicStartFrom || '1');
    setDetailedStartYear('');
    setDetailedBrazilPublisher('');
    setDetailedMainHero('');
    setShowDetailedAddModal(true);
  };

  // Salvar Inclusão Detalhada
  const handleSaveDetailedAdd = async (e) => {
    e?.preventDefault();
    const trimmed = detailedName.trim();
    if (!trimmed) return;

    const parsedStart = parseInt(detailedStartFrom, 10);
    const startFrom = !isNaN(parsedStart) && parsedStart > 1 ? parsedStart : 1;

    const nextPosition = comics.length > 0 
      ? Math.max(...comics.map(c => typeof c.position === 'number' ? c.position : 0)) + 1 
      : 0;

    const newComic = {
      id: 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: trimmed,
      type: detailedType,
      publisher: detailedPublisher,
      startFrom,
      startYear: detailedStartYear.trim(),
      brazilPublisher: detailedBrazilPublisher.trim(),
      mainHero: detailedMainHero.trim(),
      showHiddenChunks: false,
      ownedNumbers: [],
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
    setNewComicName('');
    setNewComicStartFrom('');
  };

  // Ciclar tipo diretamente no card (no modo edição)
  const handleCycleComicType = async (comic) => {
    if (appMode !== 'edicao') return;
    const currentIndex = COMIC_TYPES.indexOf(comic.type || 'Mensal');
    const nextIndex = (currentIndex + 1) % COMIC_TYPES.length;
    const updatedComic = { ...comic, type: COMIC_TYPES[nextIndex] };
    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Ciclar editora diretamente no card (no modo edição)
  const handleCycleComicPublisher = async (comic) => {
    if (appMode !== 'edicao') return;
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

  // Alternar seleção de um número específico (somente no Modo Edição)
  const handleToggleNumber = async (comic, num) => {
    if (appMode !== 'edicao') return;
    const isOwned = comic.ownedNumbers?.includes(num);
    let newOwned = isOwned
      ? comic.ownedNumbers.filter(n => n !== num)
      : [...(comic.ownedNumbers || []), num];

    newOwned.sort((a, b) => a - b);

    const updatedComic = {
      ...comic,
      ownedNumbers: newOwned
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

  // Encerrar item / Minissérie
  const handleToggleCompleteSeries = async (comic) => {
    if (appMode !== 'edicao') return;
    if (comic.isCompleted) {
      // Reabrir série
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

    // Encerrar no maior número marcado ou no startFrom
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

  // Iniciar modo de edição da HQ (abre modal de alteração completo)
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

  // Salvar alteração no modal completo
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

  // Abertura do Modal de Título de Edição Específica (somente em modo edição)
  const handleOpenIssueTitleModal = (comic, issueNum) => {
    if (appMode !== 'edicao') return;
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

  // Drag and Drop Handlers (somente no Modo Edição)
  const handleDragStart = (e, index) => {
    if (appMode !== 'edicao') return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e, index) => {
    if (appMode !== 'edicao') return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    if (appMode !== 'edicao') return;
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
    if (appMode !== 'edicao') return;
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
      if (query) {
        const matchesName = comic.name.toLowerCase().includes(query);
        const matchesHero = comic.mainHero && comic.mainHero.toLowerCase().includes(query);
        const matchesBrazilPub = comic.brazilPublisher && comic.brazilPublisher.toLowerCase().includes(query);
        if (!matchesName && !matchesHero && !matchesBrazilPub) {
          return false;
        }
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

  // Estatísticas Rápidas
  const totalComics = comics.length;
  const totalIssuesOwned = useMemo(() => {
    return comics.reduce((acc, c) => acc + (c.ownedNumbers?.length || 0), 0);
  }, [comics]);

  // Formatar número com dois dígitos (01, 09, 10)
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

  const isEditMode = appMode === 'edicao';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      isEditMode ? 'bg-[#0E2038] text-slate-100' : 'bg-[#070B14] text-slate-100'
    }`}>
      {/* HEADER MOBILE-FIRST */}
      <header className={`sticky top-0 z-30 backdrop-blur-md px-4 py-3 shadow-md border-b transition-colors duration-300 ${
        isEditMode ? 'bg-[#142B4C]/95 border-blue-500/30' : 'bg-[#0A0F1D]/95 border-slate-800/80'
      }`}>
        <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
          {/* Logo & Marca */}
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20 shrink-0">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div className="truncate">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight flex items-center gap-1.5 truncate">
                HQ Tracker
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  Mobile
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate">
                {isEditMode ? 'Modo Edição Ativo' : 'Modo Consulta Ativo'}
              </p>
            </div>
          </div>

          {/* ÁREA DIREITA: BOTÃO DE ALTERNÂNCIA (CONSULTA / EDIÇÃO) + STATUS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* BOTÃO DE ALTERNÂNCIA DE MODO (PADRÃO: MODO CONSULTA) */}
            <button
              type="button"
              onClick={() => setAppMode(isEditMode ? 'consulta' : 'edicao')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border ${
                isEditMode
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/30'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-cyan-950/40'
              }`}
              title={isEditMode ? "Clique para alternar para o Modo Consulta" : "Clique para alternar para o Modo Edição"}
            >
              {isEditMode ? (
                <>
                  <Pencil className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Modo Edição</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-cyan-400 stroke-[2.5]" />
                  <span>Modo Consulta</span>
                </>
              )}
            </button>

            {/* BADGE DE CONEXÃO & STATS */}
            <div className="hidden sm:flex flex-col items-end text-right border-l border-slate-700/60 pl-2">
              <div className="flex items-center gap-1 text-[11px]">
                {connectionStatus.status === 'connected' ? (
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <Cloud className="w-3 h-3" /> Nuvem
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400 font-medium" title={connectionStatus.message}>
                    <HardDrive className="w-3 h-3" /> Local
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
        
        {/* BARRA DE ADICIONAR NOVO TÍTULO COM OPÇÃO DIRETA E INCLUSÃO DETALHADA */}
        <section className={`p-3 rounded-2xl border shadow-xl space-y-2.5 transition-colors duration-300 ${
          isEditMode 
            ? 'bg-[#152B49] border-blue-500/40 shadow-blue-950/30' 
            : 'bg-[#12192B] border-slate-700/70'
        }`}>
          <form onSubmit={handleAddComic} className="space-y-2">
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newComicName}
                onChange={(e) => setNewComicName(e.target.value)}
                placeholder="Nome da HQ (ex: Batman, Homem-Aranha)..."
                className="flex-1 bg-slate-900/90 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
              />
              <button
                type="submit"
                disabled={!newComicName.trim()}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1 transition shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
                title="Adicionar HQ direta com valores rápidos"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span className="hidden sm:inline">Adicionar</span>
              </button>
            </div>

            {/* BOTÕES DE ALTERNÂNCIA: TIPO, EDITORA, INÍCIO E BOTÃO DE INCLUSÃO DETALHADA */}
            <div className="flex items-center justify-between text-xs pt-0.5 flex-wrap gap-2">
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
              </div>

              {/* Botão de Inclusão Detalhada */}
              <button
                type="button"
                onClick={handleOpenDetailedAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/50 transition active:scale-95 shadow-sm ml-auto"
                title="Cadastrar com campos extras: Ano de Início, Editora Brasil, Herói/Grupo"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-300" />
                <span>Inclusão Detalhada</span>
              </button>
            </div>
          </form>
        </section>

        {/* CONTROLES: ORDENAÇÃO + BUSCA + FILTROS */}
        <section className="space-y-2">
          {/* BARRA DE ORDENAÇÃO (A-Z / Z-A / ORDEM PESSOAL) */}
          <div className={`flex items-center justify-between p-1.5 rounded-xl border text-xs transition-colors duration-300 ${
            isEditMode ? 'bg-[#11233B] border-blue-500/30' : 'bg-[#0F1626] border-slate-800'
          }`}>
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
                title="Ordem Pessoal (Arrastar e Soltar no Modo Edição)"
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
                placeholder="Buscar por título, herói ou editora..."
                className={`w-full text-white placeholder-slate-500 pl-10 pr-8 py-2.5 rounded-xl border text-xs focus:outline-none transition ${
                  isEditMode ? 'bg-[#11233B] border-blue-500/30 focus:border-amber-500' : 'bg-[#0F1626] border-slate-800 focus:border-slate-600'
                }`}
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

            {/* Botão de Filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
                showFilters || hasActiveFilters
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : isEditMode
                    ? 'bg-[#11233B] text-slate-300 border-blue-500/30 hover:border-blue-400'
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

          {/* PAINEL DE FILTROS AVANÇADOS (EXPANSÍVEL) */}
          {showFilters && (
            <div className={`border rounded-2xl p-3.5 space-y-3 animate-fadeIn shadow-lg ${
              isEditMode ? 'bg-[#152B49] border-blue-500/40' : 'bg-[#12192B] border-slate-800'
            }`}>
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

              {/* Modo de Visualização das Bolinhas (Tenho vs Faltantes) */}
              <div className="space-y-1 pt-1 border-t border-slate-800">
                <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-amber-400" /> Visualização das Edições
                </label>
                <div className="grid grid-cols-3 gap-1">
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
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Somente que Tenho
                  </button>
                  <button
                    onClick={() => setViewMode('missing')}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition text-center ${
                      viewMode === 'missing'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Somente Faltantes
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

        {/* LISTAGEM DE QUADRINHOS COM DRAG & DROP NATIVO */}
        <section className="space-y-3 pb-8">
          {sortedAndFilteredComics.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-8 text-center space-y-2 ${
              isEditMode ? 'bg-[#11233B]/80 border-blue-500/30' : 'bg-[#101726]/80 border-slate-800'
            }`}>
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
                draggable={isEditMode}
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
                  viewMode={viewMode}
                  appMode={appMode}
                  onToggleNumber={(num) => handleToggleNumber(comic, num)}
                  onToggleChunkExpand={(chunkStart) => handleToggleChunkExpand(comic, chunkStart)}
                  onToggleHiddenChunks={() => handleToggleHiddenChunks(comic)}
                  onToggleComplete={() => handleToggleCompleteSeries(comic)}
                  onCycleType={() => handleCycleComicType(comic)}
                  onCyclePublisher={() => handleCycleComicPublisher(comic)}
                  onStartEdit={() => handleStartEdit(comic)}
                  onOpenIssueTitleModal={(num) => handleOpenIssueTitleModal(comic, num)}
                  onViewIssueDetail={(comicData, num) => setViewingIssueDetail({ comic: comicData, issueNum: num })}
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
          <div className="bg-[#12192B] border border-indigo-500/50 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" /> Inclusão Detalhada de HQ
              </h3>
              <button 
                onClick={() => setShowDetailedAddModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveDetailedAdd} className="space-y-3">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome da HQ *</label>
                <input
                  type="text"
                  required
                  value={detailedName}
                  onChange={(e) => setDetailedName(e.target.value)}
                  placeholder="Ex: Demolidor: O Homem Sem Medo"
                  className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
              </div>

              {/* Tipo de Publicação */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Tipo de Publicação</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {COMIC_TYPES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setDetailedType(t)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition border ${
                        detailedType === t
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editora Original */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Editora Original</label>
                <div className="grid grid-cols-4 gap-1">
                  {PUBLISHERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setDetailedPublisher(p)}
                      className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold transition border text-center ${
                        detailedPublisher === p
                          ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Início nº */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Começar no nº</span>
                  <span className="text-[10px] text-slate-400">Padrão: 1</span>
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

              {/* Ano de Início */}
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

              {/* Editora de Venda no Brasil */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Editora de Venda no Brasil
                </label>
                <input
                  type="text"
                  value={detailedBrazilPublisher}
                  onChange={(e) => setDetailedBrazilPublisher(e.target.value)}
                  placeholder="Ex: Panini Comics, Editora Abril, Mythos, Devir..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Herói / Grupo Principal */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Herói / Grupo Principal
                </label>
                <input
                  type="text"
                  value={detailedMainHero}
                  onChange={(e) => setDetailedMainHero(e.target.value)}
                  placeholder="Ex: Demolidor, Batman, X-Men, Vingadores..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Botões do Formulário Detalhado */}
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

      {/* MODAL DE CONSULTA DE DETALHES DA EDIÇÃO (MODO CONSULTA) */}
      {viewingIssueDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-cyan-500/40 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
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

            {/* Nome da HQ e Status */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-base font-black text-white leading-tight">
                    {viewingIssueDetail.comic.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {viewingIssueDetail.comic.type || 'Mensal'} • {viewingIssueDetail.comic.publisher || 'Marvel'}
                  </p>
                </div>

                {viewingIssueDetail.comic.ownedNumbers?.includes(viewingIssueDetail.issueNum) ? (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" /> Tenho
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 shrink-0">
                    Faltante
                  </span>
                )}
              </div>

              {viewingIssueDetail.comic.issueTitles?.[viewingIssueDetail.issueNum] && (
                <div className="p-2 rounded-lg bg-purple-950/40 border border-purple-800/60 text-xs text-purple-200 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>Título: <strong>"{viewingIssueDetail.comic.issueTitles[viewingIssueDetail.issueNum]}"</strong></span>
                </div>
              )}
            </div>

            {/* Espaço reservado para capa da edição (futuro) */}
            <div className="bg-slate-900/80 border border-dashed border-slate-700/80 rounded-xl p-4 text-center space-y-1.5">
              <div className="w-12 h-16 mx-auto rounded-lg bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center text-slate-500 shadow-inner">
                <ImageIcon className="w-6 h-6 text-slate-400 mb-0.5" />
                <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500">Capa</span>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-300">Capa da Edição #{format2(viewingIssueDetail.issueNum)}</p>
                <p className="text-[10px] text-slate-500">Espaço reservado para visualização da capa oficial no futuro.</p>
              </div>
            </div>

            {/* Detalhes Complementares da HQ */}
            <div className="bg-slate-900/60 rounded-xl p-3 border border-slate-800/80 space-y-1.5 text-xs">
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

            {/* Botões do Modal de Consulta */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setViewingIssueDetail(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setAppMode('edicao');
                  setViewingIssueDetail(null);
                }}
                className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-amber-500/20"
                title="Alternar para o Modo Edição para marcar esta edição"
              >
                <Pencil className="w-3.5 h-3.5" /> Modo Edição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDIÇÃO DE TÍTULO DA EDIÇÃO (MINISSÉRIE E COLEÇÃO NO MODO EDIÇÃO) */}
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
              Defina um nome específico para o fascículo #{format2(issueTitleModal.issueNum)} da {issueTitleModal.comic.type.toLowerCase()} <strong>"{issueTitleModal.comic.name}"</strong>:
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

      {/* MODAL DE EDIÇÃO COMPLETA DA HQ (ABERTO AO CLICAR NO NOME NO CARD) */}
      {editingComic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-slate-700 w-full max-w-md rounded-2xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" /> Alterar Dados da HQ
              </h3>
              <button 
                onClick={() => { setEditingComic(null); setConfirmDeleteId(null); }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nome da HQ *</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              {/* Ponto de Início da Coleção */}
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

              {/* Tipo */}
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

              {/* Editora Original */}
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

              {/* Ano de Início */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ano de Início
                </label>
                <input
                  type="text"
                  value={editStartYearInput}
                  onChange={(e) => setEditStartYearInput(e.target.value)}
                  placeholder="Ex: 1986, 2002, 2024"
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Editora de Venda no Brasil */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> Editora de Venda no Brasil
                </label>
                <input
                  type="text"
                  value={editBrazilPublisherInput}
                  onChange={(e) => setEditBrazilPublisherInput(e.target.value)}
                  placeholder="Ex: Panini Comics, Editora Abril, Mythos, Devir..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Herói / Grupo Principal */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> Herói / Grupo Principal
                </label>
                <input
                  type="text"
                  value={editMainHeroInput}
                  onChange={(e) => setEditMainHeroInput(e.target.value)}
                  placeholder="Ex: Batman, Homem-Aranha, X-Men, Liga da Justiça..."
                  className="w-full bg-slate-900 text-white px-3.5 py-2 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO DO MODAL */}
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
                  Salvar Alterações
                </button>
              </div>

              {/* ÁREA DE EXCLUSÃO COM CONFIRMAÇÃO */}
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
    </div>
  );
}

/**
 * Componente de Linha de Quadrinho com Suporte a Início Customizado e Alinhamento Preciso
 */
function ComicRow({ 
  comic, 
  index,
  totalItems,
  viewMode,
  appMode,
  onToggleNumber, 
  onToggleChunkExpand, 
  onToggleHiddenChunks, 
  onToggleComplete, 
  onCycleType, 
  onCyclePublisher, 
  onStartEdit, 
  onOpenIssueTitleModal,
  onViewIssueDetail,
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

  // Ponto inicial customizado da coleção
  const startFrom = typeof comic.startFrom === 'number' && comic.startFrom > 1 ? comic.startFrom : 1;
  const initialChunkStart = Math.floor((startFrom - 1) / 10) * 10 + 1;
  const hasHiddenPriorChunks = initialChunkStart > 1;

  // Pode ter títulos de edição específicos se for Minissérie ou Coleção
  const supportsIssueTitles = comicType === 'Minissérie' || comicType === 'Coleção';

  // Cores do Card por Tipo
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

  // Se estiver encerrado como minissérie/coleção/série
  if (comic.isCompleted && comic.completedUntil) {
    const endNum = comic.completedUntil;
    const isExpanded = expandedChunksSet.has('completed');
    const countIssues = Math.max(1, endNum - startFrom + 1);
    const summaryLabel = startFrom > 1 
      ? `${format2(startFrom)}..${format2(endNum)}` 
      : `01..${format2(endNum)}`;

    return (
      <div className={`border rounded-2xl p-3.5 shadow-md transition ${getCardThemeClasses(comicType)}`}>
        {/* LINHA 1 DO CARD: SOMENTE O TÍTULO */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {appMode === 'edicao' && (
              <div className="flex items-center gap-0.5 text-slate-500 shrink-0">
                <span className="cursor-grab active:cursor-grabbing p-1 hover:text-white" title="Arraste para reordenar">
                  <GripVertical className="w-4 h-4" />
                </span>
                <button 
                  onClick={() => onMoveCard('up')} 
                  disabled={index === 0} 
                  className="disabled:opacity-20 hover:text-white p-0.5"
                  title="Mover para cima"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => onMoveCard('down')} 
                  disabled={index === totalItems - 1} 
                  className="disabled:opacity-20 hover:text-white p-0.5"
                  title="Mover para baixo"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            )}

            <button
              onClick={onStartEdit}
              className="text-left font-bold text-sm sm:text-base text-white hover:text-amber-400 transition truncate flex items-center gap-1.5 min-w-0"
              title="Clique para alterar dados da HQ"
            >
              <span className="truncate">{comic.name}</span>
              <Edit3 className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400 shrink-0" />
            </button>
          </div>
        </div>

        {/* LINHA 2 DO CARD: BOTÕES ALINHADOS À DIREITA (1º EDITORA, 2º TIPO, 3º ENCERRAR) COM LARGURAS IGUAIS E FIXAS */}
        <div className="flex items-center justify-end gap-2 mb-2.5">
          {/* 1º Editora */}
          <button
            onClick={appMode === 'edicao' ? onCyclePublisher : undefined}
            className={`w-24 h-7 text-[11px] font-bold rounded-lg border transition active:scale-95 flex items-center justify-center truncate px-1 shadow-sm ${getPublisherBadgeStyle(comicPublisher)} ${appMode !== 'edicao' ? 'cursor-default' : 'hover:opacity-90'}`}
            title={appMode === 'edicao' ? "Clique para alternar a Editora" : `Editora: ${comicPublisher}`}
          >
            <span className="truncate">{comicPublisher}</span>
          </button>

          {/* 2º Tipo */}
          <button
            onClick={appMode === 'edicao' ? onCycleType : undefined}
            className={`w-24 h-7 text-[11px] font-semibold rounded-lg border transition active:scale-95 flex items-center justify-center truncate px-1 ${getTypeBadgeStyle(comicType)} ${appMode !== 'edicao' ? 'cursor-default' : 'hover:opacity-90'}`}
            title={appMode === 'edicao' ? "Clique para alternar o Tipo" : `Tipo: ${comicType}`}
          >
            <span className="truncate">{comicType}</span>
          </button>

          {/* 3º Encerrar / Concluída */}
          <button
            onClick={appMode === 'edicao' ? onToggleComplete : undefined}
            className={`w-24 h-7 text-[11px] font-semibold rounded-lg border transition active:scale-95 flex items-center justify-center gap-1 truncate px-1 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 ${appMode !== 'edicao' ? 'cursor-default' : 'hover:bg-emerald-500/30'}`}
            title={appMode === 'edicao' ? "Coleção Encerrada. Clique para reabrir." : "Status: Concluída"}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">Concluída</span>
          </button>
        </div>

        {/* Resumo da Minissérie/Coleção */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <button
            onClick={() => onToggleChunkExpand('completed')}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
            title="Clique para expandir/recolher os números individuais"
          >
            <span>{summaryLabel}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">({countIssues} edições)</span>
            {isExpanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {/* Números expandidos se solicitado - SEMPRE 10 EM UMA ÚNICA LINHA */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
            {supportsIssueTitles && appMode === 'edicao' && (
              <p className="text-[10px] text-purple-300/80 italic">
                * Dê duplo clique em uma edição para adicionar ou editar o título do fascículo.
              </p>
            )}
            <div className="grid grid-cols-10 gap-1 w-full">
              {Array.from({ length: countIssues }, (_, i) => startFrom + i).map((n) => {
                const isChecked = ownedSet.has(n);
                if (viewMode === 'owned' && !isChecked) return null;
                if (viewMode === 'missing' && isChecked) return null;

                const specificTitle = issueTitles[n];

                return (
                  <button
                    key={n}
                    onClick={() => {
                      if (appMode === 'edicao') {
                        onToggleNumber(n);
                      } else {
                        onViewIssueDetail(comic, n);
                      }
                    }}
                    onDoubleClick={() => {
                      if (appMode === 'edicao') {
                        onOpenIssueTitleModal(n);
                      }
                    }}
                    className={`relative h-7 sm:h-8 w-full rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center transition-all active:scale-90 p-0 shadow-sm ${
                      isChecked
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                        : 'bg-slate-900/90 text-slate-400 border border-slate-700 hover:border-slate-500'
                    }`}
                    title={
                      appMode === 'edicao'
                        ? (specificTitle ? `Edição #${format2(n)}: ${specificTitle} (Clique para marcar/desmarcar)` : `Edição #${format2(n)} (Clique para marcar/desmarcar)`)
                        : (specificTitle ? `Edição #${format2(n)}: ${specificTitle} (Clique para ver detalhes)` : `Edição #${format2(n)} (Clique para ver detalhes)`)
                    }
                  >
                    {format2(n)}
                    {specificTitle && (
                      <span 
                        className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-400 border border-slate-950 shadow-sm" 
                        title={`Título: ${specificTitle}`}
                      />
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

  // CÁLCULO ESTRITO E DINÂMICO DOS BLOCOS ABERTOS:
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

  // Blocos normais da visualização ativa (a partir de initialChunkStart)
  const normalChunkStarts = [];
  for (let start = initialChunkStart; start <= currentChunkLimit; start += 10) {
    normalChunkStarts.push(start);
  }

  // Blocos anteriores caso o usuário tenha clicado para expandir dezenas anteriores
  const priorChunkStarts = [];
  if (hasHiddenPriorChunks) {
    for (let start = 1; start < initialChunkStart; start += 10) {
      priorChunkStarts.push(start);
    }
  }

  // Função auxiliar para renderizar um bloco de 10 bolinhas em UMA ÚNICA LINHA
  const renderChunkBlock = (chunkStart) => {
    const chunkEnd = chunkStart + 9;
    const chunkNumbers = Array.from({ length: 10 }, (_, i) => chunkStart + i);
    
    const ownedCountInChunk = chunkNumbers.filter(n => ownedSet.has(n)).length;
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

    // Filtro visual das bolinhas
    const visibleNumbers = chunkNumbers.filter((n) => {
      const isChecked = ownedSet.has(n);
      if (viewMode === 'owned') return isChecked;
      if (viewMode === 'missing') return !isChecked;
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

        {supportsIssueTitles && appMode === 'edicao' && (
          <p className="text-[10px] text-purple-300/80 italic px-1">
            * Dê duplo clique em uma edição para nomeá-la.
          </p>
        )}

        {visibleNumbers.length === 0 ? (
          <div className="py-1 text-center text-[11px] text-slate-500 italic">
            {viewMode === 'owned' ? 'Nenhuma edição adquirida neste bloco' : 'Todas as edições deste bloco já foram adquiridas! 🎉'}
          </div>
        ) : (
          /* SEMPRE EXIBIR AS 10 BOLINHAS EM UMA ÚNICA LINHA */
          <div className="grid grid-cols-10 gap-1 w-full">
            {visibleNumbers.map((num) => {
              const isChecked = ownedSet.has(num);
              const specificTitle = issueTitles[num];

              return (
                <button
                  key={num}
                  onClick={() => {
                    if (appMode === 'edicao') {
                      onToggleNumber(num);
                    } else {
                      onViewIssueDetail(comic, num);
                    }
                  }}
                  onDoubleClick={() => {
                    if (appMode === 'edicao') {
                      onOpenIssueTitleModal(num);
                    }
                  }}
                  className={`relative h-7 sm:h-8 w-full rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center transition-all active:scale-90 p-0 ${
                    isChecked
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                      : viewMode === 'missing'
                        ? 'bg-red-950/40 text-red-300 border border-red-500/50 hover:border-red-400 hover:text-white'
                        : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white'
                  }`}
                  title={
                    appMode === 'edicao'
                      ? (specificTitle 
                          ? `Edição #${format2(num)}: ${specificTitle} ${isChecked ? '(Adquirida)' : '(Faltante)'} (Clique para alternar / Duplo clique para nomear)` 
                          : `Edição #${format2(num)} ${isChecked ? '(Adquirida)' : '(Faltante)'} (Clique para marcar/desmarcar)`)
                      : (specificTitle 
                          ? `Edição #${format2(num)}: ${specificTitle} ${isChecked ? '(Adquirida)' : '(Faltante)'} (Clique para ver detalhes)` 
                          : `Edição #${format2(num)} ${isChecked ? '(Adquirida)' : '(Faltante)'} (Clique para ver detalhes)`)
                  }
                >
                  {format2(num)}
                  {specificTitle && (
                    <span 
                      className="absolute top-0 right-0 w-2 h-2 rounded-full bg-purple-400 border border-slate-950 shadow-sm" 
                      title={`Título: ${specificTitle}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`border rounded-2xl p-3.5 shadow-md transition ${getCardThemeClasses(comicType)}`}>
      {/* LINHA 1 DO CARD: SOMENTE O TÍTULO */}
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {appMode === 'edicao' && (
            <div className="flex items-center gap-0.5 text-slate-500 shrink-0">
              <span className="cursor-grab active:cursor-grabbing p-1 hover:text-white" title="Arraste para reordenar">
                <GripVertical className="w-4 h-4" />
              </span>
              <button 
                onClick={() => onMoveCard('up')} 
                disabled={index === 0} 
                className="disabled:opacity-20 hover:text-white p-0.5"
                title="Mover para cima"
              >
                <ArrowUp className="w-3 h-3" />
              </button>
              <button 
                onClick={() => onMoveCard('down')} 
                disabled={index === totalItems - 1} 
                className="disabled:opacity-20 hover:text-white p-0.5"
                title="Mover para baixo"
              >
                <ArrowDown className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            onClick={onStartEdit}
            className="text-left font-bold text-sm sm:text-base text-white hover:text-amber-400 transition truncate flex items-center gap-1.5 min-w-0"
            title="Clique para alterar dados da HQ"
          >
            <span className="truncate">{comic.name}</span>
            <Edit3 className="w-3.5 h-3.5 text-slate-500 hover:text-amber-400 shrink-0" />
          </button>
        </div>
      </div>

      {/* LINHA 2 DO CARD: BOTÕES ALINHADOS À DIREITA (1º EDITORA, 2º TIPO, 3º ENCERRAR) COM LARGURAS IGUAIS E FIXAS */}
      <div className="flex items-center justify-end gap-2 mb-2.5">
        {/* 1º Editora */}
        <button
          onClick={appMode === 'edicao' ? onCyclePublisher : undefined}
          className={`w-24 h-7 text-[11px] font-bold rounded-lg border transition active:scale-95 flex items-center justify-center truncate px-1 shadow-sm ${getPublisherBadgeStyle(comicPublisher)} ${appMode !== 'edicao' ? 'cursor-default' : 'hover:opacity-90'}`}
          title={appMode === 'edicao' ? "Clique para alternar a Editora" : `Editora: ${comicPublisher}`}
        >
          <span className="truncate">{comicPublisher}</span>
        </button>

        {/* 2º Tipo */}
        <button
          onClick={appMode === 'edicao' ? onCycleType : undefined}
          className={`w-24 h-7 text-[11px] font-semibold rounded-lg border transition active:scale-95 flex items-center justify-center truncate px-1 ${getTypeBadgeStyle(comicType)} ${appMode !== 'edicao' ? 'cursor-default' : 'hover:opacity-90'}`}
          title={appMode === 'edicao' ? "Clique para alternar o Tipo" : `Tipo: ${comicType}`}
        >
          <span className="truncate">{comicType}</span>
        </button>

        {/* 3º Encerrar */}
        <button
          onClick={appMode === 'edicao' ? onToggleComplete : undefined}
          className={`w-24 h-7 text-[11px] font-semibold rounded-lg border transition active:scale-95 flex items-center justify-center gap-1 truncate px-1 bg-slate-900/80 text-slate-300 border-slate-700/80 hover:text-amber-300 ${appMode !== 'edicao' ? 'cursor-default' : 'hover:bg-slate-800'}`}
          title={appMode === 'edicao' ? "Clique para encerrar no número atual" : "Status: Em Andamento"}
        >
          <Flag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">Encerrar</span>
        </button>
      </div>

      {/* ÁREA DE INTERVALOS DE 10 EM 10 (COM SUPORTE A DEZENAS OCULTAS ANTERIORES) */}
      <div className="space-y-2.5">
        {/* Chip para dezenas anteriores à edição inicial (ex: 01..30 se começou na 32) */}
        {hasHiddenPriorChunks && (
          <div>
            {!comic.showHiddenChunks ? (
              <button
                onClick={onToggleHiddenChunks}
                className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 text-xs font-medium transition shadow-sm"
                title="Clique para exibir edições anteriores a esta faixa inicial"
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

        {/* Dezenas normais a partir do ponto inicial - Sempre 10 em uma única linha */}
        {normalChunkStarts.map((chunkStart) => renderChunkBlock(chunkStart))}
      </div>
    </div>
  );
}
