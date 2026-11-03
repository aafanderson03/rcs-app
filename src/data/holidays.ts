import { dateKey } from "@/data/demo-data";

export type Holiday = {
  date: string;
  name: string;
  scope: "National";
  kind: string;
};

const REGULAR = "Regular holiday";
const SPECIAL = "Special non-working day";

function lastMondayOfAugust(year: number) {
  const date = new Date(year, 7, 31);
  while (date.getDay() !== 1) date.setDate(date.getDate() - 1);
  return date;
}

function easterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function offsetDate(date: Date, offset: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + offset);
  return result;
}

export function getHolidays(year: number): Holiday[] {
  const day = (month: number, d: number) =>
    dateKey(new Date(year, month - 1, d));
  const holiday = (
    date: string,
    name: string,
    kind: string,
  ): Holiday => ({ date, name, scope: "National", kind });
  const easter = easterSunday(year);

  const list: Holiday[] = [
    holiday(day(1, 1), "New Year's Day", REGULAR),
    holiday(day(4, 9), "The Day of Valor", REGULAR),
    holiday(day(5, 1), "Labor Day", REGULAR),
    holiday(day(6, 12), "Independence Day", REGULAR),
    holiday(dateKey(lastMondayOfAugust(year)), "National Heroes Day", REGULAR),
    holiday(day(8, 21), "Ninoy Aquino Day", SPECIAL),
    holiday(day(11, 1), "All Saints' Day", SPECIAL),
    holiday(day(11, 2), "All Souls' Day", SPECIAL),
    holiday(day(11, 30), "Bonifacio Day", REGULAR),
    holiday(day(12, 8), "Feast of the Immaculate Conception of Mary", SPECIAL),
    holiday(day(12, 24), "Christmas Eve", SPECIAL),
    holiday(day(12, 25), "Christmas Day", REGULAR),
    holiday(day(12, 30), "Rizal Day", REGULAR),
    holiday(day(12, 31), "Last Day of the Year", SPECIAL),
    holiday(dateKey(offsetDate(easter, -3)), "Maundy Thursday", REGULAR),
    holiday(dateKey(offsetDate(easter, -2)), "Good Friday", REGULAR),
    holiday(dateKey(offsetDate(easter, -1)), "Black Saturday", SPECIAL),
  ];

  if (year === 2026) {
    list.push(
      holiday(day(2, 17), "Chinese New Year", SPECIAL),
      holiday(day(3, 20), "Eid Al Fitr", REGULAR),
      holiday(day(5, 27), "Eid Al Adha", REGULAR),
    );
  }

  return list.sort((a, b) => a.date.localeCompare(b.date));
}
