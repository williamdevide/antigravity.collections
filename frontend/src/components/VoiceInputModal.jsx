import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Tag, 
  Building2, 
  Hash, 
  ArrowRight,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { parseVoiceComicCommand } from '../services/voiceParser';

export default function VoiceInputModal({ 
  isOpen, 
  onClose, 
  existingComics = [], 
  onConfirmVoiceComic 
}) {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const recognitionRef = useRef(null);

  // Inicializa o reconhecimento de fala Web Speech API
  useEffect(() => {
    if (!isOpen) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = 0; i < event.results.length; i++) {
          currentText += event.results[i][0].transcript + ' ';
        }
        setTranscript(currentText.trim());
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permissão de acesso ao microfone foi negada pelo navegador.');
        } else if (event.error === 'no-speech') {
          // Nenhuma fala detectada no período
        } else {
          setErrorMsg(`Erro de voz: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Falha ao inicializar Web Speech API:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isOpen]);

  // Alterna gravação de voz
  const toggleListening = () => {
    if (!recognitionRef.current) return;
    setErrorMsg('');

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Erro ao iniciar gravação:', err);
      }
    }
  };

  // Parser em tempo real do comando falado ou digitado
  const parsed = React.useMemo(() => {
    if (!transcript.trim()) return null;
    return parseVoiceComicCommand(transcript);
  }, [transcript]);

  // Verifica se já existe uma HQ com o mesmo nome na coleção
  const matchedExistingComic = React.useMemo(() => {
    if (!parsed?.name) return null;
    const normalizedInput = parsed.name.toLowerCase().trim();
    return existingComics.find(c => c.name.toLowerCase().trim() === normalizedInput) || null;
  }, [parsed, existingComics]);

  if (!isOpen) return null;

  // Confirmar inclusão da HQ
  const handleConfirm = () => {
    if (!parsed || !parsed.name) return;
    onConfirmVoiceComic(parsed, matchedExistingComic);
    onClose();
  };

  // Carrega exemplo rápido
  const loadExample = (exampleText) => {
    setTranscript(exampleText);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#0D1527] border border-cyan-500/50 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-white">Entrada por Voz Inteligente</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PT-BR
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fale naturalmente para criar ou preencher edições da HQ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Microfone Central e Ondas de Áudio */}
        <div className="flex flex-col items-center justify-center py-4 bg-slate-950/70 border border-slate-800/90 rounded-2xl relative overflow-hidden space-y-3">
          {/* Anéis pulsantes quando gravando */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="w-24 h-24 rounded-full bg-cyan-500/20 animate-ping" />
              <span className="w-32 h-32 rounded-full bg-cyan-500/10 animate-pulse" />
            </div>
          )}

          {/* Botão Principal do Microfone */}
          <button
            type="button"
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer active:scale-95 z-10 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-500 to-rose-400 text-white shadow-rose-500/40 ring-4 ring-rose-500/30'
                : 'bg-gradient-to-tr from-cyan-500 to-blue-500 text-slate-950 shadow-cyan-500/30 hover:scale-105'
            }`}
            title={isListening ? 'Toque para pausar' : 'Toque para falar'}
          >
            {isListening ? (
              <Mic className="w-9 h-9 animate-bounce stroke-[2.5]" />
            ) : (
              <Mic className="w-9 h-9 stroke-[2.5]" />
            )}
          </button>

          <div className="text-center z-10">
            <p className="text-xs font-bold text-white">
              {isListening ? 'Ouvindo você... Fale agora!' : 'Toque no microfone para falar'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {speechSupported 
                ? 'Reconhecimento em Português do Brasil ativado' 
                : 'Seu navegador não suporta fala direta. Use o campo de texto abaixo.'}
            </p>
          </div>
        </div>

        {/* Mensagem de Erro se houver */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Transcrição em Tempo Real com Ajuste Manual */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Texto Transcrito (Editável):</span>
            </label>
            {transcript && (
              <button
                type="button"
                onClick={() => setTranscript('')}
                className="text-[11px] text-slate-500 hover:text-slate-300 transition"
              >
                Limpar
              </button>
            )}
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={2}
            placeholder="Exemplo falado: tenho a hq wolverine da marvel mensal das edições 01 até 09"
            className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition resize-none"
          />
        </div>

        {/* Sugestões Rápidas de Exemplos */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-slate-400 font-medium block">
            Toque em um exemplo para testar:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              "tenho a hq wolverine da marvel mensal das edições 01 até 09",
              "batman da dc mensal edições 1 a 12",
              "monstro do pantano vertigo especial edições 1 a 5",
              "demolidor marvel colecao edicoes 1 a 8"
            ].map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => loadExample(ex)}
                className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition truncate max-w-full"
              >
                "{ex}"
              </button>
            ))}
          </div>
        </div>

        {/* Card de Pré-visualização Estruturada */}
        {parsed && (
          <div className="bg-gradient-to-b from-slate-900/90 to-slate-950 border border-cyan-500/40 rounded-2xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Interpretação Estruturada</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {parsed.ownedNumbers.length} edições
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Título da HQ</span>
                <span className="font-black text-white text-sm truncate block mt-0.5">{parsed.name}</span>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Editora & Tipo</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-amber-400">{parsed.publisher}</span>
                  <span className="text-slate-600">•</span>
                  <span className="font-bold text-cyan-400">{parsed.type}</span>
                </div>
              </div>
            </div>

            {/* Edições Identificadas */}
            <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block uppercase font-bold mb-1">
                Edições a Marcar como Adquiridas:
              </span>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {parsed.ownedNumbers.map(n => (
                  <span 
                    key={n} 
                    className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm"
                  >
                    {String(n).padStart(2, '0')}
                  </span>
                ))}
              </div>
            </div>

            {/* Indicador de HQ Existente ou Nova */}
            {matchedExistingComic ? (
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <div>
                  <strong className="block font-bold">HQ Já Cadastrada na Coleção</strong>
                  <span className="text-[11px] text-emerald-200/80">
                    As novas edições serão mescladas sem perder o que você já marcou anteriormente.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-400" />
                <div>
                  <strong className="block font-bold">Nova HQ Identificada</strong>
                  <span className="text-[11px] text-blue-200/80">
                    Um novo card será adicionado no topo do seu catálogo.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rodapé com Ações */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!parsed || !parsed.name || !parsed.ownedNumbers.length}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-30 disabled:hover:from-cyan-500 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Confirmar e Cadastrar HQ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
