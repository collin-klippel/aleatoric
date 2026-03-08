import { describe, expect, it } from 'vitest';
import {
  clampRound,
  exponential,
  gaussian,
  gaussianClamped,
  poisson,
  triangular,
  uniform,
} from './distributions.js';
import { SeededRng } from './rng.js';

describe('distributions', () => {
  describe('uniform', () => {
    it('returns values in [min, max)', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 100; i++) {
        const v = uniform(10, 20, rng);
        expect(v).toBeGreaterThanOrEqual(10);
        expect(v).toBeLessThan(20);
      }
    });

    it('is deterministic with seeded rng', () => {
      const r1 = new SeededRng(5);
      const r2 = new SeededRng(5);
      expect(uniform(0, 1, r1)).toBe(uniform(0, 1, r2));
    });
  });

  describe('gaussian', () => {
    it('produces values roughly centered on the mean', () => {
      const rng = new SeededRng(42);
      const samples = Array.from({ length: 1000 }, () => gaussian(60, 5, rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeGreaterThan(57);
      expect(mean).toBeLessThan(63);
    });

    it('is deterministic with seeded rng', () => {
      const r1 = new SeededRng(99);
      const r2 = new SeededRng(99);
      expect(gaussian(0, 1, r1)).toBe(gaussian(0, 1, r2));
    });
  });

  describe('gaussianClamped', () => {
    it('always returns values within [min, max]', () => {
      const rng = new SeededRng(7);
      for (let i = 0; i < 200; i++) {
        const v = gaussianClamped(60, 20, 21, 108, rng);
        expect(v).toBeGreaterThanOrEqual(21);
        expect(v).toBeLessThanOrEqual(108);
      }
    });
  });

  describe('exponential', () => {
    it('returns positive values', () => {
      const rng = new SeededRng(3);
      for (let i = 0; i < 100; i++) {
        expect(exponential(1, rng)).toBeGreaterThan(0);
      }
    });

    it('higher rate produces smaller mean values', () => {
      const rng1 = new SeededRng(1);
      const rng2 = new SeededRng(1);
      const samples1 = Array.from({ length: 500 }, () => exponential(1, rng1));
      const samples2 = Array.from({ length: 500 }, () => exponential(10, rng2));
      const mean1 = samples1.reduce((a, b) => a + b, 0) / 500;
      const mean2 = samples2.reduce((a, b) => a + b, 0) / 500;
      expect(mean1).toBeGreaterThan(mean2);
    });
  });

  describe('poisson', () => {
    it('returns non-negative integers', () => {
      const rng = new SeededRng(4);
      for (let i = 0; i < 100; i++) {
        const v = poisson(5, rng);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(v)).toBe(true);
      }
    });

    it('mean is approximately lambda', () => {
      const rng = new SeededRng(10);
      const lambda = 4;
      const samples = Array.from({ length: 2000 }, () => poisson(lambda, rng));
      const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
      expect(mean).toBeGreaterThan(3);
      expect(mean).toBeLessThan(5);
    });
  });

  describe('triangular', () => {
    it('returns values in [min, max]', () => {
      const rng = new SeededRng(6);
      for (let i = 0; i < 200; i++) {
        const v = triangular(0, 10, 5, rng);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(10);
      }
    });

    it('mode shifts the distribution', () => {
      const rng1 = new SeededRng(1);
      const rng2 = new SeededRng(1);
      const samplesLow = Array.from({ length: 500 }, () =>
        triangular(0, 10, 1, rng1),
      );
      const samplesHigh = Array.from({ length: 500 }, () =>
        triangular(0, 10, 9, rng2),
      );
      const meanLow = samplesLow.reduce((a, b) => a + b, 0) / 500;
      const meanHigh = samplesHigh.reduce((a, b) => a + b, 0) / 500;
      expect(meanLow).toBeLessThan(meanHigh);
    });
  });

  describe('clampRound', () => {
    it('rounds to nearest integer', () => {
      expect(clampRound(3.4, 0, 10)).toBe(3);
      expect(clampRound(3.6, 0, 10)).toBe(4);
    });

    it('clamps to min', () => {
      expect(clampRound(-5, 0, 10)).toBe(0);
    });

    it('clamps to max', () => {
      expect(clampRound(15, 0, 10)).toBe(10);
    });

    it('handles boundary values exactly', () => {
      expect(clampRound(0, 0, 10)).toBe(0);
      expect(clampRound(10, 0, 10)).toBe(10);
    });
  });
});
