/**
 * SHUZIRO ASTRAL - PROXY TUNNEL LOCAL COM GOT-SCRAPING & GOT (HTTP/1.1 & HTTP/2)
 * ==============================================================================
 * Roteamento residencial para evitar bloqueios 403 / WAF da SED / EduSP / CMSP.
 * 
 * COMO USAR COM CLOUDFLARE TUNNEL (cloudflared):
 * ------------------------------------------------------------------------------
 * 1. Instalar dependências se necessário:
 *    npm install got-scraping got
 * 
 * 2. Iniciar o proxy local na porta 4000:
 *    node local-proxy.js
 *    (Ou com PM2: pm2 start local-proxy.js --name "shuziro-proxy")
 * 
 * 3. Gerar um túnel HTTPS público com o Cloudflare Tunnel:
 *    Opção A (Túnel Rápido Gratuito sem conta):
 *       cloudflared tunnel --url http://localhost:4000
 *       -> Copie a URL HTTPS gerada (ex: https://xxxx-xxxx.trycloudflare.com)
 *          e cole no campo de Túnel nas Configurações do Shuziro Astral!
 * 
 *    Opção B (Zero Trust Named Tunnel):
 *       cloudflared tunnel run --token SEU_TOKEN_CLOUDFLARE
 * ==============================================================================
 */

import http from 'node:http';
import { URL } from 'node:url';
import { gotScraping } from 'got-scraping';
import got from 'got';
import { HeaderGenerator } from 'header-generator';
import { CookieJar } from 'tough-cookie';
import pRetry from 'p-retry';
import { ProxyAgent } from 'proxy-agent';

const PORT = Number(process.env.PORT) || 4000;
const DEFAULT_TARGET_BASE = 'https://edusp-api.ip.tv';

const cookieJar = new CookieJar();
const headerGenerator = new HeaderGenerator({
    browsers: [
        { name: 'chrome', minVersion: 120 },
        { name: 'edge', minVersion: 120 },
        { name: 'firefox', minVersion: 120 }
    ],
    devices: ['desktop'],
    locales: ['pt-BR', 'pt', 'en-US'],
    operatingSystems: ['windows', 'linux', 'macos']
});

// Proxy Agent para caso o usuário utilize proxy residencial externo (SOCKS5/HTTP)
const customProxyUrl = process.env.UPSTREAM_PROXY || process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
const upstreamProxyAgent = customProxyUrl ? new ProxyAgent({ getProxyForUrl: () => customProxyUrl }) : undefined;

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
    'Access-Control-Max-Age': '86400',
};

// Armazenamento de sessão de verificação anti-bot e fingerprint do navegador do usuário
let activeClientSession = {
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    platform: 'Win32',
    language: 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    cookies: '',
    lastSync: Date.now()
};

const server = http.createServer(async (req, res) => {
    // Resposta rápida a preflight CORS
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    try {
        const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

        // Health check / Status do túnel
        if (reqUrl.pathname === '/ping' || reqUrl.pathname === '/health' || reqUrl.pathname === '/') {
            res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                status: 'ok',
                online: true,
                service: 'ShuziroAstral Local Cloudflare Tunnel Proxy (Got-Scraping + Got HTTP/1.1)',
                clientSessionSynced: Boolean(activeClientSession.lastSync),
                port: PORT,
                timestamp: new Date().toISOString()
            }));
            return;
        }

        // Endpoint de Sincronização e Verificação de Anti-Bot
        if (reqUrl.pathname === '/api/verify-antibot' || reqUrl.pathname === '/session-sync') {
            const bodyChunks = [];
            req.on('data', chunk => bodyChunks.push(chunk));
            req.on('end', () => {
                try {
                    const data = JSON.parse(Buffer.concat(bodyChunks).toString('utf-8') || '{}');
                    if (data.userAgent) activeClientSession.userAgent = data.userAgent;
                    if (data.platform) activeClientSession.platform = data.platform;
                    if (data.language) activeClientSession.language = data.language;
                    if (data.cookies) activeClientSession.cookies = data.cookies;
                    activeClientSession.lastSync = Date.now();

                    res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({
                        ok: true,
                        message: 'Sessão do navegador e anti-bot sincronizados no Proxy com sucesso!',
                        session: {
                            userAgent: activeClientSession.userAgent,
                            lastSync: activeClientSession.lastSync
                        }
                    }));
                } catch (e) {
                    res.writeHead(400, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: false, error: 'JSON inválido para sessão' }));
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
                    timeout: { request: 5000 },
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
            } else {
                targetUrlString = `${DEFAULT_TARGET_BASE}${reqUrl.pathname}${reqUrl.search}`;
            }
        }

        const targetUrl = new URL(targetUrlString);

        // Prepara cabeçalhos limpos
        const forwardHeaders = {};
        for (const [key, value] of Object.entries(req.headers)) {
            const lKey = key.toLowerCase();
            if (['host', 'content-length', 'connection', 'cf-connecting-ip', 'cf-ray', 'cf-visitor', 'x-forwarded-for', 'x-forwarded-proto'].includes(lKey)) {
                continue;
            }
            forwardHeaders[lKey] = value;
        }

        // Garante cabeçalhos esperados pela EduSP / SED
        if (!forwardHeaders['x-api-platform']) forwardHeaders['x-api-platform'] = 'webclient';
        if (!forwardHeaders['x-api-realm']) forwardHeaders['x-api-realm'] = 'edusp';
        if (!forwardHeaders['origin']) forwardHeaders['origin'] = 'https://saladofuturo.educacao.sp.gov.br';
        if (!forwardHeaders['referer']) forwardHeaders['referer'] = 'https://saladofuturo.educacao.sp.gov.br/';
        if (!forwardHeaders['accept']) forwardHeaders['accept'] = 'application/json, text/plain, */*';
        if (!forwardHeaders['accept-language']) forwardHeaders['accept-language'] = activeClientSession.language;

        // Se houver cookies sincronizados da sessão
        if (!forwardHeaders['cookie'] && activeClientSession.cookies) {
            forwardHeaders['cookie'] = activeClientSession.cookies;
        }

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

            const isJson = parsedBody && typeof parsedBody === 'object';
            const isString = parsedBody && typeof parsedBody === 'string';

            // 1. Tenta primeira execução com gotScraping (Emulação TLS de Chrome Desktop)
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
                        browsers: [{ name: 'chrome', minVersion: 120 }, { name: 'edge', minVersion: 120 }],
                        devices: ['desktop'],
                        locales: ['pt-BR', 'pt', 'en-US'],
                        operatingSystems: ['windows', 'linux', 'macos']
                    }
                });

                // Se teve sucesso ou resposta válida da aplicação (mesmo erro de credencial 401/400)
                if (response.statusCode !== 403) {
                    const resHeaders = { ...CORS_HEADERS };
                    if (response.headers['content-type']) resHeaders['content-type'] = response.headers['content-type'];
                    if (response.headers['x-api-key']) resHeaders['x-api-key'] = response.headers['x-api-key'];

                    res.writeHead(response.statusCode, resHeaders);
                    res.end(response.body);
                    return;
                }

                console.warn(`[Proxy Got-Scraping] Status 403 recebido de ${targetUrl.pathname}. Tentando fallback com Got HTTP/1.1...`);
            } catch (scrapingErr) {
                console.warn(`[Proxy Got-Scraping] Falha: ${scrapingErr.message}. Ativando fallback Got HTTP/1.1...`);
            }

            // 2. Fallback: Got com HTTP/1.1 puro e User-Agent sincronizado do navegador
            try {
                const gotHeaders = {
                    ...forwardHeaders,
                    'user-agent': activeClientSession.userAgent,
                    'sec-ch-ua': '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'cross-site'
                };

                const fallbackRes = await got(targetUrl.toString(), {
                    method: req.method.toUpperCase(),
                    headers: gotHeaders,
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
    console.log(`   Compatível com Cloudflare Tunnel (cloudflared) & Got-Scraping`);
    console.log(`   Comando Cloudflared: cloudflared tunnel --url http://localhost:${PORT}`);
    console.log(`======================================================\n`);
});

