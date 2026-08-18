import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global fetch interceptor to support optional dynamic backend URL or custom Termux tunnel for /api and /proxy calls
const getGlobalBackendUrl = (): string => {
  if (typeof window === 'undefined') return '';
  const saved = localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel');
  if (saved && saved.trim() && !saved.includes('shuziroastral.lol')) {
    return saved.trim();
  }
  // Internal backend is primary and handles all EduSP requests with native proxy rotation
  return '';
};

const originalFetch = window.fetch;
const interceptorFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (typeof input === 'string') {
    if (input.startsWith('/api/') || input.startsWith('/proxy')) {
      const backendUrl = getGlobalBackendUrl();
      if (backendUrl) {
        const cleanBase = backendUrl.replace(/\/$/, '');
        const targetUrl = `${cleanBase}${input}`;
        try {
          const response = await originalFetch(targetUrl, init);
          // Se o status for de bloqueio do Cloudflare (403) ou erro de gateway/offline (502, 503, 504), faz fallback para o local
          if (response.status === 403 || response.status >= 502) {
            console.warn(`[Proxy Interceptor] Error ${response.status} from ${targetUrl}, falling back to local backend...`);
            return originalFetch(input, init);
          }
          return response;
        } catch (err) {
          console.warn(`[Proxy Interceptor] Connection failed to ${targetUrl}, falling back to local backend...`, err);
          return originalFetch(input, init);
        }
      }
    }
  }
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: interceptorFetch,
    writable: true,
    configurable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Failed to redefine window.fetch with Object.defineProperty:", e);
  try {
    // Tenta sobrescrever no protótipo de Window se a instância do window estiver bloqueada
    const proto = Object.getPrototypeOf(window);
    if (proto && 'fetch' in proto) {
      Object.defineProperty(proto, 'fetch', {
        value: interceptorFetch,
        writable: true,
        configurable: true,
        enumerable: true
      });
    } else {
      (window as any).fetch = interceptorFetch;
    }
  } catch (err) {
    console.error("Critical: Could not intercept fetch on window or prototype.", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
