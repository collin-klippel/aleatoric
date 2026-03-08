import type { MusicEvent } from 'aleatoric';
import { describe, expect, it } from 'vitest';
import { Part } from './part.js';
import { Score } from './score.js';
import { makeTestMusicEvent, mockInstrument } from './test-helpers.js';

function makePart(events: MusicEvent[], name = 'part'): Part {
  return new Part({
    name,
    instrument: mockInstrument(),
    generator: () => events,
    measures: 4,
  });
}

describe('Score', () => {
  describe('constructor defaults', () => {
    it('defaults title to Untitled', () => {
      const score = new Score();
      expect(score.title).toBe('Untitled');
    });

    it('defaults bpm to 120', () => {
      const score = new Score();
      expect(score.bpm).toBe(120);
    });

    it('defaults time signature to 4/4', () => {
      const score = new Score();
      expect(score.timeSignature).toEqual([4, 4]);
    });

    it('accepts numeric tempo', () => {
      const score = new Score({ tempo: 90 });
      expect(score.bpm).toBe(90);
    });

    it('accepts Tempo object', () => {
      const score = new Score({ tempo: { bpm: 144 } });
      expect(score.bpm).toBe(144);
    });
  });

  describe('addPart / removePart / getParts', () => {
    it('adds parts', () => {
      const score = new Score();
      score.addPart(makePart([]));
      score.addPart(makePart([]));
      expect(score.getParts()).toHaveLength(2);
    });

    it('removes a part', () => {
      const score = new Score();
      const p = makePart([]);
      score.addPart(p);
      score.removePart(p);
      expect(score.getParts()).toHaveLength(0);
    });

    it('returns a copy of parts array', () => {
      const score = new Score();
      score.addPart(makePart([]));
      const parts = score.getParts();
      parts.push(makePart([]));
      expect(score.getParts()).toHaveLength(1);
    });
  });

  describe('renderTimeline', () => {
    it('merges events from all parts', () => {
      const score = new Score();
      score.addPart(
        makePart([makeTestMusicEvent(0, 60), makeTestMusicEvent(1, 62)]),
      );
      score.addPart(makePart([makeTestMusicEvent(0, 67)]));
      const timeline = score.renderTimeline();
      const events = timeline.getEventsInRange(0, 100);
      expect(events).toHaveLength(3);
    });

    it('returns an empty timeline when there are no parts', () => {
      const score = new Score();
      const timeline = score.renderTimeline();
      expect(timeline.getEventsInRange(0, 100)).toHaveLength(0);
    });
  });

  describe('renderPartTimelines', () => {
    it('returns a map with one entry per part', () => {
      const score = new Score();
      const p1 = makePart([makeTestMusicEvent(0)], 'p1');
      const p2 = makePart([makeTestMusicEvent(0)], 'p2');
      score.addPart(p1);
      score.addPart(p2);
      const map = score.renderPartTimelines();
      expect(map.size).toBe(2);
      expect(map.has(p1)).toBe(true);
      expect(map.has(p2)).toBe(true);
    });

    it('each timeline contains only its part events', () => {
      const score = new Score();
      const p1 = makePart([makeTestMusicEvent(0, 60)], 'p1');
      const p2 = makePart(
        [makeTestMusicEvent(0, 72), makeTestMusicEvent(1, 74)],
        'p2',
      );
      score.addPart(p1);
      score.addPart(p2);
      const map = score.renderPartTimelines();
      expect(map.get(p1)?.getEventsInRange(0, 100)).toHaveLength(1);
      expect(map.get(p2)?.getEventsInRange(0, 100)).toHaveLength(2);
    });
  });
});
