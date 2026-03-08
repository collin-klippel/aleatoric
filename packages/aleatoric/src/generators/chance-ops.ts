import { midiToFrequency, midiToPitch } from '../core/note.js';
import { MusicEvent } from '../core/types.js';
import { flipBool } from '../random/coin.js';
import {
  castHexagram,
  hexagramToInt,
  hexagramToRange,
} from '../random/iching.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

export const CHANCE_METHODS = ['coin', 'iching', 'random'] as const;

export type ChanceMethod = (typeof CHANCE_METHODS)[number];

export interface ParameterMapping {
  /** MIDI pitch range */
  pitchRange?: [number, number];
  /** Duration range in beats */
  durationRange?: [number, number];
  /** Velocity range */
  velocityRange?: [number, number];
  /** Probability of rest */
  restProbability?: number;
}

export interface ChanceOpsOptions {
  count: number;
  method: ChanceMethod;
  mapping: ParameterMapping;
  rng?: RandomSource;
}

/**
 * Cage-style chance operations: use random methods (coin flips, I Ching, etc.)
 * to determine every musical parameter independently.
 *
 * @see https://en.wikipedia.org/wiki/Indeterminacy_%28music%29
 */
export function generateChanceOps(options: ChanceOpsOptions): MusicEvent[] {
  const { count, method, mapping, rng = new DefaultRng() } = options;

  const {
    pitchRange = [36, 84],
    durationRange = [0.25, 4],
    velocityRange = [40, 120],
    restProbability = 0.15,
  } = mapping;

  const events: MusicEvent[] = [];
  let beat = 0;

  for (let i = 0; i < count; i++) {
    const isRest = determineBoolean(method, restProbability, rng);

    if (isRest) {
      const dur = determineFloat(
        method,
        durationRange[0],
        durationRange[1],
        rng,
      );
      events.push(
        createMusicEvent({
          midi: 0,
          frequency: 0,
          duration: { value: dur },
          velocity: 0,
          startBeat: beat,
          isRest: true,
        }),
      );
      beat += dur;
      continue;
    }

    const midi = determineInt(method, pitchRange[0], pitchRange[1], rng);
    const dur = determineFloat(method, durationRange[0], durationRange[1], rng);
    const vel = determineInt(method, velocityRange[0], velocityRange[1], rng);

    events.push(
      createMusicEvent({
        pitch: midiToPitch(midi),
        midi,
        frequency: midiToFrequency(midi),
        duration: { value: dur },
        velocity: vel,
        startBeat: beat,
      }),
    );

    beat += dur;
  }

  return events;
}

function determineInt(
  method: ChanceMethod,
  min: number,
  max: number,
  rng: RandomSource,
): number {
  switch (method) {
    case 'iching':
      return hexagramToInt(castHexagram(rng), min, max);
    case 'coin': {
      const span = max - min + 1;
      const bits = Math.ceil(Math.log2(span));
      const space = 1 << bits;
      const limit = Math.floor(space / span) * span;
      for (;;) {
        let value = 0;
        for (let b = 0; b < bits; b++) {
          if (flipBool(0.5, rng)) value |= 1 << b;
        }
        if (value < limit) return min + (value % span);
      }
    }
    default:
      return rng.nextInt(min, max);
  }
}

function determineFloat(
  method: ChanceMethod,
  min: number,
  max: number,
  rng: RandomSource,
): number {
  switch (method) {
    case 'iching':
      return hexagramToRange(castHexagram(rng), min, max);
    case 'coin': {
      // 8 coin flips for 256 gradations
      let value = 0;
      for (let b = 0; b < 8; b++) {
        if (flipBool(0.5, rng)) value |= 1 << b;
      }
      return min + (value / 255) * (max - min);
    }
    default:
      return min + rng.next() * (max - min);
  }
}

function determineBoolean(
  method: ChanceMethod,
  probability: number,
  rng: RandomSource,
): boolean {
  switch (method) {
    case 'iching': {
      const hex = castHexagram(rng);
      return hex.number / 64 < probability;
    }
    case 'coin':
      return flipBool(probability, rng);
    default:
      return rng.next() < probability;
  }
}
