/**
 * SHUZIRO ASTRAL - PROXY TUNNEL RESIDENCIAL & CHROMIUM EXTRACTION ENGINE
 * ==============================================================================
 * Roteamento residencial de alto desempenho com emulação de fingerprint TLS 
 * do Google Chromium (Chrome 126+), bypass de WAF/Cloudflare e suporte completo
 * a todas as plataformas: EduSP, CMSP, Sala do Futuro, Matific, Alura e Me Salva.
 * 
 * COMO USAR COM CLOUDFLARE TUNNEL (cloudflared):
 * ------------------------------------------------------------------------------
 * 1. Instalar dependências se necessário:
 *    npm install got-scraping got header-generator tough-cookie proxy-agent
 * 
 * 2. Iniciar o proxy local na porta 4000:
 *    node local-proxy.js
 *    (Ou com PM2: pm2 start local-proxy.js --name "shuziro-proxy")
 * 
 * 3. Gerar um túnel HTTPS público com o Cloudflare Tunnel:
 *    cloudflared tunnel --url http://localhost:4000
 *    -> Copie a URL HTTPS gerada (ex: https://xxxx-xxxx.trycloudflare.com)
 *       e cole no campo de Túnel nas Configurações do Shuziro Astral!
 * ==============================================================================
 */

import http from 'node:http';
import { URL } from 'node:url';
import { gotScraping } from 'got-scraping';
import got from 'got';
import { HeaderGenerator } from 'header-generator';
import { CookieJar } from 'tough-cookie';
import { ProxyAgent } from 'proxy-agent';

const PORT = Number(process.env.PORT) || 4000;
const DEFAULT_TARGET_BASE = 'https://edusp-api.ip.tv';

const cookieJar = new CookieJar();
const headerGenerator = new HeaderGenerator({
    browsers: [
        { name: 'chrome', minVersion: 120, maxVersion: 130 },
        { name: 'edge', minVersion: 120, maxVersion: 130 }
    ],
    devices: ['desktop'],
    locales: ['pt-BR', 'pt', 'en-US', 'en'],
    operatingSystems: ['windows', 'linux', 'macos']
});

// Proxy Agent para caso o usuário utilize proxy residencial externo (SOCKS5/HTTP)
const customProxyUrl = process.env.UPSTREAM_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const upstreamProxyAgent = customProxyUrl ? new ProxyAgent({ getProxyForUrl: () => customProxyUrl }) : undefined;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
    'Access-Control-Max-Age': '86400',
};

// Armazenamento de sessão de verificação anti-bot e fingerprint Chromium extraído
let activeClientSession = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    platform: 'Win32',
    language: 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    secChUa: '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"',
    secChUaMobile: '?0',
    secChUaPlatform: '"Windows"',
    cookies: '',
    lastSync: Date.now()
};

// Helper para detectar plataforma de destino e configurar headers específicos
function getTargetPlatformMeta(targetUrlString) {
    const lower = targetUrlString.toLowerCase();
    if (lower.includes('matific.com')) {
        return {
            platform: 'matific',
            origin: 'https://www.matific.com',
            referer: 'https://www.matific.com/bra/pt-br/login-page/',
            realm: 'matific'
        };
    }
    if (lower.includes('alura.com.br')) {
        return {
            platform: 'alura',
            origin: 'https://cursos.alura.com.br',
            referer: 'https://cursos.alura.com.br/',
            realm: 'alura'
        };
    }
    if (lower.includes('mesalva.com')) {
        return {
            platform: 'mesalva',
            origin: 'https://www.mesalva.com',
            referer: 'https://www.mesalva.com/',
            realm: 'mesalva'
        };
    }
    if (lower.includes('sedintegracoes.educacao.sp.gov.br') || lower.includes('saladofuturo')) {
        return {
            platform: 'sed',
            origin: 'https://saladofuturo.educacao.sp.gov.br',
            referer: 'https://saladofuturo.educacao.sp.gov.br/',
            realm: 'sed'
        };
    }
    return {
        platform: 'edusp',
        origin: 'https://saladofuturo.educacao.sp.gov.br',
        referer: 'https://saladofuturo.educacao.sp.gov.br/',
        realm: 'edusp'
    };
}

const server = http.createServer(async (req, res) => {
    // Resposta rápida a preflight CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    try {
        const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        // Health check / Status do túnel e do Chromium Engine
        if (reqUrl.pathname === '/ping' || reqUrl.pathname === '/health' || reqUrl.pathname === '/') {
            res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                status: 'ok',
                online: true,
                service: 'ShuziroAstral Local Cloudflare Tunnel Proxy (Chromium Engine + Got-Scraping TLS)',
                clientSessionSynced: Boolean(activeClientSession.lastSync),
                chromium: {
                    userAgent: activeClientSession.userAgent,
                    secChUa: activeClientSession.secChUa,
                    platform: activeClientSession.secChUaPlatform
                },
                supportedPlatforms: ['EduSP', 'CMSP', 'Sala do Futuro', 'Matific', 'Alura', 'Me Salva'],
                port: PORT,
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // Endpoint de Sincronização e Extração de Fingerprint do Navegador Chromium
        if (reqUrl.pathname === '/api/verify-antibot' || reqUrl.pathname === '/session-sync') {
            const bodyChunks = [];
            req.on('data', chunk => bodyChunks.push(chunk));
            req.on('end', () => {
                try {
                    const data = JSON.parse(Buffer.concat(bodyChunks).toString('utf-8') || '{}');
                    if (data.userAgent) activeClientSession.userAgent = data.userAgent;
                    if (data.platform) {
                        activeClientSession.platform = data.platform;
                        activeClientSession.secChUaPlatform = data.platform.toLowerCase().includes('win') ? '"Windows"' :
                            data.platform.toLowerCase().includes('android') ? '"Android"' :
                            data.platform.toLowerCase().includes('mac') ? '"macOS"' : '"Linux"';
                    }
                    if (data.language) activeClientSession.language = data.language;
                    if (data.secChUa) activeClientSession.secChUa = data.secChUa;
                    if (data.cookies) activeClientSession.cookies = data.cookies;
                    activeClientSession.lastSync = Date.now();

                    console.log(`[Proxy Chromium] Fingerprint sincronizado com sucesso! (${activeClientSession.userAgent.substring(0, 50)}...)`);

                    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        ok: true,
                        message: 'Sessão Chromium e anti-bot sincronizados no Proxy com sucesso!',
                        session: {
                            userAgent: activeClientSession.userAgent,
                            secChUa: activeClientSession.secChUa,
                            lastSync: activeClientSession.lastSync
                        }
                    }));
                } catch (e) {
                    res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'JSON inválido para sessão Chromium' }));
                }
            });
            return;
        }

        // Endpoint de Diagnóstico de Teste direto com a SED
        if (reqUrl.pathname === '/test-sed') {
            try {
                const testRes = await gotScraping({
                    url: 'https://saladofuturo.educacao.sp.gov.br/',
                    method: 'GET',
                    timeout: { request: 6000 },
                    throwHttpErrors: false
                });
                res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    status: testRes.statusCode,
                    isProtected: testRes.statusCode === 403,
                    message: testRes.statusCode === 200 ? 'Conexão com a SED limpa e sem bloqueios!' : `Resposta HTTP ${testRes.statusCode}`
                }));
            } catch (err) {
                res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
            return;
        }

        // Determinação da URL de destino
        let targetUrlString = reqUrl.searchParams.get('url') || req.headers['x-target-url'] || req.headers['x-proxy-url'];
        
        if (!targetUrlString) {
            // Se for endpoint da SED BFF
            if (reqUrl.pathname.startsWith('/saladofuturobffapi') || reqUrl.pathname.startsWith('/credenciais') || reqUrl.pathname.startsWith('/apiboletim')) {
                targetUrlString = `https://sedintegracoes.educacao.sp.gov.br${reqUrl.pathname}${reqUrl.search}`;
            } else if (reqUrl.pathname.startsWith('/matific/') || reqUrl.pathname.startsWith('/api/matific/')) {
                const matificSubPath = reqUrl.pathname.replace(/^\/api\/matific\//, '').replace(/^\/matific\//, '');
                targetUrlString = `https://www.matific.com/${matificSubPath}${reqUrl.search}`;
            } else if (reqUrl.pathname.startsWith('/alura/') || reqUrl.pathname.startsWith('/api/alura/')) {
                const aluraSubPath = reqUrl.pathname.replace(/^\/api\/alura\//, '').replace(/^\/alura\//, '');
                targetUrlString = `https://cursos.alura.com.br/${aluraSubPath}${reqUrl.search}`;
            } else {
                let cleanEduspPath = reqUrl.pathname.replace(/^\/api\//, '');
                targetUrlString = `${DEFAULT_TARGET_BASE}/${cleanEduspPath.replace(/^\/+/, '')}${reqUrl.search}`;
            }
        }

        const targetUrl = new URL(targetUrlString);
        const platformMeta = getTargetPlatformMeta(targetUrl.toString());

        // Prepara cabeçalhos limpos
        const forwardHeaders = {};
        for (const [key, value] of Object.entries(req.headers)) {
            const lKey = key.toLowerCase();
            if (['host', 'content-length', 'connection', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-forwarded-proto'].includes(lKey)) {
                continue;
            }
            forwardHeaders[lKey] = value;
        }

        // Garante cabeçalhos e fingerprints esperados pela EduSP / SED / Matific / Alura
        if (!forwardHeaders['x-api-platform']) forwardHeaders['x-api-platform'] = 'webclient';
        if (!forwardHeaders['x-api-realm']) forwardHeaders['x-api-realm'] = platformMeta.realm;
        if (!forwardHeaders['origin']) forwardHeaders['origin'] = platformMeta.origin;
        if (!forwardHeaders['referer']) forwardHeaders['referer'] = platformMeta.referer;
        if (!forwardHeaders['accept']) forwardHeaders['accept'] = 'application/json, text/plain, */*';
        if (!forwardHeaders['accept-language']) forwardHeaders['accept-language'] = activeClientSession.language;

        // Se houver cookies sincronizados da sessão
        if (!forwardHeaders['cookie'] && activeClientSession.cookies) {
            forwardHeaders['cookie'] = activeClientSession.cookies;
        }

        // Headers Chromium essenciais
        forwardHeaders['user-agent'] = activeClientSession.userAgent;
        forwardHeaders['sec-ch-ua'] = activeClientSession.secChUa;
        forwardHeaders['sec-ch-ua-mobile'] = activeClientSession.secChUaMobile;
        forwardHeaders['sec-ch-ua-platform'] = activeClientSession.secChUaPlatform;
        forwardHeaders['sec-fetch-dest'] = 'empty';
        forwardHeaders['sec-fetch-mode'] = 'cors';
        forwardHeaders['sec-fetch-site'] = 'cross-site';

        const bodyChunks = [];
        req.on('data', chunk => bodyChunks.push(chunk));
        req.on('end', async () => {
            const bodyBuffer = Buffer.concat(bodyChunks);
            let parsedBody = undefined;

            if (bodyBuffer.length > 0) {
                try {
                    parsedBody = JSON.parse(bodyBuffer.toString('utf-8'));
                } catch {
                    parsedBody = bodyBuffer.toString('utf-8');
                }
            }

            // Normalização de requisições de CAPTCHA
            const isCaptchaRequest = targetUrl.pathname.includes('/captcha');
            if (isCaptchaRequest) {
                forwardHeaders['content-type'] = 'application/json';
                forwardHeaders['x-api-realm'] = 'edusp';
                forwardHeaders['x-api-platform'] = 'webclient';

                if (targetUrl.pathname.includes('/verify') && parsedBody && typeof parsedBody === 'object') {
                    // Garante formato canônico esperado pelo endpoint /captcha/verify
                    if (!parsedBody.realm) parsedBody.realm = 'edusp';
                    if (!parsedBody.type) parsedBody.type = 'image';
                    if (parsedBody.payload && parsedBody.payload.answer) {
                        parsedBody.payload.answer = String(parsedBody.payload.answer).trim().toUpperCase();
                    }
                }
            }

            const isJson = parsedBody && typeof parsedBody === 'object';
            const isString = parsedBody && typeof parsedBody === 'string';

            if (isJson) {
                forwardHeaders['content-type'] = 'application/json';
            }

            // 1. Execução primária com gotScraping (Emulação TLS de Chrome Desktop)
            try {
                const response = await gotScraping({
                    url: targetUrl.toString(),
                    method: req.method.toUpperCase(),
                    headers: forwardHeaders,
                    json: isJson ? parsedBody : undefined,
                    body: isString ? parsedBody : undefined,
                    timeout: { request: 12000 },
                    throwHttpErrors: false,
                    retry: { limit: 1 },
                    useHeaderGenerator: true,
                    headerGeneratorOptions: {
                        browsers: [{ name: 'chrome', minVersion: 120, maxVersion: 130 }, { name: 'edge', minVersion: 120, maxVersion: 130 }],
                        devices: ['desktop'],
                        locales: ['pt-BR', 'pt', 'en-US'],
                        operatingSystems: ['windows', 'linux', 'macos']
                    }
                });

                // Se teve resposta válida (inclusive erro de CAPTCHA 400/401/422 onde a mensagem de erro deve ser repassada)
                if (response.statusCode !== 403 || isCaptchaRequest) {
                    const resHeaders = { ...CORS_HEADERS };
                    if (response.headers['content-type']) resHeaders['content-type'] = response.headers['content-type'];
                    if (response.headers['x-api-key']) resHeaders['x-api-key'] = response.headers['x-api-key'];

                    res.writeHead(response.statusCode, resHeaders);
                    res.end(response.body);
                    return;
                }

                console.warn(`[Proxy Got-Scraping] Status 403 recebido de ${targetUrl.pathname}. Tentando fallback Got HTTP/1.1...`);
            } catch (scrapingErr) {
                console.warn(`[Proxy Got-Scraping] Falha: ${scrapingErr.message}. Ativando fallback Got HTTP/1.1...`);
            }

            // 2. Fallback: Got com HTTP/1.1 puro e headers Chromium
            try {
                const fallbackRes = await got(targetUrl.toString(), {
                    method: req.method.toUpperCase(),
                    headers: forwardHeaders,
                    json: isJson ? parsedBody : undefined,
                    body: isString ? parsedBody : undefined,
                    http2: false, // Força HTTP/1.1 para contornar inspeções de frame HTTP/2 da CDN
                    timeout: { request: 12000 },
                    throwHttpErrors: false,
                    retry: { limit: 0 }
                });

                const resHeaders = { ...CORS_HEADERS };
                if (fallbackRes.headers['content-type']) resHeaders['content-type'] = fallbackRes.headers['content-type'];

                res.writeHead(fallbackRes.statusCode, resHeaders);
                res.end(fallbackRes.body);
            } catch (fallbackErr) {
                res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    error: true,
                    message: `Erro ao executar requisição no proxy: ${fallbackErr.message}`
                }));
            }
        });
    } catch (err) {
        res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: true, message: 'Erro interno no proxy local: ' + err.message }));
    }
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Shuziro Astral - Proxy Residencial Ativo na Porta ${PORT}`);
    console.log(`   Chromium Engine + Got-Scraping TLS (Matific, Alura, EduSP)`);
    console.log(`   Comando Cloudflared: cloudflared tunnel --url http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});

