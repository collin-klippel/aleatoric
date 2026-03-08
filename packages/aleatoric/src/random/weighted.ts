import { DefaultRng } from './rng.js';
import { RandomSource } from './types.js';

export interface WeightedItem<T> {
  value: T;
  weight: number;
}

/** Select a single item from weighted options */
export function weightedChoice<T>(
  items: WeightedItem<T>[],
  rng: RandomSource = new DefaultRng(),
): T {
  if (items.length === 0) throw new Error('Cannot choose from empty array');
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = rng.next() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

/** Select n items from weighted options (with replacement) */
export function weightedChoices<T>(
  items: WeightedItem<T>[],
  n: number,
  rng: RandomSource = new DefaultRng(),
): T[] {
  return Array.from({ length: n }, () => weightedChoice(items, rng));
}

/** Create a weighted item list from parallel value and weight arrays */
export function toWeightedItems<T>(
  values: T[],
  weights: number[],
): WeightedItem<T>[] {
  if (values.length !== weights.length)
    throw new Error('Values and weights must be same length');
  return values.map((value, i) => ({ value, weight: weights[i] }));
}

/** Uniformly select a random element from an array */
export function uniformChoice<T>(
  items: T[],
  rng: RandomSource = new DefaultRng(),
): T {
  if (items.length === 0) throw new Error('Cannot choose from empty array');
  return items[rng.nextInt(0, items.length - 1)];
}

/**
 * Shuffle an array in place using Fisher-Yates.
 *
 * @see https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
export function shuffle<T>(
  items: T[],
  rng: RandomSource = new DefaultRng(),
): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
