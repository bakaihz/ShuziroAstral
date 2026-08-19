import { 
  TaskModel, 
  AnswerModel, 
  CategoryModel, 
  FrequencyModel, 
  ReportCardModel, 
  DisciplineReportCard, 
  MessageModel,
  FrequenciaItem,
  ResumoFaltasItem,
  MotivoFaltaItem,
  JustificativaFaltaItem,
  DisciplinaAlunoItem,
  BoletimItem,
  FechamentoItem,
  AvisoTurmaItem,
  NotificacaoCmspItem
} from '../types';
import { resolveTaskStatus } from './taskStatusResolver';

/**
 * Normalizes raw category responses into CategoryModel objects
 */
export function normalizeCategories(rawCategories: any): { list: CategoryModel[]; map: Map<number, string> } {
  const items = Array.isArray(rawCategories) 
    ? rawCategories 
    : (rawCategories?.items || rawCategories?.data || rawCategories?.categories || []);

  const list: CategoryModel[] = [];
  const map = new Map<number, string>();

  items.forEach((cat: any) => {
    if (!cat) return;
    const id = Number(cat.id || cat.category_id || cat.id_categoria || 0);
    const name = String(cat.name || cat.nome || cat.description || cat.descricao || `Categoria ${id}`).trim();
    if (id) {
      list.push({
        id,
        name,
        slug: cat.slug || '',
        parentId: cat.parent_id || cat.parentId,
        color: cat.color || cat.style?.backgroundColor
      });
      map.set(id, name);
    }
  });

  return { list, map };
}

/**
 * Normalizes raw answer responses into structured AnswerModel objects
 */
export function normalizeAnswers(rawAnswers: any): { list: AnswerModel[]; map: Map<string | number, AnswerModel> } {
  const items = Array.isArray(rawAnswers)
    ? rawAnswers
    : (rawAnswers?.items || rawAnswers?.data || rawAnswers?.answers || []);

  const list: AnswerModel[] = [];
  const map = new Map<string | number, AnswerModel>();

  items.forEach((ans: any) => {
    if (!ans) return;
    const taskId = ans.task_id || ans.taskId || ans.task?.id;
    if (!taskId) return;

    const model: AnswerModel = {
      id: ans.id || ans.answer_id,
      taskId: taskId,
      status: ans.status || ans.answer_status || 'pending',
      nick: ans.nick || ans.answer_nick,
      duration: ans.duration || ans.answer_duration,
      resultScore: ans.result_score !== undefined ? ans.result_score : ans.answer_result_score,
      deliveredAt: ans.delivered_at || ans.answer_delivered_at || null,
      createdAt: ans.created_at || ans.answer_created_at,
      updatedAt: ans.updated_at || ans.answer_updated_at,
      accessedOn: ans.accessed_on || ans.answer_accessed_on,
      executedOn: ans.executed_on || ans.answer_executed_on,
      publicationTarget: ans.publication_target || ans.answer_publication_target,
      answersDict: ans.answers || ans.answer_answers,
      raw: ans
    };

    list.push(model);
    map.set(String(taskId), model);
    map.set(Number(taskId), model);
  });

  return { list, map };
}

/**
 * Normalizes tasks and enriches them with corresponding answers and categories
 */
export function normalizeTasks(
  rawTasks: any,
  answersMap: Map<string | number, AnswerModel> = new Map(),
  categoriesMap: Map<number, string> = new Map()
): TaskModel[] {
  const items = Array.isArray(rawTasks)
    ? rawTasks
    : (rawTasks?.items || rawTasks?.data || rawTasks?.tasks || []);

  const seenIds = new Set<string | number>();
  const normalized: TaskModel[] = [];

  for (const t of items) {
    if (!t) continue;
    const id = t.id || t.task_id || t.taskId;
    if (!id || seenIds.has(id)) continue;
    seenIds.add(id);

    // Link with answer if present in map or inside task object
    let answer: AnswerModel | null = answersMap.get(String(id)) || answersMap.get(Number(id)) || null;
    if (!answer && (t.answer_id || t.answer_answers || t.answer_status)) {
      answer = {
        id: t.answer_id,
        taskId: id,
        status: t.answer_status || 'pending',
        nick: t.answer_nick,
        duration: t.answer_duration,
        resultScore: t.answer_result_score,
        deliveredAt: t.answer_delivered_at || null,
        createdAt: t.answer_created_at,
        updatedAt: t.answer_updated_at,
        accessedOn: t.answer_accessed_on,
        executedOn: t.answer_executed_on,
        publicationTarget: t.answer_publication_target,
        answersDict: t.answer_answers,
        raw: t
      };
    }

    const categoryIds: number[] = Array.isArray(t.category_ids) 
      ? t.category_ids 
      : (t.category_id ? [t.category_id] : []);

    const categoryNames = categoryIds
      .map(cid => categoriesMap.get(cid))
      .filter((name): name is string => Boolean(name));

    const statusResolution = resolveTaskStatus(t, answer);

    normalized.push({
      id,
      taskId: t.task_id || id,
      title: t.title || t.titulo || 'Tarefa sem título',
      description: t.description || t.descricao || '',
      author: t.author || t.autor,
      publishAt: t.publish_at || t.publishAt,
      expireAt: t.expire_at || t.expireAt || t.dueDate || t.due_date,
      categoryIds,
      categoryNames: categoryNames.length > 0 ? categoryNames : (t.category_name ? [t.category_name] : undefined),
      questionCount: t.question_count || t.questions?.length || t.items?.length || 0,
      isExam: Boolean(t.is_exam || t.isExam),
      isEssay: Boolean(t.is_essay || t.isEssay),
      score: t.score || t.total_score || 0,
      publicationTarget: t.publication_target || t.room_name || t.publicationTarget,
      publication: t.publication,
      enableCaptcha: Boolean(t.enable_captcha),
      allowCheckAnswer: Boolean(t.allow_check_answer),
      maxExecutionTime: t.max_execution_time,
      minExecutionTime: t.min_execution_time || 30,
      style: t.style,
      answer,
      visualStatus: statusResolution.status,
      visualStatusLabel: statusResolution.label,
      isExpired: statusResolution.isExpired,
      raw: t
    });
  }

  return normalized;
}

/**
 * Normalizes student attendance, absences, reasons and justifications into FrequencyModel
 */
export function normalizeFrequency(
  rawFreq: any,
  rawResumo: any,
  rawMotivos?: any,
  rawUltimosDias?: any,
  rawJustificativas?: any
): FrequencyModel {
  const freqItems: FrequenciaItem[] = Array.isArray(rawFreq) 
    ? rawFreq 
    : (rawFreq?.data || rawFreq?.items || []);

  const itemsByTerm: Record<number, FrequenciaItem[]> = { 1: [], 2: [], 3: [], 4: [] };

  freqItems.forEach(item => {
    const bim = item.bimestre ? Number(item.bimestre) : 1;
    if (itemsByTerm[bim]) {
      itemsByTerm[bim].push(item);
    } else {
      itemsByTerm[1].push(item);
    }
  });

  const resumo: ResumoFaltasItem | null = rawResumo?.data 
    ? (Array.isArray(rawResumo.data) ? rawResumo.data[0] : rawResumo.data)
    : (Array.isArray(rawResumo) ? rawResumo[0] : rawResumo || null);

  const reasons: MotivoFaltaItem[] = Array.isArray(rawMotivos)
    ? rawMotivos
    : (rawMotivos?.data || []);

  const lastAbsenceDays: string[] = Array.isArray(rawUltimosDias)
    ? rawUltimosDias.map((d: any) => typeof d === 'string' ? d : d.dataFalta || d.data || String(d))
    : (rawUltimosDias?.data ? rawUltimosDias.data.map((d: any) => d.dataFalta || d.data || String(d)) : []);

  const justifications: JustificativaFaltaItem[] = Array.isArray(rawJustificativas)
    ? rawJustificativas
    : (rawJustificativas?.data || []);

  let totalClasses = resumo?.totalAulasRealizadas || 0;
  let totalAbsences = resumo?.totalFaltasBimestre || 0;

  if (!totalClasses && freqItems.length > 0) {
    freqItems.forEach(f => {
      totalClasses += f.quantidadeAulasRealizadas || 0;
      totalAbsences += f.numeroFaltasBimestre || f.faltasBimestreAtual || 0;
    });
  }

  const attendanceRate = resumo?.porcentagemFrequencia !== undefined
    ? resumo.porcentagemFrequencia
    : (totalClasses > 0 ? Math.round(((totalClasses - totalAbsences) / totalClasses) * 100) : 100);

  return {
    currentTermAbsences: totalAbsences,
    currentTermAttendanceRate: attendanceRate,
    totalClassesHeld: totalClasses,
    totalAbsences,
    resumo,
    itemsByTerm: itemsByTerm as any,
    lastAbsenceDays,
    reasons,
    justifications
  };
}

/**
 * Normalizes student disciplines, report cards, frequency per term and closing assessments
 */
export function normalizeReport(
  rawDisciplines: any,
  rawBoletim: any,
  frequencyByTerm: Record<number, FrequenciaItem[]> = { 1: [], 2: [], 3: [], 4: [] },
  rawClosings?: any
): ReportCardModel {
  const discList: DisciplinaAlunoItem[] = Array.isArray(rawDisciplines)
    ? rawDisciplines
    : (rawDisciplines?.data || []);

  const boletimList: BoletimItem[] = Array.isArray(rawBoletim)
    ? rawBoletim
    : (rawBoletim?.data || []);

  const closingsList: FechamentoItem[] = Array.isArray(rawClosings)
    ? rawClosings
    : (rawClosings?.data || []);

  const firstBol = boletimList[0];
  const firstDisc = discList[0];

  const studentName = firstBol?.nomeAluno || 'Aluno';
  const ra = firstBol?.numeroRa 
    ? `${firstBol.numeroRa}-${firstBol.numeroDigitoRa || ''} ${firstBol.siglaUfRa || 'SP'}`.trim()
    : '';
  const schoolName = firstBol?.nomeEscola || firstDisc?.NomeEscola || '';
  const classDescription = firstBol?.descricaoTurma || firstDisc?.DescricaoTurma || '';
  const classroom = firstDisc?.NumeroSala || '';
  const year = firstBol?.dataAnoLetivo || 2026;

  // Build a map of boletim items by discipline ID and name
  const boletimByDiscId = new Map<number, BoletimItem>();
  const boletimByName = new Map<string, BoletimItem>();

  boletimList.forEach(b => {
    if (b.disciplinaId) boletimByDiscId.set(Number(b.disciplinaId), b);
    const dName = (b.nomeDisciplina || b.disciplina || '').toLowerCase().trim();
    if (dName) boletimByName.set(dName, b);
  });

  // Build frequency map by discipline name/ID
  const freqByDisc = new Map<string, Record<number, { faltas?: number; presenca?: number }>>();

  [1, 2, 3, 4].forEach(termNum => {
    const list = frequencyByTerm[termNum] || [];
    list.forEach(f => {
      const key = (f.nomeDisciplina || '').toLowerCase().trim();
      if (!freqByDisc.has(key)) {
        freqByDisc.set(key, {});
      }
      freqByDisc.get(key)![termNum] = {
        faltas: f.numeroFaltasBimestre || f.faltasBimestreAtual,
        presenca: f.porcentagemPresenca || f.porcentagemPresencaBimestreAtual
      };
    });
  });

  // Closing map by discipline
  const closingsByDiscId = new Map<number, FechamentoItem[]>();
  closingsList.forEach(c => {
    if (c.codigoDisciplina) {
      const existing = closingsByDiscId.get(c.codigoDisciplina) || [];
      existing.push(c);
      closingsByDiscId.set(c.codigoDisciplina, existing);
    }
  });

  // Combine disciplines with boletim items
  const disciplines: DisciplineReportCard[] = [];
  const processedDiscIds = new Set<number>();

  // 1. Process structured discipline list first
  discList.forEach(d => {
    const discId = Number(d.CodigoDisciplina);
    processedDiscIds.add(discId);
    const discName = d.NomeDisciplina || d.NomeAbreviadoDisciplina || `Disciplina ${discId}`;
    const bolItem = boletimByDiscId.get(discId) || boletimByName.get(discName.toLowerCase().trim());
    const freqData = freqByDisc.get(discName.toLowerCase().trim()) || {};

    disciplines.push({
      disciplineId: discId,
      name: discName,
      abbreviation: d.NomeAbreviadoDisciplina,
      termGrades: {
        1: (bolItem as any)?.notaBimestre1 ?? (bolItem as any)?.nota1 ?? null,
        2: (bolItem as any)?.notaBimestre2 ?? (bolItem as any)?.nota2 ?? null,
        3: (bolItem as any)?.notaBimestre3 ?? (bolItem as any)?.nota3 ?? null,
        4: (bolItem as any)?.notaBimestre4 ?? (bolItem as any)?.nota4 ?? null
      },
      termAbsences: {
        1: freqData[1]?.faltas ?? null,
        2: freqData[2]?.faltas ?? null,
        3: freqData[3]?.faltas ?? null,
        4: freqData[4]?.faltas ?? null
      },
      finalGrade: bolItem?.notaAtribuidaMediaFinal || bolItem?.mediaFinal || bolItem?.notaAtribuida || null,
      totalAbsences: bolItem?.numeroFaltasAcumuladas || bolItem?.numeroFaltas,
      attendanceRate: bolItem?.porcentagemFrequencia,
      status: bolItem?.situacao,
      closings: closingsByDiscId.get(discId)
    });
  });

  // 2. Include any boletim items not present in the discipline list
  boletimList.forEach(b => {
    const discId = Number(b.disciplinaId || 0);
    if (discId && !processedDiscIds.has(discId)) {
      processedDiscIds.add(discId);
      const discName = b.nomeDisciplina || b.disciplina || `Disciplina ${discId}`;
      const freqData = freqByDisc.get(discName.toLowerCase().trim()) || {};

      disciplines.push({
        disciplineId: discId,
        name: discName,
        termGrades: {
          1: (b as any)?.notaBimestre1 ?? (b as any)?.nota1 ?? null,
          2: (b as any)?.notaBimestre2 ?? (b as any)?.nota2 ?? null,
          3: (b as any)?.notaBimestre3 ?? (b as any)?.nota3 ?? null,
          4: (b as any)?.notaBimestre4 ?? (b as any)?.nota4 ?? null
        },
        termAbsences: {
          1: freqData[1]?.faltas ?? null,
          2: freqData[2]?.faltas ?? null,
          3: freqData[3]?.faltas ?? null,
          4: freqData[4]?.faltas ?? null
        },
        finalGrade: b.notaAtribuidaMediaFinal || b.mediaFinal || b.notaAtribuida || null,
        totalAbsences: b.numeroFaltasAcumuladas || b.numeroFaltas,
        attendanceRate: b.porcentagemFrequencia,
        status: b.situacao,
        closings: closingsByDiscId.get(discId)
      });
    }
  });

  return {
    studentName,
    ra,
    schoolName,
    classDescription,
    classroom,
    year,
    disciplines
  };
}

/**
 * Normalizes class notice board and CMSP notifications into a unified, chronological MessageModel list
 */
export function normalizeMessages(rawNotices: any, rawNotifications: any): MessageModel[] {
  const notices: AvisoTurmaItem[] = Array.isArray(rawNotices)
    ? rawNotices
    : (rawNotices?.data || []);

  const notifications: NotificacaoCmspItem[] = Array.isArray(rawNotifications)
    ? rawNotifications
    : (rawNotifications?.data || []);

  const messages: MessageModel[] = [];

  // Notice board items
  notices.forEach(n => {
    messages.push({
      id: `notice-${n.codigoMuralAviso || Math.random()}`,
      type: 'notice',
      title: n.titulo || 'Aviso da Turma',
      body: n.conteudoCustomizado || n.conteudo || '',
      author: n.nomeUsuarioCadastro || 'Coordenação Escolar',
      date: n.dataCadastro || n.dataInicio || new Date().toISOString(),
      isPinned: Boolean(n.fixarAviso),
      isRead: Boolean(n.lido),
      raw: n
    });
  });

  // CMSP Notifications
  notifications.forEach(notif => {
    messages.push({
      id: `notification-${notif.idNotificacaoUsuario || notif.idNotificacao || Math.random()}`,
      type: 'notification',
      title: notif.titulo || 'Notificação CMSP',
      body: notif.mensagemCustomizavel || notif.mensagem || notif.subtitulo || '',
      author: 'CMSP / Sala do Futuro',
      date: notif.dtInclusao || new Date().toISOString(),
      isPinned: false,
      isRead: Boolean(notif.statusLeitura),
      imageUrl: notif.urlImagem,
      raw: notif
    });
  });

  // Sort: pinned first, then newest to oldest
  messages.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return messages;
}
