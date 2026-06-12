# aleatoric

Core TypeScript library for algorithmic and chance-based music composition — pitches, scales, chords, probability distributions, and generators for Markov chains, cellular automata, dice music, and more.

[![npm version](https://img.shields.io/npm/v/aleatoric.svg)](https://www.npmjs.com/package/aleatoric)
[![license](https://img.shields.io/npm/l/aleatoric.svg)](../../LICENSE)

**[Docs](https://collin-klippel.github.io/aleatoric)** · **[Playground](https://collin-klippel.github.io/aleatoric/playground/)**

## Features

- **Core music primitives** — pitches, scales, chords, intervals, rhythms
- **Chance engine** — seeded PRNG, probability distributions, dice, coin flips, I Ching
- **Generators** — random pitch/rhythm, Markov chains, cellular automata (Game of Life), dice music (Musikalisches Würfelspiel), chance ops, Perlin-style noise melodies
- **Constraints** — post-processing pipeline to shape generated sequences
- **Timeline** — sorted event collection with merge, slice, quantize, and offset
- **MIDI** — runtime-agnostic MIDI player and message helpers for sending events to hardware synths and DAWs
- **Zero runtime dependencies**
- **Dual CJS + ESM build** — tree-shakeable, works in Node.js and the browser

## Install

**Current npm releases are prereleases** (WIP). Install the `beta` dist-tag or pin a version:

```bash
npm install aleatoric@beta
# or
npm install aleatoric@0.1.0-beta.0
```

In `package.json`: `"aleatoric": "0.1.0-beta.0"` or `"aleatoric": "^0.1.0-beta.0"`. Please include the installed version when [reporting issues](https://github.com/collin-klippel/aleatoric/issues).

When a stable `latest` line is published, `npm install aleatoric` will track that tag.

## Quick Start

### Core primitives

```ts
import { Scale, Chord, pitchToMidi, midiToFrequency } from 'aleatoric';

const scale = Scale.pentatonic('C');
const pitches = scale.getPitches(4); // C4, D4, E4, G4, A4

const chord = Chord.create('C', 'major7');
const notes = chord.getPitches(4); // C4, E4, G4, B4

const midi = pitchToMidi({ name: 'A', octave: 4 }); // 69
const freq = midiToFrequency(midi);                  // 440.0 Hz
```

### Chance engine

```ts
import { SeededRng, flipCoin, rollDie, castHexagram, hexagramToRange, gaussian } from 'aleatoric';

const rng = new SeededRng(42); // reproducible

flipCoin(0.7, rng);            // 'heads' or 'tails' with 70% bias
rollDie(6, rng);               // 1–6

const hexagram = castHexagram(rng);    // I Ching hexagram (1–64)
const value = hexagramToRange(hexagram, 0, 127); // map to MIDI

const pitch = gaussian(60, 10, rng);   // normally distributed around middle C
```

### Generators

```ts
import {
  generateRandomPitches,
  generateRandomRhythm,
  generateMarkovSequence,
  buildMidiTransitionMatrix,
  generateCellularAutomata,
  generateChanceOps,
  Scale,
  SeededRng,
} from 'aleatoric';

const rng = new SeededRng(1);
const scale = Scale.major('D');

// Random pitches constrained to a scale
const pitchEvents = generateRandomPitches({
  count: 16,
  scale,
  low: 48,
  high: 84,
  distribution: 'gaussian',
  rng,
});

// Random rhythm
const rhythmEvents = generateRandomRhythm({ count: 8, restProbability: 0.15, rng });

// First-order Markov chain
const matrix = buildMidiTransitionMatrix([60, 62, 64, 67, 64, 62, 60], 1);
const markovEvents = generateMarkovSequence({
  transitionMatrix: matrix,
  count: 32,
  rng,
});

// 2D cellular automaton (Conway's Game of Life)
const caEvents = generateCellularAutomata({
  steps: 16,
  width: 16,
  rng,
});

// Cage-style chance operations
const chanceEvents = generateChanceOps({
  count: 12,
  pitchMethod: 'iching',
  durationMethod: 'coin',
  rng,
});
```

### Constraints

```ts
import {
  applyConstraints,
  ScaleConstraint,
  MaxLeapConstraint,
  RangeConstraint,
  ContourConstraint,
} from 'aleatoric';

const constrained = applyConstraints(pitchEvents, [
  new ScaleConstraint(Scale.minor('A')),
  new MaxLeapConstraint(7),          // no leaps larger than a perfect 5th
  new RangeConstraint(48, 84),       // stay within 4 octaves
  new ContourConstraint('arch'),     // shape phrase as a rise then fall
]);
```

### Musikalisches Würfelspiel (dice music)

```ts
import { createSimpleDiceTable, generateDiceMusic, SeededRng } from 'aleatoric';

const table = createSimpleDiceTable({
  2:  [[60, 62, 64, 65]],
  3:  [[67, 65, 64, 62]],
  // ... entries for 4–12
  12: [[72, 71, 69, 67]],
}, /* duration per note */ 1, /* velocity */ 80);

const events = generateDiceMusic({ measures: 8, table, rng: new SeededRng(99) });
```

### MIDI output

The `MidiPlayer` sends `MusicEvent`s as MIDI messages through any `MidiOutput` implementation. Bring your own transport — Web MIDI API in the browser, [easymidi](https://www.npmjs.com/package/easymidi) in Node.js, or any custom backend.

```ts
import { MidiPlayer, Timeline, type MidiOutput } from 'aleatoric';

// Example: Web MIDI API in the browser
const access = await navigator.requestMIDIAccess();
const port = access.outputs.values().next().value;
const output: MidiOutput = {
  name: port.name ?? 'MIDI Out',
  send: (data, timestamp) => port.send(data, timestamp),
};

const player = new MidiPlayer(output, new Timeline(events), { bpm: 120, loop: true });
player.play();
```

```ts
// Example: Node.js with easymidi
import easymidi from 'easymidi';
import { MidiPlayer, Timeline, type MidiOutput } from 'aleatoric';

const port = new easymidi.Output('Virtual Port', true);
const output: MidiOutput = {
  name: 'easymidi',
  send: (data) => { /* decode status byte and call port.send() */ },
};

const player = new MidiPlayer(output, new Timeline(events), {
  bpm: 120, loop: true, deferSend: true,
});
player.play();
```

### Web Audio / third-party synthesizers

Use **`SynthesisAdapter`** to plug in Tone.js, custom `AudioWorklet`s, or any library that can start/stop notes at absolute **audio-clock** times (same idea as `AudioContext.currentTime`). **`SynthesisScheduler`** walks a `Timeline` with the same lookahead pattern as `MidiPlayer`, but calls `adapter.schedule()` instead of sending MIDI bytes.

```ts
import {
  SynthesisScheduler,
  Timeline,
  type ScheduledSynthesisNote,
  type SynthesisAdapter,
} from 'aleatoric';

const adapter: SynthesisAdapter = {
  schedule(note: ScheduledSynthesisNote) {
    // Map note.startTimeSec, note.durationSec, note.midi / note.frequencyHz
    // to your synth API (e.g. triggerAttackRelease).
  },
  cancelAll(atTimeSec) {
    // Optional: silence everything at atTimeSec (e.g. on stop).
  },
};

const ctx = new AudioContext();
const scheduler = new SynthesisScheduler(adapter, new Timeline(events), {
  getAudioTime: () => ctx.currentTime,
  bpm: 120,
  loop: false,
});

await ctx.resume();
scheduler.play();
```

Each `ScheduledSynthesisNote` includes the original `MusicEvent` as `source` if you need `pitch` or other fields beyond MIDI and frequency.

## API Overview

### `core/`

| Export | Description |
|---|---|
| `Scale` | 16 built-in scale types (`major`, `minor`, `pentatonic`, `blues`, `dorian`, `aeolian`, etc.) |
| `Chord` | 14 chord qualities (triads, 7ths, 9ths, sus). `getPitches()`, `inversion()` |
| `Interval` | Enum from Unison to Octave. `intervalName`, `invertInterval`, `isConsonant` |
| `pitchToMidi` / `midiToPitch` | Convert between `Pitch` objects and MIDI note numbers |
| `midiToFrequency` / `pitchToFrequency` | Frequency conversion |
| `parsePitch` | Parse `"C#4"` → `Pitch` |
| `DURATIONS` | Standard note values in beats (`quarter`, `eighth`, `half`, etc.) |
| `effectiveDuration` | Apply dot/triplet modifiers to a duration |

### `random/`

| Export | Description |
|---|---|
| `SeededRng` | [xoshiro128\*\*](https://prng.di.unimi.it/) PRNG — deterministic, forkable |
| `DefaultRng` | Wraps `Math.random` |
| `weightedChoice` / `uniformChoice` / `shuffle` | Weighted and uniform selection |
| `uniform` / `gaussian` / `exponential` / `poisson` / `triangular` | Probability distributions |
| `rollDie` / `rollDice` / `roll2d6` | Dice rolling |
| `flipCoin` / `flipBool` / `coinChoice` | Coin flips with optional bias |
| `castHexagram` / `hexagramToRange` / `hexagramSelect` | I Ching ([three-coin method](https://en.wikipedia.org/wiki/I_Ching_divination), [King Wen sequence](https://en.wikipedia.org/wiki/King_Wen_sequence)) |

### `generators/`

| Export | Description |
|---|---|
| `generateRandomPitches` | Uniform, gaussian, or edge-biased pitch generation |
| `generateRandomRhythm` | Random duration selection with rest probability and density mode |
| `generateMarkovSequence` | Nth-order [Markov chains](https://en.wikipedia.org/wiki/Markov_chain) from a transition matrix |
| `generateDiceMusic` | [Musikalisches Würfelspiel](https://en.wikipedia.org/wiki/Musikalisches_W%C3%BCrfelspiel) — compose by rolling dice |
| `generateChanceOps` | [Cage](https://en.wikipedia.org/wiki/Indeterminacy_%28music%29)-style: each parameter independently controlled by coin/I Ching/random |
| `generateCellularAutomata` | [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) 2D grid mapped to pitch sequences |
| `generatePerlinNoiseMelody` | Smooth pitch contours by interpolating noise-like waypoints through an optional scale |

### `generators/constrained`

| Export | Description |
|---|---|
| `applyConstraints` | Apply an ordered list of constraints to a sequence of events |
| `ScaleConstraint` | Snap pitches to the nearest scale degree |
| `MaxLeapConstraint` | Limit maximum melodic leap in semitones |
| `RangeConstraint` | Wrap pitches that exceed a MIDI range |
| `NoParallelFifthsConstraint` | Avoid parallel perfect fifths between two voices |
| `ContourConstraint` | Shape phrase contour: `ascending`, `descending`, `arch`, `valley` |

### `midi/`

| Export | Description |
|---|---|
| `MidiPlayer` | Runtime-agnostic lookahead MIDI scheduler |
| `MidiOutput` | Interface for MIDI output ports — implement with Web MIDI API, easymidi, or any transport |
| `noteOn` / `noteOff` | Encode MIDI note-on and note-off messages as byte arrays |
| `controlChange` / `allNotesOff` | Encode CC and all-notes-off messages |
| `MidiChannel` / `MidiPlayerOptions` | Supporting types |

### `scheduler/`

| Export | Description |
|---|---|
| `Timeline` | Ordered collection of `MusicEvent`s. Supports `merge`, `slice`, `quantize`, `offset` |

### `playback/`

| Export | Description |
|---|---|
| `SynthesisAdapter` | Implement `schedule(note)` (and optionally `cancelAll`) for a third-party Web Audio synth |
| `ScheduledSynthesisNote` | Start time, duration, MIDI, velocity, Hz, plus `source` `MusicEvent` |
| `SynthesisScheduler` | Lookahead playback from a `Timeline` using `getAudioTime()` (e.g. `AudioContext.currentTime`) |
| `SynthesisSchedulerOptions` | `bpm`, `lookahead`, `interval`, `loop`, `getAudioTime` |

## Further reading

Background on the pseudorandom, statistical, and generative ideas used in this library (third-party sites; URLs may change over time).

### PRNG and seeding

- [xoshiro128\*\* / xoshiro family](https://prng.di.unimi.it/) — Sebastiano Vigna and David Blackman's small fast PRNGs (includes reference code and papers).
- [SplitMix-style mixing](https://en.wikipedia.org/wiki/Xorshift) — common way to expand a single seed into a full PRNG state (see also the SplitMix notes on Vigna's site).

### Distributions and sampling

- [Box–Muller transform](https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform) — normal (Gaussian) samples from uniform randoms.
- [Exponential distribution](https://en.wikipedia.org/wiki/Exponential_distribution#Generating_exponential_variates) — inverse-CDF sampling.
- [Poisson distribution](https://en.wikipedia.org/wiki/Poisson_distribution#Generating_Poisson-distributed_random_variables) — discrete-event counts.
- [Triangular distribution](https://en.wikipedia.org/wiki/Triangular_distribution) — values clustered around a mode.
- [Fisher–Yates shuffle](https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle) — uniform random permutations (`shuffle`).

### I Ching

- [I Ching divination](https://en.wikipedia.org/wiki/I_Ching_divination) — including the three-coin method (values 6–9).
- [King Wen sequence](https://en.wikipedia.org/wiki/King_Wen_sequence) — traditional ordering of the 64 hexagrams.

### Generators and musical context

- [Markov chain](https://en.wikipedia.org/wiki/Markov_chain) — memory-based random sequences.
- [Conway's Game of Life](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life) — 2D cellular automaton.
- [Musikalisches Würfelspiel](https://en.wikipedia.org/wiki/Musikalisches_W%C3%BCrfelspiel) — dice-driven musical fragments (historical attribution is discussed in references there).
- [Indeterminacy in music](https://en.wikipedia.org/wiki/Indeterminacy_%28music%29) — chance operations in the tradition of Cage and others.

## Reproducibility

All generators accept an optional `rng` parameter. Pass a `SeededRng` with a fixed seed to produce the same output on every run:

```ts
import { SeededRng, generateRandomPitches } from 'aleatoric';

const events = generateRandomPitches({ count: 8, rng: new SeededRng(1234) });
// Always produces the same sequence
```

## Docs & Playground

- **[Documentation](https://collin-klippel.github.io/aleatoric)** — interactive API reference
- **[Tone playground](https://collin-klippel.github.io/aleatoric/playground/)** — browser demo with Tone.js

To run locally from the repo root:

```bash
npm run docs:dev
npm run dev -w aleatoric-playground
```

See [Contributing](../../CONTRIBUTING.md) for all docs commands.

## License

[MIT](../../LICENSE) © Collin Klippel
