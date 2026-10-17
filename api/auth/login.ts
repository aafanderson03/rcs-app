import { badRequest, endpoint, jsonResponse, readJson } from '../_lib/http';
import { signIn } from '../_lib/auth';

export const POST = endpoint(async (request) => {
  const body = await readJson(request);
  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[a-z0-9._-]{1,64}$/i.test(username) || password.length < 1 || password.length > 256) {
    return badRequest(request);
  }

  const result = await signIn(username, password);
  if (!result) return jsonResponse(request, 401, { error: 'We could not sign you in with those details.' });
  return jsonResponse(request, 200, result);
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
