import { randomBytes } from 'node:crypto';

import { authenticateRequest } from '../_lib/auth';
import { badRequest, endpoint, jsonResponse, readJson } from '../_lib/http';
import { getAdminClient } from '../_lib/supabase';

function toApplication(row: any) {
  return {
    id: row.id,
    type: row.type,
    summary: row.summary,
    submittedAt: row.submitted_at,
    status: row.status,
    cancellationReason: row.cancellation_reason ?? undefined,
    details: Array.isArray(row.details) ? row.details : [],
  };
}

export const GET = endpoint(async (request) => {
  const authenticated = await authenticateRequest(request);
  if (!authenticated) return jsonResponse(request, 401, { error: 'Sign in required.' });

  const { data, error } = await getAdminClient()
    .from('applications')
    .select('id, type, summary, submitted_at, status, cancellation_reason, details')
    .eq('account_id', authenticated.account.id)
    .order('submitted_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return jsonResponse(request, 200, { applications: (data ?? []).map(toApplication) });
});

export const POST = endpoint(async (request) => {
  const authenticated = await authenticateRequest(request);
  if (!authenticated) return jsonResponse(request, 401, { error: 'Sign in required.' });

  const body = await readJson(request);
  const type = typeof body.type === 'string' ? body.type.trim() : '';
  const values = body.values;
  if (!type || type.length > 100 || !values || typeof values !== 'object' || Array.isArray(values)) return badRequest(request);

  const details = Object.entries(values as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim().length > 0)
    .map(([label, value]) => ({
      label: label.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase()).slice(0, 100),
      value: (value === 'true' ? 'Yes' : value).slice(0, 2000),
    }));
  if (details.length > 100) return badRequest(request);

  const summaryParts = details.slice(0, 2).map((detail) => detail.value);
  const row = {
    id: `RCS-${randomBytes(8).toString('hex').toUpperCase()}`,
    account_id: authenticated.account.id,
    type,
    summary: `${type} request${summaryParts.length ? ` · ${summaryParts.join(' · ')}` : ''}`.slice(0, 500),
    status: 'Pending',
    details,
  };
  const { data, error } = await getAdminClient()
    .from('applications')
    .insert(row)
    .select('id, type, summary, submitted_at, status, cancellation_reason, details')
    .single();
  if (error) throw error;
  return jsonResponse(request, 201, { application: toApplication(data) });
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
