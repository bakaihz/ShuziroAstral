import React from 'react';
import { motion } from 'motion/react';
import { Heart, ChevronRight, Sparkles, MessageSquare, ExternalLink, ArrowRight, BookOpen, CheckCircle, FileText, Flame } from 'lucide-react';
import { UserData } from '../types';
import { PLATFORMS_LIST, detectGradeLevel } from './PlataformasView';
const eyeLogoImg = 'https://i.ibb.co/zTCgk7Mk/8860a99d3dc1ae4311adacbc72ed147a.jpg';

interface HomeViewProps {
  userData?: UserData;
  onNavigate: (page: string) => void;
  taskCount: number;
  essayCount: number;
}

// Crisp Discord Icon
const DiscordLogo = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const HomeView: React.FC<HomeViewProps> = ({ userData, onNavigate, taskCount, essayCount }) => {
  const level = detectGradeLevel(userData?.serie);

  const activePlatforms = PLATFORMS_LIST.filter((p) => {
    if (level === 'fundamental') return p.fundamental;
    return p.medio;
  });

  const apostilas = level === 'fundamental' 
    ? ['6° Ano', '7° Ano', '8° Ano', '9° Ano']
    : ['1° EM', '2° EM', '3° EM'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Discord Promo Card (Single official banner) */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl overflow-hidden shadow-xl transition-all group"
      >
        <div className="relative h-32 sm:h-36 w-full bg-zinc-900 overflow-hidden border-b border-[#27272a]">
          <a href="https://ibb.co/mFqknYfp" target="_blank" rel="noreferrer">
            <img
              src="https://i.ibb.co/6JPzKpjQ/1786808465101.png"
              alt="ShuziroAstral Discord Banner"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </a>
          <div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-transparent to-transparent pointer-events-none" />
        </div>

        <div className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-zinc-700 p-0.5 shrink-0 overflow-hidden shadow-lg">
              <img
                src={eyeLogoImg}
                alt="Shuziro Astral Community Logo"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">Servidor Oficial do Discord</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-mono font-bold border border-zinc-700">
                  discord.gg/VdnsPj8sA
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 max-w-lg">
                Tire dúvidas sobre matérias, receba avisos de novos scripts e interaja com milhares de estudantes de SP!
              </p>
            </div>
          </div>

          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://discord.gg/VdnsPj8sA"
            target="_blank"
            rel="noreferrer"
            className="w-full md:w-auto px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg"
          >
            <DiscordLogo className="w-4 h-4 text-black" />
            Acessar Servidor Discord
          </motion.a>
        </div>
      </motion.div>

      {/* Donation Banner */}
      <motion.div 
        variants={itemVariants}
        className="bg-[#121214] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-white">
            <Heart className="w-5 h-5 fill-red-500 text-red-500 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Ajude a manter o projeto no ar</div>
            <div className="text-xs text-zinc-400">Sua doação apoia a infraestrutura de servidores e desenvolvimento contínuo.</div>
          </div>
        </div>
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://pixgg.com/Bakai"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-extrabold text-xs rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all shadow-md flex items-center gap-2"
        >
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Doar via Pix
        </motion.a>
      </motion.div>

      {/* Quick summary stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('tarefas')}
          className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group shadow-lg"
        >
          <div>
            <div className="text-xs text-zinc-400 font-medium">Tarefas Pendentes</div>
            <div className="text-xl font-black text-white mt-1">{taskCount} tarefas</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shadow-inner">
            <img 
              src="https://static.vecteezy.com/ti/vetor-gratis/p1/26587905-cuidadosamente-projetado-lista-de-controle-icone-representa-uma-lista-do-tarefas-ou-itens-para-estar-concluido-frequentemente-usava-dentro-produtividade-e-organizacao-apps-vetor.jpg" 
              alt="Tarefas SP" 
              className="w-full h-full object-cover rounded-lg" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('redacoes')}
          className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-4 cursor-pointer transition-all flex items-center justify-between group shadow-lg"
        >
          <div>
            <div className="text-xs text-zinc-400 font-medium">Redações Pendentes</div>
            <div className="text-xl font-black text-white mt-1">{essayCount} redações</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 text-white flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform shadow-inner">
            <img 
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQroFJxwJ0-n17TqNJJb0-qCsFoHNixRNwIXdaD4VNDBg&s=10" 
              alt="Redação SP" 
              className="w-full h-full object-cover rounded-lg" 
              referrerPolicy="no-referrer" 
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Platforms Grid */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">
              Plataformas Recomendadas ({level === 'medio' ? 'Ensino Médio' : 'Ensino Fundamental'})
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono font-bold">
              {userData?.serie || 'Ativa'}
            </span>
          </div>
          <button
            onClick={() => onNavigate('plataformas')}
            className="text-xs text-zinc-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer font-bold"
          >
            Ver todas <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {activePlatforms.map((p) => (
            <motion.div
              key={p.slug}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(p.slug)}
              className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-4 cursor-pointer transition-all group relative overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div className="absolute top-2 right-2 flex items-center gap-1">
                {p.emManutencao && (
                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400">
                    Manutenção
                  </span>
                )}
                {p.emDesenvolvimento && (
                  <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                    Dev
                  </span>
                )}
                <span className="text-[8px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-700 text-zinc-300">
                  {level === 'medio' ? 'EM' : 'EF'}
                </span>
              </div>

              <div>
                <div className="text-2xl mb-2.5 group-hover:scale-105 transition-transform w-11 h-11 flex items-center justify-center overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b] shadow-inner">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    p.icon
                  )}
                </div>
                <div className="text-sm font-bold text-white group-hover:text-zinc-200 transition-colors flex items-center justify-between">
                  <span>{p.nome}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-1">{p.desc}</div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> ShuziroAstral.lol/{p.slug}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cadernos / Apostilas */}
      <motion.div variants={itemVariants}>
        <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 font-mono">
          Apostilas e Cadernos Recomendados ({level === 'medio' ? 'Ensino Médio' : 'Fundamental'})
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {apostilas.map((a) => (
            <motion.div
              key={a}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('apostilas')}
              className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-4 cursor-pointer transition-all group shadow-md"
            >
              <div className="text-xl mb-2 text-white group-hover:scale-110 transition-transform">📘</div>
              <div className="text-sm font-bold text-zinc-200">{a}</div>
              <div className="text-[11px] text-zinc-400 mt-0.5">Caderno SP Oficial</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

