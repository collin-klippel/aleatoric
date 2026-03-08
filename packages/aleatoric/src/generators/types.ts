import { MusicEvent } from '../core/types.js';

/** Convenience helper to build a MusicEvent */
export function createMusicEvent(
  overrides: Partial<MusicEvent> & { startBeat: number },
): MusicEvent {
  return {
    pitch: overrides.pitch ?? null,
    midi: overrides.midi ?? 60,
    frequency: overrides.frequency ?? 261.63,
    duration: overrides.duration ?? { value: 1 },
    velocity: overrides.velocity ?? 80,
    startBeat: overrides.startBeat,
    isRest: overrides.isRest ?? false,
  };
}
