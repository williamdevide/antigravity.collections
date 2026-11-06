import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  KeyRound, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Copy, 
  Check, 
  ShieldAlert, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { updateUserProfile, changeUserPassword, setAuthPersistence, isKeepLoggedIn } from '../firebase';

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onOpenClearConfirm,
  onProfileUpdated 
}) {
  if (!isOpen) return null;

  const isGoogleUser = currentUser?.providerData?.some(p => p.providerId === 'google.com');

  // Estado do Nome
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState({ text: '', type: '' });

  // Estado da Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState({ text: '', type: '' });

  // Copiar UID
  const [copiedUid, setCopiedUid] = useState(false);

  // Manter usuário conectado
  const [keepLoggedIn, setKeepLoggedIn] = useState(() => isKeepLoggedIn());

  const handleToggleKeepLoggedIn = async (e) => {
    const checked = e.target.checked;
    setKeepLoggedIn(checked);
    await setAuthPersistence(checked);
  };

  const handleCopyUid = () => {
    if (!currentUser?.uid) return;
    navigator.clipboard.writeText(currentUser.uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  // Atualizar Nome
  const handleUpdateName = async (e) => {
    e.preventDefault();
    setNameMsg({ text: '', type: '' });
    if (!displayName.trim()) {
      setNameMsg({ text: 'Informe um nome válido.', type: 'error' });
      return;
    }

    setSavingName(true);
    try {
      await updateUserProfile(displayName.trim());
      setNameMsg({ text: 'Nome atualizado com sucesso!', type: 'success' });
      onProfileUpdated?.();
    } catch (err) {
      console.warn('Erro ao atualizar nome:', err);
      setNameMsg({ text: 'Erro ao atualizar nome. Tente novamente.', type: 'error' });
    } finally {
      setSavingName(false);
    }
  };

  // Alterar Senha
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassMsg({ text: '', type: '' });

    if (!newPassword || newPassword.length < 6) {
      setPassMsg({ text: 'A senha deve possuir no mínimo 6 caracteres.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg({ text: 'As senhas não coincidem.', type: 'error' });
      return;
    }

    setSavingPass(true);
    try {
      await changeUserPassword(newPassword);
      setPassMsg({ text: 'Senha alterada com sucesso!', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.warn('Erro ao alterar senha:', err);
      if (err.code === 'auth/requires-recent-login') {
        setPassMsg({ text: 'Por segurança, faça login novamente antes de alterar a senha.', type: 'error' });
      } else {
        setPassMsg({ text: 'Erro ao alterar a senha. Tente novamente.', type: 'error' });
      }
    } finally {
      setSavingPass(false);
    }
  };

  const userInitial = displayName 
    ? displayName.charAt(0).toUpperCase() 
    : currentUser?.email 
    ? currentUser.email.charAt(0).toUpperCase() 
    : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn font-sans">
      <div className="bg-[#0D1527] border border-slate-800 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Meu Perfil</h3>
              <p className="text-[11px] text-slate-400">Gerencie suas credenciais e coleção</p>
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

        {/* Resumo da Conta */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              userInitial
            )}
          </div>
          <div className="overflow-hidden flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white truncate">
                {displayName || 'Colecionador Sem Nome'}
              </h4>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                isGoogleUser 
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/30' 
                  : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {isGoogleUser ? 'Google Auth' : 'E-mail / Senha'}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{currentUser?.email || 'Sem e-mail associado'}</span>
            </p>
            {currentUser?.uid && (
              <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                <span className="font-mono truncate">UID: {currentUser.uid}</span>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="hover:text-amber-400 transition"
                  title="Copiar UID"
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Formulário: Atualizar Nome de Exibição */}
        <form onSubmit={handleUpdateName} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>Atualizar Nome de Exibição</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Seu nome"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={savingName}
              className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95 disabled:opacity-50 shrink-0"
            >
              {savingName ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar'}
            </button>
          </div>

          {nameMsg.text && (
            <p className={`text-[11px] flex items-center gap-1 ${nameMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {nameMsg.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              <span>{nameMsg.text}</span>
            </p>
          )}
        </form>

        {/* Formulário: Trocar Senha (apenas para usuários com e-mail/senha) */}
        {!isGoogleUser && (
          <form onSubmit={handleChangePassword} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alterar Senha de Acesso</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nova senha (min. 6 carac.)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmar nova senha"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {passMsg.text ? (
                <p className={`text-[11px] flex items-center gap-1 ${passMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {passMsg.type === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{passMsg.text}</span>
                </p>
              ) : <div />}
              <button
                type="submit"
                disabled={savingPass}
                className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50 shrink-0"
              >
                {savingPass ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Atualizar Senha'}
              </button>
            </div>
          </form>
        )}

        {/* Sessão e Conexão Contínua */}
        <div className="p-3.5 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Manter usuário conectado</span>
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                Permanece logado ao fechar o navegador. Ao reabrir o sistema, entra direto na sua conta.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={handleToggleKeepLoggedIn}
                className="w-4 h-4 rounded border-slate-700 text-amber-500 focus:ring-amber-500 bg-slate-950"
              />
            </label>
          </div>
        </div>

        {/* Zona de Perigo: Zerar Minha Coleção */}
        <div className="border border-rose-500/40 bg-rose-500/5 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Zona de Risco: Zerar Coleção</h4>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Deseja reiniciar seu catálogo do zero? Esta ação apagará permanentemente todas as suas HQs, edições marcadas e vínculos de capa da sua conta.
          </p>
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenClearConfirm}
              className="py-2 px-3 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-rose-600/20 active:scale-95 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Zerar Minha Coleção...</span>
            </button>
          </div>
        </div>

        {/* Botão Fechar Rodapé */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

