import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Limpeza de segurança e remoção de redirecionamentos de túneis privados (Termux/SSH/IP)
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('shuziro_termux_tunnel');
    const savedBackend = localStorage.getItem('shuziro_backend_url');
    if (savedBackend && (
      savedBackend.includes('trycloudflare') || 
      savedBackend.includes('loca.lt') || 
      savedBackend.includes('ngrok') || 
      savedBackend.includes('127.0.0.1') || 
      savedBackend.includes('localhost') || 
      savedBackend.includes('termux')
    )) {
      localStorage.removeItem('shuziro_backend_url');
    }
  } catch (e) {}
}

const originalFetch = window.fetch;
const interceptorFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
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
