import React, { useState } from 'react';
import { CheckSquare, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { TaskItem } from '../types';

interface TarefasViewProps {
  tasks: TaskItem[];
  onRefresh?: () => void;
}

export const TarefasView: React.FC<TarefasViewProps> = ({ tasks, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending'>('all');

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-white" /> Tarefas SP & CMSP
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Gerencie e busque por lições e atividades escolares das suas salas.
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3.5 py-2 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-white" /> Atualizar Tarefas
          </button>
        )}
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
            className="w-full bg-[#121214] border border-[#27272a] focus:border-zinc-500 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all"
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
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs space-y-2">
          <AlertCircle className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
          <div>Nenhuma tarefa encontrada para o filtro atual.</div>
          {search && (
            <div className="text-[11px] text-zinc-400">
              Tente pesquisar por outros termos ou limpar a busca.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredTarefas.map((t, idx) => {
            const isDraft = t.answer_status === 'draft';
            return (
              <div
                key={t.id || t.task_id || idx}
                className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{t.title || 'Tarefa sem título'}</div>
                    <div className="text-xs text-zinc-400 mt-0.5 font-mono">
                      Sala: <span className="text-zinc-300">{t.publication_target || 'Geral'}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[11px] px-2.5 py-1 rounded-full border bg-zinc-800 border-zinc-700 text-zinc-200 font-medium">
                  {isDraft ? 'Rascunho' : 'Pendente'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
