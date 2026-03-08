import { describe, expect, it } from 'vitest';
import { Scale } from '../core/scale.js';
import { SeededRng } from '../random/rng.js';
import { generateRandomPitches } from './random-pitch.js';

describe('generateRandomPitches', () => {
  it('generates the requested number of events', () => {
    const events = generateRandomPitches({ count: 10, rng: new SeededRng(42) });
    expect(events).toHaveLength(10);
  });

  it('all events have valid MIDI numbers', () => {
    const events = generateRandomPitches({
      count: 50,
      low: 36,
      high: 84,
      rng: new SeededRng(1),
    });
    for (const e of events) {
      expect(e.midi).toBeGreaterThanOrEqual(36);
      expect(e.midi).toBeLessThanOrEqual(84);
    }
  });

  it('constrains to scale when provided', () => {
    const scale = Scale.major('C');
    const events = generateRandomPitches({
      count: 50,
      scale,
      rng: new SeededRng(42),
    });
    for (const e of events) {
      expect(e.pitch).not.toBeNull();
      if (e.pitch) expect(scale.contains(e.pitch)).toBe(true);
    }
  });

  it('events have sequential start beats', () => {
    const events = generateRandomPitches({
      count: 5,
      duration: 0.5,
      rng: new SeededRng(42),
    });
    for (let i = 0; i < events.length; i++) {
      expect(events[i].startBeat).toBeCloseTo(i * 0.5, 10);
    }
  });

  it('is deterministic with the same seed', () => {
    const e1 = generateRandomPitches({ count: 10, rng: new SeededRng(42) });
    const e2 = generateRandomPitches({ count: 10, rng: new SeededRng(42) });
    expect(e1.map((e) => e.midi)).toEqual(e2.map((e) => e.midi));
  });

  it('supports gaussian distribution', () => {
    const low = 36;
    const high = 84;
    const opts = {
      count: 100,
      low,
      high,
      distribution: 'gaussian' as const,
      rng: new SeededRng(42),
    };
    const events = generateRandomPitches(opts);
    expect(events).toHaveLength(100);
    for (const e of events) {
      expect(e.midi).toBeGreaterThanOrEqual(low);
      expect(e.midi).toBeLessThanOrEqual(high);
    }
    const repeat = generateRandomPitches({ ...opts, rng: new SeededRng(42) });
    expect(events.map((e) => e.midi)).toEqual(repeat.map((e) => e.midi));
    const first = generateRandomPitches({
      ...opts,
      count: 12,
      rng: new SeededRng(42),
    });
    expect(first.map((e) => e.midi)).toEqual([
      70, 66, 67, 54, 64, 50, 57, 56, 53, 65, 59, 59,
    ]);
  });

  it('supports edges distribution', () => {
    const low = 36;
    const high = 84;
    const opts = {
      count: 100,
      low,
      high,
      distribution: 'edges' as const,
      rng: new SeededRng(42),
    };
    const events = generateRandomPitches(opts);
    expect(events).toHaveLength(100);
    for (const e of events) {
      expect(e.midi).toBeGreaterThanOrEqual(low);
      expect(e.midi).toBeLessThanOrEqual(high);
    }
    const repeat = generateRandomPitches({ ...opts, rng: new SeededRng(42) });
    expect(events.map((e) => e.midi)).toEqual(repeat.map((e) => e.midi));
    const first = generateRandomPitches({
      ...opts,
      count: 12,
      rng: new SeededRng(42),
    });
    expect(first.map((e) => e.midi)).toEqual([
      44, 38, 83, 79, 83, 42, 67, 42, 78, 83, 51, 77,
    ]);
  });
});
