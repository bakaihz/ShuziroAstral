import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ShieldCheck, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-transparent relative z-10">
      <div className="bg-[#09090b]/90 backdrop-blur-xl border border-[#27272a] rounded-3xl p-8 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden">
        {/* Subtle monochromatic glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-900 border border-[#27272a] text-white mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Shuziro<span className="text-zinc-400">Astral</span> Hub
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Sistema Integrado da <strong className="text-zinc-200">Sala do Futuro</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              RA / Usuário
            </label>
            <input
              type="text"
              value={ra}
              onChange={(e) => setRa(e.target.value)}
              placeholder="Ex.: 000123456789sp"
              required
              className="w-full px-4 py-3 bg-[#121214] border border-[#27272a] rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full px-4 py-3 pr-12 bg-[#121214] border border-[#27272a] rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-zinc-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Captcha button */}
          <button
            type="button"
            onClick={onOpenEmojiChallenge}
            className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-3 transition-all text-sm font-medium ${
              isVerified
                ? 'bg-zinc-900 border-zinc-600 text-white'
                : 'bg-[#121214] border-[#27272a] text-zinc-300 hover:border-zinc-700'
            }`}
          >
            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
              isVerified ? 'bg-white border-white text-black font-bold' : 'border-zinc-600 bg-[#18181b]'
            }`}>
              {isVerified ? '✓' : ''}
            </div>
            <span>{isVerified ? 'Verificado (Não sou um robô)' : 'Clique para verificar (Anti-Bot)'}</span>
          </button>

          {errorMessage && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !isVerified}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-white text-black font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Sistema <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Discord community button */}
        <div className="mt-4">
          <a
            href="https://discord.gg/CK8RHMBtX"
            target="_blank"
            rel="noreferrer"
            className="w-full py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5865F2]/20 cursor-pointer"
          >
            {/* Official Discord SVG icon */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar no Discord
          </a>
        </div>

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#27272a] text-xs">
          <button
            type="button"
            onClick={onOpenAccounts}
            className="text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Contas Salvas
          </button>
          <span className="text-zinc-600">v2.5 Pro</span>
        </div>

        <div className="text-center mt-5 text-[11px] text-zinc-600">
          Feito por <span className="text-zinc-400 font-medium">bakai Shuziro</span> · 2026
        </div>
      </div>
    </div>
  );
};
