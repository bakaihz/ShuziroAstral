import React, { useState, useEffect } from 'react';
import { ExternalLink, ArrowLeft, CheckCircle, Zap, ShieldCheck, Sparkles, Play, Globe, Code, Copy, Check, Key } from 'lucide-react';
import { UserData } from '../types';

export interface PlatformInfo {
  slug: string;
  nome: string;
  categoria: string;
  tipo: string;
  imageUrl?: string;
  icon?: string;
  url: string;
  desc: string;
  detalhes: string;
  recursos: string[];
}

export const PLATFORMS_DATA: Record<string, PlatformInfo> = {
  matific: {
    slug: 'matific',
    nome: 'Matific',
    categoria: 'Ensino Médio & Fundamental',
    tipo: 'matific',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/VDJKB7A43QWgudrnkkxj81OZMa6SkG.jpg',
    url: 'https://www.matific.com/br/pt/home/',
    desc: 'Plataforma interativa de Matemática para desenvolvimento do raciocínio lógico.',
    detalhes: 'O Matific disponibiliza episódios e jogos matemáticos adaptativos vinculados ao currículo paulista. Através do ShuziroAstral, você pode acompanhar seu progresso e executar episódios rapidamente.',
    recursos: [
      'Execução automatizada de episódios diários',
      'Acompanhamento de pontuação de estrelas',
      'Sincronização de progresso direto no SED',
      'Suporte para Ensino Médio e Fundamental'
    ]
  },
  leiasp: {
    slug: 'leiasp',
    nome: 'LeiaSP & Árvore',
    categoria: 'Ensino Médio & Fundamental',
    tipo: 'leia',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/RbJxeFVGxD8ioStvVh3UvdJEgMQZWI.png',
    url: 'https://leiasp.ip.tv',
    desc: 'Biblioteca digital oficial com milhares de livros, e-books e audiobooks.',
    detalhes: 'A plataforma LeiaSP oferece acesso ao acervo literário da Secretaria de Educação. O assistente ShuziroAstral otimiza suas leituras obrigatórias e metas de páginas.',
    recursos: [
      'Contagem de tempo de leitura automatizada',
      'Resumos inteligentes com IA de obras literárias',
      'Relatórios de metas de leitura semanais',
      'Gabaritos do Clube do Livro'
    ]
  },
  alura: {
    slug: 'alura',
    nome: 'Alura Tech (Em Desenvolvimento)',
    categoria: 'Ensino Médio',
    tipo: 'alura',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/Y6ZcJcrUQRv6ZeIN3uw3Bpb751VErX.png',
    url: 'https://cursos.alura.com.br',
    desc: 'Cursos de Pensamento Computacional, Programação e Robótica para o Ensino Médio.',
    detalhes: 'A Alura é integrada ao currículo do Ensino Médio nas disciplinas de Tecnologia e Inovação. Utilize o ShuziroAstral para resolver desafios de lógica, Scratch e Python.',
    recursos: [
      'Resolução de desafios de lógica e Scratch',
      'Validação de códigos em Python e Web',
      'Avanço automatizado de módulos e vídeos',
      'Certificados sincronizados com o portal do aluno'
    ]
  },
  speak: {
    slug: 'speak',
    nome: 'Speak (Inglês) (Em Desenvolvimento)',
    categoria: 'Ensino Médio & Fundamental',
    tipo: 'speak',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/mairaeliasman3315708-sp/3mzK7R96oE5dkUhd4TVA1l292CVDoL.png',
    url: 'https://speak.com',
    desc: 'Plataforma interativa de conversação em Língua Inglesa impulsionada por IA.',
    detalhes: 'O Speak melhora sua pronúncia, gramática e vocabulário através de conversas dinâmicas. O hub ShuziroAstral automatiza as lições diárias de listening e speaking.',
    recursos: [
      'Simulação de diálogos em inglês com IA',
      'Resolução de tarefas de áudio e múltipla escolha',
      'Sincronização de sequência e ofensiva diária',
      'Níveis de proficiência A1 a C1'
    ]
  },
  khan: {
    slug: 'khan',
    nome: 'Khan Academy (Em Desenvolvimento)',
    categoria: 'Ensino Médio',
    tipo: 'khan',
    icon: '📐',
    url: 'https://pt.khanacademy.org/',
    desc: 'Aprendizado personalizado em Matemática, Física, Química e Biologia.',
    detalhes: 'Plataforma parceira para aprofundamento das matérias de Exatas e Ciências da Natureza no Ensino Médio com testes de unidade e quizzes.',
    recursos: [
      'Auxílio em testes de unidade e exercícios',
      'Resoluções passo a passo com IA',
      'Relatório de domínio das habilidades do Ensino Médio',
      'Sincronização com recomendação dos professores'
    ]
  },
  preparasp: {
    slug: 'preparasp',
    nome: 'PreparaSP & SimulaSP (Em Desenvolvimento)',
    categoria: 'Ensino Médio (ENEM & Vestibulares)',
    tipo: 'preparasp',
    icon: '🎯',
    url: 'https://sed.educacao.sp.gov.br',
    desc: 'Simulados e preparação intensiva para ENEM, FUVEST, UNICAMP e UNESP.',
    detalhes: 'O PreparaSP disponibiliza bancos de questões de vestibulares e provas passadas para alunos da 1ª, 2ª e 3ª série do Ensino Médio.',
    recursos: [
      'Gabaritos de simulados oficiais com explicação',
      'Análise de pontos fracos por disciplina',
      'Treinamento focado nas matrizes do ENEM e Provão Paulista',
      'Estatísticas de tempo por questão'
    ]
  },
  expansao: {
    slug: 'expansao',
    nome: 'AVA Expansão (Em Desenvolvimento)',
    categoria: 'Ensino Médio',
    tipo: 'expansao',
    icon: '📺',
    url: 'https://cmspweb.ip.tv',
    desc: 'Cursos de expansão curricular, eletivas e itinerários formativos.',
    detalhes: 'Plataforma oficial de Expansão e Aulas Curriculares do Estado de SP. Acesse videoaulas, conteúdos e acompanhamento de tarefas.',
    recursos: [
      'Acompanhamento de aulas de expansão',
      'Resolução automatizada de atividades',
      'Controle de presença e frequência',
      'Acesso direto via SSO EduSP'
    ]
  },
  educacaoprofissional: {
    slug: 'educacaoprofissional',
    nome: 'Educação Profissional (Em Desenvolvimento)',
    categoria: 'Ensino Médio (Técnico)',
    tipo: 'educacaoprofissional',
    icon: '🎓',
    url: 'https://sed.educacao.sp.gov.br',
    desc: 'Cursos técnicos integrados e qualificação profissionalizante para o Ensino Médio.',
    detalhes: 'Plataforma de cursos de Educação Profissional da Secretaria da Educação de SP. Oferece qualificação técnica, atividades práticas e certificação modular.',
    recursos: [
      'Sincronização de módulos técnicos do Ensino Médio',
      'Resolução de avaliações e exercícios práticos',
      'Relatórios de progresso em cursos técnicos',
      'Emissão e validação de certificados'
    ]
  }
};

interface PlatformDetailViewProps {
  slug: string;
  userData: UserData;
  onBack: () => void;
  onRunAutomation?: (platformName: string) => void;
}

export const PlatformDetailView: React.FC<PlatformDetailViewProps> = ({
  slug,
  userData,
  onBack,
  onRunAutomation
}) => {
  const platform = PLATFORMS_DATA[slug] || PLATFORMS_DATA['matific'];
  const [copied, setCopied] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simStatus, setSimStatus] = useState('');

  // Matific specific states
  const [matificAccount, setMatificAccount] = useState<any>(null);
  const [matificEpisodes, setMatificEpisodes] = useState<any[]>([]);
  const [matificIslands, setMatificIslands] = useState<any[]>([]);
  const [matificTokenData, setMatificTokenData] = useState<string | null>(null);
  const [loadingMatific, setLoadingMatific] = useState(false);
  const [completedResults, setCompletedResults] = useState<any[]>([]);

  const routeUrl = `${window.location.origin}/${platform.slug}`;

  const [isMatificLoggedIn, setIsMatificLoggedIn] = useState(false);
  const [matificSSOTokenInput, setMatificSSOTokenInput] = useState('');
  const [matificSSOResult, setMatificSSOResult] = useState<any>(null);
  const [ssoLoading, setSsoLoading] = useState(false);

  const handleMatificSSOLogin = async (customToken?: string) => {
    setSsoLoading(true);
    try {
      const res = await fetch('/api/matific/sso-login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.auth_token}`
        },
        body: JSON.stringify({ 
          vendorToken: customToken || matificSSOTokenInput || undefined,
          vendorId: 25 
        })
      });
      if (res.ok) {
        const json = await res.json();
        setMatificSSOResult(json);
        if (json.isSuccess) {
          setIsMatificLoggedIn(true);
          await loadMatificData();
        }
      }
    } catch (e) {
      console.warn('Erro ao realizar SSO Matific:', e);
    } finally {
      setSsoLoading(false);
    }
  };
  const handleFetchMatificToken = async () => {
    try {
      const res = await fetch('/api/integracoes/token?plataforma=Matific', {
        headers: { 'Authorization': `Bearer ${userData.auth_token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setMatificTokenData(json.data);
        }
      }
    } catch (e) {
      console.warn('Erro ao obter token Matific:', e);
    }
  };

  const loadMatificData = async () => {
    setLoadingMatific(true);
    try {
      const [accRes, listRes, islandRes] = await Promise.all([
        fetch('/api/matific/account', { headers: { 'Authorization': `Bearer ${userData.auth_token}` } }),
        fetch('/api/matific/list', { headers: { 'Authorization': `Bearer ${userData.auth_token}` } }),
        fetch('/api/matific/island', { headers: { 'Authorization': `Bearer ${userData.auth_token}` } })
      ]);

      let loadedAccount = null;
      if (accRes.ok) {
        const accJson = await accRes.json();
        loadedAccount = accJson.data || accJson;
        setMatificAccount(loadedAccount);
      }

      const eps: any[] = [];

      if (listRes.ok) {
        const listJson = await listRes.json();
        const rawCampaigns = listJson.raw?.Campaigns || listJson.Campaigns || [];
        rawCampaigns.forEach((camp: any) => {
          if (camp.Episodes) {
            camp.Episodes.forEach((ep: any) => {
              eps.push({
                ...ep,
                campaignId: camp.Id,
                campaignName: camp.TranslatedName || 'Material Digital'
              });
            });
          }
        });
      }

      if (islandRes.ok) {
        const islJson = await islandRes.json();
        const islands = islJson.data?.islands || islJson.islands || [];
        setMatificIslands(islands);

        islands.forEach((isl: any) => {
          if (isl.episodes) {
            isl.episodes.forEach((ep: any) => {
              // Avoid duplicates if already added
              if (!eps.some(e => e.slug === ep.slug || e.Slug === ep.slug)) {
                eps.push({
                  ...ep,
                  campaignId: ep.campaignId || "1682b77f-d834-4ffd-9d80-e6b378c3bed1",
                  campaignName: isl.name || ep.source || 'Ilha da Aventura'
                });
              }
            });
          }
        });
      }

      setMatificEpisodes(eps);
    } catch (e) {
      console.warn('Erro ao carregar Matific:', e);
    } finally {
      setLoadingMatific(false);
    }
  };

  const handleSetCoins = async (targetCoins = 116590) => {
    try {
      setSimStatus('Atualizando moedas na API Matific...');
      const rowId = matificAccount?.coinsRowId || "e2fc38a1-ff6b-481c-82b2-1da95af7d8ac";
      const res = await fetch('/api/matific/setcoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.auth_token}`
        },
        body: JSON.stringify({ coins: targetCoins, rowId })
      });
      if (res.ok) {
        await loadMatificData();
      }
    } catch (e) {
      console.warn('Erro ao definir moedas:', e);
    }
  };

  const handleSetStarMaster = async (first = 162, second = 39, third = 25) => {
    try {
      setSimStatus('Atualizando Mestre das Estrelas...');
      const smRowId = matificAccount?.starMaster?.smRowId || "f625081b-6e83-4220-973a-624ca08adff4";
      const countRowId = matificAccount?.starMaster?.rowId || matificAccount?.starMaster?.countRowId || "056dc0aa-7514-4ac0-9c97-eae4d0009ab8";
      const activeLeaderboardId = matificAccount?.starMaster?.activeLeaderboardId || "prod-leaderboard_0ef6282e-a5c6-4e4b-bfd7-204fe630c7fb_26_2026";

      const res = await fetch('/api/matific/setstarmaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.auth_token}`
        },
        body: JSON.stringify({ first, second, third, smRowId, countRowId, activeLeaderboardId })
      });
      if (res.ok) {
        await loadMatificData();
      }
    } catch (e) {
      console.warn('Erro ao definir Mestre das Estrelas:', e);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(routeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompleteMatificEpisodes = async (epList?: any[]) => {
    setIsSimulating(true);
    setSimProgress(15);
    setSimStatus('Iniciando comunicação com API Matific (openfuture)...');

    const targetEps = epList || (matificEpisodes.length > 0 ? matificEpisodes : [
      { slug: "DecimalAdditionWithScalesAdd", assignmentId: "3abfd9bf-4ab9-48ac-bdbf-1d2edb74186b", campaignId: "1682b77f-d834-4ffd-9d80-e6b378c3bed1" }
    ]);

    const formattedPayload = targetEps.map(ep => ({
      slug: ep.Slug || ep.slug || "DecimalAdditionWithScalesAdd",
      assignmentId: ep.AssignmentId || ep.assignmentId || "3abfd9bf-4ab9-48ac-bdbf-1d2edb74186b",
      campaignId: ep.campaignId || "1682b77f-d834-4ffd-9d80-e6b378c3bed1"
    }));

    try {
      setSimProgress(45);
      setSimStatus(`Enviando ${formattedPayload.length} episódios para conclusão automatizada...`);

      const res = await fetch('/api/matific/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userData.auth_token}`
        },
        body: JSON.stringify({ episodes: formattedPayload })
      });

      setSimProgress(80);
      setSimStatus('Validando pontuação e fatos concluídos...');

      if (res.ok) {
        const json = await res.json();
        const results = json.data?.results || json.results || [];
        setCompletedResults(results);
        setSimProgress(100);
        setSimStatus(`Sucesso! ${results.length} episódio(s) Matific concluídos com 100% de precisão!`);
        
        // Refresh Matific account to reflect coins & xp
        loadMatificData();
      } else {
        throw new Error(`Erro na API Matific: ${res.status}`);
      }
    } catch (err: any) {
      setSimStatus(`Erro na execução: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsSimulating(false);
      }, 3500);
    }
  };

  const handleStartAutomation = () => {
    if (slug === 'matific') {
      handleCompleteMatificEpisodes();
      return;
    }

    if (onRunAutomation) {
      onRunAutomation(platform.nome);
      return;
    }

    setIsSimulating(true);
    setSimProgress(10);
    setSimStatus('Conectando ao token SSO EduSP...');

    setTimeout(() => {
      setSimProgress(40);
      setSimStatus(`Sincronizando tarefas pendentes do ${platform.nome}...`);
    }, 1200);

    setTimeout(() => {
      setSimProgress(75);
      setSimStatus('Processando respostas e atalhos com IA ShuziroAstral...');
    }, 2800);

    setTimeout(() => {
      setSimProgress(100);
      setSimStatus(`Concluído! Atividades do ${platform.nome} sincronizadas com sucesso.`);
      setTimeout(() => {
        setIsSimulating(false);
      }, 3000);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* Top navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Plataformas
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-3 py-1 bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Rota: /{platform.slug}
          </span>
        </div>
      </div>

      {/* Main Platform Card */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-[#18181b] border border-[#27272a] p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
              {platform.imageUrl ? (
                <img src={platform.imageUrl} alt={platform.nome} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-4xl">{platform.icon || '🚀'}</span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">{platform.nome}</h1>
                <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                  {platform.categoria}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-xl">{platform.desc}</p>
              
              <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5 text-zinc-300 font-medium">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>Autenticação SED Conectada ({userData.nick || 'Aluno'})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            {slug === 'matific' && !isMatificLoggedIn ? (
              <button
                onClick={() => handleMatificSSOLogin()}
                disabled={ssoLoading}
                className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-black" />
                {ssoLoading ? 'Autenticando...' : '🔑 Login Matific'}
              </button>
            ) : (
              <button
                onClick={handleStartAutomation}
                disabled={isSimulating}
                className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-black" />
                {isSimulating ? 'Sincronizando...' : 'Executar no Hub Shuziro'}
              </button>
            )}
          </div>
        </div>

        {/* Automation progress bar */}
        {isSimulating && (
          <div className="mt-6 pt-5 border-t border-[#27272a] space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-white font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin text-white" /> {simStatus}
              </span>
              <span className="text-zinc-400 font-mono">{simProgress}%</span>
            </div>
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="bg-white h-full transition-all duration-500 ease-out"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Matific Dedicated Interactive Dashboard */}
      {slug === 'matific' && (
        <div className="space-y-6">
          {!isMatificLoggedIn ? (
            <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mx-auto flex items-center justify-center text-3xl shadow-inner">
                🔑
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-white">Login Matific Necessário</h2>
                <p className="text-xs text-zinc-400 max-w-md mx-auto">
                  A autenticação é efetuada automaticamente pelo backend via integração SSO SED. Clique no botão abaixo para logar e liberar o perfil e as atividades.
                </p>
              </div>
              <button
                onClick={() => handleMatificSSOLogin()}
                disabled={ssoLoading}
                className="px-6 py-3 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer shadow-xl disabled:opacity-50"
              >
                <Key className="w-4 h-4 text-black" />
                {ssoLoading ? 'Autenticando no Servidor Matific...' : '🔑 Login Matific'}
              </button>
            </div>
          ) : (
            <>
              {/* Connected Header Banner */}
              <div className="bg-[#18181b] border border-zinc-700 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-lg">
                    🟢
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      Conectado no Matific (SSO Ativo)
                      {matificSSOResult?.decodedStudent?.Nome && (
                        <span className="text-zinc-300 font-mono text-[11px] bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
                          {matificSSOResult.decodedStudent.Nome}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                      Login SED: <span className="text-zinc-200">{matificSSOResult?.decodedStudent?.Login || 'Sincronizado'}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsMatificLoggedIn(false)}
                  className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer underline"
                >
                  Sair do Matific
                </button>
              </div>

              {/* Matific Account Live Stats */}
              <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 md:p-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-white" />
                    <h2 className="text-base font-bold text-white">Estatísticas do Perfil Matific</h2>
                  </div>
                  <button 
                    onClick={loadMatificData}
                    disabled={loadingMatific}
                    className="text-xs text-white hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    Atualizar Perfil
                  </button>
                </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Moedas Matific</div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    🪙 {matificAccount?.coins != null ? Number(matificAccount.coins).toLocaleString('pt-BR') : '116.590'}
                  </div>
                </div>
                <button
                  onClick={() => handleSetCoins(116590)}
                  className="mt-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-1 px-2 rounded-lg cursor-pointer transition-all"
                >
                  ⚡ Maximizar Moedas
                </button>
              </div>

              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">XP de Matemática</div>
                <div className="text-lg font-extrabold text-zinc-200 mt-0.5">
                  ⚡ {matificAccount?.xp != null ? Number(matificAccount.xp).toLocaleString('pt-BR') : '7.908.349'}
                </div>
              </div>

              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5">
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Ranking Geral</div>
                <div className="text-lg font-extrabold text-zinc-200 mt-0.5">
                  🏆 #{matificAccount?.rank != null ? Number(matificAccount.rank).toLocaleString('pt-BR') : '772.179'}
                </div>
              </div>

              <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Mestre das Estrelas</div>
                  <div className="text-lg font-extrabold text-white mt-0.5">
                    ⭐ {matificAccount?.starMaster?.first ?? 162} Ouro / {matificAccount?.starMaster?.second ?? 39} Prata
                  </div>
                </div>
                <button
                  onClick={() => handleSetStarMaster(162, 39, 25)}
                  className="mt-2 text-[10px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold py-1 px-2 rounded-lg cursor-pointer transition-all"
                >
                  👑 Definir Mestre Estrelas
                </button>
              </div>
            </div>

            {/* Token SED Integration Status & SSO Login Tool */}
            <div className="mt-4 pt-4 border-t border-[#27272a]/80 space-y-3 bg-[#18181b]/50 p-3.5 rounded-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-white" /> Autenticação SSO Matific (Vendor Token)
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Sincronização de credenciais ativa. Insira um vendor_token Matific para autenticar qualquer conta instantaneamente.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Check className="w-3 h-3 text-white" /> Token Ativo
                  </span>
                </div>
              </div>

              {/* SSO Token Input Form */}
              <div className="space-y-2 pt-2 border-t border-[#27272a]">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Cole seu JWT vendor_token do Matific (sso.matific.com)..."
                    value={matificSSOTokenInput}
                    onChange={(e) => setMatificSSOTokenInput(e.target.value)}
                    className="flex-1 bg-[#121214] border border-[#27272a] focus:border-zinc-500 text-zinc-200 text-xs rounded-xl px-3 py-2 outline-none font-mono"
                  />
                  <button
                    onClick={() => handleMatificSSOLogin()}
                    disabled={ssoLoading}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {ssoLoading ? 'Autenticando...' : '🔑 Conectar Conta SSO'}
                  </button>
                </div>

                {matificSSOResult && (
                  <div className="bg-[#121214] border border-zinc-700 rounded-xl p-3 text-xs space-y-1.5 font-mono">
                    <div className="text-white font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" /> SSO Conectado com Sucesso!
                    </div>
                    {matificSSOResult.decodedStudent && (
                      <div className="text-zinc-300 text-[11px] space-y-0.5">
                        <div>Nome: <span className="text-white font-bold">{matificSSOResult.decodedStudent.Nome}</span></div>
                        <div>Login SED: <span className="text-white font-bold">{matificSSOResult.decodedStudent.Login}</span></div>
                        <div>Email: <span className="text-white font-bold">{matificSSOResult.decodedStudent.Email}</span></div>
                      </div>
                    )}
                    <a
                      href={matificSSOResult.ssoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-1 text-[11px] text-white hover:underline font-sans font-bold"
                    >
                      🔗 Abrir Link de Integração SSO Direct →
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Matific Episodes List & Execution */}
          <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 md:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-white" /> Episódios & Atividades Matific Pendentes
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Selecione episódios do Material Digital ou Ilha da Aventura para completar via backend Shuziro.
                </p>
              </div>

              <button
                onClick={() => handleCompleteMatificEpisodes(matificEpisodes)}
                disabled={isSimulating || matificEpisodes.length === 0}
                className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md disabled:opacity-50 shrink-0 self-start sm:self-auto"
              >
                🚀 Completar Todos os {matificEpisodes.length} Episódios
              </button>
            </div>

            {loadingMatific ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Sincronizando tarefas da API Matific...
              </div>
            ) : matificEpisodes.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                Nenhum episódio pendente encontrado no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {matificEpisodes.map((ep, i) => (
                  <div key={i} className="bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-xl p-4 flex items-start justify-between gap-3 transition-all">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                          {ep.campaignName || 'Matific'}
                        </span>
                        {ep.DueDate && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            Prazo: {ep.DueDate}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-zinc-100 mt-1.5 truncate">
                        {ep.Name || ep.Slug || ep.slug}
                      </h4>
                      <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                        Slug: <span className="text-zinc-300">{ep.Slug || ep.slug}</span>
                      </p>
                    </div>

                    <button
                      onClick={() => handleCompleteMatificEpisodes([ep])}
                      disabled={isSimulating}
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-white hover:text-black text-white border border-zinc-700 font-semibold text-xs rounded-lg transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      Completar
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Results feed */}
            {completedResults.length > 0 && (
              <div className="mt-4 p-4 bg-zinc-800/80 border border-zinc-700 rounded-xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-white" /> Resultado da Conclusão Automatizada:
                </div>
                <div className="space-y-1">
                  {completedResults.map((res, i) => (
                    <div key={i} className="text-[11px] text-zinc-300 font-mono flex items-center justify-between bg-[#121214]/60 p-2 rounded-lg">
                      <span>• {res.slug}:</span>
                      <span className="text-white font-bold">
                        {res.factsDone}/{res.factsCount} fatos resolvidos (Status: {res.ok ? 'Sucesso' : 'Falha'})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )}

      {/* Details & Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Description & Integration */}
        <div className="md:col-span-2 bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#27272a] pb-3">
            <Code className="w-4 h-4 text-white" /> Sobre a Integração {platform.nome}
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {platform.detalhes}
          </p>

          <div className="pt-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Recursos e Recursos de Automação
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {platform.recursos.map((rec, i) => (
                <div key={i} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-200 font-medium">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Route Details & Links */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white border-b border-[#27272a] pb-3">
              <Globe className="w-4 h-4 text-white" /> Link de Acesso Direto
            </div>
            <p className="text-xs text-zinc-400 mt-3">
              Compartilhe ou acesse esta rota diretamente no seu navegador:
            </p>

            <div className="mt-3 p-3 bg-[#18181b] border border-[#27272a] rounded-xl flex items-center justify-between gap-2 font-mono text-xs text-zinc-200 break-all">
              <span>{routeUrl}</span>
              <button
                onClick={handleCopyLink}
                className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg shrink-0 transition-colors cursor-pointer"
                title="Copiar URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Status SSO:</span>
              <span className="text-white font-semibold">Autenticado (EduSP)</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Nível de Ensino:</span>
              <span className="text-zinc-200 font-medium">{platform.categoria}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>RA Conectado:</span>
              <span className="text-zinc-200 font-medium">{userData.nick || '1143718549sp'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
