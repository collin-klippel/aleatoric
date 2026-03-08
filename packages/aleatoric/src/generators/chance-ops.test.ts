import { describe, expect, it } from 'vitest';
import { SeededRng } from '../random/rng.js';
import { generateChanceOps } from './chance-ops.js';

describe('chance operations generator', () => {
  const mapping = {
    pitchRange: [48, 72] as [number, number],
    durationRange: [0.25, 2] as [number, number],
    velocityRange: [40, 100] as [number, number],
    restProbability: 0.1,
  };

  for (const method of ['coin', 'iching', 'random'] as const) {
    describe(`method: ${method}`, () => {
      it('generates the requested count', () => {
        const events = generateChanceOps({
          count: 20,
          method,
          mapping,
          rng: new SeededRng(42),
        });
        expect(events).toHaveLength(20);
      });

      it('respects pitch range for non-rest events', () => {
        const events = generateChanceOps({
          count: 50,
          method,
          mapping,
          rng: new SeededRng(1),
        });
        for (const e of events) {
          if (!e.isRest) {
            expect(e.midi).toBeGreaterThanOrEqual(48);
            expect(e.midi).toBeLessThanOrEqual(72);
          }
        }
      });

      it('is deterministic with same seed', () => {
        const e1 = generateChanceOps({
          count: 10,
          method,
          mapping,
          rng: new SeededRng(42),
        });
        const e2 = generateChanceOps({
          count: 10,
          method,
          mapping,
          rng: new SeededRng(42),
        });
        expect(e1.map((e) => e.midi)).toEqual(e2.map((e) => e.midi));
      });
    });
  }
});
