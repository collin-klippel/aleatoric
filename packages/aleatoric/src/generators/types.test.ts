import { describe, expect, it } from 'vitest';
import { createMusicEvent } from './types.js';

describe('createMusicEvent', () => {
  it('fills defaults for omitted fields', () => {
    const e = createMusicEvent({ startBeat: 2 });
    expect(e).toEqual({
      pitch: null,
      midi: 60,
      frequency: 261.63,
      duration: { value: 1 },
      velocity: 80,
      startBeat: 2,
      isRest: false,
    });
  });

  it('preserves overrides', () => {
    const e = createMusicEvent({
      startBeat: 0,
      midi: 72,
      velocity: 100,
      isRest: true,
      duration: { value: 0.5 },
      pitch: { name: 'C', octave: 4 },
      frequency: 440,
    });
    expect(e.midi).toBe(72);
    expect(e.velocity).toBe(100);
    expect(e.isRest).toBe(true);
    expect(e.duration).toEqual({ value: 0.5 });
    expect(e.pitch).toEqual({ name: 'C', octave: 4 });
    expect(e.frequency).toBe(440);
  });
});
