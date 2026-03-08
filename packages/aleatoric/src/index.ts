// Core music primitives

export { CHORD_QUALITIES, Chord, type ChordQuality } from './core/chord.js';
export {
  INTERVAL_ENUM_MEMBERS,
  Interval,
  intervalName,
  invertInterval,
  isConsonant,
  simpleInterval,
} from './core/interval.js';
export {
  comparePitch,
  createPitch,
  frequencyToMidi,
  intervalBetween,
  midiToFrequency,
  midiToPitch,
  normalizeNoteName,
  parsePitch,
  pitchToFrequency,
  pitchToMidi,
  pitchToString,
  transpose,
} from './core/note.js';
export {
  beatsPerMeasure,
  beatsToSeconds,
  createDuration,
  DURATION_NAMES,
  DURATIONS,
  type DurationName,
  durationsWithinBeats,
  effectiveDuration,
  isDurationName,
  secondsToBeats,
  subdivideBeat,
} from './core/rhythm.js';
export {
  SCALE_TYPE_NAMES,
  Scale,
  type ScaleDefinition,
  type ScaleType,
} from './core/scale.js';
export {
  type Duration,
  type DurationValue,
  type MidiNumber,
  type MusicEvent,
  NOTE_NAMES,
  type NoteName,
  type Octave,
  type Pitch,
  type PitchRange,
  type Tempo,
  type TimeSignature,
  type Velocity,
} from './core/types.js';
export {
  type AmbientTimelineOptions,
  generateAmbientTimeline,
} from './generators/ambient.js';
export {
  CELLULAR_AUTOMATA_MODES,
  CELLULAR_PITCH_MAPPING_KINDS,
  type CellularAutomataMode,
  type CellularAutomataOptions,
  type CellularPitchMappingKind,
  generateCellularAutomata,
} from './generators/cellular-automata.js';
export {
  CHANCE_METHODS,
  type ChanceMethod,
  type ChanceOpsOptions,
  generateChanceOps,
  type ParameterMapping,
} from './generators/chance-ops.js';
export {
  applyConstraints,
  CONTOUR_DIRECTIONS,
  type Constraint,
  ContourConstraint,
  type ContourDirection,
  MaxLeapConstraint,
  NoParallelFifthsConstraint,
  RangeConstraint,
  ScaleConstraint,
} from './generators/constrained.js';
export {
  createSimpleDiceTable,
  type DiceMusicOptions,
  type DiceMusicTable,
  generateDiceMusic,
} from './generators/dice-music.js';
export {
  expandLSystem,
  generateLSystem,
  LSYSTEM_ACTION_TYPES,
  type LSystemAction,
  type LSystemActionType,
  type LSystemInterpretation,
  type LSystemOptions,
  type ProductionRule,
} from './generators/lsystem.js';
export {
  buildMidiTransitionMatrix,
  buildTransitionMatrix,
  generateMarkovSequence,
  type MarkovOptions,
  type TransitionMatrix,
} from './generators/markov.js';
export {
  generateRandomPitches,
  PITCH_DISTRIBUTIONS,
  type PitchDistribution,
  type RandomPitchOptions,
} from './generators/random-pitch.js';
export {
  generateRandomRhythm,
  type RandomRhythmOptions,
} from './generators/random-rhythm.js';
// Generators
export { createMusicEvent } from './generators/types.js';
// MIDI
export { MidiPlayer } from './midi/midi-player.js';
export {
  allNotesOff,
  controlChange,
  type MidiChannel,
  type MidiOutput,
  type MidiPlayerEvent,
  type MidiPlayerEventCallback,
  type MidiPlayerEventType,
  type MidiPlayerOptions,
  noteOff,
  noteOn,
} from './midi/types.js';
export {
  type CoinResult,
  coinChoice,
  flipBool,
  flipCoin,
  flipCoins,
} from './random/coin.js';
export {
  type DiceRoll,
  roll2d6,
  rollDice,
  rollDie,
  rollKeepHighest,
  rollKeepLowest,
} from './random/dice.js';
export {
  clampRound,
  exponential,
  gaussian,
  gaussianClamped,
  poisson,
  triangular,
  uniform,
} from './random/distributions.js';
export {
  castHexagram,
  type Hexagram,
  hexagramSelect,
  hexagramToInt,
  hexagramToRange,
  LINE_TYPES,
  type Line,
  type LineType,
} from './random/iching.js';
export { DefaultRng, SeededRng } from './random/rng.js';
// Random / chance engine
export { type RandomSource } from './random/types.js';
export {
  shuffle,
  toWeightedItems,
  uniformChoice,
  type WeightedItem,
  weightedChoice,
  weightedChoices,
} from './random/weighted.js';
// Timeline
export { Timeline } from './scheduler/timeline.js';
