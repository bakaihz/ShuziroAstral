import { AuthStatus, UserData } from '../types';

export interface ValidarTokenResult {
  valid: boolean;
  status: AuthStatus;
  data?: any;
  error?: string;
}

export class AuthService {
  private token: string = '';
  private authStatus: AuthStatus = 'unauthenticated';

  constructor(initialToken: string = '') {
    this.token = initialToken;
    this.authStatus = initialToken ? 'authenticated' : 'unauthenticated';
  }

  public setToken(token: string) {
    this.token = token;
    this.authStatus = token ? 'authenticated' : 'unauthenticated';
  }

  public getToken(): string {
    return this.token;
  }

  public getStatus(): AuthStatus {
    return this.authStatus;
  }

  /**
   * Validates student session token on SED / Sala do Futuro credentials API
   * POST /saladofuturobffapi/credenciais/api/ValidarToken
   */
  public async validateToken(token?: string): Promise<ValidarTokenResult> {
    const activeToken = token || this.token;
    if (!activeToken) {
      this.authStatus = 'unauthenticated';
      return { valid: false, status: 'unauthenticated', error: 'Token não fornecido' };
    }

    this.authStatus = 'authenticationLoading';

    try {
      const res = await fetch('/api/credenciais/validar-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ token: activeToken })
      });

      if (!res.ok) {
        this.authStatus = 'authenticationError';
        return {
          valid: false,
          status: 'authenticationError',
          error: `Erro de validação (HTTP ${res.status})`
        };
      }

      const data = await res.json();
      if (data && (data.LOGIN || data.CD_USUARIO || data.NOME || data.success !== false)) {
        this.authStatus = 'authenticated';
        this.token = activeToken;
        return {
          valid: true,
          status: 'authenticated',
          data
        };
      }

      this.authStatus = 'authenticationError';
      return {
        valid: false,
        status: 'authenticationError',
        error: data?.statusRetorno || data?.message || 'Token inválido ou expirado'
      };
    } catch (err: any) {
      this.authStatus = 'authenticationError';
      return {
        valid: false,
        status: 'authenticationError',
        error: err.message || 'Falha na conexão de validação'
      };
    }
  }
}

export const authService = new AuthService();
