/**
 * Runnable snippets for the playground API sidebar. Keys must match ApiEntry.id.
 * Each snippet: import from 'aleatoric' and/or 'aleatoric-web', then executable code.
 */
export const API_REFERENCE_SNIPPETS = {
  'playground/play': `import { generateRandomPitches, Scale, DefaultRng } from 'aleatoric';

// Generator function: play() calls it on each loop pass so the phrase is not frozen.
// New DefaultRng() each loop pass so the phrase changes; omit rng inside generate* for library default.
const scale = Scale.pentatonic('C');

play(
  () => generateRandomPitches({
    count: 8,
    low: 60,
    high: 72,
    scale,
    duration: 0.25,
    rng: new DefaultRng(),
  }),
  { loop: true },
);`,

  'playground/stop': `import { generateRandomPitches } from 'aleatoric';

// Looping playback, then stop() (same as the Stop button) after 2 seconds.
const events = generateRandomPitches({
  count: 4,
  low: 60,
  high: 67,
  duration: 0.5,
});
play(events, { loop: true });
console.log('Looping — call stop() or use the Stop button');
setTimeout(() => {
  stop();
  console.log('Stopped after 2s');
}, 2000);`,

  'ref-values/SCALE_TYPE_NAMES': `import { SCALE_TYPE_NAMES } from 'aleatoric';

// Valid Scale.create(root, type) type strings (same as Scale.types).
console.log(SCALE_TYPE_NAMES.join(', '));`,

  'ref-values/CHORD_QUALITIES': `import { CHORD_QUALITIES } from 'aleatoric';

// Valid Chord.create(root, quality) quality strings.
console.log(CHORD_QUALITIES.join(', '));`,

  'ref-values/DURATION_NAMES': `import { DURATION_NAMES } from 'aleatoric';

// Keys for DURATIONS and createDuration('quarter', …).
console.log(DURATION_NAMES.join(', '));`,

  'ref-values/PITCH_DISTRIBUTIONS': `import { PITCH_DISTRIBUTIONS } from 'aleatoric';

// generateRandomPitches({ distribution }) options.
console.log([...PITCH_DISTRIBUTIONS].join(', '));`,

  'ref-values/CHANCE_METHODS': `import { CHANCE_METHODS } from 'aleatoric';

// generateChanceOps({ method }) options.
console.log([...CHANCE_METHODS].join(', '));`,

  'ref-values/LINE_TYPES': `import { LINE_TYPES } from 'aleatoric';

// I Ching line kinds from hexagram casting.
console.log([...LINE_TYPES].join(', '));`,

  'ref-values/CELLULAR_PITCH_MAPPING_KINDS': `import { CELLULAR_PITCH_MAPPING_KINDS } from 'aleatoric';

// generateCellularAutomata pitchMapping string presets (or pass number[] for MIDI columns).
console.log([...CELLULAR_PITCH_MAPPING_KINDS].join(', '));`,

  'ref-values/CELLULAR_AUTOMATA_MODES': `import { CELLULAR_AUTOMATA_MODES } from 'aleatoric';

// 1D Wolfram vs 2D Game of Life.
console.log([...CELLULAR_AUTOMATA_MODES].join(', '));`,

  'ref-values/LSYSTEM_ACTION_TYPES': `import { LSYSTEM_ACTION_TYPES } from 'aleatoric';

// Discriminators for generateLSystem interpretation map values.
console.log([...LSYSTEM_ACTION_TYPES].join(', '));`,

  'ref-values/INTERVAL_ENUM_MEMBERS': `import { INTERVAL_ENUM_MEMBERS } from 'aleatoric';

// Interval enum member names (semitone classes).
console.log(INTERVAL_ENUM_MEMBERS.join(', '));`,

  'ref-values/CONTOUR_DIRECTIONS': `import { CONTOUR_DIRECTIONS } from 'aleatoric';

// ContourConstraint direction options.
console.log([...CONTOUR_DIRECTIONS].join(', '));`,

  'ref-values/NOTE_NAMES': `import { NOTE_NAMES } from 'aleatoric';

// Twelve chromatic pitch-class names (valid note roots).
console.log([...NOTE_NAMES].join(', '));`,

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

  'core-notes/NOTE_NAMES': `import { NOTE_NAMES } from 'aleatoric';

// All twelve pitch-class names as an array.
console.log(NOTE_NAMES.join(', '));`,

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
play(events);`,

  'gen-rhythm/generateRandomRhythm': `import { generateRandomRhythm } from 'aleatoric';

// Fixed pitch (midi), varying rests and durations.
const events = generateRandomRhythm({
  count: 12,
  restProbability: 0.2,
  midi: 60,
});
console.log(events.length);
play(events);`,

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
play(events);`,

  'gen-markov/generateMarkovSequence': `import { buildMidiTransitionMatrix, generateMarkovSequence } from 'aleatoric';

// Walk the transition matrix for count steps.
const matrix = buildMidiTransitionMatrix([60, 64, 67, 72], 1);
const events = generateMarkovSequence({
  count: 16,
  transitionMatrix: matrix,
  duration: 0.2,
});
play(events);`,

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
play(events);`,

  'gen-lsystem/expandLSystem': `import { expandLSystem } from 'aleatoric';

// String rewrite only; rng used where rules are stochastic (if any).
const s = expandLSystem(
  'A',
  [
    { match: 'A', replacement: 'AB' },
    { match: 'B', replacement: 'A' },
  ],
  4,
);
console.log(s);`,

  'gen-lsystem/generateLSystem': `import { generateLSystem } from 'aleatoric';

// Expand axiom with rules, then map symbols → notes / motion via interpretation.
const events = generateLSystem({
  axiom: 'A',
  rules: [
    { match: 'A', replacement: 'AB' },
    { match: 'B', replacement: 'A' },
  ],
  interpretation: {
    A: { type: 'note' },
    B: { type: 'pitchUp', semitones: 2 },
  },
  iterations: 4,
  baseDuration: 0.25,
});
play(events);`,

  'gen-cellular/generateCellularAutomata': `import { generateCellularAutomata, Scale } from 'aleatoric';

// Wolfram rule on a 1D grid (or 2D mode); alive cells → pitches via pitchMapping.
const events = generateCellularAutomata({
  steps: 16,
  width: 12,
  rule: 30,
  mode: '1d',
  stepDuration: 0.2,
  scale: Scale.pentatonic('C'),
  pitchMapping: 'scale',
});
play(events);`,

  'gen-ambient/generateAmbientTimeline': `import { generateAmbientTimeline, Scale } from 'aleatoric';

// Sparse timeline in seconds; gapRange controls silence between hits.
const timeline = generateAmbientTimeline({
  low: 'C4',
  high: 'G5',
  scale: Scale.major('C'),
  bpm: 120,
  totalDuration: 6,
  durationRange: [0.25, 0.5],
  gapRange: [0.1, 0.25],
});
const events = timeline.getEvents();
console.log(events.length, 'events');
play(events, { bpm: 120 });`,

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
play(events);`,

  'gen-dice/createSimpleDiceTable': `import { createSimpleDiceTable, generateDiceMusic } from 'aleatoric';

// Map dice total → arrays of MIDI chords; optional default duration & velocity.
const table = createSimpleDiceTable({ 7: [[60, 64]], 8: [[62, 65, 69]] }, 1, 90);
console.log(Object.keys(table));
const ev = generateDiceMusic({ measures: 2, table });
console.log(ev.length, 'events');
play(ev);`,

  'gen-constraints/applyConstraints': `import { applyConstraints, generateRandomPitches, ScaleConstraint, Scale } from 'aleatoric';

// Chain constraints left-to-right on an existing MusicEvent[].
const raw = generateRandomPitches({
  count: 12,
  low: 48,
  high: 84,
  duration: 0.25,
});
const out = applyConstraints(raw, [new ScaleConstraint(Scale.major('C'))]);
play(out);`,

  'gen-constraints/ScaleConstraint': `import { ScaleConstraint, Scale, generateRandomPitches, applyConstraints } from 'aleatoric';

// Snap each note to nearest scale degree.
const raw = generateRandomPitches({
  count: 8,
  low: 55,
  high: 70,
  duration: 0.3,
});
play(applyConstraints(raw, [new ScaleConstraint(Scale.minor('A'))]));`,

  'gen-constraints/MaxLeapConstraint': `import { MaxLeapConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Cap melodic steps in semitones between successive notes.
const raw = generateRandomPitches({
  count: 16,
  low: 60,
  high: 84,
  duration: 0.2,
});
play(applyConstraints(raw, [new MaxLeapConstraint(3)]));`,

  'gen-constraints/RangeConstraint': `import { RangeConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Keep MIDI inside [low, high].
const raw = generateRandomPitches({
  count: 10,
  low: 40,
  high: 90,
  duration: 0.25,
});
play(applyConstraints(raw, [new RangeConstraint(60, 72)]));`,

  'gen-constraints/NoParallelFifthsConstraint': `import { NoParallelFifthsConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Two-voice style rule on consecutive melodic pairs.
const raw = generateRandomPitches({
  count: 12,
  low: 60,
  high: 76,
  duration: 0.25,
});
const out = applyConstraints(raw, [new NoParallelFifthsConstraint()]);
console.log(out.length);
play(out);`,

  'gen-constraints/ContourConstraint': `import { ContourConstraint, generateRandomPitches, applyConstraints } from 'aleatoric';

// Nudge the line toward arch / ascending / etc. (see CONTOUR_DIRECTIONS).
const raw = generateRandomPitches({
  count: 12,
  low: 60,
  high: 80,
  duration: 0.22,
});
play(applyConstraints(raw, [new ContourConstraint('arch')]));`,

  'audio-synths/AleatoricAudio': `import { AleatoricAudio } from 'aleatoric-web';

// Shared AudioContext + master gain; call resume() after user gesture.
const audio = new AleatoricAudio({ masterVolume: 0.5 });
await audio.resume();
console.log('state', audio.context.state, 'sampleRate', audio.context.sampleRate);
audio.setVolume(0.7);`,

  'audio-synths/OscillatorSynth': `import {
  AleatoricAudio,
  OscillatorSynth,
  Timeline,
  Player,
  createMusicEvent,
} from 'aleatoric-web';
import { createMusicEvent } from 'aleatoric';

// Basic Web Audio oscillators; Player schedules from a Timeline.
const audio = new AleatoricAudio();
await audio.resume();
const synth = new OscillatorSynth({ waveform: 'triangle' });
const ev = [
  createMusicEvent({ startBeat: 0, midi: 60, duration: { value: 0.25 } }),
  createMusicEvent({ startBeat: 0.25, midi: 64, duration: { value: 0.25 } }),
];
const player = new Player(audio.context, new Timeline(ev), synth, audio.destination, {
  bpm: 120,
});
player.play();
setTimeout(() => player.stop(), 1500);
console.log('OscillatorSynth via Player (1.5s)');`,

  'audio-synths/FMSynth': `import {
  AleatoricAudio,
  FMSynth,
  Timeline,
  Player,
  createMusicEvent,
} from 'aleatoric-web';
import { createMusicEvent } from 'aleatoric';

// FM carrier + modulator; ratio and index shape brightness.
const audio = new AleatoricAudio();
await audio.resume();
const synth = new FMSynth({
  modulationRatio: 3.5,
  modulationIndex: 6,
});
const ev = [createMusicEvent({ startBeat: 0, midi: 67, duration: { value: 0.4 } })];
const player = new Player(audio.context, new Timeline(ev), synth, audio.destination, {
  bpm: 120,
});
player.play();
setTimeout(() => player.stop(), 1200);
console.log('FMSynth via Player');`,

  'audio-synths/SamplePlayer': `import {
  AleatoricAudio,
  SamplePlayer,
  Timeline,
  Player,
  createMusicEvent,
} from 'aleatoric-web';
import { createMusicEvent } from 'aleatoric';

// Minimal example: synthetic buffer as a one-shot sample at rootNote MIDI.
const audio = new AleatoricAudio();
await audio.resume();
const ctx = audio.context;
const buf = ctx.createBuffer(1, Math.floor(0.12 * ctx.sampleRate), ctx.sampleRate);
const ch = buf.getChannelData(0);
for (let i = 0; i < ch.length; i++) {
  ch[i] = 0.25 * Math.sin((i / ctx.sampleRate) * 2 * Math.PI * 440);
}
const samplePlayer = new SamplePlayer({
  samples: [{ buffer: buf, rootNote: 69, range: [60, 84] }],
});
const ev = [createMusicEvent({ startBeat: 0, midi: 69, duration: { value: 0.2 } })];
const player = new Player(audio.context, new Timeline(ev), samplePlayer, audio.destination, {
  bpm: 120,
});
player.play();
setTimeout(() => player.stop(), 800);
console.log('SamplePlayer with synthetic buffer');`,

  'audio-effects/createDelay': `import { AleatoricAudio, createDelay, OscillatorSynth } from 'aleatoric-web';

// EffectNode: connect source → fx.input, fx.output → destination.
const audio = new AleatoricAudio();
await audio.resume();
const fx = createDelay(audio.context, 0.2, 0.35, 0.4);
const synth = new OscillatorSynth({ waveform: 'sine' });
const osc = audio.context.createOscillator();
osc.frequency.value = 440;
const g = audio.context.createGain();
g.gain.value = 0.15;
osc.connect(g);
g.connect(fx.input);
fx.output.connect(audio.destination);
osc.start();
setTimeout(() => {
  osc.stop();
  fx.dispose();
  console.log('delay demo done');
}, 900);`,

  'audio-effects/createFilter': `import { AleatoricAudio, createFilter } from 'aleatoric-web';

// BiquadFilterNode wrapper; type, frequency Hz, Q.
const audio = new AleatoricAudio();
await audio.resume();
const fx = createFilter(audio.context, 'lowpass', 800, 2);
const osc = audio.context.createOscillator();
osc.type = 'sawtooth';
osc.frequency.value = 220;
const g = audio.context.createGain();
g.gain.value = 0.12;
osc.connect(g);
g.connect(fx.input);
fx.output.connect(audio.destination);
osc.start();
setTimeout(() => {
  osc.stop();
  fx.dispose();
  console.log('filter demo done');
}, 700);`,

  'audio-effects/createDistortion': `import { AleatoricAudio, createDistortion } from 'aleatoric-web';

// Waveshaper-style saturation.
const audio = new AleatoricAudio();
await audio.resume();
const fx = createDistortion(audio.context, 40, 0.6);
const osc = audio.context.createOscillator();
osc.frequency.value = 110;
const g = audio.context.createGain();
g.gain.value = 0.08;
osc.connect(g);
g.connect(fx.input);
fx.output.connect(audio.destination);
osc.start();
setTimeout(() => {
  osc.stop();
  fx.dispose();
  console.log('distortion demo done');
}, 600);`,

  'audio-effects/createReverb': `import { AleatoricAudio, createReverb } from 'aleatoric-web';

// Convolution with an impulse buffer; here a short decaying noise IR.
const audio = new AleatoricAudio();
await audio.resume();
const ctx = audio.context;
const n = Math.floor(0.4 * ctx.sampleRate);
const ir = ctx.createBuffer(2, n, ctx.sampleRate);
for (let c = 0; c < ir.numberOfChannels; c++) {
  const d = ir.getChannelData(c);
  for (let i = 0; i < n; i++) {
    d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
  }
}
const fx = createReverb(ctx, ir, 0.35);
const osc = ctx.createOscillator();
osc.frequency.value = 330;
const g = ctx.createGain();
g.gain.value = 0.1;
osc.connect(g);
g.connect(fx.input);
fx.output.connect(audio.destination);
osc.start();
setTimeout(() => {
  osc.stop();
  fx.dispose();
  console.log('reverb demo done');
}, 1200);`,

  'audio-effects/chainEffects': `import { AleatoricAudio, createFilter, createDelay, chainEffects } from 'aleatoric-web';

// Series wiring: first effect feeds the next; single input/output pair.
const audio = new AleatoricAudio();
await audio.resume();
const a = createFilter(audio.context, 'lowpass', 2000);
const b = createDelay(audio.context, 0.15, 0.25, 0.35);
const chain = chainEffects(a, b);
const osc = audio.context.createOscillator();
osc.frequency.value = 523.25;
const g = audio.context.createGain();
g.gain.value = 0.1;
osc.connect(g);
g.connect(chain.input);
chain.output.connect(audio.destination);
osc.start();
setTimeout(() => {
  osc.stop();
  chain.dispose();
  console.log('chainEffects done');
}, 800);`,

  'audio-envelope/applyEnvelope': `import { AleatoricAudio, applyEnvelope, DEFAULT_ENVELOPE } from 'aleatoric-web';

// ADSR on an AudioParam (here gain); holdDuration is the sustain plateau length.
const audio = new AleatoricAudio();
await audio.resume();
const ctx = audio.context;
const g = ctx.createGain();
g.connect(audio.destination);
const t = ctx.currentTime + 0.02;
applyEnvelope(g.gain, t, 0.2, DEFAULT_ENVELOPE);
const osc = ctx.createOscillator();
osc.frequency.value = 392;
osc.connect(g);
osc.start(t);
osc.stop(t + 0.8);
console.log('envelope on gain');`,

  'audio-envelope/totalEnvelopeDuration': `import { totalEnvelopeDuration, DEFAULT_ENVELOPE } from 'aleatoric-web';

console.log(totalEnvelopeDuration(0.5, DEFAULT_ENVELOPE));`,

  'audio-envelope/DEFAULT_ENVELOPE': `import { DEFAULT_ENVELOPE } from 'aleatoric-web';

console.log(JSON.stringify(DEFAULT_ENVELOPE));`,

  'scheduler/Timeline': `import { Timeline } from 'aleatoric-web';
import { createMusicEvent } from 'aleatoric';

// Ordered events; merge/slice helpers available on the class.
const t = new Timeline();
t.add(
  createMusicEvent({ startBeat: 0, midi: 60, duration: { value: 0.5 } }),
  createMusicEvent({ startBeat: 0.5, midi: 64, duration: { value: 0.5 } }),
);
console.log('duration beats', t.duration, 'len', t.length);
play(t.getEvents());`,

  'scheduler/Player': `import {
  AleatoricAudio,
  OscillatorSynth,
  Timeline,
  Player,
  createMusicEvent,
} from 'aleatoric-web';
import { createMusicEvent } from 'aleatoric';

// Lookahead scheduler: instrument.playNote per MusicEvent at audio time.
const audio = new AleatoricAudio();
await audio.resume();
const tl = new Timeline([
  createMusicEvent({ startBeat: 0, midi: 72, duration: { value: 0.25 } }),
  createMusicEvent({ startBeat: 0.25, midi: 76, duration: { value: 0.25 } }),
]);
const player = new Player(
  audio.context,
  tl,
  new OscillatorSynth({ waveform: 'square' }),
  audio.destination,
  { bpm: 140 },
);
player.play();
setTimeout(() => {
  player.stop();
  console.log('Player stopped');
}, 1000);`,

  'scheduler/createMusicEvent': `import { createMusicEvent, midiToPitch, midiToFrequency } from 'aleatoric';

// Defaults for startBeat, velocity, etc.; override only what you need.
const e = createMusicEvent({
  startBeat: 0,
  midi: 62,
  pitch: midiToPitch(62),
  frequency: midiToFrequency(62),
  duration: { value: 0.5 },
  velocity: 100,
});
console.log(e.midi, e.startBeat);
play([e]);`,

  'composition/Section': `import { Section } from 'aleatoric-web';

// Named block; durationInBeats needs the meter tuple.
const intro = new Section({ name: 'Intro', measures: 4 });
console.log(intro.name, intro.durationInBeats([4, 4]), 'beats');`,

  'composition/Part': `import { createMusicEvent } from 'aleatoric';
import { Part, OscillatorSynth } from 'aleatoric-web';

// One instrument line; generator receives available beats in the section.
const part = new Part({
  name: 'Melody',
  instrument: new OscillatorSynth({ waveform: 'sine' }),
  measures: 2,
  generator: (beats) => [
    createMusicEvent({ startBeat: 0, midi: 60, duration: { value: Math.min(1, beats) } }),
  ],
});
const ev = part.generateEvents([4, 4]);
console.log(ev.length, 'events');`,

  'composition/Score': `import { createMusicEvent } from 'aleatoric';
import { Score, Part, OscillatorSynth, AleatoricAudio } from 'aleatoric-web';

// Container for parts + tempo; createPartPlayer wires web audio playback.
const score = new Score({ tempo: 120, title: 'Demo' });
const synth = new OscillatorSynth({ waveform: 'sine' });
const part = new Part({
  name: 'A',
  instrument: synth,
  measures: 1,
  generator: () => [
    createMusicEvent({ startBeat: 0, midi: 64, duration: { value: 0.5 } }),
    createMusicEvent({ startBeat: 0.5, midi: 67, duration: { value: 0.5 } }),
  ],
});
score.addPart(part);
const audio = new AleatoricAudio();
await audio.resume();
const player = score.createPartPlayer(part, audio);
player.play();
setTimeout(() => player.stop(), 1200);
console.log(score.title, score.bpm);`,
} as const satisfies Record<string, string>;

export type ApiReferenceSnippetId = keyof typeof API_REFERENCE_SNIPPETS;

export function getApiSnippet(id: ApiReferenceSnippetId): string {
  return API_REFERENCE_SNIPPETS[id];
}
