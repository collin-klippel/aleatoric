import { describe, expect, it } from 'vitest';
import { Scale } from '../core/scale.js';
import { SeededRng } from '../random/rng.js';
import { Timeline } from '../scheduler/timeline.js';
import { generateAmbientTimeline } from './ambient.js';

const scale = Scale.pentatonic('C');

// C3=48, C5=72 — a two-octave window with plenty of pentatonic members
const baseOptions = {
  low: 48,
  high: 72,
  scale,
  bpm: 60,
};

describe('generateAmbientTimeline', () => {
  it('returns a Timeline instance', () => {
    const timeline = generateAmbientTimeline({
      ...baseOptions,
      rng: new SeededRng(1),
    });
    expect(timeline).toBeInstanceOf(Timeline);
  });

  it('produces at least one event', () => {
    const timeline = generateAmbientTimeline({
      ...baseOptions,
      rng: new SeededRng(1),
    });
    expect(timeline.length).toBeGreaterThan(0);
  });

  it('all events have pitches that belong to the given scale', () => {
    const timeline = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 60,
      rng: new SeededRng(42),
    });
    for (const event of timeline.getEvents()) {
      expect(event.pitch).not.toBeNull();
      if (event.pitch) expect(scale.contains(event.pitch)).toBe(true);
    }
  });

  it('longer totalDuration produces more events', () => {
    const short = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 30,
      rng: new SeededRng(1),
    });
    const long = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 120,
      rng: new SeededRng(1),
    });
    expect(long.length).toBeGreaterThan(short.length);
  });

  it('harmonyProbability 1 adds a harmony note to every onset', () => {
    // totalDuration: 1 with default gapRange [3,7] guarantees exactly one onset
    // (the loop adds gapSec >= 3 to currentSec after the first iteration, exceeding 1s)
    const noHarmony = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 1,
      harmonyProbability: 0,
      rng: new SeededRng(7),
    });
    const fullHarmony = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 1,
      harmonyProbability: 1,
      rng: new SeededRng(7),
    });
    expect(noHarmony.length).toBe(1);
    expect(fullHarmony.length).toBe(2);
  });

  it('throws when the pitch range contains no scale members', () => {
    // F4=65 and F#4=66 are not members of C pentatonic (C D E G A)
    expect(() =>
      generateAmbientTimeline({
        low: 65,
        high: 66,
        scale,
        bpm: 60,
      }),
    ).toThrow(
      'generateAmbientTimeline: no pitches in range for the given scale',
    );
  });

  it('accepts string pitch notation for low and high', () => {
    const timeline = generateAmbientTimeline({
      ...baseOptions,
      low: 'C3',
      high: 'C5',
      totalDuration: 60,
      rng: new SeededRng(42),
    });
    expect(timeline.length).toBeGreaterThan(0);
  });

  it('string and numeric pitch notation produce the same events', () => {
    const byNumber = generateAmbientTimeline({
      ...baseOptions,
      low: 48,
      high: 72,
      totalDuration: 60,
      rng: new SeededRng(42),
    });
    const byString = generateAmbientTimeline({
      ...baseOptions,
      low: 'C3',
      high: 'C5',
      totalDuration: 60,
      rng: new SeededRng(42),
    });
    expect(byString.getEvents().map((e) => e.midi)).toEqual(
      byNumber.getEvents().map((e) => e.midi),
    );
  });

  it('respects a fixed velocityRange', () => {
    const timeline = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 60,
      velocityRange: [80, 80],
      harmonyProbability: 0,
      rng: new SeededRng(42),
    });
    for (const event of timeline.getEvents()) {
      expect(event.velocity).toBe(80);
    }
  });

  it('event start beats scale proportionally with bpm', () => {
    // Both runs use the same seed, so gapSec values (driven by RNG) are identical.
    // currentSec advances the same way, so loop iterations are the same count.
    // Only the beat conversion differs: startBeat = (seconds / 60) * bpm.
    const t60 = generateAmbientTimeline({
      ...baseOptions,
      bpm: 60,
      totalDuration: 60,
      rng: new SeededRng(5),
    });
    const t120 = generateAmbientTimeline({
      ...baseOptions,
      bpm: 120,
      totalDuration: 60,
      rng: new SeededRng(5),
    });
    expect(t60.length).toBe(t120.length);
    const beats60 = t60.getEvents().map((e) => e.startBeat);
    const beats120 = t120.getEvents().map((e) => e.startBeat);
    for (let i = 0; i < beats60.length; i++) {
      expect(beats120[i]).toBeCloseTo(beats60[i] * 2, 10);
    }
  });

  it('is deterministic with the same seed', () => {
    const t1 = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 60,
      rng: new SeededRng(99),
    });
    const t2 = generateAmbientTimeline({
      ...baseOptions,
      totalDuration: 60,
      rng: new SeededRng(99),
    });
    expect(t1.getEvents().map((e) => e.midi)).toEqual(
      t2.getEvents().map((e) => e.midi),
    );
    expect(t1.getEvents().map((e) => e.startBeat)).toEqual(
      t2.getEvents().map((e) => e.startBeat),
    );
  });

  it('is non-deterministic without a seed (two runs differ)', () => {
    const t1 = generateAmbientTimeline({ ...baseOptions, totalDuration: 60 });
    const t2 = generateAmbientTimeline({ ...baseOptions, totalDuration: 60 });
    // Extremely unlikely both 10+ event sequences are identical
    expect(t1.getEvents().map((e) => e.midi)).not.toEqual(
      t2.getEvents().map((e) => e.midi),
    );
  });
});
