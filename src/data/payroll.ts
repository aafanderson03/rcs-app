/**
 * Payroll rules used by the demo pay slips. No imports, so it can be used anywhere.
 *
 * Sources checked against 2026 schedules:
 *  - SSS: 15% of the Monthly Salary Credit (MSC), employee 5% / employer 10%.
 *         MSC runs from ₱5,000 to ₱35,000 in ₱500 steps.
 *  - PhilHealth: 5% of monthly basic salary, shared 50/50 (employee 2.5%).
 *         Salary base is limited to a ₱10,000 floor and a ₱100,000 ceiling.
 *  - Pag-IBIG (HDMF): employee 2% of monthly compensation (1% if ₱1,500 or less),
 *         with a ₱10,000 maximum fund salary, so the employee share tops out at ₱200.
 * Update the numbers below if these schedules change.
 */

export const DAILY_RATE = 750; // pesos per day
export const HOURS_PER_DAY = 8;
export const WORK_DAYS_PER_MONTH = 26; // six-day week: 313 days / 12 months

/**
 * How the monthly government contributions are taken from the two pay slips each month:
 *  'split'  - half on each pay slip (most common)
 *  'first'  - everything on the 1st-15th pay slip
 *  'second' - everything on the 16th-end pay slip
 */
export type ContributionSchedule = 'split' | 'first' | 'second';
export const CONTRIBUTION_SCHEDULE: ContributionSchedule = 'split';

export const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

/** Monthly Salary Credit for a monthly compensation, in ₱500 steps between 5,000 and 35,000. */
export function sssMonthlySalaryCredit(monthlyCompensation: number) {
  if (monthlyCompensation < 5250) return 5000;
  if (monthlyCompensation >= 34750) return 35000;
  return Math.floor((monthlyCompensation + 250) / 500) * 500;
}

/** Employee share of SSS for a month (5% of the MSC). */
export function sssEmployeeShare(monthlyCompensation: number) {
  return round2(sssMonthlySalaryCredit(monthlyCompensation) * 0.05);
}

/** Employee share of PhilHealth for a month (2.5% of basic salary, floor 10,000, ceiling 100,000). */
export function philHealthEmployeeShare(monthlyBasicSalary: number) {
  const base = Math.min(100000, Math.max(10000, monthlyBasicSalary));
  return round2((base * 0.05) / 2);
}

/** Employee share of Pag-IBIG for a month (2% of up to ₱10,000, or 1% if ₱1,500 or less). */
export function pagIbigEmployeeShare(monthlyCompensation: number) {
  const rate = monthlyCompensation <= 1500 ? 0.01 : 0.02;
  return round2(Math.min(monthlyCompensation, 10000) * rate);
}

/** The part of a monthly amount taken on a given pay slip (cutoff 1 = 1st-15th, 2 = 16th-end). */
export function amountForCutoff(
  monthlyAmount: number,
  cutoff: 1 | 2,
  schedule: ContributionSchedule = CONTRIBUTION_SCHEDULE
) {
  if (schedule === 'first') return cutoff === 1 ? monthlyAmount : 0;
  if (schedule === 'second') return cutoff === 2 ? monthlyAmount : 0;
  const firstHalf = round2(monthlyAmount / 2);
  return cutoff === 1 ? firstHalf : round2(monthlyAmount - firstHalf);
}

/** Pay lost for late minutes: minutes x (daily rate / minutes in a standard day). */
export function tardinessDeduction(lateMinutes: number, dailyRate = DAILY_RATE) {
  return round2(lateMinutes * (dailyRate / (HOURS_PER_DAY * 60)));
}
