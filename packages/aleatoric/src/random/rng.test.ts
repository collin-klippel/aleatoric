import { describe, expect, it } from 'vitest';
import { DefaultRng, SeededRng } from './rng.js';

describe('SeededRng', () => {
  it('produces deterministic sequences from the same seed', () => {
    const rng1 = new SeededRng(42);
    const rng2 = new SeededRng(42);
    const seq1 = Array.from({ length: 20 }, () => rng1.next());
    const seq2 = Array.from({ length: 20 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences from different seeds', () => {
    const rng1 = new SeededRng(1);
    const rng2 = new SeededRng(2);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('next() returns values in [0, 1)', () => {
    const rng = new SeededRng(123);
    for (let i = 0; i < 1000; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });

  it('nextInt() returns values in [min, max]', () => {
    const rng = new SeededRng(99);
    for (let i = 0; i < 200; i++) {
      const val = rng.nextInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
      expect(Number.isInteger(val)).toBe(true);
    }
  });

  it('nextBool() returns booleans', () => {
    const rng = new SeededRng(77);
    let trueCount = 0;
    const n = 1000;
    for (let i = 0; i < n; i++) {
      if (rng.nextBool()) trueCount++;
    }
    // Should be roughly 50%
    expect(trueCount).toBeGreaterThan(400);
    expect(trueCount).toBeLessThan(600);
  });

  it('fork() creates independent child', () => {
    const parent = new SeededRng(42);
    parent.next(); // advance
    const child = parent.fork();
    const parentSeq = Array.from({ length: 10 }, () => parent.next());
    const childSeq = Array.from({ length: 10 }, () => child.next());
    expect(parentSeq).not.toEqual(childSeq);
  });
});

describe('DefaultRng', () => {
  it('next() returns values in [0, 1)', () => {
    const rng = new DefaultRng();
    for (let i = 0; i < 100; i++) {
      const val = rng.next();
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    }
  });
});
