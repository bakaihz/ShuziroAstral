import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'error-callback'?: (errorCode?: any) => void;
          'expired-callback'?: () => void;
          theme?: 'dark' | 'light' | 'auto';
          size?: 'normal' | 'compact';
          action?: string;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  siteKey?: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (errMessage: string) => void;
  theme?: 'dark' | 'light' | 'auto';
  autoVerifyBackend?: boolean;
  compact?: boolean;
}

export const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  siteKey = '0x4AAAAAAEOioy_oBGSSXVuy',
  onVerify,
  onExpire,
  onError,
  theme = 'dark',
  autoVerifyBackend = true,
  compact = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const [verifiedToken, setVerifiedToken] = useState<string>(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('shuziro_turnstile_token') || '') : '';
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Render Turnstile widget once container and window.turnstile are ready
  useEffect(() => {
    let intervalId: any = null;

    const initTurnstile = () => {
      if (!containerRef.current || !window.turnstile) return false;

      // Clean up previous widget instance if present
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme as 'dark' | 'light' | 'auto',
          size: compact ? 'compact' : 'normal',
          callback: async (token: string) => {
            console.log('[Turnstile Client] Token recebido:', token);
            setErrorMsg('');

            if (autoVerifyBackend) {
              setIsVerifying(true);
              try {
                const res = await fetch('/api/turnstile/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ token })
                });

                const data = await res.json();
                if (data.success || data.valid) {
                  setVerifiedToken(token);
                  localStorage.setItem('shuziro_turnstile_token', token);
                  onVerify(token);
                } else {
                  const errText = data.error || 'Falha ao validar token do Turnstile no servidor.';
                  setErrorMsg(errText);
                  if (onError) onError(errText);
                  handleReset();
                }
              } catch (err: any) {
                console.error('[Turnstile] Erro ao validar no backend:', err);
                const errText = 'Erro ao conectar ao servidor para validar o Turnstile.';
                setErrorMsg(errText);
                if (onError) onError(errText);
              } finally {
                setIsVerifying(false);
              }
            } else {
              setVerifiedToken(token);
              localStorage.setItem('shuziro_turnstile_token', token);
              onVerify(token);
            }
          },
          'error-callback': (errCode) => {
            console.warn('[Turnstile Client] Erro no widget:', errCode);
            const msg = 'Erro no widget do Turnstile. Tente novamente.';
            setErrorMsg(msg);
            if (onError) onError(msg);
          },
          'expired-callback': () => {
            console.log('[Turnstile Client] Token expirado.');
            setVerifiedToken('');
            localStorage.removeItem('shuziro_turnstile_token');
            if (onExpire) onExpire();
          }
        });

        widgetIdRef.current = id;
        setScriptLoaded(true);
        return true;
      } catch (e) {
        console.error('[Turnstile] Erro ao renderizar widget:', e);
        return false;
      }
    };

    if (!initTurnstile()) {
      intervalId = setInterval(() => {
        if (initTurnstile()) {
          clearInterval(intervalId);
        }
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
      }
    };
  }, [siteKey, theme, compact]);

  const handleReset = () => {
    setErrorMsg('');
    setVerifiedToken('');
    localStorage.removeItem('shuziro_turnstile_token');
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (e) {}
    }
  };

  return (
    <div className="w-full bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 shadow-xl transition-all relative overflow-hidden">
      {/* Top accent glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500" />

      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
            verifiedToken
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {verifiedToken ? <ShieldCheck className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              Cloudflare Turnstile
              {verifiedToken && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">
                  Verificado ✓
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400">
              {verifiedToken
                ? 'Proteção ativada! Você já pode prosseguir com segurança.'
                : 'Complete o desafio abaixo para liberar o acesso ao sistema.'}
            </div>
          </div>
        </div>

        {verifiedToken && (
          <button
            type="button"
            onClick={handleReset}
            title="Refazer Turnstile"
            className="p-1.5 text-zinc-400 hover:text-white bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] rounded-lg transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Turnstile Widget Container */}
      <div className="flex flex-col items-center justify-center my-2 min-h-[65px]">
        {isVerifying ? (
          <div className="flex items-center gap-2 py-3 text-amber-400 text-xs font-semibold">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Validando no servidor Cloudflare Turnstile...</span>
          </div>
        ) : (
          <div ref={containerRef} className="my-1" />
        )}

        {!scriptLoaded && !isVerifying && (
          <div className="flex items-center gap-2 text-zinc-400 text-xs py-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Carregando Turnstile...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </motion.div>
      )}
    </div>
  );
};
