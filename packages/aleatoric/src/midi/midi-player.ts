import { beatsToSeconds, effectiveDuration } from '../core/rhythm.js';
import { MusicEvent } from '../core/types.js';
import { Timeline } from '../scheduler/timeline.js';
import {
  allNotesOff,
  type MidiChannel,
  type MidiOutput,
  type MidiPlayerEvent,
  type MidiPlayerEventCallback,
  type MidiPlayerEventType,
  type MidiPlayerOptions,
  noteOff,
  noteOn,
} from './types.js';

type PlaybackState = 'stopped' | 'playing' | 'paused';

function now(): number {
  return performance.now() / 1000;
}

/**
 * Real-time MIDI event player using the lookahead scheduling pattern.
 *
 * Works identically in browser and Node.js — the only environment-specific
 * piece is the `MidiOutput` implementation passed in at construction time.
 */
export class MidiPlayer {
  private state: PlaybackState = 'stopped';
  private output: MidiOutput;
  private timeline: Timeline;

  private bpm: number;
  private readonly channel: MidiChannel;
  private readonly lookahead: number;
  private readonly interval: number;
  private readonly loop: boolean;
  private readonly deferSend: boolean;

  private schedulerTimer: ReturnType<typeof setInterval> | null = null;
  private nextEventIndex = 0;
  private startTime = 0;
  private pauseTime = 0;
  private currentBeat = 0;

  private pendingNoteOffs: ReturnType<typeof setTimeout>[] = [];
  private listeners: Map<MidiPlayerEventType | '*', MidiPlayerEventCallback[]> =
    new Map();

  constructor(
    output: MidiOutput,
    timeline: Timeline,
    options: MidiPlayerOptions = {},
  ) {
    this.output = output;
    this.timeline = timeline;
    this.bpm = options.bpm ?? 120;
    this.channel = options.channel ?? 0;
    this.lookahead = options.lookahead ?? 0.1;
    this.interval = options.interval ?? 25;
    this.loop = options.loop ?? false;
    this.deferSend = options.deferSend ?? false;
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
      const pauseDuration = now() - this.pauseTime;
      this.startTime += pauseDuration;
    } else {
      this.startTime = now() - beatsToSeconds(this.currentBeat, this.bpm);
    }

    this.state = 'playing';
    this.emit({ type: 'play', beat: this.currentBeat });
    this.startScheduler();
  }

  pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.pauseTime = now();
    this.stopScheduler();
    this.emit({ type: 'pause', beat: this.currentBeat });
  }

  stop(): void {
    this.state = 'stopped';
    this.stopScheduler();
    this.clearPendingNoteOffs();
    this.output.send(allNotesOff(this.channel));
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
      const t = now();
      this.startTime = t - beatsToSeconds(beat, this.bpm);
      this.pauseTime = t;
    }
  }

  setTempo(bpm: number): void {
    if (this.state === 'playing') {
      this.startTime = now() - beatsToSeconds(this.currentBeat, bpm);
    }
    this.bpm = bpm;
  }

  on(type: MidiPlayerEventType | '*', callback: MidiPlayerEventCallback): void {
    const arr = this.listeners.get(type);
    if (arr) {
      arr.push(callback);
    } else {
      this.listeners.set(type, [callback]);
    }
  }

  off(
    type: MidiPlayerEventType | '*',
    callback: MidiPlayerEventCallback,
  ): void {
    const cbs = this.listeners.get(type);
    if (cbs) {
      const idx = cbs.indexOf(callback);
      if (idx >= 0) cbs.splice(idx, 1);
    }
  }

  // -----------------------------------------------------------------------
  // Private
  // -----------------------------------------------------------------------

  private emit(event: MidiPlayerEvent): void {
    const dispatch = (cbs: MidiPlayerEventCallback[]): void => {
      for (const cb of cbs) {
        try {
          cb(event);
        } catch {
          /* isolate listener errors */
        }
      }
    };
    const typed = this.listeners.get(event.type);
    if (typed) dispatch(typed);
    const wild = this.listeners.get('*');
    if (wild) dispatch(wild);
  }

  private startScheduler(): void {
    this.stopScheduler();
    this.schedule();
    this.schedulerTimer = setInterval(() => this.schedule(), this.interval);
  }

  private stopScheduler(): void {
    if (this.schedulerTimer !== null) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
  }

  private clearPendingNoteOffs(): void {
    for (const id of this.pendingNoteOffs) clearTimeout(id);
    this.pendingNoteOffs = [];
  }

  private sendAt(data: number[], targetTime: number): void {
    if (this.deferSend) {
      const delay = Math.max(0, (targetTime - now()) * 1000);
      const id = setTimeout(() => this.output.send(data), delay);
      this.pendingNoteOffs.push(id);
    } else {
      this.output.send(data, targetTime * 1000);
    }
  }

  private scheduleEvent(event: MusicEvent, eventTime: number): void {
    if (event.isRest) return;

    const onMsg = noteOn(event.midi, event.velocity, this.channel);
    this.sendAt(onMsg, eventTime);

    const durationSec = beatsToSeconds(
      effectiveDuration(event.duration),
      this.bpm,
    );
    const offMsg = noteOff(event.midi, 0, this.channel);
    this.sendAt(offMsg, eventTime + durationSec);
  }

  private schedule(): void {
    const events = this.timeline.getEvents();
    const t = now();
    const elapsed = t - this.startTime;
    this.currentBeat = elapsed * (this.bpm / 60);

    const lookaheadBeat = this.currentBeat + (this.lookahead * this.bpm) / 60;

    while (this.nextEventIndex < events.length) {
      const event = events[this.nextEventIndex];
      if (event.startBeat > lookaheadBeat) break;

      const eventTime =
        this.startTime + beatsToSeconds(event.startBeat, this.bpm);

      if (eventTime >= t - 0.01) {
        this.scheduleEvent(event, eventTime);
      }

      this.nextEventIndex++;
    }

    this.emit({ type: 'beat', beat: this.currentBeat, time: t });

    if (
      this.nextEventIndex >= events.length &&
      this.currentBeat >= this.timeline.duration
    ) {
      if (this.loop) {
        this.startTime += beatsToSeconds(this.timeline.duration, this.bpm);
        this.nextEventIndex = 0;
        this.currentBeat = (t - this.startTime) * (this.bpm / 60);
      } else {
        this.stop();
        this.emit({ type: 'end' });
      }
    }
  }
}
