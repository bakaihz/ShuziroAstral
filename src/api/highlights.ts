import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface HighlightItem {
  id: string;
  bookId: string | number;
  cfi: string;
  text: string;
  color: string;
  createdAt: string;
}

export const HighlightsAPI = {
  async getHighlights(bookId: string | number): Promise<ApiResponse<HighlightItem[]>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/highlights/get-highlights/${bookId}`);
      return {
        status: 200,
        data: [
          {
            id: "hl_1",
            bookId,
            cfi: "epubcfi(/6/2[cover]!/4/2/1:0)",
            text: "Trecho destacado pelo leitor para citação e estudo crítico.",
            color: "yellow",
            createdAt: "2026-08-16"
          }
        ],
        ok: true
      };
    }
    return ApiClient.get(`/v1/highlights/get-highlights/${bookId}`);
  }
};
