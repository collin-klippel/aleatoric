import { Duration, DurationValue, TimeSignature } from './types.js';

/** Standard duration values in beats (where 1 = quarter note) */
export const DURATIONS = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
  thirtySecond: 0.125,
  sixtyFourth: 0.0625,
} as const;

export type DurationName = keyof typeof DURATIONS;

/** Keys of `DURATIONS` / names accepted by `createDuration` as a string value. */
export const DURATION_NAMES = Object.keys(DURATIONS) as DurationName[];

export function createDuration(
  value: DurationValue | DurationName,
  options?: { dotted?: boolean; triplet?: boolean },
): Duration {
  const baseValue = typeof value === 'string' ? DURATIONS[value] : value;
  return {
    value: baseValue,
    dotted: options?.dotted,
    triplet: options?.triplet,
  };
}

/** Actual duration in beats accounting for dot and triplet modifiers */
export function effectiveDuration(dur: Duration): number {
  let value = dur.value;
  if (dur.dotted) value *= 1.5;
  if (dur.triplet) value *= 2 / 3;
  return value;
}

/** Convert beats to seconds at a given BPM */
export function beatsToSeconds(beats: number, bpm: number): number {
  return (beats / bpm) * 60;
}

/** Convert seconds to beats at a given BPM */
export function secondsToBeats(seconds: number, bpm: number): number {
  return (seconds * bpm) / 60;
}

/** Number of beats in a measure for the given time signature */
export function beatsPerMeasure(ts: TimeSignature): number {
  const [beats, beatUnit] = ts;
  return beats * (4 / beatUnit);
}

/** Get all standard duration values that fit within a beat count */
export function durationsWithinBeats(beats: number): DurationValue[] {
  return Object.values(DURATIONS).filter((d) => d <= beats);
}

/** Subdivide a number of beats into equal parts */
export function subdivideBeat(beats: number, divisions: number): DurationValue {
  return beats / divisions;
}

export function isDurationName(value: string): value is DurationName {
  return value in DURATIONS;
}
