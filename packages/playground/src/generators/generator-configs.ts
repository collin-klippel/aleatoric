import {
  buildMidiTransitionMatrix,
  CHANCE_METHODS,
  generateCellularAutomata,
  generateChanceOps,
  generateMarkovSequence,
  generatePerlinNoiseMelody,
  generateRandomPitches,
  generateRandomRhythm,
  type MusicEvent,
  PITCH_DISTRIBUTIONS,
  type PitchDistribution,
  pitchToMidi,
  SCALE_TYPE_NAMES,
  Scale,
  type ScaleType,
  SeededRng,
  Timeline,
} from 'aleatoric';

// ────────────────────────────────────────────────────────────
// Parameter definition types
// ────────────────────────────────────────────────────────────

export type ParamType = 'slider' | 'select' | 'number';

export interface ParamDef {
  id: string;
  label: string;
  type: ParamType;
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  options?: readonly string[];
  description?: string;
}

export interface GeneratorConfig {
  id: string;
  label: string;
  description: string;
  params: ParamDef[];
  generate: (params: Record<string, number | string>) => MusicEvent[];
}

// ────────────────────────────────────────────────────────────
// Scale helper
// ────────────────────────────────────────────────────────────

const NOTE_NAMES_LIST = [
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

function midiToNoteName(midi: number): string {
  return NOTE_NAMES_LIST[midi % 12] ?? 'C';
}

function makeScale(scaleName: string, rootMidi: number): Scale {
  const rootName = midiToNoteName(rootMidi);
  return Scale.create(rootName, scaleName as ScaleType);
}

// ────────────────────────────────────────────────────────────
// Markov helper – build a matrix from a simple scale
// ────────────────────────────────────────────────────────────

function buildScaleMatrix(
  rootMidi: number,
  scaleName: string,
): Record<string, Record<string, number>> {
  const scale = makeScale(scaleName, rootMidi);
  // Get pitches across 2 octaves centred on the root
  const baseOctave = Math.max(0, Math.floor(rootMidi / 12) - 2) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8;
  const highOctave = Math.min(8, baseOctave + 2) as
    | 0
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8;
  const pitches = scale.getPitches(baseOctave, highOctave);
  if (pitches.length === 0) return {};
  const midiNotes = pitches.map((p) => pitchToMidi(p));
  return buildMidiTransitionMatrix(midiNotes);
}

// ────────────────────────────────────────────────────────────
// Velocity range helper
// ────────────────────────────────────────────────────────────

function applyVelocityRange(
  events: MusicEvent[],
  min: number,
  max: number,
): MusicEvent[] {
  if (min >= max) return events;
  return events.map((ev) =>
    ev.isRest
      ? ev
      : { ...ev, velocity: Math.round(min + Math.random() * (max - min)) },
  );
}

// ────────────────────────────────────────────────────────────
// Generator registry
// ────────────────────────────────────────────────────────────

export const GENERATORS: GeneratorConfig[] = [
  {
    id: 'random-pitch',
    label: 'Random Pitches',
    description:
      'Generates notes drawn randomly from a configurable pitch range and scale.',
    params: [
      {
        id: 'count',
        label: 'Note Count',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'low',
        label: 'Low MIDI',
        type: 'slider',
        default: 48,
        min: 24,
        max: 84,
        step: 1,
      },
      {
        id: 'high',
        label: 'High MIDI',
        type: 'slider',
        default: 84,
        min: 36,
        max: 108,
        step: 1,
      },
      {
        id: 'duration',
        label: 'Note Length (beats)',
        type: 'slider',
        default: 0.5,
        min: 0.25,
        max: 4,
        step: 0.25,
      },
      {
        id: 'velocityMin',
        label: 'Velocity Min',
        type: 'slider',
        default: 40,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'velocityMax',
        label: 'Velocity Max',
        type: 'slider',
        default: 80,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'scale',
        label: 'Scale',
        type: 'select',
        default: 'major',
        options: SCALE_TYPE_NAMES,
      },
      {
        id: 'distribution',
        label: 'Distribution',
        type: 'select',
        default: 'uniform',
        options: PITCH_DISTRIBUTIONS,
        description:
          "Only these three modes exist in aleatoric's random pitch generator: uniform (flat over the pool), gaussian (center-weighted), edges (biased to low and high).",
      },
    ],
    generate(params) {
      const scale = makeScale(params.scale as string, 60);
      const events = generateRandomPitches({
        count: params.count as number,
        low: params.low as number,
        high: params.high as number,
        duration: params.duration as number,
        velocity: params.velocityMin as number,
        scale,
        distribution: params.distribution as PitchDistribution,
      });
      return applyVelocityRange(
        events,
        params.velocityMin as number,
        params.velocityMax as number,
      );
    },
  },

  {
    id: 'random-rhythm',
    label: 'Random Rhythm',
    description:
      'Generates a rhythmic sequence using random duration selection with configurable rest probability.',
    params: [
      {
        id: 'count',
        label: 'Event Count',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'midi',
        label: 'MIDI Note',
        type: 'slider',
        default: 60,
        min: 36,
        max: 84,
        step: 1,
      },
      {
        id: 'velocityMin',
        label: 'Velocity Min',
        type: 'slider',
        default: 40,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'velocityMax',
        label: 'Velocity Max',
        type: 'slider',
        default: 80,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'restProbability',
        label: 'Rest Probability',
        type: 'slider',
        default: 0.15,
        min: 0,
        max: 0.8,
        step: 0.05,
      },
      {
        id: 'density',
        label: 'Density (events/beat)',
        type: 'slider',
        default: 2,
        min: 0.5,
        max: 8,
        step: 0.5,
      },
    ],
    generate(params) {
      const events = generateRandomRhythm({
        count: params.count as number,
        midi: params.midi as number,
        velocity: params.velocityMin as number,
        restProbability: params.restProbability as number,
        density: params.density as number,
      });
      return applyVelocityRange(
        events,
        params.velocityMin as number,
        params.velocityMax as number,
      );
    },
  },

  {
    id: 'markov',
    label: 'Markov Sequence',
    description:
      'Generates notes using a Markov chain transition matrix built from a scale.',
    params: [
      {
        id: 'count',
        label: 'Note Count',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'rootMidi',
        label: 'Root Note (MIDI)',
        type: 'slider',
        default: 60,
        min: 36,
        max: 84,
        step: 1,
      },
      {
        id: 'duration',
        label: 'Note Length (beats)',
        type: 'slider',
        default: 0.5,
        min: 0.25,
        max: 4,
        step: 0.25,
      },
      {
        id: 'velocityMin',
        label: 'Velocity Min',
        type: 'slider',
        default: 40,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'velocityMax',
        label: 'Velocity Max',
        type: 'slider',
        default: 80,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'scale',
        label: 'Scale',
        type: 'select',
        default: 'major',
        options: SCALE_TYPE_NAMES,
      },
    ],
    generate(params) {
      const matrix = buildScaleMatrix(
        params.rootMidi as number,
        params.scale as string,
      );
      if (Object.keys(matrix).length === 0) return [];
      const events = generateMarkovSequence({
        count: params.count as number,
        transitionMatrix: matrix,
        statesAreMidi: true,
        duration: params.duration as number,
        velocity: params.velocityMin as number,
      });
      return applyVelocityRange(
        events,
        params.velocityMin as number,
        params.velocityMax as number,
      );
    },
  },

  {
    id: 'cellular-automata',
    label: 'Cellular Automata',
    description:
      "Conway's Game of Life — each generation step becomes a chord voicing mapped to pitches.",
    params: [
      {
        id: 'steps',
        label: 'Steps',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'width',
        label: 'Width',
        type: 'slider',
        default: 8,
        min: 4,
        max: 16,
        step: 1,
      },
      {
        id: 'seed',
        label: 'RNG Seed',
        type: 'number',
        default: 42,
        min: 1,
        description: 'Seed for the random initial cell state',
      },
      {
        id: 'stepDuration',
        label: 'Step Duration (beats)',
        type: 'slider',
        default: 0.25,
        min: 0.125,
        max: 2,
        step: 0.125,
      },
      {
        id: 'velocityMin',
        label: 'Velocity Min',
        type: 'slider',
        default: 40,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'velocityMax',
        label: 'Velocity Max',
        type: 'slider',
        default: 72,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'baseOctave',
        label: 'Base Octave',
        type: 'slider',
        default: 3,
        min: 1,
        max: 6,
        step: 1,
      },
      {
        id: 'scale',
        label: 'Scale',
        type: 'select',
        default: 'pentatonic',
        options: SCALE_TYPE_NAMES,
      },
    ],
    generate(params) {
      const events = generateCellularAutomata({
        steps: params.steps as number,
        width: params.width as number,
        stepDuration: params.stepDuration as number,
        velocity: params.velocityMin as number,
        baseOctave: params.baseOctave as number,
        pitchMapping: 'scale',
        scale: makeScale(params.scale as string, 60),
        rng: new SeededRng(params.seed as number),
      });
      return applyVelocityRange(
        events,
        params.velocityMin as number,
        params.velocityMax as number,
      );
    },
  },

  {
    id: 'chance-ops',
    label: 'Chance Operations',
    description:
      'Generates events using chance-based methods (coin flip, I Ching hexagram, or pure random).',
    params: [
      {
        id: 'count',
        label: 'Event Count',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'pitchLow',
        label: 'Pitch Low (MIDI)',
        type: 'slider',
        default: 48,
        min: 24,
        max: 84,
        step: 1,
      },
      {
        id: 'pitchHigh',
        label: 'Pitch High (MIDI)',
        type: 'slider',
        default: 84,
        min: 36,
        max: 108,
        step: 1,
      },
      {
        id: 'durationMin',
        label: 'Duration Min (beats)',
        type: 'slider',
        default: 0.25,
        min: 0.125,
        max: 2,
        step: 0.125,
      },
      {
        id: 'durationMax',
        label: 'Duration Max (beats)',
        type: 'slider',
        default: 1,
        min: 0.25,
        max: 4,
        step: 0.25,
      },
      {
        id: 'restProbability',
        label: 'Rest Probability',
        type: 'slider',
        default: 0.1,
        min: 0,
        max: 0.8,
        step: 0.05,
      },
      {
        id: 'velocityMin',
        label: 'Velocity Min',
        type: 'slider',
        default: 40,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'velocityMax',
        label: 'Velocity Max',
        type: 'slider',
        default: 120,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'method',
        label: 'Method',
        type: 'select',
        default: 'random',
        options: CHANCE_METHODS,
      },
    ],
    generate(params) {
      return generateChanceOps({
        count: params.count as number,
        method: params.method as 'coin' | 'iching' | 'random',
        mapping: {
          pitchRange: [params.pitchLow as number, params.pitchHigh as number],
          durationRange: [
            params.durationMin as number,
            params.durationMax as number,
          ],
          velocityRange: [
            params.velocityMin as number,
            params.velocityMax as number,
          ],
          restProbability: params.restProbability as number,
        },
      });
    },
  },

  {
    id: 'perlin-noise',
    label: 'Perlin Noise Melody',
    description:
      'Generates smooth, continuous pitch contours using Perlin-like noise interpolation for coherent melodies.',
    params: [
      {
        id: 'count',
        label: 'Note Count',
        type: 'slider',
        default: 16,
        min: 4,
        max: 64,
        step: 1,
      },
      {
        id: 'low',
        label: 'Low MIDI',
        type: 'slider',
        default: 48,
        min: 24,
        max: 84,
        step: 1,
      },
      {
        id: 'high',
        label: 'High MIDI',
        type: 'slider',
        default: 84,
        min: 36,
        max: 108,
        step: 1,
      },
      {
        id: 'duration',
        label: 'Note Length (beats)',
        type: 'slider',
        default: 0.5,
        min: 0.25,
        max: 4,
        step: 0.25,
      },
      {
        id: 'velocity',
        label: 'Velocity',
        type: 'slider',
        default: 80,
        min: 1,
        max: 127,
        step: 1,
      },
      {
        id: 'frequency',
        label: 'Frequency',
        type: 'slider',
        default: 4,
        min: 1,
        max: 16,
        step: 1,
        description: 'Number of waypoints per measure (controls smoothness)',
      },
      {
        id: 'scale',
        label: 'Scale',
        type: 'select',
        default: 'major',
        options: SCALE_TYPE_NAMES,
      },
    ],
    generate(params) {
      const scale = makeScale(params.scale as string, 60);
      return generatePerlinNoiseMelody({
        count: params.count as number,
        low: params.low as number,
        high: params.high as number,
        duration: params.duration as number,
        velocity: params.velocity as number,
        frequency: params.frequency as number,
        scale,
      });
    },
  },
];

export function getGenerator(id: string): GeneratorConfig | undefined {
  return GENERATORS.find((g) => g.id === id);
}

export function eventsToTimeline(events: MusicEvent[]): Timeline {
  return new Timeline(events);
}
