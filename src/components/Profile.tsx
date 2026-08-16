import React, { useEffect, useState } from 'react';
import { StudentAPI } from '../api/student';
import { User, Flame, Bell, RefreshCw, BookOpen } from 'lucide-react';
import { UserData } from '../types';

interface ProfileProps {
  userData?: UserData;
}

export const ProfileComponent: React.FC<ProfileProps> = ({ userData }) => {
  const [student, setStudent] = useState<any>(null);
  const [thermometer, setThermometer] = useState<any>(null);
  const [announcement, setAnnouncement] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const [stdRes, thermRes, annRes, fbRes, asgRes] = await Promise.all([
        StudentAPI.getStudent(userData),
        StudentAPI.getThermometer(),
        StudentAPI.getLatestAnnouncement(),
        StudentAPI.getFeedbacks(),
        StudentAPI.getAssignmentsReceived()
      ]);

      if (stdRes.data) setStudent(stdRes.data);
      if (thermRes.data) setThermometer(thermRes.data);
      if (annRes.data) setAnnouncement(annRes.data);
      if (fbRes.data) setFeedbacks(fbRes.data);
      if (asgRes.data) setAssignments(asgRes.data);
    } catch (e) {
      console.error("[Profile Component] Erro ao carregar dados do aluno:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userData]);

  const studentName = student?.name || userData?.nome || userData?.nick || "Aluno Conectado";
  const studentSchool = student?.schoolName || userData?.escola || "SEDUC SP";
  const studentGrade = student?.grade || userData?.serie || "Ensino Médio";
  
  // Format RA dynamically
  let rawRa = student?.ra || userData?.ra || '';
  let digito = student?.digito || userData?.digito || '';
  
  if (rawRa) {
    const clean = String(rawRa).replace(/sp$/i, '');
    if (!digito && clean.length > 1) {
      rawRa = clean.slice(0, -1);
      digito = clean.slice(-1);
    } else {
      rawRa = clean;
    }
  }

  const raDisplay = rawRa ? `${rawRa}${digito ? '-' + digito : ''}` : (userData?.ra || 'Carregando...');

  return (
    <div className="space-y-6">
      {/* Student Identity Card */}
      <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-amber-400" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {studentName}
            </h3>
            <p className="text-xs text-zinc-400">
              RA: <strong className="text-zinc-200">{raDisplay}</strong> | {studentSchool} ({studentGrade})
            </p>
            <span className="inline-block mt-1 text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-800">
              Sessão de Aluno Conectada
            </span>
          </div>
        </div>

        <button
          onClick={loadProfile}
          disabled={loading}
          className="px-3 py-2 bg-[#09090b] hover:bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar Dados
        </button>
      </div>

      {/* Thermometer & Stats */}
      {thermometer && (
        <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h4 className="text-sm font-bold text-white">Termômetro Semanal de Leitura (GET /v1/student/thermometer)</h4>
            </div>
            <span className="text-xs font-bold text-amber-400">{thermometer.percentage}% da Meta</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 block font-medium">Minutos Lidos</span>
              <span className="text-lg font-black text-white">{thermometer.currentMinutes} / {thermometer.weeklyGoal} min</span>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 block font-medium">Dias Ativos</span>
              <span className="text-lg font-black text-amber-400">{thermometer.daysActive} dias na semana</span>
            </div>

            <div className="bg-[#09090b] border border-zinc-800 rounded-xl p-4">
              <span className="text-[10px] text-zinc-500 block font-medium">Ofensiva de Leitura</span>
              <span className="text-lg font-black text-emerald-400">{thermometer.streak || 6} dias seguidos</span>
            </div>
          </div>
        </div>
      )}

      {/* Announcement & Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {announcement && (
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Bell className="w-4 h-4" />
              <span>Aviso Importante (GET /v1/student/latest-announcement)</span>
            </div>
            <h5 className="text-xs font-bold text-white">{announcement.title}</h5>
            <p className="text-xs text-zinc-400 leading-relaxed">{announcement.content}</p>
          </div>
        )}

        {assignments.length > 0 && (
          <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <BookOpen className="w-4 h-4" />
              <span>Atividades Recebidas (GET /v1/student/assignments/received)</span>
            </div>
            <div className="space-y-2">
              {assignments.map((asg, i) => (
                <div key={i} className="bg-[#09090b] border border-zinc-800 rounded-lg p-3 flex justify-between items-center text-xs">
                  <div>
                    <h6 className="font-bold text-white">{asg.title}</h6>
                    <span className="text-[10px] text-zinc-500">Prazo: {asg.dueDate}</span>
                  </div>
                  <span className="text-[10px] bg-amber-950 text-amber-300 font-bold px-2 py-0.5 rounded">
                    {asg.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
