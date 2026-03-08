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
  'halfDiminished7',
  'major9',
  'minor9',
  'dominant9',
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

  cellular: `import { generateCellularAutomata, Scale, SeededRng } from 'aleatoric';

// Conway's Game of Life — seed determines the initial cell state
const events = generateCellularAutomata({
  steps: 24,
  width: 16,
  stepDuration: 0.25,
  scale: Scale.create('C', 'pentatonic'),
  pitchMapping: 'scale',
  rng: new SeededRng(42),
});`,

  perlinNoise: `import {
  generatePerlinNoiseMelody,
  parsePitch,
  pitchToMidi,
  Scale,
  SeededRng,
  Timeline,
  MidiPlayer,
  type MidiOutput,
} from 'aleatoric';

const scale = Scale.pentatonic('C');
const events = generatePerlinNoiseMelody({
  count: 120,
  low: pitchToMidi(parsePitch('C2')),
  high: pitchToMidi(parsePitch('C6')),
  scale,
  duration: 0.5,
  velocity: 80,
  rng: new SeededRng(42),
});
const timeline = new Timeline(events);

// Provide any MidiOutput implementation (Web MIDI, easymidi, etc.)
const output: MidiOutput = { name: 'my-synth', send(data) { /* ... */ } };
const player = new MidiPlayer(output, timeline, { bpm: 96, loop: true });
player.play();`,

  'dice-music': `import { createSimpleDiceTable, generateDiceMusic, SeededRng } from 'aleatoric';

// Keys are 2d6 sums (2–12). Each value is one or more measure columns.
const table = createSimpleDiceTable({
  2: [[60, 62, 64, 65], [62, 64, 65, 67]],
  7: [[60, 64, 67, 72], [64, 67, 72, 76]],
  12: [[72, 71, 69, 67]],
}, 0.5, 80);

const events = generateDiceMusic({
  measures: 16,
  table,
  rng: new SeededRng(99),
});`,
};
