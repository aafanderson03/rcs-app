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


export function resolveIdentity(displayName?: string): EmployeeIdentity {
  const nameParts = displayName?.trim().split(/\s+/).filter(Boolean);
  const first = nameParts?.[0] ?? demoEmployee.firstName;
  const last = nameParts && nameParts.length > 1 ? nameParts[nameParts.length - 1] : demoEmployee.lastName;
  const middle = nameParts && nameParts.length > 2
    ? nameParts.slice(1, -1).join(' ')
    : '';
  const upper = (value: string) => value.toUpperCase();

  return {
    firstName: upper(first),
    middleName: upper(middle),
    lastName: upper(last),
    fullName: upper([first, middle, last].filter(Boolean).join(' ')),
    listName: upper(`${last} , ${first}${middle ? ` ${middle.charAt(0)}.` : ''}`),
    employeeCode: demoEmployee.employeeCode,
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
        { label: 'Location', value: demoEmployee.location },
        { label: 'Employee Category', value: demoEmployee.employeeCategory },
        { label: 'Rank', value: demoEmployee.rank },
        { label: 'Designation', value: demoEmployee.designation.toUpperCase() },
        { label: 'Job Level', value: demoEmployee.jobLevel },
        { label: 'Tax Status', value: demoEmployee.taxStatus.toUpperCase() },
        { label: 'Department', value: demoEmployee.department.toUpperCase() },
        { label: 'Division', value: demoEmployee.division },
        { label: 'Branch', value: demoEmployee.store.toUpperCase() },
        { label: 'Section', value: demoEmployee.section },
        { label: 'Unit', value: demoEmployee.section },
        { label: 'Area', value: demoEmployee.location },
        { label: 'Group', value: demoEmployee.employeeCategory },
        { label: 'Base Site', value: demoEmployee.designation.toUpperCase() },
        { label: 'Designation Desired', value: '' },
        { label: 'Pay Location', value: demoEmployee.baseOffice },
        { label: 'Timekeep Group', value: demoEmployee.baseOffice },
        { label: 'Salary Classification', value: demoEmployee.salaryClassification },
        { label: 'Pag-Ibig Code', value: demoEmployee.pagIbigCode },
        { label: 'Project Code', value: demoEmployee.projectCode },
        { label: 'Date Applied', value: demoEmployee.dateApplied },
        { label: 'Date Hired', value: demoEmployee.dateHired },
        { label: 'Probationary Date', value: demoEmployee.probationaryDate },
        { label: 'Date Regularized', value: demoEmployee.dateRegularized },
        { label: 'Date Separated', value: '-' },
        { label: 'End of Contract', value: demoEmployee.endOfContract },
        { label: 'Basic Salary', value: demoEmployee.basicSalary },
        { label: 'Starting Salary', value: demoEmployee.startingSalary },
        { label: 'Member Id No.', value: demoEmployee.memberIdNumber },
        { label: 'PERAA Id No.', value: demoEmployee.peraaIdNumber },
        { label: 'Bank Code', value: demoEmployee.bankCode },
        { label: 'Bank Account Type', value: demoEmployee.bankAccountType },
        { label: 'ATM Account No.', value: demoEmployee.atmAccountNumber },
      ],
    },
    {
      kind: 'flags',
      columns: 3,
      fields: [
        { label: 'Salary On Hold', value: demoEmployee.employmentFlags.salaryOnHold },
        { label: 'Salary for Check', value: demoEmployee.employmentFlags.salaryForCheck },
        { label: 'Is Contractual', value: demoEmployee.employmentFlags.isContractual },
        { label: 'Inactive Device', value: demoEmployee.employmentFlags.inactiveDevice },
        { label: 'Allowed to Login', value: demoEmployee.employmentFlags.allowedToLogin },
      ],
    },
    {
      kind: 'flags',
      title: 'Exemption Flags',
      columns: 2,
      fields: [
        { label: 'TAX', value: demoEmployee.employmentFlags.tax },
        { label: 'HRIS Status', value: demoEmployee.employmentFlags.hrisStatus },
        { label: 'SSS', value: demoEmployee.employmentFlags.sss },
        { label: 'Payroll Status', value: demoEmployee.employmentFlags.payrollStatus },
        { label: 'PhilHealth', value: demoEmployee.employmentFlags.philHealth },
        { label: 'TKS Status', value: demoEmployee.employmentFlags.tksStatus },
        { label: '13th Month Pay', value: demoEmployee.employmentFlags.thirteenthMonth },
        { label: 'Union Member', value: demoEmployee.employmentFlags.unionMember },
        { label: 'Pag-Ibig', value: demoEmployee.employmentFlags.pagIbig },
        { label: 'Agency', value: demoEmployee.employmentFlags.agency },
        { label: 'Completion Bonus', value: demoEmployee.employmentFlags.completionBonus },
        { label: 'Confidential', value: demoEmployee.employmentFlags.confidential },
        { label: 'Incentive Leave', value: demoEmployee.employmentFlags.incentiveLeave },
        { label: 'Provident Fund', value: demoEmployee.employmentFlags.providentFund },
      ],
    },
    {
      kind: 'table',
      title: 'Tax Status History',
      columns: ['Year', 'Tax Code'],
      rows: [],
      emptyText: 'No data available in table',
    },
    { kind: 'text', title: 'Remarks', text: demoEmployee.employmentRemarks },
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
