import React, { useState } from 'react';
import { ChevronRight, Filter, GraduationCap, Sparkles, X, Wrench } from 'lucide-react';
import { UserData } from '../types';

interface PlataformasViewProps {
  userData?: UserData;
  onNavigate: (route: string) => void;
}

export interface PlatformItem {
  nome: string;
  slug: string;
  icon?: string;
  imageUrl?: string;
  desc: string;
  fundamental: boolean;
  medio: boolean;
  emDesenvolvimento?: boolean;
  emManutencao?: boolean;
}

export const PLATFORMS_LIST: PlatformItem[] = [
  {
    nome: 'TarefaSP',
    slug: 'tarefas',
    icon: '📝',
    desc: 'Tarefas e lições do dia no CMSP',
    fundamental: true,
    medio: true,
  },
  {
    nome: 'Redação SP',
    slug: 'redacoes',
    icon: '✍️',
    desc: 'Redações, IA e devolutivas pedagógicas',
    fundamental: true,
    medio: true,
  },
  {
    nome: 'LeiaSP & Árvore',
    slug: 'leiasp',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/RbJxeFVGxD8ioStvVh3UvdJEgMQZWI.png',
    desc: 'Leituras, e-books e acervo digital escolar',
    fundamental: true,
    medio: true,
  },
  {
    nome: 'Matific',
    slug: 'matific',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/VDJKB7A43QWgudrnkkxj81OZMa6SkG.jpg',
    desc: 'Matemática interativa e episódios para Fundamental (6º ao 9º)',
    fundamental: true,
    medio: false,
    emManutencao: true,
  },
  {
    nome: 'Khan Academy (Em Desenvolvimento)',
    slug: 'khan',
    icon: '📐',
    desc: 'Matemática e Ciências com aprendizado adaptativo',
    fundamental: false,
    medio: true,
    emDesenvolvimento: true,
  },
  {
    nome: 'Speak (Inglês) (Em Desenvolvimento)',
    slug: 'speak',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/mairaeliasman3315708-sp/3mzK7R96oE5dkUhd4TVA1l292CVDoL.png',
    desc: 'Conversação em inglês com assistente IA',
    fundamental: true,
    medio: true,
    emDesenvolvimento: true,
  },
  {
    nome: 'Alura',
    slug: 'alura',
    imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/Y6ZcJcrUQRv6ZeIN3uw3Bpb751VErX.png',
    desc: 'Programação e Pensamento Computacional',
    fundamental: true,
    medio: true,
  },
  {
    nome: 'AVA Expansão (Em Desenvolvimento)',
    slug: 'expansao',
    icon: '📺',
    desc: 'Aulas de expansão curricular e eletivas do Ensino Médio',
    fundamental: false,
    medio: true,
    emDesenvolvimento: true,
  },
  {
    nome: 'Educação Profissional (Em Desenvolvimento)',
    slug: 'educacaoprofissional',
    icon: '🎓',
    desc: 'Cursos técnicos integrados e qualificação profissional',
    fundamental: false,
    medio: true,
    emDesenvolvimento: true,
  },
  {
    nome: 'PreparaSP & SimulaSP (Em Desenvolvimento)',
    slug: 'preparasp',
    icon: '🎯',
    desc: 'Simulados e preparação para o ENEM e FUVEST',
    fundamental: false,
    medio: true,
    emDesenvolvimento: true,
  },
];

export function detectGradeLevel(serie?: string): 'fundamental' | 'medio' {
  if (!serie) return 'medio';
  const s = serie.toLowerCase();
  if (s.includes('6') || s.includes('7') || s.includes('8') || s.includes('9') || s.includes('fundamental')) {
    return 'fundamental';
  }
  return 'medio';
}

export const PlataformasView: React.FC<PlataformasViewProps> = ({ userData, onNavigate }) => {
  const detected = detectGradeLevel(userData?.serie);
  const [filter, setFilter] = useState<'auto' | 'fundamental' | 'medio' | 'all'>('auto');
  const [maintenancePlatform, setMaintenancePlatform] = useState<PlatformItem | null>(null);

  const activeLevel = filter === 'auto' ? detected : filter;

  const filteredPlataformas = PLATFORMS_LIST.filter((p) => {
    if (activeLevel === 'all') return true;
    if (activeLevel === 'fundamental') return p.fundamental;
    if (activeLevel === 'medio') return p.medio;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Plataformas Educacionais</h2>
            <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              {activeLevel === 'medio' ? 'Ensino Médio' : activeLevel === 'fundamental' ? 'Ensino Fundamental' : 'Todas'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Plataformas filtradas para a sua série ({userData?.serie || 'Detectada automaticamente'}).
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-[#121214] border border-[#27272a] p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setFilter('auto')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filter === 'auto'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Minha Série ({detected === 'medio' ? 'EM' : 'EF'})
          </button>
          <button
            onClick={() => setFilter('fundamental')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'fundamental'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Ensino Fundamental (6º-9º)
          </button>
          <button
            onClick={() => setFilter('medio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'medio'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Ensino Médio (1ª-3ª)
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              filter === 'all'
                ? 'bg-white text-black shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todas ({PLATFORMS_LIST.length})
          </button>
        </div>
      </div>

      {/* Grid of Platforms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlataformas.map((p) => (
          <div
            key={p.slug}
            onClick={() => {
              if (p.emManutencao) {
                setMaintenancePlatform(p);
              } else {
                onNavigate(p.slug);
              }
            }}
            className={`bg-[#121214] hover:bg-[#18181b] border ${
              p.emManutencao ? 'border-red-950 hover:border-red-900/50' : 'border-[#27272a] hover:border-zinc-600'
            } rounded-2xl p-5 transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden shadow-md`}
          >
            <div className="flex items-center gap-1.5 absolute top-3 right-3">
              {p.emManutencao && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center gap-1 animate-pulse">
                  <Wrench className="w-2.5 h-2.5" />
                  Em Manutenção
                </span>
              )}
              {p.emDesenvolvimento && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Em Desenvolvimento
                </span>
              )}
              {p.fundamental && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  EF
                </span>
              )}
              {p.medio && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  EM
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              <div className={`text-2xl p-2 bg-[#18181b] group-hover:bg-[#222226] rounded-2xl border ${
                p.emManutencao ? 'border-red-950/40' : 'border-[#27272a]'
              } transition-colors w-12 h-12 flex items-center justify-center shrink-0 overflow-hidden shadow-inner`}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.nome} className={`w-full h-full object-cover rounded-xl ${p.emManutencao ? 'opacity-40 grayscale' : ''}`} referrerPolicy="no-referrer" />
                ) : (
                  p.icon
                )}
              </div>
              <div className="pr-12">
                <div className={`text-sm font-bold transition-colors ${
                  p.emManutencao ? 'text-zinc-500 group-hover:text-red-400' : 'text-zinc-100 group-hover:text-emerald-400'
                }`}>
                  {p.nome}
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{p.desc}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#27272a]/60 text-xs">
              <span className={`text-[11px] font-medium flex items-center gap-1.5 ${
                p.emManutencao ? 'text-red-400/80' : 'text-emerald-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${p.emManutencao ? 'bg-red-500 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
                {p.emManutencao ? 'Em Manutenção' : `ShuziroAstral.lol/${p.slug}`}
              </span>
              <div className={`flex items-center gap-1 transition-colors font-medium text-[11px] ${
                p.emManutencao ? 'text-red-400/80 group-hover:text-red-400' : 'text-zinc-400 group-hover:text-white'
              }`}>
                {p.emManutencao ? 'Ver Detalhes' : 'Acessar Rota'} <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Maintenance Modal */}
      {maintenancePlatform && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#121214] border border-[#27272a] rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl">
                🛠️
              </div>
              <button
                onClick={() => setMaintenancePlatform(null)}
                className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-all cursor-pointer border border-[#27272a]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {maintenancePlatform.nome} em Manutenção <Wrench className="w-4 h-4 text-red-400" />
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Esta plataforma está passando por ajustes no nosso servidor e banco de dados para melhorar a automação e a sincronização com o SED.
              </p>
            </div>

            <div className="bg-[#18181b] border border-[#27272a] rounded-xl p-3.5 text-xs text-zinc-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>Previsão de retorno: Em breve nas próximas horas!</span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => setMaintenancePlatform(null)}
                className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-lg"
              >
                Entendido, obrigado!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
