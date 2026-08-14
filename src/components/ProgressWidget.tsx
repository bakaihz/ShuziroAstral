import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

interface LogItem {
  text: string;
  type: 'ok' | 'err' | 'info';
}

interface ProgressWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  progress: number;
  total: number;
  logs: LogItem[];
  isCompleted: boolean;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  isOpen,
  onClose,
  title,
  progress,
  total,
  logs,
  isCompleted
}) => {
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          className="fixed bottom-0 left-0 right-0 bg-[#09090b]/95 backdrop-blur-2xl border-t border-[#27272a] p-4 sm:p-5 shadow-[0_-15px_40px_rgba(0,0,0,0.85)] z-50 overflow-hidden"
        >
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-400 to-white" />
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                {!isCompleted ? (
                  <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-white font-bold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {progress} / {total} ({percentage}%)
                </span>
                <button 
                  onClick={onClose} 
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mb-3.5 border border-zinc-800 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gradient-to-r from-red-600 via-zinc-300 to-white h-full rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              />
            </div>

            {/* Terminal logs */}
            <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs text-zinc-400 pr-2 custom-scrollbar bg-black/40 p-2.5 rounded-xl border border-zinc-800/80">
              {logs.length === 0 ? (
                <div className="text-zinc-500 italic text-[11px]">Aguardando início das tarefas...</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2 leading-relaxed">
                    {log.type === 'ok' && <span className="text-white font-bold">✓</span>}
                    {log.type === 'err' && <span className="text-red-500 font-bold">✕</span>}
                    {log.type === 'info' && <span className="text-zinc-400 font-bold">ℹ</span>}
                    <span className={`truncate text-[11px] ${log.type === 'err' ? 'text-red-400' : 'text-zinc-300'}`}>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

