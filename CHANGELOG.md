# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0](https://github.com/collin-klippel/aleatoric/releases/tag/v0.1.0) - 2026-04-16

### Added

**Core**

- `Scale` — scale definition and degree/pitch lookup with octave transposition
- `Chord` — chord construction from root, quality, and scale degree
- `Interval` — interval arithmetic and quality classification
- Note and pitch helpers: `parsePitch`, `pitchToMidi`, `midiToPitch`, `pitchToFrequency`, `midiToFrequency`, and related conversion utilities
- Rhythm helpers: `createDuration`, `beatsToSeconds`, `DURATIONS` constant map

**Generators**

- `generateChanceOps` — John Cage-style chance operations via I Ching coin tosses
- `generateMarkovSequence` — Markov chain melody generator with configurable transition matrices
- `generateCellularAutomata` — 1D cellular automaton melody generator (Rule 30, 90, 110, etc.)
- `generatePerlinNoiseMelody` — Perlin noise melody generator for smooth contour
- `generateDiceMusic` — Mozart/Haydn-style dice music from pre-composed phrase tables
- `generateRandomPitches` — uniform and weighted random pitch selection within a scale
- `generateRandomRhythm` — random rhythm generation with configurable duration pools
- `createMusicEvent` — factory for typed music events

**Constrained generation**

- `applyConstraints` — pipeline for applying an ordered list of constraints to a sequence
- `ScaleConstraint` — snap pitches to a target scale
- `RangeConstraint` — clamp pitches within a MIDI range
- `MaxLeapConstraint` — limit the maximum melodic interval between successive notes
- `NoParallelFifthsConstraint` — detect and correct parallel perfect fifths in two-voice counterpoint
- `ContourConstraint` — enforce melodic contour (ascending, descending, arch, valley)

**Random**

- `SeededRng` / `DefaultRng` — seedable and default pseudo-random number generators
- `flipCoin`, `flipBool`, `flipCoins`, `coinChoice` — Bernoulli trials and coin-based selection
- `rollDice` — polyhedral dice rolls (returns object with `individual` rolls and `sum`)
- `castHexagram` — I Ching hexagram generation via coin toss method
- `weightedChoice` — probability-weighted selection
- `uniform`, `gaussian`, `exponential` — sampling from statistical distributions

**MIDI**

- `MidiPlayer` — Web MIDI API player with note-on/note-off scheduling and channel support
- `noteOn`, `noteOff`, `controlChange` — MIDI message helpers and typed message constructors

**Playback / Scheduling**

- `SynthesisScheduler` — synthesis scheduler with configurable ADSR envelopes (requires a `SynthesisAdapter` implementation)
- `Timeline` — precise event scheduling with lookahead buffering and tempo control

