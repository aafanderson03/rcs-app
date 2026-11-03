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

export const rcsDemoProfileValues: Record<string, string> = {
  'Contact number': '09XX-XXX-0001 · demo only',
  'Email address': 'aaron.anderson@example.invalid',
  Address: 'Unit 4, Sample Lane, Demo District, Tarlac City, Tarlac · demo',
  Designation: 'Programmer · resume-based',
  Department: '802 Management · demo',
  'Date hired': 'October 2026 · resume month/year',
  'Tax status': 'DEMO-TAX-A',
  TIN: 'DEMO-TIN-0001',
  'SSS number': 'DEMO-SSS-0001',
  'Pag-IBIG number': 'DEMO-HDMF-0001',
  'PhilHealth number': 'DEMO-PH-0001',
  'GSIS number': 'DEMO-GSIS-0001',
};


export function resolveIdentity(
  displayName?: string,
  companySlug?: string,
  username?: string,
): EmployeeIdentity {
  if (companySlug === 'rcs-eastern-intertrade' && username === 'demo') {
    return {
      firstName: 'AARON ANTHONY',
      middleName: 'FERNANDEZ',
      lastName: 'ANDERSON',
      fullName: 'AARON ANTHONY FERNANDEZ ANDERSON',
      listName: 'ANDERSON , AARON ANTHONY F.',
      employeeCode: 'RCS-DEMO-001',
    };
  }

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

function addressFields(isRcsDemo: boolean): RecordField[] {
  if (isRcsDemo) {
    return [
      { label: 'No. and Street', value: 'Unit 4, Sample Lane · demo' },
      { label: 'Barangay/Subdivision', value: 'Demo District, Barangay Example · demo' },
      { label: 'City/Municipality', value: 'TARLAC CITY' },
      { label: 'Province', value: 'TARLAC' },
      { label: 'Zip Code', value: '0000 · demo' },
    ];
  }
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

function personalInformation(identity: EmployeeIdentity, isRcsDemo: boolean): RecordGroup[] {
  const birth = isRcsDemo ? new Date(1990, 0, 15) : new Date(1999, 2, 15);
  const personal = isRcsDemo
    ? {
        birthDate: 'January 15, 1990 · synthetic demo date',
        placeOfBirth: 'SAMPLE CITY, SAMPLE PROVINCE · demo',
        bloodType: 'O+ · synthetic demo value',
        email: 'aaron.anderson@example.invalid',
        telephone: '02-0000-0001 · demo only',
        mobile: '09XX-XXX-0001 · demo only',
        height: '170 cm · synthetic demo value',
        weight: '68 kg · synthetic demo value',
        religion: 'Sample · synthetic demo value',
        gender: 'Unspecified · synthetic demo value',
        civilStatus: 'Single · synthetic demo value',
        citizenship: 'Filipino · synthetic demo value',
        tin: 'DEMO-TIN-0001',
        pagIbig: 'DEMO-HDMF-0001',
        philHealth: 'DEMO-PH-0001',
        sss: 'DEMO-SSS-0001',
        gsis: 'DEMO-GSIS-0001',
        contactName: 'Alex Sample · synthetic demo contact',
        contactRelationship: 'Sample contact · demo',
        contactTelephone: '09XX-XXX-0002 · demo only',
        passport: 'DEMO-PASSPORT-0001',
        passportIssueDate: 'January 2020 · demo date',
        passportExpiration: 'January 2030 · demo date',
        address: 'Unit 4, Sample Lane, Demo District, Tarlac City, Tarlac · demo',
      }
    : null;
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
        { label: 'Company Email', value: personal?.email ?? '' },
      ],
    },
    { kind: 'fields', title: 'Present Address', columns: 5, fields: addressFields(isRcsDemo) },
    { kind: 'fields', title: 'Provincial Address', columns: 5, fields: addressFields(isRcsDemo) },
    { kind: 'fields', title: 'Permanent Address', columns: 5, fields: addressFields(isRcsDemo) },
    {
      kind: 'fields',
      columns: 7,
      fields: [
        { label: 'Residence Type', value: '' },
        { label: 'Birth Date', value: personal?.birthDate ?? formatDemoDate('1999-03-15', longDate) },
        { label: 'Age', value: `${ageFrom(birth)}${isRcsDemo ? ' · synthetic demo value' : ''}` },
        { label: 'Place of Birth', value: personal?.placeOfBirth ?? 'SAMPLE CITY, SAMPLE PROVINCE' },
        { label: 'Blood Type', value: personal?.bloodType ?? '' },
        { label: 'Email', value: personal?.email ?? demoEmployee.email },
        { label: 'Tel No.', value: personal?.telephone ?? demoEmployee.contactNumber },
        { label: 'Mobile No.', value: personal?.mobile ?? demoEmployee.contactNumber },
      ],
    },
    {
      kind: 'fields',
      columns: 6,
      fields: [
        { label: 'Height', value: personal?.height ?? '165' },
        { label: 'Weight', value: personal?.weight ?? '65' },
        { label: 'Religion', value: personal?.religion ?? 'ROMAN CATHOLIC' },
        { label: 'Gender', value: personal?.gender ?? '' },
        { label: 'Civil Status', value: personal?.civilStatus ?? 'S' },
        { label: 'Citizenship', value: personal?.citizenship ?? 'FIL' },
      ],
    },
    {
      kind: 'fields',
      columns: 4,
      fields: [
        { label: 'Passport No', value: personal?.passport ?? '' },
        { label: 'Issue Date', value: personal?.passportIssueDate ?? '' },
        { label: 'Expiration', value: personal?.passportExpiration ?? '' },
        { label: 'Remarks', value: isRcsDemo ? 'Synthetic demo values' : '' },
      ],
    },
    {
      kind: 'fields',
      columns: 5,
      fields: [
        { label: 'TIN No', value: personal?.tin ?? demoEmployee.tin },
        { label: 'Pag-Ibig No', value: personal?.pagIbig ?? demoEmployee.pagIbig },
        { label: 'PhilHealth No', value: personal?.philHealth ?? demoEmployee.philHealth },
        { label: 'SSS No', value: personal?.sss ?? demoEmployee.sss },
        { label: 'GSIS No', value: personal?.gsis ?? '' },
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
        { label: 'Name', value: personal?.contactName ?? 'SAMPLE CONTACT' },
        { label: 'Relationship', value: personal?.contactRelationship ?? 'PARENT' },
        { label: 'Tel No.', value: personal?.contactTelephone ?? demoEmployee.contactNumber },
      ],
    },
    {
      kind: 'fields',
      columns: 1,
      fields: [
        {
          label: 'Address',
          value: personal?.address ?? '123 SAMPLE STREET, GATE 1, DEMO SUBDIVISION, SAMPLE CITY, SAMPLE PROVINCE, PHILIPPINES, 0000',
        },
      ],
    },
  ];
}

function employmentInformation(identity: EmployeeIdentity, isRcsDemo: boolean): RecordGroup[] {
  const employment = isRcsDemo
    ? {
        status: 'CONTRACTUAL',
        location: 'TARLAC CITY',
        category: '80204 OPERATION',
        rank: 'SUPERVISORY',
        designation: 'PROGRAMMER',
        jobLevel: 'VII',
        department: '802 MANAGEMENT',
        division: '6 MANAGEMENT INFORMATION SYSTEM',
        branch: '000 RCS HEAD OFFICE',
        section: '80204 OPERATION',
      }
    : {
        status: demoEmployee.employmentStatus.toUpperCase(),
        location: demoEmployee.location,
        category: demoEmployee.employeeCategory,
        rank: demoEmployee.rank,
        designation: demoEmployee.designation.toUpperCase(),
        jobLevel: demoEmployee.jobLevel,
        department: demoEmployee.department.toUpperCase(),
        division: demoEmployee.division,
        branch: demoEmployee.store.toUpperCase(),
        section: demoEmployee.section,
      };
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
        { label: 'Employee Status', value: employment.status },
        { label: 'Location', value: employment.location },
        { label: 'Employee Category', value: employment.category },
        { label: 'Rank', value: employment.rank },
        { label: 'Designation', value: employment.designation },
        { label: 'Job Level', value: employment.jobLevel },
        { label: 'Tax Status', value: isRcsDemo ? 'DEMO-TAX-A' : demoEmployee.taxStatus.toUpperCase() },
        { label: 'Department', value: employment.department },
        { label: 'Division', value: employment.division },
        { label: 'Branch', value: employment.branch },
        { label: 'Section', value: employment.section },
        { label: 'Unit', value: isRcsDemo ? 'Information Systems · demo' : demoEmployee.section },
        { label: 'Area', value: isRcsDemo ? 'Tarlac City · demo' : demoEmployee.location },
        { label: 'Group', value: employment.category },
        { label: 'Base Site', value: employment.designation },
        { label: 'Designation Desired', value: '' },
        { label: 'Pay Location', value: isRcsDemo ? 'RCS Demo Head Office' : demoEmployee.baseOffice },
        { label: 'Timekeep Group', value: isRcsDemo ? 'MIS Day Shift · demo' : demoEmployee.baseOffice },
        { label: 'Salary Classification', value: isRcsDemo ? 'DEMO-GRADE-7' : demoEmployee.salaryClassification },
        { label: 'Pag-Ibig Code', value: isRcsDemo ? 'DEMO-HDMF-0001' : demoEmployee.pagIbigCode },
        { label: 'Project Code', value: isRcsDemo ? 'DEMO-PROJECT-01' : demoEmployee.projectCode },
        { label: 'Date Applied', value: isRcsDemo ? 'September 2026 · demo date' : demoEmployee.dateApplied },
        { label: 'Date Hired', value: isRcsDemo ? 'October 2026 · resume month/year' : demoEmployee.dateHired },
        { label: 'Probationary Date', value: isRcsDemo ? 'January 2027 · demo date' : demoEmployee.probationaryDate },
        { label: 'Date Regularized', value: isRcsDemo ? 'Not applicable · demo' : demoEmployee.dateRegularized },
        { label: 'Date Separated', value: isRcsDemo ? 'Not applicable · demo' : '-' },
        { label: 'End of Contract', value: isRcsDemo ? 'December 2027 · demo date' : demoEmployee.endOfContract },
        { label: 'Basic Salary', value: isRcsDemo ? 'PHP 42,000.00 / month · synthetic demo value' : demoEmployee.basicSalary },
        { label: 'Starting Salary', value: isRcsDemo ? 'PHP 40,000.00 / month · synthetic demo value' : demoEmployee.startingSalary },
        { label: 'Member Id No.', value: isRcsDemo ? 'DEMO-MEMBER-0001' : demoEmployee.memberIdNumber },
        { label: 'PERAA Id No.', value: isRcsDemo ? 'DEMO-PERAA-0001' : demoEmployee.peraaIdNumber },
        { label: 'Bank Code', value: isRcsDemo ? 'DEMO-BANK-01' : demoEmployee.bankCode },
        { label: 'Bank Account Type', value: isRcsDemo ? 'Savings · demo only' : demoEmployee.bankAccountType },
        { label: 'ATM Account No.', value: isRcsDemo ? 'DEMO-ACCOUNT-0001 · not a real account' : demoEmployee.atmAccountNumber },
      ],
    },
    {
      kind: 'flags',
      columns: 3,
      fields: [
        { label: 'Salary On Hold', value: isRcsDemo ? 'No · demo' : demoEmployee.employmentFlags.salaryOnHold },
        { label: 'Salary for Check', value: isRcsDemo ? 'No · demo' : demoEmployee.employmentFlags.salaryForCheck },
        { label: 'Is Contractual', value: isRcsDemo ? 'Yes · resume-based' : demoEmployee.employmentFlags.isContractual },
        { label: 'Inactive Device', value: isRcsDemo ? 'No · demo' : demoEmployee.employmentFlags.inactiveDevice },
        { label: 'Allowed to Login', value: isRcsDemo ? 'Yes · demo' : demoEmployee.employmentFlags.allowedToLogin },
      ],
    },
    {
      kind: 'flags',
      title: 'Exemption Flags',
      columns: 2,
      fields: [
        { label: 'TAX', value: isRcsDemo ? 'Demo class A' : demoEmployee.employmentFlags.tax },
        { label: 'HRIS Status', value: isRcsDemo ? 'Active · demo' : demoEmployee.employmentFlags.hrisStatus },
        { label: 'SSS', value: isRcsDemo ? 'Enrolled · demo' : demoEmployee.employmentFlags.sss },
        { label: 'Payroll Status', value: isRcsDemo ? 'Active · demo' : demoEmployee.employmentFlags.payrollStatus },
        { label: 'PhilHealth', value: isRcsDemo ? 'Enrolled · demo' : demoEmployee.employmentFlags.philHealth },
        { label: 'TKS Status', value: isRcsDemo ? 'Active · demo' : demoEmployee.employmentFlags.tksStatus },
        { label: '13th Month Pay', value: isRcsDemo ? 'Eligible · demo' : demoEmployee.employmentFlags.thirteenthMonth },
        { label: 'Union Member', value: isRcsDemo ? 'No · demo' : demoEmployee.employmentFlags.unionMember },
        { label: 'Pag-Ibig', value: isRcsDemo ? 'Enrolled · demo' : demoEmployee.employmentFlags.pagIbig },
        { label: 'Agency', value: isRcsDemo ? 'RCS · demo' : demoEmployee.employmentFlags.agency },
        { label: 'Completion Bonus', value: isRcsDemo ? 'Not applicable · demo' : demoEmployee.employmentFlags.completionBonus },
        { label: 'Confidential', value: isRcsDemo ? 'No · demo' : demoEmployee.employmentFlags.confidential },
        { label: 'Incentive Leave', value: isRcsDemo ? 'Eligible · demo' : demoEmployee.employmentFlags.incentiveLeave },
        { label: 'Provident Fund', value: isRcsDemo ? 'Enrolled · demo' : demoEmployee.employmentFlags.providentFund },
      ],
    },
    {
      kind: 'table',
      title: 'Tax Status History',
      columns: ['Year', 'Tax Code'],
      rows: isRcsDemo ? [['2025', 'DEMO-TAX-A'], ['2026', 'DEMO-TAX-A']] : [],
      emptyText: 'No data available in table',
    },
    {
      kind: 'text',
      title: 'Remarks',
      text: isRcsDemo
        ? 'Career details are based on the provided resume. Compensation, identifiers, and other private values on this page are synthetic demo data.'
        : demoEmployee.employmentRemarks,
    },
  ];
}

function resumeRecordGroups(section: string): RecordGroup[] | null {
  switch (section) {
    case 'educational-background':
      return [
        {
          kind: 'fields',
          title: 'Bachelor of Science in Computer Science',
          columns: 2,
          fields: [
            { label: 'School', value: 'AMA Computer College · Tarlac City' },
            { label: 'Completed', value: '2025' },
            { label: 'Recognition', value: 'Top Graduate, BS Computer Science' },
            { label: 'GWA', value: '1.30 · synthetic demo value' },
          ],
        },
        {
          kind: 'fields',
          title: 'Master of Science in Computer Science',
          columns: 2,
          fields: [
            { label: 'School', value: 'AMA University' },
            { label: 'Status', value: 'In progress' },
            { label: 'Units completed', value: '9' },
          ],
        },
      ];
    case 'previous-employment':
      return [
        {
          kind: 'fields',
          title: 'Assistant Instructor I',
          columns: 2,
          fields: [
            { label: 'Employer', value: 'AMA Computer College · Tarlac City' },
            { label: 'Period', value: '2025–2026 · year precision' },
            { label: 'Subjects', value: 'Programming, databases, network security, information assurance, and AI fundamentals' },
            { label: 'Additional role', value: 'College Student Council Advisor' },
          ],
        },
        {
          kind: 'fields',
          title: 'IT Support and Graphic Designer',
          columns: 2,
          fields: [
            { label: 'Employer', value: '3456 Printing Station' },
            { label: 'Period', value: '2021–2025 · year precision' },
            { label: 'Responsibilities', value: 'Hardware/software support and digital production workflows' },
          ],
        },
      ];
    case 'skills':
      return [
        {
          kind: 'fields',
          title: 'Technical skills',
          columns: 2,
          fields: [
            { label: 'IT support', value: 'Hardware/software troubleshooting, user assistance, and system support' },
            { label: 'Databases', value: 'PostgreSQL and SQL' },
            { label: 'Development tools', value: 'Git, GitHub, VS Code, and Moodle' },
            { label: 'Productivity', value: 'Microsoft Office' },
            { label: 'Security', value: 'Network security and information assurance fundamentals' },
            { label: 'Linux', value: 'Command-line skills in development' },
            { label: 'Communication', value: 'Technical documentation, teaching, and collaboration' },
          ],
        },
        {
          kind: 'fields',
          title: 'Selected projects',
          columns: 2,
          fields: [
            { label: 'Sentinel', value: 'System operations monitoring' },
            { label: 'Application Management System', value: 'AI-assisted system with filtering algorithms for PESO Tarlac' },
            { label: 'Steward', value: 'Financial tracker app' },
            { label: 'Fit N’ Bright', value: 'Fitness tracking app' },
            { label: 'Revline', value: 'Automotive shortlister and garage' },
          ],
        },
      ];
    case 'licenses-and-other-eligibility':
      return [
        {
          kind: 'fields',
          title: 'Certifications',
          columns: 2,
          fields: [
            { label: 'CompTIA', value: 'Cybersecurity Analyst (CySA+) · valid through 2029' },
            { label: 'CompTIA', value: 'IT Fundamentals+' },
            { label: 'Microsoft', value: 'Excel 2019 Associate' },
          ],
        },
      ];
    case 'government-exams':
      return [
        {
          kind: 'fields',
          title: 'Civil Service Examination',
          columns: 2,
          fields: [
            { label: 'Level', value: 'Professional' },
            { label: 'Result', value: 'Passed · resume-based' },
            { label: 'Rating', value: '88.00% · synthetic demo value' },
            { label: 'Date', value: '2026 · year precision' },
          ],
        },
      ];
    case 'awards-commendations':
      return [
        {
          kind: 'fields',
          title: 'Academic recognition',
          columns: 2,
          fields: [
            { label: 'Recognition', value: 'Top Graduate, BS Computer Science' },
            { label: 'School', value: 'AMA Computer College · Tarlac City' },
            { label: 'GWA', value: '1.30 · synthetic demo value' },
            { label: 'Year', value: '2025' },
          ],
        },
      ];
    case 'narrative-report':
      return [
        {
          kind: 'text',
          title: 'Professional summary',
          text: 'Computer Science graduate with experience in IT support, digital production, and teaching programming, databases, network security, and information assurance. Strengths include troubleshooting, technical communication, documentation, and structured problem-solving.',
        },
        {
          kind: 'fields',
          title: 'Current development focus',
          columns: 2,
          fields: [
            { label: 'Role', value: 'Programmer · resume-based' },
            { label: 'Focus', value: 'Linux command line and software prototypes' },
          ],
        },
      ];
    default:
      return null;
  }
}

export function getEmployeeRecordGroups(
  section: string | undefined,
  identity: EmployeeIdentity,
  isRcsDemo = false,
): RecordGroup[] | null {
  if (section === 'personal-information') return personalInformation(identity, isRcsDemo);
  if (section === 'employment-information') return employmentInformation(identity, isRcsDemo);
  return isRcsDemo ? resumeRecordGroups(section ?? '') : null;
}
