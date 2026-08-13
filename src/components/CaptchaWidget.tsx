import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, KeyRound, Send, Sparkles } from 'lucide-react';
import { TurnstileWidget } from './TurnstileWidget';

interface CaptchaWidgetProps {
  authToken?: string;
  activeToken?: string;
  onTokenVerified?: (token: string) => void;
}

export const CaptchaWidget: React.FC<CaptchaWidgetProps> = ({
  authToken,
  activeToken,
  onTokenVerified,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [challengeId, setChallengeId] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verifiedToken, setVerifiedToken] = useState<string>(
    activeToken || localStorage.getItem('edusp_captcha_token') || ''
  );

  useEffect(() => {
    setVerifiedToken(activeToken || '');
  }, [activeToken]);

  const fetchChallenge = async () => {
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setAnswer('');

    try {
      let challengeRes = await fetch('/api/captcha/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken || ''
        },
        body: JSON.stringify({ realm: 'edusp', type: 'image' })
      });

      if (!challengeRes.ok) {
        challengeRes = await fetch('/api/captcha/challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': authToken || ''
          },
          body: JSON.stringify({ realm: 'edusp' })
        });
      }

      if (!challengeRes.ok) {
        challengeRes = await fetch('/api/captcha/challenge?realm=edusp', {
          headers: { 'x-api-key': authToken || '' }
        });
      }

      if (!challengeRes.ok) {
        throw new Error('Falha ao conectar com o servidor para obter o CAPTCHA.');
      }

      const data = await challengeRes.json();
      const cid = data.challengeId || data.challenge_id || data.id || data.data?.challenge_id || data.data?.id;
      const img = data.challenge?.image || data.image || data.data?.image || data.data?.challenge?.image;

      if (!cid || !img) {
        throw new Error('Formato do desafio de CAPTCHA inválido.');
      }

      setChallengeId(cid);
      setImageBase64(img);
      setIsOpen(true);
    } catch (err: any) {
      console.error('[CaptchaWidget] Erro ao buscar desafio:', err);
      setErrorMsg(err.message || 'Erro ao carregar imagem do CAPTCHA.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanAnswer = answer.trim().toUpperCase();

    if (!cleanAnswer) {
      setErrorMsg('Por favor, digite o código da imagem.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const verifyRes = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken || ''
        },
        body: JSON.stringify({
          type: 'image',
          realm: 'edusp',
          payload: {
            challengeId,
            answer: cleanAnswer
          }
        })
      });

      if (!verifyRes.ok) {
        let errJson: any = {};
        try {
          errJson = await verifyRes.json();
        } catch {}
        const serverError = errJson.error || errJson.message;
        const msg = serverError || 'Código do CAPTCHA incorreto. Tente novamente com a nova imagem.';
        fetchChallenge();
        throw new Error(msg);
      }

      const verifyData = await verifyRes.json();
      const token =
        verifyData.token ||
        verifyData.captcha_token ||
        verifyData.captchaToken ||
        verifyData.data?.token ||
        verifyData.data?.captcha_token ||
        '';

      if (token || verifyData.valid) {
        const finalToken = token || 'verified';
        setVerifiedToken(finalToken);
        localStorage.setItem('edusp_captcha_token', finalToken);
        if (onTokenVerified) {
          onTokenVerified(finalToken);
        }
        setSuccessMsg('✅ CAPTCHA verificado com sucesso e enviado à SED!');
        setAnswer('');
        setImageBase64('');
      } else {
        setErrorMsg('❌ Código incorreto. Um novo desafio foi gerado.');
        fetchChallenge();
      }
    } catch (err: any) {
      console.error('[CaptchaWidget] Erro ao verificar:', err);
      setErrorMsg(err.message || 'Falha ao validar CAPTCHA.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 transition-all shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            verifiedToken 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {verifiedToken ? <ShieldCheck className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Verificação CAPTCHA SED / EduSP
              </h3>
              {verifiedToken ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" /> CAPTCHA Ativo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3" /> Requer Validação
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {verifiedToken
                ? 'Seu token de CAPTCHA está salvo e pronto para envio automático à SED.'
                : 'Clique no botão para carregar a imagem do CAPTCHA e digitar o código.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          {!isOpen && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={fetchChallenge}
              disabled={isLoading}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Carregando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> {verifiedToken ? 'Gerar Novo CAPTCHA' : 'Exibir CAPTCHA'}
                </>
              )}
            </motion.button>
          )}

          {isOpen && (
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs text-zinc-400 hover:text-white underline cursor-pointer px-2 py-1"
            >
              Ocultar
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 pt-4 border-t border-[#27272a]"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-6 text-zinc-400 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                <span className="text-xs">Buscando desafio de imagem do servidor...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <TurnstileWidget
                  onVerify={(token) => {
                    setVerifiedToken(token);
                    localStorage.setItem('edusp_captcha_token', token);
                    if (onTokenVerified) {
                      onTokenVerified(token);
                    }
                    setSuccessMsg('✅ Cloudflare Turnstile verificado e ativo!');
                  }}
                />

                {imageBase64 ? (
                  <form onSubmit={handleVerify} className="flex flex-col gap-3 pt-2 border-t border-[#27272a]">
                    <div className="text-xs font-bold text-zinc-300">
                      Ou valide digitando o código da imagem SED:
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#18181b] p-3 rounded-xl border border-[#27272a]">
                      <div className="bg-white border border-zinc-200 rounded-lg p-2.5 flex items-center justify-center gap-2 shrink-0 min-w-[160px] shadow-sm">
                        <img
                          src={`data:image/png;base64,${imageBase64}`}
                          alt="Desafio CAPTCHA"
                          referrerPolicy="no-referrer"
                          className="h-10 object-contain select-none"
                        />
                        <button
                          type="button"
                          onClick={fetchChallenge}
                          disabled={isLoading || isVerifying}
                          title="Trocar imagem"
                          className="p-1.5 text-zinc-500 hover:text-black hover:bg-zinc-100 rounded-md transition-all cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                      </div>

                      <div className="flex-1 w-full space-y-1">
                        <label className="text-[11px] font-semibold text-zinc-300 block">
                          Código da Imagem:
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value.toUpperCase())}
                            placeholder="Ex: A7X9P"
                            maxLength={10}
                            disabled={isVerifying}
                            className="flex-1 bg-[#09090b] border border-[#27272a] focus:border-amber-500/60 text-white font-mono tracking-widest text-sm rounded-lg px-3 py-2 outline-none uppercase transition-all shadow-inner"
                          />
                          <motion.button
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={isVerifying || !answer.trim()}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                          >
                            {isVerifying ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Enviar p/ SED
                              </>
                            )}
                          </motion.button>
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    {successMsg && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        <span>{successMsg}</span>
                      </div>
                    )}
                  </form>
                ) : (
                  <div className="text-center py-2">
                    <button
                      type="button"
                      onClick={fetchChallenge}
                      className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold hover:bg-amber-500/30 transition-all cursor-pointer"
                    >
                      Ou Carregar CAPTCHA por Imagem SED
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
