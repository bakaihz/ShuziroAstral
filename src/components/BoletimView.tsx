import React, { useEffect, useState } from 'react';
import { BarChart3, Bell, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserData, BoletimItem, AvisoItem } from '../types';

interface BoletimViewProps {
  userData: UserData;
  authToken: string;
}

export const BoletimView: React.FC<BoletimViewProps> = ({ userData, authToken }) => {
  const [boletim, setBoletim] = useState<BoletimItem[]>([]);
  const [avisos, setAvisos] = useState<AvisoItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!userData.codigoAluno) {
        setLoading(false);
        return;
      }
      try {
        const resB = await fetch(`/api/boletim?codigoAluno=${userData.codigoAluno}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (resB.ok) {
          const json = await resB.json();
          if (json.data) setBoletim(json.data);
        }

        const resA = await fetch(`/api/avisos?codigoUsuario=${userData.codigoAluno}&turmas=${userData.codigoTurma || 40917188}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (resA.ok) {
          const jsonA = await resA.json();
          if (jsonA.data) setAvisos(jsonA.data);
        }
      } catch (err) {
        console.warn('Erro ao carregar boletim/avisos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userData, authToken]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Boletim */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
            <BarChart3 className="w-4 h-4 text-emerald-400" /> Boletim Escolar (2026)
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Carregando boletim...</div>
          ) : boletim.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Nenhum registro de boletim encontrado.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {boletim.map((item, idx) => (
                <div key={idx} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3 flex items-center justify-between">
                  <div className="text-xs font-medium text-zinc-200">{item.disciplina || 'Disciplina'}</div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-zinc-400">Média: <strong className="text-zinc-200">{item.mediaFinal ?? '-'}</strong></span>
                    <span className="text-zinc-400">Faltas: <strong className="text-amber-400">{item.numeroFaltas ?? 0}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Avisos */}
        <div className="bg-[#121214] border border-[#27272a] rounded-2xl p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-200 mb-4">
            <Bell className="w-4 h-4 text-emerald-400" /> Mural de Avisos da Escola
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Carregando avisos...</div>
          ) : avisos.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-xs">Nenhum aviso novo no momento.</div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {avisos.map((aviso, idx) => (
                <div key={idx} className="bg-[#18181b] border border-[#27272a] rounded-xl p-3">
                  <div className="text-xs font-semibold text-zinc-200">{aviso.titulo || 'Aviso Escolar'}</div>
                  <div className="text-[11px] text-zinc-400 mt-1">{aviso.descricao || ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
