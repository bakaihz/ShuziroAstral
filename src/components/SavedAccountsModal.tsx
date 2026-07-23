import React from 'react';
import { X, User, Trash2, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import { SavedAccount } from '../types';

interface SavedAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: SavedAccount[];
  onSelectAccount: (acc: SavedAccount) => void;
  onRemoveAccount: (ra: string) => void;
  onClearAll: () => void;
}

export const SavedAccountsModal: React.FC<SavedAccountsModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSelectAccount,
  onRemoveAccount,
  onClearAll
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl p-6 max-w-md w-full shadow-[0_20px_60px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#27272a]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-[#27272a] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Contas Salvas</h3>
              <p className="text-[11px] text-zinc-400">Acesso rápido às suas credenciais</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2.5 mb-5 pr-1">
          {accounts.length === 0 ? (
            <div className="text-center py-10 bg-[#18181b]/50 border border-[#27272a] rounded-2xl">
              <User className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-zinc-300">Nenhuma conta salva</div>
              <div className="text-xs text-zinc-500 mt-0.5">Suas contas salvas aparecerão aqui após o login.</div>
            </div>
          ) : (
            accounts.map((acc) => (
              <div
                key={acc.ra}
                className="group flex items-center justify-between p-3.5 bg-[#18181b] hover:bg-[#1c1c20] border border-[#27272a] hover:border-zinc-600 rounded-2xl transition-all shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-[#27272a] flex items-center justify-center text-white font-bold shrink-0">
                    {acc.ra.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-200 truncate">{acc.ra}</div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-[#27272a] text-zinc-300 font-mono">{acc.estado || 'SP'}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(acc.data).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSelectAccount(acc);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-xl flex items-center gap-1 transition-all shadow-md shadow-white/5 cursor-pointer"
                  >
                    Usar <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveAccount(acc.ra)}
                    title="Remover conta"
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {accounts.length > 0 && (
          <div className="flex gap-2 pt-3 border-t border-[#27272a]">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#18181b] hover:bg-[#222226] text-zinc-300 text-xs font-semibold rounded-xl border border-[#27272a] transition-all cursor-pointer"
            >
              Fechar
            </button>
            <button
              onClick={onClearAll}
              className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl border border-red-500/30 transition-all cursor-pointer"
            >
              Limpar Todas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
