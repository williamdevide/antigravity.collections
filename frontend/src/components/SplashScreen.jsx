import React, { useEffect, useState } from 'react';
import { BookOpen, Sparkles, Cloud, Database } from 'lucide-react';
import { APP_NAME, APP_VERSION } from '../version';

export default function SplashScreen({ 
  progress = 0, 
  statusMessage = 'Carregando suas coleções...', 
  isComplete = false 
}) {
  const [displayProgress, setDisplayProgress] = useState(10);
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    // Garante avanço suave e fluido da barra visual
    const target = Math.max(10, Math.min(100, progress));
    setDisplayProgress(prev => Math.max(prev, target));
  }, [progress]);

  useEffect(() => {
    if (isComplete) {
      setDisplayProgress(100);
      const timer = setTimeout(() => {
        setFadingOut(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070B14] text-white p-6 transition-opacity duration-500 font-sans select-none ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Container Central */}
      <div className="flex flex-col items-center text-center max-w-xs w-full space-y-6 relative z-10">
        {/* Logotipo com Efeito Glow */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-300 text-slate-950 flex items-center justify-center shadow-2xl shadow-amber-500/30 transform hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-10 h-10 text-slate-950 stroke-[2.2]" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
          </span>
        </div>

        {/* Nome do Sistema e Slogan */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight">
              {APP_NAME}
            </h1>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Controle Ágil de Coleções
          </p>
        </div>

        {/* Barra de Progresso Customizada */}
        <div className="w-full space-y-2 pt-2">
          <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80 p-0.5 relative shadow-inner">
            <div 
              style={{ width: `${displayProgress}%` }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)] transition-all duration-300 ease-out"
            />
          </div>

          {/* Status e Porcentagem */}
          <div className="flex items-center justify-between text-[11px] px-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5 truncate max-w-[200px]">
              <Database className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate">{statusMessage}</span>
            </span>
            <span className="text-amber-400 font-mono font-bold">
              {Math.round(displayProgress)}%
            </span>
          </div>
        </div>

        {/* Mensagem Inferior */}
        <p className="text-[10px] text-slate-500 flex items-center gap-1">
          <Cloud className="w-3 h-3 text-slate-600" />
          Sincronizando banco de dados em tempo real
        </p>
      </div>
    </div>
  );
}
