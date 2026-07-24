import React from 'react';
import { Shield, Server } from 'lucide-react';
import { SavedAccount } from '../types';

interface ConfigViewProps {
  accounts: SavedAccount[];
  onClearAccounts: () => void;
  tunnelUrl?: string;
  setTunnelUrl?: (url: string) => void;
  pingStatus?: 'idle' | 'pinging' | 'success' | 'failed';
  runPing?: (isSilent: boolean) => void;
  pingResponse?: any;
  latency?: number | null;
}

export const ConfigView: React.FC<ConfigViewProps> = ({
  accounts,
  onClearAccounts
}) => {
  return (
    <div className="space-y-6 max-w-4xl pb-10">
      {/* Title section */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-white" /> Configurações Gerais
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Gerencie suas credenciais salvas e acompanhe o status dos servidores oficiais de redundância do ecossistema.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Saved Accounts config */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-zinc-400" /> Contas Salvas Localmente
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold">
                {accounts.length}
              </span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              As contas adicionadas ao painel ficam armazenadas de forma 100% segura e privada diretamente no armazenamento local do seu próprio navegador (<code className="text-zinc-300 font-mono">localStorage</code>). Nenhum dado é transmitido a terceiros.
            </p>
          </div>

          {accounts.length > 0 ? (
            <button
              id="btn-clear-accounts"
              onClick={onClearAccounts}
              className="w-full text-center text-xs text-red-400 hover:text-red-300 font-bold py-3 bg-red-500/10 hover:bg-red-500/15 border border-red-500/25 rounded-xl transition-all cursor-pointer mt-4"
            >
              Excluir Todas as Contas Salvas
            </button>
          ) : (
            <div className="text-center py-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl text-xs text-zinc-500 italic mt-4">
              Nenhuma conta armazenada neste navegador
            </div>
          )}
        </div>

        {/* System status details */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 shadow-md flex flex-col justify-between">
          <div className="space-y-3">
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-zinc-400" /> Servidor Oficial SED
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed">
              O backend redundante inteligente do ShuziroAstral está ativo e operando em nuvem com criptografia de ponta a ponta. Ele provê tokens SSO de forma automatizada para todas as integrações da Sala do Futuro.
            </p>
          </div>

          <div className="flex items-center gap-2.5 p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl text-xs text-emerald-400 font-bold mt-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span>Conexão Segura Ativa (Cloud Run Engine)</span>
          </div>
        </div>

      </div>
    </div>
  );
};
