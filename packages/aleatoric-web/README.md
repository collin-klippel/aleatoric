# aleatoric-web

Web Audio engine, playback scheduler, composition layer, and interactive docs for [aleatoric](../aleatoric).

[![npm version](https://img.shields.io/npm/v/aleatoric-web.svg)](https://www.npmjs.com/package/aleatoric-web)
[![license](https://img.shields.io/npm/l/aleatoric-web.svg)](../../LICENSE)

## Features

- **Web Audio engine** — oscillator synth, FM synth, sample player, effects (delay, reverb, filter, distortion)
- **Scheduler** — lookahead `Player` for real-time playback with play/pause/stop/seek/tempo control
- **Composition layer** — `Section`, `Part`, `Score` for structuring multi-part compositions
- **Preview API** — quick play/stop helpers for prototyping
- **Web MIDI output** — `WebMidiOutput` for sending generated events to DAWs and hardware synths via the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API)
- **Interactive docs** — Vite + React playground with live code editor

## Install

```bash
npm install aleatoric aleatoric-web
```

`aleatoric` is a peer dependency — install it alongside `aleatoric-web`. The core library is required for generating music events that the audio engine plays back.

## Quick Start

### Audio engine & playback

```ts
import { generateRandomPitches, Scale, SeededRng } from 'aleatoric';
import { AleatoricAudio, OscillatorSynth, Player, Timeline } from 'aleatoric-web';

const audio = new AleatoricAudio();
const synth = new OscillatorSynth({
  waveform: 'sine',
  envelope: { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.3 },
});

const events = generateRandomPitches({
  count: 16, scale: Scale.pentatonic('C'), low: 48, high: 84, rng: new SeededRng(42),
});

const player = new Player(audio.context, new Timeline(events), synth, audio.destination, { bpm: 120 });

await audio.resume();
player.play();
```

### Ambient generator with playback

```ts
import { generateAmbientTimeline, Scale, SeededRng } from 'aleatoric';
import { AleatoricAudio, OscillatorSynth, Player } from 'aleatoric-web';

const audio = new AleatoricAudio({ masterVolume: 0.5 });
const synth = new OscillatorSynth({
  waveform: 'sine',
  envelope: { attack: 1.5, decay: 0, sustain: 1, release: 3 },
});

const timeline = generateAmbientTimeline({
  low: 'C3', high: 'A5',
  scale: Scale.pentatonic('C'),
  bpm: 20,
  durationRange: [6, 12],
  gapRange: [3, 7],
  harmonyProbability: 0.3,
  totalDuration: 300,
  rng: new SeededRng(42),
});

const player = new Player(
  audio.context, timeline, synth, audio.destination,
  { bpm: 20, loop: true },
);

await audio.resume();
player.play();
```

### Composition layer

```ts
import { generateRandomPitches, Scale, SeededRng } from 'aleatoric';
import { Score, Part, OscillatorSynth, AleatoricAudio } from 'aleatoric-web';

const audio = new AleatoricAudio();
const synth = new OscillatorSynth({ waveform: 'triangle' });

const score = new Score({ title: 'Study No. 1', tempo: 120, timeSignature: [4, 4] });

const melodyPart = new Part({
  name: 'melody',
  instrument: synth,
  measures: 16,
  generator: (beats) => generateRandomPitches({
    count: Math.floor(beats * 2),
    scale: Scale.pentatonic('F'),
    rng: new SeededRng(7),
  }),
});

melodyPart.addSection({ name: 'A', measures: 8 });
melodyPart.addSection({ name: 'B', measures: 8 });
score.addPart(melodyPart);

await audio.resume();
const player = score.createPartPlayer(melodyPart, audio);
player.play();
```

### Web MIDI output (send to Ableton / DAW)

```ts
import { generateRandomPitches, MidiPlayer, Scale, SeededRng, Timeline } from 'aleatoric';
import { WebMidiOutput } from 'aleatoric-web';

// Connect to a MIDI port (e.g. IAC Driver on macOS, loopMIDI on Windows)
const output = await WebMidiOutput.connect('IAC Driver');

const events = generateRandomPitches({
  count: 32, scale: Scale.minor('A'), low: 48, high: 84, rng: new SeededRng(42),
});

const player = new MidiPlayer(output, new Timeline(events), { bpm: 130, loop: true });
player.play();
```

## API Overview

### `audio/`

| Export | Description |
|---|---|
| `AleatoricAudio` | Manages `AudioContext`, master gain, and effects bus |
| `OscillatorSynth` | Web Audio oscillator with ADSR and optional filter |
| `FMSynth` | Frequency modulation synth with carrier + modulator |
| `SamplePlayer` | Multi-sample instrument with pitch-shifting and ADSR |
| `createDelay` / `createReverb` / `createFilter` / `createDistortion` | Effect factory functions |
| `chainEffects` | Connect an array of effects in series |

### `scheduler/`

| Export | Description |
|---|---|
| `Player` | Lookahead real-time scheduler. `play()`, `pause()`, `stop()`, `seek()`, tempo changes |

### `composition/`

| Export | Description |
|---|---|
| `Section` | Time-bounded region with optional time signature override |
| `Part` | Single voice/instrument line with a generator function and optional sections |
| `Score` | Top-level container. `renderTimeline()`, `renderPartTimelines()`, `createPlayers()` |

### `midi/`

| Export | Description |
|---|---|
| `WebMidiOutput` | Browser MIDI output via the [Web MIDI API](https://developer.mozilla.org/en-US/docs/Web/API/Web_MIDI_API). `listOutputs()`, `connect(portName?)`, `send()`, `close()` |
| `MidiPlayer` | Re-exported from `aleatoric` — runtime-agnostic lookahead MIDI scheduler |

### Preview API

| Export | Description |
|---|---|
| `previewPlay` / `previewStop` | Quick play/stop for prototyping |
| `warmAudioContext` / `ensureAudioReady` | Handle browser autoplay policy |

## Browser compatibility

Requires the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API), available in all modern browsers. Will not work in Node.js without a polyfill.

## Docs development

From the **monorepo root** (recommended):

```bash
npm run docs:dev -w aleatoric-web      # Vite dev server
npm run docs:build -w aleatoric-web    # Static build
npm run docs:preview -w aleatoric-web  # Preview the build
```

From **`packages/aleatoric-web`**:

```bash
npm run docs:dev
npm run docs:build
npm run docs:preview
```

## License

[MIT](../../LICENSE) © Collin Klippel
