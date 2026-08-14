import React, { useState } from 'react';
import { X, Heart, Copy, Check, Sparkles, ExternalLink, Shield } from 'lucide-react';

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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#09090b] border border-[#27272a] hover:border-zinc-700 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
        
        {/* Top Metallic Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-400 to-white z-10" />

        {/* Header decoration */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-red-500/10 via-transparent to-transparent border-b border-[#27272a]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer border border-white/10"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-3 shadow-lg">
            <Heart className="w-6 h-6 fill-red-500 text-red-500 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 mb-1 font-mono">
            <Sparkles className="w-3.5 h-3.5" /> Apoie Nosso Projeto
          </div>

          <h3 className="text-xl font-extrabold text-white">
            Ajude a manter o ShuziroAstral Online!
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Mantemos servidores Cloud de alto desempenho para a Sala do Futuro 100% gratuitos. Qualquer contribuição via PixGG ou PIX ajuda a cobrir os custos dos servidores!
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* Main PixGG Box */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5 uppercase tracking-wide font-mono">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" /> Página Oficial PixGG:
              </span>
              <span className="text-[10px] bg-red-500/10 text-red-400 font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 animate-pulse font-mono">
                Recomendado
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#09090b] border border-[#27272a] rounded-xl p-3 relative z-10">
              <a
                href={pixggUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono font-bold text-zinc-100 hover:text-red-400 hover:underline select-all truncate flex-1"
              >
                {pixggUrl}
              </a>
              <button
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  copiedLink 
                    ? 'bg-red-500 text-white font-extrabold' 
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700'
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
              className="w-full py-3 px-4 rounded-xl font-extrabold text-xs bg-white hover:bg-zinc-200 text-black transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer relative z-10"
            >
              <ExternalLink className="w-4 h-4 text-black" />
              Abrir PixGG (https://pixgg.com/Bakai)
            </a>
          </div>

          {/* Secondary Direct PIX Key Option */}
          <div className="bg-[#121214] border border-[#27272a] rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
              <span>Chave PIX Direta (E-mail):</span>
              <span className="font-mono text-zinc-400 text-[11px] select-all">{pixKey}</span>
            </div>
            <button
              onClick={handleCopyPix}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedPix ? <Check className="w-3.5 h-3.5 text-red-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedPix ? 'Chave PIX Copiada!' : 'Copiar Chave PIX E-mail'}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-2.5 text-xs text-zinc-400">
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-2.5 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500 shrink-0" />
              <span>100% Seguro & Direto</span>
            </div>
            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-2.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white shrink-0" />
              <span>Garante Uptime Servidores</span>
            </div>
          </div>

          {/* Bottom actions */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
