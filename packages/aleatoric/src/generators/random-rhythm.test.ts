import { describe, expect, it } from 'vitest';
import { DURATIONS } from '../core/rhythm.js';
import { SeededRng } from '../random/rng.js';
import { generateRandomRhythm } from './random-rhythm.js';

describe('generateRandomRhythm', () => {
  it('generates the requested number of events', () => {
    const events = generateRandomRhythm({ count: 8, rng: new SeededRng(1) });
    expect(events).toHaveLength(8);
  });

  it('events have increasing startBeat values', () => {
    const events = generateRandomRhythm({ count: 10, rng: new SeededRng(2) });
    for (let i = 1; i < events.length; i++) {
      expect(events[i].startBeat).toBeGreaterThan(events[i - 1].startBeat);
    }
  });

  it('uses only allowed durations', () => {
    const allowed = [DURATIONS.quarter, DURATIONS.half];
    const events = generateRandomRhythm({
      count: 20,
      allowedDurations: allowed,
      rng: new SeededRng(3),
    });
    for (const event of events) {
      expect(allowed).toContain(event.duration.value);
    }
  });

  it('rests have midi 0 and velocity 0', () => {
    const events = generateRandomRhythm({
      count: 100,
      restProbability: 1,
      rng: new SeededRng(4),
    });
    for (const event of events) {
      expect(event.isRest).toBe(true);
      expect(event.midi).toBe(0);
      expect(event.velocity).toBe(0);
    }
  });

  it('no rests when restProbability is 0', () => {
    const events = generateRandomRhythm({
      count: 20,
      restProbability: 0,
      rng: new SeededRng(5),
    });
    for (const event of events) {
      expect(event.isRest).toBe(false);
    }
  });

  it('uses the specified midi note for non-rest events', () => {
    const events = generateRandomRhythm({
      count: 10,
      midi: 72,
      restProbability: 0,
      rng: new SeededRng(6),
    });
    for (const event of events) {
      expect(event.midi).toBe(72);
    }
  });

  it('is deterministic with seeded rng', () => {
    const a = generateRandomRhythm({ count: 8, rng: new SeededRng(99) });
    const b = generateRandomRhythm({ count: 8, rng: new SeededRng(99) });
    expect(a.map((e) => e.midi)).toEqual(b.map((e) => e.midi));
    expect(a.map((e) => e.duration.value)).toEqual(
      b.map((e) => e.duration.value),
    );
  });

  it('uses density to compute allowed durations when provided', () => {
    const events = generateRandomRhythm({
      count: 10,
      density: 2,
      rng: new SeededRng(7),
    });
    expect(events).toHaveLength(10);
    for (const event of events) {
      expect(event.duration.value).toBeGreaterThan(0);
    }
  });
});
