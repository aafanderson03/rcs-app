import { authenticateRequest } from '../_lib/auth';
import { badRequest, endpoint, jsonResponse, readJson } from '../_lib/http';
import { getAdminClient } from '../_lib/supabase';

export const POST = endpoint(async (request) => {
  const authenticated = await authenticateRequest(request);
  if (!authenticated) return jsonResponse(request, 401, { error: 'Sign in required.' });

  const body = await readJson(request);
  const applicationId = typeof body.applicationId === 'string' ? body.applicationId.trim() : '';
  const reason = typeof body.reason === 'string' ? body.reason.trim() : '';
  if (!applicationId || applicationId.length > 100 || !reason || reason.length > 2000) return badRequest(request);

  const { data, error } = await getAdminClient()
    .from('applications')
    .update({ status: 'Cancelled', cancellation_reason: reason, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .eq('account_id', authenticated.account.id)
    .eq('status', 'Pending')
    .select('id, type, summary, submitted_at, status, cancellation_reason, details')
    .maybeSingle();
  if (error) throw error;
  if (!data) return jsonResponse(request, 409, { error: 'This application cannot be cancelled.' });

  return jsonResponse(request, 200, {
    application: {
      id: data.id,
      type: data.type,
      summary: data.summary,
      submittedAt: data.submitted_at,
      status: data.status,
      cancellationReason: data.cancellation_reason ?? undefined,
      details: Array.isArray(data.details) ? data.details : [],
    },
  });
});

export const OPTIONS = endpoint(async (request) => jsonResponse(request, 204, {}));
