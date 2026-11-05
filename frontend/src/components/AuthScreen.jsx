import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Loader2,
  ShieldCheck,
  Compass,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  Globe
} from 'lucide-react';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  loginWithGoogleRedirect,
  checkRedirectResult,
  resetPassword 
} from '../firebase';
import { APP_NAME, APP_VERSION } from '../version';

export default function AuthScreen({ onGuestLogin }) {
  // Modos: 'login' | 'register' | 'forgot'
  const [mode, setMode] = useState('login');

  // Campos do formulário
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('hq_tracker_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('hq_tracker_remembered_email'));
    } catch {
      return false;
    }
  });
  const [showPassword, setShowPassword] = useState(false);

  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorDetail, setErrorDetail] = useState(null);
  const [copiedDomain, setCopiedDomain] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Processar resultado de autenticação por redirecionamento caso ocorra
  useEffect(() => {
    checkRedirectResult().catch((err) => {
      console.warn('Erro ao processar retorno de redirect Google:', err);
      handleGoogleError(err);
    });
  }, []);

  // Salva ou remove o e-mail lembrado
  const persistRememberEmail = (emailToRemember) => {
    try {
      if (rememberMe && emailToRemember) {
        localStorage.setItem('hq_tracker_remembered_email', emailToRemember);
      } else {
        localStorage.removeItem('hq_tracker_remembered_email');
      }
    } catch {
      // Ignora erro de storage restrito
    }
  };

  // Tratamento Inteligente e Diagnóstico de Erros do Google Auth
  const handleGoogleError = (err) => {
    console.warn('Erro ao autenticar com Google:', err);
    const code = err?.code || '';
    const currentDomain = typeof window !== 'undefined' ? window.location.hostname : '';

    if (code === 'auth/unauthorized-domain') {
      setErrorMsg(`Domínio '${currentDomain}' não está autorizado no Firebase Authentication.`);
      setErrorDetail({
        type: 'unauthorized-domain',
        domain: currentDomain,
        code: code,
        message: 'O Firebase bloqueou este domínio por segurança até que seja cadastrado no Console.'
      });
    } else if (code === 'auth/operation-not-allowed') {
      setErrorMsg('O provedor de login do Google não está ativado no Firebase Console.');
      setErrorDetail({
        type: 'operation-not-allowed',
        code: code,
        message: 'Acesse o Firebase Console e ative o provedor Google na aba Sign-in method.'
      });
    } else if (code === 'auth/popup-blocked') {
      setErrorMsg('A janela popup foi bloqueada pelo navegador.');
      setErrorDetail({
        type: 'popup-blocked',
        code: code,
        message: 'O navegador bloqueou a abertura do popup. Utilize o botão de redirecionamento.'
      });
    } else if (code === 'auth/popup-closed-by-user') {
      setErrorMsg('A janela de login com o Google foi fechada antes de concluir.');
      setErrorDetail(null);
    } else if (code === 'auth/cancelled-popup-request') {
      setErrorMsg('Operação de login com o Google cancelada.');
      setErrorDetail(null);
    } else {
      setErrorMsg(err?.message || 'Falha ao autenticar com o Google.');
      setErrorDetail({
        type: 'generic',
        code: code,
        message: err?.message || 'Erro inesperado'
      });
    }
  };

  // Login com Google via Popup
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setErrorDetail(null);
    setSuccessMsg('');
    setLoading(true);
    try {
      await loginWithGoogle();
      // O listener onAuthChange atualizará a aplicação
    } catch (err) {
      handleGoogleError(err);
    } finally {
      setLoading(false);
    }
  };

  // Login com Google via Redirecionamento (Alternativa para mobile ou popup bloqueado)
  const handleGoogleRedirectLogin = async () => {
    setErrorMsg('');
    setErrorDetail(null);
    setSuccessMsg('');
    setLoading(true);
    try {
      await loginWithGoogleRedirect();
    } catch (err) {
      handleGoogleError(err);
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedDomain(true);
      setTimeout(() => setCopiedDomain(false), 2500);
    } catch {
      // Fallback
    }
  };

  // Submissão do Formulário de E-mail
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Informe um endereço de e-mail válido.');
      return;
    }

    // Modo Recuperação de Senha
    if (mode === 'forgot') {
      setLoading(true);
      try {
        await resetPassword(cleanEmail);
        setSuccessMsg(`Instruções de recuperação de senha foram enviadas para ${cleanEmail}. Verifique sua caixa de entrada.`);
      } catch (err) {
        console.warn('Erro no resetPassword:', err);
        if (err.code === 'auth/user-not-found') {
          setErrorMsg('Nenhuma conta encontrada com este e-mail.');
        } else if (err.code === 'auth/invalid-email') {
          setErrorMsg('O formato do e-mail é inválido.');
        } else {
          setErrorMsg('Não foi possível enviar o link de recuperação. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // Validação de senha para Login e Cadastro
    if (!password || password.length < 6) {
      setErrorMsg('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(cleanEmail, password);
        persistRememberEmail(cleanEmail);
      } else if (mode === 'register') {
        const cleanName = displayName.trim() || cleanEmail.split('@')[0];
        await registerWithEmail(cleanEmail, password, cleanName);
        persistRememberEmail(cleanEmail);
      }
    } catch (err) {
      console.warn('Erro na autenticação:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (err.code === 'auth/user-not-found') {
        setErrorMsg('Usuário não cadastrado. Clique em "Cadastre-se" para criar sua conta.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Este e-mail já está em uso por outra conta.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('A senha escolhida é muito fraca. Utilize ao menos 6 caracteres.');
      } else {
        setErrorMsg(err.message || 'Erro ao realizar login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] flex flex-col justify-center items-center px-4 py-8 font-sans text-slate-100 relative overflow-hidden">
      {/* Luzes de fundo decorativas */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Marca & Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 mb-1">
            <BookOpen className="w-8 h-8 text-slate-950" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {APP_NAME}
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
              v{APP_VERSION}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto">
            Seu acervo de HQs seguro na nuvem com capas automáticas da Panini
          </p>
        </div>

        {/* Card Principal */}
        <div className="bg-[#0D1527]/90 border border-slate-800/90 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-md space-y-5">
          {/* Seletor de Abas (Login / Cadastro) */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 p-1 bg-slate-950/70 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg transition ${
                  mode === 'login'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
                className={`py-2 rounded-lg transition ${
                  mode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {/* Botão de Autenticação com o Google */}
          {mode !== 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm transition shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {/* SVG Oficial Google */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Entrar com Conta Google</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-800 w-full" />
                <span className="bg-[#0D1527] px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  ou com seu e-mail
                </span>
                <div className="border-t border-slate-800 w-full" />
              </div>
            </div>
          )}

          {/* Alertas de Erro ou Sucesso */}
          {errorMsg && (
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2 animate-shake">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span className="truncate">{errorMsg}</span>
                </div>
                {errorDetail?.code && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 shrink-0">
                    {errorDetail.code}
                  </span>
                )}
              </div>

              {/* Caixa de Diagnóstico Inteligente para Domínio Não Autorizado na Vercel */}
              {errorDetail?.type === 'unauthorized-domain' && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 text-xs space-y-3 animate-fadeIn">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-xs">
                        Como liberar o login no seu domínio da Vercel:
                      </h4>
                      <p className="text-[11px] text-amber-300/90 leading-relaxed">
                        O Firebase exige que o endereço onde a aplicação está rodando esteja na lista de domínios autorizados.
                      </p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 block font-mono">Domínio Atual:</span>
                      <span className="text-xs font-mono font-bold text-white truncate block">
                        {errorDetail.domain || window.location.hostname}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(errorDetail.domain || window.location.hostname)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 transition shrink-0 active:scale-95 cursor-pointer"
                    >
                      {copiedDomain ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedDomain ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-300">
                    <p className="font-semibold text-white">Passo a passo no Firebase Console:</p>
                    <ol className="list-decimal list-inside space-y-1 text-slate-300">
                      <li>Acesse <b>Authentication &gt; Settings &gt; Authorized domains</b>.</li>
                      <li>Clique em <b>Add domain</b> (Adicionar domínio).</li>
                      <li>Cole <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">{errorDetail.domain || window.location.hostname}</code> (ou simplesmente <code className="bg-slate-900 px-1 py-0.5 rounded text-amber-300 font-mono">vercel.app</code>).</li>
                      <li>Clique em <b>Save</b>. Pronto! O login com Google passará a funcionar imediatamente.</li>
                    </ol>
                  </div>

                  <a
                    href="https://console.firebase.google.com/project/antigravitycollections/authentication/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 font-bold text-[11px] transition shadow-sm cursor-pointer"
                  >
                    <span>Abrir Configurações do Firebase Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Opção de Redirecionamento quando popup é bloqueado */}
              {errorDetail?.type === 'popup-blocked' && (
                <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/40 text-cyan-200 text-xs space-y-2.5 animate-fadeIn">
                  <p className="text-[11px] text-cyan-300">
                    Seu navegador impediu a abertura da janela popup. Você pode autenticar por redirecionamento direto de página:
                  </p>
                  <button
                    type="button"
                    onClick={handleGoogleRedirectLogin}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
                  >
                    <span>Entrar por Redirecionamento</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400 font-medium block">
                  Nome Completo ou Apelido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ex: Stan Lee"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-medium block">
                Endereço de E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-medium block">
                    Senha
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                      className="text-[11px] text-amber-400 hover:text-amber-300 transition"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-9 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Lembrar meu e-mail</span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold text-xs sm:text-sm transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Aguarde...</span>
                </>
              ) : mode === 'login' ? (
                <>
                  <span>Entrar no HQ Tracker</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : mode === 'register' ? (
                <>
                  <span>Criar Minha Conta</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Enviar Link de Recuperação</span>
                  <Mail className="w-4 h-4" />
                </>
              )}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white transition pt-2 block"
              >
                Voltar para o Login
              </button>
            )}
          </form>
        </div>

        {/* Modo Visitante Local / Fallback */}
        {onGuestLogin && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={onGuestLogin}
              className="text-xs text-slate-500 hover:text-amber-400 transition flex items-center justify-center gap-1.5 mx-auto"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Acessar temporariamente como Convidado Local</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

