import React, { useState } from 'react';
import { BookOpen, Download, ExternalLink, Search, FileText, Sparkles, Filter, Eye } from 'lucide-react';

interface ApostilaItem {
  id: string;
  ano: string;
  nivel: 'Fundamental' | 'Médio';
  bimestre: number;
  titulo: string;
  disciplinas: string;
  tipo: 'Aluno' | 'Professor' | 'Geral';
  linkUrl: string;
  atualizado: string;
}

export const ApostilasView: React.FC = () => {
  const [selectedBimestre, setSelectedBimestre] = useState<number>(3); // Default 3º Bimestre
  const [selectedNivel, setSelectedNivel] = useState<'Todos' | 'Fundamental' | 'Médio'>('Todos');
  const [searchFilter, setSearchFilter] = useState('');
  const [activePdfModal, setActivePdfModal] = useState<ApostilaItem | null>(null);

  const apostilas: ApostilaItem[] = [
    // 1º BIMESTRE
    { id: '1b-6f', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 1, titulo: 'Apostila 1º Bimestre - 6º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/6ano-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-7f', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 1, titulo: 'Apostila 1º Bimestre - 7º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/7ano-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-8f', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 1, titulo: 'Apostila 1º Bimestre - 8º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/8ano-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-9f', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 1, titulo: 'Apostila 1º Bimestre - 9º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/9ano-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-1m', ano: '1ª Série EM', nivel: 'Médio', bimestre: 1, titulo: 'Caderno do Aluno 1º Bimestre - 1ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/1em-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-2m', ano: '2ª Série EM', nivel: 'Médio', bimestre: 1, titulo: 'Caderno do Aluno 1º Bimestre - 2ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/2em-1bim-aluno.pdf', atualizado: '2026' },
    { id: '1b-3m', ano: '3ª Série EM', nivel: 'Médio', bimestre: 1, titulo: 'Caderno do Aluno 1º Bimestre - 3ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/01/3em-1bim-aluno.pdf', atualizado: '2026' },

    // 2º BIMESTRE
    { id: '2b-6f', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 2, titulo: 'Apostila 2º Bimestre - 6º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/6ano-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-7f', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 2, titulo: 'Apostila 2º Bimestre - 7º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/7ano-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-8f', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 2, titulo: 'Apostila 2º Bimestre - 8º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/8ano-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-9f', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 2, titulo: 'Apostila 2º Bimestre - 9º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/9ano-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-1m', ano: '1ª Série EM', nivel: 'Médio', bimestre: 2, titulo: 'Caderno do Aluno 2º Bimestre - 1ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/1em-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-2m', ano: '2ª Série EM', nivel: 'Médio', bimestre: 2, titulo: 'Caderno do Aluno 2º Bimestre - 2ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/2em-2bim-aluno.pdf', atualizado: '2026' },
    { id: '2b-3m', ano: '3ª Série EM', nivel: 'Médio', bimestre: 2, titulo: 'Caderno do Aluno 2º Bimestre - 3ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/04/3em-2bim-aluno.pdf', atualizado: '2026' },

    // 3º BIMESTRE (Links Oficiais do Acervo CMSP)
    // 6º ANO
    { id: '3b-6f-pm', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159112/1657614.pdf', atualizado: '2026 CMSP' },
    { id: '3b-6f-hg', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'História e Geografia - 3º Bimestre', disciplinas: 'História, Geografia', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159117/1657654.pdf', atualizado: '2026 CMSP' },
    { id: '3b-6f-cipv', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Ciências, Inglês e Projeto de Vida - 3º Bimestre', disciplinas: 'Ciências, Inglês, Projeto de Vida', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159114/1657643.pdf', atualizado: '2026 CMSP' },

    // 7º ANO
    { id: '3b-7f-pm', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159124/1657696.pdf', atualizado: '2026 CMSP' },
    { id: '3b-7f-hg', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'História e Geografia - 3º Bimestre', disciplinas: 'História, Geografia', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159132/1657736.pdf', atualizado: '2026 CMSP' },
    { id: '3b-7f-cipv', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Ciências, Inglês e Projeto de Vida - 3º Bimestre', disciplinas: 'Ciências, Inglês, Projeto de Vida', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159129/1657718.pdf', atualizado: '2026 CMSP' },

    // 8º ANO
    { id: '3b-8f-pm', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159139/1657771.pdf', atualizado: '2026 CMSP' },
    { id: '3b-8f-hg', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'História e Geografia - 3º Bimestre', disciplinas: 'História, Geografia', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159147/1657799.pdf', atualizado: '2026 CMSP' },
    { id: '3b-8f-cipv', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Ciências, Inglês e Projeto de Vida - 3º Bimestre', disciplinas: 'Ciências, Inglês, Projeto de Vida', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159143/1657780.pdf', atualizado: '2026 CMSP' },

    // 9º ANO
    { id: '3b-9f-pm', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159151/1657823.pdf', atualizado: '2026 CMSP' },
    { id: '3b-9f-hg', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'História e Geografia - 3º Bimestre', disciplinas: 'História, Geografia', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159159/1657861.pdf', atualizado: '2026 CMSP' },
    { id: '3b-9f-cipv', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 3, titulo: 'Ciências, Inglês e Projeto de Vida - 3º Bimestre', disciplinas: 'Ciências, Inglês, Projeto de Vida', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159156/1657849.pdf', atualizado: '2026 CMSP' },

    // 1ª SÉRIE EM
    { id: '3b-1m-fbq', ano: '1ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'Física, Biologia e Química - 3º Bimestre', disciplinas: 'Física, Biologia, Química', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159072/1657331.pdf', atualizado: '2026 CMSP' },
    { id: '3b-1m-hgi', ano: '1ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'História, Geografia e Inglês - 3º Bimestre', disciplinas: 'História, Geografia, Inglês', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159074/1657382.pdf', atualizado: '2026 CMSP' },
    { id: '3b-1m-pm', ano: '1ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159093/1657490.pdf', atualizado: '2026 CMSP' },

    // 2ª SÉRIE EM
    { id: '3b-2m-fbq', ano: '2ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'Física, Biologia e Química - 3º Bimestre', disciplinas: 'Física, Biologia, Química', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159095/1657500.pdf', atualizado: '2026 CMSP' },
    { id: '3b-2m-hgi', ano: '2ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'História, Geografia e Inglês - 3º Bimestre', disciplinas: 'História, Geografia, Inglês', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159102/1657524.pdf', atualizado: '2026 CMSP' },
    { id: '3b-2m-pm', ano: '2ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159104/1657537.pdf', atualizado: '2026 CMSP' },

    // 3ª SÉRIE EM
    { id: '3b-3m-hfi', ano: '3ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'História, Física e Inglês - 3º Bimestre', disciplinas: 'História, Física, Inglês', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159106/1657566.pdf', atualizado: '2026 CMSP' },
    { id: '3b-3m-pm', ano: '3ª Série EM', nivel: 'Médio', bimestre: 3, titulo: 'Português e Matemática - 3º Bimestre', disciplinas: 'Língua Portuguesa, Matemática', tipo: 'Aluno', linkUrl: 'https://acervocmsp.educacao.sp.gov.br/159108/1657577.pdf', atualizado: '2026 CMSP' },

    // 4º BIMESTRE
    { id: '4b-6f', ano: '6° Ano EF', nivel: 'Fundamental', bimestre: 4, titulo: 'Apostila 4º Bimestre - 6º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/6ano-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-7f', ano: '7° Ano EF', nivel: 'Fundamental', bimestre: 4, titulo: 'Apostila 4º Bimestre - 7º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/7ano-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-8f', ano: '8° Ano EF', nivel: 'Fundamental', bimestre: 4, titulo: 'Apostila 4º Bimestre - 8º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/8ano-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-9f', ano: '9° Ano EF', nivel: 'Fundamental', bimestre: 4, titulo: 'Apostila 4º Bimestre - 9º Ano Fundamental', disciplinas: 'Língua Portuguesa, Matemática, Ciências, História, Geografia', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/9ano-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-1m', ano: '1ª Série EM', nivel: 'Médio', bimestre: 4, titulo: 'Caderno do Aluno 4º Bimestre - 1ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/1em-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-2m', ano: '2ª Série EM', nivel: 'Médio', bimestre: 4, titulo: 'Caderno do Aluno 4º Bimestre - 2ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/2em-4bim-aluno.pdf', atualizado: '2026' },
    { id: '4b-3m', ano: '3ª Série EM', nivel: 'Médio', bimestre: 4, titulo: 'Caderno do Aluno 4º Bimestre - 3ª Série Médio', disciplinas: 'Linguagens, Matemática, Ciências da Natureza, Ciências Humanas', tipo: 'Aluno', linkUrl: 'https://efape.educacao.sp.gov.br/curriculopaulista/wp-content/uploads/2024/10/3em-4bim-aluno.pdf', atualizado: '2026' }
  ];

  const filtered = apostilas.filter(a => {
    const matchBimestre = a.bimestre === selectedBimestre;
    const matchNivel = selectedNivel === 'Todos' || a.nivel === selectedNivel;
    const matchSearch = a.titulo.toLowerCase().includes(searchFilter.toLowerCase()) || 
                        a.ano.toLowerCase().includes(searchFilter.toLowerCase()) || 
                        a.disciplinas.toLowerCase().includes(searchFilter.toLowerCase());
    return matchBimestre && matchNivel && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" /> Material Didático Currículo Paulista 2026
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Cadernos e Apostilas Organizadas por Bimestre
            </h2>
            <p className="text-xs text-zinc-400 mt-1 max-w-xl">
              Acesse e baixe os cadernos do aluno e do professor oficiais para o 1º, 2º, 3º e 4º bimestre com um único clique.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar disciplina ou ano..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="pl-9 pr-4 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 w-full md:w-60"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bimestre Tabs Selection */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        {/* Bimestres */}
        <div className="flex items-center gap-2 bg-[#121214] p-1.5 rounded-2xl border border-[#27272a]">
          {[1, 2, 3, 4].map((bim) => (
            <button
              key={bim}
              onClick={() => setSelectedBimestre(bim)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedBimestre === bim
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black shadow-lg shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#18181b]'
              }`}
            >
              <span>{bim}º Bimestre</span>
              {bim === 3 && (
                <span className="text-[9px] bg-amber-400 text-black px-1.5 py-0.2 font-extrabold rounded-full">
                  Atual
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Nível Filter */}
        <div className="flex items-center gap-1 bg-[#121214] p-1.5 rounded-2xl border border-[#27272a]">
          {(['Todos', 'Fundamental', 'Médio'] as const).map((nivel) => (
            <button
              key={nivel}
              onClick={() => setSelectedNivel(nivel)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedNivel === nivel
                  ? 'bg-[#27272a] text-white border border-white/10'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {nivel}
            </button>
          ))}
        </div>
      </div>

      {/* Apostilas List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div
            key={a.id}
            className="bg-[#121214] border border-[#27272a] hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                  {a.ano}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">
                  {a.bimestre}º Bimestre • {a.atualizado}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors">
                  {a.titulo}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  <strong className="text-zinc-300 font-medium">Matérias:</strong> {a.disciplinas}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#1f1f23] flex items-center gap-2">
              <a
                href={a.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 bg-[#18181b] hover:bg-[#222226] text-zinc-200 text-xs font-semibold rounded-xl border border-[#27272a] hover:border-emerald-500/30 flex items-center justify-center gap-1.5 transition-all text-center"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Baixar PDF
              </a>
              <a
                href={a.linkUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-[#18181b] hover:bg-[#222226] text-zinc-400 hover:text-white rounded-xl border border-[#27272a] transition-all"
                title="Abrir no Navegador"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-12 text-center bg-[#121214] border border-[#27272a] rounded-2xl">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <div className="text-sm font-semibold text-zinc-300">
              Nenhuma apostila encontrada para estes filtros
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Tente selecionar outro bimestre ou limpar os termos da busca.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
