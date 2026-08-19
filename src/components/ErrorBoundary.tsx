import React, { useState, useEffect, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Captured global window error:', event.error);
      setHasError(true);
      setErrorMessage(event.error?.message || event.message || 'Erro inesperado');
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Captured unhandled promise rejection:', event.reason);
      if (event.reason?.message) {
        setHasError(true);
        setErrorMessage(event.reason.message);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleReload = () => {
    try {
      localStorage.removeItem('shuziro_termux_tunnel');
      localStorage.removeItem('shuziro_backend_url');
    } catch (e) {}
    window.location.reload();
  };

  if (hasError) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Ops, algo deu errado!</h2>
            <p className="text-sm text-zinc-400">
              A aplicação encontrou um erro inesperado e foi interrompida com segurança.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-red-300/80 font-mono text-left overflow-x-auto max-h-32">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleReload}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 animate-spin-hover" />
            Recarregar Aplicação
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
