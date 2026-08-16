import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sparkles, ArrowRight, UserCheck, Code2, User, Lock, ShieldCheck, ShieldAlert, X, HelpCircle, CheckCircle2, AlertTriangle, KeyRound } from 'lucide-react';
import { SavedAccount } from '../types';
const eyeLogoImg = 'https://i.ibb.co/zTCgk7Mk/8860a99d3dc1ae4311adacbc72ed147a.jpg';

interface LoginViewProps {
  onLogin: (ra: string, pass: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string;
  onOpenAccounts: () => void;
  onOpenEmojiChallenge: () => void;
  isVerified: boolean;
  selectedAccount?: SavedAccount | null;
  onOpenBakaiProfile?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isLoading,
  errorMessage,
  onOpenAccounts,
  onOpenEmojiChallenge,
  isVerified,
  selectedAccount,
  onOpenBakaiProfile
}) => {
  const [ra, setRa] = useState('');
  const [uf, setUf] = useState('SP');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);
  const [showRaHelp, setShowRaHelp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      if (selectedAccount.ra) {
        // Se a conta salva já contiver UF no final, extrai ou usa direto
        const cleanRa = selectedAccount.ra;
        const matchUf = cleanRa.match(/([a-zA-Z]{2})$/);
        if (matchUf) {
          setUf(matchUf[1].toUpperCase());
          setRa(cleanRa.slice(0, -2));
        } else {
          setRa(cleanRa);
        }
      }
      if (selectedAccount.senha) setSenha(selectedAccount.senha);
    }
  }, [selectedAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    const finalRa = ra.toLowerCase().endsWith(uf.toLowerCase()) ? ra : `${ra}${uf.toLowerCase()}`;
    onLogin(finalRa, senha);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState) {
      setIsCapsLockOn(e.getModifierState('CapsLock'));
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-3 sm:p-6 bg-transparent relative z-10 overflow-y-auto">
      {/* Welcome Entrance Toast Banner */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed top-5 z-50 bg-[#09090b]/95 border border-white/20 backdrop-blur-2xl px-5 py-3 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex items-center gap-3 text-white max-w-sm sm:max-w-md"
          >
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/30 shadow-md shrink-0 bg-black relative group">
              <img src={eyeLogoImg} alt="Astral Eye" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-black tracking-wide text-white flex items-center gap-1.5">
                Bem-vindo ao Shuziro Astral Hub
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="text-[11px] font-medium text-zinc-300 mt-0.5">
                Hub Integrado da <span className="text-white font-bold">Sala do Futuro</span>
              </div>
            </div>
            <button
              onClick={() => setShowWelcome(false)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphism Login Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-[#09090b]/90 backdrop-blur-2xl border border-white/15 hover:border-white/30 rounded-3xl p-5 sm:p-7 max-w-sm sm:max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden my-auto transform-gpu transition-all"
      >
        {/* Top Metallic Rainbow Shimmer Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-400 via-emerald-400 to-indigo-500" />

        {/* Header Branding */}
        <div className="text-center mb-5">
          <div className="relative inline-block">
            {/* Ambient Aura Ring behind logo */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-red-500/30 to-zinc-400/30 rounded-2xl blur-md opacity-75 animate-pulse" />
            
            <div className="relative inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-white/30 shadow-2xl shadow-black/90 transition-transform duration-300 hover:scale-105 bg-black group cursor-pointer">
              <img src={eyeLogoImg} alt="Astral Eye Logo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-3 flex items-center justify-center gap-1.5">
            Shuziro<span className="text-zinc-400 font-extrabold">Astral</span> Hub
          </h1>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Sistema Integrado da <strong className="text-white">Sala do Futuro</strong>
          </div>
        </div>

        {/* Quick Access Button for Saved Accounts */}
        <div className="mb-4">
          <button
            type="button"
            onClick={onOpenAccounts}
            className="w-full p-3.5 bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 hover:border-white/30 rounded-2xl flex items-center justify-between text-left transition-all duration-200 shadow-md group cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-3 z-10">
              <div className="w-9 h-9 rounded-xl bg-white text-black font-extrabold flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <UserCheck className="w-4 h-4 text-black" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  Contas Salvas
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 font-mono font-bold tracking-wider">
                    Atalho
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Selecione e entre com 1 clique</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-1 shrink-0 z-10" />
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* RA Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-zinc-400" />
                RA / Usuário SED
              </label>
              <button
                type="button"
                onClick={() => setShowRaHelp(!showRaHelp)}
                className="text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <HelpCircle className="w-3 h-3" />
                Como preencher?
              </button>
            </div>

            <AnimatePresence>
              {showRaHelp && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-2 p-2.5 bg-zinc-900/90 border border-zinc-700 rounded-xl text-[11px] text-zinc-300 space-y-1"
                >
                  <p>• O RA deve conter os zeros à esquerda e a sigla do estado no final (ex: <strong className="text-white">000123456789sp</strong>).</p>
                  <p>• Digite a mesma conta e senha utilizadas no CMSP / Secretaria Escolar Digital.</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={ra}
                  onChange={(e) => setRa(e.target.value)}
                  placeholder="Ex.: 000123456789"
                  required
                  className="w-full pl-3.5 pr-9 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white/20 rounded-xl text-white text-xs font-medium placeholder-zinc-500 focus:outline-none transition-all shadow-inner font-mono"
                />
                {ra && (
                  <button
                    type="button"
                    onClick={() => setRa('')}
                    className="absolute right-2.5 text-zinc-500 hover:text-zinc-300 p-1 cursor-pointer"
                    title="Limpar campo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* UF Selector */}
              <div className="w-20 shrink-0">
                <select
                  value={uf}
                  onChange={(e) => setUf(e.target.value)}
                  className="w-full py-2.5 px-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white/20 rounded-xl text-white text-xs font-bold font-mono focus:outline-none transition-all shadow-inner cursor-pointer text-center uppercase"
                >
                  <option value="SP">SP</option>
                  <option value="RJ">RJ</option>
                  <option value="MT">MT</option>
                  <option value="GO">GO</option>
                  <option value="PR">PR</option>
                </select>
              </div>
            </div>
          </div>

          {/* Senha Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                Senha
              </label>
              {isCapsLockOn && (
                <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" />
                  Caps Lock Ativado
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <input
                type={showPass ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua senha do CMSP"
                required
                className="w-full pl-3.5 pr-10 py-2.5 bg-zinc-900/90 border border-zinc-800 focus:border-white focus:ring-1 focus:ring-white/20 rounded-xl text-white text-xs font-medium placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-2.5 text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
                title={showPass ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Anti-Bot Verification Challenge */}
          <div>
            <button
              type="button"
              onClick={onOpenEmojiChallenge}
              className={`w-full py-2.5 px-3.5 rounded-xl border flex items-center justify-between transition-all duration-200 text-xs font-bold cursor-pointer ${
                isVerified
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-900/20'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-300 hover:border-zinc-600 hover:bg-zinc-800/80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isVerified ? (
                  <div className="w-5 h-5 rounded-lg bg-emerald-500 text-black flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                )}
                <span className="text-xs">
                  {isVerified ? 'Navegador Verificado (Anti-Bot Ativo)' : 'Clique para Verificar (Anti-Bot)'}
                </span>
              </div>
              
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                isVerified ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {isVerified ? 'OK' : 'Pendente'}
              </span>
            </button>
          </div>

          {/* Error Message Display with Animation */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-start gap-2.5 font-medium leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-200">{errorMessage}</div>
                <div className="text-[10px] text-red-400/90 mt-0.5">
                  Verifique se o RA contém o 'sp' no final e se a senha está correta.
                </div>
              </div>
            </motion.div>
          )}

          {/* Main Login Submit Button */}
          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading || !isVerified}
              className="w-full py-3 px-4 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black font-black rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/5 cursor-pointer disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando na SED...</span>
                </div>
              ) : (
                <>
                  <span>Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4 stroke-[3] group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Discord Community Button */}
        <div className="mt-3.5">
          <a
            href="https://discord.gg/VdnsPj8sA"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-3.5 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20 cursor-pointer block text-center"
          >
            <svg className="w-4 h-4 fill-current inline-block" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar na Comunidade Discord
          </a>
        </div>

        {/* Footer Credit */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenBakaiProfile}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-white/30 text-[10px] shadow-sm transition-all cursor-pointer group"
          >
            <Code2 className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white transition-colors" />
            <span className="text-zinc-400 font-medium group-hover:text-zinc-300">Feito com carinho por</span>
            <strong className="text-white font-black tracking-tight underline decoration-zinc-500 group-hover:decoration-white underline-offset-2">
              bakai Shuziro
            </strong>
          </button>
        </div>
      </motion.div>
    </div>
  );
};



