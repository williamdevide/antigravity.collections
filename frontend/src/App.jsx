import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  CheckCircle2, 
  Circle, 
  Check, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Flag, 
  RotateCcw, 
  Cloud, 
  HardDrive, 
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  subscribeComics, 
  saveComic, 
  deleteComic 
} from './firebase';

export default function App() {
  const [comics, setComics] = useState([]);
  const [newComicName, setNewComicName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({ status: 'connecting', message: 'Conectando...' });
  
  // Estado para Edição do Nome e Exclusão
  const [editingComic, setEditingComic] = useState(null);
  const [editNameInput, setEditNameInput] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const inputRef = useRef(null);

  // Iniciar sincronização em tempo real (Firestore com fallback para LocalStorage)
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

  // Adicionar nova HQ
  const handleAddComic = async (e) => {
    e?.preventDefault();
    const trimmed = newComicName.trim();
    if (!trimmed) return;

    const newComic = {
      id: 'comic_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: trimmed,
      ownedNumbers: [],
      isCompleted: false,
      completedUntil: null,
      highestOpenedChunk: 10, // Inicia com o primeiro bloco (1 a 10)
      expandedChunks: [], // Chunks explicitamente expandidos pelo usuário
      createdAt: new Date().toISOString()
    };

    const updated = await saveComic(newComic);
    setComics(updated);
    setNewComicName('');
    inputRef.current?.focus();
  };

  // Alternar seleção de um número específico (ex: 1, 5, 10, 11)
  const handleToggleNumber = async (comic, num) => {
    const isOwned = comic.ownedNumbers?.includes(num);
    let newOwned = isOwned
      ? comic.ownedNumbers.filter(n => n !== num)
      : [...(comic.ownedNumbers || []), num];

    // Ordenar números para consistência
    newOwned.sort((a, b) => a - b);

    // Calcular até qual chunk deve estar aberto
    // Se clicou no número 10, abre 11..20; se clicou no 20, abre 21..30, etc.
    let currentChunkLimit = comic.highestOpenedChunk || 10;
    if (num >= currentChunkLimit) {
      // Abre a próxima dezena
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

    // Encerrar: determinar o maior número marcado ou 1 se nenhum estiver marcado
    const maxNum = comic.ownedNumbers && comic.ownedNumbers.length > 0 
      ? Math.max(...comic.ownedNumbers) 
      : 1;

    // Garante que todos até o maxNum estão marcados se for uma minissérie encerrada
    const completeRange = Array.from({ length: maxNum }, (_, i) => i + 1);

    const updatedComic = {
      ...comic,
      isCompleted: true,
      completedUntil: maxNum,
      ownedNumbers: completeRange,
      expandedChunks: [] // recolhe por padrão
    };

    const updated = await saveComic(updatedComic);
    setComics(updated);
  };

  // Iniciar modo de edição de nome
  const handleStartEdit = (comic) => {
    setEditingComic(comic);
    setEditNameInput(comic.name);
  };

  // Salvar alteração de nome
  const handleSaveEdit = async () => {
    if (!editingComic) return;
    const trimmed = editNameInput.trim();
    if (!trimmed) return;

    const updatedComic = {
      ...editingComic,
      name: trimmed
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

  // Filtragem e Ordenação Alfabética (A-Z)
  const filteredComics = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const result = comics.filter(c => c.name.toLowerCase().includes(query));
    // Ordenar A-Z ignorando acentos
    result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' }));
    return result;
  }, [comics, searchQuery]);

  // Estatísticas Rápidas
  const totalComics = comics.length;
  const totalIssuesOwned = useMemo(() => {
    return comics.reduce((acc, c) => acc + (c.ownedNumbers?.length || 0), 0);
  }, [comics]);

  // Formatar número com dois dígitos (ex: 01, 09, 10)
  const format2 = (n) => String(n).padStart(2, '0');

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* HEADER MOBILE-FIRST */}
      <header className="sticky top-0 z-30 bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-sm">
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
              <p className="text-[11px] text-slate-400">Controle Rápido de Coleções</p>
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
      <main className="flex-1 max-w-xl w-full mx-auto p-4 space-y-4">
        
        {/* BARRA DE ADICIONAR NOVO TÍTULO */}
        <section className="bg-[#1E293B] p-3 rounded-2xl border border-slate-700/60 shadow-xl">
          <form onSubmit={handleAddComic} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={newComicName}
              onChange={(e) => setNewComicName(e.target.value)}
              placeholder="Nome da HQ (ex: Batman, Homem-Aranha)..."
              className="flex-1 bg-slate-900/90 text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm transition"
            />
            <button
              type="submit"
              disabled={!newComicName.trim()}
              className="bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-1 transition shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden sm:inline">Adicionar</span>
            </button>
          </form>
        </section>

        {/* BUSCA RÁPIDA (QUANDO HOUVER ITENS) */}
        {comics.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título na coleção..."
              className="w-full bg-[#162032] text-white placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-800 text-xs focus:outline-none focus:border-slate-600 transition"
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
        )}

        {/* LISTAGEM DE QUADRINHOS */}
        <section className="space-y-3 pb-8">
          {filteredComics.length === 0 ? (
            <div className="bg-[#162032]/60 rounded-2xl border border-dashed border-slate-800 p-8 text-center space-y-2">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                {comics.length === 0 ? 'Nenhuma coleção cadastrada ainda' : 'Nenhuma HQ encontrada com esta busca'}
              </p>
              <p className="text-xs text-slate-500">
                {comics.length === 0 
                  ? 'Digite o nome do quadrinho acima para começar a marcar as edições!' 
                  : 'Tente buscar por outro termo ou limpe o filtro.'}
              </p>
            </div>
          ) : (
            filteredComics.map((comic) => (
              <ComicRow 
                key={comic.id} 
                comic={comic} 
                onToggleNumber={(num) => handleToggleNumber(comic, num)}
                onToggleChunkExpand={(chunkStart) => handleToggleChunkExpand(comic, chunkStart)}
                onToggleComplete={() => handleToggleCompleteSeries(comic)}
                onStartEdit={() => handleStartEdit(comic)}
                format2={format2}
              />
            ))
          )}
        </section>
      </main>

      {/* MODAL DE EDIÇÃO E EXCLUSÃO DO TÍTULO */}
      {editingComic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#1E293B] border border-slate-700 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4">
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

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Nome da HQ / Minissérie</label>
              <input
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                className="w-full bg-slate-900 text-white px-3.5 py-2.5 rounded-xl border border-slate-700 text-sm focus:outline-none focus:border-amber-500"
                autoFocus
              />
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
                  Salvar Nome
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
 * Componente de Linha de Quadrinho com Chunking de 10 em 10
 */
function ComicRow({ comic, onToggleNumber, onToggleChunkExpand, onToggleComplete, onStartEdit, format2 }) {
  const ownedSet = useMemo(() => new Set(comic.ownedNumbers || []), [comic.ownedNumbers]);
  const expandedChunksSet = useMemo(() => new Set(comic.expandedChunks || []), [comic.expandedChunks]);

  // Se estiver encerrado como minissérie, renderiza badge resumido especial
  if (comic.isCompleted && comic.completedUntil) {
    const endNum = comic.completedUntil;
    const isExpanded = expandedChunksSet.has('completed');

    return (
      <div className="bg-[#1E293B] border border-emerald-900/50 rounded-2xl p-3.5 shadow-md transition hover:border-emerald-700/60">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <button
              onClick={onStartEdit}
              className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5"
              title="Clique para editar o nome ou excluir"
            >
              <span>{comic.name}</span>
              <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onToggleComplete}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 transition font-semibold"
              title="Série Concluída. Clique para reabrir."
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Concluída</span>
            </button>
          </div>
        </div>

        {/* Resumo da Minissérie */}
        <div className="flex items-center flex-wrap gap-2 pt-1">
          <button
            onClick={() => onToggleChunkExpand('completed')}
            className="flex items-center gap-1.5 bg-emerald-900/40 hover:bg-emerald-800/40 border border-emerald-600/50 text-emerald-200 text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-sm"
            title="Clique para expandir/recolher os números individuais"
          >
            <span>01..{format2(endNum)}</span>
            <span className="text-[10px] text-emerald-400/80 font-normal">({endNum} edições)</span>
            {isExpanded ? <ChevronDown className="w-3 h-3 ml-1" /> : <ChevronRight className="w-3 h-3 ml-1" />}
          </button>
        </div>

        {/* Se o usuário expandiu a minissérie para conferir ou ajustar */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-5 sm:grid-cols-10 gap-2">
            {Array.from({ length: endNum }, (_, i) => i + 1).map((n) => {
              const isChecked = ownedSet.has(n);
              return (
                <button
                  key={n}
                  onClick={() => onToggleNumber(n)}
                  className={`w-9 h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 shadow-sm ${
                    isChecked
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-slate-500'
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

  // Lógica normal de blocos de 10 em 10 para séries contínuas
  // Descobrir até que dezena abrir:
  // Se o usuário já marcou algum número acima de highestOpenedChunk, ajusta.
  const highestOwned = comic.ownedNumbers && comic.ownedNumbers.length > 0 
    ? Math.max(...comic.ownedNumbers) 
    : 0;
  
  const currentChunkLimit = Math.max(comic.highestOpenedChunk || 10, Math.ceil(highestOwned / 10) * 10 || 10);

  // Gerar os blocos de dezenas: [1, 11, 21, ...]
  const chunkStarts = [];
  for (let start = 1; start <= currentChunkLimit; start += 10) {
    chunkStarts.push(start);
  }

  return (
    <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-3.5 shadow-md transition hover:border-slate-600">
      {/* CABEÇALHO DO ITEM: NOME DA HQ + BOTÃO ENCERRAR */}
      <div className="flex items-center justify-between mb-2.5 gap-2">
        <button
          onClick={onStartEdit}
          className="text-left font-bold text-sm text-white hover:text-amber-400 transition truncate flex items-center gap-1.5"
          title="Clique para editar o nome ou excluir"
        >
          <span>{comic.name}</span>
          <Edit3 className="w-3 h-3 text-slate-500 shrink-0" />
        </button>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onToggleComplete}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-300 transition font-medium"
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
          
          // Verificar quantos deste bloco estão marcados
          const ownedCountInChunk = chunkNumbers.filter(n => ownedSet.has(n)).length;
          const isChunkComplete = ownedCountInChunk === 10;
          const isManuallyExpanded = expandedChunksSet.has(chunkStart);

          // Se estiver 100% completo e não foi expandido manualmente: resume como 01..10
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

          // Caso contrário: exibe o bloco com as 10 bolinhas táteis
          return (
            <div key={chunkStart} className="bg-slate-900/60 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 font-medium">
                <span>Edições {format2(chunkStart)} a {format2(chunkEnd)}</span>
                <span className="text-amber-400 text-[10px]">
                  {ownedCountInChunk > 0 ? `${ownedCountInChunk}/10 selecionadas` : 'Disponíveis'}
                </span>
              </div>

              {/* As 10 bolinhas táteis */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {chunkNumbers.map((num) => {
                  const isChecked = ownedSet.has(num);
                  return (
                    <button
                      key={num}
                      onClick={() => onToggleNumber(num)}
                      className={`h-9 rounded-full text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${
                        isChecked
                          ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30'
                          : 'bg-slate-800/90 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white'
                      }`}
                      title={`Edição #${format2(num)}`}
                    >
                      {format2(num)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
