import React from 'react';
import { motion } from 'motion/react';
import { Home, Smartphone, BookOpen, CheckSquare, PenTool, BarChart3, Settings, LogOut, RefreshCw, FolderLock, Heart, KeyRound, Coffee } from 'lucide-react';
import { UserData, SavedAccount } from '../types';
import { PLATFORMS_DATA } from './PlatformDetailView';
import { AdBanner } from './AdBanner';
const eyeLogoImg = 'https://i.ibb.co/zTCgk7Mk/8860a99d3dc1ae4311adacbc72ed147a.jpg';

interface DashboardLayoutProps {
  userData: UserData;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  onRefresh: () => void;
  onOpenAccounts: () => void;
  onOpenDiscord: () => void;
  onOpenDoacao: () => void;
  children: React.ReactNode;
  pingStatus?: 'idle' | 'pinging' | 'success' | 'failed';
  latency?: number | null;
  onOpenBakaiProfile?: () => void;
}

// Crisp Discord Icon component
const DiscordLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  userData,
  currentPage,
  onNavigate,
  onLogout,
  onRefresh,
  onOpenAccounts,
  onOpenDiscord,
  onOpenDoacao,
  children,
  pingStatus,
  latency,
  onOpenBakaiProfile
}) => {
  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'plataformas', label: 'Plataformas', icon: Smartphone },
    { id: 'apostilas', label: 'Apostilas', icon: BookOpen },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare },
    { id: 'redacoes', label: 'Redações', icon: PenTool },
    { id: 'boletim', label: 'Boletim & Avisos', icon: BarChart3 },
    { id: 'config', label: 'Configurações', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto p-2.5 sm:p-4 lg:p-6 text-white relative z-10 font-sans">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-[#09090b]/95 backdrop-blur-2xl border border-[#27272a] hover:border-zinc-700 rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-5 flex flex-wrap items-center justify-between gap-3.5 shadow-xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-zinc-400 to-white" />
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden border border-zinc-700 shadow-lg bg-black shrink-0 relative group">
            <img 
              src={eyeLogoImg} 
              alt="Shuziro Astral Emblem" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-1.5">
                👋 Olá, <span className="text-white font-extrabold underline decoration-red-500/60 underline-offset-4">{userData.nome || userData.nick || 'Usuário'}</span>
              </h2>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> SP
              </span>
              {pingStatus && (
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1.5 font-bold transition-all ${
                  pingStatus === 'success' ? 'bg-zinc-900 border-zinc-600 text-white shadow-sm' :
                  pingStatus === 'pinging' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 animate-pulse' :
                  'bg-red-950/40 border-red-500/40 text-red-400 animate-pulse'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    pingStatus === 'success' ? 'bg-white' :
                    pingStatus === 'pinging' ? 'bg-zinc-400' :
                    'bg-red-400'
                  }`} />
                  {pingStatus === 'success' ? `ONLINE ${latency ? `(${latency}ms)` : ''}` :
                   pingStatus === 'pinging' ? 'CONECTANDO...' : 'OFFLINE'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {userData.serie || 'Ensino Médio'} • {userData.escola || 'Sala do Futuro'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDoacao}
            className="px-3 py-1.5 sm:px-3 sm:py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] sm:text-xs font-bold rounded-xl border border-zinc-700 hover:border-zinc-500 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Apoiar PIX
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenDiscord}
            className="px-3 py-1.5 sm:px-3 sm:py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] sm:text-xs font-bold rounded-xl border border-zinc-700 hover:border-zinc-500 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm group"
          >
            <DiscordLogo className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white transition-colors" /> Discord
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenAccounts}
            className="px-3 py-1.5 sm:px-3 sm:py-2 bg-white hover:bg-zinc-200 text-black text-[11px] sm:text-xs font-extrabold rounded-xl border border-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <KeyRound className="w-3.5 h-3.5 text-black" /> Contas
          </motion.button>

          <button
            onClick={onRefresh}
            title="Atualizar dados"
            className="p-1.5 sm:p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-700 transition-all cursor-pointer active:rotate-180 duration-300"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-300 text-[11px] sm:text-xs font-bold rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </motion.header>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-5 flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-56 shrink-0 space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="bg-[#09090b]/95 backdrop-blur-2xl border border-[#27272a] rounded-2xl p-2 space-y-1 sticky top-4 shadow-xl"
          >
            {/* Sidebar section title */}
            <div className="px-2.5 pt-1.5 pb-1 flex items-center justify-between text-[9px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
              <span>Navegação Astral</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isPlatformRoute = currentPage in PLATFORMS_DATA || currentPage === 'plataformas';
              const isActive = item.id === 'plataformas' ? isPlatformRoute : currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'text-black font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-md shadow-white/10"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5">
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                    {item.label}
                  </span>
                </button>
              );
            })}

            <div className="pt-2 mt-1.5 space-y-1.5 border-t border-[#27272a]">
              <button
                onClick={onOpenDoacao}
                className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <span className="flex items-center gap-2">
                  <Coffee className="w-3.5 h-3.5 text-zinc-300 group-hover:text-white" />
                  Apoiar com PIX
                </span>
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
              </button>
              
              <button
                onClick={onOpenDiscord}
                className="w-full flex items-center justify-between px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-600 text-zinc-200 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm group"
              >
                <span className="flex items-center gap-2">
                  <DiscordLogo className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
                  Discord
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </button>
            </div>
          </motion.div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 space-y-3.5">
          <AdBanner />
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center mt-8 pt-4 border-t border-[#27272a] text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 flex-wrap">
        <span>ShuziroAstral Hub · Feito com <Heart className="w-3 h-3 inline text-red-500 fill-red-500 animate-pulse" /> por</span>
        <button
          type="button"
          onClick={onOpenBakaiProfile}
          className="text-zinc-200 hover:text-white font-extrabold underline decoration-red-500/50 hover:decoration-white transition-all cursor-pointer inline-flex items-center gap-1"
        >
          bakai Shuziro
        </button>
        <span>· 2026</span>
      </footer>
    </div>
  );
};


