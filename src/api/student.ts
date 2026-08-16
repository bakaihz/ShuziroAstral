import { ApiClient, ApiResponse } from './client';
import { getEnvironment } from '../config/environment';
import { UserData } from '../types';

export const StudentAPI = {
  async getStudent(userData?: UserData): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1.5/student');
      let raStr = userData?.ra || "";
      let digitoStr = userData?.digito || "";

      if (raStr) {
        const clean = String(raStr).replace(/sp$/i, '');
        if (!digitoStr && clean.length > 1) {
          raStr = clean.slice(0, -1);
          digitoStr = clean.slice(-1);
        } else {
          raStr = clean;
        }
      }

      return {
        status: 200,
        data: {
          id: `std_${userData?.ra || 'active'}`,
          name: userData?.nome || userData?.nick || "Aluno Conectado",
          ra: raStr || userData?.ra || "",
          digito: digitoStr || userData?.digito || "SP",
          uf: "SP",
          grade: userData?.serie || "Ensino Médio",
          schoolName: userData?.escola || "SEDUC SP"
        },
        ok: true
      };
    }
    return ApiClient.get('/v1.5/student');
  },

  async getUserInfo(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1.5/user-info');
      return {
        status: 200,
        data: {
          userId: "user_leia_2026",
          email: "aluno.seduc@educacao.sp.gov.br",
          role: "STUDENT",
          activeSession: true
        },
        ok: true
      };
    }
    return ApiClient.get('/v1.5/user-info');
  },

  async getThermometer(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/thermometer');
      return {
        status: 200,
        data: {
          currentMinutes: 45,
          weeklyGoal: 60,
          percentage: 75,
          daysActive: 4,
          streak: 6
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/student/thermometer');
  },

  async getAlbumPreview(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/album-preview');
      return {
        status: 200,
        data: {
          stickersUnlocked: 18,
          totalStickers: 30,
          recentSticker: "Leitor das Estrelas"
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/student/album-preview');
  },

  async getLatestAnnouncement(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/latest-announcement');
      return {
        status: 200,
        data: {
          id: "ann_01",
          title: "Desafio de Leitura Semanal SEDUC SP",
          content: "Leia ao menos 60 minutos nesta semana para garantir selo especial e pontuação máxima no Termômetro!",
          createdAt: "2026-08-15T10:00:00Z"
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/student/latest-announcement');
  },

  async getNewestAnnouncement(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/newest-announcement');
      return {
        status: 200,
        data: {
          id: "ann_new",
          title: "Novas Obras Clássicas no Acervo Elefante Letrado",
          unread: true
        },
        ok: true
      };
    }
    return ApiClient.get('/v1/student/newest-announcement');
  },

  async getFeedbacks(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/feedbacks');
      return {
        status: 200,
        data: [
          { id: "fb_1", professor: "Profª Maria Silva", message: "Excelente desempenho no Quiz de Dom Casmurro! Parabéns!", date: "2026-08-14" }
        ],
        ok: true
      };
    }
    return ApiClient.get('/v1/student/feedbacks');
  },

  async getAssignmentsReceived(): Promise<ApiResponse<any>> {
    const env = getEnvironment();
    if (env.mode === 'MOCK') {
      ApiClient.get('/v1/student/assignments/received');
      return {
        status: 200,
        data: [
          { assignmentId: "asg_101", title: "Leitura Obrigatória: Vidas Secas", dueDate: "2026-08-30", status: "Em Progresso" }
        ],
        ok: true
      };
    }
    return ApiClient.get('/v1/student/assignments/received');
  }
};
