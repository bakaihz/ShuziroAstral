import React, { useState, useEffect } from 'react';
import { InternalTaskExecution } from '../types/taskExecution';
import { salaDoFuturoTaskApi } from '../api/tasks/taskApi';
import { Question } from '../components/task/Question';
import { SubmitButton } from '../components/task/SubmitButton';
import { ArrowLeft, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';

interface TaskDetailsProps {
  taskId: string | number;
  token?: string;
  roomName?: string;
  onBack: () => void;
  onSuccessSubmit: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  taskId,
  token,
  roomName,
  onBack,
  onSuccessSubmit
}) => {
  const [taskExec, setTaskExec] = useState<InternalTaskExecution | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string | number, string | number>>({});
  const [essayTexts, setEssayTexts] = useState<Record<string | number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // 1. Load Task on Mount: GET /api/tms/task/:id/apply
  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const exec = await salaDoFuturoTaskApi.getTask(taskId, {
          token,
          roomName
        });
        if (mounted) {
          setTaskExec(exec);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || 'Erro ao carregar detalhes da tarefa');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [taskId, token, roomName]);

  // Handle alternative selection locally without immediate POST
  const handleSelectAlternative = (questionId: string | number, alternativeId: string | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: alternativeId
    }));
    setSubmitError(null);
  };

  // Handle written answer locally
  const handleEssayTextChange = (questionId: string | number, text: string) => {
    setEssayTexts(prev => ({
      ...prev,
      [questionId]: text
    }));
    setAnswers(prev => ({
      ...prev,
      [questionId]: text
    }));
    setSubmitError(null);
  };

  // Calculate answered count
  const questions = taskExec?.questions || [];
  const answeredCount = questions.filter(q => {
    if (q.type === 'essay') {
      return Boolean(essayTexts[q.id]?.trim());
    }
    return answers[q.id] !== undefined;
  }).length;

  // Final submission handler
  const handleSubmit = async () => {
    if (isSubmitting || !taskExec) return;

    if (answeredCount < questions.length) {
      setSubmitError(`Por favor, responda todas as ${questions.length} questões antes de entregar.`);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await salaDoFuturoTaskApi.submitTask({
        taskId: taskExec.taskId,
        questions: taskExec.questions,
        answers,
        roomName: taskExec.roomName || roomName,
        token
      });

      if (res.success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          onSuccessSubmit();
        }, 1200);
      } else {
        setSubmitError(res.error || 'Não foi possível confirmar o envio da resposta.');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Falha na comunicação ao entregar resposta.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <h3 className="text-base font-semibold text-slate-800">Carregando atividade...</h3>
        <p className="text-sm text-slate-500 mt-1">Obtendo questões e alternativas do servidor</p>
      </div>
    );
  }

  if (error || !taskExec) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm">
        <div className="flex items-center gap-3 text-rose-600 mb-4">
          <AlertTriangle className="w-6 h-6 shrink-0" />
          <h3 className="text-lg font-semibold">Falha ao abrir atividade</h3>
        </div>
        <p className="text-sm text-slate-600 mb-6">{error || 'Tarefa não encontrada'}</p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Tarefas
        </button>

        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Progresso: {answeredCount} de {questions.length} respondidas</span>
        </div>
      </div>

      {/* Title Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 md:p-8 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug mb-2">
          {taskExec.title}
        </h1>
        {taskExec.roomName && (
          <p className="text-xs text-slate-500">
            Ambiente / Turma: <span className="font-mono text-slate-700">{taskExec.roomName}</span>
          </p>
        )}
      </div>

      {/* Feedback Alerts */}
      {submitError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Erro no envio</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {submitSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>Atividade entregue com sucesso! Sincronizando com o servidor...</span>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Question
            key={q.id}
            question={q}
            questionNumber={idx + 1}
            totalQuestions={questions.length}
            selectedAlternativeId={answers[q.id]}
            onSelectAlternative={handleSelectAlternative}
            essayText={essayTexts[q.id]}
            onEssayTextChange={(text) => handleEssayTextChange(q.id, text)}
            disabled={isSubmitting || submitSuccess}
          />
        ))}
      </div>

      {/* Bottom Submit Action */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-sm text-slate-600">
          {answeredCount === questions.length ? (
            <span className="text-emerald-700 font-medium flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Todas as questões respondidas
            </span>
          ) : (
            <span>Restam {questions.length - answeredCount} questão(ões) para responder</span>
          )}
        </div>

        <SubmitButton
          onClick={handleSubmit}
          isSubmitting={isSubmitting}
          disabled={submitSuccess || questions.length === 0}
          answeredCount={answeredCount}
          totalCount={questions.length}
        />
      </div>
    </div>
  );
};
