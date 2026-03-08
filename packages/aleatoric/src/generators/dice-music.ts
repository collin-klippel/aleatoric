import { midiToFrequency, midiToPitch } from '../core/note.js';
import { MusicEvent } from '../core/types.js';
import { roll2d6 } from '../random/dice.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

/**
 * Musikalisches Würfelspiel — compose by rolling dice to select pre-composed
 * fragments from a table, then concatenating them.
 */

export interface DiceMusicOptions {
  /** Number of measures to generate */
  measures: number;
  /**
   * Fragment table: maps dice sum (2-12) to arrays of MusicEvent fragments.
   * Each entry should contain all events for one measure.
   * Multiple arrays per dice value allow variation across measure positions.
   */
  table: DiceMusicTable;
  rng?: RandomSource;
}

/**
 * A dice music table. Keys are dice sums (2-12).
 * Values are arrays of "columns" — each column is an array of fragments
 * for a given measure position. If there's only one column, it's reused.
 */
export type DiceMusicTable = Record<number, MusicEvent[][]>;

/**
 * @see https://en.wikipedia.org/wiki/Musikalisches_W%C3%BCrfelspiel
 */
export function generateDiceMusic(options: DiceMusicOptions): MusicEvent[] {
  const { measures, table, rng = new DefaultRng() } = options;

  const events: MusicEvent[] = [];
  let beatOffset = 0;

  for (let measure = 0; measure < measures; measure++) {
    const roll = roll2d6(rng);
    const columns = table[roll.sum];

    if (!columns || columns.length === 0) {
      continue;
    }

    // Select column based on measure position (wraps around)
    const column = columns[measure % columns.length];
    const measureDuration = getFragmentDuration(column);

    for (const event of column) {
      events.push({
        ...event,
        startBeat: event.startBeat + beatOffset,
      });
    }

    beatOffset += measureDuration;
  }

  return events;
}

function getFragmentDuration(events: MusicEvent[]): number {
  if (events.length === 0) return 4;
  let max = 0;
  for (const e of events) {
    const end = e.startBeat + e.duration.value;
    if (end > max) max = end;
  }
  return max;
}

/**
 * Helper to create a simple dice music table from arrays of MIDI note sequences.
 * Each sequence becomes one column for its dice sum.
 */
export function createSimpleDiceTable(
  entries: Record<number, number[][]>,
  duration: number = 1,
  velocity: number = 80,
): DiceMusicTable {
  const table: DiceMusicTable = {};

  for (const [sum, columns] of Object.entries(entries)) {
    table[parseInt(sum, 10)] = columns.map((notes) =>
      notes.map((midi, i) =>
        createMusicEvent({
          pitch: midiToPitch(midi),
          midi,
          frequency: midiToFrequency(midi),
          duration: { value: duration },
          velocity,
          startBeat: i * duration,
        }),
      ),
    );
  }

  return table;
}
