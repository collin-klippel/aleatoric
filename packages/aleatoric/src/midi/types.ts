export type MidiChannel =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15;

/**
 * Minimal MIDI output port abstraction.
 *
 * `timestamp` semantics are implementation-defined:
 *   - Web MIDI: DOMHighResTimeStamp (ms) passed to `MIDIOutput.send()`
 *   - Node.js (easymidi): ignored — messages are sent immediately and the
 *     caller is responsible for scheduling via `setTimeout`.
 */
export interface MidiOutput {
  send(data: number[], timestamp?: number): void;
  readonly name: string;
  close?(): void;
}

export interface MidiPlayerOptions {
  /** How far ahead to schedule events (seconds, default 0.1) */
  lookahead?: number;
  /** How often the scheduler checks for new events (ms, default 25) */
  interval?: number;
  /** Tempo in BPM (default 120) */
  bpm?: number;
  /** Loop the timeline indefinitely (default false) */
  loop?: boolean;
  /** MIDI channel 0-15 (default 0) */
  channel?: MidiChannel;
  /**
   * When true the player uses `setTimeout` to dispatch each message at the
   * correct wall-clock time instead of passing a future `timestamp` to the
   * output. Enable this for outputs that ignore the timestamp parameter
   * (e.g. easymidi in Node.js).
   */
  deferSend?: boolean;
}

export type MidiPlayerEventType = 'play' | 'pause' | 'stop' | 'beat' | 'end';

export interface MidiPlayerEvent {
  type: MidiPlayerEventType;
  beat?: number;
  time?: number;
}

export type MidiPlayerEventCallback = (event: MidiPlayerEvent) => void;

// ---------------------------------------------------------------------------
// MIDI message helpers
// ---------------------------------------------------------------------------

const STATUS_NOTE_ON = 0x90;
const STATUS_NOTE_OFF = 0x80;
const STATUS_CC = 0xb0;

export function noteOn(
  note: number,
  velocity: number,
  channel: MidiChannel = 0,
): number[] {
  return [STATUS_NOTE_ON | channel, note & 0x7f, velocity & 0x7f];
}

export function noteOff(
  note: number,
  velocity: number = 0,
  channel: MidiChannel = 0,
): number[] {
  return [STATUS_NOTE_OFF | channel, note & 0x7f, velocity & 0x7f];
}

export function controlChange(
  controller: number,
  value: number,
  channel: MidiChannel = 0,
): number[] {
  return [STATUS_CC | channel, controller & 0x7f, value & 0x7f];
}

/** CC 123 — silence all sounding notes on a channel. */
export function allNotesOff(channel: MidiChannel = 0): number[] {
  return controlChange(123, 0, channel);
}
