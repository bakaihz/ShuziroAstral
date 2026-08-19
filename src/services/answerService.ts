import { AnswerModel, TaskModel } from '../types';
import { normalizeAnswers } from './normalizers';

export interface AnswerQueryOptions {
  token?: string;
  nick?: string;
  publicationTargets?: string[];
  isEssay?: boolean;
  isExam?: boolean;
  status?: string;
  limit?: number;
  offset?: number;
}

export class AnswerService {
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['x-api-key'] = token;
    }
    return headers;
  }

  /**
   * GET /tms/answer
   * Reads existing student answers
   */
  public async getAnswers(options: AnswerQueryOptions = {}): Promise<{ list: AnswerModel[]; map: Map<string | number, AnswerModel> }> {
    const {
      token,
      nick,
      publicationTargets = [],
      isEssay = false,
      isExam = false,
      status,
      limit = 100,
      offset = 0
    } = options;

    const params = new URLSearchParams();
    if (nick) params.append('nick', nick);
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    params.append('task_is_exam', String(isExam));
    params.append('task_is_essay', String(isEssay));
    params.append('with_apply_moment', 'true');
    params.append('order', 'desc');
    params.append('order_by', 'created_at');

    if (status) params.append('status', status);

    publicationTargets.forEach(t => {
      if (t && t.trim()) params.append('publication_target', t.trim());
    });

    try {
      const url = `/api/tms/answer?${params.toString()}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });

      if (!res.ok) {
        throw new Error(`Falha ao ler respostas do servidor (HTTP ${res.status})`);
      }

      const data = await res.json();
      return normalizeAnswers(data);
    } catch (err: any) {
      console.warn('[AnswerService] getAnswers fallback:', err.message);
      return { list: [], map: new Map() };
    }
  }

  /**
   * Enriches a task list with matching answers based on task.id === answer.task_id
   */
  public enrichTasks(tasks: TaskModel[], answersMap: Map<string | number, AnswerModel>): TaskModel[] {
    return tasks.map(t => {
      const answer = answersMap.get(t.id) || answersMap.get(Number(t.id)) || t.answer;
      return {
        ...t,
        answer: answer || null
      };
    });
  }
}

export const answerService = new AnswerService();
