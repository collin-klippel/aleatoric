import { describe, expect, it } from 'vitest';
import {
  beatsPerMeasure,
  beatsToSeconds,
  createDuration,
  DURATIONS,
  durationsWithinBeats,
  effectiveDuration,
  secondsToBeats,
  subdivideBeat,
} from './rhythm.js';

describe('rhythm utilities', () => {
  describe('DURATIONS', () => {
    it('quarter note = 1 beat', () => {
      expect(DURATIONS.quarter).toBe(1);
    });

    it('whole note = 4 beats', () => {
      expect(DURATIONS.whole).toBe(4);
    });

    it('sixteenth note = 0.25 beats', () => {
      expect(DURATIONS.sixteenth).toBe(0.25);
    });
  });

  describe('createDuration', () => {
    it('creates from string name', () => {
      const d = createDuration('half');
      expect(d.value).toBe(2);
    });

    it('creates from numeric value', () => {
      const d = createDuration(0.75);
      expect(d.value).toBe(0.75);
    });

    it('supports dotted flag', () => {
      const d = createDuration('quarter', { dotted: true });
      expect(d.dotted).toBe(true);
    });
  });

  describe('effectiveDuration', () => {
    it('plain quarter = 1 beat', () => {
      expect(effectiveDuration({ value: 1 })).toBe(1);
    });

    it('dotted quarter = 1.5 beats', () => {
      expect(effectiveDuration({ value: 1, dotted: true })).toBe(1.5);
    });

    it('triplet quarter ≈ 0.667 beats', () => {
      expect(effectiveDuration({ value: 1, triplet: true })).toBeCloseTo(
        2 / 3,
        3,
      );
    });
  });

  describe('beatsToSeconds / secondsToBeats', () => {
    it('1 beat at 120 bpm = 0.5 seconds', () => {
      expect(beatsToSeconds(1, 120)).toBe(0.5);
    });

    it('round-trips', () => {
      expect(secondsToBeats(beatsToSeconds(4, 90), 90)).toBeCloseTo(4, 10);
    });
  });

  describe('beatsPerMeasure', () => {
    it('4/4 = 4 beats', () => {
      expect(beatsPerMeasure([4, 4])).toBe(4);
    });

    it('3/4 = 3 beats', () => {
      expect(beatsPerMeasure([3, 4])).toBe(3);
    });

    it('6/8 = 3 beats', () => {
      expect(beatsPerMeasure([6, 8])).toBe(3);
    });
  });

  describe('durationsWithinBeats', () => {
    it('finds durations fitting in 1 beat', () => {
      const result = durationsWithinBeats(1);
      expect(result).toContain(1);
      expect(result).toContain(0.5);
      expect(result).not.toContain(2);
    });
  });

  describe('subdivideBeat', () => {
    it('divides 1 beat into 3 parts', () => {
      expect(subdivideBeat(1, 3)).toBeCloseTo(1 / 3, 10);
    });
  });
});
