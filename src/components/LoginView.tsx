import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sparkles, FolderOpen, ArrowRight, UserCheck, KeyRound, ShieldCheck, Heart, Code2 } from 'lucide-react';
import { SavedAccount } from '../types';

interface LoginViewProps {
  onLogin: (ra: string, pass: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string;
  onOpenAccounts: () => void;
  onOpenEmojiChallenge: () => void;
  isVerified: boolean;
  selectedAccount?: SavedAccount | null;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  isLoading,
  errorMessage,
  onOpenAccounts,
  onOpenEmojiChallenge,
  isVerified,
  selectedAccount
}) => {
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [tokenCode, setTokenCode] = useState(() => localStorage.getItem('shuziro_token_code') || '');
  const [showPass, setShowPass] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      if (selectedAccount.ra) setRa(selectedAccount.ra);
      if (selectedAccount.senha) setSenha(selectedAccount.senha);
    }
  }, [selectedAccount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) return;
    localStorage.setItem('shuziro_token_code', tokenCode.trim().toUpperCase());
    onLogin(ra, senha);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black relative z-10 overflow-hidden select-none">
      {/* Welcome Entrance Toast Banner (Fades out after 3 seconds) */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed top-6 z-50 bg-[#121214]/95 border border-zinc-600 backdrop-blur-2xl px-6 py-3.5 rounded-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9)] flex items-center gap-3 text-white max-w-sm sm:max-w-md"
          >
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-extrabold shrink-0 shadow-md">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="text-xs font-black tracking-wide text-white">
                Bem-vindo ao Shuziro Astral Hub!
              </div>
              <div className="text-[11px] font-medium text-zinc-300 mt-0.5">
                O melhor Hub da Sala do Futuro 🚀
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Black/Gray/White Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Soft white/silver drifting orb - much more vibrant */}
        <motion.div
          animate={{
            x: [0, 100, -80, 0],
            y: [0, -120, 90, 0],
            scale: [1, 1.3, 0.85, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-[8%] left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-white/25 via-zinc-300/15 to-transparent blur-[70px]"
        />

        {/* Medium gray drifting orb - much more vibrant */}
        <motion.div
          animate={{
            x: [0, -110, 90, 0],
            y: [0, 100, -110, 0],
            scale: [1, 0.85, 1.25, 1],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[10%] right-[8%] w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-zinc-500/25 via-zinc-400/15 to-transparent blur-[80px]"
        />

        {/* Another distinct white/silver neon-like orb for extra contrast */}
        <motion.div
          animate={{
            x: [0, -60, 60, 0],
            y: [0, -60, -60, 0],
            scale: [0.9, 1.15, 0.95, 0.9],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          className="absolute top-1/3 right-[15%] w-[320px] h-[320px] rounded-full bg-gradient-to-bl from-white/20 via-zinc-200/10 to-transparent blur-[60px]"
        />

        {/* Deep dark charcoal/black accent orb providing depth */}
        <motion.div
          animate={{
            x: [0, 60, -60, 0],
            y: [0, 60, -60, 0],
            scale: [1, 1.1, 0.9, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full bg-gradient-to-r from-zinc-800/40 to-black/90 blur-[50px]"
        />

        {/* Subtle diagonal line pattern or moving grid */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] opacity-50 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" 
        />

        {/* Tiny floating silver particles - increased quantity and brightness */}
        {[...Array(30)].map((_, i) => {
          const size = Math.random() * 5 + 2; // 2px to 7px
          const delay = Math.random() * 6;
          const duration = Math.random() * 8 + 8; // 8s to 16s
          const startLeft = `${Math.random() * 100}%`;
          const startTop = `${Math.random() * 100}%`;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0.1, y: 0 }}
              animate={{
                opacity: [0.1, 0.9, 0.1],
                y: [-40, -180],
                x: [0, Math.random() * 40 - 20],
              }}
              transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute bg-gradient-to-r from-white via-zinc-100 to-zinc-300 rounded-full"
              style={{
                width: size,
                height: size,
                left: startLeft,
                top: startTop,
                filter: 'blur(0.3px)',
              }}
            />
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 260, damping: 25 }}
        className="bg-[#09090b]/95 backdrop-blur-2xl border border-[#27272a] hover:border-zinc-600 rounded-3xl p-8 max-w-md w-full shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden my-auto"
      >
        {/* Top white-metallic highlight border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />

        {/* Header Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-6"
        >
          <motion.div 
            whileHover={{ scale: 1.08, rotate: 6 }}
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-black mb-3 shadow-xl shadow-white/10"
          >
            <Sparkles className="w-7 h-7" />
          </motion.div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Shuziro<span className="text-zinc-400 font-extrabold">Astral</span> Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sistema Integrado da <strong className="text-white">Sala do Futuro</strong>
          </p>
        </motion.div>

        {/* Improved & Prominent Quick Access Button for Saved Accounts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="mb-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onOpenAccounts}
            className="w-full p-4 bg-[#121214] hover:bg-[#18181b] border border-zinc-700 hover:border-white rounded-2xl flex items-center justify-between text-left transition-all shadow-lg group cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center gap-3.5 z-10">
              <div className="w-10 h-10 rounded-xl bg-white text-black font-extrabold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                <UserCheck className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-2">
                  Contas Salvas
                  <span className="text-[9px] uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-white border border-zinc-600 font-mono font-bold tracking-wider">
                    Atalho Rápido
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">Selecione e entre com 1 clique</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-white transition-transform group-hover:translate-x-1.5 shrink-0 z-10" />
          </motion.button>
        </motion.div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              RA / Usuário
            </label>
            <input
              type="text"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
              placeholder="Ex.: 000123456789sp"
              required
              className="w-full px-4 py-3 bg-[#121214] border border-[#27272a] focus:border-zinc-400 rounded-xl text-white text-sm focus:outline-none transition-colors shadow-inner"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full px-4 py-3 pr-12 bg-[#121214] border border-[#27272a] focus:border-zinc-400 rounded-xl text-white text-sm focus:outline-none transition-colors shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors p-1 cursor-pointer"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28, duration: 0.4 }}
          >
            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex justify-between items-center">
              <span>Código de Acesso Web (Opcional)</span>
              <span className="text-[10px] text-zinc-500 font-normal lowercase italic">Evita erro 403 / Captcha</span>
            </label>
            <input
              type="text"
              value={tokenCode}
              onChange={(e) => {
                const val = e.target.value.trim().toUpperCase();
                setTokenCode(val);
                localStorage.setItem('shuziro_token_code', val);
              }}
              placeholder="F8J3D2 (Acesse App CMSP > Perfil)"
              className="w-full px-4 py-3 bg-[#121214] border border-[#27272a] focus:border-zinc-400 rounded-xl text-white text-sm focus:outline-none transition-colors shadow-inner uppercase"
            />
          </motion.div>

          {/* Captcha button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="button"
              onClick={onOpenEmojiChallenge}
              className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all text-xs font-bold cursor-pointer ${
                isVerified
                  ? 'bg-zinc-800 border-zinc-500 text-white shadow-md'
                  : 'bg-[#121214] border-[#27272a] text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                isVerified ? 'bg-white border-white text-black font-extrabold' : 'border-zinc-600 bg-[#18181b]'
              }`}>
                {isVerified ? '✓' : ''}
              </div>
              <span>{isVerified ? 'Verificado (Não sou um robô)' : 'Clique para verificar (Anti-Bot)'}</span>
            </motion.button>
          </motion.div>

          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Main Login Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || !isVerified}
              className="w-full py-3.5 px-4 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black font-black rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-white/10 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Entrar no Sistema <ArrowRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Discord community button */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="mt-4"
        >
          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="https://discord.gg/k8eakt9Rd"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar na Comunidade Discord
          </motion.a>
        </motion.div>

        {/* Improved & Stylized Footer */}
        <div className="mt-6 pt-5 border-t border-[#27272a] flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121214] border border-[#27272a] text-xs shadow-inner">
            <Code2 className="w-3.5 h-3.5 text-white" />
            <span className="text-zinc-400 font-medium">Feito com carinho por</span>
            <strong className="text-white font-black tracking-tight underline decoration-zinc-500 underline-offset-2">
              bakai Shuziro
            </strong>
          </div>
        </div>
      </motion.div>
    </div>
  );
};


