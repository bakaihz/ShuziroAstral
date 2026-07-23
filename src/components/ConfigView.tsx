import React from 'react';
import { Settings, Shield, Server, CheckCircle2 } from 'lucide-react';
import { SavedAccount } from '../types';

interface ConfigViewProps {
  accounts: SavedAccount[];
  onClearAccounts: () => void;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ accounts, onClearAccounts }) => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200">
            <Shield className="w-4 h-4 text-white" /> Dados Armazenados Localmente ({accounts.length} contas)
          </div>
          {accounts.length > 0 && (
            <button
              onClick={onClearAccounts}
              className="text-xs text-red-400 hover:text-red-300 font-medium px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl transition-all cursor-pointer"
            >
              Limpar Contas Salvas
            </button>
          )}
        </div>
        <p className="text-xs text-zinc-400">
          Suas credenciais são salvas de forma segura no armazenamento local do navegador para permitir acesso rápido e prático.
        </p>
      </div>

      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-zinc-200 mb-2">
          <Server className="w-4 h-4 text-white" /> Status do Sistema & Proxy Integrado
        </div>
        <p className="text-xs text-zinc-400 mb-4">
          O túnel de conexão com a Secretaria da Educação opera de forma automática e otimizada em segundo plano.
        </p>
        <div className="flex items-center gap-2 p-3 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span>Conexão Segura com a API da Sala do Futuro Ativa</span>
        </div>
      </div>
    </div>
  );
};
