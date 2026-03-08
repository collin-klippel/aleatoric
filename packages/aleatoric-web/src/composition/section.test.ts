import { describe, expect, it } from 'vitest';
import { Section } from './section.js';

describe('Section', () => {
  describe('constructor defaults', () => {
    it('defaults name to empty string', () => {
      const s = new Section({ measures: 4 });
      expect(s.name).toBe('');
    });

    it('stores provided name', () => {
      const s = new Section({ name: 'A', measures: 4 });
      expect(s.name).toBe('A');
    });

    it('stores measures count', () => {
      const s = new Section({ measures: 8 });
      expect(s.measures).toBe(8);
    });
  });

  describe('durationInBeats', () => {
    it('uses 4/4 as default time signature', () => {
      const s = new Section({ measures: 4 });
      expect(s.durationInBeats()).toBe(16);
    });

    it('respects a custom fallback time signature', () => {
      const s = new Section({ measures: 4 });
      expect(s.durationInBeats([3, 4])).toBe(12);
    });

    it('uses its own time signature over the fallback', () => {
      const s = new Section({ measures: 4, timeSignature: [3, 4] });
      expect(s.durationInBeats([4, 4])).toBe(12);
    });

    it('works with compound time signatures', () => {
      const s = new Section({ measures: 2, timeSignature: [6, 8] });
      expect(s.durationInBeats()).toBe(6);
    });
  });

  describe('events', () => {
    it('returns empty events by default', () => {
      const s = new Section({ measures: 4 });
      expect(s.getEvents()).toHaveLength(0);
    });

    it('stores and retrieves events', () => {
      const s = new Section({ measures: 4 });
      const event = {
        pitch: null,
        midi: 60,
        frequency: 261.63,
        duration: { value: 1 },
        velocity: 80,
        startBeat: 0,
        isRest: false,
      };
      s.setEvents([event]);
      expect(s.getEvents()).toHaveLength(1);
      expect(s.getEvents()[0].midi).toBe(60);
    });

    it('returns a copy of events (not reference)', () => {
      const s = new Section({ measures: 2 });
      const event = {
        pitch: null,
        midi: 60,
        frequency: 261.63,
        duration: { value: 1 },
        velocity: 80,
        startBeat: 0,
        isRest: false,
      };
      s.setEvents([event]);
      const retrieved = s.getEvents();
      retrieved.push({ ...event, midi: 99 });
      expect(s.getEvents()).toHaveLength(1);
    });
  });
});
