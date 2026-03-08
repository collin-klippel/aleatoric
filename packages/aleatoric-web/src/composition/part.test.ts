import { describe, expect, it } from 'vitest';
import { Part } from './part.js';
import { Section } from './section.js';
import { makeTestMusicEvent, mockInstrument } from './test-helpers.js';

describe('Part', () => {
  describe('constructor defaults', () => {
    it('defaults name to empty string', () => {
      const p = new Part({ instrument: mockInstrument(), generator: () => [] });
      expect(p.name).toBe('');
    });

    it('stores name', () => {
      const p = new Part({
        name: 'melody',
        instrument: mockInstrument(),
        generator: () => [],
      });
      expect(p.name).toBe('melody');
    });
  });

  describe('generateEvents — no sections', () => {
    it('calls generator with total beats', () => {
      let receivedBeats = 0;
      const p = new Part({
        instrument: mockInstrument(),
        measures: 4,
        generator: (beats) => {
          receivedBeats = beats;
          return [];
        },
      });
      p.generateEvents([4, 4]);
      expect(receivedBeats).toBe(16);
    });

    it('respects a 3/4 time signature', () => {
      let receivedBeats = 0;
      const p = new Part({
        instrument: mockInstrument(),
        measures: 4,
        generator: (beats) => {
          receivedBeats = beats;
          return [];
        },
      });
      p.generateEvents([3, 4]);
      expect(receivedBeats).toBe(12);
    });

    it('returns events from the generator', () => {
      const p = new Part({
        instrument: mockInstrument(),
        measures: 2,
        generator: () => [makeTestMusicEvent(0), makeTestMusicEvent(1)],
      });
      expect(p.generateEvents()).toHaveLength(2);
    });
  });

  describe('addSection / getSections', () => {
    it('adds sections', () => {
      const p = new Part({ instrument: mockInstrument(), generator: () => [] });
      p.addSection({ name: 'A', measures: 4 });
      p.addSection({ name: 'B', measures: 8 });
      expect(p.getSections()).toHaveLength(2);
    });

    it('returns a copy of sections array', () => {
      const p = new Part({ instrument: mockInstrument(), generator: () => [] });
      p.addSection({ measures: 4 });
      const sections = p.getSections();
      sections.push(new Section({ measures: 99 }));
      expect(p.getSections()).toHaveLength(1);
    });
  });

  describe('generateEvents — with sections', () => {
    it('generates events for all sections with correct beat offsets', () => {
      const p = new Part({
        instrument: mockInstrument(),
        generator: (_beats) => [makeTestMusicEvent(0, 60)],
      });
      p.addSection({ measures: 4 });
      p.addSection({ measures: 4 });
      const events = p.generateEvents([4, 4]);
      expect(events).toHaveLength(2);
      expect(events[0].startBeat).toBe(0);
      expect(events[1].startBeat).toBe(16);
    });

    it('stores events on each section', () => {
      const p = new Part({
        instrument: mockInstrument(),
        generator: () => [makeTestMusicEvent(0)],
      });
      const section = p.addSection({ measures: 2 });
      p.generateEvents([4, 4]);
      expect(section.getEvents()).toHaveLength(1);
    });
  });
});
