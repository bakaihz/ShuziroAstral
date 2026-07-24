export interface UserData {
  success: boolean;
  auth_token: string;
  nick: string;
  nome: string;
  escola: string;
  serie: string;
  codigoAluno?: number | string;
  codigoTurma?: number | string;
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
  numeroPresencasBimestre: number;
  numeroFaltasBimestre: number;
  numeroFaltasCompensadas?: number;
  porcentagemPresenca: number;
  nivelPorcentagemPresenca?: number;
  bimestre?: number;
  nota?: number | string;
}

export interface BoletimItem {
  disciplina?: string;
  nomeDisciplina?: string;
  mediaFinal?: number;
  numeroFaltas?: number;
  numeroFaltasBimestre?: number;
  porcentagemPresenca?: number;
  situacao?: string;
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
