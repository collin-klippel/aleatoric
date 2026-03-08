import {
  midiToFrequency,
  midiToPitch,
  parsePitch,
  pitchToMidi,
} from '../core/note.js';
import { secondsToBeats } from '../core/rhythm.js';
import { Scale } from '../core/scale.js';
import { MusicEvent } from '../core/types.js';
import { uniform } from '../random/distributions.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { Timeline } from '../scheduler/timeline.js';
import { createMusicEvent } from './types.js';

export interface AmbientTimelineOptions {
  /** Low end of pitch range — MIDI number or pitch string e.g. "C3" */
  low: number | string;
  /** High end of pitch range — MIDI number or pitch string e.g. "A4" */
  high: number | string;
  /** Scale to constrain pitch selection */
  scale: Scale;
  /** BPM used to convert seconds to beats; must match the Player's BPM */
  bpm: number;
  /** Note duration range in seconds [min, max] (default: [6, 12]) */
  durationRange?: [number, number];
  /** Gap between note onsets in seconds [min, max] (default: [3, 7]) */
  gapRange?: [number, number];
  /** Velocity range [min, max] (default: [40, 90]) */
  velocityRange?: [number, number];
  /**
   * Probability (0–1) of playing a second simultaneous harmony note at each
   * onset. The harmony note is another scale pitch chosen at random (default: 0).
   */
  harmonyProbability?: number;
  /** Total duration in seconds of timeline to pre-generate (default: 300) */
  totalDuration?: number;
  rng?: RandomSource;
}

/**
 * Pre-generate a sparse, overlapping ambient timeline suitable for looped
 * playback with a slow-tempo Player.
 *
 * Notes have long durations and random gaps so they overlap naturally. Use
 * with Player's `loop` option to create infinite ambient playback.
 */
export function generateAmbientTimeline(
  options: AmbientTimelineOptions,
): Timeline {
  const {
    bpm,
    totalDuration = 300,
    scale,
    durationRange = [6, 12],
    gapRange = [3, 7],
    velocityRange = [40, 90],
    harmonyProbability = 0,
    rng = new DefaultRng(),
  } = options;

  const lowMidi = resolveMidi(options.low);
  const highMidi = resolveMidi(options.high);

  const pool: number[] = [];
  for (let midi = lowMidi; midi <= highMidi; midi++) {
    if (scale.contains(midiToPitch(midi))) pool.push(midi);
  }

  if (pool.length === 0) {
    throw new Error(
      'generateAmbientTimeline: no pitches in range for the given scale',
    );
  }

  const events: MusicEvent[] = [];
  let currentSec = 0;

  while (currentSec < totalDuration) {
    const durSec = uniform(durationRange[0], durationRange[1], rng);
    const gapSec = uniform(gapRange[0], gapRange[1], rng);
    const velocity = Math.round(
      uniform(velocityRange[0], velocityRange[1], rng),
    );

    const startBeat = secondsToBeats(currentSec, bpm);
    const durationBeats = secondsToBeats(durSec, bpm);

    const midi = pool[rng.nextInt(0, pool.length - 1)];
    events.push(
      createMusicEvent({
        pitch: midiToPitch(midi),
        midi,
        frequency: midiToFrequency(midi),
        duration: { value: durationBeats },
        velocity,
        startBeat,
      }),
    );

    if (harmonyProbability > 0 && rng.next() < harmonyProbability) {
      const midi2 = pool[rng.nextInt(0, pool.length - 1)];
      const durSec2 = durSec * uniform(0.7, 1.2, rng);
      events.push(
        createMusicEvent({
          pitch: midiToPitch(midi2),
          midi: midi2,
          frequency: midiToFrequency(midi2),
          duration: { value: secondsToBeats(durSec2, bpm) },
          velocity: Math.round(velocity * 0.7),
          startBeat,
        }),
      );
    }

    currentSec += gapSec;
  }

  return new Timeline(events);
}

function resolveMidi(value: number | string): number {
  if (typeof value === 'number') return value;
  return pitchToMidi(parsePitch(value));
}
