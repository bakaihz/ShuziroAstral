import { DisciplinaAlunoItem } from '../types';

export class DisciplineService {
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * GET /apihubintegracoes/api/v2/Disciplina/ListarDisciplinaPorAluno
   * Lists official curriculum disciplines for the student
   */
  public async getStudentDisciplines(
    codigoAluno: string | number,
    token?: string
  ): Promise<DisciplinaAlunoItem[]> {
    const cleanId = String(codigoAluno || '').trim();
    if (!cleanId) return [];

    try {
      const url = `/api/disciplinas?codigoAluno=${encodeURIComponent(cleanId)}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });

      if (!res.ok) {
        throw new Error(`Erro ao consultar disciplinas do aluno (HTTP ${res.status})`);
      }

      const data = await res.json();
      return data?.data || (Array.isArray(data) ? data : []);
    } catch (e: any) {
      console.warn('[DisciplineService] Erro ao listar disciplinas:', e.message);
      return [];
    }
  }
}

export const disciplineService = new DisciplineService();
