import React from 'react';
import { Smartphone, ExternalLink } from 'lucide-react';

export const PlataformasView: React.FC = () => {
  const plataformas = [
    { nome: 'TarefaSP', tipo: 'tarefas', icon: '📝', url: 'https://tarefasp.ip.tv' },
    { nome: 'LeiaSP', tipo: 'leia', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/RbJxeFVGxD8ioStvVh3UvdJEgMQZWI.png', url: 'https://leiasp.ip.tv' },
    { nome: 'Matific', tipo: 'matific', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/VDJKB7A43QWgudrnkkxj81OZMa6SkG.jpg', url: 'https://www.matific.com/br/pt/home/' },
    { nome: 'Redação SP', tipo: 'redacoes', icon: '✍️', url: 'https://redacaosp.ip.tv' },
    { nome: 'Alura', tipo: 'alura', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/julianasanche3225895-sp/Y6ZcJcrUQRv6ZeIN3uw3Bpb751VErX.png', url: 'https://cursos.alura.com.br' },
    { nome: 'Speak', tipo: 'speak', imageUrl: 'https://s3.sa-east-1.amazonaws.com/edusp-static.ip.tv/room/cards/edusp/mairaeliasman3315708-sp/3mzK7R96oE5dkUhd4TVA1l292CVDoL.png', url: 'https://speak.com' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Todas as Plataformas Oficiais
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plataformas.map((p) => (
          <a
            key={p.nome}
            href={p.url}
            target="_blank"
            rel="noreferrer"
            className="bg-[#121214] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-700 rounded-2xl p-5 transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl p-2 bg-[#18181b] group-hover:bg-[#222226] rounded-2xl border border-[#27272a] transition-colors w-12 h-12 flex items-center justify-center overflow-hidden">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.nome} className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                ) : (
                  p.icon
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200">{p.nome}</div>
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Conectado
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-zinc-200 transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
};
