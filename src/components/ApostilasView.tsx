import React from 'react';
import { BookOpen, Download } from 'lucide-react';

export const ApostilasView: React.FC = () => {
  const apostilas = [
    { ano: '6° Ano', vol: 'Volume 1 e 2', atualizado: '2026' },
    { ano: '7° Ano', vol: 'Volume 1 e 2', atualizado: '2026' },
    { ano: '8° Ano', vol: 'Volume 1 e 2', atualizado: '2026' },
    { ano: '9° Ano', vol: 'Volume 1 e 2', atualizado: '2026' },
    { ano: '1° Ensino Médio', vol: 'Volume único', atualizado: '2026' },
    { ano: '2° Ensino Médio', vol: 'Volume único', atualizado: '2026' },
    { ano: '3° Ensino Médio', vol: 'Volume único', atualizado: '2026' },
  ];

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Cadernos e Apostilas do Currículo Paulista
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {apostilas.map((a) => (
          <div
            key={a.ano}
            className="bg-[#121214] border border-[#27272a] rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                📘
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-200">{a.ano}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{a.vol} • Atualizado em {a.atualizado}</div>
              </div>
            </div>
            <button
              onClick={() => alert(`Baixando apostila do ${a.ano}...`)}
              className="px-3 py-2 bg-[#18181b] hover:bg-[#222226] text-zinc-200 text-xs font-medium rounded-xl border border-[#27272a] flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Baixar PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
