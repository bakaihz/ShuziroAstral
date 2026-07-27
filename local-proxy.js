/**
 * SERVIDOR DE TÚNEL LOCAL (LOCAL PROXY TUNNEL - OTIMIZADO)
 * --------------------------------------------------------
 * Como usar:
 * 1. Execute localmente no PC ou Termux:
 *    node local-proxy.js
 * 
 * 2. Em outro terminal, exponha a porta 4000 para a internet:
 *    npx localtunnel --port 4000
 *    (ou ngrok http 4000)
 */

const http = require('http');
const https = require('https');
const url = require('url');

const PORT = process.env.PORT || 4000;
const TARGET_HOST = 'edusp-api.ip.tv';

const server = http.createServer((req, res) => {
    // CORS total
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);

    // Endpoint de teste rápido
    if (parsedUrl.pathname === '/ping' || parsedUrl.pathname === '/health' || parsedUrl.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'ShuziroAstral Local Tunnel Proxy' }));
        return;
    }

    let destPath = parsedUrl.path;
    let destHost = TARGET_HOST;

    if (parsedUrl.query && parsedUrl.query.url) {
        try {
            const targetParsed = new url.URL(parsedUrl.query.url);
            destHost = targetParsed.host;
            destPath = targetParsed.pathname + targetParsed.search;
        } catch (e) {
            // Se falhar o parse de url customizada, mantém destino padrão
        }
    }

    const reqHeaders = { ...req.headers };
    delete reqHeaders.host;
    delete reqHeaders.connection;

    reqHeaders['host'] = destHost;
    reqHeaders['origin'] = 'https://saladofuturo.educacao.sp.gov.br';
    reqHeaders['referer'] = 'https://saladofuturo.educacao.sp.gov.br/';

    if (!reqHeaders['user-agent']) {
        reqHeaders['user-agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
    }

    const options = {
        hostname: destHost,
        port: 443,
        path: destPath,
        method: req.method,
        headers: reqHeaders
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: true, message: 'Erro no Túnel Local: ' + err.message }));
    });

    req.pipe(proxyReq, { end: true });
});

server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Servidor de Túnel Local Ativo na Porta ${PORT}`);
    console.log(`Para expor para a internet, use: npx localtunnel --port ${PORT}`);
    console.log(`======================================================\n`);
});
