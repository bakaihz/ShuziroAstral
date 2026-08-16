export interface UserData {
  success: boolean;
  auth_token: string;
  nick: string;
  nome: string;
  escola: string;
  serie: string;
  ra?: string;
  password?: string;
  codigoAluno?: number | string;
  codigoTurma?: number | string;
  email?: string;
  emailGoogle?: string;
  emailMs?: string;
}

export interface TaskItem {
  id?: string | number;
  task_id?: string | number;
  question_id?: string | number;
  title?: string;
  publication_target?: string;
  answer_status?: string;
  is_essay?: boolean;
  apply_moment?: string;
  room_for_apply?: string;
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

export interface AvisoItem {
  id?: string | number;
  titulo?: string;
  descricao?: string;
  conteudo?: string;
  dataCriacao?: string;
  nomeEscola?: string;
}
