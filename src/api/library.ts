import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface BookItem {
  id: number | string;
  title: string;
  author: string;
  genre: string;
  totalPages: number;
  currentPage: number;
  isRead: boolean;
  coverUrl: string;
  quizScore: number | null;
}

const MOCK_LIBRARY_BOOKS: BookItem[] = [
  { id: 6565, title: "Dom Casmurro", author: "Machado de Assis", genre: "Literatura Brasileira", totalPages: 180, currentPage: 180, isRead: true, coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80", quizScore: 100 },
  { id: 10240, title: "Memórias Póstumas de Brás Cubas", author: "Machado de Assis", genre: "Literatura Clássica", totalPages: 160, currentPage: 80, isRead: false, coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=400&q=80", quizScore: null },
  { id: 10315, title: "Vidas Secas", author: "Graciliano Ramos", genre: "Modernismo Brasileiro", totalPages: 140, currentPage: 140, isRead: true, coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=400&q=80", quizScore: 100 },
  { id: 10450, title: "O Cortiço", author: "Aluísio Azevedo", genre: "Naturalismo", totalPages: 210, currentPage: 0, isRead: false, coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80", quizScore: null },
  { id: 10601, title: "A Hora da Estrela", author: "Clarice Lispector", genre: "Ficção Brasileira", totalPages: 96, currentPage: 96, isRead: true, coverUrl: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=400&q=80", quizScore: 100 },
  { id: 10722, title: "Quincas Borba", author: "Machado de Assis", genre: "Literatura Brasileira", totalPages: 195, currentPage: 0, isRead: false, coverUrl: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=400&q=80", quizScore: null }
];

export const LibraryAPI = {
  async discover(): Promise<ApiResponse<BookItem[]>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/discover/');
      return { status: 200, data: MOCK_LIBRARY_BOOKS, ok: true };
    }
    return ApiClient.get('/v1/library/discover/');
  },

  async getReadings(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/book/readings');
      return {
        status: 200,
        data: {
          readings: MOCK_LIBRARY_BOOKS.filter(b => b.currentPage > 0),
          totalReadings: 4
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/library/book/readings');
  },

  async getFavorites(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/book/favorites');
      return {
        status: 200,
        data: {
          favorites: MOCK_LIBRARY_BOOKS.slice(0, 2),
          totalFavorites: 2
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/library/book/favorites');
  },

  async getSuggestedLevel(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/user-has-suggestedlevel');
      return { status: 200, data: { hasSuggestedLevel: true, level: "Nível Recomendado 3" }, ok: true };
    }
    return ApiClient.get('/v1/library/user-has-suggestedlevel');
  },

  async getReadingProject(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/reading-project-v2');
      return {
        status: 200,
        data: {
          projectId: "proj_2026_sp",
          title: "Projeto de Leitura Intensiva LeiaSP 2026",
          active: true,
          targetBooksCount: 10
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/library/reading-project-v2');
  },

  async getGenrePreview(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/library/genres/preview');
      return {
        status: 200,
        data: [
          { genreId: 1, name: "Literatura Brasileira", count: 12 },
          { genreId: 2, name: "Modernismo", count: 8 },
          { genreId: 3, name: "Contos & Crônicas", count: 15 }
        ],
        ok: true
      };
    }
    return ApiClient.get('/v1/library/genres/preview');
  },

  async getGenre(genreId: number | string, limit: number): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/library/genres/${genreId}/${limit}`);
      return {
        status: 200,
        data: {
          genreId,
          limit,
          books: MOCK_LIBRARY_BOOKS.slice(0, limit)
        },
        ok: true
      };
    }
    return ApiClient.get(`/v1/library/genres/${genreId}/${limit}`);
  },

  async getBooks(categoryId: number | string, limit: number): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/library/books/${categoryId}/${limit}`);
      return {
        status: 200,
        data: {
          categoryId,
          limit,
          books: MOCK_LIBRARY_BOOKS.slice(0, limit)
        },
        ok: true
      };
    }
    return ApiClient.get(`/v1/library/books/${categoryId}/${limit}`);
  },

  async getBannerBooks(grade: string | number): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v1/library/banner-books`, { grade });
      return {
        status: 200,
        data: {
          grade,
          banners: [
            { id: "banner_1", title: "Obras Recomendadas SEDUC", bookId: 6565 }
          ]
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/library/banner-books', { grade });
  }
};
