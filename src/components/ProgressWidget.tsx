import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Loader2, Sparkles, Cloud, Pause, Play, StopCircle, Check, AlertTriangle } from 'lucide-react';

export interface LogItem {
  text: string;
  type: 'ok' | 'err' | 'info';
  time?: string;
}

interface ProgressWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  progress: number;
  total: number;
  logs: LogItem[];
  isCompleted: boolean;
  isPaused?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  isBackgroundServer?: boolean;
  needsCaptcha?: boolean;
  onSolveCaptcha?: () => void;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({
  isOpen,
  onClose,
  title,
  progress,
  total,
  logs,
  isCompleted,
  isPaused = false,
  onPause,
  onResume,
  onCancel,
  isBackgroundServer = true,
  needsCaptcha = false,
  onSolveCaptcha
}) => {
  const percentage = total > 0 ? Math.min(100, Math.round((progress / total) * 100)) : 0;

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
            {/* Header with Title and Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {!isCompleted ? (
                  isPaused ? (
                    <span className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                      <Pause className="w-2.5 h-2.5 text-black" />
                    </span>
                  ) : (
                    <Loader2 className="w-4 h-4 text-red-500 animate-spin shrink-0" />
                  )
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{title}</span>
                  </div>
                  {isBackgroundServer && (
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Cloud className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-emerald-400 font-medium">Executando no Servidor</span>
                      <span className="text-zinc-500">• Você pode fechar o site ou sair a qualquer momento</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Control Buttons */}
                {!isCompleted && (
                  <div className="flex items-center gap-1.5 mr-1">
                    {isPaused ? (
                      <button
                        onClick={onResume}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Retomar execução das tarefas"
                      >
                        <Play className="w-3 h-3 fill-emerald-400" /> Retomar
                      </button>
                    ) : (
                      <button
                        onClick={onPause}
                        className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Pausar execução"
                      >
                        <Pause className="w-3 h-3" /> Pausar
                      </button>
                    )}

                    {onCancel && (
                      <button
                        onClick={onCancel}
                        className="px-2.5 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                        title="Cancelar fila de tarefas"
                      >
                        <StopCircle className="w-3 h-3" /> Cancelar
                      </button>
                    )}
                  </div>
                )}

                <span className="text-xs font-mono text-white font-bold bg-zinc-900 px-3 py-1 rounded-full border border-zinc-700 flex items-center gap-1.5 shadow-inner">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-400' : (isPaused ? 'bg-amber-400' : 'bg-red-500 animate-pulse')}`} />
                  {progress} / {total} ({percentage}%)
                </span>

                <button 
                  onClick={onClose} 
                  className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg border border-zinc-800 transition-colors cursor-pointer"
                  title="Minimizar (o robô continua executando em segundo plano no servidor)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CAPTCHA Warning / Resolution Banner */}
            {needsCaptcha && (
              <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-3.5 mb-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse shadow-md">
                <div className="flex items-center gap-2.5 text-xs text-red-200">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <div className="text-left">
                    <span className="font-extrabold block text-white">CAPTCHA exigido pela EduSP / CMSP!</span>
                    <span className="text-zinc-400 text-[11px] mt-0.5 block">Para prosseguir e finalizar as lições pendentes, resolva o desafio de verificação humana.</span>
                  </div>
                </div>
                {onSolveCaptcha && (
                  <button
                    onClick={onSolveCaptcha}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-1.5 shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    Resolver CAPTCHA e Finalizar
                  </button>
                )}
              </div>
            )}

            {/* Progress track */}
            <div className="w-full bg-zinc-900 h-2.5 rounded-full overflow-hidden mb-3 border border-zinc-800 relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="bg-gradient-to-r from-red-600 via-zinc-300 to-white h-full rounded-full shadow-[0_0_12px_rgba(239,68,68,0.5)]"
              />
            </div>

            {/* Terminal logs */}
            <div className="max-h-32 overflow-y-auto space-y-1 font-mono text-xs text-zinc-400 pr-2 custom-scrollbar bg-black/50 p-2.5 rounded-xl border border-zinc-800/80 shadow-inner">
              {logs.length === 0 ? (
                <div className="text-zinc-500 italic text-[11px] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                  Iniciando executor multi-tarefas no servidor...
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-2 leading-relaxed">
                    {log.time && <span className="text-zinc-500 text-[10px] shrink-0 mt-0.5">[{log.time}]</span>}
                    {log.type === 'ok' && <span className="text-emerald-400 font-bold shrink-0">✓</span>}
                    {log.type === 'err' && <span className="text-red-500 font-bold shrink-0">✕</span>}
                    {log.type === 'info' && <span className="text-zinc-400 font-bold shrink-0">ℹ</span>}
                    <span className={`text-[11px] break-words ${log.type === 'err' ? 'text-red-400' : (log.type === 'ok' ? 'text-zinc-200' : 'text-zinc-300')}`}>
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
