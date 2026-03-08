import { describe, expect, it } from 'vitest';
import { allNotesOff, controlChange, noteOff, noteOn } from './types.js';

describe('MIDI message helpers', () => {
  describe('noteOn', () => {
    it('encodes note-on on channel 0', () => {
      expect(noteOn(60, 100)).toEqual([0x90, 60, 100]);
    });

    it('encodes note-on on channel 9', () => {
      expect(noteOn(36, 127, 9)).toEqual([0x99, 36, 127]);
    });

    it('clamps note and velocity to 7 bits', () => {
      expect(noteOn(200, 200)).toEqual([0x90, 200 & 0x7f, 200 & 0x7f]);
    });
  });

  describe('noteOff', () => {
    it('encodes note-off on channel 0 with default velocity 0', () => {
      expect(noteOff(60)).toEqual([0x80, 60, 0]);
    });

    it('encodes note-off with explicit velocity', () => {
      expect(noteOff(60, 64, 2)).toEqual([0x82, 60, 64]);
    });
  });

  describe('controlChange', () => {
    it('encodes CC message', () => {
      expect(controlChange(7, 100, 0)).toEqual([0xb0, 7, 100]);
    });

    it('encodes CC on channel 15', () => {
      expect(controlChange(1, 64, 15)).toEqual([0xbf, 1, 64]);
    });
  });

  describe('allNotesOff', () => {
    it('sends CC 123 value 0', () => {
      expect(allNotesOff()).toEqual([0xb0, 123, 0]);
    });

    it('respects channel', () => {
      expect(allNotesOff(5)).toEqual([0xb5, 123, 0]);
    });
  });
});
