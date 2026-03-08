import { RandomSource } from './types.js';

/**
 * Seedable PRNG using the xoshiro128** algorithm.
 * Provides deterministic, reproducible sequences from a numeric seed.
 *
 * @see https://prng.di.unimi.it/
 */
export class SeededRng implements RandomSource {
  private s: Uint32Array;

  constructor(seed?: number) {
    this.s = new Uint32Array(4);
    this.seed(seed ?? Date.now());
  }

  private seed(n: number): void {
    // SplitMix32 to initialize state from a single seed
    let z = (n | 0) >>> 0;
    for (let i = 0; i < 4; i++) {
      z = (z + 0x9e3779b9) >>> 0;
      let t = z ^ (z >>> 16);
      t = Math.imul(t, 0x21f0aaad);
      t = (t ^ (t >>> 15)) >>> 0;
      t = Math.imul(t, 0x735a2d97);
      t = (t ^ (t >>> 15)) >>> 0;
      this.s[i] = t;
    }
  }

  private rotl(x: number, k: number): number {
    return ((x << k) | (x >>> (32 - k))) >>> 0;
  }

  private nextU32(): number {
    const result = Math.imul(this.rotl(Math.imul(this.s[1], 5), 7), 9) >>> 0;
    const t = (this.s[1] << 9) >>> 0;

    this.s[2] = (this.s[2] ^ this.s[0]) >>> 0;
    this.s[3] = (this.s[3] ^ this.s[1]) >>> 0;
    this.s[1] = (this.s[1] ^ this.s[2]) >>> 0;
    this.s[0] = (this.s[0] ^ this.s[3]) >>> 0;

    this.s[2] = (this.s[2] ^ t) >>> 0;
    this.s[3] = this.rotl(this.s[3], 11);

    return result;
  }

  next(): number {
    return this.nextU32() / 0x100000000;
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }

  nextBool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  fork(): SeededRng {
    const child = new SeededRng();
    child.s = new Uint32Array(this.s);
    // Advance parent state so they diverge
    this.nextU32();
    return child;
  }
}

/** Default RNG using Math.random (non-reproducible) */
export class DefaultRng implements RandomSource {
  next(): number {
    return Math.random();
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  nextBool(probability = 0.5): boolean {
    return Math.random() < probability;
  }

  fork(): DefaultRng {
    return new DefaultRng();
  }
}
