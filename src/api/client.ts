import { getEnvironment } from '../config/environment';
import { AuthManager } from './auth';

export interface ApiResponse<T = any> {
  status: number;
  data: T | null;
  error?: string;
  ok: boolean;
}

class ApiClientClass {
  private getBaseUrl(): string {
    const env = getEnvironment();
    if (env.mode === 'REAL') {
      // Em ambiente de navegador, usa a rota do proxy backend para contornar restrições de CORS
      if (typeof window !== 'undefined') {
        return env.proxyBaseUrl;
      }
      return env.apiBaseUrl;
    }
    return '';
  }

  private log(method: string, path: string, status: number) {
    const env = getEnvironment();
    if (env.enableLogs) {
      console.log(`[API] ${method.toUpperCase()} ${path} → ${status}`);
    }
  }

  public async request<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const env = getEnvironment();
    const { method = 'GET', body, params } = options;

    let fullPath = path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => searchParams.append(k, String(v)));
      fullPath += `?${searchParams.toString()}`;
    }

    if (env.mode === 'MOCK') {
      this.log(method, fullPath, 200);
      return { status: 200, data: null, ok: true };
    }

    const token = AuthManager.getToken();
    if (!token) {
      this.log(method, fullPath, 401);
      return {
        status: 401,
        data: null,
        error: 'Token de autenticação ausente. Por favor, conecte-se.',
        ok: false
      };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}${fullPath.startsWith('/') ? '' : '/'}${fullPath}`;

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      const status = res.status;
      this.log(method, fullPath, status);

      if (status === 204) {
        return { status: 204, data: null, ok: true };
      }

      let parsedData = null;
      const text = await res.text();
      if (text) {
        try {
          parsedData = JSON.parse(text);
        } catch {
          parsedData = text as any;
        }
      }

      if (status === 401) {
        AuthManager.notifyExpired();
        return {
          status: 401,
          data: parsedData,
          error: 'Sessão/Token expirado ou inválido (401).',
          ok: false
        };
      }

      if (status === 403) {
        return { status: 403, data: parsedData, error: 'Acesso negado (403).', ok: false };
      }

      if (status === 404) {
        return { status: 404, data: parsedData, error: 'Recurso não encontrado (404).', ok: false };
      }

      if (status === 429) {
        return { status: 429, data: parsedData, error: 'Limite de requisições excedido (429).', ok: false };
      }

      if (status >= 500) {
        return { status, data: parsedData, error: `Erro no servidor (${status}).`, ok: false };
      }

      if (!res.ok) {
        return { status, data: parsedData, error: `Requisição falhou com status ${status}`, ok: false };
      }

      return { status, data: parsedData, ok: true };
    } catch (e: any) {
      this.log(method, fullPath, 0);
      return {
        status: 0,
        data: null,
        error: e.message || 'Erro de conexão/rede ou timeout.',
        ok: false
      };
    }
  }

  public async get<T = any>(path: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', params });
  }

  public async post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'POST', body });
  }
}

export const ApiClient = new ApiClientClass();
