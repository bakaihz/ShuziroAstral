/**
 * ☁️ CLOUDFLARE WORKER — SHUZIRO TÚNEL PROXY v2.0
 * ------------------------------------------------
 * Recebe todas as requisições do ShuziroAstral Hub e
 * encaminha para a API EduSP (ou qualquer URL via ?url=)
 * com headers de navegador real para evitar "Just a Moment".
 *
 * Deploy:
 * 1. https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Cole este código e salve.
 * 3. Settings → Triggers → Custom Domains → add seu domínio (ex: api.shuziroastral.lol ou api.davilucas99kk.workers.dev)
 * 4. No painel do Cloudflare, desative "Bot Fight Mode" em Security → Bots
 * 5. Em Security → WAF → Custom Rules: crie regra Skip para seu hostname.
 */

const TARGET_HOST = 'https://edusp-api.ip.tv';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ─── 1. CORS PREFLIGHT ───
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    try {
      const customUrl = url.searchParams.get('url');

      // ─── 2. HEALTHCHECK (Apenas se NÃO houver parâmetro ?url= de redirecionamento) ───
      if (!customUrl && (url.pathname === '/ping' || url.pathname === '/health' || url.pathname === '/')) {
        return jsonResponse({
          status: 'ok',
          online: true,
          worker: 'shuziro-tunnel-v2',
          target: TARGET_HOST,
          timestamp: new Date().toISOString(),
          cf: { colo: request.cf?.colo || 'unknown', country: request.cf?.country || 'unknown' }
        });
      }

      // ─── 3. MONTA URL DE DESTINO ───
      let targetUrl;

      if (customUrl) {
        // Modo proxy genérico (Alura, Matific, EduSP com query full)
        targetUrl = customUrl;
      } else {
        // Modo EduSP direto — prefixa o host
        targetUrl = `${TARGET_HOST}${url.pathname}${url.search}`;
      }

      const targetParsed = new URL(targetUrl);
      const isEdusp = targetParsed.host.includes('edusp-api.ip.tv') || targetParsed.host.includes('saladofuturo');
      const isAlura = targetParsed.host.includes('alura.com.br');

      // ─── 4. PREPARA HEADERS ───
      const headers = new Headers(request.headers);

      // Limpa headers que podem denunciar o proxy
      headers.delete('cf-connecting-ip');
      headers.delete('cf-ray');
      headers.delete('cf-visitor');
      headers.delete('x-forwarded-for');
      headers.delete('x-forwarded-proto');

      // Headers obrigatórios de navegador
      headers.set('Host', targetParsed.host);
      headers.set('User-Agent', USER_AGENT);
      headers.set('Accept', 'application/json, text/plain, */*');
      headers.set('Accept-Language', 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7');
      headers.set('Accept-Encoding', 'gzip, deflate, br');
      headers.set('sec-ch-ua', '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"');
      headers.set('sec-ch-ua-mobile', '?0');
      headers.set('sec-ch-ua-platform', '"Windows"');
      headers.set('sec-fetch-dest', 'empty');
      headers.set('sec-fetch-mode', 'cors');
      headers.set('sec-fetch-site', 'cross-site');
      headers.set('DNT', '1');
      headers.set('Connection', 'keep-alive');

      if (isEdusp) {
        headers.set('Origin', 'https://saladofuturo.educacao.sp.gov.br');
        headers.set('Referer', 'https://saladofuturo.educacao.sp.gov.br/');
        headers.set('x-api-platform', 'webclient');
        headers.set('x-api-realm', 'edusp');
      } else if (isAlura) {
        headers.set('Origin', 'https://cursos.alura.com.br');
        headers.set('Referer', 'https://cursos.alura.com.br/');
      } else {
        if (!headers.has('Origin')) headers.set('Origin', 'https://saladofuturo.educacao.sp.gov.br');
        if (!headers.has('Referer')) headers.set('Referer', 'https://saladofuturo.educacao.sp.gov.br/');
      }

      // ─── 5. PREPARA BODY ───
      const fetchOptions = {
        method: request.method,
        headers,
        redirect: 'follow',
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
        const bodyBuffer = await request.arrayBuffer();
        if (bodyBuffer && bodyBuffer.byteLength > 0) {
          fetchOptions.body = bodyBuffer;
        }
      }

      // ─── 6. EXECUTA REQUEST ───
      console.log(`[Túnel] ${request.method} → ${targetUrl}`);
      const response = await fetch(targetUrl, fetchOptions);

      // ─── 7. MONTA RESPOSTA COM CORS ───
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');
      responseHeaders.set('Access-Control-Expose-Headers', '*');

      const setCookie = responseHeaders.get('set-cookie');
      if (setCookie) {
        responseHeaders.set('x-proxy-set-cookie', setCookie);
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });

    } catch (err) {
      console.error('[Túnel] Erro:', err.message);
      return jsonResponse({
        error: true,
        message: 'Erro no túnel Shuziro: ' + (err.message || err.toString()),
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
};

// Helper pra respostas JSON
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
}
