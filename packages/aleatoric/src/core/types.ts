export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export type NoteName = (typeof NOTE_NAMES)[number];

export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface Pitch {
  name: NoteName;
  octave: Octave;
}

export type MidiNumber = number;

/** Velocity from 0 (silent) to 127 (max) */
export type Velocity = number;

/** Duration in beats (1 = quarter note at reference level) */
export type DurationValue = number;

export interface Duration {
  value: DurationValue;
  dotted?: boolean;
  triplet?: boolean;
}

export type TimeSignature = [beats: number, beatUnit: number];

export interface Tempo {
  bpm: number;
  beatUnit?: number;
}

export interface MusicEvent {
  pitch: Pitch | null;
  midi: MidiNumber;
  frequency: number;
  duration: Duration;
  velocity: Velocity;
  /** Absolute time in beats from the start of the piece */
  startBeat: number;
  /** Whether this event is a rest */
  isRest: boolean;
}

export interface PitchRange {
  low: Pitch;
  high: Pitch;
}
