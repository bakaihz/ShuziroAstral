import React from 'react';
import { InternalQuestion } from '../../types/taskExecution';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface QuestionProps {
  question: InternalQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAlternativeId?: string | number;
  onSelectAlternative: (questionId: string | number, alternativeId: string | number) => void;
  essayText?: string;
  onEssayTextChange?: (text: string) => void;
  disabled?: boolean;
}

export const Question: React.FC<QuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAlternativeId,
  onSelectAlternative,
  essayText,
  onEssayTextChange,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-sm">
            {questionNumber}
          </span>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Questão {questionNumber} de {totalQuestions}
          </span>
        </div>

        {question.type === 'essay' ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60">
            Redação
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            Múltipla Escolha
          </span>
        )}
      </div>

      {/* Statement */}
      <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed mb-6">
        {question.statement}
      </div>

      {/* Content depending on question type */}
      {question.type === 'essay' ? (
        <div className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            Sua Redação / Resposta Escrita:
          </label>
          <textarea
            value={essayText || ''}
            onChange={(e) => onEssayTextChange?.(e.target.value)}
            disabled={disabled}
            rows={8}
            placeholder="Digite o texto da sua redação aqui com parágrafos e pontuação adequados..."
            className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition disabled:bg-slate-50 disabled:text-slate-400"
          />
        </div>
      ) : (
        <div className="space-y-3">
          {question.alternatives.map((alt, index) => {
            const isSelected = selectedAlternativeId === alt.id;
            const letter = String.fromCharCode(65 + index); // A, B, C, D...

            return (
              <button
                key={alt.id}
                type="button"
                onClick={() => onSelectAlternative(question.id, alt.id)}
                disabled={disabled}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 group ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 text-slate-700'
                } ${disabled ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="mt-0.5 shrink-0">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center group-hover:border-slate-400">
                      <span className="text-[11px] font-semibold text-slate-500">{letter}</span>
                    </div>
                  )}
                </div>

                <div className="text-sm md:text-base leading-snug">
                  {alt.text}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
