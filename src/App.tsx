import React, { useState, useEffect } from 'react';
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

  // Progress widget state
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressTitle, setProgressTitle] = useState('');
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressLogs, setProgressLogs] = useState<{ text: string; type: 'ok' | 'err' | 'info' }[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global backend / tunnel ping states
  const DEFAULT_BACKEND_URL = 'https://api.davilucas99kk.workers.dev';
  
  const [tunnelUrl, setTunnelUrl] = useState(() => {
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel')) : null;
    if (saved && saved.trim()) return saved.trim();
    return DEFAULT_BACKEND_URL;
  });
  const [pingStatus, setPingStatus] = useState<'idle' | 'pinging' | 'success' | 'failed'>('idle');
  const [pingResponse, setPingResponse] = useState<any>(null);
  const [latency, setLatency] = useState<number | null>(null);

  // Load saved backend URL on mount
  useEffect(() => {
    const saved = localStorage.getItem('shuziro_backend_url') || localStorage.getItem('shuziro_termux_tunnel');
    if (saved && saved.trim()) {
      setTunnelUrl(saved.trim());
    } else {
      setTunnelUrl(DEFAULT_BACKEND_URL);
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

      const res = await fetch(`${url}/ping`, {
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
      console.warn('Erro ao pingar o servidor backend:', err);
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
      const authHeaders: Record<string, string> = { 'x-api-key': token };
      if (tunnelUrl) authHeaders['x-tunnel-url'] = tunnelUrl;

      const roomsRes = await fetch('/api/rooms', {
        headers: authHeaders
      });
      let rooms: any[] = [];
      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        rooms = roomsData.rooms || roomsData.items || (Array.isArray(roomsData) ? roomsData : []);
      }

      const targets: string[] = [];

      rooms.forEach((room: any) => {
        if (room.publication_target) targets.push(room.publication_target);
        if (room.name) targets.push(room.name);
        if (room.id) targets.push(room.id.toString());
        if (room.code) targets.push(room.code.toString());
        if (room.subjects) room.subjects.forEach((s: any) => s.id && targets.push(s.id.toString()));
        if (room.group_categories) room.group_categories.forEach((c: any) => c.id && targets.push(c.id.toString()));
      });

      const uniqueTargets = [...new Set(targets)].filter(Boolean);
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

      if (uniqueTargets.length > 0) {
        const targetParams = uniqueTargets.map(t => `publication_target=${encodeURIComponent(t)}`).join('&');
        try {
          const [tRes, eRes] = await Promise.all([
            fetch(`/api/tms/task/todo?is_essay=false&${targetParams}`, { headers: authHeaders }),
            fetch(`/api/tms/task/todo?is_essay=true&${targetParams}`, { headers: authHeaders })
          ]);
          if (tRes.ok) addTasks(await tRes.json());
          if (eRes.ok) addTasks(await eRes.json());
        } catch (e) {
          console.warn('Erro ao buscar tarefas combinadas:', e);
        }

        if (allFetchedTasks.length === 0) {
          for (const t of uniqueTargets) {
            try {
              const encTarget = encodeURIComponent(t);
              const [tRes, eRes] = await Promise.all([
                fetch(`/api/tms/task/todo?is_essay=false&publication_target=${encTarget}`, { headers: authHeaders }),
                fetch(`/api/tms/task/todo?is_essay=true&publication_target=${encTarget}`, { headers: authHeaders })
              ]);
              if (tRes.ok) addTasks(await tRes.json());
              if (eRes.ok) addTasks(await eRes.json());
            } catch (e) {
              console.warn(`Erro ao buscar target ${t}:`, e);
            }
          }
        }
      }

      setTasks(allFetchedTasks);
      if (allFetchedTasks.length > 0) {
        showToast(`${allFetchedTasks.length} tarefas e redações reais encontradas!`, 'success');
      } else {
        showToast('Nenhuma tarefa ou redação pendente encontrada nas salas.', 'info');
      }
    } catch (err: any) {
      console.warn('Erro ao carregar tarefas:', err);
      showToast('Erro ao carregar tarefas: ' + err.message, 'error');
    }
  };

  const handleStartAutomation = async (taskIds: string[], timeSec: number, mode: 'draft' | 'submitted') => {
    setProgressOpen(true);
    setProgressTitle('Gerando e enviando redações via IA...');
    setProgressCurrent(0);
    setProgressTotal(taskIds.length);
    setProgressLogs([]);
    setIsCompleted(false);

    let successCount = 0;
    const logs: { text: string; type: 'ok' | 'err' | 'info' }[] = [];

    for (let i = 0; i < taskIds.length; i++) {
      const tid = taskIds[i];
      const taskItem = tasks.find(t => String(t.id || t.task_id) === tid);
      const title = taskItem?.title || `Redação #${tid}`;

      try {
        logs.unshift({ text: `Gerando redação: "${title}"...`, type: 'info' });
        setProgressLogs([...logs]);

        // 1. Generate via AI
        const genRes = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ genero: 'dissertativo-argumentativo', contexto: title })
        });
        const genData = await genRes.json();

        // 2. Apply task details
        let rawRoomTarget = taskItem?.publication_target || taskItem?.room_name || taskItem?.room_for_apply || '';
        if (typeof rawRoomTarget !== 'string' || !(/^r[0-9a-f]+-l$/i.test(rawRoomTarget) || (rawRoomTarget.startsWith('r') && rawRoomTarget.length >= 10))) {
          rawRoomTarget = '';
        }
        const roomTarget = rawRoomTarget;
        let applyData: any = {};
        try {
          const applyRes = await fetch(`/api/tms/task/${tid}/apply?room_name=${encodeURIComponent(roomTarget)}`, {
            headers: { 'x-api-key': authToken }
          });
          if (applyRes.ok) {
            applyData = await applyRes.json();
          } else {
            if (applyRes.status === 403) {
              throw new Error(`Permissão negada (403) para a tarefa #${tid}`);
            }
          }
        } catch (e: any) {
          console.warn(`[Apply] Aviso ao aplicar task ${tid}:`, e.message);
          if (e.message.includes('403')) throw e;
        }

        const questionId = applyData.questions?.[0]?.id || applyData.question_id || 1;
        const answerId = applyData.answers?.[String(questionId)]?.answer_id;
        const roomForApply = applyData.room_name || applyData.executed_on || applyData.publication_target || applyData.room_for_apply || roomTarget;

        // 3. Complete / Submit task
        const compRes = await fetch('/api/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_id: tid,
            question_id: questionId,
            room_for_apply: roomForApply,
            auth_token: authToken,
            titulo: genData.titulo || title,
            texto: genData.texto || 'Redação gerada com sucesso pelo ShuziroAstral Hub.',
            answer_id: answerId,
            status: mode,
            duration: timeSec || 30,
            token: applyData.token || applyData.task_token,
            apply_moment: applyData.apply_moment || taskItem?.apply_moment
          })
        });

        if (!compRes.ok) {
          const errData = await compRes.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${compRes.status} ao enviar resposta`);
        }

        successCount++;
        logs.unshift({ text: `Sucesso: "${title}" processada!`, type: 'ok' });
      } catch (err: any) {
        logs.unshift({ text: `Erro em "${title}": ${err.message}`, type: 'err' });
      }

      setProgressCurrent(i + 1);
      setProgressLogs([...logs]);

      if (i < taskIds.length - 1 && timeSec > 0) {
        await new Promise(r => setTimeout(r, timeSec * 1000));
      }
    }

    setIsCompleted(true);
    showToast(`Automação concluída: ${successCount}/${taskIds.length} enviadas!`, 'success');
    fetchTasks(authToken, userData);
  };

  const isPlatformSlug = currentPage in PLATFORMS_DATA;

  return (
    <div className="min-h-screen text-zinc-100 font-sans relative selection:bg-white selection:text-black">
      <BackgroundStars />

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
              onRefresh={() => fetchTasks(authToken, userData)} 
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
        onClose={() => setShowDiscordModal(false)}
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
    </div>
  );
}
