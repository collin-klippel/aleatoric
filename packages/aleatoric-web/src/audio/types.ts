import { MusicEvent } from 'aleatoric';

export interface Instrument {
  /**
   * Schedule a note to play at the given time.
   * Returns the AudioNode chain for further routing if needed.
   */
  play(
    event: MusicEvent,
    audioContext: AudioContext,
    destination: AudioNode,
    time: number,
    bpm?: number,
  ): void;

  /** Clean up any resources held by this instrument */
  dispose?(): void;
}

export interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export const DEFAULT_ENVELOPE: EnvelopeParams = {
  attack: 0.01,
  decay: 0.1,
  sustain: 0.7,
  release: 0.2,
};
