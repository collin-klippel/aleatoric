# aleatoric

A TypeScript toolkit for algorithmic and chance-based music composition — chance operations, stochastic processes, and indeterminate composition in the tradition of John Cage, Iannis Xenakis, and Karlheinz Stockhausen.

## Packages

| Package | Description |
|---|---|
| [`aleatoric`](./packages/aleatoric) | Core music primitives, chance engine, generators, and MIDI player — runs anywhere (Node.js, browser, edge) |
| [`aleatoric-web`](./packages/aleatoric-web) | Web Audio synths, effects, playback scheduler, composition layer, and interactive docs |
| [`aleatoric-midi`](./packages/aleatoric-midi) | Node.js MIDI output and CLI — send generative music to hardware synths and DAWs |

## Install

```bash
npm install aleatoric            # core (zero dependencies)
npm install aleatoric-web        # web audio + playback (depends on aleatoric)
npm install aleatoric-midi       # Node.js MIDI output + CLI (depends on aleatoric)
```

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

```ts
import { AleatoricAudio, OscillatorSynth, Player, Timeline } from 'aleatoric-web';

const audio = new AleatoricAudio();
const synth = new OscillatorSynth({ waveform: 'sine' });
const player = new Player(audio.context, new Timeline(events), synth, audio.destination, { bpm: 120 });

await audio.resume();
player.play();
```

### MIDI output (Node.js CLI)

```bash
npx aleatoric-midi --port virtual --generator random-pitch --scale C minor --bpm 140 --loop
```

### MIDI output (browser)

```ts
import { generateRandomPitches, MidiPlayer, Scale, SeededRng, Timeline } from 'aleatoric';
import { WebMidiOutput } from 'aleatoric-web';

const output = await WebMidiOutput.connect('IAC Driver');
const player = new MidiPlayer(output, new Timeline(events), { bpm: 120 });
player.play();
```

See each package README for full API documentation.

## Development

**Node.js 20+** is required (same major versions as [CI](.github/workflows/ci.yml)). See [CONTRIBUTING.md](./CONTRIBUTING.md) for clone-to-PR workflow, npm vs pnpm, docs commands, and the full script reference.

## License

[MIT](./LICENSE) © Collin Klippel
