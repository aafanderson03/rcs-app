import { authenticateRequest } from '../_lib/auth.js';
import { endpoint, jsonResponse } from '../_lib/http.js';

export const GET = endpoint(async (request) => {
  const authenticated = await authenticateRequest(request);
  if (!authenticated) return jsonResponse(request, 401, { error: 'Sign in required.' });
  return jsonResponse(request, 200, { user: authenticated.account });
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
