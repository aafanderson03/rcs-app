import { randomBytes, scrypt as scryptCallback } from 'node:crypto';
import { promisify } from 'node:util';

export const scrypt = promisify(scryptCallback);
export const scryptOptions = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };

export const companies = [
  { slug: 'rcs-eastern-intertrade', name: 'RCS Eastern Intertrade Corp.' },
  { slug: 'brilliant-distribution', name: 'Brilliant Distribution System' },
  { slug: 'tlz-eastland-realty', name: 'TLZ Eastland Realty' },
  { slug: 'friendship-supermarket', name: 'Friendship Supermarket Inc.' },
  { slug: 'metro-federal-steel', name: 'Metro Federal Steel Corp.' },
  { slug: 'core-gateway-colleges', name: 'Core Gateway Colleges Inc.' },
  { slug: 'sweetpack-foods', name: 'Sweetpack Foods' },
];

export const employeeTypes = ['employee', 'merchandiser', 'guard', 'subcontractor'];

export async function hashPassword(password, salt = randomBytes(16)) {
  const hash = await scrypt(password, salt, 64, scryptOptions);
  return { salt, hash };
}
