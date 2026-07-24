import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Bell, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Pin, 
  User, 
  RefreshCw, 
  Search, 
  FileText, 
  Clock, 
  ExternalLink, 
  X,
  Award,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { UserData, FrequenciaItem, AvisoTurmaItem, NotificacaoCmspItem } from '../types';

interface BoletimViewProps {
  userData: UserData;
  authToken: string;
}

export const BoletimView: React.FC<BoletimViewProps> = ({ userData, authToken }) => {
  const [activeTab, setActiveTab] = useState<'boletim' | 'mural' | 'notificacoes'>('boletim');
  const [selectedBimestre, setSelectedBimestre] = useState<number>(1);
  
  // Data States
  const [frequencia, setFrequencia] = useState<FrequenciaItem[]>([]);
  const [avisos, setAvisos] = useState<AvisoTurmaItem[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoCmspItem[]>([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotificacao, setSelectedNotificacao] = useState<NotificacaoCmspItem | null>(null);
  const [selectedAviso, setSelectedAviso] = useState<AvisoTurmaItem | null>(null);

  const fetchFrequencia = async (bim: number) => {
    try {
      const codigoAluno = userData.codigoAluno || '31838026';
      const codigoTurma = userData.codigoTurma || '0';
      
      // Fetch both frequencia and boletim
      const [freqRes, bolRes] = await Promise.all([
        fetch(`/api/frequencia?codigoAluno=${codigoAluno}&anoLetivo=2026&bimestre=${bim}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        }),
        fetch(`/api/boletim?codigoAluno=${codigoAluno}&anoLetivo=2026&codigoTurma=${codigoTurma}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      ]);

      let freqData: any[] = [];
      let bolData: any[] = [];

      if (freqRes.ok) {
        const json = await freqRes.json();
        freqData = json.data || (Array.isArray(json) ? json : []);
      }

      if (bolRes.ok) {
        const json = await bolRes.json();
        bolData = json.data || (Array.isArray(json) ? json : []);
      }

      // Merge grades from boletim if available
      const merged = freqData.map((fItem: any) => {
        const found = bolData.find((bItem: any) => 
          bItem.disciplinaId === fItem.disciplinaId || 
          (bItem.nomeDisciplina && fItem.nomeDisciplina && bItem.nomeDisciplina.trim().toUpperCase() === fItem.nomeDisciplina.trim().toUpperCase())
        );
        return {
          ...fItem,
          nota: found?.nota ?? fItem.nota
        };
      });

      setFrequencia(merged.length > 0 ? merged : freqData);
    } catch (err) {
      console.warn('Erro ao carregar frequência/boletim:', err);
    }
  };

  const fetchAvisos = async () => {
    try {
      const codigoUsuario = userData.codigoAluno || '318380266';
      const turmas = userData.codigoTurma || '40917188';
      const res = await fetch(`/api/avisos?codigoUsuario=${codigoUsuario}&turmas=${turmas}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        const items = json.data || (Array.isArray(json) ? json : []);
        setAvisos(items);
      }
    } catch (err) {
      console.warn('Erro ao carregar avisos:', err);
    }
  };

  const fetchNotificacoes = async () => {
    try {
      const userId = userData.codigoAluno || '318380266';
      const res = await fetch(`/api/notificacoes?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : (json.data || []);
        setNotificacoes(items);
      }
    } catch (err) {
      console.warn('Erro ao carregar notificações:', err);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchFrequencia(selectedBimestre),
      fetchAvisos(),
      fetchNotificacoes()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAllData();
  }, [userData, authToken]);

  useEffect(() => {
    fetchFrequencia(selectedBimestre);
  }, [selectedBimestre]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  };

  // Calculations for summary
  const totalDisciplinas = frequencia.length;
  const mediaPresenca = totalDisciplinas > 0 
    ? Math.round(frequencia.reduce((acc, curr) => acc + (curr.porcentagemPresenca || 0), 0) / totalDisciplinas)
    : 92;
  const totalFaltas = frequencia.reduce((acc, curr) => acc + (curr.numeroFaltasBimestre || 0), 0);

  // Filtered lists
  const filteredAvisos = avisos.filter(a => 
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.nomeUsuarioCadastro && a.nomeUsuarioCadastro.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredNotificacoes = notificacoes.filter(n =>
    n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (n.mensagemCustomizavel && n.mensagemCustomizavel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Recente';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 md:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-white" /> Sala do Futuro 2026
              </span>
              {userData.codigoAluno && (
                <span className="text-[11px] text-zinc-400 font-mono">
                  RA/Código: <strong className="text-zinc-200">{userData.codigoAluno}</strong>
                </span>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-white" />
              Boletim & Mural de Avisos
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Acompanhe sua frequência escolar por disciplina, tarefas e os avisos mais recentes da sua turma.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="self-start md:self-auto px-4 py-2.5 bg-[#18181b] hover:bg-[#222226] border border-[#27272a] hover:border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
          </button>
        </div>

        {/* Quick Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#27272a]/60">
          <div className="bg-[#18181b]/80 border border-[#27272a] rounded-xl p-3.5">
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Média de Frequência</div>
            <div className="text-lg font-bold text-white mt-0.5 flex items-baseline gap-1.5">
              {mediaPresenca}%
              <span className="text-[10px] font-normal text-zinc-400">({mediaPresenca >= 85 ? 'Excelente' : 'Atenção'})</span>
            </div>
          </div>

          <div className="bg-[#18181b]/80 border border-[#27272a] rounded-xl p-3.5">
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Total de Faltas</div>
            <div className="text-lg font-bold text-zinc-200 mt-0.5">
              {totalFaltas} <span className="text-xs font-normal text-zinc-400">aulas</span>
            </div>
          </div>

          <div className="bg-[#18181b]/80 border border-[#27272a] rounded-xl p-3.5">
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Avisos da Turma</div>
            <div className="text-lg font-bold text-zinc-200 mt-0.5">
              {avisos.length} <span className="text-xs font-normal text-zinc-400">recados</span>
            </div>
          </div>

          <div className="bg-[#18181b]/80 border border-[#27272a] rounded-xl p-3.5">
            <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Notificações CMSP</div>
            <div className="text-lg font-bold text-zinc-200 mt-0.5">
              {notificacoes.length} <span className="text-xs font-normal text-zinc-400">comunicados</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#27272a] pb-3">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('boletim')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'boletim'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-[#121214] border border-[#27272a] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Frequência & Boletim
          </button>

          <button
            onClick={() => setActiveTab('mural')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mural'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-[#121214] border border-[#27272a] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" /> Mural de Avisos
            {avisos.length > 0 && (
              <span className="bg-zinc-800 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-zinc-700">
                {avisos.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('notificacoes')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'notificacoes'
                ? 'bg-white text-black shadow-sm font-bold'
                : 'bg-[#121214] border border-[#27272a] text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Comunicados CMSP
            {notificacoes.length > 0 && (
              <span className="bg-zinc-800 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold border border-zinc-700">
                {notificacoes.length}
              </span>
            )}
          </button>
        </div>

        {/* Search filter for Mural/Notificacoes */}
        {activeTab !== 'boletim' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar avisos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121214] border border-[#27272a] focus:border-zinc-500 text-zinc-200 text-xs rounded-xl pl-9 pr-3 py-1.5 outline-none transition-all"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Boletim & Frequência */}
      {activeTab === 'boletim' && (
        <div className="space-y-4">
          {/* Bimestre Selector */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-white" />
              Selecione o Bimestre:
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((bim) => {
                const isUnreleased = bim === 3 || bim === 4;
                return (
                  <button
                    key={bim}
                    onClick={() => setSelectedBimestre(bim)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                      selectedBimestre === bim
                        ? 'bg-white text-black shadow-md'
                        : 'bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {bim}º Bimestre
                    {isUnreleased && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                        Não Lançado
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {(selectedBimestre === 3 || selectedBimestre === 4) && (
            <div className="bg-[#18181b] border border-zinc-700/80 rounded-xl p-3.5 text-xs text-zinc-300 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
              <div>
                <strong className="text-white block font-semibold">Bimestre Não Lançado Oficialmente</strong>
                As notas e frequências do {selectedBimestre}º Bimestre de 2026 ainda não foram liberadas no sistema da SED. Exibindo apenas registros disponíveis.
              </div>
            </div>
          )}

          {/* Frequência Cards Grid */}
          {loading ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
              Carregando dados reais do boletim...
            </div>
          ) : frequencia.length === 0 ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs">
              Nenhuma disciplina ou nota lançada para o {selectedBimestre}º Bimestre.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {frequencia.map((item, idx) => {
                const pct = item.porcentagemPresenca ?? 100;

                return (
                  <div key={idx} className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-wide">
                          {item.nomeDisciplina}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-zinc-700 bg-zinc-800 text-zinc-200">
                          {pct}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-[#18181b] rounded-full h-2 mt-3 overflow-hidden border border-[#27272a]">
                        <div 
                          className="h-full rounded-full transition-all duration-500 bg-zinc-200" 
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} 
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#27272a]/60 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-zinc-500">Presenças:</span>{' '}
                        <strong className="text-zinc-200 font-semibold">{item.numeroPresencasBimestre ?? 0}</strong>
                      </div>
                      <div>
                        <span className="text-zinc-500">Faltas:</span>{' '}
                        <strong className="text-zinc-300 font-semibold">{item.numeroFaltasBimestre ?? 0}</strong>
                      </div>
                      <div className="col-span-2 pt-1 flex items-center justify-between">
                        <span className="text-zinc-400 font-medium">Nota SED Real:</span>
                        <span className="text-xs font-bold text-black bg-white px-2 py-0.5 rounded-lg">
                          {selectedBimestre === 3 || selectedBimestre === 4 ? '--' : (item.nota ?? 'Lançada')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Mural de Avisos da Turma */}
      {activeTab === 'mural' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
              Carregando avisos da turma...
            </div>
          ) : filteredAvisos.length === 0 ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs">
              Nenhum aviso da turma encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAvisos.map((aviso) => (
                <div 
                  key={aviso.codigoMuralAviso} 
                  className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      {aviso.fixarAviso && (
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-zinc-300" /> Aviso Fixado
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3" /> {formatDate(aviso.dataCadastro)}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                      {aviso.titulo}
                    </h3>

                    <p className="text-xs text-zinc-300 mt-2 line-clamp-4 whitespace-pre-line leading-relaxed bg-[#18181b]/50 p-3 rounded-xl border border-[#27272a]/80">
                      {aviso.conteudo}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#27272a]/60 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="flex items-center gap-1 text-zinc-300 font-medium">
                      <User className="w-3.5 h-3.5 text-zinc-400" /> {aviso.nomeUsuarioCadastro || 'Professor / Coordenação'}
                    </span>
                    <button
                      onClick={() => setSelectedAviso(aviso)}
                      className="text-xs font-semibold text-white hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      Ler Detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notificações CMSP */}
      {activeTab === 'notificacoes' && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 text-white animate-spin" />
              Carregando comunicados do CMSP...
            </div>
          ) : filteredNotificacoes.length === 0 ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-12 text-center text-zinc-500 text-xs">
              Nenhuma notificação do CMSP encontrada.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotificacoes.map((item) => (
                <div 
                  key={item.idNotificacaoUsuario}
                  onClick={() => setSelectedNotificacao(item)}
                  className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 transition-all flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                        {item.titulo}
                      </h3>
                      <span className="text-[10px] text-zinc-500 shrink-0">
                        {formatDate(item.dtInclusao)}
                      </span>
                    </div>

                    <div 
                      className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed"
                      dangerouslySetInnerHTML={{ 
                        __html: (item.mensagemCustomizavel || item.mensagem || item.subtitulo || 'Clique para ler o comunicado completo.').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Detalhes do Aviso */}
      {selectedAviso && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-[#27272a] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold">
                  Mural da Turma
                </span>
                <h2 className="text-base font-bold text-zinc-100 mt-1">{selectedAviso.titulo}</h2>
              </div>
              <button 
                onClick={() => setSelectedAviso(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-[#18181b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed max-h-80 overflow-y-auto bg-[#18181b] p-4 rounded-xl border border-[#27272a]">
              {selectedAviso.conteudo}
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-[#27272a]">
              <span>Por: <strong className="text-zinc-300">{selectedAviso.nomeUsuarioCadastro || 'Professor'}</strong></span>
              <span>Publicado em: {formatDate(selectedAviso.dataCadastro)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Detalhes da Notificação CMSP */}
      {selectedNotificacao && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-150">
            <div className="flex items-start justify-between gap-2 border-b border-[#27272a] pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                  <Award className="w-3 h-3" /> Comunicado CMSP
                </span>
                <h2 className="text-base font-bold text-zinc-100 mt-1">{selectedNotificacao.titulo}</h2>
              </div>
              <button 
                onClick={() => setSelectedNotificacao(null)}
                className="text-zinc-400 hover:text-zinc-200 p-1 rounded-lg hover:bg-[#18181b] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-zinc-200 leading-relaxed max-h-96 overflow-y-auto bg-[#18181b] p-4 rounded-xl border border-[#27272a] space-y-2 [&_a]:text-white [&_a]:underline [&_p]:mb-2">
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: (selectedNotificacao.mensagemCustomizavel || selectedNotificacao.mensagem || selectedNotificacao.subtitulo || 'Sem detalhes fornecidos.').replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') 
                }} 
              />
            </div>

            <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-[#27272a]">
              <span>Data de Envio: {formatDate(selectedNotificacao.dtInclusao)}</span>
              <button
                onClick={() => setSelectedNotificacao(null)}
                className="px-4 py-1.5 bg-white text-black font-bold rounded-xl text-xs cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
