type TokenExpiredCallback = () => void;

class AuthManagerClass {
  private token: string | null = null;
  private expiredCallbacks: TokenExpiredCallback[] = [];

  constructor() {
    // Tenta carregar token inicial se salvo localmente
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('leiasp_auth_token');
      if (savedToken) {
        this.token = savedToken;
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public setToken(newToken: string): void {
    this.token = newToken ? newToken.trim() : null;
    if (typeof window !== 'undefined') {
      if (this.token) {
        localStorage.setItem('leiasp_auth_token', this.token);
      } else {
        localStorage.removeItem('leiasp_auth_token');
      }
    }
  }

  public clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('leiasp_auth_token');
    }
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public onTokenExpired(callback: TokenExpiredCallback): void {
    this.expiredCallbacks.push(callback);
  }

  public notifyExpired(): void {
    this.expiredCallbacks.forEach(cb => {
      try {
        cb();
      } catch (e) {
        console.error('[AuthManager] Erro no callback de expiração:', e);
      }
    });
  }
}

export const AuthManager = new AuthManagerClass();
