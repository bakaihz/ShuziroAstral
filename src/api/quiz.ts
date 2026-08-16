import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';

export interface QuizConfig {
  enabled: boolean;
  minPassingScore: number;
  timeLimitSeconds: number;
}

export interface QuizQuestion {
  id: number | string;
  prompt: string;
  options: { id: string; text: string }[];
}

export const QuizAPI = {
  async getConfig(): Promise<ApiResponse<QuizConfig>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/quiz/config');
      return {
        status: 200,
        data: {
          enabled: true,
          minPassingScore: 70,
          timeLimitSeconds: 600
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/quiz/config');
  },

  async getQuiz(bookId: string | number): Promise<ApiResponse<{ bookId: string | number; questions: QuizQuestion[] }>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get(`/v2/student/books/${bookId}/quiz`);
      return {
        status: 200,
        data: {
          bookId,
          questions: [
            {
              id: 1,
              prompt: "Qual o tema e reflexão filosófica central abordados na obra?",
              options: [
                { id: "A", text: "A dicotomia entre aparência social e essência humana" },
                { id: "B", text: "Disputa territorial em viagens espaciais" },
                { id: "C", text: "Competicionismo mercantil contemporâneo" },
                { id: "D", text: "Manual de mecânica industrial" }
              ]
            },
            {
              id: 2,
              prompt: "Qual traço de estilo do autor sobressai na construção do texto?",
              options: [
                { id: "A", text: "Uso marcante de ironia, digressões e análise psicológica" },
                { id: "B", text: "Repetição de jargões técnicos de programação" },
                { id: "C", text: "Linguagem puramente publicitária" },
                { id: "D", text: "Textos curtos sem conectivos lógicos" }
              ]
            }
          ]
        },
        ok: true
      };
    }
    return ApiClient.get(`/v2/student/books/${bookId}/quiz`);
  }
};
