import { describe, expect, it } from 'vitest';
import { Chord } from './chord.js';
import { pitchToMidi } from './note.js';

describe('Chord', () => {
  describe('factory methods', () => {
    it('creates a C major triad', () => {
      const chord = Chord.major('C');
      expect(chord.root).toBe('C');
      expect(chord.quality).toBe('major');
      expect(chord.intervals).toEqual([0, 4, 7]);
    });

    it('creates a D minor chord', () => {
      const chord = Chord.minor('D');
      expect(chord.root).toBe('D');
      expect(chord.intervals).toEqual([0, 3, 7]);
    });

    it('handles flat root names', () => {
      const chord = Chord.major('Eb');
      expect(chord.root).toBe('D#');
    });
  });

  describe('getPitches', () => {
    it('returns C major triad at octave 4', () => {
      const pitches = Chord.major('C').getPitches(4);
      expect(pitches).toHaveLength(3);
      expect(pitches[0]).toEqual({ name: 'C', octave: 4 });
      expect(pitches[1]).toEqual({ name: 'E', octave: 4 });
      expect(pitches[2]).toEqual({ name: 'G', octave: 4 });
    });

    it('returns dominant 7th with 4 notes', () => {
      const pitches = Chord.dominant7('G').getPitches(3);
      expect(pitches).toHaveLength(4);
    });
  });

  describe('noteNames', () => {
    it('returns note names for Am chord', () => {
      const names = Chord.minor('A').noteNames();
      expect(names).toEqual(['A', 'C', 'E']);
    });
  });

  describe('inversion', () => {
    it('root position is unchanged', () => {
      const root = Chord.major('C').getPitches(4);
      const inv0 = Chord.major('C').inversion(0, 4);
      expect(inv0.map(pitchToMidi)).toEqual(root.map(pitchToMidi));
    });

    it('first inversion moves root up an octave', () => {
      const inv1 = Chord.major('C').inversion(1, 4);
      const midis = inv1.map(pitchToMidi);
      expect(midis[0]).toBe(pitchToMidi({ name: 'E', octave: 4 }));
      expect(midis[2]).toBeGreaterThan(midis[1]);
    });
  });
});
