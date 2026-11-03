import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';
import companyAccountTypes from '../src/data/company-account-types.json' with { type: 'json' };

export const scrypt = promisify(scryptCallback);
export const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const companies = companyAccountTypes.map(({ slug, name, demoUsername, demoDisplayName }) => ({
  slug,
  name,
  demoUsername,
  demoDisplayName,
}));

export const demoAccountProfiles = companyAccountTypes.flatMap((company) =>
  company.accountTypes.map((account) => ({
    companySlug: company.slug,
    username: account.username,
    displayName: account.displayName,
    employeeType: account.employeeType,
  }))
);

export const employeeTypes = ['employee', 'merchandiser', 'guard', 'subcontractor'];

export async function hashPassword(password, salt = randomBytes(16)) {
  const hash = await scrypt(password, salt, 64, scryptOptions);
  return { salt, hash };
}
