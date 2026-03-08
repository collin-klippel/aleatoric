import { describe, expect, it } from 'vitest';
import { SeededRng } from '../random/rng.js';
import {
  buildMidiTransitionMatrix,
  buildTransitionMatrix,
  generateMarkovSequence,
} from './markov.js';

describe('Markov generator', () => {
  describe('buildTransitionMatrix', () => {
    it('builds from a sequence', () => {
      const matrix = buildTransitionMatrix(['A', 'B', 'A', 'C', 'A', 'B']);
      expect(matrix.A).toEqual({ B: 2, C: 1 });
      expect(matrix.B).toEqual({ A: 1 });
      expect(matrix.C).toEqual({ A: 1 });
    });

    it('builds second-order chains', () => {
      const matrix = buildTransitionMatrix(['A', 'B', 'C', 'A', 'B', 'D'], 2);
      expect(matrix['A,B']).toEqual({ C: 1, D: 1 });
    });
  });

  describe('buildMidiTransitionMatrix', () => {
    it('builds from MIDI numbers', () => {
      const matrix = buildMidiTransitionMatrix([60, 62, 64, 62, 60]);
      expect(matrix['60']).toEqual({ '62': 1 });
      expect(matrix['62']).toEqual({ '64': 1, '60': 1 });
    });

    it('builds a second-order chain from MIDI numbers', () => {
      const matrix = buildMidiTransitionMatrix([60, 62, 64, 60, 62, 65], 2);
      // n-gram "60,62" appears twice: once followed by 64, once by 65
      expect(matrix['60,62']).toEqual({ '64': 1, '65': 1 });
      expect(matrix['62,64']).toEqual({ '60': 1 });
    });
  });

  describe('generateMarkovSequence', () => {
    const matrix = {
      '60': { '62': 3, '64': 1 },
      '62': { '60': 2, '65': 1 },
      '64': { '60': 1 },
      '65': { '62': 1 },
    };

    it('generates the requested count', () => {
      const events = generateMarkovSequence({
        count: 20,
        transitionMatrix: matrix,
        rng: new SeededRng(42),
      });
      expect(events).toHaveLength(20);
    });

    it('events have valid MIDI values from the matrix', () => {
      const events = generateMarkovSequence({
        count: 50,
        transitionMatrix: matrix,
        rng: new SeededRng(1),
      });
      const validMidi = [60, 62, 64, 65];
      for (const e of events) {
        expect(validMidi).toContain(e.midi);
      }
    });

    it('respects initial state', () => {
      const events = generateMarkovSequence({
        count: 5,
        transitionMatrix: matrix,
        initialState: '64',
        rng: new SeededRng(42),
      });
      expect(events[0].midi).toBe(64);
    });

    it('is deterministic', () => {
      const e1 = generateMarkovSequence({
        count: 10,
        transitionMatrix: matrix,
        rng: new SeededRng(42),
      });
      const e2 = generateMarkovSequence({
        count: 10,
        transitionMatrix: matrix,
        rng: new SeededRng(42),
      });
      expect(e1.map((e) => e.midi)).toEqual(e2.map((e) => e.midi));
    });

    it('throws when transition matrix is empty', () => {
      expect(() =>
        generateMarkovSequence({
          count: 1,
          transitionMatrix: {},
          rng: new SeededRng(1),
        }),
      ).toThrow('Transition matrix is empty');
    });

    it('uses MIDI 60 when statesAreMidi is false', () => {
      const events = generateMarkovSequence({
        count: 3,
        transitionMatrix: {
          A: { B: 1 },
          B: { A: 1 },
        },
        initialState: 'A',
        statesAreMidi: false,
        rng: new SeededRng(42),
      });
      for (const e of events) {
        expect(e.midi).toBe(60);
      }
    });

    it('recovers from dead-end states by jumping to another state', () => {
      const events = generateMarkovSequence({
        count: 8,
        transitionMatrix: {
          '60': {},
          '62': { '64': 1 },
          '64': { '62': 1 },
        },
        initialState: '60',
        rng: new SeededRng(42),
      });
      expect(events).toHaveLength(8);
      const midis = events.map((e) => e.midi);
      expect(midis.every((m) => [60, 62, 64].includes(m))).toBe(true);
    });

    it('shifts state window for second-order chains', () => {
      const matrix = {
        '60,62': { '64': 1 },
        '62,64': { '65': 1 },
        '64,65': { '60': 1 },
      };
      const events = generateMarkovSequence({
        count: 6,
        transitionMatrix: matrix,
        initialState: '60,62',
        rng: new SeededRng(42),
      });
      expect(events[0].midi).toBe(62);
      expect(events.every((e) => e.midi >= 60 && e.midi <= 65)).toBe(true);
    });
  });
});
