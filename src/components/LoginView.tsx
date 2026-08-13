import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Sparkles, ArrowRight, UserCheck, Code2 } from 'lucide-react';
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
    onLogin(ra, senha);
  };

  // Pre-computed particle list for smooth, hardware-accelerated background
  const particles = useMemo(() => {
    return Array.from({ length: 24 }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1.5,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 6,
    }));
  }, []);

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

      {/* Hardware-Accelerated High-Performance Dark/Neon Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 transform-gpu">
        {/* Soft glowing metallic orbs with hardware acceleration */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-zinc-600/15 blur-[100px] animate-pulse transform-gpu" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-zinc-400/10 blur-[120px] transform-gpu" />
        <div className="absolute top-[40%] right-[15%] w-[350px] h-[350px] rounded-full bg-white/5 blur-[80px] transform-gpu" />

        {/* Subtle geometric line grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />

        {/* Lightweight floating silver particles */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.1, y: 0 }}
            animate={{
              opacity: [0.15, 0.75, 0.15],
              y: [-15, -60, -15],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute bg-white rounded-full transform-gpu"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              willChange: 'transform, opacity',
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-[#09090b]/95 backdrop-blur-2xl border border-[#27272a] hover:border-zinc-600 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-[0_25px_80px_rgba(0,0,0,0.95)] relative overflow-hidden my-auto transform-gpu"
      >
        {/* Top white-metallic highlight border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />

        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white text-black mb-3 shadow-xl shadow-white/10 transition-transform hover:scale-105">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Shuziro<span className="text-zinc-400 font-extrabold">Astral</span> Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sistema Integrado da <strong className="text-white">Sala do Futuro</strong>
          </p>
        </div>

        {/* Quick Access Button for Saved Accounts */}
        <div className="mb-6">
          <button
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
          </button>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
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
          </div>

          <div>
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
          </div>

          {/* Captcha button */}
          <div>
            <button
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
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-bold">
              {errorMessage}
            </div>
          )}

          {/* Main Login Submit Button */}
          <div>
            <button
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
            </button>
          </div>
        </form>

        {/* Discord community button */}
        <div className="mt-4">
          <a
            href="https://discord.gg/VdnsPj8sA"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20 cursor-pointer block text-center"
          >
            <svg className="w-4 h-4 fill-current inline-block mr-1" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar na Comunidade Discord
          </a>
        </div>

        {/* Footer */}
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


