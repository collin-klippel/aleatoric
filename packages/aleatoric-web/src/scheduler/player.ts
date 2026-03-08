import { beatsToSeconds, Timeline } from 'aleatoric';
import { Instrument } from '../audio/types.js';
import {
  PlaybackState,
  PlayerEvent,
  PlayerEventCallback,
  PlayerEventType,
  SchedulerOptions,
} from './types.js';

/**
 * Real-time event player using the lookahead scheduling pattern
 * (Chris Wilson's "A Tale of Two Clocks") for sample-accurate Web Audio playback.
 */
export class Player {
  private state: PlaybackState = 'stopped';
  private audioContext: AudioContext;
  private instrument: Instrument;
  private destination: AudioNode;
  private timeline: Timeline;

  private bpm: number;
  private lookahead: number;
  private interval: number;
  private readonly loop: boolean;

  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextEventIndex = 0;
  private startTime = 0;
  private pauseTime = 0;
  private currentBeat = 0;

  private listeners: Map<PlayerEventType | '*', PlayerEventCallback[]> =
    new Map();

  constructor(
    audioContext: AudioContext,
    timeline: Timeline,
    instrument: Instrument,
    destination: AudioNode,
    options: SchedulerOptions = {},
  ) {
    this.audioContext = audioContext;
    this.timeline = timeline;
    this.instrument = instrument;
    this.destination = destination;
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

    if (this.state === 'paused') {
      const pauseDuration = this.audioContext.currentTime - this.pauseTime;
      this.startTime += pauseDuration;
    } else {
      // Honour any prior seek() by using currentBeat rather than resetting to 0.
      this.startTime =
        this.audioContext.currentTime -
        beatsToSeconds(this.currentBeat, this.bpm);
    }

    this.state = 'playing';
    this.emit({ type: 'play', beat: this.currentBeat });
    this.startScheduler();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.pauseTime = this.audioContext.currentTime;
    this.stopScheduler();
    this.emit({ type: 'pause', beat: this.currentBeat });
  }

  stop(): void {
    this.state = 'stopped';
    this.stopScheduler();
    this.nextEventIndex = 0;
    this.currentBeat = 0;
    this.emit({ type: 'stop' });
  }

  seek(beat: number): void {
    this.currentBeat = beat;
    const events = this.timeline.getEvents();
    this.nextEventIndex = events.findIndex((e) => e.startBeat >= beat);
    if (this.nextEventIndex === -1) this.nextEventIndex = events.length;

    if (this.state === 'playing' || this.state === 'paused') {
      // Reset the time reference so that play() resumes from the seeked beat.
      // For the paused case, also update pauseTime so the pause-duration
      // calculation in play() remains correct.
      const now = this.audioContext.currentTime;
      this.startTime = now - beatsToSeconds(beat, this.bpm);
      this.pauseTime = now;
    }
  }

  setTempo(bpm: number): void {
    if (this.state === 'playing') {
      // Recalculate start time to maintain current beat position at the new tempo
      this.startTime =
        this.audioContext.currentTime - beatsToSeconds(this.currentBeat, bpm);
    }
    this.bpm = bpm;
  }

  on(type: PlayerEventType | '*', callback: PlayerEventCallback): void {
    const arr = this.listeners.get(type);
    if (arr) {
      arr.push(callback);
    } else {
      this.listeners.set(type, [callback]);
    }
  }

  off(type: PlayerEventType | '*', callback: PlayerEventCallback): void {
    const cbs = this.listeners.get(type);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx >= 0) cbs.splice(idx, 1);
    }
  }

  private emit(event: PlayerEvent): void {
    const dispatch = (cbs: PlayerEventCallback[]): void => {
      for (const cb of cbs) {
        try {
          cb(event);
        } catch {
          /* isolate listener errors */
        }
      }
    };
    const cbs = this.listeners.get(event.type);
    if (cbs) dispatch(cbs);
    const allCbs = this.listeners.get('*');
    if (allCbs) dispatch(allCbs);
  }

  private startScheduler(): void {
    this.stopScheduler();
    this.schedulerTimer = setInterval(() => this.schedule(), this.interval);
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private schedule(): void {
    const events = this.timeline.getEvents();
    const now = this.audioContext.currentTime;
    const elapsed = now - this.startTime;
    this.currentBeat = elapsed * (this.bpm / 60);

    const lookaheadBeat = this.currentBeat + (this.lookahead * this.bpm) / 60;

    while (this.nextEventIndex < events.length) {
      const event = events[this.nextEventIndex];
      if (event.startBeat > lookaheadBeat) break;

      const eventTime =
        this.startTime + beatsToSeconds(event.startBeat, this.bpm);

      if (eventTime >= now - 0.01) {
        this.instrument.play(
          event,
          this.audioContext,
          this.destination,
          eventTime,
          this.bpm,
        );
      }

      this.nextEventIndex++;
    }

    this.emit({ type: 'beat', beat: this.currentBeat, time: now });

    if (
      this.nextEventIndex >= events.length &&
      this.currentBeat >= this.timeline.duration
    ) {
      if (this.loop) {
        // Advance startTime by one loop duration so beat resets to 0 and
        // events at startBeat 0 are rescheduled correctly.
        this.startTime += beatsToSeconds(this.timeline.duration, this.bpm);
        this.nextEventIndex = 0;
        this.currentBeat = (now - this.startTime) * (this.bpm / 60);
      } else {
        this.stop();
        this.emit({ type: 'end' });
      }
    }
  }
}
