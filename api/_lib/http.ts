type ApiHandler = (request: Request) => Promise<Response>;

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin) return { allowed: true, origin: null };

  const requestOrigin = new URL(request.url).origin;
  const configured = (process.env.AUTH_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const localDevelopmentOrigins = [
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:8082',
  ];

  return {
    allowed: origin === requestOrigin || configured.includes(origin) || localDevelopmentOrigins.includes(origin),
    origin,
  };
}

export function jsonResponse(request: Request, status: number, payload: unknown) {
  const { origin } = allowedOrigin(request);
  const headers = new Headers({
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    vary: 'Origin',
  });
  if (origin) {
    headers.set('access-control-allow-origin', origin);
    headers.set('access-control-allow-headers', 'authorization, content-type');
    headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

export function endpoint(handler: ApiHandler): ApiHandler {
  return async (request) => {
    const { allowed, origin } = allowedOrigin(request);
    if (!allowed) return jsonResponse(request, 403, { error: 'Origin is not allowed.' });
    if (request.method === 'OPTIONS') {
      const headers = new Headers({ 'cache-control': 'no-store', vary: 'Origin' });
      if (origin) {
        headers.set('access-control-allow-origin', origin);
        headers.set('access-control-allow-headers', 'authorization, content-type');
        headers.set('access-control-allow-methods', 'GET, POST, OPTIONS');
      }
      return new Response(null, { status: 204, headers });
    }
    try {
      return await handler(request);
    } catch (error) {
      console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error');
      return jsonResponse(request, 500, { error: 'The service could not complete the request.' });
    }
  };
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (text.length > 16_384) throw new Error('Request body is too large.');
  const body: unknown = JSON.parse(text || '{}');
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid request body.');
  return body as Record<string, unknown>;
}

export function badRequest(request: Request, message = 'Invalid request.') {
  return jsonResponse(request, 400, { error: message });
}
