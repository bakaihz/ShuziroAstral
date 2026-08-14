import React, { useState } from 'react';
import { Shield, Server, CheckCircle2, AlertCircle, Copy, Check, Users, Sparkles, ShieldAlert, Cpu, Heart, Database, RefreshCw } from 'lucide-react';
import { SavedAccount } from '../types';
import bakaiImg from '../assets/images/bakai_avatar_1786668329709.jpg';
import cacaRatoImg from '../assets/images/caca_rato_avatar_1786668543546.jpg';
import cyanImg from '../assets/images/cyan_avatar_1786668554505.jpg';

interface ConfigViewProps {
  accounts: SavedAccount[];
  onClearAccounts: () => void;
  tunnelUrl?: string;
  setTunnelUrl?: (url: string) => void;
  pingStatus?: 'idle' | 'pinging' | 'success' | 'failed';
  runPing?: (isSilent: boolean) => void;
  pingResponse?: any;
  latency?: number | null;
  onOpenBakaiProfile?: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  accounts,
  onClearAccounts,
  pingStatus,
  runPing,
  latency,
  onOpenBakaiProfile
}) => {
  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-red-500" /> Configurações Gerais do Hub
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie o armazenamento local, sincronização do sistema e conheça a equipe oficial ShuziroAstral.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Saved Accounts config */}
        <div className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-zinc-300" /> Contas Salvas no Navegador
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-white font-mono font-bold">
                {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              As contas adicionadas ao painel ficam armazenadas de forma segura e privada diretamente no armazenamento local do seu próprio navegador (<code className="text-zinc-200 font-mono">localStorage</code>). Nenhum dado é transmitido a terceiros.
            </p>
          </div>

          {accounts.length > 0 ? (
            <button
              id="btn-clear-accounts"
              onClick={onClearAccounts}
              className="w-full text-center text-xs text-red-400 hover:text-red-300 font-bold py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all cursor-pointer mt-4"
            >
              Excluir Todas as Contas Salvas
            </button>
          ) : (
            <div className="text-center py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs text-zinc-500 italic mt-4">
              Nenhuma conta armazenada neste navegador
            </div>
          )}
        </div>

        {/* System status details */}
        <div className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-zinc-300" /> Servidor & Conexão
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                pingStatus === 'success' ? 'bg-zinc-900 border-zinc-600 text-white' :
                pingStatus === 'pinging' ? 'bg-zinc-900 border-zinc-700 text-zinc-400 animate-pulse' :
                'bg-red-950/40 border-red-500/40 text-red-400'
              }`}>
                <span>{pingStatus === 'success' ? `ONLINE ${latency ? `(${latency}ms)` : ''}` : pingStatus === 'pinging' ? 'TESTANDO...' : 'STATUS ATIVO'}</span>
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O backend ShuziroAstral opera com sincronização de cookies e cabeçalhos emulados para comunicação rápida com os portais escolares.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs font-bold mt-4">
            <span className="flex items-center gap-2 text-zinc-300 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full shrink-0 bg-red-500 animate-pulse" />
              API Shuziro Roteadora
            </span>
            <button
              onClick={() => runPing && runPing(false)}
              className="text-[11px] text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer shrink-0 ml-2 py-1 px-2.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg border border-zinc-700 transition-all"
            >
              <RefreshCw className="w-3 h-3" /> Testar Ping
            </button>
          </div>
        </div>
      </div>

      {/* Developers & Staff Section */}
      <div className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-6 shadow-xl space-y-5 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-white" />
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Desenvolvedores & Equipe ShuziroAstral
              </h3>
              <p className="text-xs text-zinc-400">
                Conheça os responsáveis pela criação, gerenciamento de servidores e suporte do ecossistema.
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
            Staff Oficial
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Bakai Shuziro Card */}
          <div 
            onClick={onOpenBakaiProfile}
            className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-2xl p-4 transition-all flex flex-col justify-between group cursor-pointer shadow-md hover:scale-[1.02]"
          >
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-zinc-600 group-hover:border-white transition-colors relative shrink-0 shadow-inner bg-zinc-950">
                  <img
                    src={bakaiImg}
                    alt="bakai Shuziro"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-white group-hover:underline underline-offset-2">
                      bakai Shuziro
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-white text-black text-[9px] font-black uppercase">
                      Owner
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Fundador & Dono
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Fez praticamente tudo e é o dono do site. Fundou a <strong className="text-white">ShuziroAstral</strong>, programou todo o sistema, o frontend, os scripts e os bypasses anti-bot.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-zinc-300">
                <Sparkles className="w-3 h-3 text-red-400" /> Clique para ver perfil
              </span>
              <span className="text-zinc-500">#0001</span>
            </div>
          </div>

          {/* Cyan Card */}
          <div className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-md hover:scale-[1.02]">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-zinc-600 group-hover:border-zinc-400 transition-colors relative shrink-0 shadow-inner bg-zinc-950">
                  <img
                    src={cyanImg}
                    alt="Cyan"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-white">
                      Cyan
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-[9px] font-bold uppercase">
                      Co-Owner
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Gerenciamento & Servidor
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Co-Owner do projeto. Cuida de todo o gerenciamento de servidores, infraestrutura de rede, otimizações de tráfego e resolução de erros no backend.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-zinc-300">
                <Cpu className="w-3 h-3 text-zinc-400" /> Infra & Servidores
              </span>
              <span className="text-zinc-500">#0002</span>
            </div>
          </div>

          {/* Caça Rato Card */}
          <div className="bg-zinc-900/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-500 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-md hover:scale-[1.02]">
            <div>
              <div className="flex items-center gap-3.5 mb-3">
                <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-zinc-600 group-hover:border-zinc-400 transition-colors relative shrink-0 shadow-inner bg-zinc-950">
                  <img
                    src={cacaRatoImg}
                    alt="Caça Rato"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-extrabold text-white">
                      Caça Rato
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 text-[9px] font-bold uppercase">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Administrador & QA
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Administrador da comunidade. Cuida das dúvidas dos membros, presta suporte e ajuda ativamente no teste e validação de novos scripts e correções.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1 text-zinc-300">
                <ShieldAlert className="w-3 h-3 text-red-400" /> Suporte & Testes
              </span>
              <span className="text-zinc-500">#0003</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
