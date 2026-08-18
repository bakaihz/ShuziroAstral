/**
 * SDK / Módulo de Integração Oficial com a Sala do Futuro / SEDUC-SP
 * Baseado na especificação técnica e rotas oficiais (BFF Sala do Futuro / CMSP / EduSP TMS)
 */

export interface ValidarTokenResponse {
  LOGIN?: string;
  CD_USUARIO?: number;
  NOME?: string;
  PERFIS?: string[];
  statusCode?: number;
  statusRetorno?: string;
  [key: string]: any;
}

export interface BoletimDisciplina {
  alunoId?: number;
  disciplinaId?: number;
  nomeDisciplina?: string;
  notaBimestre1?: number | null;
  notaBimestre2?: number | null;
  notaBimestre3?: number | null;
  notaBimestre4?: number | null;
  mediaFinal?: number | null;
  faltasBimestreAtual?: number;
  numeroFaltasBimestre?: number;
  porcentagemPresenca?: number;
  [key: string]: any;
}

export interface FrequenciaBimestreItem {
  alunoId?: number;
  disciplinaId?: number;
  nomeDisciplina?: string;
  faltasBimestreAtual?: number;
  numeroFaltasBimestre?: number;
  porcentagemPresencaBimestreAtual?: number;
  porcentagemPresenca?: number;
  numeroPresencasBimestre?: number;
  nivelPorcentagemPresenca?: number;
  [key: string]: any;
}

export interface FaltasResumo {
  alunoId?: number;
  totalFaltasBimestre?: number;
  totalAulasRealizadas?: number;
  porcentagemFaltas?: number;
  porcentagemFrequencia?: number;
  [key: string]: any;
}

export interface AvisoItem {
  codigoMuralAviso?: number;
  perfilAviso?: number;
  titulo?: string;
  conteudo?: string;
  listaCodigoTurma?: number[];
  dataInicio?: string;
  dataFim?: string;
  fixarAviso?: boolean;
  nomeUsuarioCadastro?: string;
  dataCadastro?: string;
  ativo?: boolean;
  lido?: boolean;
  [key: string]: any;
}

export interface NotificacaoCMSPItem {
  idNotificacaoUsuario?: number;
  idNotificacao?: string;
  idUsuario?: number;
  titulo?: string;
  subtitulo?: string;
  mensagem?: string;
  mensagemCustomizavel?: string;
  statusLeitura?: boolean;
  dtInclusao?: string;
  [key: string]: any;
}

export interface CaptchaChallengeResponse {
  id?: string;
  challenge_id?: string;
  image?: string;
  blob?: string;
  realm?: string;
  [key: string]: any;
}

export interface CaptchaVerifyResponse {
  token?: string;
  captcha_token?: string;
  success?: boolean;
  [key: string]: any;
}

export class SalaDoFuturoApi {
  private baseUrl: string;
  private token: string;

  constructor(token?: string, baseUrl: string = '') {
    this.token = token || '';
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  public setToken(token: string): void {
    this.token = token;
  }

  public getToken(): string {
    return this.token;
  }

  private async fetchApi<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, any>;
    } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, params } = options;

    let fullPath = path.startsWith('/') ? path : `/${path}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          searchParams.append(k, String(v));
        }
      });
      const qs = searchParams.toString();
      if (qs) {
        fullPath += (fullPath.includes('?') ? '&' : '?') + qs;
      }
    }

    const url = `${this.baseUrl}${fullPath}`;
    const defaultHeaders: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json'
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
      defaultHeaders['x-api-key'] = this.token;
    }

    const mergedHeaders = { ...defaultHeaders, ...headers };

    const res = await fetch(url, {
      method,
      headers: mergedHeaders,
      body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined
    });

    if (!res.ok) {
      let errBody: any;
      try {
        errBody = await res.json();
      } catch {
        errBody = await res.text();
      }
      const errMsg = typeof errBody === 'object' && errBody?.error
        ? errBody.error
        : (typeof errBody === 'object' && errBody?.message ? errBody.message : `HTTP ${res.status}`);
      const error: any = new Error(`[SalaDoFuturo API] ${method} ${path} falhou: ${errMsg}`);
      error.status = res.status;
      error.data = errBody;
      throw error;
    }

    if (res.status === 204) {
      return null as any;
    }

    const text = await res.text();
    if (!text) return null as any;

    try {
      return JSON.parse(text);
    } catch {
      return text as any;
    }
  }

  // ============================================================
  // A) AUTENTICAÇÃO E VALIDAÇÃO DE TOKEN
  // ============================================================
  /**
   * Valida o token JWT na API de credenciais da SEDUC-SP
   * POST /saladofuturobffapi/credenciais/api/ValidarToken
   */
  public async validarToken(token?: string): Promise<ValidarTokenResponse> {
    const activeToken = token || this.token;
    return this.fetchApi<ValidarTokenResponse>('/api/credenciais/validar-token', {
      method: 'POST',
      body: { token: activeToken },
      headers: activeToken ? { 'Authorization': `Bearer ${activeToken}` } : {}
    });
  }

  // ============================================================
  // B) BOLETIM, FREQUÊNCIA E FALTAS
  // ============================================================
  /**
   * Consulta o boletim completo com notas bimestrais e médias
   * GET /saladofuturobffapi/apiboletim/api/Boletim/GetBoletimCompleto
   */
  public async getBoletim(codigoAluno: string | number, anoLetivo: number = 2026, codigoTurma: number = 0): Promise<any> {
    return this.fetchApi('/api/boletim', {
      method: 'GET',
      params: { codigoAluno, anoLetivo, codigoTurma }
    });
  }

  /**
   * Consulta a frequência de um determinado bimestre
   * GET /saladofuturobffapi/apiboletim/api/Frequencia/ConsultaFrequenciaBimestre
   */
  public async getFrequenciaBimestre(
    codigoAluno: string | number,
    anoLetivo: number = 2026,
    bimestre: number = 1,
    somenteAtivo: number = 0
  ): Promise<any> {
    return this.fetchApi('/api/frequencia/consulta', {
      method: 'GET',
      params: { codigoAluno, anoLetivo, bimestre, somenteAtivo }
    });
  }

  /**
   * Consulta o resumo de faltas acumuladas no bimestre atual
   * GET /saladofuturobffapi/apiboletim/api/Frequencia/GetFaltasBimestreAtual
   */
  public async getFaltasAtuais(codigoAluno: string | number): Promise<any> {
    return this.fetchApi('/api/frequencia/faltas-resumo', {
      method: 'GET',
      params: { codigoAluno }
    });
  }

  /**
   * Consulta os últimos dias de falta registrados para o aluno
   * GET /saladofuturobffapi/apiboletim/api/Frequencia/GetAlunoUltimosDiasFalta
   */
  public async getUltimosDiasFalta(codigoAluno: string | number, anoLetivo: number = 2026): Promise<any> {
    return this.fetchApi('/api/frequencia/ultimos-dias', {
      method: 'GET',
      params: { codigoAluno, anoLetivo }
    });
  }

  /**
   * Consulta a frequência completa e consolidada (GetFrequenciaBimestreAtual + GetFaltasBimestreAtual)
   */
  public async getFrequenciaGeral(codigoAluno: string | number, anoLetivo: number = 2026, bimestre: number = 1): Promise<any> {
    return this.fetchApi('/api/frequencia', {
      method: 'GET',
      params: { codigoAluno, anoLetivo, bimestre }
    });
  }

  // ============================================================
  // C) MENSAGENS, MURAL E NOTIFICAÇÕES
  // ============================================================
  /**
   * Lista os avisos do mural da turma do aluno
   * GET /saladofuturobffapi/muralavisosapi/api/mural-avisos/listar-avisos-turma
   */
  public async getAvisosTurma(
    codigoUsuario: string | number,
    codigoTurma: string | number,
    perfilAviso: number = 1
  ): Promise<AvisoItem[]> {
    const res = await this.fetchApi<any>('/api/avisos', {
      method: 'GET',
      params: {
        codigoUsuario,
        turmas: codigoTurma,
        perfilAviso
      }
    });
    return res?.data || (Array.isArray(res) ? res : []);
  }

  /**
   * Consulta as notificações recebidas via CMSP WebService
   * GET /saladofuturobffapi/cmspwebservice/api/sala-do-futuro-alunos/consulta-notificacao-cmsp
   */
  public async getNotificacoesCMSP(userId: string | number): Promise<NotificacaoCMSPItem[]> {
    const res = await this.fetchApi<any>('/api/notificacoes', {
      method: 'GET',
      params: { userId }
    });
    return Array.isArray(res) ? res : (res?.data || []);
  }

  // ============================================================
  // D) TAREFAS (FLUXO COMPLETO: LISTAGEM, ABERTURA, CAPTCHA E ENVIO DIRETO)
  // ============================================================
  /**
   * Lista as tarefas a fazer (todo) com filtros de expiração e status
   * GET /tms/task/todo & GET /tms/answer
   */
  public async listarTarefas(
    publicationTargets: string[] = [],
    nick: string = '',
    withPending: boolean = true
  ): Promise<any[]> {
    const params: Record<string, any> = {
      filter_expired: true,
      with_cards: true
    };
    if (nick) params.nick = nick;
    if (publicationTargets.length > 0) {
      params.targets = publicationTargets.join(',');
      params.publication_targets = publicationTargets.join(',');
    }
    if (withPending) params.with_pending = true;

    return this.fetchApi('/api/tms/task/todo', {
      method: 'GET',
      params
    });
  }

  /**
   * Abre a tarefa para resolução e obtém a lista de questões/gabarito
   * GET /tms/task/{taskId}/apply
   */
  public async abrirTarefa(
    taskId: string | number,
    options: {
      answerId?: string | number;
      roomName?: string;
      previewMode?: boolean;
      tokenCode?: string;
      captchaToken?: string;
    } = {}
  ): Promise<any> {
    const { answerId, roomName, previewMode = false, tokenCode, captchaToken } = options;
    const params: Record<string, any> = {
      preview_mode: previewMode
    };
    if (roomName) {
      params.room_name = roomName;
      params.publication_target = roomName;
    }
    if (answerId) params.answer_id = answerId;
    if (tokenCode) params.token_code = tokenCode;
    if (captchaToken) params.captcha_token = captchaToken;

    const headers: Record<string, string> = {};
    if (captchaToken) {
      headers['x-captcha-token'] = captchaToken;
      headers['x-captcha'] = captchaToken;
    }

    return this.fetchApi(`/api/tms/task/${taskId}/apply`, {
      method: 'GET',
      params,
      headers
    });
  }

  /**
   * Solicita um novo desafio de CAPTCHA oficial da EduSP
   * POST /captcha/challenge {"realm": "edusp"}
   */
  public async solicitarCaptcha(realm: string = 'edusp'): Promise<CaptchaChallengeResponse> {
    return this.fetchApi('/api/captcha/challenge', {
      method: 'POST',
      body: { realm }
    });
  }

  /**
   * Verifica a resposta digitada pelo usuário e obtém o token de validação
   * POST /captcha/verify
   */
  public async verificarCaptcha(
    challengeId: string,
    answer: string,
    realm: string = 'edusp'
  ): Promise<CaptchaVerifyResponse> {
    return this.fetchApi('/api/captcha/verify', {
      method: 'POST',
      body: {
        id: challengeId,
        challenge_id: challengeId,
        answer: String(answer).trim(),
        realm
      }
    });
  }

  /**
   * Envia as respostas da tarefa (com suporte a PUT /answer/{answerId} e POST /answer)
   * Corpo com status="submitted", dicionário de answers, accessed_on="room", executed_on="{roomName}"
   */
  public async enviarRespostasTarefa(
    taskId: string | number,
    options: {
      answerId?: string | number;
      answers: Record<string, any>;
      duracaoSegundos?: number;
      roomName?: string;
      captchaToken?: string;
      isEssay?: boolean;
      titulo?: string;
      texto?: string;
      status?: 'submitted' | 'draft';
    }
  ): Promise<any> {
    const {
      answerId,
      answers,
      duracaoSegundos = 30,
      roomName = 'room',
      captchaToken,
      isEssay = false,
      titulo,
      texto,
      status = 'submitted'
    } = options;

    const headers: Record<string, string> = {};
    if (captchaToken) {
      headers['x-captcha-token'] = captchaToken;
      headers['x-captcha'] = captchaToken;
    }

    const payload = {
      task_id: taskId,
      answer_id: answerId,
      answers,
      status,
      accessed_on: 'room',
      executed_on: roomName || 'room',
      duration: duracaoSegundos,
      room_for_apply: roomName,
      auth_token: this.token,
      captcha_token: captchaToken,
      is_essay: isEssay,
      titulo,
      texto
    };

    return this.fetchApi('/api/complete', {
      method: 'POST',
      body: payload,
      headers
    });
  }
}

// Instância padrão exportada
export const salaDoFuturoApi = new SalaDoFuturoApi();
