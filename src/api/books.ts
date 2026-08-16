import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface BookDetail {
  id: string | number;
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  contentUrl?: string;
  epubUrl?: string;
  coverUrl?: string;
  description?: string;
}

export const BooksAPI = {
  async getBook(bookId: string | number): Promise<ApiResponse<BookDetail>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/student/books/${bookId}`);
      return {
        status: 200,
        data: {
          id: bookId,
          title: `Obra Literária #${bookId}`,
          author: "Escritor Selecionado",
          genre: "Literatura Clássica",
          totalPages: 81,
          currentPage: 1,
          description: "Obra recomendada do acervo digital LeiaSP / Elefante Letrado.",
          coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80"
        },
        ok: true
      };
    }
    return ApiClient.get(`/v1/student/books/${bookId}`);
  }
};
