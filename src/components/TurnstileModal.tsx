import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck } from 'lucide-react';
import { TurnstileWidget } from './TurnstileWidget';

interface TurnstileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string) => void;
}

export const TurnstileModal: React.FC<TurnstileModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-[#09090b] border border-[#27272a] rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Verificação Cloudflare Turnstile
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-zinc-400 text-xs mb-4">
            Valide sua identidade com o widget do <strong className="text-white">Cloudflare Turnstile</strong> para liberar o login e requisições no sistema.
          </p>

          <div className="my-2">
            <TurnstileWidget
              onVerify={(token) => {
                setTimeout(() => {
                  onSuccess(token);
                  onClose();
                }, 500);
              }}
            />
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Cancelar e Fechar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
