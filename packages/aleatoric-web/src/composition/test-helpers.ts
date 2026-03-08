import type { MusicEvent } from 'aleatoric';
import type { Instrument } from '../audio/types.js';

export function mockInstrument(): Instrument {
  return { play: () => {} };
}

export function makeTestMusicEvent(startBeat: number, midi = 60): MusicEvent {
  return {
    pitch: null,
    midi,
    frequency: 261.63,
    duration: { value: 1 },
    velocity: 80,
    startBeat,
    isRest: false,
  };
}
