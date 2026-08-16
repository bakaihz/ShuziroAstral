import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface ReadingProgressPayload {
  CFI: string;
  BookId: string;
  TimeElapsed: number; // segundos
  ReadType: string;    // "Read"
  Page: number;
  IsComplete: boolean;
  ReadDate: string;    // ex: "16/08/2026"
  PageCount: number;
  TimezoneOffset: number; // ex: 180
}

/**
 * Estrutura extensível para o Reading Monitor.
 * Nota: Os campos específicos adicionais não foram determinados pelo HAR.
 */
export interface ReadingMonitorPayload {
  bookId: string | number;
  timestamp?: number;
  activeWindow?: boolean;
  extraData?: Record<string, any>;
}

export const ReadingAPI = {
  async sendProgress(bookId: string | number, payload: ReadingProgressPayload): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.post(`/v1/student/books/${bookId}/progress_em/Read`, payload);
      return { status: 200, data: { success: true, registeredPage: payload.Page }, ok: true };
    }
    return ApiClient.post(`/v1/student/books/${bookId}/progress_em/Read`, payload);
  },

  async monitorRead(bookId: string | number, payload?: ReadingMonitorPayload): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    const dataToSend = payload || { bookId, timestamp: Date.now(), activeWindow: true };
    if (env.mode === 'MOCK') {
      ApiClient.post(`/v1/reading-monitor/read/${bookId}`, dataToSend);
      return { status: 200, data: { status: "monitored", bookId }, ok: true };
    }
    return ApiClient.post(`/v1/reading-monitor/read/${bookId}`, dataToSend);
  },

  async closeBook(bookId: string | number, currentPageTime: number = 0): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    const endpoint = `/v1/book-reading/close-book/${bookId}/0?currentPageTime=${currentPageTime}`;
    if (env.mode === 'MOCK') {
      ApiClient.post(endpoint);
      return { status: 200, data: { message: "Sessão de leitura encerrada com sucesso.", bookId, currentPageTime }, ok: true };
    }
    return ApiClient.post(endpoint);
  }
};
