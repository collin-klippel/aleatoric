export enum Interval {
  Unison = 0,
  MinorSecond = 1,
  MajorSecond = 2,
  MinorThird = 3,
  MajorThird = 4,
  PerfectFourth = 5,
  Tritone = 6,
  PerfectFifth = 7,
  MinorSixth = 8,
  MajorSixth = 9,
  MinorSeventh = 10,
  MajorSeventh = 11,
  Octave = 12,
}

/** Member names of the `Interval` enum (excludes numeric reverse-map keys). */
export const INTERVAL_ENUM_MEMBERS = Object.keys(Interval).filter((k) =>
  Number.isNaN(Number(k)),
) as (keyof typeof Interval)[];

const INTERVAL_NAMES: Record<number, string> = {
  0: 'Unison',
  1: 'Minor 2nd',
  2: 'Major 2nd',
  3: 'Minor 3rd',
  4: 'Major 3rd',
  5: 'Perfect 4th',
  6: 'Tritone',
  7: 'Perfect 5th',
  8: 'Minor 6th',
  9: 'Major 6th',
  10: 'Minor 7th',
  11: 'Major 7th',
  12: 'Octave',
};

export function intervalName(semitones: number): string {
  const simple = ((semitones % 12) + 12) % 12;
  const octaves = Math.floor(Math.abs(semitones) / 12);
  const base = INTERVAL_NAMES[simple] ?? `${simple} semitones`;
  if (octaves > 1) return `${base} + ${octaves - 1} octave(s)`;
  if (octaves === 1 && simple !== 0) return `Compound ${base}`;
  return base;
}

export function invertInterval(semitones: number): number {
  return 12 - (((semitones % 12) + 12) % 12);
}

export function isConsonant(semitones: number): boolean {
  const simple = ((semitones % 12) + 12) % 12;
  return [0, 3, 4, 5, 7, 8, 9, 12].includes(simple);
}

export function simpleInterval(semitones: number): number {
  return ((semitones % 12) + 12) % 12;
}
