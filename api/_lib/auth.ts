import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

import { getAdminClient } from './supabase';

const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

function derivePasswordHash(password: string, salt: Buffer, keyLength: number) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keyLength, scryptOptions, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export type AuthenticatedAccount = {
  id: string;
  username: string;
  displayName: string;
  employeeType: 'employee' | 'merchandiser' | 'guard' | 'subcontractor';
  company: { slug: string; name: string };
};

function tokenHash(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function byteaBuffer(value: unknown): Buffer {
  if (Buffer.isBuffer(value)) return value;
  if (typeof value === 'string' && /^\\x(?:[0-9a-f]{2})+$/i.test(value)) return Buffer.from(value.slice(2), 'hex');
  throw new Error('Stored credential has an invalid format.');
}

export function toAccount(row: any, company: { slug: string; name: string }): AuthenticatedAccount {
  return {
    id: String(row.id),
    username: row.username,
    displayName: row.display_name,
    employeeType: row.employee_type,
    company,
  };
}

export async function authenticateRequest(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token || token.length > 256) return null;

  const admin = getAdminClient();
  const { data: session, error: sessionError } = await admin
    .from('auth_sessions')
    .select('account_id')
    .eq('token_hash', tokenHash(token))
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  if (sessionError) throw sessionError;
  if (!session) return null;

  const { data: account, error: accountError } = await admin
    .from('employee_accounts')
    .select('id, username, display_name, employee_type, company_slug, active')
    .eq('id', session.account_id)
    .eq('active', true)
    .maybeSingle();
  if (accountError) throw accountError;
  if (!account) return null;

  const { data: company, error: companyError } = await admin
    .from('companies')
    .select('slug, name')
    .eq('slug', account.company_slug)
    .eq('active', true)
    .maybeSingle();
  if (companyError) throw companyError;
  if (!company) return null;

  return { token, account: toAccount(account, company) };
}

export async function signIn(username: string, password: string) {
  const admin = getAdminClient();
  const { data: account, error: accountError } = await admin
    .from('employee_accounts')
    .select('id, username, display_name, employee_type, company_slug, password_salt, password_hash')
    .ilike('username', username)
    .eq('active', true)
    .maybeSingle();
  if (accountError) throw accountError;
  if (!account) return null;

  const { data: company, error: companyError } = await admin
    .from('companies')
    .select('slug, name')
    .eq('slug', account.company_slug)
    .eq('active', true)
    .maybeSingle();
  if (companyError) throw companyError;
  if (!company) return null;

  const salt = byteaBuffer(account.password_salt);
  const expectedHash = byteaBuffer(account.password_hash);
  const candidate = await derivePasswordHash(password, salt, expectedHash.length);
  if (candidate.length !== expectedHash.length || !timingSafeEqual(candidate, expectedHash)) return null;

  const token = randomBytes(32).toString('base64url');
  const { error: insertError } = await admin.from('auth_sessions').insert({
    token_hash: tokenHash(token),
    account_id: account.id,
    expires_at: new Date(Date.now() + sessionLifetimeMs).toISOString(),
  });
  if (insertError) throw insertError;

  return { token, user: toAccount(account, company) };
}

export async function signOut(token: string) {
  const admin = getAdminClient();
  const { error } = await admin.from('auth_sessions').delete().eq('token_hash', tokenHash(token));
  if (error) throw error;
}
