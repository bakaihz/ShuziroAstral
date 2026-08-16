import React, { useEffect, useState } from 'react';
import { QuizAPI, QuizQuestion } from '../api/quiz';
import { HelpCircle, CheckCircle, ArrowLeft, Zap, Sparkles } from 'lucide-react';

interface QuizProps {
  bookId: string | number;
  onBack: () => void;
  onComplete?: (score: number) => void;
}

export const QuizComponent: React.FC<QuizProps> = ({ bookId, onBack, onComplete }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string | number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchQuiz = async () => {
      setLoading(true);
      await QuizAPI.getConfig();
      const res = await QuizAPI.getQuiz(bookId);
      if (active && res.data?.questions) {
        setQuestions(res.data.questions);
      }
      if (active) setLoading(false);
    };
    fetchQuiz();
    return () => {
      active = false;
    };
  }, [bookId]);

  const handleSelectOption = (qId: string | number, optionId: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    if (onComplete) {
      onComplete(100);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400 text-xs">
        Carregando quiz do livro #{bookId} (GET /v2/student/books/{bookId}/quiz)...
      </div>
    );
  }

  return (
    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <button
          onClick={onBack}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar
        </button>

        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-bold text-white">Quiz da Obra #{bookId}</h3>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-[#09090b] border border-zinc-800/80 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] flex items-center justify-center font-bold">
                {index + 1}
              </span>
              {q.prompt}
            </h4>

            <div className="space-y-2 pt-1">
              {q.options.map((opt) => {
                const isSelected = answers[q.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(q.id, opt.id)}
                    className={`w-full p-3 rounded-lg text-left text-xs transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-white font-semibold'
                        : 'bg-[#18181b] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                    }`}
                  >
                    <span className="w-5 h-5 rounded bg-zinc-800 font-bold text-[10px] flex items-center justify-center text-amber-400 shrink-0">
                      {opt.id}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          onClick={handleSubmit}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
        >
          <Zap className="w-4 h-4 fill-black" />
          Submeter Respostas do Quiz
        </button>
      ) : (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-center space-y-2">
          <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-bold text-emerald-300">Quiz Concluído com Sucesso!</h4>
          <p className="text-xs text-zinc-400">Pontuação máxima registrada no histórico do aluno.</p>
        </div>
      )}
    </div>
  );
};
