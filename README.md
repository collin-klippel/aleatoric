# aleatoric

A TypeScript toolkit for algorithmic and chance-based music composition — chance operations, stochastic processes, and indeterminate composition in the tradition of John Cage, Iannis Xenakis, and Karlheinz Stockhausen.

## Docs & Playground

- **[Documentation](https://collin-klippel.github.io/aleatoric)** — interactive API reference and examples
- **[Tone playground](https://collin-klippel.github.io/aleatoric/playground/)** — try generators and playback with Tone.js in the browser

## Packages


| Package                                         | Description                                                                                                |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `[aleatoric](./packages/aleatoric)`             | Core music primitives, chance engine, generators, and MIDI player — runs anywhere (Node.js, browser, edge) |
| `[aleatoric-docs](./packages/docs)`             | [Interactive docs site](https://collin-klippel.github.io/aleatoric)                                      |
| `[aleatoric-playground](./packages/playground)` | [Tone.js playground](https://collin-klippel.github.io/aleatoric/playground/) — not published to npm      |


## Install

**Published builds are currently prereleases** (beta). Use:

```bash
npm install aleatoric@beta
# or pin: npm install aleatoric@0.1.0-beta.0
```

See the [core package README](./packages/aleatoric) for details. Include the package version in [issues](https://github.com/collin-klippel/aleatoric/issues). The library has zero runtime dependencies.

## Quick Start

```ts
import { Scale, generateRandomPitches, SeededRng } from 'aleatoric';

const events = generateRandomPitches({
  count: 16,
  scale: Scale.pentatonic('C'),
  low: 48,
  high: 84,
  distribution: 'gaussian',
  rng: new SeededRng(42),
});
```

### MIDI output

The `MidiPlayer` sends `MusicEvent`s as raw MIDI through any object that implements the `MidiOutput` interface. Bring your own transport — Web MIDI API in the browser, [easymidi](https://www.npmjs.com/package/easymidi) in Node.js, or any custom backend.

```ts
import { MidiPlayer, Timeline, type MidiOutput } from 'aleatoric';

// Example: Web MIDI API
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

### Web Audio output

The `SynthesisScheduler` sends `MusicEvent`s to any object that implements the `SynthesisAdapter` interface. This brings the same lookahead pattern as `MidiPlayer`, but calls your synth's scheduling methods at audio-clock times instead of sending MIDI bytes. Bring your own synthesis — native Web Audio API in the browser, [Tone.js](https://tonejs.github.io/) for high-level synths, or any library that supports `AudioContext.currentTime`.

```ts
import { SynthesisScheduler, Timeline, type SynthesisAdapter } from 'aleatoric';

// Example: Native Web Audio API
const ctx = new AudioContext();
const adapter: SynthesisAdapter = {
  schedule(note) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = note.frequencyHz;
    gain.gain.setValueAtTime(note.velocity / 127, note.startTimeSec);
    gain.gain.exponentialRampToValueAtTime(0.001, note.startTimeSec + note.durationSec);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(note.startTimeSec);
    osc.stop(note.startTimeSec + note.durationSec);
  },
};

await ctx.resume();
const scheduler = new SynthesisScheduler(adapter, new Timeline(events), {
  getAudioTime: () => ctx.currentTime,
  bpm: 120, loop: true,
});
scheduler.play();
```

```ts
// Example: Tone.js
import Tone from 'tone';
import { SynthesisScheduler, Timeline, type SynthesisAdapter } from 'aleatoric';

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: 'triangle' },
  envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 },
}).toDestination();

synth.chain(new Tone.Reverb(2)).toDestination();

const adapter: SynthesisAdapter = {
  schedule(note) {
    synth.triggerAttackRelease(
      note.frequencyHz,
      note.durationSec,
      note.startTimeSec,
      note.velocity / 127,
    );
  },
};

await Tone.start();
const scheduler = new SynthesisScheduler(adapter, new Timeline(events), {
  getAudioTime: () => Tone.now(),
  bpm: 120, loop: true,
});
scheduler.play();
```

See the [documentation](https://collin-klippel.github.io/aleatoric) for the full API reference and the [Tone playground](https://collin-klippel.github.io/aleatoric/playground/) for an interactive demo. For local development, run `npm run docs:dev` ([`packages/docs`](./packages/docs)) or `npm run dev -w aleatoric-playground` ([`packages/playground`](./packages/playground)).

## Development

**Node.js 20+** is required (same major versions as [CI](.github/workflows/ci.yml)). From the repo root, `npm run verify` runs the same lint, knip, typecheck, coverage, and docs build steps as CI. For the optional local playground, run `npm run dev -w aleatoric-playground` (Vite default port 5173; stop the docs dev server first if that port is in use). See [CONTRIBUTING.md](./CONTRIBUTING.md) for clone-to-PR workflow, npm vs pnpm, docs commands, and the full script reference.

## License

[MIT](./LICENSE) © Collin Klippel