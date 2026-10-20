import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { createAdminClient } from '@supabase/server/core';

const databasePath = resolve(process.env.DATABASE_PATH || 'server/data/rcs_employee_dev.sqlite');
const database = new DatabaseSync(databasePath, { readOnly: true });

function bytea(value) {
  return `\\x${Buffer.from(value).toString('hex')}`;
}

async function main() {
  const admin = createAdminClient();
  const companies = database.prepare('SELECT slug, name, active FROM companies').all();
  const accounts = database.prepare(
    `SELECT id, company_slug, username, display_name, employee_type,
            password_salt, password_hash, active, created_at
     FROM employee_accounts ORDER BY id`
  ).all();

  if (companies.length === 0 || accounts.length === 0) {
    throw new Error('The local SQLite database has no companies or employee accounts to import.');
  }

  const { error: companyError } = await admin.from('companies').upsert(
    companies.map((company) => ({ ...company, active: Boolean(company.active) })),
    { onConflict: 'slug' },
  );
  if (companyError) throw companyError;

  let imported = 0;
  for (const account of accounts) {
    const { data: existing, error: lookupError } = await admin
      .from('employee_accounts')
      .select('id')
      .ilike('username', account.username)
      .maybeSingle();
    if (lookupError) throw lookupError;

    const values = {
      company_slug: account.company_slug,
      username: account.username,
      display_name: account.display_name,
      employee_type: account.employee_type,
      password_salt: bytea(account.password_salt),
      password_hash: bytea(account.password_hash),
      active: Boolean(account.active),
    };
    const result = existing
      ? await admin.from('employee_accounts').update(values).eq('id', existing.id)
      : await admin.from('employee_accounts').insert(values);
    if (result.error) throw result.error;
    imported += 1;
  }

  console.log(`Imported ${companies.length} companies and ${imported} employee accounts.`);
  console.log('Existing app sessions and AsyncStorage application records were not imported.');
}

try {
  await main();
} finally {
  database.close();
}
