import { createPitch, normalizeNoteName, transpose } from './note.js';
import { NoteName, Octave, Pitch } from './types.js';

const CHORD_INTERVALS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  diminished7: [0, 3, 6, 9],
  halfDiminished7: [0, 3, 6, 10],
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14],
  dominant9: [0, 4, 7, 10, 14],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
} as const;

export type ChordQuality = keyof typeof CHORD_INTERVALS;

/** All values accepted as `Chord.create` quality. */
export const CHORD_QUALITIES: ChordQuality[] = Object.keys(
  CHORD_INTERVALS,
) as ChordQuality[];

export class Chord {
  readonly root: NoteName;
  readonly quality: ChordQuality;
  readonly intervals: number[];

  private constructor(root: NoteName, quality: ChordQuality) {
    this.root = root;
    this.quality = quality;
    this.intervals = [...CHORD_INTERVALS[quality]];
  }

  static create(root: NoteName | string, quality: ChordQuality): Chord {
    return new Chord(normalizeNoteName(root), quality);
  }

  static major(root: NoteName | string): Chord {
    return Chord.create(root, 'major');
  }
  static minor(root: NoteName | string): Chord {
    return Chord.create(root, 'minor');
  }
  static diminished(root: NoteName | string): Chord {
    return Chord.create(root, 'diminished');
  }
  static augmented(root: NoteName | string): Chord {
    return Chord.create(root, 'augmented');
  }
  static dominant7(root: NoteName | string): Chord {
    return Chord.create(root, 'dominant7');
  }
  static major7(root: NoteName | string): Chord {
    return Chord.create(root, 'major7');
  }
  static minor7(root: NoteName | string): Chord {
    return Chord.create(root, 'minor7');
  }

  /** Get chord pitches rooted at the given octave */
  getPitches(octave: Octave = 4): Pitch[] {
    const rootPitch = createPitch(this.root, octave);
    return this.intervals.map((i) => transpose(rootPitch, i));
  }

  /** Get an inversion of the chord (0 = root position, 1 = first, etc.) */
  inversion(n: number, octave: Octave = 4): Pitch[] {
    const pitches = this.getPitches(octave);
    const inv = ((n % pitches.length) + pitches.length) % pitches.length;
    const result: Pitch[] = [];
    for (let i = 0; i < pitches.length; i++) {
      const idx = (i + inv) % pitches.length;
      let p = pitches[idx];
      if (i > 0 && idx < inv) {
        p = transpose(p, 12);
      }
      result.push(p);
    }
    return result;
  }

  /** Get the note names (without octave) of chord tones */
  noteNames(): NoteName[] {
    return this.getPitches(4).map((p) => p.name);
  }
}
