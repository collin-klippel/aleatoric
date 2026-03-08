import { describe, expect, it } from 'vitest';
import {
  comparePitch,
  createPitch,
  frequencyToMidi,
  intervalBetween,
  midiToFrequency,
  midiToPitch,
  normalizeNoteName,
  parsePitch,
  pitchToFrequency,
  pitchToMidi,
  pitchToString,
  transpose,
} from './note.js';

describe('note utilities', () => {
  describe('pitchToMidi / midiToPitch', () => {
    it('converts C4 to MIDI 60', () => {
      expect(pitchToMidi({ name: 'C', octave: 4 })).toBe(60);
    });

    it('converts A4 to MIDI 69', () => {
      expect(pitchToMidi({ name: 'A', octave: 4 })).toBe(69);
    });

    it('converts MIDI 60 back to C4', () => {
      const pitch = midiToPitch(60);
      expect(pitch.name).toBe('C');
      expect(pitch.octave).toBe(4);
    });

    it('round-trips for all MIDI values 0-127', () => {
      for (let midi = 0; midi <= 127; midi++) {
        expect(pitchToMidi(midiToPitch(midi))).toBe(midi);
      }
    });
  });

  describe('frequency conversion', () => {
    it('A4 = 440 Hz', () => {
      expect(midiToFrequency(69)).toBeCloseTo(440, 2);
    });

    it('C4 ≈ 261.63 Hz', () => {
      expect(pitchToFrequency({ name: 'C', octave: 4 })).toBeCloseTo(261.63, 1);
    });

    it('frequencyToMidi(440) = 69', () => {
      expect(frequencyToMidi(440)).toBe(69);
    });
  });

  describe('transpose', () => {
    it('C4 + 4 semitones = E4', () => {
      const result = transpose({ name: 'C', octave: 4 }, 4);
      expect(result.name).toBe('E');
      expect(result.octave).toBe(4);
    });

    it('C4 + 12 semitones = C5', () => {
      const result = transpose({ name: 'C', octave: 4 }, 12);
      expect(result.name).toBe('C');
      expect(result.octave).toBe(5);
    });

    it('handles negative transposition', () => {
      const result = transpose({ name: 'E', octave: 4 }, -4);
      expect(result.name).toBe('C');
      expect(result.octave).toBe(4);
    });
  });

  describe('intervalBetween', () => {
    it('C4 to E4 = 4 semitones', () => {
      expect(
        intervalBetween({ name: 'C', octave: 4 }, { name: 'E', octave: 4 }),
      ).toBe(4);
    });

    it('E4 to C4 = -4 semitones', () => {
      expect(
        intervalBetween({ name: 'E', octave: 4 }, { name: 'C', octave: 4 }),
      ).toBe(-4);
    });
  });

  describe('comparePitch', () => {
    it('C4 < E4', () => {
      expect(
        comparePitch({ name: 'C', octave: 4 }, { name: 'E', octave: 4 }),
      ).toBeLessThan(0);
    });

    it('same pitch returns 0', () => {
      expect(
        comparePitch({ name: 'A', octave: 4 }, { name: 'A', octave: 4 }),
      ).toBe(0);
    });
  });

  describe('createPitch', () => {
    it('creates a pitch object', () => {
      const p = createPitch('G', 3);
      expect(p.name).toBe('G');
      expect(p.octave).toBe(3);
    });
  });

  describe('normalizeNoteName', () => {
    it('passes through valid sharp names', () => {
      expect(normalizeNoteName('C#')).toBe('C#');
    });

    it('converts flats to sharps', () => {
      expect(normalizeNoteName('Db')).toBe('C#');
      expect(normalizeNoteName('Eb')).toBe('D#');
      expect(normalizeNoteName('Bb')).toBe('A#');
    });

    it('throws on invalid name', () => {
      expect(() => normalizeNoteName('X')).toThrow();
    });
  });

  describe('parsePitch / pitchToString', () => {
    it('parses "C4"', () => {
      const p = parsePitch('C4');
      expect(p.name).toBe('C');
      expect(p.octave).toBe(4);
    });

    it('parses "F#3"', () => {
      const p = parsePitch('F#3');
      expect(p.name).toBe('F#');
      expect(p.octave).toBe(3);
    });

    it('round-trips via pitchToString', () => {
      const original = { name: 'G#' as const, octave: 5 as const };
      expect(parsePitch(pitchToString(original))).toEqual(original);
    });

    it('throws on invalid string', () => {
      expect(() => parsePitch('invalid')).toThrow();
    });
  });
});
