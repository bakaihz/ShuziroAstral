import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Search, Filter, AlertCircle, RefreshCw, Play, Sparkles, Check, X, Clock, ShieldCheck, Zap, ChevronDown } from 'lucide-react';
import { TaskItem } from '../types';
import { CaptchaWidget } from './CaptchaWidget';

export const isTaskExpired = (t: TaskItem): boolean => {
  if ((t as any).expired || (t as any).expirada || (t as any).expired_only) return true;
  const status = String(t.answer_status || (t as any).status || (t as any).state || '').toLowerCase();
  if (status.includes('expir')) return true;
  if ((t as any).dueDate || (t as any).due_date || (t as any).expiration_date || (t as any).data_expiracao) {
    const due = new Date((t as any).dueDate || (t as any).due_date || (t as any).expiration_date || (t as any).data_expiracao);
    if (!isNaN(due.getTime()) && due.getTime() < Date.now() && t.answer_status !== 'submitted') {
      return true;
    }
  }
  return false;
};

interface TarefasViewProps {
  tasks: TaskItem[];
  authToken?: string;
  captchaToken?: string;
  onCaptchaVerified?: (token: string) => void;
  onRefresh?: () => void;
  onStartAutomation?: (
    selectedTaskIds: string[],
    optionsOrTimeSec: number | { minTimeSec: number; maxTimeSec: number; mode: 'draft' | 'submitted' },
    mode?: 'draft' | 'submitted'
  ) => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({ 
  tasks, 
  authToken, 
  captchaToken,
  onCaptchaVerified,
  onRefresh, 
  onStartAutomation 
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'draft' | 'expired'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(30);
  
  // Time configuration state (Min and Max)
  const [minTimeSec, setMinTimeSec] = useState<number>(60); // Default 1 min
  const [maxTimeSec, setMaxTimeSec] = useState<number>(180); // Default 3 min
  const [preset, setPreset] = useState<'rapido' | 'normal' | 'seguro' | 'custom'>('rapido');
  const [mode, setMode] = useState<'draft' | 'submitted'>('submitted');

  const tarefas = useMemo(() => tasks.filter(t => !t.is_essay), [tasks]);

  const { pendingCount, draftCount, expiredCount } = useMemo(() => {
    let pending = 0;
    let draft = 0;
    let expired = 0;

    for (const t of tarefas) {
      if (isTaskExpired(t)) expired++;
      else if (t.answer_status === 'draft') draft++;
      else pending++;
    }

    return { pendingCount: pending, draftCount: draft, expiredCount: expired };
  }, [tarefas]);

  const filteredTarefas = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tarefas.filter(t => {
      const matchesSearch = !q || 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.publication_target && t.publication_target.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === 'draft') return t.answer_status === 'draft';
      if (statusFilter === 'pending') return !isTaskExpired(t) && t.answer_status !== 'draft';
      if (statusFilter === 'expired') return isTaskExpired(t);
      return true;
    });
  }, [tarefas, search, statusFilter]);

  const visibleTarefas = useMemo(() => {
    return filteredTarefas.slice(0, visibleLimit);
  }, [filteredTarefas, visibleLimit]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSelectAll = () => {
    const next = new Set<string>();
    filteredTarefas.forEach(t => next.add(String(t.id || t.task_id)));
    setSelectedIds(next);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDoSingleTask = (id: string) => {
    if (onStartAutomation) {
      onStartAutomation([id], { minTimeSec, maxTimeSec, mode: 'submitted' }, 'submitted');
    }
  };

  const handlePresetChange = (p: 'rapido' | 'normal' | 'seguro' | 'custom') => {
    setPreset(p);
    if (p === 'rapido') {
      setMinTimeSec(60);
      setMaxTimeSec(180);
    } else if (p === 'normal') {
      setMinTimeSec(180);
      setMaxTimeSec(360);
    } else if (p === 'seguro') {
      setMinTimeSec(480);
      setMaxTimeSec(720);
    }
  };

  const formatTimeLabel = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remSec = sec % 60;
    return remSec > 0 ? `${mins}m ${remSec}s` : `${mins}m`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-white" /> Tarefas SP & CMSP
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie, selecione e resolva tarefas e lições de casa das suas salas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {filteredTarefas.length > 0 && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSelectAll}
                className="px-3 py-2 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Selecionar Todas
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDeselectAll}
                className="px-3 py-2 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Limpar
              </motion.button>
            </>
          )}

          {onRefresh && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh}
              className="px-3.5 py-2 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" /> Atualizar
            </motion.button>
          )}
        </div>
      </div>

      {/* CAPTCHA Widget Panel */}
      <CaptchaWidget
        authToken={authToken}
        activeToken={captchaToken}
        onTokenVerified={onCaptchaVerified}
      />

      {/* Search and Filters Bar with Expired Tab */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tarefas por título ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] focus:border-emerald-500/50 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto bg-[#121214] border border-[#27272a] p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todas ({tarefas.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === 'draft'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Rascunhos ({draftCount})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === 'expired'
                ? 'bg-amber-500 text-black shadow-md font-bold'
                : 'text-amber-400 hover:text-amber-300 hover:bg-amber-950/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Expiradas ({expiredCount})
          </button>
        </div>
      </div>

      {filteredTarefas.length === 0 ? (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs space-y-2 shadow-xl">
          <AlertCircle className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
          <div>Nenhuma tarefa encontrada para o filtro selecionado.</div>
          {search && (
            <div className="text-[11px] text-zinc-400">
              Tente pesquisar por outros termos ou limpar a busca.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
          {visibleTarefas.map((t, idx) => {
            const id = String(t.id || t.task_id || idx);
            const isSelected = selectedIds.has(id);
            const isDraft = t.answer_status === 'draft';
            const isExpired = isTaskExpired(t);

            return (
              <div
                key={id}
                className={`bg-[#121214] border rounded-2xl p-3.5 sm:p-4 flex items-center justify-between transition-all shadow-md ${
                  isSelected ? 'border-white bg-zinc-900/60 shadow-white/5' : 'border-[#27272a] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    onClick={() => toggleSelect(id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected ? 'bg-white border-white text-black font-extrabold' : 'border-[#27272a] bg-[#18181b]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-100 truncate">{t.title || 'Tarefa sem título'}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 font-mono truncate">
                      Sala: <span className="text-zinc-300">{t.publication_target || 'Geral'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isExpired ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-medium bg-amber-950/40 border-amber-700/60 text-amber-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" /> Expirada
                    </span>
                  ) : isDraft ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-medium bg-zinc-800 border-zinc-700 text-zinc-300">
                      Rascunho
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-medium bg-emerald-950/40 border-emerald-700/50 text-emerald-300">
                      Pendente
                    </span>
                  )}

                  {onStartAutomation && (
                    <button
                      onClick={() => handleDoSingleTask(id)}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Fazer Agora
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredTarefas.length > visibleLimit && (
            <button
              onClick={() => setVisibleLimit(prev => prev + 30)}
              className="w-full py-3 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-300 text-xs font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <ChevronDown className="w-4 h-4" />
              Mostrar mais ({filteredTarefas.length - visibleLimit} restantes)
            </button>
          )}
        </div>
      )}

      {/* Floating Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="sticky bottom-4 bg-[#121214]/95 backdrop-blur-xl border border-zinc-600 rounded-2xl p-4 flex items-center justify-between shadow-2xl z-20"
          >
            <div className="text-xs font-medium text-zinc-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <strong className="text-white text-sm">{selectedIds.size}</strong> tarefa(s) selecionada(s)
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Configurar e Resolver Tarefas
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Configuration with Min/Max Time controls */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-5"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" /> Configuração do Envio das Tarefas
                </h3>
                <p className="text-xs text-zinc-400">
                  Resolver automaticamente <strong className="text-white font-bold">{selectedIds.size}</strong> tarefa(s) selecionada(s).
                </p>
              </div>

              {/* Preset selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Presets de Velocidade (Anti-Ban)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('rapido')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'rapido'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Rápido
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Mín 1 min • Máx 3 min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('normal')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'normal'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" /> Normal
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Mín 3 min • Máx 6 min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('seguro')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'seguro'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Seguro
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Mín 8 min • Máx 12 min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('custom')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'custom'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      ⚙️ Personalizado
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">Definir tempos manuais</div>
                  </button>
                </div>
              </div>

              {/* Custom Min / Max time inputs */}
              <div className="space-y-3 p-3 bg-[#18181b] border border-[#27272a] rounded-xl">
                <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Ajuste Manual de Tempo</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Intervalo: {formatTimeLabel(minTimeSec)} — {formatTimeLabel(maxTimeSec)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                      Tempo Mínimo (segundos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={minTimeSec}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value) || 1);
                        setMinTimeSec(val);
                        if (val > maxTimeSec) setMaxTimeSec(val);
                        setPreset('custom');
                      }}
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-white text-white font-mono text-xs rounded-xl px-3 py-2 outline-none transition-all"
                    />
                    <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                      ≈ {formatTimeLabel(minTimeSec)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400 mb-1">
                      Tempo Máximo (segundos)
                    </label>
                    <input
                      type="number"
                      min={minTimeSec}
                      value={maxTimeSec}
                      onChange={(e) => {
                        const val = Math.max(minTimeSec, Number(e.target.value) || minTimeSec);
                        setMaxTimeSec(val);
                        setPreset('custom');
                      }}
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-white text-white font-mono text-xs rounded-xl px-3 py-2 outline-none transition-all"
                    />
                    <div className="text-[10px] text-zinc-500 mt-1 font-mono">
                      ≈ {formatTimeLabel(maxTimeSec)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Modo de Envio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('submitted')}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'submitted'
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Entregar Direto (100%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('draft')}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'draft'
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Salvar Rascunho
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#18181b] hover:bg-[#222226] text-zinc-300 text-xs font-medium rounded-xl border border-[#27272a] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    if (onStartAutomation) {
                      onStartAutomation([...selectedIds], { minTimeSec, maxTimeSec, mode }, mode);
                    }
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Iniciar Resolutor 🚀
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};


