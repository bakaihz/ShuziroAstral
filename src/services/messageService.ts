import { AvisoTurmaItem } from '../types';

export class MessageService {
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
   * GET /muralavisosapi/api/mural-avisos/listar-perfis
   */
  public async getProfiles(token?: string): Promise<any[]> {
    try {
      const res = await fetch('/api/mural-avisos/perfis', {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn('[MessageService] getProfiles fallback:', e.message);
    }
    return [];
  }

  /**
   * GET /muralavisosapi/api/mural-avisos/listar-avisos-turma
   */
  public async getClassNotices(
    codigoUsuario: string | number,
    turmas: string | number,
    perfilAviso: number = 1,
    token?: string
  ): Promise<AvisoTurmaItem[]> {
    try {
      const url = `/api/avisos?codigoUsuario=${encodeURIComponent(String(codigoUsuario))}&turmas=${encodeURIComponent(String(turmas))}&perfilAviso=${perfilAviso}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.data || (Array.isArray(json) ? json : []);
      }
    } catch (e: any) {
      console.warn('[MessageService] getClassNotices fallback:', e.message);
    }
    return [];
  }
}

export const messageService = new MessageService();
