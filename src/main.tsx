import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Limpeza de segurança de armazenamento local antigo
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

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
