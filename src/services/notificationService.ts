import { NotificacaoCmspItem, MessageModel } from '../types';
import { messageService } from './messageService';
import { normalizeMessages } from './normalizers';

export class NotificationService {
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
   * GET /cmspwebservice/api/sala-do-futuro-alunos/consulta-notificacao-cmsp
   */
  public async getNotifications(
    userId: string | number,
    token?: string
  ): Promise<NotificacaoCmspItem[]> {
    try {
      const url = `/api/notificacoes?userId=${encodeURIComponent(String(userId))}`;
      const res = await fetch(url, {
        headers: this.getHeaders(token)
      });
      if (res.ok) {
        const json = await res.json();
        return Array.isArray(json) ? json : (json?.data || []);
      }
    } catch (e: any) {
      console.warn('[NotificationService] getNotifications fallback:', e.message);
    }
    return [];
  }

  /**
   * Loads both notice board notices and CMSP notifications and normalizes them into unified MessageModel list
   */
  public async getAllMessages(
    userId: string | number,
    turmas: string | number,
    token?: string
  ): Promise<MessageModel[]> {
    const [notices, notifications] = await Promise.all([
      messageService.getClassNotices(userId, turmas, 1, token),
      this.getNotifications(userId, token)
    ]);

    return normalizeMessages(notices, notifications);
  }
}

export const notificationService = new NotificationService();
