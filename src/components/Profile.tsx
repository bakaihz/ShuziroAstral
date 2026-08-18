import React, { useEffect, useState } from 'react';
import { StudentAPI } from '../api/student';
import { LibraryAPI } from '../api/library';
import { 
  User, Flame, Bell, RefreshCw, BookOpen, Clock, Heart, Award, CheckSquare, 
  ChevronRight, AlertOctagon, HelpCircle, Activity, Info
} from 'lucide-react';
import { UserData } from '../types';

interface ProfileProps {
  userData?: UserData;
}

// Analisadores dinâmicos de resposta JSON para evitar adivinhação estática
const findValueByKeys = (obj: any, keys: string[]): any => {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  // Varredura recursiva rasa para objetos aninhados
  for (const k in obj) {
    if (obj[k] && typeof obj[k] === 'object') {
      const nested = findValueByKeys(obj[k], keys);
      if (nested !== null && nested !== undefined) return nested;
    }
  }
  return null;
};

interface FoundMetric {
  endpoint: string;
  field: string;
  value: any;
  description: string;
}

export const ProfileComponent: React.FC<ProfileProps> = ({ userData }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados dos endpoints
  const [studentRes, setStudentRes] = useState<any>(null);
  const [userInfoRes, setUserInfoRes] = useState<any>(null);
  const [thermometerRes, setThermometerRes] = useState<any>(null);
  const [albumRes, setAlbumRes] = useState<any>(null);
  const [latestAnnRes, setLatestAnnRes] = useState<any>(null);
  const [newestAnnRes, setNewestAnnRes] = useState<any>(null);
  const [feedbacksRes, setFeedbacksRes] = useState<any>(null);
  const [assignmentsRes, setAssignmentsRes] = useState<any>(null);
  const [readingsRes, setReadingsRes] = useState<any>(null);
  const [favoritesRes, setFavoritesRes] = useState<any>(null);
  const [suggestedRes, setSuggestedRes] = useState<any>(null);
  const [projRes, setProjRes] = useState<any>(null);

  // Status de disponibilidade dos endpoints
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  // Lista de métricas reais encontradas para a tabela de mapeamento
  const [foundMetrics, setFoundMetrics] = useState<FoundMetric[]>([]);

  const loadAllData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    const newStatusMap: Record<string, string> = {};
    const metrics: FoundMetric[] = [];

    // Função auxiliar de execução segura com controle de status e tempo limite
    const fetchSafe = async (
      name: string,
      promise: Promise<any>,
      setter: (data: any) => void
    ) => {
      try {
        const res = await promise;
        if (res && res.ok && res.data !== null) {
          setter(res.data);
          newStatusMap[name] = 'Disponível';
          return res.data;
        } else {
          setter('unavailable');
          newStatusMap[name] = res ? `Erro ${res.status || 'Desconhecido'}` : 'unavailable';
          return null;
        }
      } catch (e: any) {
        setter('unavailable');
        newStatusMap[name] = e.message || 'Falha de Conexão';
        return null;
      }
    };

    // Executando as requisições em paralelo para otimizar a performance
    const [
      std, uinfo, therm, album, latestAnn, newestAnn, fbacks, asgs, reads, favs, sug, proj
    ] = await Promise.all([
      fetchSafe('GET /v1.5/student', StudentAPI.getStudent(userData), setStudentRes),
      fetchSafe('GET /v1.5/user-info', StudentAPI.getUserInfo(), setUserInfoRes),
      fetchSafe('GET /v1/student/thermometer', StudentAPI.getThermometer(), setThermometerRes),
      fetchSafe('GET /v1/student/album-preview', StudentAPI.getAlbumPreview(), setAlbumRes),
      fetchSafe('GET /v1/student/latest-announcement', StudentAPI.getLatestAnnouncement(), setLatestAnnRes),
      fetchSafe('GET /v1/student/newest-announcement', StudentAPI.getNewestAnnouncement(), setNewestAnnRes),
      fetchSafe('GET /v1/student/feedbacks', StudentAPI.getFeedbacks(), setFeedbacksRes),
      fetchSafe('GET /v1/student/assignments/received', StudentAPI.getAssignmentsReceived(), setAssignmentsRes),
      fetchSafe('GET /v1/library/book/readings', LibraryAPI.getReadings(), setReadingsRes),
      fetchSafe('GET /v1/library/book/favorites', LibraryAPI.getFavorites(), setFavoritesRes),
      fetchSafe('GET /v1/library/user-has-suggestedlevel', LibraryAPI.getSuggestedLevel(), setSuggestedRes),
      fetchSafe('GET /v1/library/reading-project-v2', LibraryAPI.getReadingProject(), setProjRes)
    ]);

    // Análise dinâmica para preencher foundMetrics (Mapeamento de Respostas Reais)
    if (std && std !== 'unavailable') {
      const keys = ['name', 'nome', 'nick', 'studentName', 'schoolName', 'school', 'escola', 'grade', 'serie', 'ra', 'digito'];
      keys.forEach(k => {
        const val = findValueByKeys(std, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1.5/student',
            field: k,
            value: typeof val === 'object' ? JSON.stringify(val) : val,
            description: `Identificador de perfil: ${k}`
          });
        }
      });
    }

    if (uinfo && uinfo !== 'unavailable') {
      ['userId', 'email', 'role', 'activeSession', 'login', 'id'].forEach(k => {
        const val = findValueByKeys(uinfo, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1.5/user-info',
            field: k,
            value: val,
            description: `Dados de sessão do usuário: ${k}`
          });
        }
      });
    }

    if (therm && therm !== 'unavailable') {
      ['currentMinutes', 'minutes', 'minutesRead', 'tempo_leitura', 'minutos', 'weeklyGoal', 'goal', 'meta', 'percentage', 'progresso', 'percent', 'daysActive', 'activeDays', 'dias_ativos', 'streak', 'sequencia', 'ofensiva'].forEach(k => {
        const val = findValueByKeys(therm, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1/student/thermometer',
            field: k,
            value: val,
            description: `Indicadores de engajamento semanal: ${k}`
          });
        }
      });
    }

    if (album && album !== 'unavailable') {
      ['stickersUnlocked', 'totalStickers', 'recentSticker', 'stickers', 'conquistas', 'selos'].forEach(k => {
        const val = findValueByKeys(album, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1/student/album-preview',
            field: k,
            value: val,
            description: `Selos e conquistas do aluno: ${k}`
          });
        }
      });
    }

    if (favs && favs !== 'unavailable') {
      ['totalFavorites', 'favorites', 'favoritos', 'count'].forEach(k => {
        const val = findValueByKeys(favs, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1/library/book/favorites',
            field: k,
            value: Array.isArray(val) ? `Lista de ${val.length} itens` : val,
            description: `Livros marcados como favoritos: ${k}`
          });
        }
      });
    }

    if (reads && reads !== 'unavailable') {
      ['readings', 'totalReadings', 'booksRead', 'livros_lidos', 'concluidos', 'count'].forEach(k => {
        const val = findValueByKeys(reads, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1/library/book/readings',
            field: k,
            value: Array.isArray(val) ? `Lista de ${val.length} itens` : val,
            description: `Registro histórico de leituras: ${k}`
          });
        }
      });
    }

    if (proj && proj !== 'unavailable') {
      ['projectId', 'title', 'active', 'targetBooksCount', 'projeto'].forEach(k => {
        const val = findValueByKeys(proj, [k]);
        if (val !== null && val !== undefined) {
          metrics.push({
            endpoint: '/v1/library/reading-project-v2',
            field: k,
            value: val,
            description: `Atributo do projeto pedagógico: ${k}`
          });
        }
      });
    }

    setStatusMap(newStatusMap);
    setFoundMetrics(metrics);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadAllData();
  }, [userData]);

  const refreshStudentData = () => {
    loadAllData(true);
  };

  // Funções de Extração Dinâmica de Campos (com Fallback e Sem Advinhação Fictícia)
  const getMinutesRead = () => {
    if (thermometerRes && thermometerRes !== 'unavailable') {
      const minutes = findValueByKeys(thermometerRes, ['currentMinutes', 'minutes', 'minutesRead', 'tempo_leitura', 'minutos']);
      const goal = findValueByKeys(thermometerRes, ['weeklyGoal', 'goal', 'meta']);
      if (minutes !== null) {
        return `${minutes}${goal ? ` / ${goal}` : ''} min`;
      }
    }
    return null;
  };

  const getDaysActive = () => {
    if (thermometerRes && thermometerRes !== 'unavailable') {
      const days = findValueByKeys(thermometerRes, ['daysActive', 'activeDays', 'dias', 'dias_ativos']);
      if (days !== null) return `${days} dias`;
    }
    return null;
  };

  const getStreak = () => {
    if (thermometerRes && thermometerRes !== 'unavailable') {
      const streak = findValueByKeys(thermometerRes, ['streak', 'sequencia', 'ofensiva']);
      if (streak !== null) return `${streak} dias 🔥`;
    }
    return null;
  };

  const getBooksReadCount = () => {
    if (readingsRes && readingsRes !== 'unavailable') {
      const count = findValueByKeys(readingsRes, ['totalReadings', 'booksRead', 'livros_lidos', 'concluidos', 'count']);
      if (count !== null) return `${count} livros`;
      const readingsList = findValueByKeys(readingsRes, ['readings', 'items']);
      if (Array.isArray(readingsList)) return `${readingsList.length} livros`;
    }
    return null;
  };

  const getSuggestedLevelText = () => {
    if (suggestedRes && suggestedRes !== 'unavailable') {
      const level = findValueByKeys(suggestedRes, ['level', 'suggestedLevel', 'nivel']);
      const hasLevel = findValueByKeys(suggestedRes, ['hasSuggestedLevel', 'possui_nivel']);
      if (level !== null) return String(level);
      if (hasLevel !== null) return hasLevel ? "Nível Configurado" : "Nível Padrão";
    }
    return null;
  };

  const getActiveAssignmentsCount = () => {
    if (assignmentsRes && assignmentsRes !== 'unavailable') {
      const list = findValueByKeys(assignmentsRes, ['assignments', 'tasks', 'atividades', 'received']);
      if (Array.isArray(list)) return `${list.length} ativas`;
      if (Array.isArray(assignmentsRes)) return `${assignmentsRes.length} ativas`;
    }
    return null;
  };

  const getFavoritesCount = () => {
    if (favoritesRes && favoritesRes !== 'unavailable') {
      const favList = findValueByKeys(favoritesRes, ['favorites', 'items', 'favoritos']);
      const totalFav = findValueByKeys(favoritesRes, ['totalFavorites', 'count']);
      if (totalFav !== null) return `${totalFav} favoritos`;
      if (Array.isArray(favList)) return `${favList.length} favoritos`;
      if (Array.isArray(favoritesRes)) return `${favoritesRes.length} favoritos`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-red-600 animate-spin mx-auto" />
        <p className="text-sm font-bold text-zinc-400">Varrendo e mapeando dados reais do Aluno LeiaSP...</p>
      </div>
    );
  }

  // Mapeando dados do perfil
  const studentName = findValueByKeys(studentRes, ['name', 'nome', 'studentName']) || userData?.nome || userData?.nick || "Aluno Conectado";
  const studentSchool = findValueByKeys(studentRes, ['schoolName', 'school', 'escola']) || userData?.escola || "SEDUC SP";
  const studentGrade = findValueByKeys(studentRes, ['grade', 'serie']) || userData?.serie || "Ensino Médio";
  const rawRa = findValueByKeys(studentRes, ['ra']) || userData?.ra || '';
  const digito = findValueByKeys(studentRes, ['digito']) || userData?.digito || '';
  const userEmail = findValueByKeys(userInfoRes, ['email']) || "Não disponível";
  const activeSession = findValueByKeys(userInfoRes, ['activeSession']) !== null ? "Sim" : "Não disponível";

  const raDisplay = rawRa ? `${rawRa}${digito ? '-' + digito : ''}` : "Não disponível";

  return (
    <div className="space-y-6 animate-fadeIn text-white bg-black p-1">
      
      {/* HEADER DO PERFIL */}
      <div className="bg-[#0f0a0a] border border-red-950 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-red-950/40 border border-red-800 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {studentName}
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Escola: <strong className="text-zinc-200">{studentSchool}</strong> | Série: <strong className="text-zinc-200">{studentGrade}</strong>
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[10px] bg-red-950 text-red-300 px-2.5 py-0.5 rounded-full font-bold border border-red-800/60 uppercase tracking-wide">
                Aluno Sincronizado
              </span>
              {getStreak() && (
                <span className="text-[10px] bg-zinc-900 text-white px-2.5 py-0.5 rounded-full font-bold border border-zinc-800">
                  {getStreak()}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={refreshStudentData}
          disabled={refreshing}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-red-900/30 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </button>
      </div>

      {/* SEÇÃO: MEU PERFIL */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Info className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Meu Perfil</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Nome Completo</span>
            <p className="font-bold text-white truncate">{studentName}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/student</span>
          </div>

          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Registro do Aluno (RA)</span>
            <p className="font-bold text-white truncate">{raDisplay}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/student</span>
          </div>

          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Email do Aluno</span>
            <p className="font-bold text-white truncate">{userEmail}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/user-info</span>
          </div>

          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Sessão Ativa no Servidor</span>
            <p className="font-bold text-white truncate">{activeSession}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/user-info</span>
          </div>

          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Série Escolar</span>
            <p className="font-bold text-white truncate">{studentGrade}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/student</span>
          </div>

          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Escola de Vínculo</span>
            <p className="font-bold text-white truncate">{studentSchool}</p>
            <span className="text-[9px] text-zinc-600 block">Origem: /v1.5/student</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO: MEU PROGRESSO (Cards Reais Encontrados) */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Activity className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Meu Progresso</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* CARD 1: MINUTOS DE LEITURA */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                <span>Minutos de Leitura</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getMinutesRead() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/student/thermometer</span>
          </div>

          {/* CARD 2: DIAS DE LEITURA */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Dias de Leitura</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getDaysActive() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/student/thermometer</span>
          </div>

          {/* CARD 3: SEQUÊNCIA */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Sequência (Streak)</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getStreak() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/student/thermometer</span>
          </div>

          {/* CARD 4: LIVROS LIDOS */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5 text-red-500" />
                <span>Livros Concluídos</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getBooksReadCount() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/library/book/readings</span>
          </div>

          {/* CARD 5: LIVROS FAVORITOS */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Heart className="w-3.5 h-3.5 text-red-500" />
                <span>Livros Favoritos</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getFavoritesCount() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/library/book/favorites</span>
          </div>

          {/* CARD 6: TAREFAS / ATIVIDADES */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <CheckSquare className="w-3.5 h-3.5 text-red-500" />
                <span>Atividades Pedagógicas</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {getActiveAssignmentsCount() || <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/student/assignments/received</span>
          </div>

          {/* CARD 7: PROJETO DE LEITURA */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-red-500" />
                <span>Projeto Pedagógico</span>
              </div>
              <p className="text-xs font-bold text-white mt-1.5 leading-snug line-clamp-2">
                {projRes && projRes !== 'unavailable' ? findValueByKeys(projRes, ['title']) : <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/library/reading-project-v2</span>
          </div>

          {/* CARD 8: ÁLBUM DE SELOS */}
          <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl space-y-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-red-500" />
                <span>Selos Desbloqueados</span>
              </div>
              <p className="text-lg font-black text-white mt-1.5">
                {albumRes && albumRes !== 'unavailable' ? `${findValueByKeys(albumRes, ['stickersUnlocked', 'unlockedCount']) || 0} selos` : <span className="text-[10px] text-red-500 font-bold bg-red-950/20 px-2 py-0.5 rounded">NÃO DISPONÍVEL NA API OBSERVADA</span>}
              </p>
            </div>
            <span className="text-[9px] text-zinc-600">Origem: /v1/student/album-preview</span>
          </div>

        </div>
      </div>

      {/* SEÇÃO: MINHAS ATIVIDADES */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <CheckSquare className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Minhas Atividades & Tarefas</h4>
        </div>
        
        {assignmentsRes && assignmentsRes !== 'unavailable' && Array.isArray(assignmentsRes) && assignmentsRes.length > 0 ? (
          <div className="space-y-2.5">
            {assignmentsRes.map((asg: any, i: number) => (
              <div key={i} className="bg-[#121214] border border-zinc-850 p-4 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <h5 className="font-bold text-white text-xs">{asg.title || asg.nome || 'Atividade Literária'}</h5>
                  <p className="text-zinc-400 text-[10px] mt-1">Prazo: {asg.dueDate || asg.prazo || 'Sem prazo'}</p>
                </div>
                <span className="bg-red-950 text-red-300 border border-red-900 font-bold px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                  {asg.status || 'Pendente'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-6 text-center text-xs text-zinc-500">
            {assignmentsRes === 'unavailable' ? 'Módulo indisponível ou permissão negada no servidor (403).' : 'Nenhuma atividade pedagógica ativa localizada nesta sessão.'}
          </div>
        )}
      </div>

      {/* SEÇÃO: MEUS FAVORITOS */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Heart className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Meus Livros Favoritos</h4>
        </div>
        
        {favoritesRes && favoritesRes !== 'unavailable' && Array.isArray(favoritesRes.favorites) && favoritesRes.favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {favoritesRes.favorites.map((fav: any, i: number) => (
              <div key={i} className="bg-[#121214] border border-zinc-850 p-3 rounded-xl flex items-center gap-3 text-xs">
                <img src={fav.coverUrl} alt={fav.title} className="w-10 h-14 object-cover rounded border border-zinc-850 shrink-0" />
                <div className="min-w-0">
                  <h5 className="font-bold text-white truncate">{fav.title}</h5>
                  <p className="text-zinc-400 text-[10px] truncate mt-0.5">{fav.author}</p>
                  <span className="text-[9px] bg-red-950/20 text-red-400 border border-red-950 px-1.5 py-0.5 rounded mt-1.5 inline-block">Favoritado</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-6 text-center text-xs text-zinc-500">
            {favoritesRes === 'unavailable' ? 'Módulo de favoritos indisponível na API de produção.' : 'Nenhum livro marcado como favorito nesta sessão do aluno.'}
          </div>
        )}
      </div>

      {/* SEÇÃO: INDICADORES */}
      <div className="bg-[#09090b] border border-zinc-900 rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Award className="w-4 h-4 text-red-500" />
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Indicadores do Termômetro</h4>
        </div>
        
        {thermometerRes && thermometerRes !== 'unavailable' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Meta de Leitura Semanal</span>
                <p className="text-xl font-black text-white">{findValueByKeys(thermometerRes, ['weeklyGoal', 'goal', 'meta']) || 60} minutos</p>
              </div>

              <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Tempo Consumido</span>
                <p className="text-xl font-black text-red-500">{findValueByKeys(thermometerRes, ['currentMinutes', 'minutes', 'minutesRead', 'tempo_leitura', 'minutos']) || 0} minutos</p>
              </div>

              <div className="bg-[#121214] border border-zinc-850 p-4 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase">Percentual da Meta</span>
                <p className="text-xl font-black text-white">{findValueByKeys(thermometerRes, ['percentage', 'progresso', 'percent']) || 0}%</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                <span>Progresso do Aluno</span>
                <span className="text-red-500">{findValueByKeys(thermometerRes, ['percentage', 'progresso', 'percent']) || 0}%</span>
              </div>
              <div className="w-full bg-zinc-900 h-3.5 rounded-full overflow-hidden border border-zinc-800 p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-red-700 to-red-500"
                  style={{ width: `${Math.min(100, findValueByKeys(thermometerRes, ['percentage', 'progresso', 'percent']) || 0)}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#121214] border border-zinc-850 rounded-xl p-6 text-center text-xs text-zinc-500">
            Nenhum dado do termômetro do aluno disponível.
          </div>
        )}
      </div>



    </div>
  );
};
