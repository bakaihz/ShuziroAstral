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

export interface BoletimItem {
  disciplina?: string;
  mediaFinal?: number;
  numeroFaltas?: number;
  situacao?: string;
}

export interface AvisoItem {
  id?: string | number;
  titulo?: string;
  descricao?: string;
  dataCriacao?: string;
  nomeEscola?: string;
}
