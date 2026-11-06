import {
  DAILY_RATE,
  HOURS_PER_DAY,
  PAGIBIG_EMPLOYEE_CONTRIBUTION,
  philHealthEmployeeShare,
  round2,
  sssEmployeeShare,
  tardinessDeduction,
} from "@/data/payroll";

export const LATE_SANCTION_LADDER = [
  "1-day suspension",
  "3-day suspension",
  "7-day suspension",
  "Termination",
] as const;

export function getLateSanction(offenseNumber: number) {
  const index = Math.min(offenseNumber, LATE_SANCTION_LADDER.length) - 1;
  return LATE_SANCTION_LADDER[Math.max(0, index)];
}

export const ALLOWED_LUNCH_MINUTES = 70;
export const ALLOWED_BREAK_MINUTES = 30;
export const STANDARD_PAID_DAY_MINUTES = 8 * 60;

const LATE_ARRIVAL_CHANCE = 0.12;
const LATE_LUNCH_CHANCE = 0.06;
const LATE_BREAK_CHANCE = 0.06;

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

  status: "Present" | "Late" | "SIL" | "LWOP";
  lateByMinutes: number;
  lunchOverMinutes: number;
  breakOverMinutes: number;
  totalLateMinutes: number;
  scheduledShift: string;
  shiftSpanMinutes: number;
  unpaidLunchMinutes: number;
  paidBreakMinutes: number;
  scheduledPaidMinutes: number;
  paidMinutes: number;
  punches: DemoPunch[];
  totalWorked: string;
};

export type DemoCurrentDayAttendance = {
  record: DemoAttendanceRecord | null;
  latestPunch: DemoPunch | null;
};

export type DemoMonthlyLateSummary = {
  lateDays: number;
  lateMinutes: number;
  sanctionThresholdReached: boolean;
  sanction: string | null;
  silDays: number;
  lwopDays: number;
};

export type DemoApprover = {
  name: string;
  role: string;
  status: "Approved" | "Disapproved" | "Pending" | "Waiting" | "Skipped";
  actedAt?: string;
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

export function isRestDay(date: Date) {
  return date.getDay() === 0;
}

const SIL_MONTHS = [1, 4, 7, 9];
const LWOP_MONTHS = [0, 2, 5, 8, 9];

function pickAbsenceDay(
  year: number,
  month: number,
  kind: string,
  avoid?: number,
) {
  const random = createDateRandom(`absence-${kind}-${year}-${month}`);
  let day = 3 + Math.floor(random() * 22);
  while (new Date(year, month, day).getDay() === 0 || day === avoid) day += 1;
  return day;
}

function silDayFor(year: number, month: number) {
  return SIL_MONTHS.includes(month) ? pickAbsenceDay(year, month, "sil") : null;
}

function getAbsenceType(date: Date): "SIL" | "LWOP" | null {
  const year = date.getFullYear();
  const month = date.getMonth();
  const silDay = silDayFor(year, month);
  const lwopDay = LWOP_MONTHS.includes(month)
    ? pickAbsenceDay(year, month, "lwop", silDay ?? undefined)
    : null;
  if (date.getDate() === silDay) return "SIL";
  if (date.getDate() === lwopDay) return "LWOP";
  return null;
}

function silDaysUsedThisYear() {
  const year = todayStart.getFullYear();
  let used = 0;
  for (const month of SIL_MONTHS) {
    const day = silDayFor(year, month);
    if (day && new Date(year, month, day) < todayStart) used += 1;
  }
  return used;
}

function buildAbsenceRecord(
  key: string,
  absence: "SIL" | "LWOP",
): DemoAttendanceRecord {
  const shiftSpanMinutes = 17 * 60 + 30 - (8 * 60 + 30);
  const unpaidLunchMinutes = ALLOWED_LUNCH_MINUTES;
  const scheduledPaidMinutes = STANDARD_PAID_DAY_MINUTES;
  return {
    date: key,
    status: absence,
    lateByMinutes: 0,
    lunchOverMinutes: 0,
    breakOverMinutes: 0,
    totalLateMinutes: 0,
    scheduledShift: "8:30 AM – 5:30 PM",
    shiftSpanMinutes,
    unpaidLunchMinutes,
    paidBreakMinutes: ALLOWED_BREAK_MINUTES,
    scheduledPaidMinutes,
    paidMinutes: absence === "SIL" ? scheduledPaidMinutes : 0,
    punches: [],
    totalWorked: formatWorkedTime(0),
  };
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

function getPunchMinutes(time: string) {
  const [clock, meridiem] = time.split(" ");
  const [hour, minute] = clock.split(":").map(Number);
  return ((hour % 12) + (meridiem === "PM" ? 12 : 0)) * 60 + minute;
}

function formatWorkedTime(minutes: number) {
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export const formatDemoDuration = formatWorkedTime;

const profileRandom = createDateRandom("employment-profile-demo-v1");

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
  "Visual Merchandiser",
]);
const demoDepartment = chooseDemoValue([
  "Store Operations",
  "Customer Experience",
  "Merchandising",
  "Supply and Inventory",
  "Human Resources",
]);
const demoStore = chooseDemoValue([
  "RCS Demo Store · Maligaya Branch",
  "RCS Demo Store · Capas Branch ",
  "RCS Demo Store · San Rafael Branch",
  "RCS Demo Store · San Isidro Branch",
]);
const demoManagerName = `${chooseDemoValue(["Rina", "Paolo", "Lara", "Enzo", "Maria", "Juan"])} ${chooseDemoValue(["Santiago", "Reyes", "Cruz", "Mendoza", "Torres", "Gonzales"])}`;
const demoLocation = chooseDemoValue(["Sample City", "North District", "Central District", "South District"]);
const demoEmployeeCategory = chooseDemoValue(["STORE OPERATIONS", "CUSTOMER SERVICE", "MERCHANDISING", "INVENTORY"]);
const demoRank = chooseDemoValue(["RANK AND FILE", "TEAM LEAD", "SUPERVISORY"]);
const demoJobLevel = chooseDemoValue(["I", "II", "III", "IV"]);
const demoDivision = chooseDemoValue(["STORE OPERATIONS", "CUSTOMER EXPERIENCE", "RETAIL SUPPORT"]);
const demoSection = chooseDemoValue(["FRONT END", "STORE SUPPORT", "INVENTORY CONTROL", "SALES FLOOR"]);
const demoBaseOffice = chooseDemoValue(["000 DEMO HEAD OFFICE", "001 SAMPLE OPERATIONS HUB", "002 DEMO REGIONAL OFFICE"]);
const demoSalaryClassification = chooseDemoValue(["DAILY RATE", "MONTHLY RATE", "HOURLY RATE"]);
const demoBasicSalary = (650 + Math.floor(profileRandom() * 11) * 25).toFixed(2);
const demoStartingSalary = (Number(demoBasicSalary) - 50).toFixed(2);
const demoBankAccountTail = String(1000 + Math.floor(profileRandom() * 9000));
const demoEmploymentFlags = ["No", "Yes"] as const;
const randomDemoFlag = () => chooseDemoValue([...demoEmploymentFlags]);
const demoEmploymentStatus = chooseDemoValue(["CONTRACTUAL", "PROBATIONARY", "REGULAR"]);

const demoHireDate = new Date(
  todayStart.getFullYear() - 1 - Math.floor(profileRandom() * 5),
  Math.floor(profileRandom() * 12),
  1 + Math.floor(profileRandom() * 27),
);
const demoProbationaryDate = new Date(demoHireDate);
demoProbationaryDate.setMonth(demoProbationaryDate.getMonth() + 6);
const demoRegularizedDate = new Date(demoHireDate);
demoRegularizedDate.setFullYear(demoRegularizedDate.getFullYear() + 1);
const demoContractEndDate = new Date(demoHireDate);
demoContractEndDate.setFullYear(demoContractEndDate.getFullYear() + 1);
const formatProfileDate = (date: Date) => formatDemoDate(dateKey(date), {
  month: "long",
  day: "2-digit",
  year: "numeric",
});

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
  dateHired: formatProfileDate(demoHireDate),
  dateApplied: formatProfileDate(new Date(demoHireDate.getFullYear(), demoHireDate.getMonth(), Math.max(1, demoHireDate.getDate() - 14))),
  probationaryDate: formatProfileDate(demoProbationaryDate),
  dateRegularized: demoEmploymentStatus === "REGULAR" ? formatProfileDate(demoRegularizedDate) : "-",
  endOfContract: demoEmploymentStatus === "CONTRACTUAL" ? formatProfileDate(demoContractEndDate) : "-",
  taxStatus: "S/0 · Sample",
  tin: "DEMO-TIN-****",
  sss: "DEMO-SSS-****",
  pagIbig: "DEMO-HDMF-****",
  philHealth: "DEMO-PHIC-****",
  gsis: "Not applicable · Sample",
  manager: demoManagerName,
  store: demoStore,
  employmentStatus: `${demoEmploymentStatus} · SAMPLE`,
  company: "RCS Demo Retail Corporation",
  location: demoLocation.toUpperCase(),
  employeeCategory: demoEmployeeCategory,
  rank: demoRank,
  jobLevel: demoJobLevel,
  division: demoDivision,
  section: demoSection,
  baseOffice: demoBaseOffice,
  salaryClassification: demoSalaryClassification,
  pagIbigCode: chooseDemoValue(["PAG1", "PAG2", "PAG3"]),
  projectCode: chooseDemoValue(["-", "DEMO-OPS", "SAMPLE-RETAIL"]),
  basicSalary: demoBasicSalary,
  startingSalary: demoStartingSalary,
  memberIdNumber: "DEMO-****",
  peraaIdNumber: "DEMO-****",
  bankCode: chooseDemoValue(["DEMO SAVINGS", "SAMPLE BANK", "RETAIL DEMO BANK"]),
  bankAccountType: chooseDemoValue(["SA", "CA"]),
  atmAccountNumber: `**** ${demoBankAccountTail}`,
  employmentFlags: {
    salaryOnHold: randomDemoFlag(),
    salaryForCheck: randomDemoFlag(),
    isContractual: demoEmploymentStatus === "CONTRACTUAL" ? "Yes" : "No",
    inactiveDevice: randomDemoFlag(),
    allowedToLogin: randomDemoFlag(),
    tax: randomDemoFlag(),
    hrisStatus: randomDemoFlag(),
    sss: randomDemoFlag(),
    payrollStatus: randomDemoFlag(),
    philHealth: randomDemoFlag(),
    tksStatus: randomDemoFlag(),
    thirteenthMonth: randomDemoFlag(),
    unionMember: randomDemoFlag(),
    pagIbig: randomDemoFlag(),
    agency: randomDemoFlag(),
    completionBonus: randomDemoFlag(),
    confidential: randomDemoFlag(),
    incentiveLeave: randomDemoFlag(),
    providentFund: randomDemoFlag(),
  },
  employmentRemarks: chooseDemoValue(["Sample profile for demonstration.", "No additional demo remarks.", "Fictional employee record."]),
};

function buildDemoAttendance(
  date: Date,
  includeToday = false,
): DemoAttendanceRecord | null {
  const key = dateKey(date);
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if ((!includeToday && start >= todayStart) || isRestDay(start)) return null;

  const absence = getAbsenceType(start);
  if (absence) return buildAbsenceRecord(key, absence);

  const random = createDateRandom(key);

  const clockIn =
    random() < LATE_ARRIVAL_CHANCE
      ? 8 * 60 + 31 + Math.floor(random() * 10)
      : 8 * 60 + 20 + Math.floor(random() * 11);
  const lunchOut = 11 * 60 + Math.floor(random() * 61);
  const afternoonBreakOut = 15 * 60 + 1 + Math.floor(random() * 90);

  const lunchDuration =
    random() < LATE_LUNCH_CHANCE
      ? ALLOWED_LUNCH_MINUTES + 1 + Math.floor(random() * 5)
      : ALLOWED_LUNCH_MINUTES - 8 + Math.floor(random() * 9);

  const breakDuration =
    random() < LATE_BREAK_CHANCE
      ? ALLOWED_BREAK_MINUTES + 1 + Math.floor(random() * 4)
      : ALLOWED_BREAK_MINUTES - 5 + Math.floor(random() * 6);
  const lunchIn = lunchOut + lunchDuration;
  const safeBreakOut = Math.min(afternoonBreakOut, 17 * 60 - breakDuration);
  const afternoonBreakIn = safeBreakOut + breakDuration;
  const clockOut = 17 * 60 + 30;

  const lateByMinutes = Math.max(0, clockIn - (8 * 60 + 30));
  const lunchOverMinutes = Math.max(0, lunchDuration - ALLOWED_LUNCH_MINUTES);
  const breakOverMinutes = Math.max(0, breakDuration - ALLOWED_BREAK_MINUTES);
  const totalLateMinutes = lateByMinutes + lunchOverMinutes + breakOverMinutes;

  const shiftSpanMinutes = clockOut - (8 * 60 + 30);
  const unpaidLunchMinutes = ALLOWED_LUNCH_MINUTES;
  const paidBreakMinutes = ALLOWED_BREAK_MINUTES;
  const scheduledPaidMinutes = STANDARD_PAID_DAY_MINUTES;
  const paidMinutes = scheduledPaidMinutes - totalLateMinutes;

  return {
    date: key,
    status: totalLateMinutes > 0 ? "Late" : "Present",
    lateByMinutes,
    lunchOverMinutes,
    breakOverMinutes,
    totalLateMinutes,
    scheduledShift: "8:30 AM – 5:30 PM",
    shiftSpanMinutes,
    unpaidLunchMinutes,
    paidBreakMinutes,
    scheduledPaidMinutes,
    paidMinutes,
    punches: [
      { direction: "IN", label: "Check in", time: formatPunchTime(clockIn) },
      { direction: "OUT", label: "Lunch out", time: formatPunchTime(lunchOut) },
      { direction: "IN", label: "Lunch in", time: formatPunchTime(lunchIn) },
      {
        direction: "OUT",
        label: "Afternoon break out",
        time: formatPunchTime(safeBreakOut),
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

export function getDemoAttendance(date: Date): DemoAttendanceRecord | null {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (todayStart.getTime() - start.getTime() > 35 * 24 * 60 * 60 * 1000)
    return null;
  return buildDemoAttendance(date);
}

export function getDemoCurrentDayAttendance(
  now: Date = new Date(),
): DemoCurrentDayAttendance {
  const record = buildDemoAttendance(now, true);
  if (!record || record.status === "SIL" || record.status === "LWOP") {
    return { record, latestPunch: null };
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const availablePunches = record.punches.filter(
    (punch) => getPunchMinutes(punch.time) <= currentMinutes,
  );
  const currentRecord = { ...record, punches: availablePunches };
  return {
    record: currentRecord,
    latestPunch: availablePunches[availablePunches.length - 1] ?? null,
  };
}

export function getDemoAttendanceForPayroll(
  date: Date,
): DemoAttendanceRecord | null {
  return buildDemoAttendance(date, true);
}

export function getDemoMonthlyLateSummary(date: Date): DemoMonthlyLateSummary {
  const year = date.getFullYear();
  const month = date.getMonth();
  const now = new Date();
  const finalDay = Math.min(
    date.getDate(),
    new Date(year, month + 1, 0).getDate(),
  );
  let lateDays = 0;
  let lateMinutes = 0;
  let offenseNumber = 0;
  let silDays = 0;
  let lwopDays = 0;

  for (let day = 1; day <= finalDay; day += 1) {
    const isToday =
      year === now.getFullYear() &&
      month === now.getMonth() &&
      day === now.getDate();
    const todayAttendance = isToday ? getDemoCurrentDayAttendance(now) : null;
    const record = todayAttendance?.record ?? getDemoAttendance(new Date(year, month, day));
    if (record?.status === "SIL") silDays += 1;
    if (record?.status === "LWOP") lwopDays += 1;
    const dayLateMinutes = isToday
      ? todayAttendance?.latestPunch
        ? record?.lateByMinutes ?? 0
        : 0
      : record?.totalLateMinutes ?? 0;
    if (dayLateMinutes > 0) {
      lateDays += 1;
      lateMinutes += dayLateMinutes;

      if (lateDays >= 12 || lateMinutes >= 120) offenseNumber += 1;
    }
  }

  const reached = lateDays >= 12 || lateMinutes >= 120;
  return {
    lateDays,
    lateMinutes,
    sanctionThresholdReached: reached,
    sanction: offenseNumber > 0 ? getLateSanction(offenseNumber) : null,
    silDays,
    lwopDays,
  };
}

export function getRecentDemoAttendance() {
  for (let daysAgo = 1; daysAgo <= 7; daysAgo += 1) {
    const date = new Date(todayStart);
    date.setDate(date.getDate() - daysAgo);
    const record = getDemoAttendance(date);

    if (record && record.punches.length > 0) return record;
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

export function getDemoAbsenceForKey(key: string): "SIL" | "LWOP" | null {
  const [year, month, day] = key.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date >= todayStart || isRestDay(date)) return null;
  return getAbsenceType(date);
}

export function getDemoAbsenceDates(month: Date) {
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const key = dateKey(
      new Date(month.getFullYear(), month.getMonth(), index + 1),
    );
    return getDemoAbsenceForKey(key) ? key : null;
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
  {
    id: "DEMO-APP-1010",
    type: "Leave",
    summary: "Vacation leave · 2 days",
    submittedAt: relativeDate(-35),
    status: "Approved",
    details: [
      { label: "Leave type", value: "Vacation Leave" },
      { label: "Date from", value: formatDemoDate(relativeDate(-32)) },
      { label: "Date to", value: formatDemoDate(relativeDate(-31)) },
      { label: "Applied days", value: "2" },
      { label: "Period", value: "Whole Day" },
      { label: "Reason", value: "Family errand · Sample" },
    ],
    approvers: [
      {
        name: demoEmployee.manager,
        role: "Immediate supervisor",
        status: "Approved",
        actedAt: relativeDate(-34),
      },
      {
        name: "Paolo Reyes",
        role: "HR approver",
        status: "Approved",
        actedAt: relativeDate(-33),
      },
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
    used: silDaysUsedThisYear().toFixed(1),
    total: "5.0",
    from: "2026-01-01",
    to: "2026-12-31",
    updated: relativeDate(-1),
    chargedTo: "SIL",
  },
  {
    type: "Emergency Leave",
    used: "0.0",
    total: "5.0",
    from: "2026-12-31",
    to: "2027-01-01",
    updated: relativeDate(-1),
    chargedTo: "Emergency Leave",
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
  {
    type: "Emergency loan",
    total: "₱5,000.00",
    date: relativeDate(-30),
    deduction: "₱500.00",
    balance: "₱2,500.00",
  },
  {
    type: "Personal loan",
    total: "₱8,000.00",
    date: relativeDate(-60),
    deduction: "₱400.00",
    balance: "₱3,200.00",
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

const formatMoney = (value: number) =>
  value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const actualPayrollOverrides: Record<
  string,
  {
    daysWorked: number;
    basicPay: number;
    tardinessDeduction?: number;
    sssDeduction: number;
    philHealthDeduction?: number;
    pagIbigDeduction?: number;
    position?: string;
  }
> = {
  "2026-10-01": {
    daysWorked: 12,
    basicPay: 9000,
    tardinessDeduction: 1.57,
    sssDeduction: 450,
    philHealthDeduction: 487.5,
    pagIbigDeduction: 200,
    position: "PROGRAMMER",
  },
  "2026-10-16": {
    daysWorked: 14,
    basicPay: 10500,
    sssDeduction: 525,
    position: "PROGRAMMER",
  },
};

function adjustForWeekend(date: Date) {
  const day = date.getDay();
  if (day === 6) date.setDate(date.getDate() - 1);
  if (day === 0) date.setDate(date.getDate() - 2);
  return date;
}

function getScheduledWorkdays(start: Date, end: Date) {
  let workdays = 0;
  for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    if (!isRestDay(day)) workdays += 1;
  }
  return workdays;
}

function getDemoPayrollTotals(start: Date, end: Date) {
  const actualPayroll = actualPayrollOverrides[dateKey(start)];
  let daysWorked = 0;
  const scheduledWorkdays = actualPayroll
    ? actualPayroll.daysWorked
    : getScheduledWorkdays(start, end);
  let silDays = 0;
  let lwopDays = 0;
  let lateMinutes = 0;

  if (!actualPayroll) {
    for (const day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
      if (isRestDay(day)) continue;
      const record = getDemoAttendanceForPayroll(new Date(day));
      if (!record) continue;
      if (record.status === "LWOP") {
        lwopDays += 1;
        continue;
      }
      if (record.status === "SIL") {
        silDays += 1;
        continue;
      }
      daysWorked += 1;
      lateMinutes += record.totalLateMinutes;
    }
  } else {
    daysWorked = actualPayroll.daysWorked;
  }

  const basicDays = scheduledWorkdays - silDays;
  const regularHours = basicDays * HOURS_PER_DAY;
  const basicPay =
    actualPayroll?.basicPay ??
    round2(regularHours * (DAILY_RATE / HOURS_PER_DAY));
  const silPay = round2(silDays * DAILY_RATE);
  const lwopPay = -round2(lwopDays * DAILY_RATE);
  const paidDays = daysWorked + silDays;
  const tardiness =
    actualPayroll?.tardinessDeduction !== undefined
      ? -actualPayroll.tardinessDeduction
      : -tardinessDeduction(lateMinutes);
  const tardinessHours =
    actualPayroll?.tardinessDeduction !== undefined
      ? actualPayroll.tardinessDeduction / (DAILY_RATE / HOURS_PER_DAY)
      : lateMinutes / 60;

  return {
    daysWorked,
    silDays,
    lwopDays,
    lateMinutes,
    basicDays,
    regularHours,
    basicPay,
    silPay,
    lwopPay,
    paidDays,
    tardiness,
    tardinessHours,
    totalEarnings: round2(basicPay + silPay + lwopPay + tardiness),
  };
}

function getDemoMonthlyPayrollTotals(year: number, month: number) {
  const firstCutoff = getDemoPayrollTotals(
    new Date(year, month, 1),
    new Date(year, month, 15),
  );
  const secondCutoff = getDemoPayrollTotals(
    new Date(year, month, 16),
    new Date(year, month + 1, 0),
  );

  return {
    totalEarnings: round2(firstCutoff.totalEarnings + secondCutoff.totalEarnings),
  };
}

function buildDemoPayslips(count: number): DemoPayslip[] {
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

  const ytd: Record<number, { earnings: number; net: number }> = {};
  const slips = periods
    .filter((period) => period.payday <= todayStart)
    .map((period): DemoPayslip => {
      const year = period.start.getFullYear();
      const cutoff: 1 | 2 = period.start.getDate() === 1 ? 1 : 2;
      const actualPayroll = actualPayrollOverrides[dateKey(period.start)];
      const payroll = getDemoPayrollTotals(period.start, period.end);
      const {
        silDays,
        lwopDays,
        basicDays,
        regularHours,
        basicPay,
        silPay,
        lwopPay,
        paidDays,
        tardiness,
        tardinessHours,
        totalEarnings,
      } = payroll;

      const deductionItems = actualPayroll
        ? [
            { description: "SSS Payable", amount: actualPayroll.sssDeduction },
            ...(actualPayroll.philHealthDeduction !== undefined
              ? [{
                  description: "PhilHealth Payable",
                  amount: actualPayroll.philHealthDeduction,
                }]
              : []),
            ...(actualPayroll.pagIbigDeduction !== undefined
              ? [{
                  description: "HDMF Payable",
                  amount: actualPayroll.pagIbigDeduction,
                }]
              : []),
          ]
        : [
            {
              description: "SSS Payable",
              amount: sssEmployeeShare(totalEarnings),
            },
            ...(cutoff === 1
              ? [
                  {
                    description: "PhilHealth Payable",
                    amount: philHealthEmployeeShare(
                      getDemoMonthlyPayrollTotals(
                        year,
                        period.start.getMonth(),
                      ).totalEarnings,
                    ),
                  },
                  {
                    description: "HDMF Payable",
                    amount: PAGIBIG_EMPLOYEE_CONTRIBUTION,
                  },
                ]
              : []),
          ];
      const totalDeductions = round2(
        deductionItems.reduce((sum, item) => sum + item.amount, 0),
      );
      const netIncome = round2(totalEarnings - totalDeductions);

      const running = ytd[year] ?? { earnings: 0, net: 0 };
      running.earnings = round2(running.earnings + totalEarnings);
      running.net = round2(running.net + netIncome);
      ytd[year] = running;

      return {
        payrollDate: formatDemoDate(dateKey(period.payday), {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        payPeriod: `${formatDemoDate(dateKey(period.start), longDate)} - ${formatDemoDate(dateKey(period.end), longDate)}`,
        totalEarnings: formatMoney(totalEarnings),
        totalDeductions: formatMoney(totalDeductions),
        netIncome: formatMoney(netIncome),
        ytdBasic: formatMoney(running.earnings),
        ytdTaxable: formatMoney(running.net),
        ytdTaxWithheld: "",
        taxStatus: "",
        position: actualPayroll?.position ?? demoEmployee.designation,
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
        noOfHours: (paidDays * HOURS_PER_DAY).toFixed(2),
        noOfDays: paidDays.toFixed(2),
        basicRate: DAILY_RATE.toFixed(2),
        earnings: [
          {
            description: "Basic Pay",
            hours: regularHours.toFixed(2),
            days: basicDays.toFixed(2),
            amount: formatMoney(basicPay),
          },
          ...(silDays > 0
            ? [
                {
                  description: "Service Incentive Leave",
                  hours: (silDays * HOURS_PER_DAY).toFixed(2),
                  days: silDays.toFixed(2),
                  amount: formatMoney(silPay),
                },
              ]
            : []),
          ...(lwopDays > 0
            ? [
                {
                  description: "LWOP (Unpaid Absence)",
                  hours: (lwopDays * HOURS_PER_DAY).toFixed(2),
                  days: lwopDays.toFixed(2),
                  amount: formatMoney(lwopPay),
                },
              ]
            : []),
          ...(tardiness < 0
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

  return slips.reverse().slice(0, count);
}

export const demoPayslip = buildDemoPayslips(4);

export const demoAnnouncements = [
  {
    id: "DEMO-NEWS-01",
    category: "PAYROLL",
    date: relativeDate(-1),
    title: "Payroll schedule reminder",
    body: "This sample notice demonstrates how payroll updates can be shared with employees. Check the posted payroll calendar for your pay-period dates.",
    content: [
      "To help you plan ahead, please check the posted payroll calendar for the pay-period coverage and expected crediting dates.",
      "Cut-off dates and processing schedules may vary when a scheduled date falls on a weekend or holiday. Please review the official payroll notice for the applicable period before making arrangements.",
      "For questions about your individual payroll record, contact your HR or payroll representative through the approved company channel.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-02",
    category: "STORE OPERATIONS",
    date: relativeDate(-3),
    title: "Quarterly store safety review",
    body: "Store teams should review the safety checklist with their supervisor. This is fictional presentation content, not an active company notice.",
    content: [
      "All store teams are encouraged to review the current workplace safety checklist with their supervisor during the quarterly safety review.",
      "Please check that aisles and exits remain clear, report damaged equipment promptly, and confirm that emergency supplies are accessible. Raise any concerns through your store's established reporting process.",
      "This is fictional presentation content and does not replace official safety instructions.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-03",
    category: "PEOPLE & CULTURE",
    date: relativeDate(-7),
    title: "Benefits enrollment window",
    body: "A sample benefits reminder with an example enrollment window and next steps for employees.",
    content: [
      "Employees are encouraged to review their current benefits selections and confirm that their personal information is up to date.",
      "If an enrollment window applies to you, refer to the official benefits communication for the dates, eligibility rules, required forms, and submission instructions. Supporting documents should be sent only through the approved company channel.",
      "Contact your HR representative if you need help understanding the enrollment process. This sample notice does not describe an active enrollment period.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-04",
    category: "GENERAL",
    date: relativeDate(-10),
    title: "Company-wide meeting",
    body: "Join us for the monthly company meeting to discuss updates and upcoming initiatives.",
    content: [
      "Employees are invited to the monthly company-wide meeting to hear organizational updates and learn about upcoming initiatives.",
      "The meeting date, time, venue, and any joining instructions will be shared through the official company announcement. Please coordinate with your supervisor if your work schedule affects your availability.",
      "This is a fictional example notice for presentation purposes.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-05",
    category: "STORE OPERATIONS",
    date: relativeDate(-15),
    title: "Inventory audit schedule",
    body: "Store teams should prepare for the upcoming inventory audit. This is a sample notice for demonstration purposes.",
    content: [
      "Store teams should prepare for the upcoming inventory audit by following the schedule and preparation checklist issued by their supervisor.",
      "Keep stock areas organized, make sure required records are available, and report discrepancies using the established store process. Your supervisor will confirm the audit date and any location-specific instructions.",
      "This is a sample notice and is not an active audit schedule.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-06",
    category: "PEOPLE & CULTURE",
    date: relativeDate(-20),
    title: "Annual performance review window",
    body: "Performance reviews will be conducted this quarter. Please ensure all documentation is up to date.",
    content: [
      "The annual performance review is an opportunity for employees and supervisors to discuss accomplishments, goals, and development needs.",
      "Please review any applicable work records and prepare topics you would like to discuss. Your supervisor or HR representative will share the confirmed review schedule and process.",
      "This is fictional presentation content, not an active review schedule.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-07",
    category: "GENERAL",
    date: relativeDate(-25),
    title: "Holiday schedule announcement",
    body: "The company will observe the following holidays. Please plan accordingly.",
    content: [
      "Employees should refer to the official holiday schedule and their assigned work schedule when planning for upcoming holidays.",
      "Store operations and staffing arrangements may differ by location and role. Your supervisor will communicate any applicable schedule changes and reporting instructions.",
      "This sample announcement does not set or confirm actual company holiday operations.",
    ].join("\n\n"),
  },
  {
    id: "DEMO-NEWS-08",
    category: "PAYROLL",
    date: relativeDate(-30),
    title: "Tax filing deadline reminder",
    body: "Ensure all necessary documents are submitted before the tax filing deadline. This is a sample notice for demonstration purposes.",
    content: [
      "Please review the official tax filing instructions and submit any required employee information by the deadline communicated by HR or payroll.",
      "Check that the information on your submitted documents is complete and accurate. Use only approved company channels when sending personal or tax-related information.",
      "This is a fictional reminder and does not contain an active deadline.",
    ].join("\n\n"),
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
  "Aaron Anthony Anderson",
  "Rafael Cruz",
  "Bianca Reyes",
  "Paolo Garcia",
  "Leah Mendoza",
  "Marco Lim",
  "Nina Flores",
  "Andre Ramos",
  "Clara Dela Cruz",
  "Luis Navarro",
  "Trisha Bautista",
  "Enzo Villanueva",
  "Grace Aquino",
  "Noel Castillo",
  "Lara Mendoza",
  "Rina Santiago",
  "Paolo Reyes",
  "Isabel Cruz",
  "Mateo Salazar",
  "Lucia Mercado",
  "Rafael Dominguez",
  "Amara Navarro",
  "Nico Villanueva",
  "Talia Castillo",
  "Elias Salazar",
  "Sofia Mercado",
  "Inez Dominguez",
];
const demoAnniversaries = [
  { name: "Carlo Lim", years: 4 },
  { name: "Janelle Dizon", years: 2 },
  { name: "Luis Navarro", years: 7 },
  { name: "Trisha Bautista", years: 1 },
  { name: "Enzo Villanueva", years: 5 },
  { name: "Grace Aquino", years: 3 },
  { name: "Noel Castillo", years: 9 },
  { name: "Lara Mendoza", years: 6 },
  { name: "Rina Santiago", years: 8 },
  { name: "Paolo Reyes", years: 10 },
  { name: "Isabel Cruz", years: 2 },
  { name: "Mateo Salazar", years: 4 },
  { name: "Lucia Mercado", years: 1 },
  { name: "Rafael Dominguez", years: 3 },
  { name: "Amara Navarro", years: 5 },
  { name: "Nico Villanueva", years: 7 },
  { name: "Talia Castillo", years: 6 },
  { name: "Elias Salazar", years: 8 },
  { name: "Sofia Mercado", years: 9 },
  { name: "Inez Dominguez", years: 10 },
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
    { label: "Account number", value: "DEMO-ACCOUNT-0001 · not a real account" },
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
    { label: "Member number", value: "DEMO-HIP-0001 · not a real member number" },
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
