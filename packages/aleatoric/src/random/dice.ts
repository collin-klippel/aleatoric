import { DefaultRng } from './rng.js';
import { RandomSource } from './types.js';

export interface DiceRoll {
  individual: number[];
  sum: number;
}

/** Roll a single die with n sides (1 to n) */
export function rollDie(
  sides: number,
  rng: RandomSource = new DefaultRng(),
): number {
  return rng.nextInt(1, sides);
}

/** Roll multiple dice and return individual results and sum */
export function rollDice(
  count: number,
  sides: number,
  rng: RandomSource = new DefaultRng(),
): DiceRoll {
  const individual = Array.from({ length: count }, () => rollDie(sides, rng));
  return {
    individual,
    sum: individual.reduce((a, b) => a + b, 0),
  };
}

/** Roll 2d6 — the classic Musikalisches Würfelspiel throw */
export function roll2d6(rng: RandomSource = new DefaultRng()): DiceRoll {
  return rollDice(2, 6, rng);
}

/** Roll with advantage: roll n dice, keep highest k */
export function rollKeepHighest(
  count: number,
  sides: number,
  keep: number,
  rng: RandomSource = new DefaultRng(),
): DiceRoll {
  const roll = rollDice(count, sides, rng);
  const sorted = [...roll.individual].sort((a, b) => b - a);
  const kept = sorted.slice(0, keep);
  return { individual: kept, sum: kept.reduce((a, b) => a + b, 0) };
}

/** Roll with disadvantage: roll n dice, keep lowest k */
export function rollKeepLowest(
  count: number,
  sides: number,
  keep: number,
  rng: RandomSource = new DefaultRng(),
): DiceRoll {
  const roll = rollDice(count, sides, rng);
  const sorted = [...roll.individual].sort((a, b) => a - b);
  const kept = sorted.slice(0, keep);
  return { individual: kept, sum: kept.reduce((a, b) => a + b, 0) };
}
