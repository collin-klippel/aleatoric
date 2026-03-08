import type { LSystemInterpretation, ProductionRule } from 'aleatoric';

export const MELODIES: Record<string, number[]> = {
  twinkle: [
    60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62, 62, 60, 67, 67, 65, 65, 64,
    64, 62, 67, 67, 65, 65, 64, 64, 62,
  ],
  ode: [
    64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62, 64, 64, 65, 67,
    67, 65, 64, 62, 60, 60, 62, 64, 62, 60, 60,
  ],
  blues: [60, 63, 65, 66, 67, 70, 72, 70, 67, 66, 65, 63, 60, 58, 55, 58, 60],
};

export interface LPreset {
  axiom: string;
  rules: ProductionRule[];
  interpretation: LSystemInterpretation;
}

export const L_PRESETS: Record<string, LPreset> = {
  fibonacci: {
    axiom: 'A',
    rules: [
      { match: 'A', replacement: 'AB' },
      { match: 'B', replacement: 'A' },
    ],
    interpretation: {
      A: { type: 'note' },
      B: { type: 'pitchUp', semitones: 2 },
    },
  },
  dragon: {
    axiom: 'FX',
    rules: [
      { match: 'X', replacement: 'X+YF+' },
      { match: 'Y', replacement: '-FX-Y' },
    ],
    interpretation: {
      F: { type: 'note' },
      '+': { type: 'pitchUp', semitones: 3 },
      '-': { type: 'pitchDown', semitones: 2 },
      X: { type: 'noop' },
      Y: { type: 'noop' },
    },
  },
  plant: {
    axiom: 'F',
    rules: [{ match: 'F', replacement: 'F[+F]F[-F]F' }],
    interpretation: {
      F: { type: 'note' },
      '+': { type: 'pitchUp', semitones: 5 },
      '-': { type: 'pitchDown', semitones: 3 },
      '[': { type: 'push' },
      ']': { type: 'pop' },
    },
  },
};

export const NOTE_NAMES_LIST = [
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

export const CHORD_QUALITIES = [
  'major',
  'minor',
  'diminished',
  'augmented',
  'major7',
  'minor7',
  'dominant7',
  'diminished7',
  'sus2',
  'sus4',
] as const;

export const CODE_EXAMPLES: Record<string, string> = {
  scales: `import { Scale, pitchToString } from 'aleatoric';

const scale = Scale.create('C', 'major');
const pitches = scale.getPitches(4, 5); // octaves 4–5
pitches.map(pitchToString); // ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5']

// 16 built-in scale types
Scale.types; // ['major', 'minor', 'dorian', 'pentatonicMajor', ...]`,

  chords: `import { Chord, pitchToString } from 'aleatoric';

const chord = Chord.create('C', 'major7');
const pitches = chord.getPitches(4); // rooted at octave 4
pitches.map(pitchToString); // ['C4', 'E4', 'G4', 'B4']

// Supported qualities: major, minor, diminished, augmented,
// major7, minor7, dominant7, diminished7, sus2, sus4`,

  'random-pitch': `import { generateRandomPitches, Scale, SeededRng } from 'aleatoric';

const events = generateRandomPitches({
  count: 16,
  low: 48,                // lowest MIDI note
  high: 84,               // highest MIDI note
  scale: Scale.create('C', 'pentatonic'),
  distribution: 'gaussian', // 'uniform' | 'gaussian' | 'edges'
  duration: 0.5,          // beats per note
  rng: new SeededRng(42),
});`,

  'random-rhythm': `import { generateRandomRhythm, SeededRng } from 'aleatoric';

const events = generateRandomRhythm({
  count: 16,
  restProbability: 0.15, // 15% chance of rest per step
  midi: 60,
  rng: new SeededRng(7),
});
// durations drawn from standard note values (whole → sixteenth)`,

  markov: `import { buildMidiTransitionMatrix, generateMarkovSequence, SeededRng } from 'aleatoric';

const source = [60, 60, 67, 67, 69, 69, 67, 65, 65, 64, 64, 62]; // melody

// Build nth-order transition matrix from a MIDI sequence
const matrix = buildMidiTransitionMatrix(source, 2); // 2nd-order

const events = generateMarkovSequence({
  count: 24,
  transitionMatrix: matrix,
  duration: 0.4,
  rng: new SeededRng(42),
});`,

  'chance-ops': `import { generateChanceOps, SeededRng } from 'aleatoric';

// Cage-style: each parameter is determined independently by chance
const events = generateChanceOps({
  count: 16,
  method: 'iching', // 'random' | 'coin' | 'iching'
  mapping: {
    pitchRange: [48, 84],
    durationRange: [0.25, 1.5],
    velocityRange: [50, 110],
    restProbability: 0.15,
  },
  rng: new SeededRng(11),
});`,

  lsystem: `import { generateLSystem, SeededRng } from 'aleatoric';

// Fibonacci sequence → ascending melodic pattern
const events = generateLSystem({
  axiom: 'A',
  rules: [
    { match: 'A', replacement: 'AB' },
    { match: 'B', replacement: 'A' },
  ],
  interpretation: {
    'A': { type: 'note' },
    'B': { type: 'pitchUp', semitones: 2 },
  },
  iterations: 4,
  baseDuration: 0.3,
  rng: new SeededRng(42),
});`,

  cellular: `import { generateCellularAutomata, Scale, SeededRng } from 'aleatoric';

const events = generateCellularAutomata({
  steps: 24,
  width: 16,
  rule: 30,          // Wolfram rule number (0–255)
  mode: '1d',        // '1d' Wolfram | '2d' Game of Life
  stepDuration: 0.25,
  scale: Scale.create('C', 'pentatonic'),
  pitchMapping: 'scale',
  rng: new SeededRng(42),
});`,

  constraints: `import {
  generateRandomPitches, applyConstraints,
  ScaleConstraint, MaxLeapConstraint, ContourConstraint,
  Scale, SeededRng,
} from 'aleatoric';

const raw = generateRandomPitches({
  count: 20, low: 36, high: 96, duration: 0.5, rng: new SeededRng(42),
});

const constrained = applyConstraints(raw, [
  new ScaleConstraint(Scale.major('C')), // snap pitches to scale
  new MaxLeapConstraint(5),              // limit melodic leaps
  new ContourConstraint('arch'),         // impose arch contour shape
]);`,

  synths: `import { OscillatorSynth, FMSynth, AleatoricAudio } from 'aleatoric-web';

const audio = new AleatoricAudio();

// Standard oscillator synth
const sine = new OscillatorSynth(audio.context, { waveform: 'sine' });
const square = new OscillatorSynth(audio.context, { waveform: 'square' });

// FM synthesis — modulator shapes the carrier timbre
const bell = new FMSynth(audio.context, {
  waveform: 'sine',
  modRatio: 3.5,  // modulator freq = carrier × ratio
  modIndex: 8,    // modulation depth
});`,

  composition: `import {
  buildMidiTransitionMatrix, generateMarkovSequence,
  generateLSystem, generateCellularAutomata,
  applyConstraints, ScaleConstraint, RangeConstraint,
  Scale, SeededRng,
} from 'aleatoric';

const rng = new SeededRng(42);
const sourceNotes = [64, 64, 65, 67, 67, 65, 64, 62, 60]; // Ode to Joy

// Melody: Markov chain constrained to C major, mid-range
const matrix = buildMidiTransitionMatrix(sourceNotes, 2);
let melody = generateMarkovSequence({
  count: 32, transitionMatrix: matrix, duration: 0.5, rng: rng.fork(),
});
melody = applyConstraints(melody, [
  new ScaleConstraint(Scale.major('C')), new RangeConstraint(60, 84),
]);

// Bass: L-system constrained to low range
let bass = generateLSystem({
  axiom: 'F', iterations: 3,
  rules: [{ match: 'F', replacement: 'F[+F]-F' }],
  interpretation: {
    'F': { type: 'note' },
    '+': { type: 'pitchUp', semitones: 7 },
    '-': { type: 'pitchDown', semitones: 5 },
    '[': { type: 'push' }, ']': { type: 'pop' },
  },
  baseDuration: 1, rng: rng.fork(),
});
bass = applyConstraints(bass, [new RangeConstraint(36, 55)]);

// Percussion: cellular automata as rhythmic hits
const perc = generateCellularAutomata({
  steps: 32, width: 4, rule: 110, stepDuration: 0.5,
  pitchMapping: [42, 38, 45, 49], rng: rng.fork(),
});`,

  ambient: `import { generateAmbientTimeline, Scale, SeededRng } from 'aleatoric';
import { AleatoricAudio, OscillatorSynth, Player } from 'aleatoric-web';

const audio = new AleatoricAudio({ masterVolume: 0.5 });
const synth = new OscillatorSynth(audio.context, {
  waveform: 'sine',
  envelope: { attack: 1.5, decay: 0, sustain: 1, release: 3 },
});

const scale = Scale.pentatonic('C');
const timeline = generateAmbientTimeline({
  low: 'C2', high: 'C6', scale, bpm: 20,
  durationRange: [6, 12],   // note length in seconds [min, max]
  gapRange: [3, 7],          // onset gap in seconds [min, max]
  harmonyProbability: 0.3,   // 30% chance of simultaneous harmony note
  totalDuration: 300,        // pre-generate 5 minutes of material
  rng: new SeededRng(42),
});

// Player loops seamlessly, generating infinite ambient texture
const player = new Player(
  audio.context, timeline, synth, audio.destination,
  { bpm: 20, loop: true },
);
await audio.resume();
player.start();`,
};
