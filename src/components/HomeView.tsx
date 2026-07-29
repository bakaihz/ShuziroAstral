import React from 'react';
import { Heart, ChevronRight, Sparkles, MessageSquare, ExternalLink } from 'lucide-react';
import { UserData } from '../types';
import { PLATFORMS_LIST, detectGradeLevel } from './PlataformasView';

interface HomeViewProps {
  userData?: UserData;
  onNavigate: (page: string) => void;
  taskCount: number;
  essayCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ userData, onNavigate, taskCount, essayCount }) => {
  const level = detectGradeLevel(userData?.serie);

  const activePlatforms = PLATFORMS_LIST.filter((p) => {
    if (level === 'fundamental') return p.fundamental;
    return p.medio;
  });

  const apostilas = level === 'fundamental' 
    ? ['6° Ano', '7° Ano', '8° Ano', '9° Ano']
    : ['1° EM', '2° EM', '3° EM'];

  return (
    <div className="space-y-6">
      {/* Featured Header Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#27272a] shadow-2xl bg-[#121214] group">
        <a href="https://ibb.co/FLPNwdbL" target="_blank" rel="noreferrer" className="block relative h-52 sm:h-64 w-full overflow-hidden">
          <img
            src="https://i.ibb.co/FLPNwdbL/1784647906279.png"
            alt="ShuziroAstral Official Banner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </a>

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-auto">
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-white" /> ShuziroAstral Hub 2026
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-white">Comunidade & Automações Escolares</h1>
          </div>

          <a
            href="https://discord.gg/eKwvNFY8v"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 fill-black" />
            Entrar no Discord
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </div>

      {/* Discord Promo Card with Second Image */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden shadow-xl">
        <div className="flex items-center gap-4">
          <a
            href="https://ibb.co/1GkZrxMn"
            target="_blank"
            rel="noreferrer"
            className="w-16 h-16 rounded-2xl bg-[#18181b] border border-zinc-700 p-1 shrink-0 overflow-hidden shadow-inner hover:scale-105 transition-transform"
          >
            <img
              src="https://i.ibb.co/1GkZrxMn/1784648026795.png"
              alt="Shuziro Community Logo"
              className="w-full h-full object-cover rounded-xl"
              referrerPolicy="no-referrer"
            />
          </a>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Servidor Oficial do Discord</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                discord.gg/eKwvNFY8v
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1 max-w-lg">
              Tire dúvidas sobre matérias, receba avisos de novos scripts e interaja com milhares de estudantes de SP!
            </p>
          </div>
        </div>

        <a
          href="https://discord.gg/eKwvNFY8v"
          target="_blank"
          rel="noreferrer"
          className="w-full md:w-auto px-5 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4 fill-white" />
          Acessar Servidor Discord
        </a>
      </div>

      {/* Donation Banner */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-white/20 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-200">Ajude a manter o projeto no ar</div>
            <div className="text-xs text-zinc-400">Sua doação apoia a manutenção dos servidores e atualizações.</div>
          </div>
        </div>
        <a
          href="https://pixgg.com/Bakai"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition-all shadow-md"
        >
          Doar via Pix
        </a>
      </div>

      {/* Quick summary stats */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => onNavigate('tarefas')}
          className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs text-zinc-400">Tarefas Pendentes</div>
            <div className="text-xl font-bold text-white mt-1">{taskCount} tarefas</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-lg">
            📝
          </div>
        </div>

        <div
          onClick={() => onNavigate('redacoes')}
          className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group"
        >
          <div>
            <div className="text-xs text-zinc-400">Redações Pendentes</div>
            <div className="text-xl font-bold text-white mt-1">{essayCount} redações</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center text-lg">
            ✍️
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Plataformas Recomendadas ({level === 'medio' ? 'Ensino Médio' : 'Ensino Fundamental'})
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              Série: {userData?.serie || 'Ativa'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('plataformas')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Ver todas <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {activePlatforms.map((p) => (
            <div
              key={p.slug}
              onClick={() => onNavigate(p.slug)}
              className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {p.emDesenvolvimento && (
                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    Em Dev
                  </span>
                )}
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {level === 'medio' ? 'EM' : 'EF'}
                </span>
              </div>

              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  p.icon
                )}
              </div>
              <div className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">{p.nome}</div>
              <div className="text-xs text-zinc-500 mt-0.5 line-clamp-1">{p.desc}</div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Rota /{p.slug}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Apostilas e Cadernos Recomendados ({level === 'medio' ? 'Ensino Médio' : 'Fundamental'})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {apostilas.map((a) => (
            <div
              key={a}
              onClick={() => onNavigate('apostilas')}
              className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all group"
            >
              <div className="text-xl mb-2 text-emerald-400">📘</div>
              <div className="text-sm font-semibold text-zinc-200">{a}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Caderno SP</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
