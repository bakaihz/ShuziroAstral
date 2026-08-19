import { InternalQuestion, InternalAlternative, InternalTaskExecution } from '../../types/taskExecution';

/**
 * Normalizes raw question and alternatives data from /tms/task/:id/apply into our strictly typed InternalQuestion array.
 * Robust to various API structures (questions array, items array, raw objects).
 */
export function normalizeTaskApplyQuestions(rawApplyData: any): {
  title: string;
  questions: InternalQuestion[];
  roomName?: string;
  tokenCode?: string | null;
} {
  const title = String(rawApplyData?.title || rawApplyData?.titulo || 'Atividade').trim();
  const roomName = rawApplyData?.room_name || rawApplyData?.publication_target || rawApplyData?.executed_on;
  const tokenCode = rawApplyData?.token_code || null;

  // Extract raw questions list
  let rawList: any[] = [];
  if (Array.isArray(rawApplyData)) {
    rawList = rawApplyData;
  } else if (Array.isArray(rawApplyData?.questions)) {
    rawList = rawApplyData.questions;
  } else if (Array.isArray(rawApplyData?.items)) {
    rawList = rawApplyData.items;
  } else if (Array.isArray(rawApplyData?.data)) {
    rawList = rawApplyData.data;
  } else if (Array.isArray(rawApplyData?.task?.questions)) {
    rawList = rawApplyData.task.questions;
  }

  const questions: InternalQuestion[] = [];

  rawList.forEach((q: any, index: number) => {
    if (!q) return;

    const qId = q.id || q.question_id || q.codigo || index + 1;
    const statement = q.statement || q.enunciado || q.title || q.titulo || q.text || q.texto || `Questão ${index + 1}`;
    const isEssay = Boolean(q.is_essay || q.type === 'essay' || q.tipo === 'redacao');

    // Extract alternatives
    const rawAlts = q.alternatives || q.options || q.alternativas || q.opcoes || [];
    const alternatives: InternalAlternative[] = [];

    if (Array.isArray(rawAlts)) {
      rawAlts.forEach((alt: any, altIdx: number) => {
        if (!alt) return;
        const altId = alt.id !== undefined ? alt.id : (alt.value !== undefined ? alt.value : altIdx);
        const altText = String(alt.text || alt.texto || alt.label || alt.value || `Opção ${altIdx + 1}`).trim();
        alternatives.push({
          id: altId,
          text: altText,
          value: alt.value !== undefined ? alt.value : altId
        });
      });
    }

    questions.push({
      id: qId,
      order: index + 1,
      statement,
      type: isEssay ? 'essay' : 'multiple_choice',
      alternatives,
      selectedAlternativeId: undefined,
      textAnswer: undefined,
      isAnswered: false
    });
  });

  return {
    title,
    questions,
    roomName,
    tokenCode
  };
}

/**
 * Builds the exact API answer payload according to EduSP TMS requirements.
 * Does NOT invent arbitrary properties.
 */
export function buildAnswerPayload(params: {
  taskId: string | number;
  questions: InternalQuestion[];
  answers: Record<string | number, string | number>;
  essayText?: string;
  essayTitle?: string;
  duration?: number;
  roomName?: string;
  status?: 'draft' | 'submitted';
  captchaToken?: string;
}) {
  const {
    taskId,
    questions,
    answers,
    essayText,
    essayTitle,
    duration = 35,
    roomName,
    status = 'submitted',
    captchaToken
  } = params;

  const answersDict: Record<string, any> = {};

  questions.forEach(q => {
    const qIdStr = String(q.id);
    const selected = answers[q.id];

    if (q.type === 'essay') {
      answersDict[qIdStr] = {
        title: essayTitle || 'Redação Escolar',
        text: essayText || (typeof selected === 'string' ? selected : '')
      };
    } else if (selected !== undefined && selected !== null) {
      // Multiple choice option answer format
      answersDict[qIdStr] = selected;
    }
  });

  const payload: Record<string, any> = {
    task_id: taskId,
    status: status,
    answers: answersDict,
    duration: Math.max(15, Number(duration) || 30),
    executed_on: roomName || undefined
  };

  if (captchaToken) {
    payload['captcha_token'] = captchaToken;
  }

  return payload;
}
