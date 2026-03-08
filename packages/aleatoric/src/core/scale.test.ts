import { describe, expect, it } from 'vitest';
import { SCALE_TYPE_NAMES, Scale } from './scale.js';

describe('Scale', () => {
  it('Scale.types matches SCALE_TYPE_NAMES', () => {
    expect(Scale.types).toEqual(SCALE_TYPE_NAMES);
  });

  describe('factory methods', () => {
    it('creates a C major scale', () => {
      const scale = Scale.major('C');
      expect(scale.root).toBe('C');
      expect(scale.name).toBe('major');
      expect(scale.intervals).toEqual([0, 2, 4, 5, 7, 9, 11]);
    });

    it('creates an A minor scale', () => {
      const scale = Scale.minor('A');
      expect(scale.root).toBe('A');
      expect(scale.intervals).toEqual([0, 2, 3, 5, 7, 8, 10]);
    });

    it('handles flat note names', () => {
      const scale = Scale.major('Bb');
      expect(scale.root).toBe('A#');
    });

    it('throws for unknown scale type', () => {
      expect(() => Scale.create('C', 'nonexistent')).toThrow();
    });
  });

  describe('contains', () => {
    const cMajor = Scale.major('C');

    it('C is in C major', () => {
      expect(cMajor.contains({ name: 'C', octave: 4 })).toBe(true);
    });

    it('E is in C major', () => {
      expect(cMajor.contains({ name: 'E', octave: 4 })).toBe(true);
    });

    it('C# is not in C major', () => {
      expect(cMajor.contains({ name: 'C#', octave: 4 })).toBe(false);
    });
  });

  describe('degreeOf', () => {
    const cMajor = Scale.major('C');

    it('C is degree 0', () => {
      expect(cMajor.degreeOf({ name: 'C', octave: 4 })).toBe(0);
    });

    it('G is degree 4', () => {
      expect(cMajor.degreeOf({ name: 'G', octave: 4 })).toBe(4);
    });

    it('F# returns -1 (not in scale)', () => {
      expect(cMajor.degreeOf({ name: 'F#', octave: 4 })).toBe(-1);
    });
  });

  describe('getPitches', () => {
    it('returns pitches in the given octave range', () => {
      const pitches = Scale.major('C').getPitches(4, 4);
      expect(pitches.length).toBe(7);
      expect(pitches[0]).toEqual({ name: 'C', octave: 4 });
    });
  });

  describe('nearest', () => {
    const cMajor = Scale.major('C');

    it('snaps C#4 (MIDI 61) to C or D', () => {
      const result = cMajor.nearest(61);
      expect(['C', 'D']).toContain(result.name);
    });

    it('keeps C4 (MIDI 60) as C', () => {
      const result = cMajor.nearest(60);
      expect(result.name).toBe('C');
      expect(result.octave).toBe(4);
    });
  });

  describe('degree', () => {
    const cMajor = Scale.major('C');

    it('degree 0 at octave 4 = C4', () => {
      const p = cMajor.degree(0, 4);
      expect(p.name).toBe('C');
      expect(p.octave).toBe(4);
    });

    it('degree 4 at octave 4 = G4', () => {
      const p = cMajor.degree(4, 4);
      expect(p.name).toBe('G');
      expect(p.octave).toBe(4);
    });

    it('degree 7 wraps to next octave', () => {
      const p = cMajor.degree(7, 4);
      expect(p.name).toBe('C');
      expect(p.octave).toBe(5);
    });
  });

  describe('types', () => {
    it('lists all available scale types', () => {
      const types = Scale.types;
      expect(types).toContain('major');
      expect(types).toContain('minor');
      expect(types).toContain('pentatonic');
      expect(types).toContain('chromatic');
      expect(types.length).toBeGreaterThan(10);
    });
  });
});
