import { describe, expect, it } from 'vitest';
import {
  castHexagram,
  hexagramSelect,
  hexagramToInt,
  hexagramToRange,
} from './iching.js';
import { SeededRng } from './rng.js';

describe('I Ching', () => {
  describe('castHexagram', () => {
    it('produces a hexagram with 6 lines', () => {
      const hex = castHexagram(new SeededRng(42));
      expect(hex.lines).toHaveLength(6);
    });

    it('hexagram number is between 1 and 64', () => {
      const rng = new SeededRng(1);
      for (let i = 0; i < 50; i++) {
        const hex = castHexagram(rng);
        expect(hex.number).toBeGreaterThanOrEqual(1);
        expect(hex.number).toBeLessThanOrEqual(64);
      }
    });

    it('is deterministic with same seed', () => {
      const h1 = castHexagram(new SeededRng(99));
      const h2 = castHexagram(new SeededRng(99));
      expect(h1.number).toBe(h2.number);
      expect(h1.binary).toBe(h2.binary);
    });

    it('lines have correct properties', () => {
      const hex = castHexagram(new SeededRng(42));
      for (const line of hex.lines) {
        expect([6, 7, 8, 9]).toContain(line.value);
        expect(typeof line.yin).toBe('boolean');
        expect(typeof line.changing).toBe('boolean');
      }
    });
  });

  describe('hexagramToRange', () => {
    it('maps hexagram 1 to min', () => {
      const hex = { number: 1, lines: [], binary: 0, changingTo: null };
      expect(hexagramToRange(hex, 0, 100)).toBe(0);
    });

    it('maps hexagram 64 to max', () => {
      const hex = { number: 64, lines: [], binary: 0, changingTo: null };
      expect(hexagramToRange(hex, 0, 100)).toBe(100);
    });
  });

  describe('hexagramToInt', () => {
    it('maps to integer range', () => {
      const hex = { number: 32, lines: [], binary: 0, changingTo: null };
      const result = hexagramToInt(hex, 0, 127);
      expect(Number.isInteger(result)).toBe(true);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(127);
    });
  });

  describe('hexagramSelect', () => {
    it('selects from array', () => {
      const items = ['a', 'b', 'c', 'd'];
      const hex = { number: 1, lines: [], binary: 0, changingTo: null };
      expect(items).toContain(hexagramSelect(hex, items));
    });
  });
});
