import { Interval } from '../core/interval.js';
import { midiToFrequency, midiToPitch, pitchToMidi } from '../core/note.js';
import { Scale } from '../core/scale.js';
import { MusicEvent } from '../core/types.js';

export interface Constraint {
  apply(events: MusicEvent[]): MusicEvent[];
}

/** Snap all pitches to the nearest scale tone */
export class ScaleConstraint implements Constraint {
  constructor(private scale: Scale) {}

  apply(events: MusicEvent[]): MusicEvent[] {
    return events.map((e) => {
      if (e.isRest) return e;
      const snapped = this.scale.nearest(e.midi);
      const midi = pitchToMidi(snapped);
      return { ...e, pitch: snapped, midi, frequency: midiToFrequency(midi) };
    });
  }
}

/** Limit the maximum interval leap between consecutive notes */
export class MaxLeapConstraint implements Constraint {
  constructor(private maxSemitones: number) {}

  apply(events: MusicEvent[]): MusicEvent[] {
    const result = [...events];
    for (let i = 1; i < result.length; i++) {
      if (result[i].isRest || result[i - 1].isRest) continue;
      const prevMidi = result[i - 1].midi;
      const currMidi = result[i].midi;
      const interval = Math.abs(currMidi - prevMidi);
      if (interval > this.maxSemitones) {
        const direction = currMidi > prevMidi ? 1 : -1;
        const newMidi = prevMidi + direction * this.maxSemitones;
        const clamped = Math.max(0, Math.min(127, newMidi));
        result[i] = {
          ...result[i],
          midi: clamped,
          pitch: midiToPitch(clamped),
          frequency: midiToFrequency(clamped),
        };
      }
    }
    return result;
  }
}

/** Keep pitches within a specified MIDI range */
export class RangeConstraint implements Constraint {
  constructor(
    private low: number,
    private high: number,
  ) {}

  apply(events: MusicEvent[]): MusicEvent[] {
    return events.map((e) => {
      if (e.isRest) return e;
      let midi = e.midi;
      while (midi < this.low) midi += 12;
      while (midi > this.high) midi -= 12;
      midi = Math.max(this.low, Math.min(this.high, midi));
      return {
        ...e,
        midi,
        pitch: midiToPitch(midi),
        frequency: midiToFrequency(midi),
      };
    });
  }
}

/** Prevent parallel perfect fifths between consecutive events */
export class NoParallelFifthsConstraint implements Constraint {
  apply(events: MusicEvent[]): MusicEvent[] {
    const result = [...events];
    for (let i = 2; i < result.length; i++) {
      if (result[i].isRest || result[i - 1].isRest) continue;
      if (result[i - 2].isRest) continue;

      const prevInterval =
        Math.abs(result[i - 1].midi - result[i - 2].midi) % 12;
      const currInterval = Math.abs(result[i].midi - result[i - 1].midi) % 12;

      if (
        prevInterval === Interval.PerfectFifth &&
        currInterval === Interval.PerfectFifth
      ) {
        // Shift the current note by one semitone
        const newMidi = result[i].midi + 1;
        result[i] = {
          ...result[i],
          midi: newMidi,
          pitch: midiToPitch(newMidi),
          frequency: midiToFrequency(newMidi),
        };
      }
    }
    return result;
  }
}

export const CONTOUR_DIRECTIONS = [
  'ascending',
  'descending',
  'arch',
  'valley',
] as const;

export type ContourDirection = (typeof CONTOUR_DIRECTIONS)[number];

/** Enforce a general contour shape on the pitch sequence */
export class ContourConstraint implements Constraint {
  constructor(private contour: ContourDirection) {}

  apply(events: MusicEvent[]): MusicEvent[] {
    const nonRests = events.filter((e) => !e.isRest);
    if (nonRests.length < 2) return events;

    const result = [...events];
    const indices = events
      .map((e, i) => (e.isRest ? -1 : i))
      .filter((i) => i >= 0);

    for (let i = 1; i < indices.length; i++) {
      const idx = indices[i];
      const prevIdx = indices[i - 1];
      const progress = i / (indices.length - 1);
      const shouldRise = this.shouldRise(progress);

      if (shouldRise && result[idx].midi < result[prevIdx].midi) {
        const diff = result[prevIdx].midi - result[idx].midi;
        const newMidi = Math.min(127, result[idx].midi + diff + 1);
        result[idx] = {
          ...result[idx],
          midi: newMidi,
          pitch: midiToPitch(newMidi),
          frequency: midiToFrequency(newMidi),
        };
      } else if (!shouldRise && result[idx].midi > result[prevIdx].midi) {
        const diff = result[idx].midi - result[prevIdx].midi;
        const newMidi = Math.max(0, result[idx].midi - diff - 1);
        result[idx] = {
          ...result[idx],
          midi: newMidi,
          pitch: midiToPitch(newMidi),
          frequency: midiToFrequency(newMidi),
        };
      }
    }

    return result;
  }

  private shouldRise(progress: number): boolean {
    switch (this.contour) {
      case 'ascending':
        return true;
      case 'descending':
        return false;
      case 'arch':
        return progress < 0.5;
      case 'valley':
        return progress >= 0.5;
    }
  }
}

/** Apply multiple constraints in sequence */
export function applyConstraints(
  events: MusicEvent[],
  constraints: Constraint[],
): MusicEvent[] {
  return constraints.reduce((evts, c) => c.apply(evts), events);
}
