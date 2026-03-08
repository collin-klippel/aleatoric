import type { EnumValue } from '@docs-shared/lib/docs-api-reference-types';

/** Scale / mode names for `Scale.create`, `Scale.types`, and `SCALE_TYPE_NAMES`. */
export const SCALE_TYPE_ENUM_DOCS: readonly EnumValue[] = [
  { value: 'major', description: 'Ionian mode' },
  { value: 'minor', description: 'Aeolian mode (natural minor)' },
  {
    value: 'harmonicMinor',
    description: 'Natural minor with raised 7th',
  },
  {
    value: 'melodicMinor',
    description: 'Natural minor with raised 6th and 7th',
  },
  {
    value: 'pentatonic',
    description: 'Major pentatonic (5-note scale)',
  },
  {
    value: 'minorPentatonic',
    description: 'Minor pentatonic (5-note scale)',
  },
  { value: 'blues', description: 'Blues scale (6-note scale)' },
  { value: 'chromatic', description: 'All 12 semitones' },
  {
    value: 'wholeTone',
    description: 'Whole-tone scale (6 whole steps)',
  },
  {
    value: 'octatonic',
    description: 'Octatonic (8-note diminished) scale',
  },
  { value: 'dorian', description: 'Dorian mode' },
  { value: 'phrygian', description: 'Phrygian mode' },
  { value: 'lydian', description: 'Lydian mode' },
  { value: 'mixolydian', description: 'Mixolydian mode' },
  {
    value: 'aeolian',
    description: 'Aeolian mode (same intervals as natural minor)',
  },
  { value: 'locrian', description: 'Locrian mode' },
];

export const CHORD_QUALITY_ENUM_DOCS: readonly EnumValue[] = [
  {
    value: 'major',
    description: 'Major triad (root, major 3rd, perfect 5th)',
  },
  {
    value: 'minor',
    description: 'Minor triad (root, minor 3rd, perfect 5th)',
  },
  {
    value: 'diminished',
    description: 'Diminished triad (root, minor 3rd, diminished 5th)',
  },
  {
    value: 'augmented',
    description: 'Augmented triad (root, major 3rd, augmented 5th)',
  },
  { value: 'major7', description: 'Major 7th chord' },
  { value: 'minor7', description: 'Minor 7th chord' },
  { value: 'dominant7', description: 'Dominant 7th chord' },
  { value: 'diminished7', description: 'Diminished 7th chord' },
  {
    value: 'halfDiminished7',
    description: 'Half-diminished 7th chord (minor 7b5)',
  },
  { value: 'major9', description: 'Major 9th chord' },
  { value: 'minor9', description: 'Minor 9th chord' },
  { value: 'dominant9', description: 'Dominant 9th chord' },
  { value: 'sus2', description: 'Suspended 2nd chord' },
  { value: 'sus4', description: 'Suspended 4th chord' },
];

export const DURATION_NAME_ENUM_DOCS: readonly EnumValue[] = [
  { value: 'whole', description: '4 beats' },
  { value: 'half', description: '2 beats' },
  { value: 'quarter', description: '1 beat' },
  { value: 'eighth', description: '0.5 beats' },
  { value: 'sixteenth', description: '0.25 beats' },
  { value: 'thirtySecond', description: '0.125 beats' },
  { value: 'sixtyFourth', description: '0.0625 beats' },
];

export const PITCH_DISTRIBUTION_ENUM_DOCS: readonly EnumValue[] = [
  { value: 'uniform', description: 'Equal probability across range' },
  {
    value: 'gaussian',
    description: 'Bell curve centered on range midpoint',
  },
  {
    value: 'edges',
    description: 'Clustered toward high and low bounds',
  },
];

export const CHANCE_METHOD_ENUM_DOCS: readonly EnumValue[] = [
  { value: 'coin', description: 'Coin flip (heads/tails)' },
  { value: 'iching', description: 'I Ching hexagram casting' },
  { value: 'random', description: 'Uniform random selection' },
];

export const CELLULAR_PITCH_MAPPING_ENUM_DOCS: readonly EnumValue[] = [
  {
    value: 'scale',
    description: 'Map to degrees of the current scale',
  },
  {
    value: 'chromatic',
    description: 'Map to all 12 chromatic pitches',
  },
];

/** Member names of `Interval` / `INTERVAL_ENUM_MEMBERS`. */
export const INTERVAL_ENUM_MEMBER_DOCS: readonly EnumValue[] = [
  { value: 'Unison', description: '0 semitones' },
  { value: 'MinorSecond', description: '1 semitone (half step)' },
  { value: 'MajorSecond', description: '2 semitones (whole step)' },
  { value: 'MinorThird', description: '3 semitones' },
  { value: 'MajorThird', description: '4 semitones' },
  { value: 'PerfectFourth', description: '5 semitones' },
  {
    value: 'Tritone',
    description: '6 semitones (augmented 4th / diminished 5th)',
  },
  { value: 'PerfectFifth', description: '7 semitones' },
  { value: 'MinorSixth', description: '8 semitones' },
  { value: 'MajorSixth', description: '9 semitones' },
  { value: 'MinorSeventh', description: '10 semitones' },
  { value: 'MajorSeventh', description: '11 semitones' },
  { value: 'Octave', description: '12 semitones' },
];

export const CONTOUR_DIRECTION_ENUM_DOCS: readonly EnumValue[] = [
  { value: 'ascending', description: 'Notes rise in pitch' },
  { value: 'descending', description: 'Notes fall in pitch' },
  { value: 'arch', description: 'Rise then fall' },
  { value: 'valley', description: 'Fall then rise' },
];
