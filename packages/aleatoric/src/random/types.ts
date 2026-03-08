export interface RandomSource {
  /** Returns a value in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] (inclusive) */
  nextInt(min: number, max: number): number;
  /** Returns a boolean with the given probability of being true */
  nextBool(probability?: number): boolean;
  /** Fork a new independent RandomSource from the current state */
  fork(): RandomSource;
}
