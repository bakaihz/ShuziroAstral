export type AuthStatus = 'authenticated' | 'unauthenticated' | 'authenticationLoading' | 'authenticationError';

export interface UserData {
  success: boolean;
  auth_token: string;
  sed_token?: string;
  nick: string;
  nome: string;
  escola: string;
  serie: string;
  ra?: string;
  digito?: string;
  password?: string;
  codigoAluno?: number | string;
  codigoTurma?: number | string;
  email?: string;
  emailGoogle?: string;
  emailMs?: string;
}

export type VisualTaskStatus = 
  | 'not_started'  // Não iniciada
  | 'draft'        // Rascunho
  | 'in_progress'  // Em andamento
  | 'delivered'    // Entregue
  | 'graded'       // Corrigida
  | 'expired';     // Expirada

export interface CategoryModel {
  id: number;
  name: string;
  slug?: string;
  parentId?: number;
  color?: string;
}

export interface AnswerModel {
  id?: number | string;
  taskId: number | string;
  status: 'draft' | 'pending' | 'submitted' | 'finished' | 'graded' | string;
  nick?: string;
  duration?: number | string;
  resultScore?: number;
  deliveredAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  accessedOn?: string;
  executedOn?: string;
  publicationTarget?: string;
  answersDict?: Record<string, any>;
  raw?: any;
}

export interface TaskModel {
  id: number | string;
  taskId?: number | string;
  title: string;
  description?: string;
  author?: string;
  publishAt?: string;
  expireAt?: string;
  categoryIds: number[];
  categoryNames?: string[];
  questionCount: number;
  isExam: boolean;
  isEssay: boolean;
  score?: number;
  publicationTarget?: string;
  publication?: string;
  enableCaptcha?: boolean;
  allowCheckAnswer?: boolean;
  maxExecutionTime?: number | null;
  minExecutionTime?: number;
  style?: {
    backgroundColor?: string;
    [key: string]: any;
  };
  
  // Enriched answer data
  answer?: AnswerModel | null;
  visualStatus: VisualTaskStatus;
  visualStatusLabel: string;
  isExpired: boolean;
  raw?: any;
}

export interface TaskCountModel {
  total: number;
  pending: number;
  draft: number;
  expired: number;
  isEssay?: boolean;
}

export interface SavedAccount {
  ra: string;
  senha: string;
  estado: string;
  data: string;
}

export interface FrequenciaItem {
  anoLetivo?: number;
  matriculaAlunoId?: number;
  alunoId?: number;
  turmaId?: number;
  disciplinaId?: number;
  nomeDisciplina: string;
  quantidadeAulasRealizadas?: number;
  quantidadeAulasPlanejadas?: number;
  numeroPresencasBimestre?: number;
  numeroFaltasBimestre?: number;
  faltasBimestreAtual?: number;
  porcentagemPresenca?: number;
  porcentagemPresencaBimestreAtual?: number;
  numeroFaltasCompensadas?: number;
  nivelPorcentagemPresenca?: number;
  bimestre?: number;
  nota?: number | string;
}

export interface ResumoFaltasItem {
  alunoId?: number;
  totalFaltasBimestre: number;
  totalAulasRealizadas: number;
  porcentagemFaltas: number;
  nivelPorcentagemFaltas?: number;
  porcentagemFrequencia: number;
  nivelPorcentagemFrequencia?: number;
}

export interface MotivoFaltaItem {
  motivoFaltaId: number;
  descricaoMotivo: string;
  descricaoCategoria: string;
  flagOrientacao?: number;
  descricaoOrientacao?: string;
  flagAtivo?: number;
}

export interface JustificativaFaltaItem {
  id?: number | string;
  dataFalta?: string;
  motivo?: string;
  status?: string;
  observacao?: string;
  dataAnalise?: string;
}

export interface FrequencyModel {
  currentTermAbsences: number;
  currentTermAttendanceRate: number;
  totalClassesHeld: number;
  totalAbsences: number;
  resumo: ResumoFaltasItem | null;
  itemsByTerm: {
    1: FrequenciaItem[];
    2: FrequenciaItem[];
    3: FrequenciaItem[];
    4: FrequenciaItem[];
  };
  lastAbsenceDays: string[];
  reasons: MotivoFaltaItem[];
  justifications: JustificativaFaltaItem[];
}

export interface FechamentoItem {
  anoLetivo?: number;
  tipoFechamento: number; // 5, 6, 7, 8, 10
  tipoFechamentoNome?: string;
  codigoDisciplina?: number;
  nomeDisciplina?: string;
  nota?: number | string;
  faltas?: number;
  aulasDadas?: number;
  situacao?: string;
}

export interface DisciplinaAlunoItem {
  CodigoDisciplina: number;
  NomeDisciplina: string;
  NomeAbreviadoDisciplina?: string;
  CodigoTurma?: number;
  NumeroClasse?: number;
  NumeroSerie?: number;
  IdentificadorTurma?: string;
  DescricaoTurma?: string;
  NumeroSala?: string;
  CodigoEscola?: number;
  NomeEscola?: string;
  CodigoUnidade?: number;
  CodigoTurno?: number;
  TipoRedeEnsino?: number;
  CodigoTipoEnsino?: number;
  NomeTipoEnsino?: string;
  Situacao?: number;
  Regular?: boolean;
}

export interface BoletimItem {
  alunoId?: number;
  matriculaAlunoId?: number;
  turmaId?: number;
  disciplinaId?: number;
  nomeDisciplina?: string;
  disciplina?: string;
  quantidadeAulasPlanejadas?: number;
  quantidadeAulasRealizadas?: number;
  notaAtribuida?: number | string;
  notaAtribuidaMediaFinal?: number | string;
  numeroFaltas?: number;
  numeroFaltasAcumuladas?: number;
  numeroFaltasCompensadas?: number;
  nomeAluno?: string;
  numeroRa?: string;
  numeroDigitoRa?: string;
  siglaUfRa?: string;
  nomeEscola?: string;
  descricaoTurma?: string;
  porcentagemFaltas?: number;
  porcentagemFrequencia?: number;
  nivelNota?: number;
  dataAnoLetivo?: number;
  mediaFinal?: number;
  numeroFaltasBimestre?: number;
  situacao?: string;
}

export interface DisciplineReportCard {
  disciplineId: number;
  name: string;
  abbreviation?: string;
  termGrades: {
    1: number | string | null;
    2: number | string | null;
    3: number | string | null;
    4: number | string | null;
  };
  termAbsences: {
    1: number | null;
    2: number | null;
    3: number | null;
    4: number | null;
  };
  finalGrade?: number | string | null;
  totalAbsences?: number;
  attendanceRate?: number;
  status?: string;
  closings?: FechamentoItem[];
}

export interface ReportCardModel {
  studentName: string;
  ra: string;
  schoolName: string;
  classDescription: string;
  classroom?: string;
  year: number;
  disciplines: DisciplineReportCard[];
  overallAttendanceRate?: number;
  totalOverallAbsences?: number;
}

export interface AvisoTurmaItem {
  codigoMuralAviso: number;
  perfilAviso?: number;
  titulo: string;
  conteudo: string;
  conteudoCustomizado?: string;
  listaCodigoTurma?: number[];
  dataInicio?: string;
  dataFim?: string;
  fixarAviso?: boolean;
  nomeUsuarioCadastro?: string;
  dataCadastro?: string;
  ativo?: boolean;
  lido?: boolean;
}

export interface NotificacaoCmspItem {
  idNotificacaoUsuario: number;
  idNotificacao?: string;
  idUsuario?: number;
  titulo: string;
  subtitulo?: string;
  mensagem?: string;
  mensagemCustomizavel?: string;
  statusLeitura?: boolean;
  urlImagem?: string | null;
  dtInclusao: string;
}

export interface MessageModel {
  id: string | number;
  type: 'notice' | 'notification';
  title: string;
  body: string;
  author?: string;
  date: string;
  isPinned?: boolean;
  isRead?: boolean;
  imageUrl?: string | null;
  raw?: any;
}

// Backward compatibility alias
export interface TaskItem extends Partial<TaskModel> {
  question_id?: string | number;
  apply_moment?: string;
  room_for_apply?: string;
  answer_status?: string;
}

export interface AvisoItem {
  id?: string | number;
  titulo?: string;
  descricao?: string;
  conteudo?: string;
  dataCriacao?: string;
  nomeEscola?: string;
}
