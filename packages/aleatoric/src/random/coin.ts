import { DefaultRng } from './rng.js';
import { RandomSource } from './types.js';

export type CoinResult = 'heads' | 'tails';

/** Flip a coin with optional bias (0.5 = fair) */
export function flipCoin(
  bias: number = 0.5,
  rng: RandomSource = new DefaultRng(),
): CoinResult {
  return rng.next() < bias ? 'heads' : 'tails';
}

/** Flip a coin and return a boolean (heads = true) */
export function flipBool(
  bias: number = 0.5,
  rng: RandomSource = new DefaultRng(),
): boolean {
  return rng.next() < bias;
}

/** Flip n coins and return results */
export function flipCoins(
  count: number,
  bias: number = 0.5,
  rng: RandomSource = new DefaultRng(),
): CoinResult[] {
  return Array.from({ length: count }, () => flipCoin(bias, rng));
}

/** Choose between two options using a coin flip */
export function coinChoice<T>(
  heads: T,
  tails: T,
  bias: number = 0.5,
  rng: RandomSource = new DefaultRng(),
): T {
  return flipBool(bias, rng) ? heads : tails;
}
