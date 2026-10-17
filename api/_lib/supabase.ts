import { createAdminClient } from '@supabase/server/core';

let adminClient: any;

export function getAdminClient(): any {
  adminClient ??= createAdminClient() as any;
  return adminClient;
}
