import { demoEmployee, formatDemoDate } from '@/data/demo-data';

export type EmployeeIdentity = {
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  listName: string;
  employeeCode: string;
};

export type RecordField = { label: string; value: string };

export type RecordGroup =
  | { kind: 'fields'; title?: string; columns?: number; fields: RecordField[] }
  | { kind: 'flags'; title?: string; columns?: number; fields: RecordField[] }
  | { kind: 'table'; title: string; columns: string[]; rows: string[][]; emptyText: string }
  | { kind: 'text'; title: string; text: string };


function stableCode(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return String(((hash >>> 0) % 9000000000) + 1000000000);
}

export function resolveIdentity(
  user?: { displayName?: string; id?: string; username?: string } | null
): EmployeeIdentity {
  const raw = user?.displayName?.trim();
  let first = demoEmployee.firstName;
  let last = demoEmployee.lastName;

  if (raw) {
    if (raw.includes(',')) {

      const [lastPart, ...rest] = raw.split(',');
      last = lastPart.trim() || last;
      first = rest.join(' ').trim() || first;
    } else {

      const parts = raw.split(/\s+/);
      if (parts.length === 1) {
        first = parts[0];
      } else {
        last = parts[parts.length - 1];
        first = parts.slice(0, -1).join(' ');
      }
    }
  }

  const middle = demoEmployee.middleName;
  const upper = (value: string) => value.toUpperCase();
  const seed = user?.id || user?.username;

  return {
    firstName: upper(first),
    middleName: upper(middle),
    lastName: upper(last),
    fullName: upper(`${first} ${middle} ${last}`),
    listName: upper(`${last} , ${first} ${middle.charAt(0)}.`),
    employeeCode: seed ? stableCode(seed) : demoEmployee.employeeCode,
  };
}

const longDate = { month: 'long', day: '2-digit', year: 'numeric' } as const;

function addressFields(): RecordField[] {
  return [
    { label: 'No. and Street', value: '123 SAMPLE STREET, GATE 1' },
    { label: 'Barangay/Subdivision', value: 'DEMO SUBDIVISION, BARANGAY SAMPLE' },
    { label: 'City/Municipality', value: 'SAMPLE CITY' },
    { label: 'Province', value: 'SAMPLE PROVINCE' },
    { label: 'Zip Code', value: '0000' },
  ];
}

function ageFrom(birth: Date) {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    now.getMonth() < birth.getMonth() ||
    (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return String(age);
}

function personalInformation(identity: EmployeeIdentity): RecordGroup[] {
  const birth = new Date(1999, 2, 15);
  return [
    {
      kind: 'fields',
      columns: 6,
      fields: [
        { label: 'Employee Code', value: identity.employeeCode },
      ],
    },
    {
      kind: 'fields',
      columns: 6,
      fields: [
        { label: 'Last Name', value: identity.lastName },
        { label: 'First Name', value: identity.firstName },
        { label: 'Middle Name', value: identity.middleName },
        { label: 'Suffix', value: '' },
        { label: 'Nick Name', value: identity.firstName.split(' ')[0] },
        { label: 'Company Email', value: '' },
      ],
    },
    { kind: 'fields', title: 'Present Address', columns: 5, fields: addressFields() },
    { kind: 'fields', title: 'Provincial Address', columns: 5, fields: addressFields() },
    { kind: 'fields', title: 'Permanent Address', columns: 5, fields: addressFields() },
    {
      kind: 'fields',
      columns: 7,
      fields: [
        { label: 'Residence Type', value: '' },
        { label: 'Birth Date', value: formatDemoDate('1999-03-15', longDate) },
        { label: 'Age', value: ageFrom(birth) },
        { label: 'Place of Birth', value: 'SAMPLE CITY, SAMPLE PROVINCE' },
        { label: 'Blood Type', value: '' },
        { label: 'Email', value: demoEmployee.email },
        { label: 'Tel No.', value: demoEmployee.contactNumber },
        { label: 'Mobile No.', value: demoEmployee.contactNumber },
      ],
    },
    {
      kind: 'fields',
      columns: 6,
      fields: [
        { label: 'Height', value: '165' },
        { label: 'Weight', value: '65' },
        { label: 'Religion', value: 'ROMAN CATHOLIC' },
        { label: 'Gender', value: '' },
        { label: 'Civil Status', value: 'S' },
        { label: 'Citizenship', value: 'FIL' },
      ],
    },
    {
      kind: 'fields',
      columns: 4,
      fields: [
        { label: 'Passport No', value: '' },
        { label: 'Issue Date', value: '' },
        { label: 'Expiration', value: '' },
        { label: 'Remarks', value: '' },
      ],
    },
    {
      kind: 'fields',
      columns: 5,
      fields: [
        { label: 'TIN No', value: demoEmployee.tin },
        { label: 'Pag-Ibig No', value: demoEmployee.pagIbig },
        { label: 'PhilHealth No', value: demoEmployee.philHealth },
        { label: 'SSS No', value: demoEmployee.sss },
        { label: 'GSIS No', value: '' },
      ],
    },
    {
      kind: 'fields',
      title: 'Endorsed By',
      columns: 4,
      fields: [
        { label: 'Employee Code', value: '' },
        { label: 'Employee', value: '' },
      ],
    },
    {
      kind: 'fields',
      title: 'Emergency Contact Details',
      columns: 3,
      fields: [
        { label: 'Name', value: 'SAMPLE CONTACT' },
        { label: 'Relationship', value: 'PARENT' },
        { label: 'Tel No.', value: demoEmployee.contactNumber },
      ],
    },
    {
      kind: 'fields',
      columns: 1,
      fields: [
        {
          label: 'Address',
          value: '123 SAMPLE STREET, GATE 1, DEMO SUBDIVISION, SAMPLE CITY, SAMPLE PROVINCE, PHILIPPINES, 0000',
        },
      ],
    },
  ];
}

function employmentInformation(identity: EmployeeIdentity): RecordGroup[] {
  const headOffice = '000 DEMO HEAD OFFICE';
  return [
    {
      kind: 'fields',
      columns: 3,
      fields: [
        { label: 'Employee Code', value: identity.employeeCode },
      ],
    },
    {
      kind: 'fields',
      columns: 3,
      fields: [
        { label: 'Last Name', value: identity.lastName },
        { label: 'First Name', value: identity.firstName },
        { label: 'Middle Name', value: identity.middleName },
        { label: 'Employee Status', value: demoEmployee.employmentStatus.toUpperCase() },
        { label: 'Location', value: 'SAMPLE CITY' },
        { label: 'Employee Category', value: '80204 OPERATION' },
        { label: 'Rank', value: 'RANK AND FILE' },
        { label: 'Designation', value: demoEmployee.designation.toUpperCase() },
        { label: 'Job Level', value: 'III' },
        { label: 'Tax Status', value: '' },
        { label: 'Department', value: demoEmployee.department.toUpperCase() },
        { label: 'Division', value: '6 DEMO DIVISION' },
        { label: 'Branch', value: headOffice },
        { label: 'Section', value: '80204 OPERATION' },
        { label: 'Unit', value: '-' },
        { label: 'Area', value: '-' },
        { label: 'Group', value: '-' },
        { label: 'Base Site', value: demoEmployee.designation.toUpperCase() },
        { label: 'Designation Desired', value: '' },
        { label: 'Pay Location', value: headOffice },
        { label: 'Timekeep Group', value: headOffice },
        { label: 'Salary Classification', value: '' },
        { label: 'Pag-Ibig Code', value: 'PAG1' },
        { label: 'Project Code', value: '-' },
        { label: 'Date Applied', value: '' },
        { label: 'Date Hired', value: demoEmployee.dateHired },
        { label: 'Probationary Date', value: '' },
        { label: 'Date Regularized', value: '' },
        { label: 'Date Separated', value: '' },
        { label: 'End of Contract', value: '' },
        { label: 'Basic Salary', value: '750.00' },
        { label: 'Starting Salary', value: '0.00' },
        { label: 'Member Id No.', value: '' },
        { label: 'PERAA Id No.', value: '' },
        { label: 'Bank Code', value: 'DEMO BANK SAVINGS' },
        { label: 'Bank Account Type', value: 'SA' },
        { label: 'ATM Account No.', value: '**** 1042' },
      ],
    },
    {
      kind: 'flags',
      columns: 3,
      fields: [
        { label: 'Salary On Hold', value: 'No' },
        { label: 'Salary for Check', value: 'No' },
        { label: 'Is Contractual', value: 'No' },
        { label: 'Inactive Device', value: 'No' },
        { label: 'Allowed to Login', value: 'No' },
      ],
    },
    {
      kind: 'flags',
      title: 'Exemption Flags',
      columns: 2,
      fields: [
        { label: 'TAX', value: 'No' },
        { label: 'HRIS Status', value: 'Yes' },
        { label: 'SSS', value: 'No' },
        { label: 'Payroll Status', value: 'Yes' },
        { label: 'PhilHealth', value: 'No' },
        { label: 'TKS Status', value: 'Yes' },
        { label: '13th Month Pay', value: 'No' },
        { label: 'Union Member', value: 'No' },
        { label: 'Pag-Ibig', value: 'No' },
        { label: 'Agency', value: 'No' },
        { label: 'Completion Bonus', value: 'No' },
        { label: 'Confidential', value: 'No' },
        { label: 'Incentive Leave', value: 'No' },
        { label: 'Provident Fund', value: 'No' },
      ],
    },
    {
      kind: 'table',
      title: 'Tax Status History',
      columns: ['Year', 'Tax Code'],
      rows: [],
      emptyText: 'No data available in table',
    },
    { kind: 'text', title: 'Remarks', text: 'SAMPLE' },
  ];
}

export function getEmployeeRecordGroups(
  section: string | undefined,
  identity: EmployeeIdentity
): RecordGroup[] | null {
  if (section === 'personal-information') return personalInformation(identity);
  if (section === 'employment-information') return employmentInformation(identity);
  return null;
}
