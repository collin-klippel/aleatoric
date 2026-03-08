import { describe, expect, it } from 'vitest';
import { createMusicEvent } from '../generators/types.js';
import { Timeline } from './timeline.js';

function note(startBeat: number, duration: number = 1) {
  return createMusicEvent({
    midi: 60,
    frequency: 261.63,
    duration: { value: duration },
    velocity: 80,
    startBeat,
  });
}

describe('Timeline', () => {
  it('sorts events by startBeat', () => {
    const tl = new Timeline([note(2), note(0), note(1)]);
    const events = tl.getEvents();
    expect(events[0].startBeat).toBe(0);
    expect(events[1].startBeat).toBe(1);
    expect(events[2].startBeat).toBe(2);
  });

  it('tracks length and duration', () => {
    const tl = new Timeline([note(0, 2), note(2, 1)]);
    expect(tl.length).toBe(2);
    expect(tl.duration).toBe(3);
  });

  it('merge combines timelines with offset', () => {
    const tl1 = new Timeline([note(0)]);
    const tl2 = new Timeline([note(0)]);
    tl1.merge(tl2, 4);
    expect(tl1.length).toBe(2);
    expect(tl1.getEvents()[1].startBeat).toBe(4);
  });

  it('getEventsInRange returns events in [from, to)', () => {
    const tl = new Timeline([note(0), note(1), note(2), note(3)]);
    const range = tl.getEventsInRange(1, 3);
    expect(range).toHaveLength(2);
    expect(range[0].startBeat).toBe(1);
    expect(range[1].startBeat).toBe(2);
  });

  it('quantize snaps to grid', () => {
    const tl = new Timeline([note(0.3), note(0.7), note(1.1)]);
    const quantized = tl.quantize(0.5);
    const events = quantized.getEvents();
    expect(events[0].startBeat).toBe(0.5);
    expect(events[1].startBeat).toBe(0.5);
    expect(events[2].startBeat).toBe(1.0);
  });

  it('clear removes all events', () => {
    const tl = new Timeline([note(0), note(1)]);
    tl.clear();
    expect(tl.length).toBe(0);
  });

  it('offset shifts all events', () => {
    const tl = new Timeline([note(0), note(1)]);
    const shifted = tl.offset(10);
    expect(shifted.getEvents()[0].startBeat).toBe(10);
    expect(shifted.getEvents()[1].startBeat).toBe(11);
  });

  it('slice extracts a range', () => {
    const tl = new Timeline([note(0), note(1), note(2), note(3)]);
    const sliced = tl.slice(1, 3);
    expect(sliced.length).toBe(2);
  });
});
