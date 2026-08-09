import React from 'react';
import { motion } from 'motion/react';
import { Home, Smartphone, BookOpen, CheckSquare, PenTool, BarChart3, Settings, LogOut, RefreshCw, FolderOpen, Heart, MessageSquare, Coffee, Sparkles } from 'lucide-react';
import { UserData } from '../types';
import { PLATFORMS_DATA } from './PlatformDetailView';

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
}

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
  latency
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
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 text-white relative z-10">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-[#121214]/90 backdrop-blur-2xl border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-1/4 w-64 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              👋 Olá, <span className="text-white font-extrabold underline decoration-zinc-500 underline-offset-4">{userData.nick || 'Usuário'}</span>
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> SP
            </span>
            {pingStatus && (
              <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 font-bold transition-all ${
                pingStatus === 'success' ? 'bg-zinc-800 border-zinc-500 text-white shadow-sm' :
                pingStatus === 'pinging' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 animate-pulse' :
                'bg-red-950/30 border-red-500/40 text-red-400 animate-pulse'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  pingStatus === 'success' ? 'bg-white animate-ping' :
                  pingStatus === 'pinging' ? 'bg-amber-400 animate-ping' :
                  'bg-red-400 animate-pulse'
                }`} />
                {pingStatus === 'success' ? `SERVIDOR: ONLINE ${latency ? `(${latency}ms)` : ''}` :
                 pingStatus === 'pinging' ? 'CONECTANDO...' : 'SERVIDOR: OFFLINE'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {userData.serie || 'Ensino Médio'} • {userData.escola || 'Sala do Futuro'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenDoacao}
            className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl border border-zinc-600 flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Heart className="w-3.5 h-3.5 text-white animate-pulse" /> Apoiar via PIX
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenDiscord}
            className="px-3 py-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-white text-xs font-semibold rounded-xl border border-[#5865F2]/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#5865F2]" /> Discord
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenAccounts}
            className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl border border-white flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <FolderOpen className="w-3.5 h-3.5 text-black" /> Contas Salvas
          </motion.button>
          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.3 }}
            onClick={onRefresh}
            title="Atualizar dados"
            className="p-2 bg-[#18181b] hover:bg-[#222226] text-zinc-300 rounded-xl border border-[#27272a] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </motion.button>
        </div>
      </motion.header>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-[#121214]/90 backdrop-blur-2xl border border-[#27272a] rounded-2xl p-2.5 space-y-1 sticky top-6 shadow-xl"
          >
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isPlatformRoute = currentPage in PLATFORMS_DATA || currentPage === 'plataformas';
              const isActive = item.id === 'plataformas' ? isPlatformRoute : currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'text-black font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-lg shadow-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-500'}`} />
                    {item.label}
                  </span>
                </button>
              );
            })}

            <div className="pt-2.5 space-y-1.5 border-t border-[#27272a]">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDoacao}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <Coffee className="w-4 h-4 text-white" />
                Apoiar com PIX
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDiscord}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                <MessageSquare className="w-4 h-4 text-[#5865F2]" />
                Comunidade Discord
              </motion.button>
            </div>
          </motion.div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 pt-6 border-t border-[#27272a] text-xs text-zinc-500 flex items-center justify-center gap-1">
        ShuziroAstral Hub · Feito com <Heart className="w-3.5 h-3.5 inline text-white animate-pulse" /> por <strong className="text-zinc-300 font-bold">bakai Shuziro</strong> · 2026
      </footer>
    </div>
  );
};


