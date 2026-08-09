import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Trash2, ArrowRight, ShieldCheck, Calendar, Key, Check } from 'lucide-react';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#09090b] border border-[#27272a] hover:border-zinc-700 rounded-3xl p-6 max-w-md w-full shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative overflow-hidden"
          >
            {/* Top metallic glow bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-600 via-white to-zinc-600" />

            <div className="flex justify-between items-center mb-5 pb-4 border-b border-[#27272a]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 border border-[#27272a] flex items-center justify-center text-white shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-white">Contas Salvas</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono font-bold">
                      {accounts.length}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400">Gerencie e acesse suas credenciais salvas</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 mb-5 pr-1 custom-scrollbar">
              {accounts.length === 0 ? (
                <div className="text-center py-12 bg-[#121214] border border-[#27272a] rounded-2xl p-4">
                  <User className="w-10 h-10 text-zinc-600 mx-auto mb-2 opacity-60" />
                  <div className="text-sm font-bold text-zinc-300">Nenhuma conta salva</div>
                  <div className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto">
                    Ao realizar login no ShuziroAstral Hub, suas contas serão salvas automaticamente para acesso rápido.
                  </div>
                </div>
              ) : (
                accounts.map((acc) => (
                  <motion.div
                    key={acc.ra}
                    whileHover={{ scale: 1.01, x: 2 }}
                    className="group flex items-center justify-between p-3.5 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 rounded-2xl transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-white text-black font-extrabold flex items-center justify-center text-sm shrink-0 shadow-md">
                        {acc.ra.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate font-mono">{acc.ra}</div>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                          <span className="px-1.5 py-0.2 bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-[10px] rounded">
                            {acc.estado || 'SP'}
                          </span>
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Calendar className="w-3 h-3 text-zinc-400" /> {new Date(acc.data).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          onSelectAccount(acc);
                          onClose();
                        }}
                        className="px-3.5 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                      >
                        Entrar <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveAccount(acc.ra)}
                        title="Remover conta"
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {accounts.length > 0 && (
              <div className="flex gap-2 pt-3 border-t border-[#27272a]">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 bg-[#18181b] hover:bg-[#222226] text-zinc-300 text-xs font-bold rounded-xl border border-[#27272a] transition-all cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={onClearAll}
                  className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold rounded-xl border border-red-500/30 transition-all cursor-pointer"
                >
                  Limpar Todas
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

