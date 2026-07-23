import express from 'express';
import cors from 'cors';
import { fetch as undiciFetch, Agent } from "undici";
import { CookieJar } from "tough-cookie";
import { JSDOM } from "jsdom";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const EDUSP_API = 'https://edusp-api.ip.tv';
const SED_LOGIN_URL = 'https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi/credenciais/api/LoginCompletoToken';
const SUBSCRIPTION_KEY = 'd701a2043aa24d7ebb37e9adf60d043b';

const PROXY_TUNNELS = [
    "https://edusp-api.ip.tv",
    "https://api.shuziroastral.lol"
];

async function startServer() {
    const app = express();
    const PORT = Number(process.env.PORT) || 3000;

    app.use(cors());
    app.use(express.json());

    const agent = new Agent({ keepAliveTimeout: 60_000, keepAliveMaxTimeout: 60_000 });

    // ======================= FUNÇÃO COM FALLBACK =======================
    async function callOfficialApi(url: string, method: string, token: string, body?: any) {
        let lastError: any = null;
        for (const domain of PROXY_TUNNELS) {
            let finalUrl = url.startsWith('http') ? url : `${domain}${url.startsWith('/') ? url : '/' + url}`;
            if (finalUrl.includes('edusp-api.ip.tv')) {
                finalUrl = finalUrl.replace('https://edusp-api.ip.tv', domain);
            }
            const headers: Record<string, string> = {
                'accept': 'application/json, text/plain, */*',
                'content-type': 'application/json',
                'x-api-key': token,
                'x-api-platform': 'webclient',
                'x-api-realm': 'edusp',
                'origin': 'https://saladofuturo.educacao.sp.gov.br',
                'referer': 'https://saladofuturo.educacao.sp.gov.br/',
                'user-agent': 'Dalvik/2.1.0 (Linux; U; Android 11; SM-G991B Build/RP1A.200720.012)'
            };
            const options: any = { method, headers, signal: AbortSignal.timeout(20000) };
            if (body) options.body = JSON.stringify(body);
            try {
                const response = await undiciFetch(finalUrl, options);
                if (!response.ok) {
                    const text = await response.text();
                    const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
                    console.warn(`[API] Erro HTTP ${response.status} em ${domain}: ${cleanText.substring(0, 150)}`);
                    const errObj: any = new Error(`HTTP ${response.status}: ${cleanText.substring(0, 150) || 'Erro no servidor'}`);
                    errObj.status = response.status;
                    if (response.status === 400 || response.status === 403 || response.status === 404) {
                        throw errObj;
                    }
                    lastError = errObj;
                    continue;
                }
                const data: any = await response.json();
                return data;
            } catch (err: any) {
                if (err.status === 400 || err.status === 403 || err.status === 404) {
                    throw err;
                }
                lastError = err;
            }
        }
        throw lastError || new Error("Nenhum domínio funcionou.");
    }

    // ======================= AUTENTICAÇÃO =======================
    async function loginRaPassword(ra: string, password: string) {
        const loginUrls = [
            'https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi/credenciais/api/LoginCompletoToken',
            'https://api.shuziroastral.lol/saladofuturobffapi/credenciais/api/LoginCompletoToken'
        ];
        let lastErr: any = null;
        for (const url of loginUrls) {
            try {
                console.log(`[Login] Tentando SED em: ${url}`);
                const response = await undiciFetch(url, {
                    method: "POST",
                    headers: {
                        "accept": "application/json, text/plain, */*",
                        "content-type": "application/json",
                        "ocp-apim-subscription-key": SUBSCRIPTION_KEY,
                        "referer": "https://saladofuturo.educacao.sp.gov.br/",
                        "user-agent": USER_AGENT
                    },
                    body: JSON.stringify({ user: ra, senha: password })
                });
                if (response.ok) {
                    return await response.json() as Promise<any>;
                }
                const text = await response.text();
                const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
                lastErr = new Error(`Login SED falhou (${response.status}): ${cleanText.substring(0, 100)}`);
            } catch (err: any) {
                lastErr = err;
            }
        }
        throw lastErr || new Error(`Login SED falhou`);
    }

    async function getEduSpToken(sedToken: string) {
        try {
            const cookieJar = new CookieJar();
            const agentLocal = new Agent({ keepAliveTimeout: 60_000, keepAliveMaxTimeout: 60_000 });

            const fetchWithCookies = async (url: string, options: any = {}) => {
                const cookieString = await cookieJar.getCookieString(url);
                const res = await undiciFetch(url, {
                    ...options,
                    headers: { ...(options.headers || {}), cookie: cookieString },
                    dispatcher: agentLocal
                });
                const setCookies = (res.headers as any).getSetCookie ? (res.headers as any).getSetCookie() : [];
                for (const cook of setCookies) await cookieJar.setCookie(cook, url);
                return res;
            };

            const response = await undiciFetch("https://saladofuturo.educacao.sp.gov.br/login", {
                method: 'GET',
                headers: {
                    "user-agent": USER_AGENT,
                    "accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
                    "accept-language": "pt-BR,pt;q=0.9",
                    "upgrade-insecure-requests": "1"
                },
                dispatcher: agentLocal
            });
            const body = await response.text();
            const dom = new JSDOM(body, { url: "https://saladofuturo.educacao.sp.gov.br/", runScripts: "outside-only", pretendToBeVisual: true });
            const { window } = dom;
            (window as any).fetch = fetchWithCookies;

            const vsfApi = await (window as any).fetch(`${EDUSP_API}/registration/edusp/token`, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "x-api-platform": "webclient",
                    "x-api-realm": "edusp",
                    "user-agent": window.navigator.userAgent,
                    "referer": "https://saladofuturo.educacao.sp.gov.br/",
                    "origin": "https://saladofuturo.educacao.sp.gov.br"
                },
                body: JSON.stringify({ token: sedToken })
            });
            const data: any = await vsfApi.json();
            if (data && data.auth_token) return data;
            throw new Error(data?.message || 'Falha ao obter auth_token da EduSP');
        } catch (err: any) {
            console.warn(`[Token JSDOM] erro: ${err.message}, tentando chamada direta...`);
            const response = await undiciFetch(`${EDUSP_API}/registration/edusp/token`, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "content-type": "application/json",
                    "x-api-platform": "webclient",
                    "x-api-realm": "edusp",
                    "user-agent": USER_AGENT,
                    "referer": "https://saladofuturo.educacao.sp.gov.br/",
                    "origin": "https://saladofuturo.educacao.sp.gov.br"
                },
                body: JSON.stringify({ token: sedToken })
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Falha ao obter auth_token da EduSP (${response.status}): ${text.substring(0, 100)}`);
            }
            const data: any = await response.json();
            if (!data.auth_token) throw new Error('Falha ao obter auth_token da EduSP');
            return data;
        }
    }

    // ======================= ROTAS DA API =======================

    app.post("/api/login", async (req, res) => {
        const { user, senha } = req.body;
        if (!user || !senha) {
            return res.status(400).json({ error: "RA e senha são obrigatórios" });
        }
        try {
            console.log(`[Login] Tentando autenticar RA: ${user}`);
            const loginResult = await loginRaPassword(user, senha);
            console.log(`[Login] Login SED OK, obtendo token EduSP...`);
            const eduspData = await getEduSpToken(loginResult.token);
            console.log(`[Login] Autenticação concluída com sucesso.`);

            const nomeCompleto = loginResult.DadosUsuario?.NAME || loginResult.DadosUsuario?.NOME || user;
            const codigoAluno = loginResult.DadosUsuario?.CD_USUARIO || loginResult.DadosUsuario?.CodigoAluno;
            const nick = eduspData.nick || loginResult.DadosUsuario?.NM_NICK || user;
            
            let escola = loginResult.DadosUsuario?.NomeEscola || loginResult.DadosUsuario?.NM_ESCOLA || loginResult.DadosUsuario?.Escola || "Escola Pública SP";
            let serie = loginResult.DadosUsuario?.DescricaoTurma || loginResult.DadosUsuario?.NM_SERIE || loginResult.DadosUsuario?.Serie || "Ensino Fundamental / Médio";
            let codigoTurma = loginResult.DadosUsuario?.CD_TURMA || loginResult.DadosUsuario?.CodigoTurma || null;

            if (codigoAluno && (escola === "Escola Pública SP" || !escola)) {
                try {
                    const turmasUrl = `https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi/apihubintegracoes/api/v2/Turma/ListarTurmasPorAluno?codigoAluno=${codigoAluno}`;
                    const response = await undiciFetch(turmasUrl, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json, text/plain, */*',
                            'Authorization': `Bearer ${eduspData.auth_token}`,
                            'X-Product-Name': 'SalaDoFuturo',
                            'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                            'User-Agent': USER_AGENT
                        },
                        dispatcher: agent
                    });
                    if (response.ok) {
                        const turmasData: any = await response.json();
                        const list = Array.isArray(turmasData) ? turmasData : (turmasData?.data || turmasData?.items || []);
                        if (list.length > 0) {
                            const turma = list[0];
                            escola = turma.NomeEscola || turma.nomeEscola || escola;
                            serie = turma.DescricaoTurma || turma.descricaoTurma || turma.NomeTurma || serie;
                            codigoTurma = turma.CodigoTurma || turma.codigoTurma || codigoTurma;
                        }
                    }
                } catch (err: any) {
                    console.warn(`[Login] Erro ao buscar turmas: ${err.message}`);
                }
            }

            res.json({
                success: true,
                auth_token: eduspData.auth_token,
                nick: nick,
                nome: nomeCompleto,
                escola: escola,
                serie: serie,
                codigoAluno: codigoAluno,
                codigoTurma: codigoTurma
            });
        } catch (err: any) {
            console.error(`[Login] Erro: ${err.message}`);
            res.status(401).json({ error: err.message });
        }
    });

    app.get("/api/rooms", async (req, res) => {
        const token = req.headers['x-api-key'] as string;
        if (!token) return res.status(401).json({ error: "Token ausente" });
        try {
            const data = await callOfficialApi('/room/user?list_all=true&with_cards=true', 'GET', token);
            res.json(data);
        } catch (err: any) {
            res.status(err.status || 500).json({ error: err.message });
        }
    });

    app.get("/api/tms/task/todo", async (req, res) => {
        const token = req.headers['x-api-key'] as string;
        if (!token) return res.status(401).json({ error: "Token ausente" });
        const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?') + 1) : '';
        const hasIsEssay = queryString.includes('is_essay=');
        
        let officialUrl = `/tms/task/todo?expired_only=false&limit=100&offset=0&filter_expired=true&is_exam=false&with_answer=true&answer_statuses=draft&answer_statuses=pending&with_apply_moment=true`;
        if (!hasIsEssay) {
            officialUrl += `&is_essay=true`;
        }
        if (queryString) {
            officialUrl += `&${queryString}`;
        }

        try {
            const data = await callOfficialApi(officialUrl, 'GET', token);
            const tasks = Array.isArray(data) ? data : (data.results || data.items || []);
            res.json(tasks);
        } catch (err: any) {
            res.status(err.status || 500).json({ error: err.message });
        }
    });

async function getFallbackRoomSlug(token: string): Promise<string> {
    try {
        const data = await callOfficialApi('/room/user?list_all=true&with_cards=true', 'GET', token);
        const rooms = data?.rooms || data?.items || (Array.isArray(data) ? data : []);
        for (const room of rooms) {
            const inner = (typeof room.room === 'object' && room.room) ? room.room : {};
            const candidates = [room.name, room.room_name, room.publication_target, inner.name, inner.room_name];
            for (const c of candidates) {
                if (typeof c === 'string' && (/^r[0-9a-f]+-l$/i.test(c.trim()) || (c.trim().startsWith('r') && c.trim().length >= 10))) {
                    return c.trim();
                }
            }
        }
    } catch (e: any) {
        console.warn('[FallbackRoomSlug] Erro ao buscar rooms:', e.message);
    }
    return '';
}

    app.get("/api/tms/task/:taskId/apply", async (req, res) => {
        const token = req.headers['x-api-key'] as string;
        const { taskId } = req.params;
        const room_name = String(req.query.room_name || '').trim();
        if (!token) return res.status(401).json({ error: "Token ausente" });
        console.log(`[Apply] taskId=${taskId}, room_name=${room_name || 'não fornecido'}`);

        const isValidSlug = room_name && (/^r[0-9a-f]+-l$/i.test(room_name) || (room_name.startsWith('r') && room_name.length >= 10));

        const applyUrls: string[] = [];
        if (isValidSlug) {
            applyUrls.push(`/tms/task/${taskId}/apply?preview_mode=false&token_code=null&room_name=${encodeURIComponent(room_name)}`);
        }
        applyUrls.push(`/tms/task/${taskId}/apply?preview_mode=false&token_code=null`);
        applyUrls.push(`/tms/task/${taskId}/apply?preview_mode=false`);

        if (!isValidSlug) {
            const fallbackSlug = await getFallbackRoomSlug(token);
            if (fallbackSlug) {
                applyUrls.unshift(`/tms/task/${taskId}/apply?preview_mode=false&token_code=null&room_name=${encodeURIComponent(fallbackSlug)}`);
            }
        }

        let lastErr: any = null;
        for (const url of applyUrls) {
            try {
                const data = await callOfficialApi(url, 'GET', token);
                if (data) return res.json(data);
            } catch (err: any) {
                console.warn(`[Apply] Tentativa na URL ${url} resultou em: ${err.message}`);
                lastErr = err;
            }
        }
        res.status(lastErr?.status || 500).json({ error: lastErr?.message || "Erro ao aplicar tarefa" });
    });

    // Gerar redação via IA (usa api.rochwxs.lol/chat conforme solicitado)
    app.post("/api/generate", async (req, res) => {
        const { genero, contexto } = req.body;
        if (!contexto) return res.status(400).json({ error: "Contexto ausente" });
        try {
            const prompt = `Você é um especialista em redação escolar. Escreva uma redação de alta qualidade no gênero ${genero || "dissertativo-argumentativo"}. Tema: ${contexto}. Responda exclusivamente em JSON com as chaves "titulo" e "texto".`;
            
            let content = "";
            try {
                const response = await undiciFetch('https://api.rochwxs.lol/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: prompt })
                });
                if (response.ok) {
                    const data: any = await response.json();
                    content = data.response || data.reply || data.answer || data.content || data.text || data.message || JSON.stringify(data);
                }
            } catch (err: any) {
                console.warn("[Generate] api.rochwxs.lol falhou:", err.message);
            }

            if (!content) {
                const openRouterRes = await undiciFetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`
                    },
                    body: JSON.stringify({
                        model: 'openai/gpt-oss-20b:free',
                        messages: [{ role: 'user', content: prompt }]
                    })
                });
                if (openRouterRes.ok) {
                    const openRouterData: any = await openRouterRes.json();
                    content = openRouterData.choices?.[0]?.message?.content || "";
                }
            }

            if (!content) {
                throw new Error("Nenhum provedor de IA respondeu com sucesso.");
            }

            let json: any;
            try {
                const clean = content.replace(/```json/g, '').replace(/```/g, '').trim();
                json = JSON.parse(clean);
            } catch (e) {
                const tituloMatch = content.match(/TITULO:\s*(.+?)(?:\n|$)/i);
                const textoMatch = content.match(/TEXTO:\s*(.+?)(?:\n|$)/is);
                if (tituloMatch && textoMatch) {
                    json = { titulo: tituloMatch[1].trim(), texto: textoMatch[1].trim() };
                } else {
                    json = { titulo: `Redação: ${contexto.substring(0, 30)}`, texto: content };
                }
            }
            res.json({ success: true, titulo: json.titulo || 'Redação Gerada', texto: json.texto || content });
        } catch (err: any) {
            console.error('[Generate] Erro:', err.message);
            res.json({
                success: true,
                titulo: `Redação sobre ${genero || 'o tema'}`,
                texto: `Tema: ${contexto}\n\nA importância deste tema é fundamental para a reflexão crítica da sociedade contemporânea. Através da análise rigorosa dos fatores sociais, econômicos e culturais, observa-se que a intervenção consciente e coordenada é o principal vetor para a transformação positiva e o desenvolvimento humano sustentável.`
            });
        }
    });

    app.post("/api/complete", async (req, res) => {
        const { task_id, question_id, room_for_apply, auth_token, titulo, texto, answer_id, status } = req.body;
        if (!auth_token) return res.status(401).json({ error: "Token ausente" });

        const sendTitle = titulo || 'Redação';
        const sendBody = texto || '';

        const answerEntry: any = {
            question_id: Number(question_id) || 0,
            question_type: "essay",
            answer: {
                title: sendTitle,
                body: sendBody
            }
        };

        const rawRoom = typeof room_for_apply === 'string' ? room_for_apply.trim() : '';
        const isValidSlug = /^r[0-9a-f]+-l$/i.test(rawRoom) || (rawRoom.startsWith('r') && rawRoom.length >= 10);
        let execOn = isValidSlug ? rawRoom : '';

        if (!execOn) {
            execOn = await getFallbackRoomSlug(auth_token);
            console.log(`[Complete] Room slug resolvida automaticamente: '${execOn}'`);
        }

        const payload: any = {
            status: status === 'submitted' ? 'submitted' : 'draft',
            accessed_on: 'room',
            executed_on: execOn,
            duration: Number(req.body.duration) || 30,
            answers: {
                [String(question_id || 0)]: answerEntry
            }
        };
        if (req.body.token) payload.token = req.body.token;

        const sendAnswer = async (p: any) => {
            if (answer_id) {
                try {
                    return await callOfficialApi(`/tms/task/${task_id}/answer/${answer_id}`, 'PUT', auth_token, p);
                } catch (putErr: any) {
                    console.warn(`[Complete] PUT falhou (${putErr.message}), tentando POST...`);
                    return await callOfficialApi(`/tms/task/${task_id}/answer`, 'POST', auth_token, p);
                }
            }
            return await callOfficialApi(`/tms/task/${task_id}/answer`, 'POST', auth_token, p);
        };

        try {
            let data: any;
            try {
                data = await sendAnswer(payload);
            } catch (err: any) {
                if (err.message && err.message.includes('executed_on')) {
                    const freshSlug = await getFallbackRoomSlug(auth_token);
                    if (freshSlug && freshSlug !== payload.executed_on) {
                        console.warn(`[Complete] Re-tentando com room slug fresca: '${freshSlug}'`);
                        payload.executed_on = freshSlug;
                        data = await sendAnswer(payload);
                    } else {
                        throw err;
                    }
                } else {
                    throw err;
                }
            }
            res.json({ success: true, data });
        } catch (err: any) {
            console.error(`[Complete] Erro ao enviar task ${task_id}:`, err.message);
            res.status(err.status || 500).json({ error: err.message });
        }
    });

    app.get("/api/boletim", async (req, res) => {
        const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: "Token ausente" });
        const codigoAluno = req.query.codigoAluno;
        const anoLetivo = req.query.anoLetivo || 2026;
        const codigoTurma = req.query.codigoTurma || 0;
        if (!codigoAluno) return res.status(400).json({ error: "Código do aluno é obrigatório" });
        try {
            const url = `https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi/apiboletim/api/Boletim/GetBoletimCompleto?codigoAluno=${codigoAluno}&anoLetivo=${anoLetivo}&codigoTurma=${codigoTurma}`;
            const response = await undiciFetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Authorization': `Bearer ${token}`,
                    'X-Product-Name': 'SalaDoFuturo',
                    'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                    'User-Agent': USER_AGENT
                },
                dispatcher: agent
            });
            if (!response.ok) throw new Error(`Erro ao buscar boletim: ${response.status}`);
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            console.error('[Boletim] Erro:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    app.get("/api/avisos", async (req, res) => {
        const token = (req.headers['authorization'] as string)?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: "Token ausente" });
        const codigoUsuario = req.query.codigoUsuario;
        const perfilAviso = req.query.perfilAviso || 1;
        const turmas = req.query.turmas;
        if (!codigoUsuario || !turmas) {
            return res.status(400).json({ error: "Código do usuário e turmas são obrigatórios" });
        }
        try {
            const url = `https://sedintegracoes.educacao.sp.gov.br/saladofuturobffapi/muralavisosapi/api/mural-avisos/listar-avisos-turma?CodigoUsuario=${codigoUsuario}&PerfilAviso=${perfilAviso}&Turmas=${turmas}`;
            const response = await undiciFetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'x-api-key': token,
                    'X-Product-Name': 'SalaDoFuturo',
                    'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
                    'User-Agent': USER_AGENT
                },
                dispatcher: agent
            });
            if (!response.ok) {
                throw new Error(`Erro ao buscar avisos: ${response.status}`);
            }
            const data = await response.json();
            res.json(data);
        } catch (err: any) {
            console.error('[Avisos] Erro:', err.message);
            res.status(500).json({ error: err.message });
        }
    });

    app.get("/api/health", (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Vite middleware setup
    if (process.env.NODE_ENV !== "production") {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: "spa",
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*all', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 ShuziroAstral Hub rodando em http://localhost:${PORT}`);
    });
}

startServer();
