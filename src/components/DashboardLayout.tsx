import React from 'react';
import { Home, Smartphone, BookOpen, CheckSquare, PenTool, BarChart3, Settings, LogOut, RefreshCw, FolderOpen, Heart, MessageSquare } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-black text-white">
      {/* Header */}
      <header className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 sm:p-5 mb-6 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-white">
              👋 Olá, <span className="text-white font-semibold underline decoration-zinc-600 underline-offset-4">{userData.nick || 'Usuário'}</span>
            </h2>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-zinc-900 border border-[#27272a] text-zinc-300 font-medium">
              📍 SP
            </span>
            {pingStatus && (
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 font-bold ${
                pingStatus === 'success' ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' :
                pingStatus === 'pinging' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 animate-pulse' :
                'bg-red-950/20 border-red-500/30 text-red-400 animate-pulse'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  pingStatus === 'success' ? 'bg-emerald-400 animate-pulse' :
                  pingStatus === 'pinging' ? 'bg-zinc-400 animate-pulse' :
                  'bg-red-400 animate-pulse'
                }`} />
                {pingStatus === 'success' ? `TÚNEL: ATIVO ${latency ? `(${latency}ms)` : ''}` :
                 pingStatus === 'pinging' ? 'TESTANDO TÚNEL...' : 'TÚNEL: OFFLINE'}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {userData.serie || 'Ensino Médio'} • {userData.escola || 'Sala do Futuro'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenDiscord}
            className="px-3 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold rounded-xl border border-indigo-500/40 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-indigo-300/30 text-indigo-300" /> Discord
          </button>
          <button
            onClick={onOpenAccounts}
            className="px-3.5 py-2 bg-[#18181b] hover:bg-[#222226] text-zinc-300 text-xs font-medium rounded-xl border border-[#27272a] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-white" /> Contas
          </button>
          <button
            onClick={onRefresh}
            title="Atualizar dados"
            className="p-2 bg-[#18181b] hover:bg-[#222226] text-zinc-300 rounded-xl border border-[#27272a] transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-medium rounded-xl border border-red-500/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-2.5 space-y-1 sticky top-6">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isPlatformRoute = currentPage in PLATFORMS_DATA || currentPage === 'plataformas';
              const isActive = item.id === 'plataformas' ? isPlatformRoute : currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 border border-zinc-700 text-white font-semibold'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  {item.label}
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={onOpenDiscord}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
                Comunidade Discord
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="text-center mt-12 pt-6 border-t border-[#27272a] text-xs text-zinc-500">
        ShuziroAstral Hub · Feito com <Heart className="w-3 h-3 inline text-zinc-400 mx-0.5 fill-zinc-400/20" /> por <strong className="text-zinc-300">bakai Shuziro</strong> · 2026
      </footer>
    </div>
  );
};
