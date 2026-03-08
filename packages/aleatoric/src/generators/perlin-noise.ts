import { midiToFrequency, midiToPitch } from '../core/note.js';
import { Scale } from '../core/scale.js';
import { MusicEvent } from '../core/types.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

export interface PerlinNoiseOptions {
  count: number;
  low?: number;
  high?: number;
  scale?: Scale;
  duration?: number;
  velocity?: number;
  frequency?: number;
  lacunarity?: number;
  rng?: RandomSource;
}

/**
 * Generates a melody using Perlin-like noise interpolation.
 * Creates smooth, continuous pitch contours by interpolating between randomly-placed waypoints.
 * This produces more coherent melodies than pure random selection while maintaining musicality.
 */
export function generatePerlinNoiseMelody(
  options: PerlinNoiseOptions,
): MusicEvent[] {
  const {
    count,
    low = 36,
    high = 84,
    scale,
    duration = 0.5,
    velocity = 80,
    frequency = 4,
    lacunarity = 1.5,
    rng = new DefaultRng(),
  } = options;

  const pitchPool = buildPitchPool(low, high, scale);
  if (pitchPool.length === 0) {
    throw new Error('No pitches available in the given range and scale');
  }

  const events: MusicEvent[] = [];
  let beat = 0;

  const perlinSequence = generatePerlinSequence(count, pitchPool, {
    frequency,
    lacunarity,
    rng,
  });

  for (let i = 0; i < count; i++) {
    const sample = perlinSequence[i];
    if (sample === undefined) {
      throw new Error('Invariant: perlin sequence shorter than count');
    }
    const rounded = Math.round(sample);
    const midi = nearestPoolMidi(rounded, pitchPool);
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

function nearestPoolMidi(midi: number, pitchPool: number[]): number {
  const first = pitchPool[0];
  if (first === undefined) {
    throw new Error('Invariant: empty pitch pool');
  }
  let best = first;
  let bestDist = Math.abs(best - midi);
  for (const p of pitchPool) {
    const d = Math.abs(p - midi);
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

function buildPitchPool(low: number, high: number, scale?: Scale): number[] {
  const pool: number[] = [];
  for (let midi = low; midi <= high; midi++) {
    if (scale) {
      const pitch = midiToPitch(midi);
      if (scale.contains(pitch)) {
        pool.push(midi);
      }
    } else {
      pool.push(midi);
    }
  }
  return pool;
}

interface PerlinGenOptions {
  frequency: number;
  lacunarity: number;
  rng: RandomSource;
}

function generatePerlinSequence(
  count: number,
  pitchPool: number[],
  options: PerlinGenOptions,
): number[] {
  const { frequency, lacunarity: _lacunarity, rng } = options;

  const wavepointCount = Math.max(2, Math.ceil(count / frequency));
  const wavepoints: number[] = [];

  for (let i = 0; i < wavepointCount; i++) {
    const pick = pitchPool.at(Math.floor(rng.next() * pitchPool.length));
    if (pick === undefined) {
      throw new Error('Invariant: pitch pool index out of range');
    }
    wavepoints.push(pick);
  }

  const result: number[] = [];

  for (let i = 0; i < count; i++) {
    const normalizedIndex = i / (count - 1 || 1);
    const waypointIndex = normalizedIndex * (wavepointCount - 1);
    const baseIndex = Math.floor(waypointIndex);
    const fraction = waypointIndex - baseIndex;

    let interpolated: number;
    if (baseIndex >= wavepointCount - 1) {
      const end = wavepoints[wavepointCount - 1];
      if (end === undefined) {
        throw new Error('Invariant: missing end wavepoint');
      }
      interpolated = end;
    } else {
      const wp0 = wavepoints[0];
      if (wp0 === undefined) {
        throw new Error('Invariant: missing wavepoint');
      }
      const p0 = wavepoints[Math.max(0, baseIndex - 1)] ?? wp0;
      const p1 = wavepoints[baseIndex];
      const p2 = wavepoints[baseIndex + 1];
      const p3Raw = wavepoints[Math.min(wavepointCount - 1, baseIndex + 2)];
      const p3End = wavepoints[wavepointCount - 1];
      if (p1 === undefined || p2 === undefined || p3End === undefined) {
        throw new Error('Invariant: missing wavepoints for interpolation');
      }
      const p3 = p3Raw ?? p3End;

      interpolated = catmullRom(p0, p1, p2, p3, fraction);
    }

    result.push(interpolated);
  }

  return result;
}

function catmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number,
): number {
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}
