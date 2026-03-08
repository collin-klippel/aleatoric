import { MidiNumber, NOTE_NAMES, NoteName, Octave, Pitch } from './types.js';

const A4_MIDI = 69;
const A4_FREQ = 440;

export function pitchToMidi(pitch: Pitch): MidiNumber {
  const semitone = NOTE_NAMES.indexOf(pitch.name);
  return (pitch.octave + 1) * 12 + semitone;
}

export function midiToPitch(midi: MidiNumber): Pitch {
  const semitone = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return { name: NOTE_NAMES[semitone], octave: octave as Octave };
}

export function midiToFrequency(midi: MidiNumber): number {
  return A4_FREQ * 2 ** ((midi - A4_MIDI) / 12);
}

export function pitchToFrequency(pitch: Pitch): number {
  return midiToFrequency(pitchToMidi(pitch));
}

export function frequencyToMidi(freq: number): MidiNumber {
  return Math.round(A4_MIDI + 12 * Math.log2(freq / A4_FREQ));
}

export function transpose(pitch: Pitch, semitones: number): Pitch {
  return midiToPitch(pitchToMidi(pitch) + semitones);
}

export function intervalBetween(a: Pitch, b: Pitch): number {
  return pitchToMidi(b) - pitchToMidi(a);
}

export function comparePitch(a: Pitch, b: Pitch): number {
  return pitchToMidi(a) - pitchToMidi(b);
}

export function createPitch(name: NoteName, octave: Octave): Pitch {
  return { name, octave };
}

const ENHARMONIC_MAP: Record<string, NoteName> = {
  Db: 'C#',
  Eb: 'D#',
  Fb: 'E',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  'E#': 'F',
  'B#': 'C',
  Cb: 'B',
};

export function normalizeNoteName(name: string): NoteName {
  if (NOTE_NAMES.includes(name as NoteName)) return name as NoteName;
  const mapped = ENHARMONIC_MAP[name];
  if (mapped) return mapped;
  throw new Error(`Unknown note name: ${name}`);
}

export function parsePitch(str: string): Pitch {
  const match = str.match(/^([A-Ga-g][#b]?)(\d)$/);
  if (!match) throw new Error(`Invalid pitch string: ${str}`);
  const name = normalizeNoteName(
    match[1].charAt(0).toUpperCase() + match[1].slice(1),
  );
  const octave = parseInt(match[2], 10) as Octave;
  return { name, octave };
}

export function pitchToString(pitch: Pitch): string {
  return `${pitch.name}${pitch.octave}`;
}
