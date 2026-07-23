import React from 'react';
import { CheckSquare, Clock, AlertCircle } from 'lucide-react';
import { TaskItem } from '../types';

interface TarefasViewProps {
  tasks: TaskItem[];
}

export const TarefasView: React.FC<TarefasViewProps> = ({ tasks }) => {
  const tarefas = tasks.filter(t => !t.is_essay);

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Tarefas Escolares ({tarefas.length})
      </div>

      {tarefas.length === 0 ? (
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 text-center text-zinc-500 text-sm">
          Nenhuma tarefa escolar pendente encontrada.
        </div>
      ) : (
        <div className="space-y-2">
          {tarefas.map((t, idx) => {
            const isDraft = t.answer_status === 'draft';
            return (
              <div
                key={t.id || t.task_id || idx}
                className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-sm font-medium text-zinc-200">{t.title || 'Tarefa sem título'}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">Sala: {t.publication_target || 'Geral'}</div>
                  </div>
                </div>
                <span className={`text-[11px] px-2.5 py-1 rounded-full border ${
                  isDraft
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}>
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
