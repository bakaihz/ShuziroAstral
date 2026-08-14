import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PenTool, CheckSquare, Play, Sparkles, Search, Check, X, Clock, Zap, ShieldCheck } from 'lucide-react';
import { TaskItem } from '../types';
import { isTaskExpired } from './TarefasView';
import { CaptchaWidget } from './CaptchaWidget';

interface RedacoesViewProps {
  tasks: TaskItem[];
  authToken: string;
  captchaToken?: string;
  onCaptchaVerified?: (token: string) => void;
  onStartAutomation: (
    selectedTaskIds: string[],
    optionsOrTimeSec: number | { minTimeSec: number; maxTimeSec: number; mode: 'draft' | 'submitted' },
    mode?: 'draft' | 'submitted'
  ) => void;
}

export const RedacoesView: React.FC<RedacoesViewProps> = ({ 
  tasks, 
  authToken, 
  captchaToken,
  onCaptchaVerified,
  onStartAutomation 
}) => {
  const redacoes = tasks.filter(t => t.is_essay !== false);
  const [currentTab, setCurrentTab] = useState<'pending' | 'draft' | 'expired' | 'all'>('pending');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  
  // Min and Max time configuration
  const [minTimeSec, setMinTimeSec] = useState<number>(60);
  const [maxTimeSec, setMaxTimeSec] = useState<number>(180);
  const [preset, setPreset] = useState<'rapido' | 'normal' | 'seguro' | 'custom'>('rapido');
  const [mode, setMode] = useState<'draft' | 'submitted'>('draft');

  const pendingCount = redacoes.filter(t => !isTaskExpired(t) && t.answer_status !== 'draft').length;
  const draftCount = redacoes.filter(t => t.answer_status === 'draft').length;
  const expiredCount = redacoes.filter(t => isTaskExpired(t)).length;

  const filtered = redacoes.filter(t => {
    const matchesSearch = search === '' ||
      (t.title && t.title.toLowerCase().includes(search.toLowerCase())) ||
      (t.publication_target && t.publication_target.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (currentTab === 'pending') return !isTaskExpired(t) && t.answer_status !== 'draft';
    if (currentTab === 'draft') return t.answer_status === 'draft';
    if (currentTab === 'expired') return isTaskExpired(t);
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
    filtered.forEach(t => next.add(String(t.id || t.task_id)));
    setSelectedIds(next);
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-zinc-700 shadow-sm shrink-0 bg-zinc-900 flex items-center justify-center">
              <img 
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQroFJxwJ0-n17TqNJJb0-qCsFoHNixRNwIXdaD4VNDBg&s=10" 
                alt="Redação" 
                className="w-full h-full object-cover" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <span>Redações SP Paulista</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gere, elabore e envie redações dissertativas automaticamente via IA.
          </p>
        </div>
      </div>

      {/* CAPTCHA Widget Panel */}
      <CaptchaWidget
        authToken={authToken}
        activeToken={captchaToken}
        onTokenVerified={onCaptchaVerified}
      />

      {/* Search and Tab Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar redações por tema ou sala..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#121214] border border-[#27272a] focus:border-purple-500/50 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all shadow-inner"
          />
        </div>

        <div className="flex bg-[#121214] border border-[#27272a] rounded-xl p-1 w-full sm:w-auto overflow-x-auto gap-1">
          <button
            onClick={() => setCurrentTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'pending' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pendentes ({pendingCount})
          </button>
          <button
            onClick={() => setCurrentTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'draft' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Rascunhos ({draftCount})
          </button>
          <button
            onClick={() => setCurrentTab('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'expired' ? 'bg-amber-500 text-black shadow-md font-bold' : 'text-amber-400 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Expiradas ({expiredCount})
          </button>
          <button
            onClick={() => setCurrentTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              currentTab === 'all' ? 'bg-white text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todas ({redacoes.length})
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSelectAll}
            className="px-3 py-2 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Selecionar Todas
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDeselectAll}
            className="px-3 py-2 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
          >
            Limpar
          </motion.button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center shadow-xl">
          <PenTool className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-zinc-300">Nenhuma redação encontrada nesta categoria.</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map((t, idx) => {
            const id = String(t.id || t.task_id);
            const isSelected = selectedIds.has(id);
            const isDraft = t.answer_status === 'draft';
            const isExpired = isTaskExpired(t);

            return (
              <motion.div
                key={id || idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: Math.min(idx * 0.03, 0.3) }}
                whileHover={{ scale: 1.005, translateX: 2 }}
                onClick={() => toggleSelect(id)}
                className={`bg-[#121214] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all shadow-md ${
                  isSelected ? 'border-purple-500/80 bg-purple-950/20 shadow-purple-500/5' : 'border-[#27272a] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div 
                    whileTap={{ scale: 0.85 }}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-400 border-purple-400 text-black font-extrabold' : 'border-[#27272a] bg-[#18181b]'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </motion.div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-100 truncate">{t.title || 'Redação sem título'}</div>
                    <div className="text-xs text-zinc-400 truncate mt-0.5">Sala: {t.publication_target || 'Geral'}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 font-medium ${
                  isExpired ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' :
                  isDraft ? 'bg-[#18181b] border-zinc-700 text-zinc-300' :
                  'bg-purple-500/10 border-purple-500/30 text-purple-300'
                }`}>
                  {isExpired ? 'Expirada' : isDraft ? 'Rascunho' : 'Pendente'}
                </span>
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
            className="sticky bottom-4 bg-[#121214]/95 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-4 flex items-center justify-between shadow-2xl z-20"
          >
            <div className="text-xs font-medium text-zinc-200 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
              <strong className="text-white text-sm">{selectedIds.size}</strong> redação(ões) selecionada(s)
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-500 via-indigo-400 to-purple-400 hover:from-purple-400 hover:to-indigo-300 text-white font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Configurar e Gerar Redações
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
              className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden space-y-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-zinc-400 to-white" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-red-500" /> Automação de Redações por IA
                </h3>
                <p className="text-xs text-zinc-400">
                  Gerar e enviar <strong className="text-white font-bold">{selectedIds.size}</strong> redação(ões) automaticamente.
                </p>
              </div>

              {/* Presets */}
              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider font-mono">
                  Presets de Velocidade (Anti-Ban)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePresetChange('rapido')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'rapido'
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Rápido
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Mín 1 min • Máx 3 min</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePresetChange('normal')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      preset === 'normal'
                        ? 'border-white bg-zinc-800 text-white font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-extrabold text-white">
                      <Clock className="w-3.5 h-3.5 text-zinc-300" /> Normal
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">Mín 3 min • Máx 6 min</div>
                  </button>
                </div>
              </div>

              {/* Min/Max Manual Input */}
              <div className="space-y-2 p-3 bg-[#18181b] border border-[#27272a] rounded-xl">
                <div className="text-[11px] font-semibold text-zinc-300 flex items-center justify-between">
                  <span>Tempo Mínimo e Máximo</span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {formatTimeLabel(minTimeSec)} — {formatTimeLabel(maxTimeSec)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400 mb-1">Mínimo (s)</label>
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
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-purple-500 text-white font-mono text-xs rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-zinc-400 mb-1">Máximo (s)</label>
                    <input
                      type="number"
                      min={minTimeSec}
                      value={maxTimeSec}
                      onChange={(e) => {
                        const val = Math.max(minTimeSec, Number(e.target.value) || minTimeSec);
                        setMaxTimeSec(val);
                        setPreset('custom');
                      }}
                      className="w-full bg-[#121214] border border-[#27272a] focus:border-purple-500 text-white font-mono text-xs rounded-xl px-3 py-1.5 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Modo de Envio
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMode('draft')}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'draft'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-300 font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('submitted')}
                    className={`py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'submitted'
                        ? 'border-purple-400 bg-purple-950/40 text-purple-300 font-bold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Entregar Direto
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
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-extrabold text-xs rounded-xl transition-all shadow-md cursor-pointer"
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

