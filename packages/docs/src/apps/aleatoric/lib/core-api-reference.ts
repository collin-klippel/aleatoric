import type {
  ApiCategory,
  ApiEntry,
  ApiReferenceEntryInput,
} from '@docs-shared/lib/docs-api-reference-types';
import {
  CELLULAR_PITCH_MAPPING_KINDS,
  CHANCE_METHODS,
  CHORD_QUALITIES,
  CONTOUR_DIRECTIONS,
  DURATION_NAMES,
  PITCH_DISTRIBUTIONS,
  SCALE_TYPE_NAMES,
} from 'aleatoric';
import {
  type CoreApiReferenceSnippetId,
  getCoreApiSnippet,
} from './core-api-reference-snippets';
import {
  CELLULAR_PITCH_MAPPING_ENUM_DOCS,
  CHANCE_METHOD_ENUM_DOCS,
  CHORD_QUALITY_ENUM_DOCS,
  CONTOUR_DIRECTION_ENUM_DOCS,
  DURATION_NAME_ENUM_DOCS,
  INTERVAL_ENUM_MEMBER_DOCS,
  PITCH_DISTRIBUTION_ENUM_DOCS,
  SCALE_TYPE_ENUM_DOCS,
} from './core-ref-value-enums';

function joinRef(values: readonly string[]): string {
  return values.join(', ');
}

function e(
  id: CoreApiReferenceSnippetId,
  meta: ApiReferenceEntryInput,
): ApiEntry {
  return { id, ...meta, example: getCoreApiSnippet(id) };
}

export const CORE_API_CATEGORIES: ApiCategory[] = [
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
    ],
  },
  {
    id: 'core-intervals',
    label: 'Intervals',
    description: 'Interval classification and utilities.',
    entries: [
      e('core-intervals/Interval', {
        name: 'Interval',
        kind: 'enum',
        description:
          'TypeScript enum of interval classes indexed by semitone distance.',
        useCase:
          'Use named constants (e.g. Interval.PerfectFifth) instead of magic numbers when constructing chords.',
        enumValues: [...INTERVAL_ENUM_MEMBER_DOCS],
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
        description: `Create a scale from a root pitch or note name and a scale type.`,
        useCase:
          'Define the harmonic palette for a generative piece — e.g. a D dorian scale for a modal jazz sketch.',
        parameters: [
          {
            name: 'root',
            type: 'Pitch | NoteName',
            description: 'Tonic of the scale.',
            required: true,
          },
          {
            name: 'type',
            type: 'ScaleTypeName',
            description: `Same set as \`SCALE_TYPE_NAMES\` (${joinRef(SCALE_TYPE_NAMES)}).`,
            required: true,
            enumValues: [...SCALE_TYPE_ENUM_DOCS],
          },
        ],
        relatedApis: ['core-scales/Scale.types'],
      }),
      e('core-scales/Scale.types', {
        name: 'Scale.types',
        description: `Read-only tuple of all scale type names (\`SCALE_TYPE_NAMES\`): ${joinRef(SCALE_TYPE_NAMES)}`,
        useCase:
          'Enumerate all available scale types at runtime to build a searchable scale browser.',
        enumValues: [...SCALE_TYPE_ENUM_DOCS],
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
      e('core-scales/Scale.staticFactories', {
        name: 'Scale.major / minor / pentatonic / …',
        kind: 'function',
        signature: 'static methods on Scale',
        description:
          'Static factory methods as shortcuts to common scales. Available methods: major, minor, harmonicMinor, melodicMinor, pentatonic, minorPentatonic, blues, chromatic, wholeTone, octatonic, dorian, phrygian, lydian, mixolydian, aeolian, locrian',
        useCase:
          'Skip Scale.create when you already know the mode — e.g. Scale.pentatonic("E") for a lead line.',
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
        description:
          'Create a chord from a root pitch or note name and a quality string.',
        useCase:
          'Build the ii–V–I progression of a jazz piece by creating chords from scale degrees.',
        parameters: [
          {
            name: 'root',
            type: 'Pitch | NoteName',
            description: 'Root of the chord.',
            required: true,
          },
          {
            name: 'quality',
            type: 'ChordQuality',
            description: `Same set as \`CHORD_QUALITIES\` (${joinRef(CHORD_QUALITIES)}).`,
            required: true,
            enumValues: [...CHORD_QUALITY_ENUM_DOCS],
          },
        ],
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
        enumValues: [...DURATION_NAME_ENUM_DOCS],
      }),
      e('core-rhythm/createDuration', {
        name: 'createDuration',
        signature: '(value, opts?) → Duration',
        description:
          'Create a duration from a named length or a raw beat count; optional dotted / triplet modifiers.',
        useCase:
          'Generate swing rhythms by mixing dotted eighths and sixteenths in a shuffle groove.',
        parameters: [
          {
            name: 'value',
            type: 'DurationName | number',
            description:
              'Named key from `DURATIONS` or an explicit length in beats.',
            required: true,
            enumValues: [...DURATION_NAME_ENUM_DOCS],
          },
          {
            name: 'opts',
            type: '{ dotted?, triplet? }',
            description: 'Optional rhythmic modifiers.',
          },
        ],
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
      e('core-rhythm/isDurationName', {
        name: 'isDurationName',
        signature: '(value) → value is DurationName',
        description: 'Type guard for keys of DURATIONS / createDuration',
        useCase:
          'Validate user input or JSON config before passing a duration name into createDuration.',
        parameters: [
          {
            name: 'value',
            type: 'unknown',
            description: 'Candidate string to narrow to `DurationName`.',
            required: true,
            enumValues: [...DURATION_NAME_ENUM_DOCS],
          },
        ],
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
        description:
          'Deterministic RNG with optional seed (defaults to current timestamp for automatic randomness)',
        useCase:
          'Pass an explicit seed to ensure reproducible sequences for testing, comparison, or sharing—e.g., store in a URL parameter so users can replay the exact same generative piece. Omit the seed parameter to get different results each run (uses Date.now() by default). Use DefaultRng if you want to emphasize non-reproducible behavior.',
      }),
      e('random-rng/DefaultRng', {
        name: 'DefaultRng',
        signature: 'new DefaultRng()',
        description: 'Non-deterministic RNG (Math.random)',
        useCase:
          'Use when you want a different random outcome on every run. For one-off generate* calls you can omit rng and the library uses its default.',
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
      e('random-rng/toWeightedItems', {
        name: 'toWeightedItems',
        signature: '(items, weights) → WeightedItem<T>[]',
        description: 'Zip parallel arrays into weightedChoice input',
        useCase:
          'Turn separate label and weight arrays from a UI into the structure weightedChoice expects.',
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
      e('random-dice/coinChoice', {
        name: 'coinChoice',
        signature: '(heads, tails, bias?, rng?) → T',
        description: 'Pick heads or tails branch with optional bias',
        useCase:
          'Branch composition logic on a fair or weighted coin flip without writing flipBool yourself.',
      }),
      e('random-dice/flipCoins', {
        name: 'flipCoins',
        signature: '(count, bias?, rng?) → CoinResult[]',
        description: 'Flip multiple coins',
        useCase:
          'Drive a rhythmic pattern from several independent heads/tails outcomes at once.',
      }),
      e('random-dice/rollKeepHighest', {
        name: 'rollKeepHighest',
        signature: '(count, sides, keep, rng?) → DiceRoll',
        description: 'Roll dice and keep the highest values (advantage-style)',
        useCase:
          'Model tabletop-RPG advantage or other "roll many, keep best" musical parameter selection.',
      }),
      e('random-dice/rollKeepLowest', {
        name: 'rollKeepLowest',
        signature: '(count, sides, keep, rng?) → DiceRoll',
        description: 'Roll dice and keep the lowest values',
        useCase:
          'Disadvantage-style rolls for darker or sparser musical choices.',
      }),
      e('random-dice/hexagramToInt', {
        name: 'hexagramToInt',
        signature: '(hexagram, min, max) → number',
        description: 'Map hexagram to an inclusive integer range',
        useCase:
          'Turn a cast hexagram into a discrete index for scales, modes, or phrase tables.',
      }),
      e('random-dice/hexagramToRange', {
        name: 'hexagramToRange',
        signature: '(hexagram, min, max) → number',
        description: 'Map hexagram to a floating-point range',
        useCase:
          'Continuous parameters (tempo drift, filter cutoff) from the same I Ching seed.',
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
        description:
          'Random pitches in a scale and register; optional shape via `options.distribution`.',
        useCase:
          'Quickly sketch a melodic phrase in a given scale and register, ready to loop and refine.',
        parameters: [
          {
            name: 'distribution',
            type: 'PitchDistribution',
            description: `Optional \`options.distribution\` (${joinRef(PITCH_DISTRIBUTIONS)}).`,
            enumValues: [...PITCH_DISTRIBUTION_ENUM_DOCS],
          },
        ],
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
        description: 'Cage-style chance operations over musical parameters.',
        useCase:
          "Compose an indeterminate piece in the spirit of John Cage's Music of Changes — each parameter determined by coin, die, or hexagram.",
        parameters: [
          {
            name: 'method',
            type: 'ChanceMethod',
            description: `\`options.method\` (${joinRef(CHANCE_METHODS)}).`,
            enumValues: [...CHANCE_METHOD_ENUM_DOCS],
          },
        ],
      }),
    ],
  },
  {
    id: 'gen-cellular',
    label: 'Cellular Automata',
    description: "Conway's Game of Life for musical patterns.",
    entries: [
      e('gen-cellular/generateCellularAutomata', {
        name: 'generateCellularAutomata',
        signature: '(options) → MusicEvent[]',
        description:
          "Conway's Game of Life 2D grid, mapped to pitches from options. The seed controls the random initial state.",
        useCase:
          'Seed a Game of Life grid and let cell evolution drive an evolving melodic or rhythmic pattern.',
        parameters: [
          {
            name: 'pitchMapping',
            type: 'CellularPitchMappingKind | number[]',
            description: `When \`options.pitchMapping\` is a string preset: ${joinRef(CELLULAR_PITCH_MAPPING_KINDS)} (or pass a number[] for explicit MIDI columns).`,
            enumValues: [...CELLULAR_PITCH_MAPPING_ENUM_DOCS],
          },
        ],
      }),
    ],
  },
  {
    id: 'gen-perlin',
    label: 'Perlin noise',
    description: 'Smooth melodic contours from interpolated noise.',
    entries: [
      e('gen-perlin/generatePerlinNoiseMelody', {
        name: 'generatePerlinNoiseMelody',
        signature: '(options) → MusicEvent[]',
        description:
          'Sequential notes whose MIDI heights follow a Perlin-like contour, optionally constrained to a scale.',
        useCase:
          'Shape a slow synth line that meanders without pure random jitter—good for pads and generative ostinatos.',
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
    description:
      'Post-processing constraints for any `MusicEvent[]`: snap to scale, cap leaps, shape contour, clamp range, and counterpoint-style rules.',
    entries: [
      e('gen-constraints/applyConstraints', {
        name: 'applyConstraints',
        signature: '(events, constraints) → MusicEvent[]',
        description: 'Apply constraint chain to events',
        useCase:
          'Post-process the output of any generator through a chain of leap, contour, range, and harmonic rules before playback.',
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
        description: 'Constrain generated phrases to a melodic contour shape.',
        useCase:
          'Shape a generated phrase into an arch that rises toward a climax then descends — a classic melodic form.',
        parameters: [
          {
            name: 'direction',
            type: 'ContourDirection',
            description: `One of ${joinRef(CONTOUR_DIRECTIONS)}.`,
            required: true,
            enumValues: [...CONTOUR_DIRECTION_ENUM_DOCS],
          },
        ],
      }),
    ],
  },
  {
    id: 'core-timeline',
    label: 'Timeline',
    description:
      'Ordered MusicEvent list: merge parts, slice ranges, quantize, inspect duration.',
    entries: [
      e('core-timeline/Timeline', {
        name: 'Timeline',
        signature:
          'new Timeline(events?) · add · merge · getEvents · getEventsInRange · duration · length · quantize · clear · offset · slice',
        description:
          'Mutable sorted timeline of events; merge with beat offsets, quantize to a grid, copy with slice/offset.',
        useCase:
          'Combine generator outputs before MIDI playback or extract one section of a longer score.',
      }),
    ],
  },
  {
    id: 'core-events',
    label: 'MusicEvent',
    description:
      'Factory for note and rest events used by timelines and players.',
    entries: [
      e('core-events/createMusicEvent', {
        name: 'createMusicEvent',
        signature: '(overrides) → MusicEvent',
        description:
          'Build a MusicEvent with sensible defaults; override startBeat, midi, pitch, duration, velocity, isRest, etc.',
        useCase:
          'Hand-author anchor notes or rests alongside generated material in the same Timeline.',
      }),
    ],
  },
  {
    id: 'core-midi',
    label: 'MIDI output & player',
    description:
      'Runtime-agnostic MIDI scheduling and raw message bytes. Implement the MidiOutput interface to connect to any MIDI backend (Web MIDI API in the browser, easymidi in Node.js, etc.).',
    entries: [
      e('core-midi/MidiPlayer', {
        name: 'MidiPlayer',
        signature:
          'new MidiPlayer(output, timeline, opts?) · play · pause · stop · seek · setTempo · on · off · playbackState · beat',
        description:
          'Lookahead scheduler over a Timeline; opts: bpm, channel, lookahead, interval, loop, deferSend (for outputs that ignore send timestamps).',
        useCase:
          'Send MusicEvents to hardware or a DAW with correct timing instead of manual noteOn/noteOff.',
      }),
      e('core-midi/noteOn', {
        name: 'noteOn',
        signature: '(note, velocity, channel?) → number[]',
        description: 'Raw MIDI note-on byte triplet',
        useCase:
          'Build custom output paths when you are not using MidiPlayer, or log bytes for debugging.',
      }),
      e('core-midi/noteOff', {
        name: 'noteOff',
        signature: '(note, velocity?, channel?) → number[]',
        description: 'Raw MIDI note-off byte triplet',
        useCase: 'Pair with noteOn for manual scheduling.',
      }),
      e('core-midi/controlChange', {
        name: 'controlChange',
        signature: '(controller, value, channel?) → number[]',
        description: 'Control change message bytes',
        useCase: 'Send sustain, mod wheel, or other CC data alongside notes.',
      }),
      e('core-midi/allNotesOff', {
        name: 'allNotesOff',
        signature: '(channel?) → number[]',
        description: 'CC 123 all-notes-off on the channel',
        useCase:
          'Panic-reset a synth channel; MidiPlayer.stop() sends this automatically.',
      }),
    ],
  },
  {
    id: 'core-playback',
    label: 'Web Audio synthesis bridge',
    description:
      'Implement SynthesisAdapter to drive a third-party Web Audio synthesizer; SynthesisScheduler maps a Timeline onto audio-clock times (e.g. AudioContext.currentTime), similar to MidiPlayer.',
    entries: [
      e('core-playback/SynthesisScheduler', {
        name: 'SynthesisScheduler',
        kind: 'class',
        signature:
          'new SynthesisScheduler(adapter, timeline, opts) · play · pause · stop · seek · setTempo · playbackState · beat',
        description:
          'Lookahead scheduler; opts require getAudioTime (seconds on the shared audio clock), plus optional bpm, lookahead, interval, loop.',
        useCase:
          'Play generated MusicEvents through Tone.js, custom AudioWorklets, or any API that schedules notes at absolute times.',
      }),
      e('core-playback/SynthesisAdapter', {
        name: 'SynthesisAdapter',
        kind: 'interface',
        description:
          'schedule(note: ScheduledSynthesisNote): void — called for each non-rest event. Optional cancelAll(atTimeSec) for stop/panic.',
        useCase:
          'One thin wrapper per external library; polyphony and voice stealing stay inside your implementation.',
      }),
      e('core-playback/ScheduledSynthesisNote', {
        name: 'ScheduledSynthesisNote',
        kind: 'interface',
        description:
          'startTimeSec, durationSec, midi, velocity, frequencyHz, and source (original MusicEvent) after beat→second conversion.',
        useCase:
          'Use source.pitch or other MusicEvent fields when the synth needs more than MIDI number and Hz.',
      }),
    ],
  },
];

const coreApiCategoryById: Record<string, ApiCategory> = {};
for (const c of CORE_API_CATEGORIES) {
  coreApiCategoryById[c.id] = c;
}

/** Lookup for rendering static in-page API sections (sidebar reference removed). */
export const CORE_API_CATEGORY_BY_ID: Readonly<Record<string, ApiCategory>> =
  coreApiCategoryById;
