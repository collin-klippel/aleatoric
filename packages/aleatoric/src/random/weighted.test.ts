import { describe, expect, it } from 'vitest';
import { SeededRng } from './rng.js';
import {
  shuffle,
  toWeightedItems,
  uniformChoice,
  weightedChoice,
  weightedChoices,
} from './weighted.js';

describe('weighted selection', () => {
  const rng = new SeededRng(42);

  describe('weightedChoice', () => {
    it('respects weights over many trials', () => {
      const items = [
        { value: 'A', weight: 9 },
        { value: 'B', weight: 1 },
      ];
      const counts: Record<string, number> = { A: 0, B: 0 };
      const testRng = new SeededRng(42);
      for (let i = 0; i < 1000; i++) {
        counts[weightedChoice(items, testRng)]++;
      }
      expect(counts.A).toBeGreaterThan(counts.B * 5);
    });

    it('throws on empty array', () => {
      expect(() => weightedChoice([])).toThrow();
    });
  });

  describe('weightedChoices', () => {
    it('returns the requested count', () => {
      const items = [
        { value: 1, weight: 1 },
        { value: 2, weight: 1 },
      ];
      expect(weightedChoices(items, 10, rng)).toHaveLength(10);
    });
  });

  describe('uniformChoice', () => {
    it('returns an element from the array', () => {
      const arr = [10, 20, 30];
      const result = uniformChoice(arr, rng);
      expect(arr).toContain(result);
    });

    it('throws on empty array', () => {
      expect(() => uniformChoice([])).toThrow();
    });
  });

  describe('shuffle', () => {
    it('preserves all elements', () => {
      const arr = [1, 2, 3, 4, 5];
      const shuffled = shuffle(arr, new SeededRng(1));
      expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not modify the original array', () => {
      const arr = [1, 2, 3];
      shuffle(arr, new SeededRng(1));
      expect(arr).toEqual([1, 2, 3]);
    });
  });

  describe('toWeightedItems', () => {
    it('zips values and weights', () => {
      const items = toWeightedItems(['a', 'b'], [1, 2]);
      expect(items).toEqual([
        { value: 'a', weight: 1 },
        { value: 'b', weight: 2 },
      ]);
    });

    it('throws on mismatched lengths', () => {
      expect(() => toWeightedItems([1, 2], [1])).toThrow();
    });
  });
});
