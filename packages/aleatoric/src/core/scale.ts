import { midiToPitch, normalizeNoteName } from './note.js';
import { NOTE_NAMES, NoteName, Octave, Pitch } from './types.js';

export interface ScaleDefinition {
  name: string;
  intervals: number[];
}

const SCALE_INTERVALS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  minor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  pentatonic: [0, 2, 4, 7, 9],
  minorPentatonic: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  wholeTone: [0, 2, 4, 6, 8, 10],
  octatonic: [0, 2, 3, 5, 6, 8, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
} as const;

export type ScaleType = keyof typeof SCALE_INTERVALS;

/** All scale type names accepted by `Scale.create` (same as `Scale.types`). */
export const SCALE_TYPE_NAMES: ScaleType[] = Object.keys(
  SCALE_INTERVALS,
) as ScaleType[];

export class Scale {
  readonly root: NoteName;
  readonly intervals: number[];
  readonly name: string;

  private constructor(root: NoteName, intervals: number[], name: string) {
    this.root = root;
    this.intervals = intervals;
    this.name = name;
  }

  static create(root: NoteName | string, type: string): Scale {
    const normalized = normalizeNoteName(root);
    const raw = SCALE_INTERVALS[type as ScaleType];
    if (!raw) throw new Error(`Unknown scale type: ${type}`);
    return new Scale(normalized, [...raw], type);
  }

  static major(root: NoteName | string): Scale {
    return Scale.create(root, 'major');
  }
  static minor(root: NoteName | string): Scale {
    return Scale.create(root, 'minor');
  }
  static harmonicMinor(root: NoteName | string): Scale {
    return Scale.create(root, 'harmonicMinor');
  }
  static melodicMinor(root: NoteName | string): Scale {
    return Scale.create(root, 'melodicMinor');
  }
  static pentatonic(root: NoteName | string): Scale {
    return Scale.create(root, 'pentatonic');
  }
  static minorPentatonic(root: NoteName | string): Scale {
    return Scale.create(root, 'minorPentatonic');
  }
  static blues(root: NoteName | string): Scale {
    return Scale.create(root, 'blues');
  }
  static chromatic(root: NoteName | string): Scale {
    return Scale.create(root, 'chromatic');
  }
  static wholeTone(root: NoteName | string): Scale {
    return Scale.create(root, 'wholeTone');
  }
  static octatonic(root: NoteName | string): Scale {
    return Scale.create(root, 'octatonic');
  }
  static dorian(root: NoteName | string): Scale {
    return Scale.create(root, 'dorian');
  }
  static phrygian(root: NoteName | string): Scale {
    return Scale.create(root, 'phrygian');
  }
  static lydian(root: NoteName | string): Scale {
    return Scale.create(root, 'lydian');
  }
  static mixolydian(root: NoteName | string): Scale {
    return Scale.create(root, 'mixolydian');
  }
  static aeolian(root: NoteName | string): Scale {
    return Scale.create(root, 'aeolian');
  }
  static locrian(root: NoteName | string): Scale {
    return Scale.create(root, 'locrian');
  }

  /** All available scale type names */
  static get types(): ScaleType[] {
    return [...SCALE_TYPE_NAMES];
  }

  private rootSemitone(): number {
    return NOTE_NAMES.indexOf(this.root);
  }

  /** Get all pitches in this scale within the given octave range */
  getPitches(lowOctave: Octave = 0, highOctave: Octave = 8): Pitch[] {
    const pitches: Pitch[] = [];
    for (let oct = lowOctave; oct <= highOctave; oct++) {
      for (const interval of this.intervals) {
        const midi = (oct + 1) * 12 + this.rootSemitone() + interval;
        if (midi >= 0 && midi <= 127) {
          pitches.push(midiToPitch(midi));
        }
      }
    }
    return pitches;
  }

  /** Check if a pitch belongs to this scale (ignoring octave) */
  contains(pitch: Pitch): boolean {
    const semitone =
      (((NOTE_NAMES.indexOf(pitch.name) - this.rootSemitone()) % 12) + 12) % 12;
    return this.intervals.includes(semitone);
  }

  /** Get the scale degree (0-indexed) of a pitch, or -1 if not in scale */
  degreeOf(pitch: Pitch): number {
    const semitone =
      (((NOTE_NAMES.indexOf(pitch.name) - this.rootSemitone()) % 12) + 12) % 12;
    return this.intervals.indexOf(semitone);
  }

  /** Snap a MIDI number to the nearest pitch in this scale */
  nearest(midi: number): Pitch {
    const rootOffset = this.rootSemitone();
    let bestDist = Infinity;
    let bestMidi = midi;

    for (let delta = -6; delta <= 6; delta++) {
      const candidate = midi + delta;
      const semitone = ((((candidate % 12) + 12) % 12) - rootOffset + 12) % 12;
      if (this.intervals.includes(semitone)) {
        if (Math.abs(delta) < bestDist) {
          bestDist = Math.abs(delta);
          bestMidi = candidate;
        }
      }
    }

    return midiToPitch(bestMidi);
  }

  /** Get the nth degree pitch starting from a given octave */
  degree(n: number, octave: Octave = 4): Pitch {
    const len = this.intervals.length;
    const octaveShift = Math.floor(n / len);
    const idx = ((n % len) + len) % len;
    const midi =
      (octave + octaveShift + 1) * 12 +
      this.rootSemitone() +
      this.intervals[idx];
    return midiToPitch(midi);
  }
}
