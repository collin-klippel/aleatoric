/**
 * Runnable snippets for the core (aleatoric) API sidebar. Keys must match ApiEntry.id.
 * Imports are limited to `aleatoric` for docs tests.
 */
export const CORE_API_REFERENCE_SNIPPETS = {
  'core-notes/createPitch': `import { createPitch, pitchToString, pitchToMidi } from 'aleatoric';

// Build a Pitch from note name + octave; log string form and MIDI.
const p = createPitch('C', 4);
console.log(pitchToString(p), pitchToMidi(p));`,

  'core-notes/parsePitch': `import { parsePitch, pitchToString } from 'aleatoric';

// Parse "F#3" style strings into a Pitch.
const p = parsePitch('F#3');
console.log(pitchToString(p));`,

  'core-notes/pitchToString': `import { createPitch, pitchToString } from 'aleatoric';

// Pitch → display string (e.g. Bb5).
console.log(pitchToString(createPitch('Bb', 5)));`,

  'core-notes/pitchToMidi': `import { createPitch, pitchToMidi } from 'aleatoric';

// Pitch → MIDI note number.
console.log(pitchToMidi(createPitch('A', 4)));`,

  'core-notes/midiToPitch': `import { midiToPitch, pitchToString } from 'aleatoric';

// MIDI number → Pitch (64 = E4 in common mapping).
console.log(pitchToString(midiToPitch(64)));`,

  'core-notes/midiToFrequency': `import { midiToFrequency } from 'aleatoric';

// MIDI → Hz (A440 convention).
console.log('MIDI 69 Hz ≈', midiToFrequency(69).toFixed(2));`,

  'core-notes/pitchToFrequency': `import { createPitch, pitchToFrequency } from 'aleatoric';

// Pitch → Hz for oscillators / analysis.
console.log(pitchToFrequency(createPitch('A', 4)).toFixed(2));`,

  'core-notes/frequencyToMidi': `import { frequencyToMidi } from 'aleatoric';

// Hz → nearest MIDI note.
console.log('440 Hz → MIDI', frequencyToMidi(440));`,

  'core-notes/transpose': `import { createPitch, transpose, pitchToString } from 'aleatoric';

// Shift by semitones (+7 = perfect fifth up).
const p = createPitch('C', 4);
console.log(pitchToString(transpose(p, 7)));`,

  'core-notes/intervalBetween': `import { createPitch, intervalBetween } from 'aleatoric';

// Signed semitone distance between two pitches.
const a = createPitch('C', 4);
const b = createPitch('G', 4);
console.log(intervalBetween(a, b), 'semitones');`,

  'core-notes/comparePitch': `import { createPitch, comparePitch } from 'aleatoric';

// Sort helper: negative if first is lower, like String.localeCompare.
const lo = createPitch('C', 4);
const hi = createPitch('D', 4);
console.log(comparePitch(lo, hi));`,

  'core-notes/normalizeNoteName': `import { normalizeNoteName } from 'aleatoric';

// Pick a single spelling (e.g. Db → C#) for the pitch class.
console.log(normalizeNoteName('Db'));`,

  'core-intervals/Interval': `import { Interval, intervalName } from 'aleatoric';

// Named semitone constants; pair with intervalName for labels.
console.log('Perfect fifth', intervalName(Interval.PerfectFifth));`,

  'core-intervals/intervalName': `import { intervalName } from 'aleatoric';

// Human-readable name from semitone count (within an octave).
console.log(intervalName(7));`,

  'core-intervals/invertInterval': `import { invertInterval } from 'aleatoric';

// Invert within an octave (compound intervals reduced first).
console.log('Invert 7 semitones →', invertInterval(7));`,

  'core-intervals/isConsonant': `import { isConsonant } from 'aleatoric';

// Rough consonance check for a simple interval size.
console.log('7 semitones consonant?', isConsonant(7));`,

  'core-intervals/simpleInterval': `import { simpleInterval } from 'aleatoric';

// Map compound interval to 0–11 semitone class.
console.log(simpleInterval(19));`,

  'core-scales/Scale.create': `import { Scale, pitchToString } from 'aleatoric';

// Root + type → Scale instance (see SCALE_TYPE_NAMES for types).
const scale = Scale.create('D', 'dorian');
console.log(scale.getPitches(4, 4).map(pitchToString).join(' '));`,

  'core-scales/Scale.types': `import { Scale } from 'aleatoric';

// Runtime list of scale type strings.
console.log(Scale.types.join(', '));`,

  'core-scales/scale.getPitches': `import { Scale, pitchToString } from 'aleatoric';

// All scale tones between lowOct and highOct (inclusive).
const scale = Scale.major('C');
console.log(scale.getPitches(4, 5).map(pitchToString).join(' '));`,

  'core-scales/scale.contains': `import { Scale, createPitch } from 'aleatoric';

// True if pitch class is in the scale.
const scale = Scale.pentatonic('C');
console.log(scale.contains(createPitch('F', 4)), scale.contains(createPitch('F#', 4)));`,

  'core-scales/scale.nearest': `import { Scale, pitchToString } from 'aleatoric';

// Snap arbitrary MIDI to closest scale pitch.
const scale = Scale.major('C');
console.log(pitchToString(scale.nearest(61)));`,

  'core-scales/scale.degree': `import { Scale, pitchToString } from 'aleatoric';

// nth diatonic degree (1 = tonic); optional octave for register.
const scale = Scale.major('G');
console.log(pitchToString(scale.degree(5, 4)));`,

  'core-chords/Chord.create': `import { Chord, pitchToString } from 'aleatoric';

// Root + quality → Chord (see CHORD_QUALITIES).
const chord = Chord.create('E', 'minor7');
console.log(chord.getPitches(4).map(pitchToString).join(' '));`,

  'core-chords/chord.getPitches': `import { Chord, pitchToString } from 'aleatoric';

// Chord tones in a chosen octave.
const chord = Chord.major('C');
console.log(chord.getPitches(3).map(pitchToString));`,

  'core-chords/chord.inversion': `import { Chord, pitchToString } from 'aleatoric';

// 0 = root position, 1 = first inversion, etc.
const chord = Chord.major('C');
console.log(
  'root',
  chord.getPitches(4).map(pitchToString),
  '1st inv',
  chord.inversion(1, 4).map(pitchToString),
);`,

  'core-chords/chord.noteNames': `import { Chord } from 'aleatoric';

// Spelling as pitch-class names (no octave).
console.log(Chord.minor('A').noteNames());`,

  'core-rhythm/DURATIONS': `import { DURATIONS } from 'aleatoric';

// Named note values in beats (quarter = 1).
console.log(Object.keys(DURATIONS).join(', '));`,

  'core-rhythm/createDuration': `import { createDuration, effectiveDuration } from 'aleatoric';

// dotted / triplet flags adjust the written length.
const d = createDuration('quarter', { dotted: true });
console.log('effective beats', effectiveDuration(d));`,

  'core-rhythm/effectiveDuration': `import { createDuration, effectiveDuration } from 'aleatoric';

// Actual beat length of a Duration object.
console.log(effectiveDuration(createDuration('eighth')));`,

  'core-rhythm/beatsToSeconds': `import { beatsToSeconds } from 'aleatoric';

// Schedule Web Audio times from beats + BPM.
console.log('4 beats @ 120 BPM =', beatsToSeconds(4, 120), 's');`,

  'core-rhythm/secondsToBeats': `import { secondsToBeats } from 'aleatoric';

// Align wall-clock time to the beat grid.
console.log('2 s @ 120 BPM =', secondsToBeats(2, 120), 'beats');`,

  'core-rhythm/beatsPerMeasure': `import { beatsPerMeasure } from 'aleatoric';

// Beats per measure for a [numerator, denominator] time signature.
console.log(beatsPerMeasure([6, 8]));`,

  'core-rhythm/durationsWithinBeats': `import { durationsWithinBeats } from 'aleatoric';

// Which standard durations fit in N beats (for filling bars).
console.log(durationsWithinBeats(4));`,

  'core-rhythm/subdivideBeat': `import { subdivideBeat } from 'aleatoric';

// Split a beat span into N equal parts (tuplets).
console.log(subdivideBeat(1, 4));`,

  'random-rng/SeededRng': `import { SeededRng } from 'aleatoric';

// Same seed → same sequence (shareable / debuggable). Pass seed to constructor.
const rng = new SeededRng(123);
console.log(rng.next(), rng.nextInt(1, 6));`,

  'random-rng/DefaultRng': `import { DefaultRng } from 'aleatoric';

// Math.random-backed; not reproducible across runs.
const rng = new DefaultRng();
console.log('three draws', rng.next(), rng.next(), rng.next());`,

  'random-rng/weightedChoice': `import { weightedChoice } from 'aleatoric';

// Pick one item; weights need not sum to 1. Omit rng for library default (Math.random).
const pick = weightedChoice(
  [
    { value: 'a', weight: 1 },
    { value: 'b', weight: 3 },
  ],
);
console.log(pick);`,

  'random-rng/weightedChoices': `import { weightedChoices } from 'aleatoric';

// Sample with replacement using weights.
const items = [
  { value: 1, weight: 1 },
  { value: 2, weight: 1 },
];
console.log(weightedChoices(items, 5));`,

  'random-rng/uniformChoice': `import { uniformChoice } from 'aleatoric';

// Equal probability for each array element.
console.log(uniformChoice(['x', 'y', 'z']));`,

  'random-rng/shuffle': `import { shuffle } from 'aleatoric';

// Fisher–Yates on a copy; original array is unchanged.
console.log(shuffle([1, 2, 3, 4, 5]));`,

  'random-distributions/uniform': `import { uniform } from 'aleatoric';

// Continuous uniform on [min, max].
console.log(uniform(10, 20));`,

  'random-distributions/gaussian': `import { gaussian } from 'aleatoric';

// Normal draw: mean, standard deviation.
console.log(gaussian(0, 1));`,

  'random-distributions/gaussianClamped': `import { gaussianClamped } from 'aleatoric';

// Gaussian then hard-clamped to [min, max].
console.log(gaussianClamped(50, 10, 0, 100));`,

  'random-distributions/exponential': `import { exponential } from 'aleatoric';

// Positive-valued; rate parameter (lambda) shapes the tail.
console.log(exponential(1.5));`,

  'random-distributions/poisson': `import { poisson } from 'aleatoric';

// Discrete count; lambda = mean.
console.log(poisson(2));`,

  'random-distributions/triangular': `import { triangular } from 'aleatoric';

// min, max, mode (peak of the triangle).
console.log(triangular(0, 10, 3));`,

  'random-distributions/clampRound': `import { clampRound } from 'aleatoric';

// Clamp and round to nearest integer in [0, 10].
console.log(clampRound(3.7, 0, 10));`,

  'random-dice/rollDie': `import { rollDie } from 'aleatoric';

// Inclusive 1..sides.
console.log(rollDie(20));`,

  'random-dice/rollDice': `import { rollDice } from 'aleatoric';

// Multiple dice; result includes per-die values and sum.
const r = rollDice(3, 6);
console.log(r.dice, 'sum', r.sum);`,

  'random-dice/roll2d6': `import { roll2d6 } from 'aleatoric';

// Convenience for tabletop-style 2d6 (sum 2–12).
const r = roll2d6();
console.log(r.dice, r.sum);`,

  'random-dice/flipCoin': `import { flipCoin } from 'aleatoric';

// heads | tails enum-style result.
console.log(flipCoin());`,

  'random-dice/flipBool': `import { flipBool } from 'aleatoric';

// Bernoulli trial; first arg is P(true).
console.log(flipBool(0.25));`,

  'random-dice/castHexagram': `import { castHexagram } from 'aleatoric';

// I Ching: number, binary pattern, six lines.
const h = castHexagram();
console.log('hexagram #', h.number, 'binary', h.binary);`,

  'random-dice/hexagramSelect': `import { castHexagram, hexagramSelect } from 'aleatoric';

// Map hexagram to one of N items (index from the reading).
const h = castHexagram();
console.log(hexagramSelect(h, ['low', 'mid', 'high']));`,

  'gen-pitch/generateRandomPitches': `import { generateRandomPitches, Scale } from 'aleatoric';

// Random MusicEvent[] in MIDI range; scale + distribution shape the melody.
const events = generateRandomPitches({
  count: 12,
  low: 55,
  high: 79,
  scale: Scale.major('C'),
  distribution: 'uniform',
  duration: 0.25,
});
console.log(events.length, 'events');
console.log(events.length, 'events');`,

  'gen-rhythm/generateRandomRhythm': `import { generateRandomRhythm } from 'aleatoric';

// Fixed pitch (midi), varying rests and durations.
const events = generateRandomRhythm({
  count: 12,
  restProbability: 0.2,
  midi: 60,
});
console.log(events.length);
console.log(events.length, 'events');`,

  'gen-markov/buildTransitionMatrix': `import { buildTransitionMatrix, generateMarkovSequence } from 'aleatoric';

// Order = Markov order; states here are single letters (not MIDI).
const matrix = buildTransitionMatrix(['c', 'd', 'e', 'c', 'd', 'e', 'c'], 1);
console.log(JSON.stringify(matrix));
const ev = generateMarkovSequence({
  count: 6,
  transitionMatrix: matrix,
  statesAreMidi: false,
  duration: 0.3,
});
console.log(ev.length, 'events (MIDI 60 when not parsing pitch)');`,

  'gen-markov/buildMidiTransitionMatrix': `import { buildMidiTransitionMatrix, generateMarkovSequence } from 'aleatoric';

// Train on a MIDI pitch sequence; output events use those MIDI values.
const matrix = buildMidiTransitionMatrix([60, 62, 64, 62, 60, 67], 1);
const events = generateMarkovSequence({
  count: 10,
  transitionMatrix: matrix,
  duration: 0.25,
});
console.log(events.length, 'events');`,

  'gen-markov/generateMarkovSequence': `import { buildMidiTransitionMatrix, generateMarkovSequence } from 'aleatoric';

// Walk the transition matrix for count steps.
const matrix = buildMidiTransitionMatrix([60, 64, 67, 72], 1);
const events = generateMarkovSequence({
  count: 16,
  transitionMatrix: matrix,
  duration: 0.2,
});
console.log(events.length, 'events');`,

  'gen-chance/generateChanceOps': `import { generateChanceOps } from 'aleatoric';

// Cage-style ops; method drives how randomness is applied (coin, dice, etc.).
const events = generateChanceOps({
  count: 10,
  method: 'coin',
  mapping: {
    pitchRange: [60, 72],
    durationRange: [0.2, 0.8],
    velocityRange: [60, 100],
    restProbability: 0.1,
  },
});
console.log(events.length, 'events');`,

  'gen-cellular/generateCellularAutomata': `import { generateCellularAutomata, Scale, SeededRng } from 'aleatoric';

// Conway's Game of Life; alive cells → pitches via pitchMapping.
const events = generateCellularAutomata({
  steps: 16,
  width: 12,
  stepDuration: 0.2,
  scale: Scale.pentatonic('C'),
  pitchMapping: 'scale',
  rng: new SeededRng(42),
});
console.log(events.length, 'events');`,

  'gen-perlin/generatePerlinNoiseMelody': `import { generatePerlinNoiseMelody, Scale, SeededRng } from 'aleatoric';

// Waypoints are interpolated then snapped to scale degrees in [low, high] MIDI.
const events = generatePerlinNoiseMelody({
  count: 32,
  low: 60,
  high: 84,
  scale: Scale.major('C'),
  duration: 0.25,
  frequency: 4,
  lacunarity: 1.5,
  rng: new SeededRng(7),
});
console.log(events.length, 'events');`,

  'gen-dice/generateDiceMusic': `import { generateDiceMusic, createSimpleDiceTable } from 'aleatoric';

// Dice sum → chord choices; measures rolls per phrase section.
const table = createSimpleDiceTable({
  7: [[60, 64, 67], [62, 65, 69]],
  8: [[64, 67, 71]],
});
const events = generateDiceMusic({
  measures: 4,
  table,
});
console.log(events.length, 'events');`,

  'gen-dice/createSimpleDiceTable': `import { createSimpleDiceTable, generateDiceMusic } from 'aleatoric';

// Map dice total → arrays of MIDI chords; optional default duration & velocity.
const table = createSimpleDiceTable({ 7: [[60, 64]], 8: [[62, 65, 69]] }, 1, 90);
console.log(Object.keys(table));
const ev = generateDiceMusic({ measures: 2, table });
console.log(ev.length, 'events');
console.log(ev.length, 'events');`,

  'gen-constraints/applyConstraints': `import { applyConstraints, generateRandomPitches, ScaleConstraint, Scale } from 'aleatoric';

// Chain constraints left-to-right on an existing MusicEvent[].
const raw = generateRandomPitches({
  count: 12,
  low: 48,
  high: 84,
  duration: 0.25,
});
const out = applyConstraints(raw, [new ScaleConstraint(Scale.major('C'))]);
console.log(out.length, 'events');`,

  'gen-constraints/ScaleConstraint': `import { ScaleConstraint, Scale, generateRandomPitches, applyConstraints } from 'aleatoric';

// Snap each note to nearest scale degree.
const raw = generateRandomPitches({
  count: 8,
  low: 55,
  high: 70,
  duration: 0.3,
});
console.log(applyConstraints(raw, [new ScaleConstraint(Scale.minor('A'))]).length, 'events');`,

  'gen-constraints/MaxLeapConstraint': `import { MaxLeapConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Cap melodic steps in semitones between successive notes.
const raw = generateRandomPitches({
  count: 16,
  low: 60,
  high: 84,
  duration: 0.2,
});
console.log(applyConstraints(raw, [new MaxLeapConstraint(3)]).length, 'events');`,

  'gen-constraints/RangeConstraint': `import { RangeConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Keep MIDI inside [low, high].
const raw = generateRandomPitches({
  count: 10,
  low: 40,
  high: 90,
  duration: 0.25,
});
console.log(applyConstraints(raw, [new RangeConstraint(60, 72)]).length, 'events');`,

  'gen-constraints/NoParallelFifthsConstraint': `import { NoParallelFifthsConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Two-voice style rule on consecutive melodic pairs.
const raw = generateRandomPitches({
  count: 12,
  low: 60,
  high: 76,
  duration: 0.25,
});
const out = applyConstraints(raw, [new NoParallelFifthsConstraint()]);
console.log(out.length, 'events');`,

  'gen-constraints/ContourConstraint': `import { ContourConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Nudge the line toward arch / ascending / etc. (see CONTOUR_DIRECTIONS).
const raw = generateRandomPitches({
  count: 12,
  low: 60,
  high: 80,
  duration: 0.22,
});
console.log(applyConstraints(raw, [new ContourConstraint('arch')]).length, 'events');`,

  'core-rhythm/isDurationName': `import { isDurationName } from 'aleatoric';

console.log(isDurationName('quarter'), isDurationName('not-a-duration'));`,

  'random-rng/toWeightedItems': `import { toWeightedItems, weightedChoice, SeededRng } from 'aleatoric';

const w = toWeightedItems(['a', 'b', 'c'], [3, 2, 1]);
console.log(weightedChoice(w, new SeededRng(7)));`,

  'random-dice/coinChoice': `import { coinChoice, SeededRng } from 'aleatoric';

console.log(coinChoice('high', 'low', 0.5, new SeededRng(8)));`,

  'random-dice/flipCoins': `import { flipCoins, SeededRng } from 'aleatoric';

console.log(flipCoins(8, 0.5, new SeededRng(9)).join(', '));`,

  'random-dice/rollKeepHighest': `import { rollKeepHighest, SeededRng } from 'aleatoric';

console.log(rollKeepHighest(4, 6, 3, new SeededRng(10)).individual);`,

  'random-dice/rollKeepLowest': `import { rollKeepLowest, SeededRng } from 'aleatoric';

console.log(rollKeepLowest(4, 6, 2, new SeededRng(11)).individual);`,

  'random-dice/hexagramToInt': `import { castHexagram, hexagramToInt, SeededRng } from 'aleatoric';

const hex = castHexagram(new SeededRng(12));
console.log(hexagramToInt(hex, 1, 64));`,

  'random-dice/hexagramToRange': `import { castHexagram, hexagramToRange, SeededRng } from 'aleatoric';

const hex = castHexagram(new SeededRng(13));
console.log(hexagramToRange(hex, 0, 3));`,

  'core-scales/Scale.staticFactories': `import { Scale, pitchToString } from 'aleatoric';

// Shorthand constructors: major, minor, pentatonic, dorian, blues, …
const s = Scale.pentatonic('E');
console.log(s.getPitches(4, 4).slice(0, 5).map(pitchToString).join(' '));`,

  'core-timeline/Timeline': `import { Timeline, createMusicEvent } from 'aleatoric';

const a = new Timeline([
  createMusicEvent({ startBeat: 0, midi: 60, duration: { value: 0.5 } }),
]);
const b = new Timeline([
  createMusicEvent({ startBeat: 0, midi: 64, duration: { value: 0.25 } }),
]);
a.merge(b, 0.5);
console.log('duration', a.duration, 'len', a.length);
const q = a.quantize(0.25);
console.log('quantized first', q.getEvents()[0]?.startBeat);`,

  'core-events/createMusicEvent': `import { createMusicEvent, midiToPitch, midiToFrequency } from 'aleatoric';

const e = createMusicEvent({
  startBeat: 0,
  midi: 62,
  pitch: midiToPitch(62),
  frequency: midiToFrequency(62),
  duration: { value: 0.5 },
  velocity: 100,
});
console.log(e.midi, e.startBeat);`,

  'core-midi/MidiPlayer': `import {
  MidiPlayer,
  Timeline,
  createMusicEvent,
  type MidiOutput,
} from 'aleatoric';

const output: MidiOutput = {
  name: 'noop',
  send() {},
};
const player = new MidiPlayer(
  output,
  new Timeline([
    createMusicEvent({ startBeat: 0, midi: 60, duration: { value: 0.1 } }),
  ]),
  { bpm: 240 },
);
player.play();
player.stop();
console.log('state', player.playbackState);`,

  'core-midi/noteOn': `import { noteOn } from 'aleatoric';

console.log(noteOn(60, 100, 0));`,

  'core-midi/noteOff': `import { noteOff } from 'aleatoric';

console.log(noteOff(60, 0, 0));`,

  'core-midi/controlChange': `import { controlChange } from 'aleatoric';

console.log(controlChange(1, 64, 0));`,

  'core-midi/allNotesOff': `import { allNotesOff } from 'aleatoric';

console.log(allNotesOff(0));`,

  'core-playback/SynthesisScheduler': `import {
  SynthesisScheduler,
  Timeline,
  createMusicEvent,
  type SynthesisAdapter,
} from 'aleatoric';

const adapter: SynthesisAdapter = {
  schedule() {},
};
let audioT = 0;
const scheduler = new SynthesisScheduler(
  adapter,
  new Timeline([
    createMusicEvent({ startBeat: 0, midi: 60, duration: { value: 0.25 } }),
  ]),
  { getAudioTime: () => audioT, bpm: 120, lookahead: 1 },
);
scheduler.play();
scheduler.stop();
console.log(scheduler.playbackState);`,

  'core-playback/SynthesisAdapter': `import { type ScheduledSynthesisNote, type SynthesisAdapter } from 'aleatoric';

const adapter: SynthesisAdapter = {
  schedule(n: ScheduledSynthesisNote) {
    console.log(n.midi, n.startTimeSec, n.durationSec);
  },
};`,

  'core-playback/ScheduledSynthesisNote': `import { createMusicEvent, type ScheduledSynthesisNote } from 'aleatoric';

const note: ScheduledSynthesisNote = {
  startTimeSec: 0,
  durationSec: 0.5,
  midi: 60,
  velocity: 100,
  frequencyHz: 261.63,
  source: createMusicEvent({
    startBeat: 0,
    midi: 60,
    duration: { value: 0.5 },
  }),
};
console.log(note.source.midi);`,
} as const satisfies Record<string, string>;

export type CoreApiReferenceSnippetId =
  keyof typeof CORE_API_REFERENCE_SNIPPETS;

export function getCoreApiSnippet(id: CoreApiReferenceSnippetId): string {
  return CORE_API_REFERENCE_SNIPPETS[id];
}
