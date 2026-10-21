export type DemoPunch = {
  direction: "IN" | "OUT";
  label:
    | "Check in"
    | "Lunch out"
    | "Lunch in"
    | "Afternoon break out"
    | "Afternoon break in"
    | "Check out";
  time: string;
};

export type DemoAttendanceRecord = {
  date: string;
  status: "Present" | "Late";
  lateByMinutes: number;
  scheduledShift: string;
  shiftSpanMinutes: number;
  unpaidLunchMinutes: number;
  paidBreakMinutes: number;
  scheduledPaidMinutes: number;
  paidMinutes: number;
  punches: DemoPunch[];
  totalWorked: string;
};

export type DemoMonthlyLateSummary = {
  lateDays: number;
  lateMinutes: number;
  sanctionThresholdReached: boolean;
};

export type DemoApprover = {
  name: string;
  role: string;
  status: "Approved" | "Disapproved" | "Pending" | "Waiting" | "Skipped";
  actedAt?: string; // YYYY-MM-DD
  remarks?: string;
};

export type DemoApplication = {
  id: string;
  type: string;
  summary: string;
  submittedAt: string;
  status: "Pending" | "Approved" | "Disapproved" | "Cancelled";
  cancellationReason?: string;
  details?: { label: string; value: string }[];
  approvers?: DemoApprover[];
};

const today = new Date();
const todayStart = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate(),
);

export function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function relativeDate(daysFromToday: number) {
  const date = new Date(todayStart);
  date.setDate(date.getDate() + daysFromToday);
  return dateKey(date);
}

export function formatDemoDate(
  value: string,
  options?: Intl.DateTimeFormatOptions,
) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(
    undefined,
    options ?? {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  );
}

function createDateRandom(date: string) {
  let seed = 2166136261;
  for (let index = 0; index < date.length; index += 1) {
    seed ^= date.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }

  return () => {
    seed += 0x6d2b79f5;
    let value = seed;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function formatPunchTime(minutes: number) {
  const hour24 = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const hour12 = hour24 % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${hour24 < 12 ? "AM" : "PM"}`;
}

function formatWorkedTime(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export const formatDemoDuration = formatWorkedTime;

const profileRandom = createDateRandom(
  `employment-profile-${dateKey(todayStart)}`,
);

function chooseDemoValue<T>(values: T[]) {
  return values[Math.floor(profileRandom() * values.length)];
}

const demoFirstName = chooseDemoValue([
  "Inez",
  "Mara",
  "Sofia",
  "Nico",
  "Elias",
  "Talia",
]);
const demoMiddleName = chooseDemoValue([
  "Amara",
  "Lucia",
  "Rafael",
  "Noelle",
  "Isabel",
  "Mateo",
]);
const demoLastName = chooseDemoValue([
  "Navarro",
  "Villanueva",
  "Castillo",
  "Mercado",
  "Dominguez",
  "Salazar",
]);
const demoEmployeeCode = String(100000 + Math.floor(profileRandom() * 900000));
const demoDesignation = chooseDemoValue([
  "Customer Service Associate",
  "Inventory Coordinator",
  "Store Operations Assistant",
  "Sales Associate",
]);
const demoDepartment = chooseDemoValue([
  "Store Operations",
  "Customer Experience",
  "Merchandising",
  "Supply and Inventory",
]);
const demoStore = chooseDemoValue([
  "RCS Demo Store · North District",
  "RCS Demo Store · Central District",
  "RCS Demo Store · South District",
]);
const demoManagerName = `${chooseDemoValue(["Rina", "Paolo", "Lara", "Enzo"])} ${chooseDemoValue(["Santiago", "Reyes", "Cruz", "Mendoza"])}`;

export const demoEmployee = {
  name: `${demoFirstName} ${demoMiddleName} ${demoLastName}`,
  firstName: demoFirstName,
  middleName: demoMiddleName,
  lastName: demoLastName,
  employeeCode: demoEmployeeCode,
  contactNumber: "09XX-XXX-0000",
  email: "employee@example.test",
  address: "Demo District, Sample City, Philippines",
  designation: demoDesignation,
  department: demoDepartment,
  dateHired: "June 12, 2022",
  taxStatus: "S/0 · Sample",
  tin: "DEMO-TIN-****",
  sss: "DEMO-SSS-****",
  pagIbig: "DEMO-HDMF-****",
  philHealth: "DEMO-PHIC-****",
  gsis: "Not applicable · Sample",
  manager: demoManagerName,
  store: demoStore,
  employmentStatus: "Regular · Sample",
  company: "RCS Demo Retail Corporation",
};

export function getDemoAttendance(date: Date): DemoAttendanceRecord | null {
  const key = dateKey(date);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = new Date(
    Date.UTC(start.getFullYear(), start.getMonth(), start.getDate()),
  ).getUTCDay();
  if (start >= todayStart || weekday === 0) return null;
  if (todayStart.getTime() - start.getTime() > 35 * 24 * 60 * 60 * 1000)
    return null;

  const random = createDateRandom(key);
  const clockIn = 8 * 60 + 25 + Math.floor(random() * 21);
  const lunchIn = 11 * 60 + Math.floor(random() * 61);
  const lunchOut = lunchIn + 70;
  const afternoonBreakOut = 15 * 60 + 1 + Math.floor(random() * 90);
  const afternoonBreakIn = afternoonBreakOut + 30;
  const clockOut = 17 * 60 + 30;
  const lateByMinutes = Math.max(0, clockIn - (8 * 60 + 30));
  const shiftSpanMinutes = clockOut - (8 * 60 + 30);
  const unpaidLunchMinutes = lunchOut - lunchIn;
  const paidBreakMinutes = afternoonBreakIn - afternoonBreakOut;
  const scheduledPaidMinutes = shiftSpanMinutes - unpaidLunchMinutes;
  const paidMinutes = clockOut - clockIn - unpaidLunchMinutes;

  return {
    date: key,
    status: lateByMinutes > 0 ? "Late" : "Present",
    lateByMinutes,
    scheduledShift: "8:30 AM – 5:30 PM",
    shiftSpanMinutes,
    unpaidLunchMinutes,
    paidBreakMinutes,
    scheduledPaidMinutes,
    paidMinutes,
    punches: [
      { direction: "IN", label: "Check in", time: formatPunchTime(clockIn) },
      { direction: "OUT", label: "Lunch out", time: formatPunchTime(lunchIn) },
      { direction: "IN", label: "Lunch in", time: formatPunchTime(lunchOut) },
      {
        direction: "OUT",
        label: "Afternoon break out",
        time: formatPunchTime(afternoonBreakOut),
      },
      {
        direction: "IN",
        label: "Afternoon break in",
        time: formatPunchTime(afternoonBreakIn),
      },
      { direction: "OUT", label: "Check out", time: formatPunchTime(clockOut) },
    ],
    totalWorked: formatWorkedTime(paidMinutes),
  };
}

export function getDemoMonthlyLateSummary(date: Date): DemoMonthlyLateSummary {
  const year = date.getFullYear();
  const month = date.getMonth();
  const finalDay = Math.min(
    date.getDate(),
    new Date(year, month + 1, 0).getDate(),
  );
  let lateDays = 0;
  let lateMinutes = 0;

  for (let day = 1; day <= finalDay; day += 1) {
    const record = getDemoAttendance(new Date(year, month, day));
    if (record && record.lateByMinutes > 0) {
      lateDays += 1;
      lateMinutes += record.lateByMinutes;
    }
  }

  return {
    lateDays,
    lateMinutes,
    sanctionThresholdReached: lateDays >= 12 || lateMinutes >= 120,
  };
}

export function getRecentDemoAttendance() {
  for (let daysAgo = 1; daysAgo <= 7; daysAgo += 1) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - daysAgo);
    const record = getDemoAttendance(date);
    if (record) return record;
  }
  return null;
}

export function getDemoAttendanceDates(month: Date) {
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
    return getDemoAttendance(date) ? dateKey(date) : null;
  }).filter((value): value is string => value !== null);
}

export const demoApplications: DemoApplication[] = [
  {
    id: "DEMO-APP-1084",
    type: "Leave",
    summary: "Vacation leave · 1 day",
    submittedAt: relativeDate(-1),
    status: "Pending",
    details: [
      { label: "Leave type", value: "Service Incentive Leave" },
      { label: "Date from", value: formatDemoDate(relativeDate(5)) },
      { label: "Date to", value: formatDemoDate(relativeDate(5)) },
      { label: "Applied days", value: "1" },
      { label: "Period", value: "Whole Day" },
      { label: "Reason", value: "Family errand · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Approved",
        actedAt: relativeDate(-1),
        remarks: "Coverage arranged for the day.",
      },
      { name: "Paolo Reyes", role: "HR approver", status: "Pending" },
    ],
  },
  {
    id: "DEMO-APP-1079",
    type: "DTR Update",
    summary: "Missing time out · Store closing shift",
    submittedAt: relativeDate(-4),
    status: "Approved",
    details: [
      { label: "DTR type", value: "FIELD DUTY NO TIME OUT" },
      { label: "Date", value: formatDemoDate(relativeDate(-5)) },
      { label: "Time out", value: "06:15 PM" },
      { label: "Reason", value: "Closing duties ran late · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Approved",
        actedAt: relativeDate(-4),
      },
      {
        name: "Paolo Reyes",
        role: "HR approver",
        status: "Approved",
        actedAt: relativeDate(-3),
        remarks: "Verified against store log.",
      },
    ],
  },
  {
    id: "DEMO-APP-1068",
    type: "Overtime",
    summary: "Inventory count · 2.0 hours",
    submittedAt: relativeDate(-8),
    status: "Pending",
    details: [
      { label: "Applicable date", value: formatDemoDate(relativeDate(-9)) },
      { label: "OT after shift", value: "05:30 PM – 07:30 PM" },
      { label: "Total applied hours", value: "2.0" },
      { label: "Reason", value: "Quarterly inventory count · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Pending",
      },
      { name: "Paolo Reyes", role: "HR approver", status: "Waiting" },
    ],
  },
  {
    id: "DEMO-APP-1052",
    type: "Loan",
    summary: "Uniform loan · ₱1,250.00",
    submittedAt: relativeDate(-15),
    status: "Disapproved",
    details: [
      { label: "Loan type", value: "Uniform loan" },
      { label: "Principal", value: "₱1,250.00" },
      { label: "Terms of payment", value: "3 | 0%" },
      { label: "Deduction amount", value: "₱416.67" },
      { label: "Reason", value: "Replacement uniform · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Approved",
        actedAt: relativeDate(-14),
      },
      {
        name: "Lara Cruz",
        role: "HR approver",
        status: "Disapproved",
        actedAt: relativeDate(-12),
        remarks: "Existing loan balance must be settled first.",
      },
    ],
  },
  {
    id: "DEMO-APP-1036",
    type: "Profile",
    summary: "Update contact details",
    submittedAt: relativeDate(-23),
    status: "Approved",
    details: [
      { label: "Field changed", value: "Mobile No" },
      { label: "New value", value: "09XX-XXX-0000 · Sample" },
    ],
    approvers: [
      {
        name: "Lara Cruz",
        role: "HR approver",
        status: "Approved",
        actedAt: relativeDate(-22),
      },
    ],
  },
  {
    id: "DEMO-APP-1021",
    type: "Rest Day",
    summary: "Rest day adjustment · 1 day",
    submittedAt: relativeDate(-29),
    status: "Cancelled",
    cancellationReason: "Schedule changed before approval · Sample",
    details: [
      { label: "Date from", value: formatDemoDate(relativeDate(-26)) },
      { label: "Date to", value: formatDemoDate(relativeDate(-26)) },
      { label: "Rest day 1", value: "Wednesday" },
      { label: "Reason", value: "Swap with coworker · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Skipped",
      },
      { name: "Paolo Reyes", role: "HR approver", status: "Skipped" },
    ],
  },
];

export const demoLeaveBalances = [
  {
    type: "Vacation Leave",
    used: "3.0",
    total: "12.0",
    from: "2026-01-01",
    to: "2026-12-31",
    updated: relativeDate(-1),
    chargedTo: "Vacation Leave",
  },
  {
    type: "Sick Leave",
    used: "1.0",
    total: "10.0",
    from: "2026-01-01",
    to: "2026-12-31",
    updated: relativeDate(-1),
    chargedTo: "Sick Leave",
  },
  {
    type: "Service Incentive Leave",
    used: "0.0",
    total: "5.0",
    from: "2026-01-01",
    to: "2026-12-31",
    updated: relativeDate(-1),
    chargedTo: "SIL",
  },
];

export const demoLoans = [
  {
    type: "Uniform loan",
    total: "₱3,750.00",
    date: relativeDate(-90),
    deduction: "₱312.50",
    balance: "₱1,250.00",
  },
  {
    type: "Company loan",
    total: "₱12,000.00",
    date: relativeDate(-180),
    deduction: "₱1,000.00",
    balance: "₱4,000.00",
  },
];

export type DemoPayslip = {
  payrollDate: string;
  payPeriod: string;
  totalEarnings: string;
  totalDeductions: string;
  netIncome: string;
  ytdBasic: string;
  ytdTaxable: string;
  ytdTaxWithheld: string;
  taxStatus: string;
  position: string;
  department: string;
  company: string;
  headOffice: string;
  employeeName: string;
  employeeNameShort: string;
  payhouse: string;
  payrollDateShort: string;
  periodShort: string;
  noOfHours: string;
  noOfDays: string;
  basicRate: string;
  earnings: {
    description: string;
    hours: string;
    days: string;
    amount: string;
  }[];
  deductions: { description: string; amount: string; balance: string }[];
};

const round2 = (value: number) => Math.round(value * 100) / 100;
const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function adjustForWeekend(date: Date) {
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() - 1); // Saturday -> Friday
  if (day === 0) date.setDate(date.getDate() - 2); // Sunday -> Friday
  return date;
}

function buildDemoPayslips(count: number): DemoPayslip[] {
  const BASIC_PAY = 9000;
  const BASIC_HOURS = 96;
  const TARDINESS_RATE = 78.5; // pay deducted per hour of tardiness
  const deductionItems = [
    { description: "SSS Payable", amount: 450 },
    { description: "PhilHealth Payable", amount: 487.5 },
    { description: "HDMF Payable", amount: 200 },
  ];
  const deductionsTotal = deductionItems.reduce(
    (sum, item) => sum + item.amount,
    0,
  );

  // Every half-month period for last year and this year, oldest first.
  const periods: { start: Date; end: Date; payday: Date }[] = [];
  for (const year of [todayStart.getFullYear() - 1, todayStart.getFullYear()]) {
    for (let month = 0; month < 12; month += 1) {
      const lastDay = new Date(year, month + 1, 0).getDate();
      periods.push({
        start: new Date(year, month, 1),
        end: new Date(year, month, 15),
        payday: adjustForWeekend(new Date(year, month, 20)),
      });
      periods.push({
        start: new Date(year, month, 16),
        end: new Date(year, month, lastDay),
        payday: adjustForWeekend(new Date(year, month + 1, 5)),
      });
    }
  }

  const ytd: Record<number, { earnings: number; net: number }> = {};
  const slips = periods
    .filter((period) => period.payday <= todayStart) // only periods already paid
    .map((period): DemoPayslip => {
      const year = period.start.getFullYear();
      const random = createDateRandom(`payslip-${dateKey(period.start)}`);
      const tardinessHours = [0, 0.02, 0.05, 0.1, 0.25][
        Math.floor(random() * 5)
      ];
      const tardiness = -round2(tardinessHours * TARDINESS_RATE);

      const totalEarnings = round2(BASIC_PAY + tardiness);
      const netIncome = round2(totalEarnings - deductionsTotal);
      const running = ytd[year] ?? { earnings: 0, net: 0 };
      running.earnings = round2(running.earnings + totalEarnings);
      running.net = round2(running.net + netIncome);
      ytd[year] = running;
      const shortDate: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "2-digit",
        year: "numeric",
      };
      const longDate: Intl.DateTimeFormatOptions = {
        month: "long",
        day: "2-digit",
        year: "numeric",
      };
      return {
        payrollDate: formatDemoDate(dateKey(period.payday), {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        payPeriod: `${formatDemoDate(dateKey(period.start), longDate)} - ${formatDemoDate(dateKey(period.end), longDate)}`,
        totalEarnings: formatMoney(totalEarnings),
        totalDeductions: formatMoney(deductionsTotal),
        netIncome: formatMoney(netIncome),
        ytdBasic: formatMoney(running.earnings),
        ytdTaxable: formatMoney(running.net),
        ytdTaxWithheld: "",
        taxStatus: "",
        position: demoEmployee.designation,
        department: demoEmployee.department,
        company: demoEmployee.company.toUpperCase(),
        headOffice: "000 DEMO HEAD OFFICE",
        employeeName:
          `${demoEmployee.lastName} , ${demoEmployee.firstName} ${demoEmployee.middleName.charAt(0)}. (${demoEmployee.employeeCode})`.toUpperCase(),
        employeeNameShort:
          `${demoEmployee.lastName} , ${demoEmployee.firstName} ${demoEmployee.middleName.charAt(0)}.`.toUpperCase(),
        payhouse: "M00600",
        payrollDateShort: formatDemoDate(dateKey(period.payday), shortDate),
        periodShort: `${formatDemoDate(dateKey(period.start), shortDate)} to ${formatDemoDate(dateKey(period.end), shortDate)}`,
        noOfHours: BASIC_HOURS.toFixed(2),
        noOfDays: "12.00",
        basicRate: "750.00",
        earnings: [
          {
            description: "Basic Pay",
            hours: BASIC_HOURS.toFixed(2),
            days: "12.00",
            amount: formatMoney(BASIC_PAY),
          },
          ...(tardinessHours > 0
            ? [
                {
                  description: "UT/Tardiness",
                  hours: tardinessHours.toFixed(2),
                  days: "",
                  amount: formatMoney(tardiness),
                },
              ]
            : []),
        ],
        deductions: deductionItems.map((item) => ({
          description: item.description,
          amount: formatMoney(item.amount),
          balance: "0.00",
        })),
      };
    });

  return slips.reverse().slice(0, count); // newest first
}

export const demoPayslip = buildDemoPayslips(4);

export const demoAnnouncements = [
  {
    id: "DEMO-NEWS-01",
    category: "PAYROLL",
    date: relativeDate(-1),
    title: "Payroll schedule reminder",
    body: "This sample notice demonstrates how payroll updates can be shared with employees. Check the posted payroll calendar for your pay-period dates.",
  },
  {
    id: "DEMO-NEWS-02",
    category: "STORE OPERATIONS",
    date: relativeDate(-3),
    title: "Quarterly store safety review",
    body: "Store teams should review the safety checklist with their supervisor. This is fictional presentation content, not an active company notice.",
  },
  {
    id: "DEMO-NEWS-03",
    category: "PEOPLE & CULTURE",
    date: relativeDate(-7),
    title: "Benefits enrollment window",
    body: "A sample benefits reminder with an example enrollment window and next steps for employees.",
  },
];

function demoMilestoneDate(index: number, count: number) {
  const today = new Date();
  const lastDay = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
  ).getDate();
  const day =
    count === 1 ? 1 : Math.round((index * (lastDay - 1)) / (count - 1)) + 1;
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    day,
  ).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export const demoEmployeeNames = [
  "Mia Santos",
  "Rafael Cruz",
  "Bianca Reyes",
  "Paolo Garcia",
  "Leah Mendoza",
  "Marco Lim",
  "Nina Flores",
  "Andre Ramos",
];
const demoAnniversaries = [
  { name: "Carlo Lim", years: 4 },
  { name: "Janelle Dizon", years: 2 },
  { name: "Luis Navarro", years: 7 },
  { name: "Trisha Bautista", years: 1 },
  { name: "Enzo Villanueva", years: 5 },
  { name: "Grace Aquino", years: 3 },
  { name: "Noel Castillo", years: 9 },
];

export const demoMilestones = {
  birthdays: demoEmployeeNames.map((name, index) => ({
    name,
    date: demoMilestoneDate(index, demoEmployeeNames.length),
  })),
  anniversaries: demoAnniversaries.map((milestone, index) => ({
    ...milestone,
    date: demoMilestoneDate(index, demoAnniversaries.length),
  })),
};

export const demoProfileValues: Record<string, string> = {
  "Employee name": demoEmployee.name,
  "Employee code": demoEmployee.employeeCode,
  "Contact number": demoEmployee.contactNumber,
  "Email address": demoEmployee.email,
  Address: demoEmployee.address,
  Designation: demoEmployee.designation,
  Department: demoEmployee.department,
  "Date hired": demoEmployee.dateHired,
  "Tax status": demoEmployee.taxStatus,
  TIN: demoEmployee.tin,
  "SSS number": demoEmployee.sss,
  "Pag-IBIG number": demoEmployee.pagIbig,
  "PhilHealth number": demoEmployee.philHealth,
  "GSIS number": demoEmployee.gsis,
};

export const demoRecordValues: Record<
  string,
  { label: string; value: string }[]
> = {
  "annual-physical-exams": [
    { label: "Most recent exam", value: "September 18, 2026" },
    { label: "Clinic", value: "RCS Demo Clinic" },
    { label: "Result", value: "Fit to work · Sample" },
  ],
  "awards-commendations": [
    { label: "Recognition", value: "Customer Service Star · Sample" },
    { label: "Award date", value: "March 15, 2025" },
    { label: "Presented by", value: "Store Operations" },
  ],
  "bank-accounts": [
    { label: "Bank", value: "Demo Bank" },
    { label: "Account name", value: demoEmployee.name },
    { label: "Account number", value: "**** 1042 · Sample" },
  ],
  "disciplinary-cases": [
    { label: "Active cases", value: "None · Sample record" },
    { label: "Last reviewed", value: "September 30, 2026" },
  ],
  "disciplinary-remarks": [
    { label: "Current remarks", value: "No active remarks · Sample record" },
    { label: "Last updated", value: "September 30, 2026" },
  ],
  "educational-background": [
    { label: "Highest attainment", value: "Bachelor of Science · Sample" },
    { label: "School", value: "Demo State College" },
    { label: "Year completed", value: "2019" },
  ],
  "examination-result": [
    { label: "Examination", value: "Retail Operations Assessment · Sample" },
    { label: "Result", value: "Passed · Sample" },
    { label: "Date taken", value: "June 6, 2024" },
  ],
  "family-information": [
    { label: "Civil status", value: "Single · Sample" },
    { label: "Dependents", value: "1 · Sample" },
    { label: "Emergency contact", value: "A. Employee · 09XX-XXX-0000" },
  ],
  "forms-submitted-to-government": [
    { label: "BIR Form 2316", value: "Received · Sample · 2025" },
    { label: "SSS enrollment", value: "On file · Masked demo record" },
    { label: "PhilHealth enrollment", value: "On file · Masked demo record" },
  ],
  "government-exams": [
    { label: "Exam", value: "Civil Service Professional · Sample" },
    { label: "Rating", value: "Not displayed · Sample" },
    { label: "Date", value: "May 14, 2022" },
  ],
  "health-insurance": [
    { label: "Provider", value: "Demo Health Plan" },
    { label: "Member number", value: "DEMO-****-1042" },
    { label: "Coverage", value: "Employee · Sample" },
  ],
  "health-record": [
    { label: "Blood type", value: "Not provided · Sample" },
    { label: "Allergies", value: "None reported · Sample" },
    { label: "Last updated", value: "September 18, 2026" },
  ],
  "insurance-claims": [
    { label: "Claims this year", value: "1 · Sample" },
    { label: "Latest claim", value: "Outpatient visit · Approved sample" },
    { label: "Filed", value: "August 8, 2026" },
  ],
  "languages-and-dialects": [
    { label: "Language", value: "Filipino · Sample" },
    { label: "Language", value: "English · Sample" },
    { label: "Dialect", value: "Tagalog · Sample" },
  ],
  "licenses-and-other-eligibility": [
    { label: "Credential", value: "Food Safety Training · Sample" },
    { label: "Issued", value: "January 20, 2025" },
    { label: "Valid through", value: "January 20, 2027" },
  ],
  "medical-cases": [
    { label: "Open cases", value: "None · Sample record" },
    { label: "Last review", value: "September 18, 2026" },
  ],
  "medical-reimbursements": [
    { label: "Latest request", value: "Clinic visit · Sample" },
    { label: "Status", value: "Paid · Sample" },
    { label: "Processed", value: "August 15, 2026" },
  ],
  "narrative-report": [
    { label: "Report period", value: "Q3 2026 · Sample" },
    { label: "Submitted by", value: "Store Supervisor · Sample" },
    { label: "Summary", value: "Consistent service and reliable attendance." },
  ],
  "previous-employment": [
    { label: "Employer", value: "Demo Retail Company" },
    { label: "Position", value: "Store Assistant · Sample" },
    { label: "Employment dates", value: "2019–2021 · Sample" },
  ],
  references: [
    { label: "Reference", value: "A. Reference · Sample only" },
    { label: "Relationship", value: "Former supervisor" },
    { label: "Contact", value: "reference@example.test" },
  ],
  "seminars-and-trainings": [
    { label: "Training", value: "Customer Care Essentials · Sample" },
    { label: "Provider", value: "RCS Learning · Sample" },
    { label: "Completed", value: "July 12, 2026" },
  ],
  skills: [
    { label: "Skill", value: "Customer service · Sample" },
    { label: "Skill", value: "Point-of-sale operations · Sample" },
    { label: "Skill", value: "Inventory handling · Sample" },
  ],
  "personal-information": [
    { label: "Name", value: demoEmployee.name },
    { label: "Address", value: demoEmployee.address },
    { label: "Contact", value: demoEmployee.contactNumber },
  ],
  "employment-information": [
    { label: "Employee code", value: demoEmployee.employeeCode },
    { label: "Position", value: demoEmployee.designation },
    { label: "Department", value: demoEmployee.department },
    { label: "Employment status", value: demoEmployee.employmentStatus },
    { label: "Store", value: demoEmployee.store },
    { label: "Manager", value: demoEmployee.manager },
  ],
};
