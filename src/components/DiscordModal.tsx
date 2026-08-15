import React from 'react';
import { X, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Crisp Discord Icon
const DiscordLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const DiscordModal: React.FC<DiscordModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const discordUrl = 'https://discord.gg/VdnsPj8sA';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3.5 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-[#27272a] hover:border-zinc-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Top Metallic Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-400 to-white z-10" />

        {/* Top Banner Image */}
        <div className="relative h-36 sm:h-44 w-full bg-zinc-900 overflow-hidden border-b border-[#27272a]">
          <a href="https://ibb.co/mFqknYfp" target="_blank" rel="noreferrer">
            <img
              src="https://i.ibb.co/6JPzKpjQ/1786808465101.png"
              alt="ShuziroAstral Discord Banner"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </a>
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 p-1.5 bg-black/75 hover:bg-black text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer backdrop-blur-sm border border-white/10"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          
          <div className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-full bg-zinc-900/90 border border-zinc-700 backdrop-blur-md text-zinc-200 font-bold text-[10px] flex items-center gap-1.5 shadow-lg font-mono">
            <DiscordLogo className="w-3 h-3 text-zinc-300" />
            Comunidade Oficial ShuziroAstral
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border-2 border-zinc-700 p-0.5 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
              <img
                src="https://i.ibb.co/zTCgk7Mk/8860a99d3dc1ae4311adacbc72ed147a.jpg"
                alt="Shuziro Avatar"
                className="w-full h-full object-cover rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                Servidor do Discord Oficial <Sparkles className="w-3.5 h-3.5 text-red-500" />
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                Junte-se à nossa comunidade para suporte, avisos de automações, novas plataformas e interação direta com outros alunos!
              </p>
            </div>
          </div>

          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-200">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" /> Vantagens de participar:
            </div>
            <ul className="text-[11px] text-zinc-400 space-y-1 list-disc list-inside">
              <li>Avisos em tempo real sobre instabilidades e correções</li>
              <li>Suporte para TarefaSP, Redação, Matific e Plataformas do EM</li>
              <li>Sorteios, cargos exclusivos e canal de feedbacks</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center gap-2.5">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <DiscordLogo className="w-3.5 h-3.5 text-black" />
              Entrar no Servidor do Discord
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

