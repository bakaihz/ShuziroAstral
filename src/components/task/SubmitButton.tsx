import React from 'react';
import { Loader2, Send } from 'lucide-react';

interface SubmitButtonProps {
  onClick: () => void;
  isSubmitting: boolean;
  disabled?: boolean;
  answeredCount: number;
  totalCount: number;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  onClick,
  isSubmitting,
  disabled = false,
  answeredCount,
  totalCount
}) => {
  const isComplete = answeredCount >= totalCount && totalCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isSubmitting}
      className={`inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-medium text-sm transition shadow-sm ${
        isSubmitting
          ? 'bg-slate-400 text-white cursor-wait'
          : isComplete
          ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98]'
          : 'bg-indigo-600/90 hover:bg-indigo-600 text-white'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Enviando resposta ao servidor...</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span>Finalizar e Entregar Atividade</span>
        </>
      )}
    </button>
  );
};
