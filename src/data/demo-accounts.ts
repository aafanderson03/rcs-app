import type { AuthUser } from '@/contexts/auth-context';

export type DemoAccount = {
  username: string;
  displayName: string;
  companyLabel: string;
  user: AuthUser;
};

export const DEMO_PASSWORD = 'demo1234';

export const demoAccounts: DemoAccount[] = [
  {
    username: 'demo',
    displayName: 'Mia Santos',
    companyLabel: 'RCS',
    user: { id: 'demo-rcs', username: 'demo', displayName: 'Mia Santos', employeeType: 'employee', company: { slug: 'rcs-eastern-intertrade', name: 'RCS Eastern Intertrade Corp.' } },
  },
  {
    username: 'demo-brilliant',
    displayName: 'Rafael Cruz',
    companyLabel: 'Brilliant',
    user: { id: 'demo-brilliant', username: 'demo-brilliant', displayName: 'Rafael Cruz', employeeType: 'employee', company: { slug: 'brilliant-distribution', name: 'Brilliant Distribution System' } },
  },
  {
    username: 'demo-tlz',
    displayName: 'Bianca Reyes',
    companyLabel: 'TLZ',
    user: { id: 'demo-tlz', username: 'demo-tlz', displayName: 'Bianca Reyes', employeeType: 'employee', company: { slug: 'tlz-eastland-realty', name: 'TLZ Eastland Realty' } },
  },
  {
    username: 'demo-fsi',
    displayName: 'Paolo Garcia',
    companyLabel: 'Friendship',
    user: { id: 'demo-fsi', username: 'demo-fsi', displayName: 'Paolo Garcia', employeeType: 'employee', company: { slug: 'friendship-supermarket', name: 'Friendship Supermarket Inc.' } },
  },
  {
    username: 'demo-mfsc',
    displayName: 'Leah Mendoza',
    companyLabel: 'Metro Federal Steel',
    user: { id: 'demo-mfsc', username: 'demo-mfsc', displayName: 'Leah Mendoza', employeeType: 'employee', company: { slug: 'metro-federal-steel', name: 'Metro Federal Steel Corp.' } },
  },
  {
    username: 'demo-cgci',
    displayName: 'Marco Lim',
    companyLabel: 'Core Gateway Colleges',
    user: { id: 'demo-cgci', username: 'demo-cgci', displayName: 'Marco Lim', employeeType: 'employee', company: { slug: 'core-gateway-colleges', name: 'Core Gateway Colleges Inc.' } },
  },
  {
    username: 'demo-spf',
    displayName: 'Nina Flores',
    companyLabel: 'Sweetpack Foods',
    user: { id: 'demo-spf', username: 'demo-spf', displayName: 'Nina Flores', employeeType: 'employee', company: { slug: 'sweetpack-foods', name: 'Sweetpack Foods' } },
  },
];
