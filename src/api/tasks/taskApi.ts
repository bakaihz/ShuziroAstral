import { TaskModel, TaskCountModel } from '../../types';
import { taskService } from '../../services/taskService';
import { answerService } from '../../services/answerService';
import { normalizeTaskApplyQuestions, buildAnswerPayload } from '../../services/salaDoFuturo/normalizers';
import { InternalTaskExecution } from '../../types/taskExecution';

export interface SubmitTaskOptions {
  taskId: string | number;
  questions: any[];
  answers: Record<string | number, string | number>;
  essayTitle?: string;
  essayText?: string;
  duration?: number;
  roomName?: string;
  token?: string;
  captchaToken?: string;
}

export interface TaskSubmitResult {
  success: boolean;
  answerId?: string | number;
  status: string;
  data?: any;
  error?: string;
}

export class SalaDoFuturoTaskApi {
  /**
   * 1. GET /api/tms/task/todo + GET /api/tms/answer
   * Lists tasks and synchronizes answers
   */
  public async listTasks(options: {
    token?: string;
    publicationTargets?: string[];
    isEssay?: boolean;
    filterExpired?: boolean;
  } = {}): Promise<TaskModel[]> {
    return await taskService.getAllTasks(options);
  }

  /**
   * 2. GET /api/tms/task/:id/apply
   * Fetches the raw task questions and normalizes into internal execution model
   */
  public async getTask(
    taskId: string | number,
    options: {
      token?: string;
      roomName?: string;
      answerId?: string | number;
      tokenCode?: string;
      captchaToken?: string;
    } = {}
  ): Promise<InternalTaskExecution> {
    const { token, roomName, answerId, tokenCode, captchaToken } = options;

    const params = new URLSearchParams();
    params.append('preview_mode', 'false');
    if (tokenCode) params.append('token_code', tokenCode);
    else params.append('token_code', 'null');

    if (roomName) params.append('room_name', roomName);
    if (answerId) params.append('answer_id', String(answerId));
    if (captchaToken) params.append('captcha_token', captchaToken);

    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-api-key'] = token;
    }

    const url = `/api/tms/task/${taskId}/apply?${params.toString()}`;
    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`Falha ao abrir tarefa na Sala do Futuro (HTTP ${res.status})`);
    }

    const rawData = await res.json();
    const normalized = normalizeTaskApplyQuestions(rawData);

    return {
      taskId,
      answerId: answerId || rawData?.answer_id || rawData?.answer?.id || null,
      title: normalized.title,
      status: 'in_progress',
      questions: normalized.questions,
      durationSeconds: 0,
      roomName: normalized.roomName || roomName,
      tokenCode: normalized.tokenCode || tokenCode,
      raw: rawData
    };
  }

  /**
   * 3. POST /api/tms/task/:id/answer
   * Submits answers, retrieves answer_id and performs server sync
   */
  public async submitTask(options: SubmitTaskOptions): Promise<TaskSubmitResult> {
    const {
      taskId,
      questions,
      answers,
      essayTitle,
      essayText,
      duration = 35,
      roomName,
      token,
      captchaToken
    } = options;

    const payload = buildAnswerPayload({
      taskId,
      questions,
      answers,
      essayTitle,
      essayText,
      duration,
      roomName,
      status: 'submitted',
      captchaToken
    });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-api-key'] = token;
    }

    // Step 1: POST answer
    const res = await fetch(`/api/tms/task/${taskId}/answer`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorJson = await res.json().catch(() => null);
      return {
        success: false,
        status: 'error',
        error: errorJson?.error || errorJson?.message || `Erro no envio da resposta (HTTP ${res.status})`
      };
    }

    const resultJson = await res.json();
    const answerId = resultJson?.data?.id || resultJson?.id || resultJson?.answer_id;

    // Step 2: Post-submission sync with /apply?answer_id={answer_id}
    if (answerId) {
      try {
        await this.getTask(taskId, {
          token,
          answerId,
          roomName
        });
      } catch (syncErr: any) {
        console.warn('[SalaDoFuturoTaskApi] Aviso ao sincronizar apply pos-envio:', syncErr.message);
      }
    }

    return {
      success: true,
      answerId,
      status: 'submitted',
      data: resultJson
    };
  }

  /**
   * 4. Sync task state with the server
   */
  public async syncTask(taskId: string | number, token?: string): Promise<any> {
    return await answerService.getAnswers({ token, limit: 20 });
  }
}

export const salaDoFuturoTaskApi = new SalaDoFuturoTaskApi();
