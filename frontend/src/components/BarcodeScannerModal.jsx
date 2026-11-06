import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, RefreshCw, Zap } from 'lucide-react';

export default function BarcodeScannerModal({ isOpen, onClose, onScanSuccess }) {
  if (!isOpen) return null;

  const [scanError, setScanError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'interactive-barcode-reader';

  useEffect(() => {
    let isMounted = true;
    setIsInitializing(true);
    setScanError('');

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = html5QrCode;

        const config = {
          fps: 15,
          qrbox: { width: 260, height: 160 },
          aspectRatio: 1.0
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            // Sucesso na leitura do código de barras
            try {
              if (navigator.vibrate) {
                navigator.vibrate([40, 30, 40]);
              }
            } catch {}
            
            // Para o leitor e envia o resultado
            html5QrCode.stop().then(() => {
              html5QrCode.clear();
              onScanSuccess(decodedText);
            }).catch(() => {
              onScanSuccess(decodedText);
            });
          },
          () => {
            // Frame sem código detectado (esperado)
          }
        );

        if (isMounted) setIsInitializing(false);
      } catch (err) {
        console.warn('Erro ao inicializar câmera para código de barras:', err);
        if (isMounted) {
          setScanError('Não foi possível acessar a câmera. Verifique as permissões do navegador ou digite o ISBN manualmente.');
          setIsInitializing(false);
        }
      }
    };

    // Pequeno timeout para garantir que o container DOM esteja montado
    const timer = setTimeout(() => {
      startScanner();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            html5QrCodeRef.current.stop().then(() => {
              html5QrCodeRef.current?.clear();
            }).catch(() => {});
          } else {
            html5QrCodeRef.current.clear();
          }
        } catch {}
      }
    };
  }, []);

  const handleClose = () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      html5QrCodeRef.current.stop().then(() => {
        html5QrCodeRef.current?.clear();
        onClose();
      }).catch(() => onClose());
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#12192B] border border-amber-500/40 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Header do Scanner */}
        <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Escanear Código de Barras (ISBN)</span>
          </h3>
          <button 
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Aponte a câmera para o código de barras (EAN-13 / ISBN) no verso da sua HQ:
        </p>

        {/* Viewfinder e Container da Câmera */}
        <div className="relative w-full aspect-square bg-black rounded-xl overflow-hidden border border-slate-700 flex flex-col items-center justify-center">
          <div id={scannerContainerId} className="w-full h-full" />

          {/* Mira de Escaneamento Animada */}
          {!scanError && !isInitializing && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-64 h-36 border-2 border-amber-400/80 rounded-lg relative shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                {/* Linha Laser Animada */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_8px_#f59e0b] animate-bounce" />
                <span className="absolute -top-6 left-0 right-0 text-center text-[10px] font-mono text-amber-300 uppercase tracking-wider">
                  Alinhe o Código Aqui
                </span>
              </div>
            </div>
          )}

          {isInitializing && (
            <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-2 text-slate-400">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
              <span className="text-xs">Iniciando câmera...</span>
            </div>
          )}

          {scanError && (
            <div className="absolute inset-0 bg-slate-950/95 p-4 flex flex-col items-center justify-center text-center gap-2.5 text-amber-300">
              <AlertCircle className="w-8 h-8 text-amber-400" />
              <p className="text-xs text-slate-300 font-medium">{scanError}</p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition"
              >
                Digitar ISBN Manualmente
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
