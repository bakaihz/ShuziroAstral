import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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

  // CAPTCHA Modal state
  const [captchaModalOpen, setCaptchaModalOpen] = useState(false);
  const [captchaImg, setCaptchaImg] = useState('');
  const [captchaChallengeId, setCaptchaChallengeId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [captchaVerifying, setCaptchaVerifying] = useState(false);

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
  const [progressLogs, setProgressLogs] = useState<{ text: string; type: 'ok' | 'err' | 'info' }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global backend / tunnel ping states
  const DEFAULT_BACKEND_URL = '';
  
  const [tunnelUrl, setTunnelUrl] = useState(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel')) : null;
    if (saved && saved.trim() && saved !== 'https://shuziroastral.lol') return saved.trim();
    return '';
  });
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');
  const [pingResponse, setPingResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Load saved backend URL on mount
  useEffect(() => {
    const saved = localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel');
    if (saved && saved.trim() && saved !== 'https://shuziroastral.lol') {
      setTunnelUrl(saved.trim());
    } else {
      setTunnelUrl('');
    }
  }, []);

  const runPing = async (url: string, isSilent: boolean = false) => {
    if (!isSilent) {
      setPingStatus('pinging');
    }
    
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

      const targetPingUrl = url && url.startsWith('http') ? `${url}/ping` : '/api/ping';

      const res = await fetch(targetPingUrl, {
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

  // Auto-ping a cada 10 segundos globalmente
  useEffect(() => {
    if (tunnelUrl) {
      runPing(tunnelUrl, true); // Ping inicial silencioso
    }

    const interval = setInterval(() => {
      if (tunnelUrl) {
        runPing(tunnelUrl, true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [tunnelUrl]);

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
      showToast(`Bem-vindo, ${data.nick || ra}!`, 'success');
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
      if (tunnelUrl) authHeaders['x-tunnel-url'] = tunnelUrl;

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
              const candidates = [room.publication_target, room.slug, inner.publication_target, inner.slug];
              candidates.forEach(c => {
                if (c !== undefined && c !== null) {
                  const str = String(c).trim();
                  if (str && (/^\d+$/.test(str) || /^r[0-9a-f]+-l$/i.test(str))) {
                    validTargets.push(str);
                  }
                }
              });
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

  const handleVerifyCaptcha = async () => {
    if (!captchaAnswer.trim()) {
      setCaptchaError('Por favor, digite o texto da imagem.');
      return;
    }

    setCaptchaVerifying(true);
    setCaptchaError('');

    try {
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
            answer: captchaAnswer.trim().toUpperCase()
          }
        })
      });

      if (!verifyRes.ok) {
        throw new Error('Erro na comunicação de verificação do CAPTCHA.');
      }

      const verifyData = await verifyRes.json();
      if (verifyData.valid && verifyData.token) {
        setCaptchaModalOpen(false);
        if (captchaResolverRef.current) {
          captchaResolverRef.current(verifyData.token);
        }
      } else {
        setCaptchaError('Código incorreto. Tente novamente.');
      }
    } catch (e: any) {
      setCaptchaError(e.message || 'Erro ao verificar o CAPTCHA.');
    } finally {
      setCaptchaVerifying(false);
    }
  };

  const handleRefreshCaptcha = async () => {
    setCaptchaVerifying(true);
    setCaptchaError('');
    setCaptchaAnswer('');

    try {
      const challengeRes = await fetch('/api/captcha/challenge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': authToken
        },
        body: JSON.stringify({ realm: 'edusp' })
      });

      if (!challengeRes.ok) {
        throw new Error('Não foi possível obter novo desafio.');
      }

      const challengeData = await challengeRes.json();
      const challengeId = challengeData.challengeId || challengeData.challenge_id;
      const imageBase64 = challengeData.challenge?.image || challengeData.image;

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

  const handleStartAutomation = async (
    taskIds: string[],
    optionsOrTimeSec: number | { minTimeSec: number; maxTimeSec: number; mode: 'draft' | 'submitted' },
    defaultMode: 'draft' | 'submitted' = 'draft'
  ) => {
    let minTimeSec = 10;
    let maxTimeSec = 30;
    let mode: 'draft' | 'submitted' = defaultMode;

    if (typeof optionsOrTimeSec === 'object' && optionsOrTimeSec !== null) {
      minTimeSec = optionsOrTimeSec.minTimeSec || 10;
      maxTimeSec = optionsOrTimeSec.maxTimeSec || minTimeSec;
      if (optionsOrTimeSec.mode) mode = optionsOrTimeSec.mode;
    } else if (typeof optionsOrTimeSec === 'number') {
      minTimeSec = optionsOrTimeSec;
      maxTimeSec = optionsOrTimeSec;
    }

    setProgressOpen(true);
    const firstTask = tasks.find(t => String(t.id || t.task_id) === taskIds[0]);
    const isEssayAutomation = firstTask?.is_essay !== false;

    setProgressTitle(isEssayAutomation ? 'Gerando e enviando redações via IA...' : 'Resolvendo e enviando tarefas SP...');
    setProgressCurrent(0);
    setProgressTotal(taskIds.length);
    setProgressLogs([]);
    setIsCompleted(false);

    let successCount = 0;
    const logs: { text: string; type: 'ok' | 'err' | 'info' }[] = [];

    for (let i = 0; i < taskIds.length; i++) {
      const tid = taskIds[i];
      const taskItem = tasks.find(t => String(t.id || t.task_id) === tid);
      const title = taskItem?.title || `Atividade #${tid}`;
      const isEssay = taskItem?.is_essay !== false;

      // Calculate a random time delay within [minTimeSec, maxTimeSec]
      const delayRange = Math.max(0, maxTimeSec - minTimeSec);
      const actualDelaySec = Math.floor(Math.random() * (delayRange + 1)) + minTimeSec;

      try {
        let genTitle = title;
        let genTexto = '';

        if (isEssay) {
          logs.unshift({ text: `Gerando redação com IA: "${title}"...`, type: 'info' });
          setProgressLogs([...logs]);

          const genRes = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ genero: 'dissertativo-argumentativo', contexto: title })
          });
          const genData = await genRes.json();
          genTitle = genData.titulo || title;
          genTexto = genData.texto || 'Redação desenvolvida com sucesso.';
        } else {
          logs.unshift({ text: `Resolvendo tarefa: "${title}"... (Tempo estipulado: ${actualDelaySec}s)`, type: 'info' });
          setProgressLogs([...logs]);
        }

        // Apply task details
        let rawRoomTarget = taskItem?.publication_target || taskItem?.room_name || taskItem?.room_for_apply || '';
        if (typeof rawRoomTarget !== 'string' || !(/^r[0-9a-f]+-l$/i.test(rawRoomTarget) || (rawRoomTarget.startsWith('r') && rawRoomTarget.length >= 10))) {
          rawRoomTarget = '';
        }
        const roomTarget = rawRoomTarget;
        let applyData: any = {};

        const applyHeaders: Record<string, string> = { 'x-api-key': authToken };
        if (tunnelUrl) applyHeaders['x-tunnel-url'] = tunnelUrl;

        const savedTokenCode = localStorage.getItem('shuziro_token_code') || '';
        const tokenCodeQuery = savedTokenCode ? `&token_code=${encodeURIComponent(savedTokenCode)}` : '';

        let solvedCaptchaToken = '';
        let applySuccess = false;
        let applyAttempts = 0;

        while (!applySuccess && applyAttempts < 3) {
          applyAttempts++;
          try {
            const captchaQuery = solvedCaptchaToken ? `&captcha_token=${encodeURIComponent(solvedCaptchaToken)}` : '';
            const applyRes = await fetch(`/api/tms/task/${tid}/apply?room_name=${encodeURIComponent(roomTarget)}${tokenCodeQuery}${captchaQuery}`, {
              headers: applyHeaders
            });
            if (applyRes.ok) {
              applyData = await applyRes.json();
              applySuccess = true;
            } else {
              const errData = await applyRes.json().catch(() => ({}));
              const errMsg = (errData.error || JSON.stringify(errData) || '').toLowerCase();
              if (errMsg.includes('captcha') || errMsg.includes('missing captcha token')) {
                // Fetch a captcha challenge from the proxied API
                logs.unshift({ text: `⚠️ CAPTCHA detectado ao iniciar tarefa. Buscando desafio de imagem...`, type: 'info' });
                setProgressLogs([...logs]);

                const challengeRes = await fetch('/api/captcha/challenge', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': authToken
                  },
                  body: JSON.stringify({ realm: 'edusp' })
                });

                if (!challengeRes.ok) {
                  throw new Error('Falha ao obter desafio de CAPTCHA do servidor.');
                }

                const challengeData = await challengeRes.json();
                const challengeId = challengeData.challengeId || challengeData.challenge_id;
                const imageBase64 = challengeData.challenge?.image || challengeData.image;

                if (!challengeId || !imageBase64) {
                  throw new Error('O servidor não retornou um desafio de CAPTCHA válido.');
                }

                logs.unshift({ text: `🔑 Por favor, resolva o CAPTCHA exibido na tela...`, type: 'info' });
                setProgressLogs([...logs]);

                // Prompt user to solve CAPTCHA in the UI
                const token = await requestCaptchaSolving(challengeId, imageBase64);
                solvedCaptchaToken = token;
                logs.unshift({ text: `✅ CAPTCHA resolvido! Retomando tarefa...`, type: 'info' });
                setProgressLogs([...logs]);

                // Decrement attempts so this captcha try doesn't count as a failed apply attempt
                applyAttempts--;
              } else {
                throw new Error(errMsg || `HTTP ${applyRes.status} ao aplicar tarefa`);
              }
            }
          } catch (e: any) {
            console.warn(`[Apply] Tentativa ${applyAttempts} ao aplicar task ${tid}:`, e.message);
            if (applyAttempts >= 3) {
              throw e;
            }
          }
        }

        const questionId = applyData.questions?.[0]?.id || applyData.question_id || 1;
        const answerId = applyData.answers?.[String(questionId)]?.answer_id;
        const roomForApply = applyData.room_name || applyData.executed_on || applyData.publication_target || applyData.room_for_apply || roomTarget;

        // Complete / Submit task
        const compHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          'x-api-key': authToken
        };
        if (tunnelUrl) compHeaders['x-tunnel-url'] = tunnelUrl;

        const compRes = await fetch('/api/complete', {
          method: 'POST',
          headers: compHeaders,
          body: JSON.stringify({
            task_id: tid,
            question_id: questionId,
            room_for_apply: roomForApply,
            auth_token: authToken,
            is_essay: isEssay,
            titulo: genTitle,
            texto: genTexto,
            questions: applyData.questions || [],
            answer_id: answerId,
            status: mode,
            duration: actualDelaySec,
            token: applyData.token || applyData.task_token,
            token_code: savedTokenCode,
            apply_moment: applyData.apply_moment || taskItem?.apply_moment
          })
        });

        if (!compRes.ok) {
          const errData = await compRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${compRes.status} ao enviar resposta`);
        }

        successCount++;
        logs.unshift({ text: `Sucesso: "${title}" ${mode === 'submitted' ? 'concluída' : 'salva como rascunho'}!`, type: 'ok' });
      } catch (err: any) {
        logs.unshift({ text: `Erro em "${title}": ${err.message}`, type: 'err' });
      }

      setProgressCurrent(i + 1);
      setProgressLogs([...logs]);

      if (i < taskIds.length - 1 && actualDelaySec > 0) {
        logs.unshift({ text: `Aguardando intervalo anti-ban (${actualDelaySec}s)...`, type: 'info' });
        setProgressLogs([...logs]);
        await new Promise(r => setTimeout(r, actualDelaySec * 1000));
      }
    }

    setIsCompleted(true);
    showToast(`Automação concluída: ${successCount}/${taskIds.length} processadas!`, 'success');
    fetchTasks(authToken, userData);
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
                  onRefresh={() => fetchTasks(authToken, userData)} 
                  onStartAutomation={handleStartAutomation}
                />
              )}
              {currentPage === 'redacoes' && (
                <RedacoesView
                  tasks={tasks}
                  authToken={authToken}
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
        onSuccess={() => setIsVerified(true)}
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

      <ProgressWidget
        isOpen={progressOpen}
        onClose={() => setProgressOpen(false)}
        title={progressTitle}
        progress={progressCurrent}
        total={progressTotal}
        logs={progressLogs}
        isCompleted={isCompleted}
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
