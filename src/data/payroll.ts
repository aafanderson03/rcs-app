export const DAILY_RATE = 750;
export const HOURS_PER_DAY = 8;
export const PAGIBIG_EMPLOYEE_CONTRIBUTION = 200;

export type ContributionSchedule = "split" | "first" | "second";
export const CONTRIBUTION_SCHEDULE: ContributionSchedule = "split";

export const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function sssMonthlySalaryCredit(monthlyCompensation: number) {
  if (monthlyCompensation < 5250) return 5000;
  if (monthlyCompensation >= 34750) return 35000;
  return Math.floor((monthlyCompensation + 250) / 500) * 500;
}

export function sssEmployeeShare(monthlyCompensation: number) {
  return round2(monthlyCompensation * 0.05);
}

export function philHealthEmployeeShare(monthlyBasicSalary: number) {
  return round2(monthlyBasicSalary * 0.025);
}

export function pagIbigEmployeeShare(monthlyCompensation: number) {
  const rate = monthlyCompensation <= 1500 ? 0.01 : 0.02;
  return round2(Math.min(monthlyCompensation, 10000) * rate);
}

export function amountForCutoff(
  monthlyAmount: number,
  cutoff: 1 | 2,
  schedule: ContributionSchedule = CONTRIBUTION_SCHEDULE,
) {
  if (schedule === "first") return cutoff === 1 ? monthlyAmount : 0;
  if (schedule === "second") return cutoff === 2 ? monthlyAmount : 0;
  const firstHalf = round2(monthlyAmount / 2);
  return cutoff === 1 ? firstHalf : round2(monthlyAmount - firstHalf);
}

export function tardinessDeduction(
  lateMinutes: number,
  dailyRate = DAILY_RATE,
) {
  return round2(lateMinutes * (dailyRate / (HOURS_PER_DAY * 60)));
}
