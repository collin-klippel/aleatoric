import { DefaultRng } from './rng.js';
import { RandomSource } from './types.js';

export const LINE_TYPES = [
  'old_yin',
  'young_yang',
  'young_yin',
  'old_yang',
] as const;

export type LineType = (typeof LINE_TYPES)[number];

export interface Line {
  type: LineType;
  value: 6 | 7 | 8 | 9;
  yin: boolean;
  changing: boolean;
}

export interface Hexagram {
  number: number;
  lines: Line[];
  /** Binary representation: yin=0, yang=1, bottom to top */
  binary: number;
  /** If there are changing lines, the resulting hexagram number */
  changingTo: number | null;
}

/**
 * Three-coin method as used by John Cage.
 * Each coin: heads=3, tails=2. Sum of 3 coins gives 6-9.
 *   6 = old yin (changing), 7 = young yang, 8 = young yin, 9 = old yang (changing)
 */
function castLine(rng: RandomSource): Line {
  const coins = [0, 0, 0].map(() => (rng.nextBool() ? 3 : 2));
  const value = (coins[0] + coins[1] + coins[2]) as 6 | 7 | 8 | 9;

  const map: Record<number, LineType> = {
    6: 'old_yin',
    7: 'young_yang',
    8: 'young_yin',
    9: 'old_yang',
  };

  return {
    type: map[value],
    value,
    yin: value === 6 || value === 8,
    changing: value === 6 || value === 9,
  };
}

function linesToBinary(lines: Line[]): number {
  let binary = 0;
  for (let i = 0; i < 6; i++) {
    if (!lines[i].yin) {
      binary |= 1 << i;
    }
  }
  return binary;
}

/**
 * King Wen sequence: maps a 6-bit binary value (lower trigram in bits 0-2,
 * upper trigram in bits 3-5) to the traditional hexagram number (1-64).
 * Index is the binary encoding; value is the King Wen number.
 */
const KING_WEN: number[] = [
  /* 0b000000 */ 2, /* 0b000001 */ 24, /* 0b000010 */ 7, /* 0b000011 */ 19,
  /* 0b000100 */ 15, /* 0b000101 */ 36, /* 0b000110 */ 46, /* 0b000111 */ 11,
  /* 0b001000 */ 16, /* 0b001001 */ 51, /* 0b001010 */ 40, /* 0b001011 */ 54,
  /* 0b001100 */ 62, /* 0b001101 */ 55, /* 0b001110 */ 32, /* 0b001111 */ 34,
  /* 0b010000 */ 8, /* 0b010001 */ 3, /* 0b010010 */ 29, /* 0b010011 */ 60,
  /* 0b010100 */ 39, /* 0b010101 */ 63, /* 0b010110 */ 48, /* 0b010111 */ 5,
  /* 0b011000 */ 45, /* 0b011001 */ 17, /* 0b011010 */ 47, /* 0b011011 */ 58,
  /* 0b011100 */ 31, /* 0b011101 */ 49, /* 0b011110 */ 28, /* 0b011111 */ 43,
  /* 0b100000 */ 23, /* 0b100001 */ 27, /* 0b100010 */ 4, /* 0b100011 */ 41,
  /* 0b100100 */ 52, /* 0b100101 */ 22, /* 0b100110 */ 18, /* 0b100111 */ 26,
  /* 0b101000 */ 35, /* 0b101001 */ 21, /* 0b101010 */ 64, /* 0b101011 */ 38,
  /* 0b101100 */ 56, /* 0b101101 */ 30, /* 0b101110 */ 50, /* 0b101111 */ 14,
  /* 0b110000 */ 20, /* 0b110001 */ 42, /* 0b110010 */ 59, /* 0b110011 */ 61,
  /* 0b110100 */ 53, /* 0b110101 */ 37, /* 0b110110 */ 57, /* 0b110111 */ 9,
  /* 0b111000 */ 12, /* 0b111001 */ 25, /* 0b111010 */ 6, /* 0b111011 */ 10,
  /* 0b111100 */ 33, /* 0b111101 */ 13, /* 0b111110 */ 44, /* 0b111111 */ 1,
];

function binaryToHexNumber(binary: number): number {
  const idx = binary & 0x3f;
  return KING_WEN[idx] ?? (idx % 64) + 1;
}

/**
 * Cast a full hexagram using the three-coin method (6 lines, bottom to top).
 *
 * @see https://en.wikipedia.org/wiki/I_Ching_divination
 * @see https://en.wikipedia.org/wiki/King_Wen_sequence
 */
export function castHexagram(rng: RandomSource = new DefaultRng()): Hexagram {
  const lines = Array.from({ length: 6 }, () => castLine(rng));
  const binary = linesToBinary(lines);
  const hasChanging = lines.some((l) => l.changing);

  let changingTo: number | null = null;
  if (hasChanging) {
    const changedLines = lines.map((l) => ({
      ...l,
      yin: l.changing ? !l.yin : l.yin,
    }));
    changingTo = binaryToHexNumber(linesToBinary(changedLines as Line[]));
  }

  return {
    number: binaryToHexNumber(binary),
    lines,
    binary,
    changingTo,
  };
}

/**
 * Map a hexagram to a numeric range.
 * Useful for Cage-style mapping: hexagram number (1-64) -> musical parameter.
 */
export function hexagramToRange(
  hexagram: Hexagram,
  min: number,
  max: number,
): number {
  return min + ((hexagram.number - 1) / 63) * (max - min);
}

/**
 * Map a hexagram to an integer range [min, max] (inclusive).
 */
export function hexagramToInt(
  hexagram: Hexagram,
  min: number,
  max: number,
): number {
  return Math.round(hexagramToRange(hexagram, min, max));
}

/**
 * Map a hexagram to select an item from an array.
 */
export function hexagramSelect<T>(hexagram: Hexagram, items: T[]): T {
  if (items.length === 0)
    throw new Error('hexagramSelect: items array must not be empty');
  const idx = Math.floor(((hexagram.number - 1) / 64) * items.length);
  return items[Math.min(idx, items.length - 1)];
}
