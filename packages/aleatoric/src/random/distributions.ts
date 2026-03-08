import { DefaultRng } from './rng.js';
import { RandomSource } from './types.js';

/** Uniform random float in [min, max) */
export function uniform(
  min: number,
  max: number,
  rng: RandomSource = new DefaultRng(),
): number {
  return min + rng.next() * (max - min);
}

/**
 * Gaussian (normal) distribution using Box-Muller transform.
 *
 * @see https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform
 */
export function gaussian(
  mean: number,
  stddev: number,
  rng: RandomSource = new DefaultRng(),
): number {
  let u1 = rng.next();
  while (u1 === 0) u1 = rng.next();
  const u2 = rng.next();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + z * stddev;
}

/** Gaussian clamped to [min, max] range */
export function gaussianClamped(
  mean: number,
  stddev: number,
  min: number,
  max: number,
  rng: RandomSource = new DefaultRng(),
): number {
  return Math.max(min, Math.min(max, gaussian(mean, stddev, rng)));
}

/** Exponential distribution with given rate (lambda) */
export function exponential(
  rate: number,
  rng: RandomSource = new DefaultRng(),
): number {
  let u = rng.next();
  while (u === 0) u = rng.next();
  return -Math.log(u) / rate;
}

/** Poisson-distributed random integer with given mean (lambda) */
export function poisson(
  lambda: number,
  rng: RandomSource = new DefaultRng(),
): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rng.next();
  } while (p > L);
  return k - 1;
}

/**
 * Triangular distribution peaking at `mode` within [min, max].
 * Useful for musical values that cluster around a center.
 */
export function triangular(
  min: number,
  max: number,
  mode: number,
  rng: RandomSource = new DefaultRng(),
): number {
  if (max === min) return min;
  const u = rng.next();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

/** Clamp and round a value to the nearest integer in [min, max] */
export function clampRound(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
