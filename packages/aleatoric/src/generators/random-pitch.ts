import { midiToFrequency, midiToPitch } from '../core/note.js';
import { Scale } from '../core/scale.js';
import { MusicEvent } from '../core/types.js';
import { gaussian } from '../random/distributions.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

export const PITCH_DISTRIBUTIONS = ['uniform', 'gaussian', 'edges'] as const;

export type PitchDistribution = (typeof PITCH_DISTRIBUTIONS)[number];

export interface RandomPitchOptions {
  count: number;
  /** Lowest MIDI note (default 36 / C2) */
  low?: number;
  /** Highest MIDI note (default 84 / C6) */
  high?: number;
  /** Constrain pitches to a scale */
  scale?: Scale;
  /** Distribution shape for pitch selection */
  distribution?: PitchDistribution;
  /** Duration for each generated note (in beats, default 1) */
  duration?: number;
  /** Velocity for each note (default 80) */
  velocity?: number;
  rng?: RandomSource;
}

/**
 * Each pitch is drawn independently from the pool (no memory of the previous note).
 * Distribution shapes: uniform (full range), gaussian (clustered near middle of pool),
 * edges (bimodal toward low and high).
 */
export function generateRandomPitches(
  options: RandomPitchOptions,
): MusicEvent[] {
  const {
    count,
    low = 36,
    high = 84,
    scale,
    distribution = 'uniform',
    duration = 1,
    velocity = 80,
    rng = new DefaultRng(),
  } = options;

  const pool = buildPitchPool(low, high, scale);
  if (pool.length === 0) {
    throw new Error('No pitches available in the given range and scale');
  }

  const events: MusicEvent[] = [];
  let beat = 0;

  for (let i = 0; i < count; i++) {
    const midi = pickFromPool(pool, distribution, rng);
    const pitch = midiToPitch(midi);
    events.push(
      createMusicEvent({
        pitch,
        midi,
        frequency: midiToFrequency(midi),
        duration: { value: duration },
        velocity,
        startBeat: beat,
      }),
    );
    beat += duration;
  }

  return events;
}

function buildPitchPool(low: number, high: number, scale?: Scale): number[] {
  const pool: number[] = [];
  for (let midi = low; midi <= high; midi++) {
    if (scale) {
      const pitch = midiToPitch(midi);
      if (scale.contains(pitch)) pool.push(midi);
    } else {
      pool.push(midi);
    }
  }
  return pool;
}

function pickFromPool(
  pool: number[],
  distribution: PitchDistribution,
  rng: RandomSource,
): number {
  switch (distribution) {
    case 'uniform':
      return pool[rng.nextInt(0, pool.length - 1)];

    case 'gaussian': {
      const mean = pool.length / 2;
      const stddev = pool.length / 6;
      const idx = Math.max(
        0,
        Math.min(pool.length - 1, Math.round(gaussian(mean, stddev, rng))),
      );
      return pool[idx];
    }

    case 'edges': {
      // Bimodal: favor extremes
      const r = rng.next();
      if (r < 0.4) {
        return pool[rng.nextInt(0, Math.floor(pool.length * 0.2))];
      } else if (r < 0.8) {
        return pool[
          rng.nextInt(Math.floor(pool.length * 0.8), pool.length - 1)
        ];
      } else {
        return pool[rng.nextInt(0, pool.length - 1)];
      }
    }

    default:
      return pool[rng.nextInt(0, pool.length - 1)];
  }
}
