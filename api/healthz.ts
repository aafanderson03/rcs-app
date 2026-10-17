import { endpoint, jsonResponse } from './_lib/http';
import { getAdminClient } from './_lib/supabase';

export const GET = endpoint(async (request) => {
  const { error } = await getAdminClient().from('companies').select('slug').limit(1);
  if (error) throw error;
  return jsonResponse(request, 200, { ok: true });
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
