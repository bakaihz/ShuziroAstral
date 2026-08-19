import { TaskModel, TaskCountModel, CategoryModel } from '../types';
import { normalizeCategories, normalizeTasks } from './normalizers';
import { answerService } from './answerService';

export interface TaskQueryOptions {
  token?: string;
  publicationTargets?: string[];
  nick?: string;
  isEssay?: boolean;
  isExam?: boolean;
  filterExpired?: boolean;
  expiredOnly?: boolean;
  answerStatuses?: string[];
  limit?: number;
  offset?: number;
  nocache?: boolean;
}

export class TaskService {
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
   * 1. GET /tms/task/todo/count
   * Fetches task count independently from the task list.
   */
  public async getTaskCount(options: TaskQueryOptions = {}): Promise<TaskCountModel> {
    const {
      token,
      publicationTargets = [],
      isEssay,
      filterExpired = true,
      answerStatuses
    } = options;

    const params = new URLSearchParams();
    if (isEssay !== undefined) params.append('is_essay', String(isEssay));
    if (filterExpired !== undefined) params.append('filter_expired', String(filterExpired));
    params.append('with_answer', 'true');
    
    if (Array.isArray(answerStatuses) && answerStatuses.length > 0) {
      answerStatuses.forEach(st => params.append('answer_statuses', st));
    }

    publicationTargets.forEach(t => {
      if (t && t.trim()) params.append('publication_target', t.trim());
    });

    try {
      const url = `/api/tms/task/todo/count?${params.toString()}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });

      if (!res.ok) {
        throw new Error(`Erro ao buscar contagem de tarefas: HTTP ${res.status}`);
      }

      const data = await res.json();
      const count = typeof data === 'number' 
        ? data 
        : (data?.count || data?.total || data?.length || 0);

      return {
        total: count,
        pending: count,
        draft: 0,
        expired: 0,
        isEssay: Boolean(isEssay)
      };
    } catch (e: any) {
      console.warn('[TaskService] getTaskCount fallback:', e.message);
      return { total: 0, pending: 0, draft: 0, expired: 0, isEssay: Boolean(isEssay) };
    }
  }

  /**
   * 2. GET /tms/task/targets/categories
   * Loads category taxonomy independently.
   */
  public async getCategories(options: TaskQueryOptions = {}): Promise<{ list: CategoryModel[]; map: Map<number, string> }> {
    const { token, publicationTargets = [], isEssay = false, isExam = false } = options;

    const params = new URLSearchParams();
    params.append('category_parent_id', '19');
    if (isEssay !== undefined) params.append('is_essay', String(isEssay));
    if (isExam !== undefined) params.append('is_exam', String(isExam));

    publicationTargets.forEach(t => {
      if (t && t.trim()) params.append('publication_target', t.trim());
    });

    try {
      const url = `/api/tms/task/targets/categories?${params.toString()}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });

      if (res.ok) {
        const raw = await res.json();
        return normalizeCategories(raw);
      }
    } catch (e: any) {
      console.warn('[TaskService] getCategories fallback:', e.message);
    }

    return { list: [], map: new Map() };
  }

  /**
   * 3. GET /tms/task/todo
   * Single page query with dynamic filters, limit and offset.
   */
  public async getTasksBatch(options: TaskQueryOptions = {}): Promise<any[]> {
    const {
      token,
      publicationTargets = [],
      isEssay,
      isExam = false,
      filterExpired = true,
      expiredOnly = false,
      answerStatuses,
      limit = 100,
      offset = 0,
      nocache = false
    } = options;

    const params = new URLSearchParams();
    params.append('limit', String(limit));
    params.append('offset', String(offset));
    params.append('filter_expired', String(filterExpired));
    params.append('expired_only', String(expiredOnly));
    params.append('is_exam', String(isExam));
    if (isEssay !== undefined) params.append('is_essay', String(isEssay));
    params.append('with_answer', 'true');
    params.append('with_apply_moment', 'true');
    
    if (Array.isArray(answerStatuses) && answerStatuses.length > 0) {
      answerStatuses.forEach(st => params.append('answer_statuses', st));
    }

    if (nocache) params.append('nocache', 'true');

    publicationTargets.forEach(t => {
      if (t && t.trim()) params.append('publication_target', t.trim());
    });

    const url = `/api/tms/task/todo?${params.toString()}`;
    const res = await fetch(url, {
      headers: this.getHeaders(token)
    });

    if (!res.ok) {
      const error: any = new Error(`Falha ao carregar lote de tarefas (HTTP ${res.status})`);
      error.status = res.status;
      throw error;
    }

    const data = await res.json();
    return Array.isArray(data) ? data : (data?.tasks || data?.items || data?.data || data?.results || []);
  }

  /**
   * 4. Full Paginated Task Loading with Category and Answer Enrichment:
   * Loop with limit=100, offset=0, 100, 200...
   * allTasks = [...allTasks, ...newTasks]
   * Connects tasks with answers and categories
   */
  public async getAllTasks(options: TaskQueryOptions = {}): Promise<TaskModel[]> {
    const pageSize = options.limit || 100;
    let currentOffset = 0;
    let allRawTasks: any[] = [];
    let hasMore = true;
    let maxPages = 10; // Safety guard for up to 1000 tasks

    // 1. Fetch categories and answers concurrently if possible
    const [categoriesResult, answersResult] = await Promise.all([
      this.getCategories(options).catch(() => ({ list: [], map: new Map<number, string>() })),
      answerService.getAnswers(options).catch(() => ({ list: [], map: new Map() }))
    ]);

    // 2. Fetch pages in sequence with concatenation
    while (hasMore && maxPages > 0) {
      maxPages--;
      const batch = await this.getTasksBatch({
        ...options,
        limit: pageSize,
        offset: currentOffset
      });

      if (Array.isArray(batch) && batch.length > 0) {
        allRawTasks = [...allRawTasks, ...batch];
        if (batch.length < pageSize) {
          hasMore = false;
        } else {
          currentOffset += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    // 3. Normalize and enrich tasks with answers and categories
    return normalizeTasks(allRawTasks, answersResult.map, categoriesResult.map);
  }
}

export const taskService = new TaskService();
