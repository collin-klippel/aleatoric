import {
  createMusicEvent,
  type MusicEvent,
  midiToFrequency,
  midiToPitch,
} from 'aleatoric';

export function eventsFromMidi(
  midis: number[],
  duration: number = 0.5,
  velocity: number = 80,
): MusicEvent[] {
  return midis.map((midi, i) =>
    createMusicEvent({
      pitch: midiToPitch(midi),
      midi,
      frequency: midiToFrequency(midi),
      duration: { value: duration },
      velocity,
      startBeat: i * duration,
    }),
  );
}
