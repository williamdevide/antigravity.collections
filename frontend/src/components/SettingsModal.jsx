import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Palette, 
  Check, 
  RotateCcw, 
  Save, 
  Eye, 
  Pencil, 
  ScanEye, 
  Sliders, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export const COLOR_PRESETS = [
  {
    id: 'dark-slate',
    name: 'Dark Slate (Padrão)',
    description: 'Estética clássica de alto contraste e legibilidade',
    colors: {
      viewModeBg: '#070B14',
      editModeBg: '#0c1e38',
      coversModeBg: '#0b1220'
    }
  },
  {
    id: 'dark-navy',
    name: 'Dark Navy (Oceano)',
    description: 'Tons náuticos profundos com toques de azul petróleo',
    colors: {
      viewModeBg: '#0a192f',
      editModeBg: '#112240',
      coversModeBg: '#020c1b'
    }
  },
  {
    id: 'deep-purple',
    name: 'Deep Purple (Galáxia)',
    description: 'Violeta e lilás moderno com ambientação cósmica',
    colors: {
      viewModeBg: '#130924',
      editModeBg: '#27104d',
      coversModeBg: '#1e0836'
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk (Neon)',
    description: 'Fundo ultra-escuro para realçar luzes neon de status',
    colors: {
      viewModeBg: '#090d16',
      editModeBg: '#16122c',
      coversModeBg: '#0c192c'
    }
  },
  {
    id: 'charcoal',
    name: 'Charcoal (Minimalista)',
    description: 'Preto puro e grafite neutro tipo OLED dark mode',
    colors: {
      viewModeBg: '#121212',
      editModeBg: '#1e1e1e',
      coversModeBg: '#181818'
    }
  }
];

export const DEFAULT_USER_SETTINGS = {
  viewModeBg: '#070B14',
  editModeBg: '#0c1e38',
  coversModeBg: '#0b1220',
  density: 'normal',
  hapticFeedback: true
};

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentSettings, 
  onSaveSettings 
}) {
  const [settings, setSettings] = useState(() => ({
    ...DEFAULT_USER_SETTINGS,
    ...(currentSettings || {})
  }));

  const [selectedPreset, setSelectedPreset] = useState(() => {
    const match = COLOR_PRESETS.find(p => 
      p.colors.viewModeBg.toLowerCase() === currentSettings?.viewModeBg?.toLowerCase() &&
      p.colors.editModeBg.toLowerCase() === currentSettings?.editModeBg?.toLowerCase()
    );
    return match ? match.id : null;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleApplyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setSettings(prev => ({
      ...prev,
      ...preset.colors
    }));
  };

  const handleCustomColorChange = (key, value) => {
    setSelectedPreset(null);
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetDefaults = () => {
    setSelectedPreset('dark-slate');
    setSettings(DEFAULT_USER_SETTINGS);
  };

  const handleSave = () => {
    onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#0D1527] border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Configurações Visuais</h3>
              <p className="text-[11px] text-slate-400">Personalize as cores de fundo e temas da interface</p>
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

        {/* 1. Presets Elegantes (1-Clique) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Presets de Paletas Prontas</span>
            </label>
            <span className="text-[10px] text-slate-500">Toque para selecionar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-3 rounded-2xl border text-left transition active:scale-98 cursor-pointer relative overflow-hidden ${
                    isSelected 
                      ? 'border-amber-400 bg-amber-500/10 shadow-md shadow-amber-500/10' 
                      : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white">{preset.name}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mb-2.5">
                    {preset.description}
                  </p>
                  {/* Amostras das 3 cores */}
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-sm" 
                      style={{ backgroundColor: preset.colors.viewModeBg }}
                      title="Consulta"
                    />
                    <div 
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-sm" 
                      style={{ backgroundColor: preset.colors.editModeBg }}
                      title="Edição"
                    />
                    <div 
                      className="w-5 h-5 rounded-md border border-slate-700 shadow-sm" 
                      style={{ backgroundColor: preset.colors.coversModeBg }}
                      title="Consulta Capas"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Seletores Livres de Cor por Modo */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personalização Livre de Cores de Fundo</span>
          </label>

          <div className="space-y-2.5 text-xs">
            {/* Cor Modo Consulta */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Modo Consulta</span>
                  <span className="text-[10px] text-slate-400 block">Fundo principal de leitura</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  value={settings.viewModeBg}
                  onChange={(e) => handleCustomColorChange('viewModeBg', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={settings.viewModeBg}
                  onChange={(e) => handleCustomColorChange('viewModeBg', e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-[11px] text-white"
                />
              </div>
            </div>

            {/* Cor Modo Edição */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Pencil className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Modo Edição</span>
                  <span className="text-[10px] text-slate-400 block">Fundo durante inclusões e ajustes</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  value={settings.editModeBg}
                  onChange={(e) => handleCustomColorChange('editModeBg', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={settings.editModeBg}
                  onChange={(e) => handleCustomColorChange('editModeBg', e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-[11px] text-white"
                />
              </div>
            </div>

            {/* Cor Modo Consulta Capas */}
            <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <ScanEye className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-white block">Modo Consulta Capa</span>
                  <span className="text-[10px] text-slate-400 block">Fundo da galeria de cards compactos</span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <input
                  type="color"
                  value={settings.coversModeBg}
                  onChange={(e) => handleCustomColorChange('coversModeBg', e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <input
                  type="text"
                  value={settings.coversModeBg}
                  onChange={(e) => handleCustomColorChange('coversModeBg', e.target.value)}
                  className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-center font-mono text-[11px] text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Densidade e Opções Adicionais */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Densidade e Resposta Visual</span>
          </label>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'compact', label: 'Compacto' },
              { id: 'normal', label: 'Normal' },
              { id: 'relaxed', label: 'Amplo' }
            ].map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, density: item.id }))}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  settings.density === item.id 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-slate-500" />
              <span>Feedback Tátil (Vibração ao tocar)</span>
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hapticFeedback}
                onChange={(e) => setSettings(prev => ({ ...prev, hapticFeedback: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>
        </div>

        {/* Rodapé com Ações */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

