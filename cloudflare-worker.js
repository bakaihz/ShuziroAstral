/**
 * ☁️ CLOUDFLARE WORKER — SHUZIRO TÚNEL PROXY v2.1 (Anti-502 Fix)
 * ------------------------------------------------
 * Recebe todas as requisições do ShuziroAstral Hub e
 * encaminha para a API EduSP (ou qualquer URL via ?url=)
 * sem causar erro 502 Bad Gateway.
 *
 * Deploy:
 * 1. https://dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Cole este código e clique em Save and Deploy.
 */

const TARGET_HOST = 'https://edusp-api.ip.tv';
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

export default {
  async fetch(request, env, ctx) {
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
      const url = new URL(request.url);
      const customUrl = url.searchParams.get('url');

      // ─── 2. HEALTHCHECK ───
      const isHealthCheckPath = url.pathname === '/ping' || url.pathname === '/health';
      const isEmptyRoot = url.pathname === '/' && !url.search && !customUrl;

      if (isHealthCheckPath || isEmptyRoot) {
        return jsonResponse({
          status: 'ok',
          online: true,
          worker: 'shuziro-tunnel-v2.1',
          target: TARGET_HOST,
          timestamp: new Date().toISOString(),
          cf: { colo: request.cf?.colo || 'unknown', country: request.cf?.country || 'unknown' }
        });
      }

      // ─── 3. MONTA URL DE DESTINO ───
      let targetUrl;
      if (customUrl) {
        targetUrl = customUrl;
      } else {
        targetUrl = `${TARGET_HOST}${url.pathname}${url.search}`;
      }

      const targetParsed = new URL(targetUrl);
      const isEdusp = targetParsed.host.includes('edusp-api.ip.tv') || targetParsed.host.includes('saladofuturo');
      const isAlura = targetParsed.host.includes('alura.com.br');
      const isMatific = targetParsed.host.includes('matific.com');

      // ─── 4. PREPARA HEADERS ───
      const headers = new Headers(request.headers);

      // Limpa headers restritos e do proxy de entrada para evitar conflito/502
      headers.delete('cf-connecting-ip');
      headers.delete('cf-ray');
      headers.delete('cf-visitor');
      headers.delete('cf-ipcountry');
      headers.delete('x-forwarded-for');
      headers.delete('x-forwarded-proto');
      headers.delete('host');
      headers.delete('connection');
      headers.delete('accept-encoding');
      headers.delete('content-length');

      // Define headers de navegador real
      headers.set('User-Agent', USER_AGENT);
      headers.set('Accept', 'application/json, text/plain, */*');
      headers.set('Accept-Language', 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7');
      headers.set('sec-ch-ua', '"Chromium";v="126", "Google Chrome";v="126", "Not-A.Brand";v="8"');
      headers.set('sec-ch-ua-mobile', '?0');
      headers.set('sec-ch-ua-platform', '"Windows"');
      headers.set('sec-fetch-dest', 'empty');
      headers.set('sec-fetch-mode', 'cors');
      headers.set('sec-fetch-site', 'cross-site');

      if (isEdusp) {
        headers.set('Origin', 'https://saladofuturo.educacao.sp.gov.br');
        headers.set('Referer', 'https://saladofuturo.educacao.sp.gov.br/');
        headers.set('x-api-platform', 'webclient');
        headers.set('x-api-realm', 'edusp');
      } else if (isAlura) {
        headers.set('Origin', 'https://cursos.alura.com.br');
        headers.set('Referer', 'https://cursos.alura.com.br/');
      } else if (isMatific) {
        headers.set('Origin', 'https://www.matific.com');
        headers.set('Referer', 'https://www.matific.com/bra/pt-br/login-page/');
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

      // ─── 7. PREPARA RESPOSTA (CRUCIAL PARA EVITAR ERRO 502 BAD GATEWAY) ───
      const responseHeaders = new Headers(response.headers);

      // Remove headers de compressão/tamanho da resposta original pois o Worker descompacta o body
      responseHeaders.delete('content-encoding');
      responseHeaders.delete('content-length');
      responseHeaders.delete('transfer-encoding');

      // Configura CORS total
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
        message: 'Erro no túnel Shuziro: ' + (err.message || String(err)),
        timestamp: new Date().toISOString()
      }, 500);
    }
  }
};

// Helper para respostas JSON
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

