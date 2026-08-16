import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface BookmarkItem {
  id: string;
  bookId: string | number;
  page: number;
  cfi: string;
  createdAt: string;
}

export const BookmarksAPI = {
  async getBookmarks(bookId: string | number): Promise<ApiResponse<BookmarkItem[]>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/bookmarks/get-bookmarks/${bookId}`);
      return {
        status: 200,
        data: [
          {
            id: "bm_1",
            bookId,
            page: 12,
            cfi: "epubcfi(/6/4[chap02]!/4/2)",
            createdAt: "2026-08-16"
          }
        ],
        ok: true
      };
    }
    return ApiClient.get(`/v1/bookmarks/get-bookmarks/${bookId}`);
  }
};
