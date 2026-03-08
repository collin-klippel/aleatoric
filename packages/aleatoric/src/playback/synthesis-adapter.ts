import { beatsToSeconds, effectiveDuration } from '../core/rhythm.js';
import type { MusicEvent } from '../core/types.js';
import { Timeline } from '../scheduler/timeline.js';

/** Seconds on a shared audio clock (e.g. `AudioContext.currentTime`). */
export type AudioTimeSeconds = number;

/**
 * One non-rest note after beat→second conversion. Implementations map this to
 * a third-party Web Audio synthesizer API.
 */
export interface ScheduledSynthesisNote {
  /** When the note should start (absolute audio time). */
  startTimeSec: AudioTimeSeconds;
  /** Note length in seconds. */
  durationSec: AudioTimeSeconds;
  midi: number;
  velocity: number;
  frequencyHz: number;
  /** Original event (pitch, etc.) for adapters that need more than MIDI/Hz. */
  source: MusicEvent;
}

/**
 * Bridge between aleatoric timelines and external synthesis libraries.
 * Polyphony and voice allocation are adapter policy.
 */
export interface SynthesisAdapter {
  schedule(note: ScheduledSynthesisNote): void;
  /** Optional panic/stop at a given audio time. */
  cancelAll?(atTimeSec: AudioTimeSeconds): void;
}

export interface SynthesisSchedulerOptions {
  /** Tempo in BPM (default 120). */
  bpm?: number;
  /** How far ahead to schedule events in seconds (default 0.1). */
  lookahead?: number;
  /** Scheduler tick interval in ms (default 25). */
  interval?: number;
  /** Loop the timeline when playback reaches the end (default false). */
  loop?: boolean;
  /**
   * Current time in seconds on the audio clock used for scheduling
   * (typically `() => audioContext.currentTime`).
   */
  getAudioTime: () => number;
}

type PlaybackState = 'stopped' | 'playing' | 'paused';

/**
 * Lookahead scheduler that forwards non-rest {@link MusicEvent}s to a
 * {@link SynthesisAdapter}. Mirrors {@link MidiPlayer} timing; uses
 * `getAudioTime()` instead of wall-clock `performance.now()`.
 */
export class SynthesisScheduler {
  private state: PlaybackState = 'stopped';
  private adapter: SynthesisAdapter;
  private timeline: Timeline;

  private bpm: number;
  private readonly lookahead: number;
  private readonly interval: number;
  private readonly loop: boolean;
  private readonly getAudioTime: () => number;

  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextEventIndex = 0;
  /** Audio time at which beat 0 of the current playback segment occurs. */
  private anchorTime = 0;
  private pauseTime = 0;
  private currentBeat = 0;

  constructor(
    adapter: SynthesisAdapter,
    timeline: Timeline,
    options: SynthesisSchedulerOptions,
  ) {
    this.adapter = adapter;
    this.timeline = timeline;
    this.getAudioTime = options.getAudioTime;
    this.bpm = options.bpm ?? 120;
    this.lookahead = options.lookahead ?? 0.1;
    this.interval = options.interval ?? 25;
    this.loop = options.loop ?? false;
  }

  get playbackState(): PlaybackState {
    return this.state;
  }

  get beat(): number {
    return this.currentBeat;
  }

  play(): void {
    if (this.state === 'playing') return;

    const t = this.getAudioTime();
    if (this.state === 'paused') {
      const pauseDuration = t - this.pauseTime;
      this.anchorTime += pauseDuration;
    } else {
      this.anchorTime = t - beatsToSeconds(this.currentBeat, this.bpm);
    }

    this.state = 'playing';
    this.startScheduler();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.pauseTime = this.getAudioTime();
    this.stopScheduler();
  }

  stop(): void {
    this.state = 'stopped';
    this.stopScheduler();
    this.adapter.cancelAll?.(this.getAudioTime());
    this.nextEventIndex = 0;
    this.currentBeat = 0;
  }

  seek(beat: number): void {
    this.currentBeat = beat;
    const events = this.timeline.getEvents();
    this.nextEventIndex = events.findIndex((e) => e.startBeat >= beat);
    if (this.nextEventIndex === -1) this.nextEventIndex = events.length;

    if (this.state === 'playing' || this.state === 'paused') {
      const t = this.getAudioTime();
      this.anchorTime = t - beatsToSeconds(beat, this.bpm);
      this.pauseTime = t;
    }
  }

  setTempo(bpm: number): void {
    if (this.state === 'playing') {
      const t = this.getAudioTime();
      this.anchorTime = t - beatsToSeconds(this.currentBeat, bpm);
    }
    this.bpm = bpm;
  }

  private startScheduler(): void {
    this.stopScheduler();
    this.tick();
    this.schedulerTimer = setInterval(() => this.tick(), this.interval);
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private tick(): void {
    const events = this.timeline.getEvents();
    const t = this.getAudioTime();
    const elapsed = t - this.anchorTime;
    this.currentBeat = elapsed * (this.bpm / 60);

    const lookaheadBeat = this.currentBeat + (this.lookahead * this.bpm) / 60;

    while (this.nextEventIndex < events.length) {
      const event = events[this.nextEventIndex];
      if (event.startBeat > lookaheadBeat) break;

      const eventTime =
        this.anchorTime + beatsToSeconds(event.startBeat, this.bpm);

      if (!event.isRest && eventTime >= t - 0.01) {
        const durationSec = beatsToSeconds(
          effectiveDuration(event.duration),
          this.bpm,
        );
        this.adapter.schedule({
          startTimeSec: eventTime,
          durationSec,
          midi: event.midi,
          velocity: event.velocity,
          frequencyHz: event.frequency,
          source: event,
        });
      }

      this.nextEventIndex++;
    }

    if (
      this.nextEventIndex >= events.length &&
      this.currentBeat >= this.timeline.duration
    ) {
      if (this.loop) {
        this.anchorTime += beatsToSeconds(this.timeline.duration, this.bpm);
        this.nextEventIndex = 0;
        this.currentBeat = (t - this.anchorTime) * (this.bpm / 60);
      } else {
        this.stop();
      }
    }
  }
}
