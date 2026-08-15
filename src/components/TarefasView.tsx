import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Search, Filter, AlertCircle, RefreshCw, Play, Sparkles, Check, X, Clock, ShieldCheck, Zap, ChevronDown, Cloud, Layers, CheckCheck, ListFilter } from 'lucide-react';
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
    optionsOrTimeSec: number | { minTimeSec: number; maxTimeSec: number; mode: 'draft' | 'submitted'; concurrency?: number },
    mode?: 'draft' | 'submitted'
  ) => void;
  activeBatch?: {
    batchId: string;
    progress: number;
    total: number;
    completedCount: number;
    failedCount: number;
    status: string;
    currentTaskTitle?: string;
  } | null;
  onOpenBatchProgress?: () => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({ 
  tasks, 
  authToken, 
  captchaToken,
  onCaptchaVerified,
  onRefresh, 
  onStartAutomation,
  activeBatch,
  onOpenBatchProgress
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'draft' | 'expired'>('all');
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(40);
  
  // Time configuration state (Min and Max)
  const [minTimeSec, setMinTimeSec] = useState<number>(30);
  const [maxTimeSec, setMaxTimeSec] = useState<number>(90);
  const [preset, setPreset] = useState<'turbo' | 'rapido' | 'normal' | 'seguro' | 'custom'>('rapido');
  const [mode, setMode] = useState<'draft' | 'submitted'>('submitted');
  const [concurrency, setConcurrency] = useState<number>(1);

  const tarefas = useMemo(() => tasks.filter(t => !t.is_essay), [tasks]);

  // Extract all unique rooms/salas for filtering
  const availableRooms = useMemo(() => {
    const rooms = new Set<string>();
    for (const t of tarefas) {
      const r = t.publication_target || (t as any).room_name || '';
      if (r) rooms.add(r);
    }
    return Array.from(rooms);
  }, [tarefas]);

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

      if (selectedRoom !== 'all') {
        const r = t.publication_target || (t as any).room_name || '';
        if (r !== selectedRoom) return false;
      }

      if (statusFilter === 'draft') return t.answer_status === 'draft';
      if (statusFilter === 'pending') return !isTaskExpired(t) && t.answer_status !== 'draft';
      if (statusFilter === 'expired') return isTaskExpired(t);
      return true;
    });
  }, [tarefas, search, statusFilter, selectedRoom]);

  const visibleTarefas = useMemo(() => {
    return filteredTarefas.slice(0, visibleLimit);
  }, [filteredTarefas, visibleLimit]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Multi-Tarefas selection handlers
  const handleSelectAllFiltered = () => {
    const next = new Set(selectedIds);
    filteredTarefas.forEach(t => next.add(String(t.id || t.task_id)));
    setSelectedIds(next);
  };

  const handleSelectPending = () => {
    const next = new Set(selectedIds);
    tarefas.filter(t => !isTaskExpired(t) && t.answer_status !== 'draft').forEach(t => {
      next.add(String(t.id || t.task_id));
    });
    setSelectedIds(next);
  };

  const handleSelectDrafts = () => {
    const next = new Set(selectedIds);
    tarefas.filter(t => t.answer_status === 'draft').forEach(t => {
      next.add(String(t.id || t.task_id));
    });
    setSelectedIds(next);
  };

  const handleInvertSelection = () => {
    const next = new Set<string>();
    filteredTarefas.forEach(t => {
      const id = String(t.id || t.task_id);
      if (!selectedIds.has(id)) next.add(id);
    });
    setSelectedIds(next);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDoSingleTask = (id: string) => {
    if (onStartAutomation) {
      onStartAutomation([id], { minTimeSec, maxTimeSec, mode: 'submitted', concurrency: 1 }, 'submitted');
    }
  };

  const handlePresetChange = (p: 'turbo' | 'rapido' | 'normal' | 'seguro' | 'custom') => {
    setPreset(p);
    if (p === 'turbo') {
      setMinTimeSec(15);
      setMaxTimeSec(30);
    } else if (p === 'rapido') {
      setMinTimeSec(30);
      setMaxTimeSec(90);
    } else if (p === 'normal') {
      setMinTimeSec(120);
      setMaxTimeSec(240);
    } else if (p === 'seguro') {
      setMinTimeSec(300);
      setMaxTimeSec(600);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-700 shadow-sm shrink-0 bg-zinc-900 flex items-center justify-center">
              <img 
                src="https://static.vecteezy.com/ti/vetor-gratis/p1/26587905-cuidadosamente-projetado-lista-de-controle-icone-representa-uma-lista-do-tarefas-ou-itens-para-estar-concluido-frequentemente-usava-dentro-produtividade-e-organizacao-apps-vetor.jpg" 
                alt="Tarefas" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span>Tarefas SP & Multi-Tarefas</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Selecione várias lições e resolva em segundo plano no servidor (continua rodando mesmo com o site fechado).
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3.5 py-2 bg-[#18181b] hover:bg-[#222226] active:scale-[0.98] border border-[#27272a] text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white" /> Atualizar
            </button>
          )}
        </div>
      </div>

      {/* Active Background Batch Status Alert (if running) */}
      {activeBatch && activeBatch.status === 'running' && (
        <div className="bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-950 border border-red-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" /> Multi-Tarefas em Execução no Servidor
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5">
                Progresso: <strong className="text-white">{activeBatch.completedCount}</strong> de <strong className="text-white">{activeBatch.total}</strong> ({activeBatch.progress}%) • {activeBatch.currentTaskTitle || 'Processando...'}
              </div>
            </div>
          </div>
          {onOpenBatchProgress && (
            <button
              onClick={onOpenBatchProgress}
              className="px-3 py-1.5 bg-white hover:bg-zinc-200 text-black text-xs font-extrabold rounded-xl transition-all shadow-md cursor-pointer self-end sm:self-auto"
            >
              Ver Detalhes / Logs
            </button>
          )}
        </div>
      )}

      {/* CAPTCHA Widget Panel */}
      <CaptchaWidget
        authToken={authToken}
        activeToken={captchaToken}
        onTokenVerified={onCaptchaVerified}
      />

      {/* Multi-Selection Action Toolbar */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono text-zinc-400 uppercase font-bold flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5 text-red-500" /> Multi-Seleção:
          </span>
          <button
            onClick={handleSelectAllFiltered}
            className="px-2.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 text-xs font-medium rounded-lg border border-[#27272a] transition-all cursor-pointer"
          >
            Todas ({filteredTarefas.length})
          </button>
          <button
            onClick={handleSelectPending}
            className="px-2.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 text-xs font-medium rounded-lg border border-[#27272a] transition-all cursor-pointer"
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={handleSelectDrafts}
            className="px-2.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-200 text-xs font-medium rounded-lg border border-[#27272a] transition-all cursor-pointer"
          >
            Rascunhos ({draftCount})
          </button>
          <button
            onClick={handleInvertSelection}
            className="px-2.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] text-zinc-400 hover:text-zinc-200 text-xs font-medium rounded-lg border border-[#27272a] transition-all cursor-pointer"
          >
            Inverter
          </button>
          {selectedIds.size > 0 && (
            <button
              onClick={handleDeselectAll}
              className="px-2.5 py-1.5 bg-red-950/30 hover:bg-red-950/50 text-red-400 text-xs font-medium rounded-lg border border-red-500/20 transition-all cursor-pointer"
            >
              Desmarcar ({selectedIds.size})
            </button>
          )}
        </div>

        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowModal(true)}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-red-600 fill-red-600" />
            Executar {selectedIds.size} Selecionada(s)
          </button>
        )}
      </div>

      {/* Search and Filters Bar with Room Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar tarefas por título ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] focus:border-zinc-500 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all shadow-inner"
          />
        </div>

        {availableRooms.length > 0 && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full sm:w-auto bg-[#121214] border border-[#27272a] text-zinc-300 text-xs rounded-xl px-3 py-2.5 outline-none cursor-pointer"
            >
              <option value="all">Todas as Salas ({availableRooms.length})</option>
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  Sala: {room}
                </option>
              ))}
            </select>
          </div>
        )}

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

      {/* Task List */}
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
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-mono font-medium bg-red-500/10 border-red-500/30 text-red-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-red-500" /> Expirada
                    </span>
                  ) : isDraft ? (
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-mono font-medium bg-zinc-800 border-zinc-700 text-zinc-400">
                      Rascunho
                    </span>
                  ) : (
                    <span className="text-[11px] px-2.5 py-1 rounded-full border font-mono font-medium bg-zinc-900 border-zinc-700 text-zinc-300">
                      Pendente
                    </span>
                  )}

                  {onStartAutomation && (
                    <button
                      onClick={() => handleDoSingleTask(id)}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Fazer
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
            <div className="text-xs font-medium text-zinc-200 flex items-center gap-2 font-mono">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <strong className="text-white text-sm">{selectedIds.size}</strong> tarefa(s) selecionada(s)
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Configurar e Iniciar Multi-Tarefas
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Configuration with Multi-Tarefas & Background Server Engine controls */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-5 my-8"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-400 to-white" />
              
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" /> Configuração do Multi-Tarefas
                </h3>
                <p className="text-xs text-zinc-400">
                  Executar <strong className="text-white font-bold">{selectedIds.size}</strong> tarefa(s) selecionada(s) simultaneamente.
                </p>
              </div>

              {/* Background Execution Feature Badge */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-3">
                <Cloud className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="text-emerald-300 font-bold">Execução Contínua em Segundo Plano</div>
                  <div className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                    O servidor continuará resolvendo e enviando as tarefas <strong>mesmo se você fechar a aba, desligar a tela ou sair do site</strong>. Ao retornar, o progresso estará atualizado!
                  </div>
                </div>
              </div>

              {/* Preset selection */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Velocidade / Intervalo Anti-Ban
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('turbo')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'turbo'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-white text-[11px]">
                      <Zap className="w-3 h-3 text-amber-400 fill-amber-400" /> Turbo
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">15s — 30s</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('rapido')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'rapido'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-white text-[11px]">
                      <Zap className="w-3 h-3 text-red-500 fill-red-500" /> Rápido
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">30s — 1.5m</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('normal')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'normal'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-white text-[11px]">
                      <Clock className="w-3 h-3 text-zinc-300" /> Normal
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">2m — 4m</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('seguro')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'seguro'
                        ? 'border-white bg-zinc-800 text-white font-bold shadow-md'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold text-white text-[11px]">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Seguro
                    </div>
                    <div className="text-[9px] text-zinc-400 mt-0.5 font-mono">5m — 10m</div>
                  </button>
                </div>
              </div>

              {/* Custom Min / Max time inputs */}
              <div className="space-y-3 p-3 bg-[#18181b] border border-[#27272a] rounded-xl">
                <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Ajuste Fino de Tempo</span>
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
                      min={5}
                      value={minTimeSec}
                      onChange={(e) => {
                        const val = Math.max(5, Number(e.target.value) || 5);
                        setMinTimeSec(val);
                        if (val > maxTimeSec) setMaxTimeSec(val);
                        setPreset('custom');
                      }}
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-white text-white font-mono text-xs rounded-xl px-3 py-2 outline-none transition-all"
                    />
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
                  </div>
                </div>
              </div>

              {/* Concurrency Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                    Velocidade de Processamento
                  </label>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {concurrency === 1 ? '1 tarefa por vez (Padrão)' : `${concurrency} tarefas simultâneas (Ultra Rápido)`}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setConcurrency(c)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        concurrency === c
                          ? 'border-white bg-zinc-800 text-white shadow-md'
                          : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      {c}x {c === 1 ? 'Normal' : c === 2 ? 'Rápido' : c === 3 ? 'Turbo' : 'Max'}
                    </button>
                  ))}
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
                    Entregar Direto (100% Acerto)
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
                      onStartAutomation([...selectedIds], { minTimeSec, maxTimeSec, mode, concurrency }, mode);
                    }
                  }}
                  className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Cloud className="w-4 h-4 text-black" /> Iniciar no Servidor 🚀
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
