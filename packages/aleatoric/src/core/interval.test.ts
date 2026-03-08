import { describe, expect, it } from 'vitest';
import {
  Interval,
  intervalName,
  invertInterval,
  isConsonant,
  simpleInterval,
} from './interval.js';

describe('interval', () => {
  describe('Interval enum', () => {
    it('has correct semitone values', () => {
      expect(Interval.Unison).toBe(0);
      expect(Interval.MinorSecond).toBe(1);
      expect(Interval.MajorSecond).toBe(2);
      expect(Interval.MinorThird).toBe(3);
      expect(Interval.MajorThird).toBe(4);
      expect(Interval.PerfectFourth).toBe(5);
      expect(Interval.Tritone).toBe(6);
      expect(Interval.PerfectFifth).toBe(7);
      expect(Interval.MinorSixth).toBe(8);
      expect(Interval.MajorSixth).toBe(9);
      expect(Interval.MinorSeventh).toBe(10);
      expect(Interval.MajorSeventh).toBe(11);
      expect(Interval.Octave).toBe(12);
    });
  });

  describe('intervalName', () => {
    it('names simple intervals', () => {
      expect(intervalName(0)).toBe('Unison');
      expect(intervalName(7)).toBe('Perfect 5th');
      expect(intervalName(4)).toBe('Major 3rd');
      expect(intervalName(1)).toBe('Minor 2nd');
      expect(intervalName(6)).toBe('Tritone');
    });

    it('names the octave (12 semitones reduces to Unison)', () => {
      // 12 semitones: simple = 0 (Unison), octaves = 1, but simple === 0 so no "Compound" prefix
      expect(intervalName(12)).toBe('Unison');
    });

    it('names compound intervals', () => {
      expect(intervalName(19)).toBe('Compound Perfect 5th');
    });

    it('names intervals larger than two octaves', () => {
      const name = intervalName(31);
      expect(name).toContain('octave');
    });

    it('handles negative semitones (downward)', () => {
      const name = intervalName(-7);
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    });
  });

  describe('invertInterval', () => {
    it('inverts a perfect fifth to a perfect fourth', () => {
      expect(invertInterval(7)).toBe(5);
    });

    it('inverts a major third to a minor sixth', () => {
      expect(invertInterval(4)).toBe(8);
    });

    it('unison inverts to unison (octave)', () => {
      expect(invertInterval(0)).toBe(12);
    });

    it('handles compound intervals by simplifying first', () => {
      expect(invertInterval(19)).toBe(invertInterval(7));
    });
  });

  describe('isConsonant', () => {
    it('treats perfect intervals as consonant', () => {
      expect(isConsonant(0)).toBe(true);
      expect(isConsonant(5)).toBe(true);
      expect(isConsonant(7)).toBe(true);
    });

    it('treats thirds and sixths as consonant', () => {
      expect(isConsonant(3)).toBe(true);
      expect(isConsonant(4)).toBe(true);
      expect(isConsonant(8)).toBe(true);
      expect(isConsonant(9)).toBe(true);
    });

    it('treats tritone as dissonant', () => {
      expect(isConsonant(6)).toBe(false);
    });

    it('treats minor and major seconds/sevenths as dissonant', () => {
      expect(isConsonant(1)).toBe(false);
      expect(isConsonant(2)).toBe(false);
      expect(isConsonant(10)).toBe(false);
      expect(isConsonant(11)).toBe(false);
    });

    it('handles compound intervals by simplifying', () => {
      expect(isConsonant(12)).toBe(true);
      expect(isConsonant(19)).toBe(isConsonant(7));
    });
  });

  describe('simpleInterval', () => {
    it('reduces intervals to within one octave', () => {
      expect(simpleInterval(0)).toBe(0);
      expect(simpleInterval(7)).toBe(7);
      expect(simpleInterval(12)).toBe(0);
      expect(simpleInterval(19)).toBe(7);
    });

    it('handles negative semitones', () => {
      expect(simpleInterval(-7)).toBe(5);
    });
  });
});
