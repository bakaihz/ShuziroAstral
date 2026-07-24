import React from 'react';
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

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
  if (!isOpen) return null;
  const percentage = total > 0 ? Math.round((progress / total) * 100) : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#121214] border-t border-[#27272a] p-4 shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            {!isCompleted ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-white" />
            )}
            <span className="text-sm font-medium text-zinc-200">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400">{progress} / {total} ({percentage}%)</span>
            <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="w-full bg-[#18181b] h-1.5 rounded-full overflow-hidden mb-3 border border-[#27272a]">
          <div
            className="bg-white h-full transition-all duration-300 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="max-h-28 overflow-y-auto space-y-1 font-mono text-xs text-zinc-400 pr-2">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {log.type === 'ok' && <span className="text-white font-bold">✓</span>}
              {log.type === 'err' && <span className="text-zinc-400 font-bold">✕</span>}
              {log.type === 'info' && <span className="text-zinc-300 font-bold">ℹ</span>}
              <span className="truncate">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
