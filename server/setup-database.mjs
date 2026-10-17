import { randomBytes } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { companies, employeeTypes, hashPassword } from './auth-shared.mjs';

const databasePath = resolve(process.env.DATABASE_PATH || 'server/data/rcs_employee_dev.sqlite');
await mkdir(dirname(databasePath), { recursive: true });

const database = new DatabaseSync(databasePath);
try {
  database.exec(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  const saveCompany = database.prepare(
    'INSERT INTO companies (slug, name) VALUES (?, ?) ON CONFLICT (slug) DO UPDATE SET name = excluded.name'
  );
  for (const company of companies) saveCompany.run(company.slug, company.name);

  const companySlug = process.env.AUTH_TEST_COMPANY || companies[0].slug;
  const employeeType = process.env.AUTH_TEST_EMPLOYEE_TYPE || 'employee';
  const username = (process.env.AUTH_TEST_USERNAME || 'demo').trim();
  const displayName = process.env.AUTH_TEST_DISPLAY_NAME || 'Demo Employee';
  if (!companies.some((company) => company.slug === companySlug)) throw new Error('AUTH_TEST_COMPANY is not a known company slug.');
  if (!employeeTypes.includes(employeeType)) throw new Error('AUTH_TEST_EMPLOYEE_TYPE must be employee, merchandiser, guard, or subcontractor.');
  if (!username) throw new Error('AUTH_TEST_USERNAME cannot be empty.');

  const generatedPassword = !process.env.AUTH_TEST_PASSWORD;
  const password = process.env.AUTH_TEST_PASSWORD || randomBytes(20).toString('base64url');
  if (password.length < 12) throw new Error('AUTH_TEST_PASSWORD must be at least 12 characters.');
  const { salt, hash } = await hashPassword(password);
  database.prepare(
    `INSERT INTO employee_accounts (company_slug, username, display_name, employee_type, password_salt, password_hash)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT (company_slug, username) DO UPDATE SET
       display_name = excluded.display_name, employee_type = excluded.employee_type,
       password_salt = excluded.password_salt, password_hash = excluded.password_hash, active = 1`
  ).run(companySlug, username, displayName, employeeType, salt, hash);

  console.log(`SQLite database ready at ${databasePath}. Local test account: ${username} (${companySlug}, ${employeeType}).`);
  if (generatedPassword) console.log(`Generated test password (shown once): ${password}`);
} finally {
  database.close();
}
