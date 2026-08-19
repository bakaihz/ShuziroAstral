import { VisualTaskStatus } from '../types';

export interface TaskStatusResolution {
  status: VisualTaskStatus;
  label: string;
  isExpired: boolean;
  color: string;
}

/**
 * Resolves the visual status of a task based on its lifecycle properties
 * and associated student answer data.
 */
export function resolveTaskStatus(task: any, answer?: any): TaskStatusResolution {
  const expireAtStr = task?.expire_at || task?.expireAt || task?.data_expiracao || task?.dueDate || task?.due_date;
  let isExpired = false;

  if (task?.task_expired || task?.expired || task?.expired_only) {
    isExpired = true;
  } else if (expireAtStr) {
    const expireTime = new Date(expireAtStr).getTime();
    if (!isNaN(expireTime) && expireTime < Date.now()) {
      isExpired = true;
    }
  }

  // Answer status normalization
  const answerStatus = String(
    answer?.status || 
    answer?.answer_status || 
    task?.answer_status || 
    task?.status || 
    ''
  ).toLowerCase().trim();

  const isDelivered = Boolean(
    answer?.delivered_at || 
    answer?.answer_delivered_at || 
    task?.answer_delivered_at || 
    answerStatus === 'submitted' || 
    answerStatus === 'finished' || 
    answerStatus === 'graded'
  );

  // 1. Graded / Finished
  if (answerStatus === 'graded' || answerStatus === 'finished' || (isDelivered && (answer?.result_score !== undefined || task?.answer_result_score !== undefined))) {
    return {
      status: 'graded',
      label: 'Corrigida',
      isExpired,
      color: 'emerald'
    };
  }

  // 2. Delivered / Submitted
  if (isDelivered || answerStatus === 'submitted') {
    return {
      status: 'delivered',
      label: 'Entregue',
      isExpired,
      color: 'blue'
    };
  }

  // 3. Draft
  if (answerStatus === 'draft') {
    return {
      status: 'draft',
      label: 'Rascunho',
      isExpired,
      color: 'amber'
    };
  }

  // 4. In Progress (started / accessed)
  if (answerStatus === 'pending' || answer?.accessed_on || task?.answer_accessed_on || answer?.answers || task?.answer_answers) {
    if (isExpired) {
      return {
        status: 'expired',
        label: 'Expirada',
        isExpired: true,
        color: 'rose'
      };
    }
    return {
      status: 'in_progress',
      label: 'Em andamento',
      isExpired: false,
      color: 'indigo'
    };
  }

  // 5. Expired before starting
  if (isExpired) {
    return {
      status: 'expired',
      label: 'Expirada',
      isExpired: true,
      color: 'rose'
    };
  }

  // 6. Not started
  return {
    status: 'not_started',
    label: 'Não iniciada',
    isExpired: false,
    color: 'slate'
  };
}
