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
  Filter,
  Layers,
  Building2,
  ListFilter,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
import { 
  subscribeComics, 
  saveComic, 
  deleteComic 
} from './firebase';

const COMIC_TYPES = ['Mensal', 'Especial', 'Minissérie'];
const PUBLISHERS = ['Marvel', 'DC', 'Vertigo', 'Outras'];

export default function App() {
  const [comics, setComics] = useState([]);
  const [newComicName, setNewComicName] = useState('');
  const [newComicType, setNewComicType] = useState('Mensal');
  const [newComicPublisher, setNewComicPublisher] = useState('Marvel');
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Todos'); // 'Todos' | 'Mensal' | 'Especial' | 'Minissérie'
  const [filterPublisher, setFilterPublisher] = useState('Todas'); // 'Todas' | 'Marvel' | 'DC' | 'Vertigo' | 'Outras'
  const [filterStatus, setFilterStatus] = useState('Todos'); // 'Todos' | 'Em Andamento' | 'Encerrados'
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'owned' | 'missing'
  const [showFilters, setShowFilters] = useState(false);

  // Status de Conexão
  const [connectionStatus, setConnectionStatus] = useState({ status: 'connecting', message: 'Conectando...' });
  
  // Estado para Edição do Nome e Exclusão
  const [editingComic, setEditingComic] = useState(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [editTypeInput, setEditTypeInput] = useState('Mensal');
  const [editPublisherInput, setEditPublisherInput] = useState('Marvel');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  // Adicionar nova HQ
  const handleAddComic = async (e) => {
    e?.preventDefault();
    const trimmed = newComicName.trim();
    if (!trimmed) return;

    const newComic = {
      id: 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: trimmed,
      type: newComicType,
      publisher: newComicPublisher,
      ownedNumbers: [],
      isCompleted: false,
      completedUntil: null,
      highestOpenedChunk: 10, // Bloco inicial (1 a 10)
      expandedChunks: [],
      createdAt: new Date().toISOString()
    };

    const updated = await saveComic(newComic);
    setComics(updated);
    setNewComicName('');
    inputRef.current?.focus();
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

  // Alternar seleção de um número específico (ex: 1, 5, 10, 11)
  const handleToggleNumber = async (comic, num) => {
    const isOwned = comic.ownedNumbers?.includes(num);
    let newOwned = isOwned
      ? comic.ownedNumbers.filter(n => n !== num)
      : [...(comic.ownedNumbers || []), num];

    newOwned.sort((a, b) => a - b);

    // Se marcou o limite da dezena atual, abre a próxima dezena
    let currentChunkLimit = comic.highestOpenedChunk || 10;
    if (num >= currentChunkLimit) {
      currentChunkLimit = Math.ceil(num / 10) * 10 + 10;
    }

    const updatedComic = {
      ...comic,
      ownedNumbers: newOwned,
      highestOpenedChunk: currentChunkLimit
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

    // Encerrar no maior número marcado ou 1
    const maxNum = comic.ownedNumbers && comic.ownedNumbers.length > 0 
      ? Math.max(...comic.ownedNumbers) 
      : 1;

    const completeRange = Array.from({ length: maxNum }, (_, i) => i + 1);

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

  // Iniciar modo de edição
  const handleStartEdit = (comic) => {
    setEditingComic(comic);
    setEditNameInput(comic.name);
    setEditTypeInput(comic.type || 'Mensal');
    setEditPublisherInput(comic.publisher || 'Marvel');
  };

  // Salvar alteração no modal
  const handleSaveEdit = async () => {
    if (!editingComic) return;
    const trimmed = editNameInput.trim();
    if (!trimmed) return;

    const updatedComic = {
      ...editingComic,
      name: trimmed,
      type: editTypeInput,
      publisher: editPublisherInput
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

  // Filtros combinados e Ordenação Alfabética (A-Z)
  const filteredComics = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return comics
      .filter((comic) => {
        // Busca textual
        if (query && !comic.name.toLowerCase().includes(query)) {
          return false;
        }
        // Filtro por Tipo
        if (filterType !== 'Todos' && (comic.type || 'Mensal') !== filterType) {
          return false;
        }
        // Filtro por Editora
        if (filterPublisher !== 'Todas' && (comic.publisher || 'Marvel') !== filterPublisher) {
          return false;
        }
        // Filtro por Status
        if (filterStatus === 'Em Andamento' && comic.isCompleted) {
          return false;
        }
        if (filterStatus === 'Encerrados' && !comic.isCompleted) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
  }, [comics, searchQuery, filterType, filterPublisher, filterStatus]);

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
        return 'bg-purple-800 text-purple-200 border border-purple-600/40 font-bold';
    }
  };

  const hasActiveFilters = filterType !== 'Todos' || filterPublisher !== 'Todas' || filterStatus !== 'Todos' || viewMode !== 'all';

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-sans">
      {/* HEADER MOBILE-FIRST */}
      <header className="sticky top-0 z-30 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-slate-800/80 px-4 py-3 shadow-md">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight flex items-center gap-1.5">
                HQ Tracker
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Mobile
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Controle Ágil de Coleções</p>
            </div>
          </div>

          {/* BADGE DE CONEXÃO & STATS */}
          <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1 text-[11px]">
              {connectionStatus.status === 'connected' ? (
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <Cloud className="w-3.5 h-3.5" /> Nuvem
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-400 font-medium" title={connectionStatus.message}>
                  <HardDrive className="w-3.5 h-3.5" /> Local
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              <span className="text-white font-semibold">{totalComics}</span> títulos • <span className="text-amber-400 font-semibold">{totalIssuesOwned}</span> edições
            </div>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL - TELA ÚNICA */}
      <main className="flex-1 max-w-xl w-full mx-auto p-3.5 sm:p-4 space-y-3.5">
        
        {/* BARRA DE ADICIONAR NOVO TÍTULO COM BOTÕES DE TIPO E EDITORA */}
        <section className="bg-[#12192B] p-3 rounded-2xl border border-slate-700/70 shadow-xl space-y-2.5">
          <form onSubmit={handleAddComic} className="space-y-2">
            <div className="flex gap-1.5">
              <input
                ref={inputRef}
                type="text"
                value={newComicName}
                onChange={(e) => setNewComicName(e.target.value)}
                placeholder="Nome da HQ (ex: X-Men, Batman)..."
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

            {/* BOTÕES DE ALTERNÂNCIA: TIPO E EDITORA */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-1.5">
                {/* Botão Tipo */}
                <button
                  type="button"
                  onClick={handleCycleNewType}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 ${getTypeBadgeStyle(newComicType)}`}
                  title="Clique para alternar o Tipo (Mensal / Especial / Minissérie)"
                >
                  <Layers className="w-3 h-3 opacity-70" />
                  <span>Tipo: <strong>{newComicType}</strong></span>
                </button>

                {/* Botão Editora */}
                <button
                  type="button"
                  onClick={handleCycleNewPublisher}
                  className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition active:scale-95 shadow-sm ${getPublisherBadgeStyle(newComicPublisher)}`}
                  title="Clique para alternar a Editora (Marvel / DC / Vertigo / Outras)"
                >
                  <Building2 className="w-3 h-3 opacity-80" />
                  <span>{newComicPublisher}</span>
                </button>
              </div>

              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Toque nos botões para alternar
              </span>
            </div>
          </form>
        </section>

        {/* BUSCA RÁPIDA E BOTÃO EXPANDIR FILTROS */}
        <section className="space-y-2">
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

            {/* Botão de Filtros */}
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

          {/* PAINEL DE FILTROS AVANÇADOS (EXPANSÍVEL) */}
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

              {/* Botão para limpar filtros */}
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
          {filteredComics.length === 0 ? (
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
            filteredComics.map((comic) => (
              <ComicRow 
                key={comic.id} 
                comic={comic} 
                viewMode={viewMode}
                onToggleNumber={(num) => handleToggleNumber(comic, num)}
                onToggleChunkExpand={(chunkStart) => handleToggleChunkExpand(comic, chunkStart)}
                onToggleComplete={() => handleToggleCompleteSeries(comic)}
                onCycleType={() => handleCycleComicType(comic)}
                onCyclePublisher={() => handleCycleComicPublisher(comic)}
                onStartEdit={() => handleStartEdit(comic)}
                getTypeBadgeStyle={getTypeBadgeStyle}
                getPublisherBadgeStyle={getPublisherBadgeStyle}
                format2={format2}
              />
            ))
          )}
        </section>
      </main>

      {/* MODAL DE EDIÇÃO E EXCLUSÃO DO TÍTULO */}
      {editingComic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#12192B] border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-400" /> Editar Título
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
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Nome da HQ</label>
                <input
                  type="text"
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              {/* Tipo */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Tipo de Publicação</label>
                <div className="grid grid-cols-3 gap-1.5">
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

              {/* Editora */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Editora</label>
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
                  Salvar
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
 * Componente de Linha de Quadrinho com Chunking de 10 em 10 e Estilo Cromático por Tipo
 */
function ComicRow({ 
  comic, 
  viewMode,
  onToggleNumber, 
  onToggleChunkExpand, 
  onToggleComplete, 
  onCycleType,
  onCyclePublisher,
  onStartEdit, 
  getTypeBadgeStyle,
  getPublisherBadgeStyle,
  format2 
}) {
  const ownedSet = useMemo(() => new Set(comic.ownedNumbers || []), [comic.ownedNumbers]);
  const expandedChunksSet = useMemo(() => new Set(comic.expandedChunks || []), [comic.expandedChunks]);

  const comicType = comic.type || 'Mensal';
  const comicPublisher = comic.publisher || 'Marvel';

  // Cores do Card conforme especificado pelo usuário:
  // - Mensal: Azul escuro
  // - Especial: Vermelho escuro
  // - Minissérie: Verde escuro
  const getCardThemeClasses = (type) => {
    switch (type) {
      case 'Especial':
        return 'bg-[#220B10] border-red-950/80 hover:border-red-800/80 shadow-red-950/20';
      case 'Minissérie':
        return 'bg-[#0B2117] border-emerald-950/80 hover:border-emerald-800/80 shadow-emerald-950/20';
      case 'Mensal':
      default:
        return 'bg-[#0E1A30] border-blue-950/80 hover:border-blue-800/80 shadow-blue-950/20';
    }
  };

  // Se estiver encerrado como minissérie/série
  if (comic.isCompleted && comic.completedUntil) {
    const endNum = comic.completedUntil;
    const isExpanded = expandedChunksSet.has('completed');

    return (
      <div className={`border rounded-2xl p-3.5 shadow-md transition ${getCardThemeClasses(comicType)}`}>
        {/* TOPO DO CARD: NOME + TIPO + EDITORA + STATUS */}
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 overflow-hidden flex-wrap">
            <button
              onClick={onStartEdit}
              className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5"
              title="Clique para editar nome ou excluir"
            >
              <span>{comic.name}</span>
              <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
            </button>

            {/* Badges clicáveis de Tipo e Editora */}
            <div className="flex items-center gap-1">
              <button
                onClick={onCycleType}
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition active:scale-95 ${getTypeBadgeStyle(comicType)}`}
                title="Clique para alternar o Tipo"
              >
                {comicType}
              </button>
              <button
                onClick={onCyclePublisher}
                className={`text-[10px] px-2 py-0.5 rounded transition active:scale-95 ${getPublisherBadgeStyle(comicPublisher)}`}
                title="Clique para alternar a Editora"
              >
                {comicPublisher}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleComplete}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition font-semibold"
              title="Coleção Encerrada. Clique para reabrir."
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concluída</span>
            </button>
          </div>
        </div>

        {/* Resumo da Minissérie */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <button
            onClick={() => onToggleChunkExpand('completed')}
            className="flex items-center gap-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-600/50 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
            title="Clique para expandir/recolher os números individuais"
          >
            <span>01..{format2(endNum)}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">({endNum} edições)</span>
            {isExpanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {/* Números expandidos se solicitado */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {Array.from({ length: endNum }, (_, i) => i + 1).map((n) => {
              const isChecked = ownedSet.has(n);
              if (viewMode === 'owned' && !isChecked) return null;
              if (viewMode === 'missing' && isChecked) return null;

              return (
                <button
                  key={n}
                  onClick={() => onToggleNumber(n)}
                  className={`h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                    isChecked
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                      : 'bg-slate-900/90 text-slate-400 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {format2(n)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Lógica normal de blocos de 10 em 10
  const highestOwned = comic.ownedNumbers && comic.ownedNumbers.length > 0 
    ? Math.max(...comic.ownedNumbers) 
    : 0;
  
  const currentChunkLimit = Math.max(comic.highestOpenedChunk || 10, Math.ceil(highestOwned / 10) * 10 || 10);

  const chunkStarts = [];
  for (let start = 1; start <= currentChunkLimit; start += 10) {
    chunkStarts.push(start);
  }

  return (
    <div className={`border rounded-2xl p-3.5 shadow-md transition ${getCardThemeClasses(comicType)}`}>
      {/* CABEÇALHO DO CARD: NOME + TIPO + EDITORA + BOTÃO ENCERRAR */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <div className="flex items-center gap-2 overflow-hidden flex-wrap">
          <button
            onClick={onStartEdit}
            className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5"
            title="Clique para editar o nome ou excluir"
          >
            <span>{comic.name}</span>
            <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
          </button>

          {/* Badges de Tipo e Editora clicáveis */}
          <div className="flex items-center gap-1">
            <button
              onClick={onCycleType}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition active:scale-95 ${getTypeBadgeStyle(comicType)}`}
              title="Clique para alternar o Tipo"
            >
              {comicType}
            </button>
            <button
              onClick={onCyclePublisher}
              className={`text-[10px] px-2 py-0.5 rounded transition active:scale-95 ${getPublisherBadgeStyle(comicPublisher)}`}
              title="Clique para alternar a Editora"
            >
              {comicPublisher}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleComplete}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:text-amber-300 transition font-medium"
            title="Encerrar minissérie/série no número atual"
          >
            <Flag className="w-3 h-3 text-amber-400" />
            <span>Encerrar</span>
          </button>
        </div>
      </div>

      {/* ÁREA DE INTERVALOS DE 10 EM 10 */}
      <div className="space-y-2.5">
        {chunkStarts.map((chunkStart) => {
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

              {/* As bolinhas numéricas com suporte ao modo de visualização */}
              {visibleNumbers.length === 0 ? (
                <div className="py-1 text-center text-[11px] text-slate-500 italic">
                  {viewMode === 'owned' ? 'Nenhuma edição adquirida neste bloco' : 'Todas as edições deste bloco já foram adquiridas! 🎉'}
                </div>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                  {visibleNumbers.map((num) => {
                    const isChecked = ownedSet.has(num);
                    return (
                      <button
                        key={num}
                        onClick={() => onToggleNumber(num)}
                        className={`h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                            : viewMode === 'missing'
                              ? 'bg-red-950/40 text-red-300 border border-red-500/50 hover:border-red-400 hover:text-white'
                              : 'bg-slate-900/90 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white'
                        }`}
                        title={`Edição #${format2(num)} ${isChecked ? '(Adquirida)' : '(Faltante)'}`}
                      >
                        {format2(num)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
