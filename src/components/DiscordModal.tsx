import React from 'react';
import { X, ExternalLink, MessageSquare, Sparkles, ShieldCheck } from 'lucide-react';

interface DiscordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordModal: React.FC<DiscordModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const discordUrl = 'https://discord.gg/VdnsPj8sA';

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Top Banner Image */}
        <div className="relative h-44 w-full bg-zinc-900 overflow-hidden border-b border-[#27272a]">
          <a href="https://ibb.co/FLPNwdbL" target="_blank" rel="noreferrer">
            <img
              src="https://i.ibb.co/FLPNwdbL/1784647906279.png"
              alt="ShuziroAstral Banner"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
          </a>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-zinc-300 hover:text-white rounded-full transition-all cursor-pointer backdrop-blur-sm border border-white/10"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 backdrop-blur-md text-indigo-300 font-semibold text-[11px] flex items-center gap-1.5 shadow-lg">
            <MessageSquare className="w-3.5 h-3.5 fill-indigo-400/20" />
            Comunidade Oficial ShuziroAstral
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 border border-indigo-500/30 p-1 shrink-0 overflow-hidden shadow-inner flex items-center justify-center">
              <a href="https://ibb.co/1GkZrxMn" target="_blank" rel="noreferrer">
                <img
                  src="https://i.ibb.co/1GkZrxMn/1784648026795.png"
                  alt="Shuziro Avatar"
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Servidor do Discord Oficial <Sparkles className="w-4 h-4 text-emerald-400" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Junte-se à nossa comunidade no Discord para receber suporte direto, atualizações das automações, dicas de matérias, salas de dúvidas e novos scripts em primeira mão!
              </p>
            </div>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Benefícios da Comunidade:
            </div>
            <ul className="text-xs text-zinc-300 space-y-1.5 list-disc list-inside">
              <li>Avisos em tempo real sobre instabilidades e correções</li>
              <li>Suporte para TarefaSP, Redação, Matific e Plataformas do EM</li>
              <li>Sorteios, cargos exclusivos e canal de feedbacks</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="w-full py-3 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              Entrar no Servidor do Discord
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-5 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-400 hover:text-white text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
