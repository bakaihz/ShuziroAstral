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
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="fixed bottom-0 left-0 right-0 bg-[#121214]/95 backdrop-blur-2xl border-t border-[#27272a] p-4 sm:p-5 shadow-2xl z-50 overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                {!isCompleted ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                <span className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  {title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  {progress} / {total} ({percentage}%)
                </span>
                <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors cursor-pointer p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="w-full bg-[#18181b] h-2 rounded-full overflow-hidden mb-3 border border-[#27272a]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full shadow-lg shadow-emerald-500/30"
              />
            </div>

            <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs text-zinc-400 pr-2">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-2 leading-relaxed">
                  {log.type === 'ok' && <span className="text-emerald-400 font-bold">✓</span>}
                  {log.type === 'err' && <span className="text-red-400 font-bold">✕</span>}
                  {log.type === 'info' && <span className="text-indigo-400 font-bold">ℹ</span>}
                  <span className="truncate">{log.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

