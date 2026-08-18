import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BackgroundStars } from './components/BackgroundStars';
import { LoginView } from './components/LoginView';
import { DashboardLayout } from './components/DashboardLayout';
import { HomeView } from './components/HomeView';
import { PlataformasView } from './components/PlataformasView';
import { PlatformDetailView, PLATFORMS_DATA } from './components/PlatformDetailView';
import { ApostilasView } from './components/ApostilasView';
import { TarefasView } from './components/TarefasView';
import { RedacoesView } from './components/RedacoesView';
import { BoletimView } from './components/BoletimView';
import { ConfigView } from './components/ConfigView';
import { EmojiModal } from './components/EmojiModal';
import { SavedAccountsModal } from './components/SavedAccountsModal';
import { DiscordModal } from './components/DiscordModal';
import { DoacaoModal } from './components/DoacaoModal';
import { BakaiProfileModal } from './components/BakaiProfileModal';
import { ProgressWidget } from './components/ProgressWidget';
import { UserData, TaskItem, SavedAccount } from './types';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState('');
  const [userData, setUserData] = useState<UserData>({
    success: false,
    auth_token: '',
    nick: '',
    nome: '',
    escola: '',
    serie: ''
  });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [accounts, setAccounts] = useState<SavedAccount[]>([]);
  const [selectedAccountForLogin, setSelectedAccountForLogin] = useState<SavedAccount | null>(null);
  const [currentPage, setCurrentPage] = useState('home');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showDiscordModal, setShowDiscordModal] = useState(false);
  const [showDoacaoModal, setShowDoacaoModal] = useState(false);
  const [showBakaiModal, setShowBakaiModal] = useState(false);

  // CAPTCHA Modal state
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaChallengeId, setCaptchaChallengeId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaVerifying, setCaptchaVerifying] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>(() => (typeof window !== 'undefined' ? (localStorage.getItem('edusp_captcha_token') || '') : ''));

  const captchaResolverRef = React.useRef<((token: string) => void) | null>(null);
  const captchaRejecterRef = React.useRef<((err: Error) => void) | null>(null);

  const requestCaptchaSolving = (challengeId: string, imageBase64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      setCaptchaChallengeId(challengeId);
      setCaptchaImg(imageBase64);
      setCaptchaAnswer('');
      setCaptchaError('');
      setCaptchaVerifying(false);
      setCaptchaModalOpen(true);
      
      captchaResolverRef.current = resolve;
      captchaRejecterRef.current = reject;
    });
  };

  // Progress widget state
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressTitle, setProgressTitle] = useState('');
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressLogs, setProgressLogs] = useState<{ text: string; type: 'ok' | 'err' | 'info'; time?: string }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Background Batch Multi-Tarefas state (Persistente no Servidor)
  const [activeBatchId, setActiveBatchId] = useState<string>(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('shuziro_active_batch_id') || '') : '';
  });
  const [activeBatchData, setActiveBatchData] = useState<any>(null);
  const [isBatchPaused, setIsBatchPaused] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global backend / tunnel ping states
  const DEFAULT_BACKEND_URL = 'https://bakai.shuziroastral.lol';
  
  const [tunnelUrl, setTunnelUrl] = useState(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel')) : null;
    if (saved && saved.trim() && !saved.includes('shuziroastral.lol')) return saved.trim();
    return '';
  });
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');
  const [pingResponse, setPingResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // CAPTCHA Handlers
  const handleRefreshCaptcha = async () => {
    setCaptchaVerifying(true);
    setCaptchaError('');
    setCaptchaAnswer('');

    try {
      let challengeRes = await fetch('/api/captcha/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken
        },
        body: JSON.stringify({ realm: 'edusp', type: 'image' })
      });

      if (!challengeRes.ok) {
        challengeRes = await fetch('/api/captcha/challenge', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': authToken
          },
          body: JSON.stringify({ realm: 'edusp' })
        });
      }

      if (!challengeRes.ok) {
        challengeRes = await fetch('/api/captcha/challenge?realm=edusp', {
          headers: { 'x-api-key': authToken }
        });
      }

      if (!challengeRes.ok) {
        throw new Error('Não foi possível obter novo desafio.');
      }

      const challengeData = await challengeRes.json();
      const challengeId = challengeData.challengeId || challengeData.challenge_id || challengeData.id || challengeData.data?.challenge_id || challengeData.data?.id;
      const imageBase64 = challengeData.challenge?.image || challengeData.image || challengeData.data?.image || challengeData.data?.challenge?.image;

      if (!challengeId || !imageBase64) {
        throw new Error('Resposta de desafio inválida.');
      }

      setCaptchaChallengeId(challengeId);
      setCaptchaImg(imageBase64);
    } catch (e: any) {
      setCaptchaError(e.message || 'Erro ao carregar novo CAPTCHA.');
    } finally {
      setCaptchaVerifying(false);
    }
  };

  const handleVerifyCaptcha = async () => {
    if (!captchaAnswer.trim()) {
      setCaptchaError('Por favor, digite o texto da imagem.');
      return;
    }

    setCaptchaVerifying(true);
    setCaptchaError('');

    try {
      const cleanAnswer = captchaAnswer.trim().toUpperCase();
      const verifyRes = await fetch('/api/captcha/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken
        },
        body: JSON.stringify({
          type: 'image',
          realm: 'edusp',
          payload: {
            challengeId: captchaChallengeId,
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
        
        // Auto refresh captcha image since this challenge is invalidated
        handleRefreshCaptcha();
        throw new Error(serverError || 'Código do CAPTCHA incorreto. Uma nova imagem foi gerada.');
      }

      const verifyData = await verifyRes.json();
      const token = verifyData.token || verifyData.captcha_token || verifyData.captchaToken || verifyData.data?.token || verifyData.data?.captcha_token || '';

      if (token || verifyData.valid) {
        const finalTok = token || 'verified';
        setCaptchaToken(finalTok);
        localStorage.setItem('edusp_captcha_token', finalTok);
        setCaptchaModalOpen(false);
        if (captchaResolverRef.current) {
          captchaResolverRef.current(finalTok);
        } else {
          const bid = activeBatchId || (activeBatchData && activeBatchData.batchId);
          if (bid) {
            fetch('/api/tasks/batch-resume', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-key': authToken },
              body: JSON.stringify({ batchId: bid, captchaToken: finalTok })
            }).then(() => {
              setIsBatchPaused(false);
              showToast('CAPTCHA validado! Multi-Tarefas retomado com sucesso.', 'success');
            }).catch(() => {});
          }
        }
      } else {
        setCaptchaError('Código incorreto. Uma nova imagem foi gerada.');
        handleRefreshCaptcha();
      }
    } catch (e: any) {
      setCaptchaError(e.message || 'Erro ao verificar o CAPTCHA.');
    } finally {
      setCaptchaVerifying(false);
    }
  };

  const handleSolveBatchCaptcha = async () => {
    setCaptchaModalOpen(true);
    await handleRefreshCaptcha();
    captchaResolverRef.current = async (token) => {
      const bid = activeBatchId || activeBatchData?.batchId;
      if (!bid) return;
      try {
        const res = await fetch('/api/tasks/batch-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': authToken },
          body: JSON.stringify({ batchId: bid, captchaToken: token })
        });
        if (res.ok) {
          showToast('CAPTCHA resolvido! Continuando tarefas...', 'success');
          setIsBatchPaused(false);
          setIsCompleted(false);
          setActiveBatchId(bid);
          localStorage.setItem('shuziro_active_batch_id', bid);
        } else {
          showToast('Erro ao enviar CAPTCHA para continuar o lote.', 'error');
        }
      } catch (e) {
        showToast('Erro de conexão ao enviar CAPTCHA.', 'error');
      }
    };
  };

  // Auto-reconnect to running batch on server
  useEffect(() => {
    fetch('/api/tasks/active-batches')
      .then(r => r.json())
      .then(data => {
        if (data?.activeBatches && data.activeBatches.length > 0) {
          const running = data.activeBatches.find((b: any) => b.status === 'running' || b.status === 'queued' || b.status === 'paused');
          if (running) {
            setActiveBatchId(running.batchId);
            localStorage.setItem('shuziro_active_batch_id', running.batchId);
            setActiveBatchData(running);
            setIsBatchPaused(running.status === 'paused');
            setProgressOpen(true);
            setProgressTitle(`Multi-Tarefas em Segundo Plano (${running.completedCount}/${running.total})`);
            if (running.needsCaptcha) {
              handleSolveBatchCaptcha();
            }
          }
        }
      })
      .catch(() => {});
  }, []);

  // Polling loop for active background batch
  useEffect(() => {
    if (!activeBatchId) return;

    let isSubscribed = true;
    let isFinished = false;

    const pollBatch = async () => {
      if (!isSubscribed || isFinished) return;
      try {
        const res = await fetch(`/api/tasks/batch-status?batchId=${encodeURIComponent(activeBatchId)}`);
        if (!res.ok) {
          if (res.status === 404 || res.status >= 500) {
            localStorage.removeItem('shuziro_active_batch_id');
            if (isSubscribed) {
              isFinished = true;
              setActiveBatchId('');
            }
          }
          return;
        }

        const data = await res.json();
        if (!isSubscribed || isFinished) return;

        setActiveBatchData(data);
        setIsBatchPaused(data.status === 'paused');
        setProgressTotal(data.total || 0);
        setProgressCurrent((data.completedCount || 0) + (data.failedCount || 0));
        if (Array.isArray(data.logs)) {
          setProgressLogs(data.logs);
        }
        setProgressTitle(`Multi-Tarefas (${data.completedCount || 0}/${data.total || 0})`);

        if (data.needsCaptcha && !captchaModalOpen) {
          setIsBatchPaused(true);
          setProgressOpen(true);
          handleSolveBatchCaptcha();
        }

        if (data.status === 'completed' || data.status === 'cancelled' || data.status === 'failed') {
          isFinished = true;
          setIsCompleted(true);
          localStorage.removeItem('shuziro_active_batch_id');
          setActiveBatchId(''); // Stops the polling effect immediately

          if (data.status === 'completed') {
            try {
              confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.8 },
                colors: ['#ffffff', '#a1a1aa', '#71717a']
              });
            } catch (e) {}
            showToast(`Multi-Tarefas concluído no servidor! ${data.completedCount}/${data.total} finalizadas.`, 'success');
            if (authToken) fetchTasks(authToken, userData);
          } else if (data.status === 'failed') {
            showToast(`Multi-Tarefas finalizado com erros (${data.failedCount || 0} falha(s)).`, 'error');
          }
        }
      } catch (e) {}
    };

    // Initial check
    pollBatch();

    // Controlled interval (3.5s) to avoid network flooding
    const interval = setInterval(pollBatch, 3500);

    return () => {
      isSubscribed = false;
      isFinished = true;
      clearInterval(interval);
    };
  }, [activeBatchId, authToken, userData, captchaModalOpen]);

  // Clean up any leaked termux tunnel or IP address from localStorage
  useEffect(() => {
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
    setTunnelUrl('');
  }, []);

  const runPing = async (url: string = '', isSilent: boolean = false) => {
    if (!isSilent) {
      setPingStatus('pinging');
    }
    
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

      const res = await fetch('/api/ping', {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      const endTime = performance.now();
      
      setLatency(Math.round(endTime - startTime));
      setPingResponse(data);
      setPingStatus('success');
    } catch (err: any) {
      setPingStatus('failed');
    }
  };

  // Auto-ping a cada 30 segundos (disparado ao logar e a cada 30s)
  useEffect(() => {
    const doPing = () => {
      runPing(tunnelUrl, true);
    };

    doPing(); // Ping inicial / imediato pós alteração

    const interval = setInterval(() => {
      doPing();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [tunnelUrl, isLoggedIn]);

  // Route synchronization logic
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const targetPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const rawPath = window.location.pathname.replace(/^\//, '').trim();
      const path = rawPath || 'home';
      setCurrentPage(path);
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // Sincronização automática em background do fingerprint do navegador com o backend (got-scraping)
    const syncBrowser = async () => {
      try {
        const payload = {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language || 'pt-BR',
          screenWidth: window.screen?.width,
          screenHeight: window.screen?.height,
          hardwareConcurrency: navigator.hardwareConcurrency || 4,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookies: document.cookie || '',
          verifiedAt: new Date().toISOString()
        };
        await fetch('/api/verify-antibot', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-user-agent': navigator.userAgent
          },
          body: JSON.stringify(payload)
        });
      } catch (e) {}
    };
    syncBrowser();
  }, [tunnelUrl]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('shuziro_contas') || '[]');
      setAccounts(saved);
    } catch {}
  }, []);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAccount = (ra: string, senha: string) => {
    const filtered = accounts.filter(a => a.ra !== ra);
    const updated = [{ ra, senha, estado: 'SP', data: new Date().toISOString() }, ...filtered];
    setAccounts(updated);
    localStorage.setItem('shuziro_contas', JSON.stringify(updated));
  };

  const handleRemoveAccount = (ra: string) => {
    const updated = accounts.filter(a => a.ra !== ra);
    setAccounts(updated);
    localStorage.setItem('shuziro_contas', JSON.stringify(updated));
    showToast('Conta removida', 'info');
  };

  const handleClearAccounts = () => {
    setAccounts([]);
    localStorage.removeItem('shuziro_contas');
    showToast('Contas limpas', 'info');
  };

  const handleLogin = async (ra: string, pass: string) => {
    if (!isVerified) {
      setErrorMessage('Complete o desafio anti-bot antes de entrar.');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: ra, senha: pass })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha na autenticação');
      }

      setAuthToken(data.auth_token);
      setUserData(data);
      setIsLoggedIn(true);
      setShowDiscordModal(true);
      handleSaveAccount(ra, pass);
      showToast(`Bem-vindo, ${data.nome || data.nick || ra}!`, 'success');
      runPing(tunnelUrl, true); // Ping imediato de 30s após o login
      fetchTasks(data.auth_token, data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao conectar com a API');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTasks = async (token: string, currentData: UserData) => {
    try {
      const authHeaders: Record<string, string> = { 
        'x-api-key': token,
        'x-client-user-agent': navigator.userAgent
      };

      const allFetchedTasks: any[] = [];
      const seenIds = new Set<string>();

      const addTasks = (items: any[]) => {
        if (!Array.isArray(items)) return;
        items.forEach(item => {
          const id = String(item.id || item.task_id || '');
          if (id && !seenIds.has(id)) {
            seenIds.add(id);
            allFetchedTasks.push(item);
          }
        });
      };

      // 1. Faz a busca direta principal (tarefas e redações)
      try {
        const [tDirect, eDirect] = await Promise.all([
          fetch(`/api/tms/task/todo?is_essay=false`, { headers: authHeaders }),
          fetch(`/api/tms/task/todo?is_essay=true`, { headers: authHeaders })
        ]);
        if (tDirect.ok) addTasks(await tDirect.json());
        if (eDirect.ok) addTasks(await eDirect.json());
      } catch (e) {
        console.warn('Erro ao buscar tarefas diretas:', e);
      }

      // 2. Se nada foi encontrado, tenta buscar salas e consultar apenas alvos válidos (IDs numéricos ou slugs r...-l)
      if (allFetchedTasks.length === 0) {
        try {
          const roomsRes = await fetch('/api/rooms', { headers: authHeaders });
          if (roomsRes.ok) {
            const roomsData = await roomsRes.json();
            if (roomsData.blocked && roomsData.message) {
              showToast(roomsData.message + ' Faça login novamente.', 'error');
            }
            const rooms = roomsData.rooms || roomsData.items || (Array.isArray(roomsData) ? roomsData : []);
            const validTargets: string[] = [];
            
            rooms.forEach((room: any) => {
              const inner = (typeof room.room === 'object' && room.room) ? room.room : {};
              const candidates = [
                room.publication_target, room.slug, room.id, room.room_id, room.name, room.room_name,
                inner.publication_target, inner.slug, inner.id, inner.room_id, inner.name, inner.room_name
              ];
              candidates.forEach(c => {
                if (c !== undefined && c !== null) {
                  const str = String(c).trim();
                  if (str && str !== 'undefined' && str !== 'null' && str.length > 1) {
                    validTargets.push(str);
                  }
                }
              });
              if (Array.isArray(room.cards)) {
                room.cards.forEach((card: any) => {
                  const cardCandidates = [card.publication_target, card.slug, card.id, card.room_name, card.name];
                  cardCandidates.forEach(cc => {
                    if (cc !== undefined && cc !== null) {
                      const str = String(cc).trim();
                      if (str && str !== 'undefined' && str !== 'null' && str.length > 1) {
                        validTargets.push(str);
                      }
                    }
                  });
                });
              }
            });

            const uniqueTargets = [...new Set(validTargets)];
            await Promise.all(uniqueTargets.map(async (t) => {
              const encTarget = encodeURIComponent(t);
              const [tRes, eRes] = await Promise.all([
                fetch(`/api/tms/task/todo?is_essay=false&publication_target=${encTarget}`, { headers: authHeaders }),
                fetch(`/api/tms/task/todo?is_essay=true&publication_target=${encTarget}`, { headers: authHeaders })
              ]);
              if (tRes.ok) addTasks(await tRes.json());
              if (eRes.ok) addTasks(await eRes.json());
            }));
          }
        } catch (e) {
          console.warn('Erro no fallback por salas:', e);
        }
      }

      setTasks(allFetchedTasks);
      if (allFetchedTasks.length > 0) {
        showToast(`${allFetchedTasks.length} tarefas e redações encontradas!`, 'success');
      } else {
        showToast('Nenhuma tarefa ou redação pendente encontrada.', 'info');
      }
    } catch (err: any) {
      console.warn('Erro ao carregar tarefas:', err);
      showToast('Erro ao carregar tarefas: ' + err.message, 'error');
    }
  };

  const handlePauseBatch = async () => {
    if (!activeBatchId) return;
    try {
      await fetch('/api/tasks/batch-pause', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: activeBatchId })
      });
      setIsBatchPaused(true);
      showToast('Multi-Tarefas pausado no servidor.', 'info');
    } catch (e) {}
  };

  const handleResumeBatch = async () => {
    if (!activeBatchId) return;
    try {
      await fetch('/api/tasks/batch-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: activeBatchId })
      });
      setIsBatchPaused(false);
      showToast('Multi-Tarefas retomado no servidor.', 'info');
    } catch (e) {}
  };

  const handleCancelBatch = async () => {
    if (!activeBatchId) return;
    try {
      await fetch('/api/tasks/batch-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId: activeBatchId })
      });
      showToast('Multi-Tarefas cancelado.', 'info');
    } catch (e) {}
  };

  const handleStartAutomation = async (
    taskIds: string[],
    optionsOrTimeSec: number | { minTimeSec: number; maxTimeSec: number; mode: 'draft' | 'submitted'; concurrency?: number },
    defaultMode: 'draft' | 'submitted' = 'submitted'
  ) => {
    if (taskIds.length === 0) return;

    let minTimeSec = 30;
    let maxTimeSec = 60;
    let mode: 'draft' | 'submitted' = defaultMode;
    let concurrency = 2;

    if (typeof optionsOrTimeSec === 'object' && optionsOrTimeSec !== null) {
      minTimeSec = optionsOrTimeSec.minTimeSec || 30;
      maxTimeSec = optionsOrTimeSec.maxTimeSec || minTimeSec;
      if (optionsOrTimeSec.mode) mode = optionsOrTimeSec.mode;
      if (optionsOrTimeSec.concurrency) concurrency = optionsOrTimeSec.concurrency;
    } else if (typeof optionsOrTimeSec === 'number') {
      minTimeSec = optionsOrTimeSec;
      maxTimeSec = optionsOrTimeSec;
    }

    setProgressOpen(true);
    setProgressTitle(`Multi-Tarefas no Servidor (${taskIds.length} tarefas)...`);
    setProgressCurrent(0);
    setProgressTotal(taskIds.length);
    setProgressLogs([{
      time: new Date().toLocaleTimeString('pt-BR'),
      text: `Iniciando lote de ${taskIds.length} tarefas no servidor...`,
      type: 'info'
    }]);
    setIsCompleted(false);
    setIsBatchPaused(false);

    // Constrói metadata das tarefas
    const tasksMeta: Record<string, any> = {};
    for (const tid of taskIds) {
      const taskItem = tasks.find(t => String(t.id || t.task_id) === tid);
      if (taskItem) {
        tasksMeta[tid] = {
          id: tid,
          title: taskItem.title,
          publication_target: taskItem.publication_target || (taskItem as any).room_name || (taskItem as any).room_for_apply,
          is_essay: taskItem.is_essay,
          apply_moment: (taskItem as any).apply_moment
        };
      }
    }

    try {
      const currentCaptcha = captchaToken || localStorage.getItem('edusp_captcha_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-api-key': authToken
      };
      if (currentCaptcha) {
        headers['x-captcha-token'] = currentCaptcha;
      }

      const res = await fetch('/api/tasks/batch-run', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          taskIds,
          tasksMeta,
          minTimeSec,
          maxTimeSec,
          mode,
          concurrency,
          auth_token: authToken,
          captcha_token: currentCaptcha
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status} ao iniciar lote no servidor`);
      }

      const data = await res.json();
      setActiveBatchId(data.batchId);
      localStorage.setItem('shuziro_active_batch_id', data.batchId);
      showToast(`Multi-Tarefas iniciado no servidor (${taskIds.length} tarefas)! Você pode fechar o site ou sair a qualquer momento.`, 'info');
    } catch (err: any) {
      showToast(`Erro ao iniciar multi-tarefas: ${err.message}`, 'error');
      setProgressLogs(prev => [{
        time: new Date().toLocaleTimeString('pt-BR'),
        text: `Erro: ${err.message}`,
        type: 'err'
      }, ...prev]);
    }
  };

  const isPlatformSlug = currentPage in PLATFORMS_DATA;

  return (
    <div className="min-h-screen text-zinc-100 font-sans relative selection:bg-white selection:text-black">
      <BackgroundStars isStatic={!isLoggedIn} />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] px-4 py-2.5 rounded-2xl border text-xs font-medium shadow-2xl animate-in fade-in slide-in-from-bottom duration-200 ${
          toastMessage.type === 'success' ? 'bg-[#121214] border-zinc-500 text-white' :
          toastMessage.type === 'error' ? 'bg-[#121214] border-red-500/50 text-red-400' :
          'bg-[#121214] border-zinc-700 text-zinc-200'
        }`}>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {!isLoggedIn ? (
        <LoginView
          onLogin={handleLogin}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onOpenAccounts={() => setShowAccountsModal(true)}
          onOpenEmojiChallenge={() => setShowEmojiModal(true)}
          isVerified={isVerified}
          selectedAccount={selectedAccountForLogin}
          onOpenBakaiProfile={() => setShowBakaiModal(true)}
        />
      ) : (
        <DashboardLayout
          userData={userData}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          pingStatus={pingStatus}
          latency={latency}
          onLogout={() => {
            setIsLoggedIn(false);
            setAuthToken('');
            setTasks([]);
            showToast('Sessão encerrada', 'info');
          }}
          onRefresh={() => {
            if (authToken) {
              fetchTasks(authToken, userData);
              showToast('Atualizando dados...', 'info');
            }
          }}
          onOpenAccounts={() => setShowAccountsModal(true)}
          onOpenDiscord={() => setShowDiscordModal(true)}
          onOpenDoacao={() => setShowDoacaoModal(true)}
          onOpenBakaiProfile={() => setShowBakaiModal(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {currentPage === 'home' && (
                <HomeView
                  userData={userData}
                  onNavigate={handleNavigate}
                  taskCount={tasks.filter(t => !t.is_essay).length}
                  essayCount={tasks.filter(t => t.is_essay).length}
                />
              )}
              {currentPage === 'plataformas' && (
                <PlataformasView
                  userData={userData}
                  onNavigate={handleNavigate}
                />
              )}
              {isPlatformSlug && (
                <PlatformDetailView
                  slug={currentPage}
                  userData={userData}
                  onBack={() => handleNavigate('plataformas')}
                  pingStatus={pingStatus}
                />
              )}
              {currentPage === 'apostilas' && <ApostilasView />}
              {currentPage === 'tarefas' && (
                <TarefasView 
                  tasks={tasks} 
                  authToken={authToken}
                  captchaToken={captchaToken}
                  onCaptchaVerified={(tok) => {
                    setCaptchaToken(tok);
                    localStorage.setItem('edusp_captcha_token', tok);
                  }}
                  onRefresh={() => fetchTasks(authToken, userData)} 
                  onStartAutomation={handleStartAutomation}
                  activeBatch={activeBatchData}
                  onOpenBatchProgress={() => setProgressOpen(true)}
                />
              )}
              {currentPage === 'redacoes' && (
                <RedacoesView
                  tasks={tasks}
                  authToken={authToken}
                  captchaToken={captchaToken}
                  onCaptchaVerified={(tok) => {
                    setCaptchaToken(tok);
                    localStorage.setItem('edusp_captcha_token', tok);
                  }}
                  onStartAutomation={handleStartAutomation}
                />
              )}
              {currentPage === 'boletim' && <BoletimView userData={userData} authToken={authToken} />}
              {currentPage === 'config' && (
                <ConfigView
                  accounts={accounts}
                  onClearAccounts={handleClearAccounts}
                  tunnelUrl={tunnelUrl}
                  setTunnelUrl={setTunnelUrl}
                  pingStatus={pingStatus}
                  runPing={(silent) => runPing(tunnelUrl, silent)}
                  pingResponse={pingResponse}
                  latency={latency}
                  onOpenBakaiProfile={() => setShowBakaiModal(true)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </DashboardLayout>
      )}

      {/* Modals */}
      <EmojiModal
        isOpen={showEmojiModal}
        onClose={() => setShowEmojiModal(false)}
        onSuccess={() => {
          setIsVerified(true);
          showToast('Navegador verificado e sincronizado com sucesso!', 'success');
          if (isLoggedIn && authToken && userData) {
            fetchTasks(authToken, userData);
          }
        }}
        tunnelUrl={tunnelUrl}
      />

      <SavedAccountsModal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
        accounts={accounts}
        onSelectAccount={(acc) => {
          setSelectedAccountForLogin(acc);
          setShowAccountsModal(false);
          showToast(`Conta ${acc.ra} preenchida no login`, 'success');
        }}
        onRemoveAccount={handleRemoveAccount}
        onClearAll={handleClearAccounts}
      />

      <DiscordModal
        isOpen={showDiscordModal}
        onClose={() => {
          setShowDiscordModal(false);
          // Pedir doação logo após o aviso do Discord ser fechado!
          setTimeout(() => setShowDoacaoModal(true), 300);
        }}
      />

      <DoacaoModal
        isOpen={showDoacaoModal}
        onClose={() => setShowDoacaoModal(false)}
      />

      <BakaiProfileModal
        isOpen={showBakaiModal}
        onClose={() => setShowBakaiModal(false)}
        onOpenDiscord={() => setShowDiscordModal(true)}
        onOpenDoacao={() => setShowDoacaoModal(true)}
      />

      <ProgressWidget
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        title={progressTitle}
        progress={progressCurrent}
        total={progressTotal}
        logs={progressLogs}
        isCompleted={isCompleted}
        isPaused={isBatchPaused}
        onPause={handlePauseBatch}
        onResume={handleResumeBatch}
        onCancel={handleCancelBatch}
        isBackgroundServer={Boolean(activeBatchId || (activeBatchData && activeBatchData.status === 'running'))}
        needsCaptcha={Boolean(activeBatchData?.needsCaptcha)}
        onSolveCaptcha={handleSolveBatchCaptcha}
      />

      {/* CAPTCHA Modal */}
      <AnimatePresence>
        {captchaModalOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#121214] border border-zinc-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white tracking-wide">
                  Verificação CAPTCHA
                </h3>
                <p className="text-zinc-400 text-xs mt-1">
                  O CMSP exige que você resolva este CAPTCHA para iniciar a tarefa.
                </p>
              </div>

              {captchaImg && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 shadow-inner">
                  <img
                    src={`data:image/png;base64,${captchaImg}`}
                    alt="Desafio CAPTCHA"
                    referrerPolicy="no-referrer"
                    className="h-12 object-contain"
                  />
                  <button
                    onClick={handleRefreshCaptcha}
                    disabled={captchaVerifying}
                    className="text-xs text-zinc-500 hover:text-zinc-800 transition-colors flex items-center gap-1.5 px-3 py-1 bg-zinc-100 rounded-full border border-zinc-200"
                  >
                    {captchaVerifying ? 'Carregando...' : 'Carregar outra imagem'}
                  </button>
                </div>
              )}

              <div className="mt-4 space-y-3">
                <input
                  type="text"
                  placeholder="Digite as letras"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyCaptcha();
                  }}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-500 rounded-xl px-4 py-3 text-sm text-center text-white tracking-widest uppercase focus:outline-none transition-colors"
                  autoFocus
                />

                {captchaError && (
                  <p className="text-red-500 text-xs text-center font-medium bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                    {captchaError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setCaptchaModalOpen(false);
                      if (captchaRejecterRef.current) {
                        captchaRejecterRef.current(new Error('Resolução de CAPTCHA cancelada pelo usuário.'));
                      }
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm font-medium py-3 rounded-xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleVerifyCaptcha}
                    disabled={captchaVerifying || !captchaAnswer.trim()}
                    className="flex-1 bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-sm font-semibold py-3 rounded-xl transition-all shadow-md shadow-white/5"
                  >
                    {captchaVerifying ? 'Verificando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
