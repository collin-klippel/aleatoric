import { effectiveDuration } from '../core/rhythm.js';
import { MusicEvent } from '../core/types.js';

/**
 * An ordered collection of MusicEvents with absolute beat positions.
 * Supports merging multiple generator outputs and quantization.
 */
export class Timeline {
  private events: MusicEvent[] = [];

  constructor(events?: MusicEvent[]) {
    if (events) {
      this.events = [...events].sort((a, b) => a.startBeat - b.startBeat);
    }
  }

  /** Add events to the timeline, maintaining sort order */
  add(...newEvents: MusicEvent[]): void {
    this.events.push(...newEvents);
    this.events.sort((a, b) => a.startBeat - b.startBeat);
  }

  /** Merge another timeline's events, optionally with a beat offset */
  merge(other: Timeline, offsetBeats: number = 0): void {
    const shifted = other.events.map((e) => ({
      ...e,
      startBeat: e.startBeat + offsetBeats,
    }));
    this.add(...shifted);
  }

  /** Get all events */
  getEvents(): MusicEvent[] {
    return [...this.events];
  }

  /** Get events within a beat range [fromBeat, toBeat) */
  getEventsInRange(fromBeat: number, toBeat: number): MusicEvent[] {
    return this.events.filter(
      (e) => e.startBeat >= fromBeat && e.startBeat < toBeat,
    );
  }

  /** Total duration in beats (last event end) */
  get duration(): number {
    if (this.events.length === 0) return 0;
    let maxEnd = 0;
    for (const e of this.events) {
      const end = e.startBeat + effectiveDuration(e.duration);
      if (end > maxEnd) maxEnd = end;
    }
    return maxEnd;
  }

  /** Number of events */
  get length(): number {
    return this.events.length;
  }

  /** Quantize event start beats to the nearest grid value */
  quantize(gridSize: number): Timeline {
    const quantized = this.events.map((e) => ({
      ...e,
      startBeat: Math.round(e.startBeat / gridSize) * gridSize,
    }));
    return new Timeline(quantized);
  }

  /** Remove all events */
  clear(): void {
    this.events = [];
  }

  /** Create a new timeline with events shifted by an offset */
  offset(beats: number): Timeline {
    return new Timeline(
      this.events.map((e) => ({
        ...e,
        startBeat: e.startBeat + beats,
      })),
    );
  }

  /** Slice a portion of the timeline by beat range */
  slice(fromBeat: number, toBeat: number): Timeline {
    return new Timeline(this.getEventsInRange(fromBeat, toBeat));
  }
}
