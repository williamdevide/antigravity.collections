import React from 'react';
import { 
  X, 
  User, 
  Settings, 
  Mic, 
  Image as ImageIcon, 
  LogOut, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  ChevronRight,
  HardDrive,
  Cloud
} from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../version';

export default function DrawerMenu({ 
  isOpen, 
  onClose, 
  currentUser, 
  coverStats, 
  onOpenProfile, 
  onOpenSettings, 
  onOpenVoice, 
  onOpenCoverSearch, 
  onLogout 
}) {
  if (!isOpen) return null;

  const userInitial = currentUser?.displayName 
    ? currentUser.displayName.charAt(0).toUpperCase() 
    : currentUser?.email 
    ? currentUser.email.charAt(0).toUpperCase() 
    : 'U';

  const userEmail = currentUser?.email || 'Modo Convidado Local';
  const userName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Visitante');

  return (
    <div className="fixed inset-0 z-50 flex animate-fadeIn font-sans">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Gaveta Lateral (Drawer) */}
      <div className="relative w-80 max-w-[85vw] bg-[#0c1424] border-r border-slate-800 p-5 shadow-2xl flex flex-col justify-between z-10 animate-slideRight">
        {/* Topo do Drawer */}
        <div className="space-y-6">
          {/* Header com Logo e Botão Fechar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">{APP_NAME}</h3>
                <span className="text-[10px] text-amber-400 font-mono">v{APP_VERSION}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card do Usuário Logado */}
          <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt={userName} className="w-full h-full rounded-xl object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <div className="overflow-hidden min-w-0 flex-1">
              <h4 className="text-xs font-bold text-white truncate leading-tight">{userName}</h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 leading-tight">{userEmail}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <Cloud className="w-2.5 h-2.5" />
                  <span>Sincronizado</span>
                </span>
              </div>
            </div>
          </div>

          {/* Lista de Navegação Principal */}
          <nav className="space-y-1.5">
            {/* 1. Meu Perfil */}
            <button
              type="button"
              onClick={() => { onClose(); onOpenProfile(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 text-slate-200 transition group active:scale-98 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:bg-amber-500/20 transition">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Meu Perfil</span>
                  <span className="text-[10px] text-slate-400 block">Dados da conta e zerar coleção</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
            </button>

            {/* 2. Entrada por Voz */}
            <button
              type="button"
              onClick={() => { onClose(); onOpenVoice(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 text-slate-200 transition group active:scale-98 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Entrada por Voz</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Novo!
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Cadastre HQs falando naturalmente</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
            </button>

            {/* 3. Configurações */}
            <button
              type="button"
              onClick={() => { onClose(); onOpenSettings(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 text-slate-200 transition group active:scale-98 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Configurações</span>
                  <span className="text-[10px] text-slate-400 block">Cores de fundo e preferências</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
            </button>

            {/* 4. Status de Busca de Capas */}
            <button
              type="button"
              onClick={() => { onClose(); onOpenCoverSearch(); }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800 border border-slate-800/60 text-slate-200 transition group active:scale-98 text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Status de Capas</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {coverStats?.percentage || 0}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Robô Panini em 2º plano</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
            </button>
          </nav>
        </div>

        {/* Rodapé do Drawer */}
        <div className="border-t border-slate-800/80 pt-4 space-y-3">
          {/* Botão Sair da Conta */}
          <button
            type="button"
            onClick={() => { onClose(); onLogout(); }}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-98"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>

          <div className="text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              Google Antigravity • SENAI Ourinhos Edition
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

