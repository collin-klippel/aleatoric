import { describe, expect, it } from 'vitest';
import { midiToFrequency, midiToPitch } from '../core/note.js';
import { Scale } from '../core/scale.js';
import {
  applyConstraints,
  ContourConstraint,
  MaxLeapConstraint,
  RangeConstraint,
  ScaleConstraint,
} from './constrained.js';
import { createMusicEvent } from './types.js';

function makeNote(midi: number, beat: number) {
  return createMusicEvent({
    pitch: midiToPitch(midi),
    midi,
    frequency: midiToFrequency(midi),
    duration: { value: 1 },
    velocity: 80,
    startBeat: beat,
  });
}

describe('constraints', () => {
  describe('ScaleConstraint', () => {
    it('snaps out-of-scale notes to nearest scale tone', () => {
      const constraint = new ScaleConstraint(Scale.major('C'));
      const events = [makeNote(61, 0)]; // C#4 -> should snap to C or D
      const result = constraint.apply(events);
      const cMajor = Scale.major('C');
      const first = result[0];
      expect(first.pitch).not.toBeNull();
      if (first.pitch) expect(cMajor.contains(first.pitch)).toBe(true);
    });

    it('preserves rests', () => {
      const constraint = new ScaleConstraint(Scale.major('C'));
      const rest = createMusicEvent({
        startBeat: 0,
        isRest: true,
        midi: 0,
        frequency: 0,
        velocity: 0,
      });
      const result = constraint.apply([rest]);
      expect(result[0].isRest).toBe(true);
    });
  });

  describe('MaxLeapConstraint', () => {
    it('limits interval leaps', () => {
      const constraint = new MaxLeapConstraint(5);
      const events = [makeNote(60, 0), makeNote(80, 1)];
      const result = constraint.apply(events);
      expect(Math.abs(result[1].midi - result[0].midi)).toBeLessThanOrEqual(5);
    });
  });

  describe('RangeConstraint', () => {
    it('keeps pitches within range via octave transposition', () => {
      const constraint = new RangeConstraint(48, 72);
      const events = [makeNote(36, 0), makeNote(84, 1)];
      const result = constraint.apply(events);
      for (const e of result) {
        expect(e.midi).toBeGreaterThanOrEqual(48);
        expect(e.midi).toBeLessThanOrEqual(72);
      }
    });
  });

  describe('ContourConstraint', () => {
    it('ascending contour produces rising pitches', () => {
      const constraint = new ContourConstraint('ascending');
      const events = [makeNote(70, 0), makeNote(60, 1), makeNote(65, 2)];
      const result = constraint.apply(events);
      for (let i = 1; i < result.length; i++) {
        expect(result[i].midi).toBeGreaterThanOrEqual(result[i - 1].midi);
      }
    });
  });

  describe('applyConstraints', () => {
    it('chains multiple constraints', () => {
      const events = [makeNote(61, 0), makeNote(100, 1)];
      const result = applyConstraints(events, [
        new ScaleConstraint(Scale.major('C')),
        new RangeConstraint(48, 72),
      ]);
      const cMajor = Scale.major('C');
      for (const e of result) {
        expect(e.pitch).not.toBeNull();
        if (e.pitch) expect(cMajor.contains(e.pitch)).toBe(true);
        expect(e.midi).toBeGreaterThanOrEqual(48);
        expect(e.midi).toBeLessThanOrEqual(72);
      }
    });
  });
});
