import { midiToFrequency, midiToPitch } from '../core/note.js';
import { DURATIONS } from '../core/rhythm.js';
import { type MusicEvent } from '../core/types.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { uniformChoice } from '../random/weighted.js';
import { createMusicEvent } from './types.js';

export interface RandomRhythmOptions {
  count: number;
  /** Allowed duration values in beats (default: quarter, eighth, half) */
  allowedDurations?: number[];
  /** Probability of any event being a rest (0-1, default 0.1) */
  restProbability?: number;
  /** MIDI note to use for non-rest events (default 60 / middle C) */
  midi?: number;
  /** Velocity for non-rest events (default 80) */
  velocity?: number;
  /** Density: average events per beat. If set, overrides allowedDurations with calculated values */
  density?: number;
  rng?: RandomSource;
}

export function generateRandomRhythm(
  options: RandomRhythmOptions,
): MusicEvent[] {
  const {
    count,
    allowedDurations = [DURATIONS.quarter, DURATIONS.eighth, DURATIONS.half],
    restProbability = 0.1,
    midi = 60,
    velocity = 80,
    density,
    rng = new DefaultRng(),
  } = options;

  const durations = density
    ? computeDensityDurations(density)
    : allowedDurations;

  const events: MusicEvent[] = [];
  let beat = 0;

  for (let i = 0; i < count; i++) {
    const durValue = uniformChoice(durations, rng);
    const isRest = rng.next() < restProbability;

    events.push(
      createMusicEvent({
        pitch: isRest ? null : midiToPitch(midi),
        midi: isRest ? 0 : midi,
        frequency: isRest ? 0 : midiToFrequency(midi),
        duration: { value: durValue },
        velocity: isRest ? 0 : velocity,
        startBeat: beat,
        isRest,
      }),
    );

    beat += durValue;
  }

  return events;
}

function computeDensityDurations(density: number): number[] {
  const baseDuration = 1 / density;
  const all = Object.values(DURATIONS);
  // Pick durations closest to the target density
  const sorted = all
    .map((d) => ({ d, dist: Math.abs(d - baseDuration) }))
    .sort((a, b) => a.dist - b.dist);
  // Return the closest 3 durations
  return sorted.slice(0, 3).map((s) => s.d);
}
