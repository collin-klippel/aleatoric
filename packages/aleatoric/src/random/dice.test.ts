import { describe, expect, it } from 'vitest';
import {
  roll2d6,
  rollDice,
  rollDie,
  rollKeepHighest,
  rollKeepLowest,
} from './dice.js';
import { SeededRng } from './rng.js';

describe('dice', () => {
  const rng = new SeededRng(42);

  describe('rollDie', () => {
    it('returns values between 1 and sides', () => {
      for (let i = 0; i < 100; i++) {
        const val = rollDie(6, rng);
        expect(val).toBeGreaterThanOrEqual(1);
        expect(val).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('rollDice', () => {
    it('returns correct count and sum', () => {
      const result = rollDice(3, 6, new SeededRng(1));
      expect(result.individual).toHaveLength(3);
      expect(result.sum).toBe(result.individual.reduce((a, b) => a + b, 0));
    });
  });

  describe('roll2d6', () => {
    it('sum is between 2 and 12', () => {
      for (let i = 0; i < 100; i++) {
        const result = roll2d6(rng);
        expect(result.sum).toBeGreaterThanOrEqual(2);
        expect(result.sum).toBeLessThanOrEqual(12);
        expect(result.individual).toHaveLength(2);
      }
    });
  });

  describe('rollKeepHighest', () => {
    it('keeps the highest k dice', () => {
      const result = rollKeepHighest(4, 6, 2, new SeededRng(1));
      expect(result.individual).toHaveLength(2);
      expect(result.individual[0]).toBeGreaterThanOrEqual(result.individual[1]);
    });
  });

  describe('rollKeepLowest', () => {
    it('keeps the lowest k dice', () => {
      const result = rollKeepLowest(4, 6, 2, new SeededRng(1));
      expect(result.individual).toHaveLength(2);
      expect(result.individual[0]).toBeLessThanOrEqual(result.individual[1]);
    });
  });
});
