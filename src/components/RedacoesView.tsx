import React, { useState } from 'react';
import { PenTool, CheckSquare, Square, Play, Sparkles, Clock, FileText } from 'lucide-react';
import { TaskItem } from '../types';

interface RedacoesViewProps {
  tasks: TaskItem[];
  authToken: string;
  onStartAutomation: (selectedTaskIds: string[], timeSec: number, mode: 'draft' | 'submitted') => void;
}

export const RedacoesView: React.FC<RedacoesViewProps> = ({ tasks, authToken, onStartAutomation }) => {
  const redacoes = tasks.filter(t => t.is_essay !== false);
  const [currentTab, setCurrentTab] = useState<'pending' | 'draft' | 'all'>('pending');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [timeSec, setTimeSec] = useState<number>(10);
  const [mode, setMode] = useState<'draft' | 'submitted'>('draft');

  const filtered = redacoes.filter(t => {
    const status = t.answer_status || 'pending';
    if (currentTab === 'pending') return status !== 'draft' && status !== 'expired';
    if (currentTab === 'draft') return status === 'draft';
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex bg-[#121214] border border-[#27272a] rounded-xl p-1">
          <button
            onClick={() => setCurrentTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'pending' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Pendentes ({redacoes.filter(t => t.answer_status !== 'draft' && t.answer_status !== 'expired').length})
          </button>
          <button
            onClick={() => setCurrentTab('draft')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'draft' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Rascunhos ({redacoes.filter(t => t.answer_status === 'draft').length})
          </button>
          <button
            onClick={() => setCurrentTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'all' ? 'bg-white text-black font-semibold' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Todas ({redacoes.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
          >
            Selecionar Todas
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1.5 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-medium rounded-xl transition-all cursor-pointer"
          >
            Limpar
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center">
          <PenTool className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
          <div className="text-sm font-medium text-zinc-300">Nenhuma redação encontrada nesta categoria.</div>
        </div>
      ) : (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filtered.map((t, idx) => {
            const id = String(t.id || t.task_id);
            const isSelected = selectedIds.has(id);
            const status = t.answer_status || 'pending';
            return (
              <div
                key={id || idx}
                onClick={() => toggleSelect(id)}
                className={`bg-[#121214] border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all ${
                  isSelected ? 'border-white bg-zinc-900/40' : 'border-[#27272a] hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-white border-white text-black font-bold' : 'border-[#27272a] bg-[#18181b]'
                  }`}>
                    {isSelected ? '✓' : ''}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{t.title || 'Redação sem título'}</div>
                    <div className="text-xs text-zinc-500 truncate mt-0.5">Sala: {t.publication_target || 'Geral'}</div>
                  </div>
                </div>
                <span className={`text-[10px] px-2.5 py-1 rounded-full border shrink-0 ${
                  status === 'draft' ? 'bg-zinc-800 border-zinc-700 text-zinc-300' :
                  status === 'expired' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                  'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}>
                  {status === 'draft' ? 'Rascunho' : status === 'expired' ? 'Expirada' : 'Pendente'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 bg-[#121214] border border-zinc-700 rounded-2xl p-4 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom duration-200">
          <div className="text-xs font-medium text-zinc-200">
            <strong className="text-white">{selectedIds.size}</strong> redação(ões) selecionada(s)
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-white/5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Configurar e Gerar Redações
          </button>
        </div>
      )}

      {/* Modal Configuration */}
      {showModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-semibold text-zinc-200 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" /> Automação de Redações por IA
            </h3>
            <p className="text-xs text-zinc-400 mb-4">
              Gerar e salvar <strong className="text-zinc-200">{selectedIds.size}</strong> redações automaticamente.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Intervalo entre envios (anti-ban)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 60].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setTimeSec(sec)}
                      className={`py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        timeSec === sec
                          ? 'border-white bg-zinc-900 text-white font-semibold'
                          : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {sec >= 60 ? '1 min' : `${sec}s`}
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
                    onClick={() => setMode('draft')}
                    className={`py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'draft'
                        ? 'border-white bg-zinc-900 text-white font-semibold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Salvar Rascunho
                  </button>
                  <button
                    onClick={() => setMode('submitted')}
                    className={`py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      mode === 'submitted'
                        ? 'border-white bg-zinc-900 text-white font-semibold'
                        : 'border-[#27272a] bg-[#18181b] text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    Entregar Direto
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
              <button
                onClick={() => {
                  setShowModal(false);
                  onStartAutomation([...selectedIds], timeSec, mode);
                }}
                className="flex-1 py-2.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs rounded-xl transition-all shadow-md shadow-white/5 cursor-pointer"
              >
                Iniciar Automação 🚀
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
