export type PlaybackState = 'stopped' | 'playing' | 'paused';

export interface SchedulerOptions {
  /** How far ahead to schedule events (seconds, default 0.1) */
  lookahead?: number;
  /** How often the scheduler checks for new events (ms, default 25) */
  interval?: number;
  /** Tempo in BPM (default 120) */
  bpm?: number;
  /** Loop the timeline indefinitely from the beginning when it ends (default false) */
  loop?: boolean;
}

export type PlayerEventType = 'play' | 'pause' | 'stop' | 'beat' | 'end';

export interface PlayerEvent {
  type: PlayerEventType;
  beat?: number;
  time?: number;
}

export type PlayerEventCallback = (event: PlayerEvent) => void;
