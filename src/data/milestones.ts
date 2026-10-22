// Fictional birthdays and work anniversaries for the current month.
const birthdays = [
  { name: 'Mia Santos', day: 2 },
  { name: 'Rafael Cruz', day: 4 },
  { name: 'Bianca Reyes', day: 6 },
  { name: 'Paolo Garcia', day: 8 },
  { name: 'Leah Mendoza', day: 10 },
  { name: 'Marco Lim', day: 12 },
  { name: 'Nina Flores', day: 14 },
  { name: 'Andre Ramos', day: 16 },
  { name: 'Carmen Valdez', day: 18 },
  { name: 'Diego Soriano', day: 20 },
  { name: 'Hannah Tolentino', day: 22 },
  { name: 'Ian Bustamante', day: 24 },
  { name: 'Joy Manalo', day: 26 },
  { name: 'Kevin Aguilar', day: 28 },
];

const anniversaries = [
  { name: 'Carlo Lim', years: 4, day: 3 },
  { name: 'Janelle Dizon', years: 2, day: 5 },
  { name: 'Luis Navarro', years: 7, day: 8 },
  { name: 'Trisha Bautista', years: 1, day: 11 },
  { name: 'Enzo Villanueva', years: 5, day: 14 },
  { name: 'Grace Aquino', years: 3, day: 17 },
  { name: 'Noel Castillo', years: 9, day: 19 },
  { name: 'Maricel Padilla', years: 6, day: 21 },
  { name: 'Rommel Ocampo', years: 8, day: 23 },
  { name: 'Sheila Franco', years: 3, day: 25 },
  { name: 'Victor Lazaro', years: 10, day: 27 },
  { name: 'Wendy Pascual', years: 2, day: 29 },
];

export type Milestone = { name: string; date: string; past: boolean; years?: number };

export function getDemoMilestones(now: Date = new Date()) {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const format = (day: number) =>
    new Date(now.getFullYear(), now.getMonth(), Math.min(day, lastDay)).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });

  return {
    birthdays: birthdays.map((item): Milestone => ({
      name: item.name,
      date: format(item.day),
      past: item.day < now.getDate(),
    })),
    anniversaries: anniversaries.map((item): Milestone => ({
      name: item.name,
      years: item.years,
      date: format(item.day),
      past: item.day < now.getDate(),
    })),
  };
}
