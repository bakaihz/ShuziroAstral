import React, { useState } from 'react';
import { X, Heart, Copy, Check, Sparkles, ExternalLink, Coffee, Shield } from 'lucide-react';

interface DoacaoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DoacaoModal: React.FC<DoacaoModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const pixggUrl = "https://pixgg.com/Bakai";
  const pixKey = "shuziroastral@gmail.com";

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(pixggUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121214] border border-[#27272a] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Header decoration */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent border-b border-[#27272a]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer border border-white/10"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
            <Heart className="w-6 h-6 fill-amber-400/20 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Apoie Nosso Projeto
          </div>

          <h3 className="text-xl font-bold text-white">
            Ajude a manter o ShuziroAstral Online!
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Mantemos servidores Cloud e proxies de alto desempenho para a Sala do Futuro 100% gratuitos. Qualquer contribuição via PixGG ou PIX ajuda a cobrir os custos dos servidores!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Main PixGG Box */}
          <div className="bg-[#18181b] border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Coffee className="w-4 h-4 text-amber-400" /> Página Oficial PixGG:
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                Recomendado
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-xl p-3 relative z-10">
              <a
                href={pixggUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-bold text-emerald-400 hover:underline select-all truncate flex-1"
              >
                {pixggUrl}
              </a>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copiedLink 
                    ? 'bg-emerald-500 text-black font-extrabold' 
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copiar Link
                  </>
                )}
              </button>
            </div>

            <a
              href={pixggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-black hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer relative z-10"
            >
              <ExternalLink className="w-4 h-4" />
              Abrir PixGG (https://pixgg.com/Bakai)
            </a>
          </div>

          {/* Secondary Direct PIX Key Option */}
          <div className="bg-[#18181b]/60 border border-[#27272a] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Ou Chave PIX Direta (E-mail):</span>
              <span className="font-mono text-zinc-400 text-[11px] select-all">{pixKey}</span>
            </div>
            <button
              onClick={handleCopyPix}
              className="w-full py-2 bg-[#27272a] hover:bg-[#323238] text-zinc-200 hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPix ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX E-mail'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-400">
            <div className="bg-[#18181b]/40 border border-[#27272a] rounded-xl p-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Seguro & Direto</span>
            </div>
            <div className="bg-[#18181b]/40 border border-[#27272a] rounded-xl p-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Garante Uptime Servidores</span>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-zinc-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
