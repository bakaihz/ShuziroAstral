import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EmojiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMOJI_POOL = ['😀','😂','😍','🥰','😎','🤩','😜','🤔','😏','😴','😭','😡','🤯','🥳','😱','🤗','😺','🙈','💀','🎉','❤️','🔥','⭐','🌈','🍕','🚀','🎯','💪','👀','✨'];

export const EmojiModal: React.FC<EmojiModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [targets, setTargets] = useState<string[]>([]);
  const [gridItems, setGridItems] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) {
      const shuffled = [...EMOJI_POOL].sort(() => Math.random() - 0.5);
      const t = shuffled.slice(0, 3);
      setTargets(t);
      setSelected([]);
      setStatus('idle');
      const others = EMOJI_POOL.filter(e => !t.includes(e)).sort(() => Math.random() - 0.5).slice(0, 6);
      setGridItems([...t, ...others].sort(() => Math.random() - 0.5));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (emoji: string) => {
    if (status === 'success') return;
    if (selected.includes(emoji)) {
      setSelected(selected.filter(e => e !== emoji));
    } else {
      if (targets.includes(emoji)) {
        const next = [...selected, emoji];
        setSelected(next);
        if (next.length === 3) {
          const sortedSel = [...next].sort();
          const sortedTar = [...targets].sort();
          if (JSON.stringify(sortedSel) === JSON.stringify(sortedTar)) {
            setStatus('success');
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 700);
          } else {
            setStatus('error');
            setTimeout(() => {
              setSelected([]);
              setStatus('idle');
            }, 800);
          }
        }
      } else {
        setStatus('error');
        setTimeout(() => {
          setSelected([]);
          setStatus('idle');
        }, 800);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-zinc-200 font-semibold text-base">
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
            Desafio Anti-Bot
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-zinc-400 text-xs mb-4">
          Selecione os <strong className="text-zinc-200">3 emojis</strong> solicitados abaixo:
        </p>

        <div className="flex justify-center gap-2 mb-5 p-3 bg-[#18181b] rounded-xl border border-[#27272a]">
          {targets.map((t, idx) => (
            <span key={idx} className="text-2xl px-2 py-1 bg-[#222226] rounded-lg border border-[#2f2f35]">
              {t}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto mb-4">
          {gridItems.map((emoji, idx) => {
            const isSelected = selected.includes(emoji);
            return (
              <button
                key={idx}
                onClick={() => handleSelect(emoji)}
                className={`text-2xl p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 scale-95'
                    : 'border-[#27272a] bg-[#18181b] hover:border-zinc-500 hover:bg-[#222226]'
                }`}
              >
                {emoji}
              </button>
            );
          })}
        </div>

        <div className="text-xs font-medium min-h-[20px]">
          {status === 'success' && <span className="text-emerald-400 flex items-center justify-center gap-1"><CheckCircle2 className="w-4 h-4"/> Verificado com sucesso!</span>}
          {status === 'error' && <span className="text-red-400">Emojis incorretos, tente novamente.</span>}
          {status === 'idle' && <span className="text-zinc-500">Clique nos emojis corretos</span>}
        </div>
      </div>
    </div>
  );
};
