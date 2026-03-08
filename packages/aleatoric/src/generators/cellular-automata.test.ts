import { describe, expect, it } from 'vitest';
import { SeededRng } from '../random/rng.js';
import { generateCellularAutomata } from './cellular-automata.js';

describe('cellular automata generator', () => {
  it('generates events for active cells', () => {
    const events = generateCellularAutomata({
      steps: 8,
      width: 8,
      rule: 30,
      rng: new SeededRng(42),
    });
    expect(events.length).toBeGreaterThan(0);
  });

  it('all events have valid startBeat', () => {
    const events = generateCellularAutomata({
      steps: 4,
      width: 4,
      rule: 110,
      stepDuration: 0.5,
      rng: new SeededRng(42),
    });
    for (const e of events) {
      expect(e.startBeat).toBeGreaterThanOrEqual(0);
      expect(e.startBeat).toBeLessThan(4 * 0.5);
    }
  });

  it('supports 2D (Game of Life) mode', () => {
    const steps = 5;
    const width = 6;
    const stepDuration = 0.25;
    const events = generateCellularAutomata({
      steps,
      width,
      mode: '2d',
      stepDuration,
      rng: new SeededRng(42),
    });
    // At most one event per cell per step
    expect(events.length).toBeLessThanOrEqual(steps * width);
    for (const e of events) {
      expect(e.startBeat).toBeGreaterThanOrEqual(0);
      expect(e.startBeat).toBeLessThan(steps * stepDuration);
      expect(e.midi).toBeGreaterThanOrEqual(0);
      expect(e.midi).toBeLessThanOrEqual(127);
    }
  });

  it('respects custom pitch mapping', () => {
    const pitches = [60, 62, 64, 65];
    const events = generateCellularAutomata({
      steps: 4,
      width: 4,
      rule: 30,
      pitchMapping: pitches,
      rng: new SeededRng(42),
    });
    for (const e of events) {
      expect(pitches).toContain(e.midi);
    }
  });

  it('is deterministic', () => {
    const opts = { steps: 4, width: 4, rule: 90 as number };
    const e1 = generateCellularAutomata({ ...opts, rng: new SeededRng(42) });
    const e2 = generateCellularAutomata({ ...opts, rng: new SeededRng(42) });
    expect(e1.map((e) => e.midi)).toEqual(e2.map((e) => e.midi));
  });
});
