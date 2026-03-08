import { describe, expect, it } from 'vitest';
import { SeededRng } from '../random/rng.js';
import {
  expandLSystem,
  generateLSystem,
  LSystemInterpretation,
  ProductionRule,
} from './lsystem.js';

describe('L-system generator', () => {
  describe('expandLSystem', () => {
    it('applies deterministic rules', () => {
      const rules: ProductionRule[] = [
        { match: 'A', replacement: 'AB' },
        { match: 'B', replacement: 'A' },
      ];
      expect(expandLSystem('A', rules, 0)).toBe('A');
      expect(expandLSystem('A', rules, 1)).toBe('AB');
      expect(expandLSystem('A', rules, 2)).toBe('ABA');
      expect(expandLSystem('A', rules, 3)).toBe('ABAAB');
    });

    it('preserves unmatched characters', () => {
      const rules: ProductionRule[] = [{ match: 'F', replacement: 'FF' }];
      expect(expandLSystem('F+F', rules, 1)).toBe('FF+FF');
    });

    it('handles stochastic rules', () => {
      const rules: ProductionRule[] = [
        {
          match: 'A',
          replacement: [
            { value: 'X', weight: 1 },
            { value: 'Y', weight: 1 },
          ],
        },
      ];
      const result = expandLSystem('A', rules, 1, new SeededRng(42));
      expect(['X', 'Y']).toContain(result);
    });
  });

  describe('generateLSystem', () => {
    const interpretation: LSystemInterpretation = {
      F: { type: 'note' },
      '+': { type: 'pitchUp', semitones: 2 },
      '-': { type: 'pitchDown', semitones: 2 },
      r: { type: 'rest' },
    };

    it('generates events from expanded string', () => {
      const events = generateLSystem({
        axiom: 'F+F-F',
        rules: [{ match: 'F', replacement: 'F+F' }],
        iterations: 1,
        interpretation,
        rng: new SeededRng(42),
      });
      // axiom 'F+F-F' -> 'F+F' + '+' + 'F+F' + '-' + 'F+F' => 6 F's = 6 notes
      expect(events.filter((e) => !e.isRest)).toHaveLength(6);
    });

    it('pitch changes accumulate', () => {
      const events = generateLSystem({
        axiom: 'F+F+F',
        rules: [],
        iterations: 0,
        interpretation,
        startingPitch: 60,
        rng: new SeededRng(42),
      });
      expect(events[0].midi).toBe(60);
      expect(events[1].midi).toBe(62);
      expect(events[2].midi).toBe(64);
    });

    it('supports push/pop state', () => {
      const interp: LSystemInterpretation = {
        F: { type: 'note' },
        '+': { type: 'pitchUp', semitones: 7 },
        '[': { type: 'push' },
        ']': { type: 'pop' },
      };
      const events = generateLSystem({
        axiom: 'F[+F]F',
        rules: [],
        iterations: 0,
        interpretation: interp,
        startingPitch: 60,
        rng: new SeededRng(42),
      });
      expect(events[0].midi).toBe(60);
      expect(events[1].midi).toBe(67); // after +
      expect(events[2].midi).toBe(60); // after pop
    });
  });
});
