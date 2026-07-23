import React from 'react';
import { BookOpen, Smartphone, FileText, CheckCircle2, Award, Heart } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (page: string) => void;
  taskCount: number;
  essayCount: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, taskCount, essayCount }) => {
  const plataformas = [
    { nome: 'TarefaSP', tipo: 'tarefas', icon: '📝', desc: 'Tarefas escolares' },
    { nome: 'LeiaSP', tipo: 'leia', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/RbJxeFVGxD8ioStvVh3UvdJEgMQZWI.png', desc: 'Leituras e e-books' },
    { nome: 'Matific', tipo: 'matific', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/VDJKB7A43QWgudrnkkxj81OZMa6SkG.jpg', desc: 'Matemática interativa' },
    { nome: 'Redação', tipo: 'redacoes', icon: '✍️', desc: 'Redações e IA' },
    { nome: 'Alura', tipo: 'alura', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/Y6ZcJcrUQRv6ZeIN3uw3Bpb751VErX.png', desc: 'Cursos de tecnologia' },
    { nome: 'Speak', tipo: 'speak', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/mairaeliasman3315708-sp/3mzK7R96oE5dkUhd4TVA1l292CVDoL.png', desc: 'Idiomas e inglês' },
  ];

  const apostilas = ['6° Ano', '7° Ano', '8° Ano', '9° Ano', '1° EM', '2° EM', '3° EM'];

  return (
    <div className="space-y-6">
      {/* Donation Banner */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-[#18181b] to-[#121214] border border-emerald-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Heart className="w-5 h-5 fill-emerald-400/20" />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-200">Ajude a manter o projeto no ar</div>
            <div className="text-xs text-zinc-400">Sua doação apoia a manutenção dos túneis e atualizações.</div>
          </div>
        </div>
        <a
          href="https://pixgg.com/Bakai"
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/20"
        >
          Doar via Pix
        </a>
      </div>

      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Plataformas Educacionais
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {plataformas.map((p) => (
            <div
              key={p.nome}
              onClick={() => onNavigate(p.tipo === 'tarefas' ? 'tarefas' : p.tipo === 'redacoes' ? 'redacoes' : 'plataformas')}
              className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-4 cursor-pointer transition-all group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform w-10 h-10 flex items-center justify-center overflow-hidden rounded-xl border border-[#27272a] bg-[#18181b]">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.nome} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  p.icon
                )}
              </div>
              <div className="text-sm font-semibold text-zinc-200">{p.nome}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{p.desc}</div>
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Ativo
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          Apostilas e Cadernos
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
