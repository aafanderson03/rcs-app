import { dateKey } from '@/data/demo-data';

export type Holiday = {
  /** YYYY-MM-DD */
  date: string;
  name: string;
  scope: 'National' | 'Tarlac';
  kind: string;
};

const REGULAR = 'Regular holiday';
const SPECIAL = 'Special non-working day';

function lastMondayOfAugust(year: number) {
  const date = new Date(year, 7, 31);
  while (date.getDay() !== 1) date.setDate(date.getDate() - 1);
  return date;
}

/**
 * Holidays for a year. Fixed-date holidays work for any year. Holidays that move or are
 * proclaimed year by year (Holy Week, Eid'l Fitr, Chinese New Year, Nov 2, Dec 24, Dec 31)
 * are listed for 2026 only, from Proclamation No. 1006. Update this list each year.
 * Eid'l Adha is left out because its date is proclaimed separately.
 */
export function getHolidays(year: number): Holiday[] {
  const day = (month: number, d: number) => dateKey(new Date(year, month - 1, d));

  const list: Holiday[] = [
    { date: day(1, 1), name: "New Year's Day", scope: 'National', kind: REGULAR },
    { date: day(4, 9), name: 'Araw ng Kagitingan', scope: 'National', kind: REGULAR },
    { date: day(5, 1), name: 'Labor Day', scope: 'National', kind: REGULAR },
    { date: day(6, 12), name: 'Independence Day', scope: 'National', kind: REGULAR },
    { date: dateKey(lastMondayOfAugust(year)), name: 'National Heroes Day', scope: 'National', kind: REGULAR },
    { date: day(8, 21), name: 'Ninoy Aquino Day', scope: 'National', kind: SPECIAL },
    { date: day(11, 1), name: "All Saints' Day", scope: 'National', kind: SPECIAL },
    { date: day(11, 30), name: 'Bonifacio Day', scope: 'National', kind: REGULAR },
    { date: day(12, 8), name: 'Feast of the Immaculate Conception', scope: 'National', kind: SPECIAL },
    { date: day(12, 25), name: 'Christmas Day', scope: 'National', kind: REGULAR },
    { date: day(12, 30), name: 'Rizal Day', scope: 'National', kind: REGULAR },
    // Tarlac: Proclamation No. 109 (1999) sets May 28 for the whole province. The city charter
    // day is observed in Tarlac City and is declared by proclamation each year.
    { date: day(5, 28), name: 'Araw ng Lalawigan ng Tarlac', scope: 'Tarlac', kind: 'Special day · province' },
    { date: day(4, 19), name: 'Tarlac City Charter Day', scope: 'Tarlac', kind: 'Special day · Tarlac City' },
  ];

  if (year === 2026) {
    list.push(
      { date: day(2, 17), name: 'Chinese New Year', scope: 'National', kind: SPECIAL },
      { date: day(3, 20), name: "Eid'l Fitr", scope: 'National', kind: REGULAR },
      { date: day(4, 2), name: 'Maundy Thursday', scope: 'National', kind: REGULAR },
      { date: day(4, 3), name: 'Good Friday', scope: 'National', kind: REGULAR },
      { date: day(4, 4), name: 'Black Saturday', scope: 'National', kind: SPECIAL },
      { date: day(11, 2), name: "All Souls' Day", scope: 'National', kind: SPECIAL },
      { date: day(12, 24), name: 'Christmas Eve', scope: 'National', kind: SPECIAL },
      { date: day(12, 31), name: 'Last Day of the Year', scope: 'National', kind: SPECIAL }
    );
  }

  return list.sort((a, b) => a.date.localeCompare(b.date));
}
