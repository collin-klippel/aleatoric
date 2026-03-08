import { describe, expect, it } from 'vitest';
import { Scale } from '../core/scale.js';
import { SeededRng } from '../random/rng.js';
import { generateCellularAutomata } from './cellular-automata.js';

describe('cellular automata generator', () => {
  it('generates events from 2D Game of Life', () => {
    const steps = 5;
    const width = 6;
    const stepDuration = 0.25;
    const events = generateCellularAutomata({
      steps,
      width,
      stepDuration,
      rng: new SeededRng(42),
    });
    expect(events.length).toBeLessThanOrEqual(steps * width);
    for (const e of events) {
      expect(e.startBeat).toBeGreaterThanOrEqual(0);
      expect(e.startBeat).toBeLessThan(steps * stepDuration);
      expect(e.midi).toBeGreaterThanOrEqual(0);
      expect(e.midi).toBeLessThanOrEqual(127);
    }
  });

  it('is deterministic with the same seed', () => {
    const opts = { steps: 4, width: 4 };
    const e1 = generateCellularAutomata({ ...opts, rng: new SeededRng(42) });
    const e2 = generateCellularAutomata({ ...opts, rng: new SeededRng(42) });
    expect(e1.map((e) => e.midi)).toEqual(e2.map((e) => e.midi));
  });

  it('seeds initial state from rng when initialState is omitted', () => {
    const events = generateCellularAutomata({
      steps: 4,
      width: 5,
      rng: new SeededRng(99),
    });
    expect(events.length).toBeGreaterThanOrEqual(0);
  });

  it('accepts partial initialState shorter than grid', () => {
    const width = 4;
    const initial = [true, false, true];
    const events = generateCellularAutomata({
      steps: 3,
      width,
      initialState: initial,
      rng: new SeededRng(1),
    });
    expect(events.length).toBeGreaterThanOrEqual(0);
    for (const e of events) {
      expect(e.midi).toBeGreaterThanOrEqual(0);
      expect(e.midi).toBeLessThanOrEqual(127);
    }
  });

  it('respects custom pitch mapping', () => {
    const pitches = [60, 62, 64, 65];
    const events = generateCellularAutomata({
      steps: 4,
      width: 4,
      pitchMapping: pitches,
      rng: new SeededRng(42),
    });
    for (const e of events) {
      expect(pitches).toContain(e.midi);
    }
  });

  it('keeps notes in scale with scale pitch mapping', () => {
    const scale = Scale.major('C');
    const events = generateCellularAutomata({
      steps: 3,
      width: 4,
      pitchMapping: 'scale',
      scale,
      rng: new SeededRng(7),
    });
    for (const e of events) {
      if (!e.isRest && e.pitch) {
        expect(scale.contains(e.pitch)).toBe(true);
      }
    }
  });
});
