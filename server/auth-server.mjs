import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

const databasePath = resolve(process.env.DATABASE_PATH || 'server/data/rcs_employee_dev.sqlite');
await mkdir(dirname(databasePath), { recursive: true });
const database = new DatabaseSync(databasePath);
database.exec(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));

const allowedOrigins = new Set((process.env.AUTH_ALLOWED_ORIGINS || 'http://localhost:8081,http://127.0.0.1:8081,http://localhost:8082').split(',').map((origin) => origin.trim()));
const failures = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

function isAllowedOrigin(origin, requestHost) {
  if (!origin || allowedOrigins.has(origin)) return true;

  try {
    const originUrl = new URL(origin);
    const serverHost = new URL(`http://${requestHost}`).hostname;
    return originUrl.protocol === 'http:' && originUrl.hostname === serverHost;
  } catch {
    return false;
  }
}

function send(response, status, data, origin) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': origin || 'null',
    'access-control-allow-headers': 'authorization, content-type',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    vary: 'Origin',
  });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 8192) throw new Error('Request body is too large.');
  }
  return JSON.parse(body || '{}');
}

function accountPayload(row) {
  return {
    id: String(row.id),
    username: row.username,
    displayName: row.display_name,
    employeeType: row.employee_type,
    company: { slug: row.company_slug, name: row.company_name },
  };
}

function getToken(request) {
  const authorization = request.headers.authorization || '';
  return authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
}

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

const findActiveAccount = database.prepare(
  `SELECT a.id, a.username, a.display_name, a.employee_type, a.password_salt, a.password_hash,
          a.company_slug, c.name AS company_name
   FROM employee_accounts a JOIN companies c ON c.slug = a.company_slug
   WHERE LOWER(a.username) = LOWER(?) AND a.active = 1 AND c.active = 1`
);
const addSession = database.prepare('INSERT INTO auth_sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)');
const findSessionUser = database.prepare(
  `SELECT a.id, a.username, a.display_name, a.employee_type, a.company_slug, c.name AS company_name
   FROM auth_sessions s JOIN employee_accounts a ON a.id = s.account_id
   JOIN companies c ON c.slug = a.company_slug
   WHERE s.token_hash = ? AND s.expires_at > ? AND a.active = 1 AND c.active = 1`
);
const deleteSession = database.prepare('DELETE FROM auth_sessions WHERE token_hash = ?');

const server = createServer(async (request, response) => {
  const origin = request.headers.origin || '';
  const originIsAllowed = isAllowedOrigin(origin, request.headers.host || '');
  if (request.method === 'OPTIONS') {
    if (!originIsAllowed) return send(response, 403, { error: 'Origin is not allowed.' }, 'null');
    response.writeHead(204, { 'access-control-allow-origin': origin || 'null', 'access-control-allow-headers': 'authorization, content-type', 'access-control-allow-methods': 'GET, POST, OPTIONS', vary: 'Origin' });
    return response.end();
  }
  if (!originIsAllowed) return send(response, 403, { error: 'Origin is not allowed.' }, 'null');

  const url = new URL(request.url || '/', 'http://localhost');
  try {
    if (request.method === 'GET' && url.pathname === '/healthz') return send(response, 200, { ok: true }, origin);

    if (request.method === 'POST' && url.pathname === '/api/auth/login') {
      const ip = request.socket.remoteAddress || 'unknown';
      const now = Date.now();
      const attempt = failures.get(ip);
      if (attempt && now - attempt.startedAt < 60_000 && attempt.count >= 10) return send(response, 429, { error: 'Too many sign-in attempts. Try again in a minute.' }, origin);
      const body = await readBody(request);
      const username = typeof body.username === 'string' ? body.username.trim() : '';
      const password = typeof body.password === 'string' ? body.password : '';
      const account = username ? findActiveAccount.get(username) : undefined;
      let matches = false;
      if (account && password) {
        const candidate = await scrypt(password, account.password_salt, account.password_hash.length, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
        matches = candidate.length === account.password_hash.length && timingSafeEqual(candidate, account.password_hash);
      }
      if (!matches) {
        failures.set(ip, attempt && now - attempt.startedAt < 60_000 ? { startedAt: attempt.startedAt, count: attempt.count + 1 } : { startedAt: now, count: 1 });
        return send(response, 401, { error: 'We could not sign you in with those details.' }, origin);
      }
      failures.delete(ip);
      const token = randomBytes(32).toString('base64url');
      addSession.run(tokenHash(token), account.id, now + sessionLifetimeMs);
      return send(response, 200, { token, user: accountPayload(account) }, origin);
    }

    if (request.method === 'GET' && url.pathname === '/api/auth/me') {
      const token = getToken(request);
      if (!token) return send(response, 401, { error: 'Sign in required.' }, origin);
      const row = findSessionUser.get(tokenHash(token), Date.now());
      if (!row) return send(response, 401, { error: 'Session expired. Please sign in again.' }, origin);
      return send(response, 200, { user: accountPayload(row) }, origin);
    }

    if (request.method === 'POST' && url.pathname === '/api/auth/logout') {
      const token = getToken(request);
      if (token) deleteSession.run(tokenHash(token));
      return send(response, 200, { ok: true }, origin);
    }

    return send(response, 404, { error: 'Not found.' }, origin);
  } catch (error) {
    const status = error instanceof SyntaxError || error.message === 'Request body is too large.' ? 400 : 500;
    if (status === 500) console.error('Authentication service request failed:', error.message);
    return send(response, status, { error: status === 400 ? 'Invalid request.' : 'Authentication service error.' }, origin);
  }
});

const host = process.env.AUTH_HOST || '0.0.0.0';
const port = Number(process.env.AUTH_PORT || 4100);
server.listen(port, host, () => console.log(`Local auth service listening on http://${host}:${port}`));

function closeServer() {
  server.close(() => {
    database.close();
    process.exit(0);
  });
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
