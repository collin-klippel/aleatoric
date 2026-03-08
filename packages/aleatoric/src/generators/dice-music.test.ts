import { describe, expect, it } from 'vitest';
import { SeededRng } from '../random/rng.js';
import { createSimpleDiceTable, generateDiceMusic } from './dice-music.js';

const ALL_DICE_SUMS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function makeFullTable() {
  const entries: Record<number, number[][]> = {};
  for (const sum of ALL_DICE_SUMS) {
    entries[sum] = [[60, 62, 64]];
  }
  return createSimpleDiceTable(entries, 1, 80);
}

describe('createSimpleDiceTable', () => {
  it('creates a table with correct structure', () => {
    const table = makeFullTable();
    for (const sum of ALL_DICE_SUMS) {
      expect(table[sum]).toBeDefined();
      expect(Array.isArray(table[sum])).toBe(true);
    }
  });

  it('each column contains the correct number of events', () => {
    const table = createSimpleDiceTable({ 7: [[60, 62, 64]] }, 1, 80);
    expect(table[7][0]).toHaveLength(3);
  });

  it('sets correct midi, frequency, velocity, and duration', () => {
    const table = createSimpleDiceTable({ 5: [[69]] }, 2, 90);
    const event = table[5][0][0];
    expect(event.midi).toBe(69);
    expect(event.duration.value).toBe(2);
    expect(event.velocity).toBe(90);
    expect(event.isRest).toBe(false);
    expect(event.frequency).toBeCloseTo(440, 0);
  });

  it('assigns sequential startBeat values', () => {
    const table = createSimpleDiceTable({ 7: [[60, 62, 64]] }, 1, 80);
    const col = table[7][0];
    expect(col[0].startBeat).toBe(0);
    expect(col[1].startBeat).toBe(1);
    expect(col[2].startBeat).toBe(2);
  });
});

describe('generateDiceMusic', () => {
  it('returns one fragment per measure when every roll hits the table', () => {
    const table = makeFullTable();
    const sampleColumn = table[7][0];
    const eventsPerFragment = sampleColumn.length;
    const fragmentBeats = Math.max(
      ...sampleColumn.map((e) => e.startBeat + e.duration.value),
    );
    for (const measures of [1, 2, 4]) {
      const events = generateDiceMusic({
        measures,
        table,
        rng: new SeededRng(1),
      });
      expect(events).toHaveLength(measures * eventsPerFragment);
      const span = Math.max(
        ...events.map((e) => e.startBeat + e.duration.value),
      );
      expect(span).toBe(measures * fragmentBeats);
    }
  });

  it('is deterministic with a seeded rng', () => {
    const table = makeFullTable();
    const a = generateDiceMusic({ measures: 4, table, rng: new SeededRng(42) });
    const b = generateDiceMusic({ measures: 4, table, rng: new SeededRng(42) });
    expect(a.map((e) => e.midi)).toEqual(b.map((e) => e.midi));
  });

  it('offsets startBeat across measures', () => {
    const table = makeFullTable();
    const events = generateDiceMusic({
      measures: 2,
      table,
      rng: new SeededRng(10),
    });
    const maxBeat = Math.max(...events.map((e) => e.startBeat));
    expect(maxBeat).toBeGreaterThanOrEqual(3);
  });

  it('handles an empty measures value gracefully', () => {
    const table = makeFullTable();
    const events = generateDiceMusic({
      measures: 0,
      table,
      rng: new SeededRng(1),
    });
    expect(events).toHaveLength(0);
  });

  it('skips dice sums missing from the table', () => {
    const partialTable = createSimpleDiceTable({ 7: [[60, 62]] }, 1, 80);
    const rng = new SeededRng(99);
    expect(() =>
      generateDiceMusic({ measures: 10, table: partialTable, rng }),
    ).not.toThrow();
  });
});
