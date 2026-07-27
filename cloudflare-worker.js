/**
 * CLOUDFLARE WORKER PROXY (OPTIMIZED REVERSE PROXY)
 * ----------------------------------------------------------------
 * Como usar no Cloudflare Workers:
 * 1. Acesse https://dash.cloudflare.com/ -> Workers & Pages -> Create Worker
 * 2. Cole este código no editor do Worker e clique em "Save and Deploy".
 * 3. (Opcional) Associe seu domínio em Worker -> Settings -> Triggers -> Custom Domains
 */

const TARGET_HOST = 'https://edusp-api.ip.tv';

export default {
  async fetch(request, env, ctx) {
    // 1. Tratamento Preflight CORS (OPTIONS)
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

      // Resposta instantânea de status/ping
      if (url.pathname === '/ping' || url.pathname === '/health' || url.pathname === '/') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            service: 'ShuziroAstral Worker Proxy',
            target: TARGET_HOST,
            timestamp: new Date().toISOString(),
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json; charset=utf-8',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            },
          }
        );
      }

      // Constroi a URL de destino direta
      let targetUrl = `${TARGET_HOST}${url.pathname}${url.search}`;
      
      // Se enviado parâmetro ?url=, dá suporte a redirecionamento dinâmico
      const customUrl = url.searchParams.get('url');
      if (customUrl) {
        targetUrl = customUrl;
      }

      const targetParsed = new URL(targetUrl);

      // Clona e limpa os headers
      const newHeaders = new Headers(request.headers);
      
      // Ajusta cabeçalhos essenciais para o servidor de destino
      newHeaders.set('Host', targetParsed.host);
      newHeaders.set('Origin', 'https://saladofuturo.educacao.sp.gov.br');
      newHeaders.set('Referer', 'https://saladofuturo.educacao.sp.gov.br/');

      // Remove headers de proxy do Cloudflare para evitar repasse indesejado
      newHeaders.delete('cf-connecting-ip');
      newHeaders.delete('cf-ipcountry');
      newHeaders.delete('cf-ray');
      newHeaders.delete('cf-visitor');

      // User-Agent limpo
      const userAgent = request.headers.get('x-client-user-agent') || request.headers.get('user-agent');
      if (userAgent) {
        newHeaders.set('User-Agent', userAgent);
      } else {
        newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36');
      }

      // Prepara as opções de busca
      const fetchOpts = {
        method: request.method,
        headers: newHeaders,
        redirect: 'follow',
      };

      if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
        fetchOpts.body = await request.arrayBuffer();
      }

      const response = await fetch(targetUrl, fetchOpts);

      // Adiciona headers CORS na resposta
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('Access-Control-Allow-Origin', '*');
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', '*');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: true,
          message: 'Erro no Worker Proxy: ' + (err.message || String(err)),
        }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
