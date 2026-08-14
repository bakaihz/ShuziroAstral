import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Heart, Gamepad2, Tv, Moon, Code2, MessageSquare, Coffee, ShieldCheck } from 'lucide-react';
import bakaiImg from '../assets/images/bakai_avatar_1786668329709.jpg';

interface BakaiProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDiscord?: () => void;
  onOpenDoacao?: () => void;
}

export const BakaiProfileModal: React.FC<BakaiProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenDiscord,
  onOpenDoacao
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden z-10 text-white"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-zinc-800/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header with Avatar & Name */}
          <div className="flex items-center gap-4 sm:gap-5 mb-5">
            <div className="relative group shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl relative bg-zinc-900">
                <img
                  src={bakaiImg}
                  alt="bakai Shuziro"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-black border-2 border-zinc-800 flex items-center justify-center text-xs shadow-md" title="Online">
                ⚡
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  bakai Shuziro
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-white text-black font-extrabold text-[10px] uppercase tracking-wider shadow-sm">
                  Owner
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-300" /> Fundador da ShuziroAstral
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                  🚀 Criador do Projeto
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium">
                  💻 Full-Stack Dev
                </span>
              </div>
            </div>
          </div>

          {/* Bio Content */}
          <div className="space-y-4 text-xs text-zinc-300 leading-relaxed border-t border-b border-zinc-800/80 py-4 my-4">
            <p className="font-normal text-zinc-300">
              Fala aí! Eu sou o <strong className="text-white font-bold">bakai Shuziro</strong>, fundador e desenvolvedor da <strong className="text-white font-bold">ShuziroAstral</strong>. Criei e programei praticamente todo o sistema do zero para facilitar a vida escolar de milhares de estudantes de São Paulo.
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 space-y-2.5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-red-500" /> Sobre mim & O que eu curto:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-zinc-800/60">
                  <Tv className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-zinc-300">Assistir Animes</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-zinc-800/60">
                  <Gamepad2 className="w-4 h-4 text-zinc-300 shrink-0" />
                  <span className="text-zinc-300">Jogar Games</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-zinc-800/60">
                  <Moon className="w-4 h-4 text-zinc-300 shrink-0" />
                  <span className="text-zinc-300">Dormir bastante 💤</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-zinc-800/60">
                  <Code2 className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="text-zinc-300">Codar de madrugada</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 italic">
              "Desenvolvendo ferramentas com carinho para a comunidade. Obrigado a todo mundo que apoia e acompanha o projeto!"
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href="https://discord.gg/VdnsPj8sA"
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (onOpenDiscord) onOpenDiscord();
              }}
              className="flex-1 py-2.5 px-3 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" /> Servidor Discord
            </a>
            <a
              href="https://pixgg.com/Bakai"
              target="_blank"
              rel="noreferrer"
              onClick={() => {
                if (onOpenDoacao) onOpenDoacao();
              }}
              className="py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 hover:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Apoiar
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
