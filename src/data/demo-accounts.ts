import type { AuthUser, EmployeeType } from '@/contexts/auth-context';
import companyAccountTypes from './company-account-types.json';

export type DemoAccount = {
  username: string;
  displayName: string;
  label: string;
  employeeType: EmployeeType;
  companySlug: string;
  companyName: string;
  user: AuthUser;
};

export const DEMO_PASSWORD = 'demo1234';

const validEmployeeTypes: EmployeeType[] = ['employee', 'merchandiser', 'guard', 'subcontractor'];

function isEmployeeType(value: string): value is EmployeeType {
  return validEmployeeTypes.some((employeeType) => employeeType === value);
}

export const demoAccounts: DemoAccount[] = companyAccountTypes.flatMap((company) =>
  company.accountTypes.map((account) => {
    if (!isEmployeeType(account.employeeType)) throw new Error(`Unknown employee type: ${account.employeeType}.`);
    const user: AuthUser = {
      id: `${company.slug}-${account.employeeType}`,
      username: account.username,
      displayName: account.displayName,
      employeeType: account.employeeType,
      company: { slug: company.slug, name: company.name },
    };
    return {
      username: account.username,
      displayName: account.displayName,
      label: account.label,
      employeeType: account.employeeType,
      companySlug: company.slug,
      companyName: company.name,
      user,
    };
  })
);

export const demoCompanies = companyAccountTypes.map((company) => ({
  slug: company.slug,
  name: company.name,
  accounts: demoAccounts.filter((account) => account.companySlug === company.slug),
}));
