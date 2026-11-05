import React, { useState } from 'react';
import { 
  AlertOctagon, 
  Trash2, 
  X, 
  Loader2, 
  ShieldAlert 
} from 'lucide-react';

export default function ClearCollectionModal({ 
  isOpen, 
  onClose, 
  onConfirmClear, 
  isClearing 
}) {
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const isUnlocked = confirmText.trim() === 'ZERAR';

  const handleExecute = () => {
    if (!isUnlocked || isClearing) return;
    onConfirmClear();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-sans">
      <div className="bg-[#14080B] border-2 border-rose-600/80 w-full max-w-md rounded-3xl p-6 shadow-2xl shadow-rose-950/50 space-y-5 animate-scaleUp">
        {/* Cabeçalho de Alerta Máximo */}
        <div className="flex items-start gap-3.5 border-b border-rose-950/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-500 shrink-0 shadow-lg shadow-rose-600/30">
            <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] uppercase font-mono font-extrabold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Ação Irreversível
            </span>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Zerar Minha Coleção
            </h3>
            <p className="text-xs text-rose-300/80 mt-0.5">
              Confirmação de Alerta Máximo
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem Explicativa */}
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-rose-950/60">
          <p>
            Você está prestes a remover <strong className="text-rose-400 font-bold">TODAS AS HQs</strong>, 
            edições marcadas, títulos personalizados e capas vinculadas da sua conta na nuvem e no dispositivo.
          </p>
          <p className="text-rose-300/90 font-medium">
            Para autorizar esta exclusão permanente, digite a palavra de segurança 
            <span className="font-mono font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded mx-1 text-sm border border-rose-500/40">ZERAR</span> 
            no campo abaixo:
          </p>
        </div>

        {/* Campo de Confirmação Obrigatória */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Digite "ZERAR" para confirmar:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="Digite ZERAR"
            disabled={isClearing}
            className="w-full bg-slate-950 border-2 border-rose-950 focus:border-rose-500 rounded-xl px-4 py-3 text-center font-mono font-bold text-base text-rose-300 tracking-widest placeholder-slate-700 focus:outline-none transition"
            autoFocus
          />
        </div>

        {/* Ações */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isClearing}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleExecute}
            disabled={!isUnlocked || isClearing}
            className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-30 disabled:hover:bg-rose-600 text-white text-xs font-bold transition shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            {isClearing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Zerando...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Sim, Zerar Tudo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
