import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

export const scrypt = promisify(scryptCallback);
export const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const companies = [
  { slug: 'rcs-eastern-intertrade', name: 'RCS Eastern Intertrade Corp.', demoUsername: 'demo', demoDisplayName: 'Mia Santos' },
  { slug: 'brilliant-distribution', name: 'Brilliant Distribution System', demoUsername: 'demo-brilliant', demoDisplayName: 'Rafael Cruz' },
  { slug: 'tlz-eastland-realty', name: 'TLZ Eastland Realty', demoUsername: 'demo-tlz', demoDisplayName: 'Bianca Reyes' },
  { slug: 'friendship-supermarket', name: 'Friendship Supermarket Inc.', demoUsername: 'demo-fsi', demoDisplayName: 'Paolo Garcia' },
  { slug: 'metro-federal-steel', name: 'Metro Federal Steel Corp.', demoUsername: 'demo-mfsc', demoDisplayName: 'Leah Mendoza' },
  { slug: 'core-gateway-colleges', name: 'Core Gateway Colleges Inc.', demoUsername: 'demo-cgci', demoDisplayName: 'Marco Lim' },
  { slug: 'sweetpack-foods', name: 'Sweetpack Foods', demoUsername: 'demo-spf', demoDisplayName: 'Nina Flores' },
];

export const employeeTypes = ['employee', 'merchandiser', 'guard', 'subcontractor'];

export async function hashPassword(password, salt = randomBytes(16)) {
  const hash = await scrypt(password, salt, 64, scryptOptions);
  return { salt, hash };
}
