import { signOut } from '../_lib/auth.js';
import { endpoint, jsonResponse } from '../_lib/http.js';

export const POST = endpoint(async (request) => {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (token && token.length <= 256) await signOut(token);
  return jsonResponse(request, 200, { ok: true });
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
