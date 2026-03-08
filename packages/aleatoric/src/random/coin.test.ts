import { describe, expect, it } from 'vitest';
import { coinChoice, flipBool, flipCoin, flipCoins } from './coin.js';
import { SeededRng } from './rng.js';

describe('coin', () => {
  describe('flipCoin', () => {
    it('returns heads or tails', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 50; i++) {
        const result = flipCoin(0.5, rng);
        expect(['heads', 'tails']).toContain(result);
      }
    });

    it('always returns heads with bias 1', () => {
      const rng = new SeededRng(42);
      for (let i = 0; i < 20; i++) {
        expect(flipCoin(1, rng)).toBe('heads');
      }
    });

    it('always returns tails with bias 0', () => {
      const rng = new SeededRng(42);
      for (let i = 0; i < 20; i++) {
        expect(flipCoin(0, rng)).toBe('tails');
      }
    });

    it('is deterministic with a seeded rng', () => {
      const r1 = new SeededRng(7);
      const r2 = new SeededRng(7);
      for (let i = 0; i < 20; i++) {
        expect(flipCoin(0.5, r1)).toBe(flipCoin(0.5, r2));
      }
    });
  });

  describe('flipBool', () => {
    it('returns a boolean', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 20; i++) {
        expect(typeof flipBool(0.5, rng)).toBe('boolean');
      }
    });

    it('always true with bias 1', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 20; i++) {
        expect(flipBool(1, rng)).toBe(true);
      }
    });

    it('always false with bias 0', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 20; i++) {
        expect(flipBool(0, rng)).toBe(false);
      }
    });
  });

  describe('flipCoins', () => {
    it('returns the requested count of results', () => {
      const rng = new SeededRng(1);
      const results = flipCoins(10, 0.5, rng);
      expect(results).toHaveLength(10);
    });

    it('each result is heads or tails', () => {
      const rng = new SeededRng(1);
      for (const r of flipCoins(20, 0.5, rng)) {
        expect(['heads', 'tails']).toContain(r);
      }
    });

    it('returns empty array for count 0', () => {
      expect(flipCoins(0, 0.5, new SeededRng(1))).toHaveLength(0);
    });
  });

  describe('coinChoice', () => {
    it('returns heads value when bias is 1', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 10; i++) {
        expect(coinChoice('A', 'B', 1, rng)).toBe('A');
      }
    });

    it('returns tails value when bias is 0', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 10; i++) {
        expect(coinChoice('A', 'B', 0, rng)).toBe('B');
      }
    });

    it('works with non-string values', () => {
      const rng = new SeededRng(1);
      const result = coinChoice(42, 99, 1, rng);
      expect(result).toBe(42);
    });
  });
});
