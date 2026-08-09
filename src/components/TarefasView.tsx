import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckSquare, Search, Filter, AlertCircle, RefreshCw, Play, Sparkles, Check, X } from 'lucide-react';
import { TaskItem } from '../types';

interface TarefasViewProps {
  tasks: TaskItem[];
  authToken?: string;
  onRefresh?: () => void;
  onStartAutomation?: (selectedTaskIds: string[], timeSec: number, mode: 'draft' | 'submitted') => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({ tasks, authToken, onRefresh, onStartAutomation }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [timeSec, setTimeSec] = useState<number>(10);
  const [mode, setMode] = useState<'draft' | 'submitted'>('submitted');

  const tarefas = tasks.filter(t => !t.is_essay);

  const filteredTarefas = tarefas.filter(t => {
    const matchesSearch = search === '' || 
      (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
      (t.publication_target && t.publication_target.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'draft') return t.answer_status === 'draft';
    if (statusFilter === 'pending') return t.answer_status !== 'draft';
    return true;
  });

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
      onStartAutomation([id], 0, 'submitted');
    }
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

      {/* Search and Filters Bar */}
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

        <div className="flex items-center gap-1.5 w-full sm:w-auto bg-[#121214] border border-[#27272a] p-1 rounded-xl">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todas ({tarefas.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'draft'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Rascunhos
          </button>
        </div>
      </div>

      {filteredTarefas.length === 0 ? (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs space-y-2 shadow-xl">
          <AlertCircle className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
          <div>Nenhuma tarefa encontrada para o filtro atual.</div>
          {search && (
            <div className="text-[11px] text-zinc-400">
              Tente pesquisar por outros termos ou limpar a busca.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredTarefas.map((t, idx) => {
            const id = String(t.id || t.task_id || idx);
            const isSelected = selectedIds.has(id);
            const isDraft = t.answer_status === 'draft';
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                whileHover={{ scale: 1.005, translateX: 2 }}
                className={`bg-[#121214] border rounded-2xl p-4 flex items-center justify-between transition-all shadow-md ${
                  isSelected ? 'border-white bg-zinc-900/60 shadow-white/5' : 'border-[#27272a] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleSelect(id)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                      isSelected ? 'bg-white border-white text-black font-extrabold' : 'border-[#27272a] bg-[#18181b]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </motion.div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-100 truncate">{t.title || 'Tarefa sem título'}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 font-mono truncate">
                      Sala: <span className="text-zinc-300">{t.publication_target || 'Geral'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full border font-medium ${
                    isDraft ? 'bg-zinc-800 border-zinc-700 text-zinc-300' : 'bg-zinc-800 border-zinc-700 text-zinc-200'
                  }`}>
                    {isDraft ? 'Rascunho' : 'Pendente'}
                  </span>
                  {onStartAutomation && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDoSingleTask(id)}
                      className="px-3.5 py-1.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" /> Fazer Agora
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
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

      {/* Modal Configuration */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" /> Automação de Tarefas SP & CMSP
              </h3>
              <p className="text-xs text-zinc-400 mb-5">
                Resolver automaticamente <strong className="text-white font-bold">{selectedIds.size}</strong> tarefa(s) selecionada(s).
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Intervalo entre envios (segundos)
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[5, 10, 20, 30].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setTimeSec(sec)}
                        className={`py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                          timeSec === sec
                            ? 'border-white bg-zinc-800 text-white font-bold'
                            : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Modo de Envio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
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
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-[#18181b] hover:bg-[#222226] text-zinc-300 text-xs font-medium rounded-xl border border-[#27272a] transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowModal(false);
                    if (onStartAutomation) {
                      onStartAutomation([...selectedIds], timeSec, mode);
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

