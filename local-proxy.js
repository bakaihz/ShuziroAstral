/**
 * SERVIDOR DE TÚNEL LOCAL (LOCAL PROXY TUNNEL COM GOT-SCRAPING)
 * -------------------------------------------------------------
 * 1. Instalar dependência se necessário:
 *    npm install got-scraping
 * 
 * 2. Rodar o proxy local com PM2:
 *    pm2 start local-proxy.js --name "local-proxy"
 * 
 * 3. Rodar o Cloudflare Zero Trust Tunnel com seu token:
 *    pm2 start cloudflared --name "cf-tunnel" -- tunnel run --token SEU_TOKEN_CLOUDFLARE
 */

import http from 'node:http';
import { URL } from 'node:url';
import { gotScraping } from 'got-scraping';

const PORT = process.env.PORT || 4000;
const TARGET_BASE_URL = 'https://edusp-api.ip.tv';

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Expose-Headers': '*',
    'Access-Control-Max-Age': '86400',
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
        res.writeHead(204, CORS_HEADERS);
        res.end();
        return;
    }

    try {
        const reqUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        
        if (reqUrl.pathname === '/ping' || reqUrl.pathname === '/health' || reqUrl.pathname === '/') {
            res.writeHead(200, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', service: 'ShuziroAstral Local Tunnel Proxy (Got-Scraping)' }));
            return;
        }

        let targetUrlString = reqUrl.searchParams.get('url');
        if (!targetUrlString) {
            targetUrlString = `${TARGET_BASE_URL}${reqUrl.pathname}${reqUrl.search}`;
        }

        const targetUrl = new URL(targetUrlString);

        // Prepara headers repassando x-* e autenticação, ignorando host/content-length para recomputar no Got
        const forwardHeaders = {};
        for (const [key, value] of Object.entries(req.headers)) {
            const lKey = key.toLowerCase();
            if (['host', 'content-length', 'connection', 'user-agent'].includes(lKey)) continue;
            forwardHeaders[lKey] = value;
        }

        if (!forwardHeaders['x-api-platform']) forwardHeaders['x-api-platform'] = 'webclient';
        if (!forwardHeaders['x-api-realm']) forwardHeaders['x-api-realm'] = 'edusp';
        forwardHeaders['origin'] = 'https://saladofuturo.educacao.sp.gov.br';
        forwardHeaders['referer'] = 'https://saladofuturo.educacao.sp.gov.br/';

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

            try {
                const isJson = parsedBody && typeof parsedBody === 'object';
                const isString = parsedBody && typeof parsedBody === 'string';

                const response = await gotScraping({
                    url: targetUrl.toString(),
                    method: req.method.toUpperCase(),
                    headers: forwardHeaders,
                    json: isJson ? parsedBody : undefined,
                    body: isString ? parsedBody : undefined,
                    timeout: { request: 12000 },
                    throwHttpErrors: false,
                    retry: { limit: 1 },
                    http2: true,
                    useHeaderGenerator: true,
                    headerGeneratorOptions: {
                        browsers: [{ name: 'chrome', minVersion: 120 }, { name: 'edge', minVersion: 120 }],
                        devices: ['desktop'],
                        locales: ['pt-BR', 'pt'],
                        operatingSystems: ['windows', 'linux', 'macos']
                    }
                });

                const resHeaders = { ...CORS_HEADERS };
                if (response.headers['content-type']) {
                    resHeaders['content-type'] = response.headers['content-type'];
                }

                res.writeHead(response.statusCode, resHeaders);
                res.end(response.body);
            } catch (gotErr) {
                res.writeHead(502, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: true, message: 'Erro ao executar requisição no Got-Scraping: ' + gotErr.message }));
            }
        });
    } catch (err) {
        res.writeHead(500, { ...CORS_HEADERS, 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: true, message: 'Erro interno no proxy local: ' + err.message }));
    }
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Servidor de Túnel Local (Got-Scraping) Ativo na Porta ${PORT}`);
    console.log(`======================================================\n`);
});
