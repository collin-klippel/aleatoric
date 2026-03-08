import {
  CELLULAR_AUTOMATA_MODES,
  CELLULAR_PITCH_MAPPING_KINDS,
  CHANCE_METHODS,
  CHORD_QUALITIES,
  CONTOUR_DIRECTIONS,
  DURATION_NAMES,
  INTERVAL_ENUM_MEMBERS,
  LINE_TYPES,
  LSYSTEM_ACTION_TYPES,
  NOTE_NAMES,
  PITCH_DISTRIBUTIONS,
  SCALE_TYPE_NAMES,
} from 'aleatoric';
import {
  type ApiReferenceSnippetId,
  getApiSnippet,
} from './api-reference-snippets';

function joinRef(values: readonly string[]): string {
  return values.join(', ');
}

export interface ApiEntry {
  id: ApiReferenceSnippetId;
  name: string;
  signature?: string;
  description: string;
  useCase?: string;
  example: string;
}

export interface ApiCategory {
  id: string;
  label: string;
  description: string;
  entries: ApiEntry[];
}

function e(
  id: ApiReferenceSnippetId,
  meta: {
    name: string;
    description: string;
    signature?: string;
    useCase?: string;
  },
): ApiEntry {
  return { id, ...meta, example: getApiSnippet(id) };
}

export const API_CATEGORIES: ApiCategory[] = [
  {
    id: 'playground',
    label: 'Playground',
    description:
      'Built-in helpers when you click Run. Use play() to hear MusicEvent[]; stop() stops audio.',
    entries: [
      e('playground/play', {
        name: 'play',
        signature: '(events | () => events, opts?)',
        description:
          'Schedule events through Web Audio. opts: loop, bpm, waveform, fm. Toolbar Loop merges as default; pass { loop: false } to play once. ' +
          'Pass a static MusicEvent[] to loop the same phrase every time. ' +
          'Pass a function () => MusicEvent[] to re-run the generator on each loop iteration — required for truly changing loops, since a static array is frozen at generation time and always replays identically.',
        useCase:
          'Use the function form with DefaultRng (or an incrementing SeededRng seed) so each loop pass produces a different phrase — great for evolving generative installations or live-coding sessions.',
      }),
      e('playground/stop', {
        name: 'stop',
        signature: '()',
        description: 'Stop playback (same as Stop button).',
        useCase:
          'Halt a looping ambient texture after a timed demo segment ends.',
      }),
    ],
  },
  {
    id: 'ref-values',
    label: 'Reference values',
    description:
      'Canonical string literals and enum member names exported from the library. Use these arrays in code or match them when passing options.',
    entries: [
      e('ref-values/SCALE_TYPE_NAMES', {
        name: 'SCALE_TYPE_NAMES',
        description: `Scale \`type\` argument to Scale.create (same as Scale.types): ${joinRef(SCALE_TYPE_NAMES)}`,
        useCase: 'Populate a scale-type dropdown in a generative music UI.',
      }),
      e('ref-values/CHORD_QUALITIES', {
        name: 'CHORD_QUALITIES',
        description: `\`quality\` for Chord.create: ${joinRef(CHORD_QUALITIES)}`,
        useCase:
          'Validate user-supplied chord quality strings before calling Chord.create.',
      }),
      e('ref-values/DURATION_NAMES', {
        name: 'DURATION_NAMES',
        description: `String keys for DURATIONS / createDuration: ${joinRef(DURATION_NAMES)}`,
        useCase:
          'Drive a rhythm editor where each button maps to a named duration.',
      }),
      e('ref-values/PITCH_DISTRIBUTIONS', {
        name: 'PITCH_DISTRIBUTIONS',
        description: `\`distribution\` for generateRandomPitches: ${joinRef(PITCH_DISTRIBUTIONS)}`,
        useCase:
          'Let users pick how notes cluster — e.g. gaussian for melodic focus, uniform for variety.',
      }),
      e('ref-values/CHANCE_METHODS', {
        name: 'CHANCE_METHODS',
        description: `\`method\` for generateChanceOps: ${joinRef(CHANCE_METHODS)}`,
        useCase:
          'Offer a dropdown of Cage-inspired chance methods in a composition tool.',
      }),
      e('ref-values/LINE_TYPES', {
        name: 'LINE_TYPES',
        description: `Line.type from I Ching casting: ${joinRef(LINE_TYPES)}`,
        useCase:
          'Inspect hexagram line types to branch compositional logic (e.g. moving lines trigger variations).',
      }),
      e('ref-values/CELLULAR_PITCH_MAPPING_KINDS', {
        name: 'CELLULAR_PITCH_MAPPING_KINDS',
        description: `String options for cellular automata pitchMapping (or pass number[] for explicit MIDI columns): ${joinRef(CELLULAR_PITCH_MAPPING_KINDS)}`,
        useCase:
          'Switch between chromatic and scale-relative pitch grids for an automata-driven sequencer.',
      }),
      e('ref-values/CELLULAR_AUTOMATA_MODES', {
        name: 'CELLULAR_AUTOMATA_MODES',
        description: `\`mode\` for generateCellularAutomata: ${joinRef(CELLULAR_AUTOMATA_MODES)}`,
        useCase:
          'Let users toggle between 1D Wolfram rules and 2D Game of Life in the same interface.',
      }),
      e('ref-values/LSYSTEM_ACTION_TYPES', {
        name: 'LSYSTEM_ACTION_TYPES',
        description: `Discriminator type on LSystemAction in interpretation maps: ${joinRef(LSYSTEM_ACTION_TYPES)}`,
        useCase:
          'Build a visual editor that lists valid action types users can assign to L-system symbols.',
      }),
      e('ref-values/INTERVAL_ENUM_MEMBERS', {
        name: 'INTERVAL_ENUM_MEMBERS',
        description: `Names on the Interval enum: ${joinRef(INTERVAL_ENUM_MEMBERS)}`,
        useCase:
          'Generate interval-name labels for a music theory quiz or chord-building UI.',
      }),
      e('ref-values/CONTOUR_DIRECTIONS', {
        name: 'CONTOUR_DIRECTIONS',
        description: `ContourConstraint direction: ${joinRef(CONTOUR_DIRECTIONS)}`,
        useCase:
          'Present a melodic shape selector (ascending, descending, arch) to guide phrase generation.',
      }),
      e('ref-values/NOTE_NAMES', {
        name: 'NOTE_NAMES',
        description: `Chromatic pitch-class names (also valid note roots): ${joinRef(NOTE_NAMES)}`,
        useCase:
          'Render a chromatic keyboard where each key is labeled with its canonical note name.',
      }),
    ],
  },
  {
    id: 'core-notes',
    label: 'Notes & Pitch',
    description: 'Pitch representation, MIDI conversion, and transposition.',
    entries: [
      e('core-notes/createPitch', {
        name: 'createPitch',
        signature: '(name, octave) → Pitch',
        description: 'Create a pitch from note name and octave',
        useCase:
          'Pin the tonic of a piece before passing it into a scale or generator.',
      }),
      e('core-notes/parsePitch', {
        name: 'parsePitch',
        signature: '(str) → Pitch',
        description: 'Parse "C4" style string to Pitch',
        useCase:
          'Accept user-typed pitch strings from a text input and convert them to structured Pitch objects.',
      }),
      e('core-notes/pitchToString', {
        name: 'pitchToString',
        signature: '(pitch) → string',
        description: 'Format pitch as "C4" string',
        useCase:
          'Display generated note names in a rolling output log or piano-roll tooltip.',
      }),
      e('core-notes/pitchToMidi', {
        name: 'pitchToMidi',
        signature: '(pitch) → number',
        description: 'Convert pitch to MIDI number',
        useCase:
          'Convert a scale degree to a MIDI number before sending it to a hardware synthesizer via WebMIDI.',
      }),
      e('core-notes/midiToPitch', {
        name: 'midiToPitch',
        signature: '(midi) → Pitch',
        description: 'Convert MIDI number to pitch',
        useCase:
          'Decode incoming MIDI note-on messages into pitch objects for display or further processing.',
      }),
      e('core-notes/midiToFrequency', {
        name: 'midiToFrequency',
        signature: '(midi) → number',
        description: 'MIDI to frequency in Hz',
        useCase:
          'Set an oscillator frequency directly from a MIDI pitch value when building a custom Web Audio synth.',
      }),
      e('core-notes/pitchToFrequency', {
        name: 'pitchToFrequency',
        signature: '(pitch) → number',
        description: 'Pitch to frequency in Hz',
        useCase:
          'Drive a visualization — e.g. map pitch frequency to a Lissajous curve radius.',
      }),
      e('core-notes/frequencyToMidi', {
        name: 'frequencyToMidi',
        signature: '(freq) → number',
        description: 'Frequency to MIDI number',
        useCase:
          'Snap a pitch-detected frequency from a microphone input to the nearest MIDI note.',
      }),
      e('core-notes/transpose', {
        name: 'transpose',
        signature: '(pitch, semitones) → Pitch',
        description: 'Transpose pitch by semitones',
        useCase:
          'Shift an entire generated melody up a perfect fifth to create a higher harmony voice.',
      }),
      e('core-notes/intervalBetween', {
        name: 'intervalBetween',
        signature: '(a, b) → number',
        description: 'Semitone distance between pitches',
        useCase:
          'Measure melodic leaps between consecutive events to decide whether to apply a MaxLeapConstraint.',
      }),
      e('core-notes/comparePitch', {
        name: 'comparePitch',
        signature: '(a, b) → number',
        description: 'Compare two pitches (sort-compatible)',
        useCase:
          'Sort a chord voicing from lowest to highest before rendering it on a staff.',
      }),
      e('core-notes/normalizeNoteName', {
        name: 'normalizeNoteName',
        signature: '(name) → NoteName',
        description: 'Normalize accidentals (e.g. Db → C#)',
        useCase:
          'Canonicalize note names from different notation systems before key-lookup in a scale or chord.',
      }),
      e('core-notes/NOTE_NAMES', {
        name: 'NOTE_NAMES',
        description: `Array of all 12 pitch-class names: ${joinRef(NOTE_NAMES)}`,
        useCase:
          'Iterate all pitch classes to build a chromatic transposition table.',
      }),
    ],
  },
  {
    id: 'core-intervals',
    label: 'Intervals',
    description: 'Interval classification and utilities.',
    entries: [
      e('core-intervals/Interval', {
        name: 'Interval',
        description: `TS enum of simple semitone classes; member names: ${joinRef(INTERVAL_ENUM_MEMBERS)}`,
        useCase:
          'Use named constants (e.g. Interval.PerfectFifth) instead of magic numbers when constructing chords.',
      }),
      e('core-intervals/intervalName', {
        name: 'intervalName',
        signature: '(semitones) → string',
        description: 'Human-readable interval name',
        useCase:
          'Label the interval between two consecutive melody notes in a theory-education app.',
      }),
      e('core-intervals/invertInterval', {
        name: 'invertInterval',
        signature: '(semitones) → number',
        description: 'Invert an interval',
        useCase:
          'Generate a counterpoint voice by inverting the intervals of an existing melody.',
      }),
      e('core-intervals/isConsonant', {
        name: 'isConsonant',
        signature: '(semitones) → boolean',
        description: 'Check if interval is consonant',
        useCase:
          'Filter generated note pairs so that only consonant intervals appear on strong beats.',
      }),
      e('core-intervals/simpleInterval', {
        name: 'simpleInterval',
        signature: '(semitones) → number',
        description: 'Reduce compound interval to simple',
        useCase:
          'Normalize wide leaps before categorizing them — a 14-semitone leap becomes a major second for classification.',
      }),
    ],
  },
  {
    id: 'core-scales',
    label: 'Scales',
    description: 'Scale creation and pitch querying.',
    entries: [
      e('core-scales/Scale.create', {
        name: 'Scale.create',
        signature: '(root, type) → Scale',
        description: `Create a scale; \`type\` is one of: ${joinRef(SCALE_TYPE_NAMES)}`,
        useCase:
          'Define the harmonic palette for a generative piece — e.g. a D dorian scale for a modal jazz sketch.',
      }),
      e('core-scales/Scale.types', {
        name: 'Scale.types',
        description: `Same names as SCALE_TYPE_NAMES: ${joinRef(SCALE_TYPE_NAMES)}`,
        useCase:
          'Enumerate all available scale types at runtime to build a searchable scale browser.',
      }),
      e('core-scales/scale.getPitches', {
        name: 'scale.getPitches',
        signature: '(lowOct?, highOct?) → Pitch[]',
        description: 'All pitches in range',
        useCase:
          'Populate a piano-roll with every playable note in a given scale across the full keyboard range.',
      }),
      e('core-scales/scale.contains', {
        name: 'scale.contains',
        signature: '(pitch) → boolean',
        description: 'Check if pitch is in scale',
        useCase:
          'Highlight in-scale keys green on a virtual keyboard as the user plays.',
      }),
      e('core-scales/scale.nearest', {
        name: 'scale.nearest',
        signature: '(midi) → Pitch',
        description: 'Snap MIDI number to nearest scale pitch',
        useCase:
          'Quantize live microphone pitch detection to the nearest note in the current scale.',
      }),
      e('core-scales/scale.degree', {
        name: 'scale.degree',
        signature: '(n, octave?) → Pitch',
        description: 'Get nth scale degree',
        useCase:
          'Build a chord progression by stacking thirds on each scale degree automatically.',
      }),
    ],
  },
  {
    id: 'core-chords',
    label: 'Chords',
    description: 'Chord construction and voicings.',
    entries: [
      e('core-chords/Chord.create', {
        name: 'Chord.create',
        signature: '(root, quality) → Chord',
        description: `Create a chord; \`quality\`: ${joinRef(CHORD_QUALITIES)}`,
        useCase:
          'Build the ii–V–I progression of a jazz piece by creating chords from scale degrees.',
      }),
      e('core-chords/chord.getPitches', {
        name: 'chord.getPitches',
        signature: '(octave?) → Pitch[]',
        description: 'Get chord tones',
        useCase:
          'Arpeggiate a chord by scheduling its pitches as consecutive MusicEvents with increasing startBeat.',
      }),
      e('core-chords/chord.inversion', {
        name: 'chord.inversion',
        signature: '(n, octave?) → Pitch[]',
        description: 'Get nth inversion',
        useCase:
          'Smooth voice leading between chords by selecting the inversion closest to the previous chord.',
      }),
      e('core-chords/chord.noteNames', {
        name: 'chord.noteNames',
        signature: '() → NoteName[]',
        description: 'Note names in chord',
        useCase:
          'Display the spelling of a generated chord (e.g. "C E G B♭") in a chord-name overlay.',
      }),
    ],
  },
  {
    id: 'core-rhythm',
    label: 'Rhythm',
    description: 'Duration values, beat/time conversion.',
    entries: [
      e('core-rhythm/DURATIONS', {
        name: 'DURATIONS',
        description: `Map of duration names to beat values (quarter = 1). Keys: ${joinRef(DURATION_NAMES)}`,
        useCase:
          'Assign note lengths in a step sequencer by name ("eighth", "quarter") rather than raw numbers.',
      }),
      e('core-rhythm/createDuration', {
        name: 'createDuration',
        signature: '(value, opts?) → Duration',
        description: 'Create a duration (dotted, triplet)',
        useCase:
          'Generate swing rhythms by mixing dotted eighths and sixteenths in a shuffle groove.',
      }),
      e('core-rhythm/effectiveDuration', {
        name: 'effectiveDuration',
        signature: '(dur) → number',
        description: 'Actual beat count of a duration',
        useCase:
          'Sum event durations to check whether a generated bar fits within the target time signature.',
      }),
      e('core-rhythm/beatsToSeconds', {
        name: 'beatsToSeconds',
        signature: '(beats, bpm) → number',
        description: 'Convert beats to seconds',
        useCase:
          "Schedule a Web Audio oscillator stop time from a note's beat duration and the current BPM.",
      }),
      e('core-rhythm/secondsToBeats', {
        name: 'secondsToBeats',
        signature: '(seconds, bpm) → number',
        description: 'Convert seconds to beats',
        useCase:
          'Align a recorded audio clip (with a known duration in seconds) to the beat grid.',
      }),
      e('core-rhythm/beatsPerMeasure', {
        name: 'beatsPerMeasure',
        signature: '(ts) → number',
        description: 'Beats in a time signature',
        useCase:
          'Determine how many events fit in one bar when generating a rhythmic pattern for 7/8 or 5/4.',
      }),
      e('core-rhythm/durationsWithinBeats', {
        name: 'durationsWithinBeats',
        signature: '(beats) → DurationValue[]',
        description: 'Durations that fit in beat count',
        useCase:
          'Pick a valid random duration for each remaining beat when filling a measure procedurally.',
      }),
      e('core-rhythm/subdivideBeat', {
        name: 'subdivideBeat',
        signature: '(beats, divisions) → DurationValue',
        description: 'Subdivide beat span',
        useCase:
          'Create a tuplet feel by evenly subdividing a beat into 5 or 7 equal parts.',
      }),
    ],
  },
  {
    id: 'random-rng',
    label: 'RNG & Chance',
    description: 'Seeded random number generators and chance operations.',
    entries: [
      e('random-rng/SeededRng', {
        name: 'SeededRng',
        signature: 'new SeededRng(seed?)',
        description: 'Deterministic RNG for reproducible results',
        useCase:
          'Store a seed in a URL parameter so users can share and replay the exact same generative piece. ' +
          'Or increment the seed inside a play() generator function — let seed = 0; play(() => generate({ rng: new SeededRng(seed++) })) — for loops that evolve predictably.',
      }),
      e('random-rng/DefaultRng', {
        name: 'DefaultRng',
        signature: 'new DefaultRng()',
        description: 'Non-deterministic RNG (Math.random)',
        useCase:
          'Pass inside a play() generator function — play(() => generate({ rng: new DefaultRng() })) — so each loop iteration produces a completely different phrase. ' +
          'For one-off generate* calls you can omit rng and the library uses its default. ' +
          'Note: passing a static pre-generated array to play() always loops identically regardless of which RNG was used.',
      }),
      e('random-rng/weightedChoice', {
        name: 'weightedChoice',
        signature: '(items, rng?) → T',
        description: 'Pick one item by weight',
        useCase:
          'Bias a melody toward the tonic and dominant by giving those scale degrees higher weights.',
      }),
      e('random-rng/weightedChoices', {
        name: 'weightedChoices',
        signature: '(items, count, rng?) → T[]',
        description: 'Pick multiple by weight',
        useCase:
          'Assemble a chord progression where certain chords (I, IV, V) appear more frequently than others.',
      }),
      e('random-rng/uniformChoice', {
        name: 'uniformChoice',
        signature: '(items, rng?) → T',
        description: 'Pick uniformly at random',
        useCase:
          'Select a random scale type for each section of a generative piece without bias.',
      }),
      e('random-rng/shuffle', {
        name: 'shuffle',
        signature: '(items, rng?) → T[]',
        description: 'Fisher-Yates shuffle',
        useCase:
          'Randomize the playback order of a fixed set of motifs to create variation without repetition.',
      }),
    ],
  },
  {
    id: 'random-distributions',
    label: 'Distributions',
    description: 'Statistical distributions for parameter generation.',
    entries: [
      e('random-distributions/uniform', {
        name: 'uniform',
        signature: '(min, max, rng?) → number',
        description: 'Uniform distribution',
        useCase:
          'Generate evenly spread velocities between pp and ff for a percussive pattern.',
      }),
      e('random-distributions/gaussian', {
        name: 'gaussian',
        signature: '(mean, stddev, rng?) → number',
        description: 'Gaussian (normal) distribution',
        useCase:
          'Cluster generated pitches around a central register so the melody stays in a natural vocal range.',
      }),
      e('random-distributions/gaussianClamped', {
        name: 'gaussianClamped',
        signature: '(mean, stddev, min, max, rng?) → number',
        description: 'Clamped gaussian',
        useCase:
          'Generate note velocities that feel humanized — mostly around mezzo-forte, never silent or clipping.',
      }),
      e('random-distributions/exponential', {
        name: 'exponential',
        signature: '(lambda, rng?) → number',
        description: 'Exponential distribution',
        useCase:
          'Model natural note timing gaps — most notes fall close together, with rare long silences.',
      }),
      e('random-distributions/poisson', {
        name: 'poisson',
        signature: '(lambda, rng?) → number',
        description: 'Poisson distribution',
        useCase:
          'Determine how many ornaments to scatter across a phrase at a given average density.',
      }),
      e('random-distributions/triangular', {
        name: 'triangular',
        signature: '(min, max, mode, rng?) → number',
        description: 'Triangular distribution',
        useCase:
          'Shape note durations so they cluster around a preferred value (e.g. mostly quarter notes) with a soft tail.',
      }),
      e('random-distributions/clampRound', {
        name: 'clampRound',
        signature: '(value, min, max) → number',
        description:
          'Clamp and round a value to the nearest integer in [min, max]',
        useCase:
          'Round a continuous random MIDI value to the nearest integer within a valid range.',
      }),
    ],
  },
  {
    id: 'random-dice',
    label: 'Dice & Coins',
    description: 'Dice rolls, coin flips, and I Ching hexagrams.',
    entries: [
      e('random-dice/rollDie', {
        name: 'rollDie',
        signature: '(sides, rng?) → number',
        description: 'Roll a single die',
        useCase:
          'Select one of six pre-written motifs by rolling a d6 at the start of each phrase.',
      }),
      e('random-dice/rollDice', {
        name: 'rollDice',
        signature: '(count, sides, rng?) → DiceRoll',
        description: 'Roll multiple dice',
        useCase:
          "Recreate the bell-curve distribution of Mozart's dice game (Musikalisches Würfelspiel) with 2d6.",
      }),
      e('random-dice/roll2d6', {
        name: 'roll2d6',
        signature: '(rng?) → DiceRoll',
        description: 'Roll 2d6',
        useCase:
          'Use the sum (2–12) to index into an 11-entry measure table, replicating classical dice-music composition.',
      }),
      e('random-dice/flipCoin', {
        name: 'flipCoin',
        signature: '(rng?) → CoinResult',
        description: 'Flip a coin (heads/tails)',
        useCase:
          'Decide at each beat whether to play a note or rest, producing a stochastic rhythm texture.',
      }),
      e('random-dice/flipBool', {
        name: 'flipBool',
        signature: '(probability?, rng?) → boolean',
        description: 'Boolean with probability',
        useCase:
          'Add ornaments to a melody with a 20% chance per note, creating tasteful, sparse decoration.',
      }),
      e('random-dice/castHexagram', {
        name: 'castHexagram',
        signature: '(rng?) → Hexagram',
        description: 'Cast an I Ching hexagram',
        useCase:
          'Use an I Ching reading as the compositional seed for a Cage-inspired indeterminate score.',
      }),
      e('random-dice/hexagramSelect', {
        name: 'hexagramSelect',
        signature: '(hexagram, items) → T',
        description: 'Map hexagram to an item index',
        useCase:
          'Map a hexagram number to one of 64 pre-written melodic cells to build a musically coherent phrase.',
      }),
    ],
  },
  {
    id: 'gen-pitch',
    label: 'Random Pitch',
    description: 'Generate random pitch sequences with distribution control.',
    entries: [
      e('gen-pitch/generateRandomPitches', {
        name: 'generateRandomPitches',
        signature: '(options) → MusicEvent[]',
        description: `Random pitches; optional \`distribution\`: ${joinRef(PITCH_DISTRIBUTIONS)}`,
        useCase:
          'Quickly sketch a melodic phrase in a given scale and register, ready to loop and refine.',
      }),
    ],
  },
  {
    id: 'gen-rhythm',
    label: 'Random Rhythm',
    description: 'Generate random rhythmic patterns.',
    entries: [
      e('gen-rhythm/generateRandomRhythm', {
        name: 'generateRandomRhythm',
        signature: '(options) → MusicEvent[]',
        description: 'Random rhythm with rest probability and duration variety',
        useCase:
          'Generate a drum-machine hi-hat pattern with variable density and occasional rests.',
      }),
    ],
  },
  {
    id: 'gen-markov',
    label: 'Markov Chains',
    description: 'Statistical sequence generation from source material.',
    entries: [
      e('gen-markov/buildTransitionMatrix', {
        name: 'buildTransitionMatrix',
        signature: '(sequence, order?) → TransitionMatrix',
        description: 'Build matrix from string sequence',
        useCase:
          "Train a model on a folk melody's note sequence, then generate stylistically similar variations.",
      }),
      e('gen-markov/buildMidiTransitionMatrix', {
        name: 'buildMidiTransitionMatrix',
        signature: '(midiSeq, order?) → TransitionMatrix',
        description: 'Build matrix from MIDI sequence',
        useCase:
          "Analyze a MIDI file's pitch sequence to learn its harmonic tendencies and generate continuations.",
      }),
      e('gen-markov/generateMarkovSequence', {
        name: 'generateMarkovSequence',
        signature: '(options) → MusicEvent[]',
        description: 'Generate sequence from transition matrix',
        useCase:
          'Produce an endless melodic stream that mirrors the intervallic style of the source material.',
      }),
    ],
  },
  {
    id: 'gen-chance',
    label: 'Chance Operations',
    description: 'Cage-style indeterminate composition.',
    entries: [
      e('gen-chance/generateChanceOps', {
        name: 'generateChanceOps',
        signature: '(options) → MusicEvent[]',
        description: `Cage-style chance ops; \`method\`: ${joinRef(CHANCE_METHODS)}`,
        useCase:
          "Compose an indeterminate piece in the spirit of John Cage's Music of Changes — each parameter determined by coin, die, or hexagram.",
      }),
    ],
  },
  {
    id: 'gen-lsystem',
    label: 'L-Systems',
    description: 'Lindenmayer systems for fractal-like musical structures.',
    entries: [
      e('gen-lsystem/expandLSystem', {
        name: 'expandLSystem',
        signature: '(axiom, rules, iterations, rng?) → string',
        description: 'Expand L-system string',
        useCase:
          'Grow a branching melodic sentence from a single seed symbol across multiple iterations.',
      }),
      e('gen-lsystem/generateLSystem', {
        name: 'generateLSystem',
        signature: '(options) → MusicEvent[]',
        description: `L-system music; interpretation values use action types: ${joinRef(LSYSTEM_ACTION_TYPES)}`,
        useCase:
          'Create a self-similar, fractal-like melody that expands organically — ideal for generative installation music.',
      }),
    ],
  },
  {
    id: 'gen-cellular',
    label: 'Cellular Automata',
    description: 'Wolfram rules and Game of Life for musical patterns.',
    entries: [
      e('gen-cellular/generateCellularAutomata', {
        name: 'generateCellularAutomata',
        signature: '(options) → MusicEvent[]',
        description: `1D Wolfram or 2D GoL; \`pitchMapping\` string options: ${joinRef(CELLULAR_PITCH_MAPPING_KINDS)}; \`mode\`: ${joinRef(CELLULAR_AUTOMATA_MODES)}`,
        useCase:
          'Use Wolfram Rule 30 to drive an arpeggio whose pattern is deterministic yet complex enough to feel alive.',
      }),
    ],
  },
  {
    id: 'gen-ambient',
    label: 'Ambient Generator',
    description: 'Long-form ambient texture generation.',
    entries: [
      e('gen-ambient/generateAmbientTimeline', {
        name: 'generateAmbientTimeline',
        signature: '(options) → Timeline',
        description: 'Generate ambient timeline with harmony and gaps',
        useCase:
          'Fill a gallery or retail space with a slowly evolving, sparse harmonic texture that loops without obvious repetition.',
      }),
    ],
  },
  {
    id: 'gen-dice',
    label: 'Dice Music',
    description: 'Table-based composition using dice rolls.',
    entries: [
      e('gen-dice/generateDiceMusic', {
        name: 'generateDiceMusic',
        signature: '(options) → MusicEvent[]',
        description: 'Generate music from dice table',
        useCase:
          'Recreate the 18th-century practice of composing minuets by dice — each roll selects a pre-written measure.',
      }),
      e('gen-dice/createSimpleDiceTable', {
        name: 'createSimpleDiceTable',
        signature: '(entries, duration?, velocity?) → DiceMusicTable',
        description: 'Build a dice-to-notes mapping table',
        useCase:
          'Author a curated set of melodic fragments and let dice rolls assemble them into a unique piece each time.',
      }),
    ],
  },
  {
    id: 'gen-constraints',
    label: 'Constraints',
    description: 'Post-processing constraints to shape generated material.',
    entries: [
      e('gen-constraints/applyConstraints', {
        name: 'applyConstraints',
        signature: '(events, constraints) → MusicEvent[]',
        description: 'Apply constraint chain to events',
        useCase:
          'Post-process the output of any generator through a chain of voice-leading and range rules before playback.',
      }),
      e('gen-constraints/ScaleConstraint', {
        name: 'ScaleConstraint',
        signature: 'new ScaleConstraint(scale)',
        description: 'Snap pitches to a scale',
        useCase:
          'Keep a randomly-generated melody in key by snapping every pitch to the nearest scale degree.',
      }),
      e('gen-constraints/MaxLeapConstraint', {
        name: 'MaxLeapConstraint',
        signature: 'new MaxLeapConstraint(semitones)',
        description: 'Limit melodic leap size',
        useCase:
          'Make a computer-generated vocal line singable by capping consecutive intervals at a major sixth.',
      }),
      e('gen-constraints/RangeConstraint', {
        name: 'RangeConstraint',
        signature: 'new RangeConstraint(low, high)',
        description: 'Clamp pitch to MIDI range',
        useCase:
          "Constrain a generated cello part to the instrument's comfortable range (C2–C5).",
      }),
      e('gen-constraints/NoParallelFifthsConstraint', {
        name: 'NoParallelFifthsConstraint',
        signature: 'new NoParallelFifthsConstraint()',
        description: 'Avoid parallel fifths',
        useCase:
          'Apply classical counterpoint rules to a two-voice algorithmic composition automatically.',
      }),
      e('gen-constraints/ContourConstraint', {
        name: 'ContourConstraint',
        signature: 'new ContourConstraint(direction)',
        description: `Impose contour; \`direction\`: ${joinRef(CONTOUR_DIRECTIONS)}`,
        useCase:
          'Shape a generated phrase into an arch that rises toward a climax then descends — a classic melodic form.',
      }),
    ],
  },
  {
    id: 'audio-synths',
    label: 'Synths',
    description: 'Oscillator and FM synthesis instruments.',
    entries: [
      e('audio-synths/AleatoricAudio', {
        name: 'AleatoricAudio',
        signature: 'new AleatoricAudio(options?)',
        description: 'Audio context manager with master gain and analyser',
        useCase:
          'Set up a shared audio context once and route all synths and effects through a single master output.',
      }),
      e('audio-synths/OscillatorSynth', {
        name: 'OscillatorSynth',
        signature: 'new OscillatorSynth(options?)',
        description: 'Standard oscillator synth (sine, square, saw, triangle)',
        useCase:
          'Use a sine wave for clean melodic lines or a sawtooth for brash, retro lead sounds in a generative piece.',
      }),
      e('audio-synths/FMSynth', {
        name: 'FMSynth',
        signature: 'new FMSynth(options?)',
        description: 'FM synthesis with modulator ratio and index',
        useCase:
          'Dial in a metallic bell timbre with a high modulation index for sparse, resonant ambient notes.',
      }),
      e('audio-synths/SamplePlayer', {
        name: 'SamplePlayer',
        signature: 'new SamplePlayer(options)',
        description: 'Sample-based playback instrument',
        useCase:
          'Trigger recorded piano samples pitched to the correct note, giving generated events a realistic acoustic timbre.',
      }),
    ],
  },
  {
    id: 'audio-effects',
    label: 'Effects',
    description: 'Audio effect nodes for signal processing.',
    entries: [
      e('audio-effects/createDelay', {
        name: 'createDelay',
        signature: '(ctx, time?, feedback?) → EffectNode',
        description: 'Delay effect',
        useCase:
          'Add rhythmic echo to a sparse melodic line, turning single notes into a cascading texture.',
      }),
      e('audio-effects/createFilter', {
        name: 'createFilter',
        signature: '(ctx, type?, freq?, Q?) → EffectNode',
        description: 'Biquad filter',
        useCase:
          'Automate a low-pass filter cutoff over time to create a classic electronic music filter sweep.',
      }),
      e('audio-effects/createDistortion', {
        name: 'createDistortion',
        signature: '(ctx, amount?) → EffectNode',
        description: 'Waveshaper distortion',
        useCase:
          'Drive a generated bass line through a soft clipper for a gritty, lo-fi character.',
      }),
      e('audio-effects/createReverb', {
        name: 'createReverb',
        signature: '(ctx, impulseResponse, wetMix?) → EffectNode',
        description: 'Convolution reverb',
        useCase:
          "Place generated notes in a virtual concert hall or cathedral using a real room's impulse response.",
      }),
      e('audio-effects/chainEffects', {
        name: 'chainEffects',
        signature: '(...effects) → EffectNode',
        description: 'Chain effects in series',
        useCase:
          'Build a signal chain — filter → delay → reverb — as a single composable node for any instrument.',
      }),
    ],
  },
  {
    id: 'audio-envelope',
    label: 'Envelope',
    description: 'ADSR amplitude shaping.',
    entries: [
      e('audio-envelope/applyEnvelope', {
        name: 'applyEnvelope',
        signature: '(param, startTime, holdDuration, envelope?)',
        description: 'Apply ADSR envelope to AudioParam',
        useCase:
          "Give each generated note a natural attack and release so it doesn't click or cut off abruptly.",
      }),
      e('audio-envelope/totalEnvelopeDuration', {
        name: 'totalEnvelopeDuration',
        signature: '(holdDuration, envelope?) → number',
        description: 'Total duration including release',
        useCase:
          'Calculate when it is safe to stop an oscillator after the note ends, accounting for the release tail.',
      }),
      e('audio-envelope/DEFAULT_ENVELOPE', {
        name: 'DEFAULT_ENVELOPE',
        description: 'Default ADSR values',
        useCase:
          'Use as a starting template and tweak just the release time for a longer, more ambient decay.',
      }),
    ],
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    description: 'Timeline and lookahead playback scheduling.',
    entries: [
      e('scheduler/Timeline', {
        name: 'Timeline',
        signature: 'new Timeline(events?)',
        description:
          'Ordered collection of MusicEvents with merge/slice/quantize',
        useCase:
          'Merge the outputs of multiple generators into a single ordered timeline before handing it to a Player.',
      }),
      e('scheduler/Player', {
        name: 'Player',
        signature: 'new Player(ctx, timeline, instrument, dest, opts?)',
        description: 'Lookahead scheduler for real-time playback',
        useCase:
          "Drive a custom synth with precise, glitch-free timing using Web Audio's lookahead scheduling strategy.",
      }),
      e('scheduler/createMusicEvent', {
        name: 'createMusicEvent',
        signature: '(overrides) → MusicEvent',
        description: 'Create a MusicEvent with defaults',
        useCase:
          'Hand-craft a specific note — with exact pitch, velocity, and timing — to anchor a generated phrase.',
      }),
    ],
  },
  {
    id: 'composition',
    label: 'Composition',
    description: 'Multi-part score structure.',
    entries: [
      e('composition/Section', {
        name: 'Section',
        signature: 'new Section(options)',
        description: 'A musical section with events and duration',
        useCase:
          'Define a verse and chorus as separate Sections, each with its own generator and length.',
      }),
      e('composition/Part', {
        name: 'Part',
        signature: 'new Part(options)',
        description: 'An instrument part containing sections',
        useCase:
          'Assign a distinct generator and synth to a melody part and a bass part, keeping them structurally separate.',
      }),
      e('composition/Score', {
        name: 'Score',
        signature: 'new Score(options)',
        description: 'Full score with parts, BPM, and player creation',
        useCase:
          'Combine a melody, bass, and percussion part into a single score and render them in sync at 120 BPM.',
      }),
    ],
  },
];

export const STARTER_CODE = `import {
  generateRandomPitches,
  Scale,
  pitchToString,
} from 'aleatoric';

// Pentatonic palette; try other Scale.create roots/types from the sidebar.
const scale = Scale.create('C', 'pentatonic');

// Gaussian distribution clusters notes around the middle of the MIDI range.
const events = generateRandomPitches({
  count: 16,
  low: 48,
  high: 84,
  scale,
  distribution: 'gaussian',
  duration: 0.5,
});

console.log(\`Generated \${events.length} events\`);
events.forEach((e, i) =>
  console.log(\`  \${i + 1}. \${pitchToString(e.pitch)} (MIDI \${e.midi})\`)
);

// Toolbar "Loop" merges here; pass { loop: true } or a () => events function to change behavior.
play(events);
`;
