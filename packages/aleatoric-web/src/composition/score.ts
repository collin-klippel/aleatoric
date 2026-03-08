import { type Tempo, Timeline, type TimeSignature } from 'aleatoric';
import { AleatoricAudio } from '../audio/context.js';
import { Player } from '../scheduler/player.js';
import type { SchedulerOptions } from '../scheduler/types.js';
import { Part } from './part.js';

export interface ScoreOptions {
  tempo?: number | Tempo;
  timeSignature?: TimeSignature;
  title?: string;
}

/**
 * Top-level container for a multi-part aleatoric composition.
 * Holds parts, generates timelines, and creates players for playback.
 */
export class Score {
  readonly title: string;
  readonly timeSignature: TimeSignature;
  private readonly tempo: Tempo;
  private parts: Part[] = [];

  constructor(options: ScoreOptions = {}) {
    this.title = options.title ?? 'Untitled';
    this.timeSignature = options.timeSignature ?? [4, 4];

    if (typeof options.tempo === 'number') {
      this.tempo = { bpm: options.tempo };
    } else {
      this.tempo = options.tempo ?? { bpm: 120 };
    }
  }

  get bpm(): number {
    return this.tempo.bpm;
  }

  addPart(part: Part): void {
    this.parts.push(part);
  }

  removePart(part: Part): void {
    const idx = this.parts.indexOf(part);
    if (idx >= 0) this.parts.splice(idx, 1);
  }

  getParts(): Part[] {
    return [...this.parts];
  }

  /** Generate a merged timeline from all parts */
  renderTimeline(): Timeline {
    const timeline = new Timeline();
    for (const part of this.parts) {
      const events = part.generateEvents(this.timeSignature);
      timeline.add(...events);
    }
    return timeline;
  }

  /**
   * Create individual timelines per part (useful for multi-instrument playback).
   */
  renderPartTimelines(): Map<Part, Timeline> {
    const map = new Map<Part, Timeline>();
    for (const part of this.parts) {
      const events = part.generateEvents(this.timeSignature);
      map.set(part, new Timeline(events));
    }
    return map;
  }

  /**
   * Create a Player for a specific part.
   * Requires a running AleatoricAudio instance.
   */
  createPartPlayer(
    part: Part,
    audio: AleatoricAudio,
    schedulerOptions?: Partial<SchedulerOptions>,
  ): Player {
    const timeline = new Timeline(part.generateEvents(this.timeSignature));
    return new Player(
      audio.context,
      timeline,
      part.instrument,
      audio.destination,
      { bpm: this.bpm, ...schedulerOptions },
    );
  }

  /**
   * Create Players for all parts, ready for synchronized playback.
   */
  createPlayers(
    audio: AleatoricAudio,
    schedulerOptions?: Partial<SchedulerOptions>,
  ): Player[] {
    return this.parts.map((part) =>
      this.createPartPlayer(part, audio, schedulerOptions),
    );
  }
}
