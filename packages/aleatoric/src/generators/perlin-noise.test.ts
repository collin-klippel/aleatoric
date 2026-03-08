import { describe, expect, it } from 'vitest';
import { Scale } from '../core/scale.js';
import { generatePerlinNoiseMelody } from './perlin-noise.js';

describe('perlin-noise', () => {
  it('should generate events matching the count', () => {
    const events = generatePerlinNoiseMelody({ count: 16 });
    expect(events).toHaveLength(16);
  });

  it('should generate events within the specified MIDI range', () => {
    const low = 48;
    const high = 72;
    const events = generatePerlinNoiseMelody({ count: 20, low, high });

    events.forEach((event) => {
      if (!event.isRest) {
        expect(event.midi).toBeGreaterThanOrEqual(low);
        expect(event.midi).toBeLessThanOrEqual(high);
      }
    });
  });

  it('should respect the scale constraint', () => {
    const scale = Scale.create('C', 'major');
    const events = generatePerlinNoiseMelody({
      count: 20,
      low: 48,
      high: 84,
      scale,
    });

    events.forEach((event) => {
      if (!event.isRest) {
        const pitch = event.pitch;
        if (pitch) {
          expect(scale.contains(pitch)).toBe(true);
        }
      }
    });
  });

  it('should apply correct duration to events', () => {
    const duration = 0.25;
    const events = generatePerlinNoiseMelody({ count: 10, duration });

    events.forEach((event) => {
      expect(event.duration.value).toBe(duration);
    });
  });

  it('should apply correct velocity to events', () => {
    const velocity = 100;
    const events = generatePerlinNoiseMelody({ count: 10, velocity });

    events.forEach((event) => {
      expect(event.velocity).toBe(velocity);
    });
  });

  it('should place events at correct start beats', () => {
    const duration = 0.5;
    const events = generatePerlinNoiseMelody({ count: 8, duration });

    let expectedBeat = 0;
    events.forEach((event) => {
      expect(event.startBeat).toBe(expectedBeat);
      expectedBeat += duration;
    });
  });

  it('should generate continuous/smooth pitch movement with Perlin noise', () => {
    const events = generatePerlinNoiseMelody({
      count: 64,
      frequency: 8,
      lacunarity: 1.5,
    });

    let largeJumps = 0;
    for (let i = 1; i < events.length; i++) {
      const curr = events[i];
      const prev = events[i - 1];
      if (!curr || !prev) continue;
      const jump = Math.abs(curr.midi - prev.midi);
      if (jump > 12) largeJumps++;
    }

    // With Perlin noise, we expect fewer large jumps than with pure random
    expect(largeJumps).toBeLessThan(events.length * 0.2);
  });

  it('should throw when no pitches available for scale and range', () => {
    const scale = Scale.create('C', 'major');
    expect(() => {
      generatePerlinNoiseMelody({ count: 10, low: 37, high: 37, scale });
    }).toThrow();
  });

  it('should work with different frequency parameters', () => {
    const events1 = generatePerlinNoiseMelody({ count: 32, frequency: 2 });
    const events2 = generatePerlinNoiseMelody({ count: 32, frequency: 16 });

    expect(events1).toHaveLength(32);
    expect(events2).toHaveLength(32);
  });
});
