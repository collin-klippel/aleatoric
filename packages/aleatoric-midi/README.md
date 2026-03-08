# aleatoric-midi

Node.js MIDI output and CLI for [aleatoric](../aleatoric) — send generative music to hardware synths and DAWs like Ableton Live.

[![npm version](https://img.shields.io/npm/v/aleatoric-midi.svg)](https://www.npmjs.com/package/aleatoric-midi)
[![license](https://img.shields.io/npm/l/aleatoric-midi.svg)](../../LICENSE)

## Features

- **Node.js MIDI output** — `NodeMidiOutput` backed by [RtMidi](https://www.music.mcgill.ca/~gary/rtmidi/) via [easymidi](https://www.npmjs.com/package/easymidi)
- **Virtual ports** — create a virtual MIDI port visible to other applications (macOS/Linux)
- **CLI** — generate and stream MIDI from the command line with a single command
- **Generators** — random pitch, cellular automata, and ambient timeline (more coming)
- **DAW integration** — works with Ableton Live, Logic Pro, Bitwig, and any DAW that accepts MIDI input

## Install

```bash
npm install aleatoric aleatoric-midi
```

`aleatoric` is a peer dependency — install it alongside `aleatoric-midi`.

For CLI-only usage you can also run directly with `npx`:

```bash
npx aleatoric-midi --help
```

## Quick Start

### CLI

```bash
# Create a virtual MIDI port and stream random notes in C minor at 140 BPM
aleatoric-midi --port virtual --generator random-pitch --scale C minor --bpm 140 --loop

# List available MIDI output ports on your system
aleatoric-midi --list-ports

# Use cellular automata with Wolfram rule 30
aleatoric-midi --generator cellular-automata --count 32 --scale D dorian --bpm 120 --loop

# Generate an ambient timeline
aleatoric-midi --generator ambient --scale C pentatonic --bpm 20 --count 64 --loop
```

### Programmatic API

```ts
import { generateRandomPitches, MidiPlayer, Scale, SeededRng, Timeline } from 'aleatoric';
import { NodeMidiOutput } from 'aleatoric-midi';

// Create a virtual MIDI port named "aleatoric"
const output = NodeMidiOutput.openVirtual('aleatoric');

const events = generateRandomPitches({
  count: 32,
  scale: Scale.pentatonic('C'),
  low: 48,
  high: 84,
  rng: new SeededRng(42),
});

const player = new MidiPlayer(output, new Timeline(events), {
  bpm: 120,
  channel: 0,
  loop: true,
  deferSend: true,
});

player.play();

// Later...
player.stop();
output.close();
```

## CLI Reference

```
Usage: aleatoric-midi [options]

Options:
  --help                 Show help message
  --list-ports           List available MIDI output ports
  --port <name>          MIDI output port name, or "virtual" to create one (default: virtual)
  --generator <name>     Generator: random-pitch | cellular-automata | ambient (default: random-pitch)
  --bpm <number>         Tempo in BPM (default: 120)
  --scale <root> <type>  Scale constraint, e.g. --scale C minor
                         Types: major, minor, harmonicMinor, melodicMinor, pentatonic,
                         minorPentatonic, blues, chromatic, wholeTone, octatonic,
                         dorian, phrygian, lydian, mixolydian, aeolian, locrian
  --low <midi>           Lowest MIDI note (default: 48)
  --high <midi>          Highest MIDI note (default: 84)
  --count <number>       Number of events to generate (default: 16)
  --loop                 Loop playback indefinitely
  --channel <0-15>       MIDI channel (default: 0)
  --duration <beats>     Note duration in beats (default: 1)
  --velocity <0-127>     Note velocity (default: 80)
```

Press `Ctrl+C` to stop playback. The CLI sends an all-notes-off message on exit to silence any hanging notes.

## API Overview

| Export | Description |
|---|---|
| `NodeMidiOutput` | Node.js MIDI output backed by easymidi. `listPorts()`, `openVirtual(name)`, `connect(portName)` |
| `MidiPlayer` | Re-exported from `aleatoric` — lookahead MIDI scheduler with play/pause/stop/seek/loop |
| `noteOn` / `noteOff` | Re-exported — encode MIDI note messages as byte arrays |
| `controlChange` / `allNotesOff` | Re-exported — encode CC and all-notes-off messages |

## Using with Ableton Live

### macOS (IAC Driver)

1. Open **Audio MIDI Setup** (in `/Applications/Utilities/`)
2. Go to **Window > Show MIDI Studio**
3. Double-click **IAC Driver** and check **Device is online**
4. Run `aleatoric-midi --port virtual --generator random-pitch --loop`
5. In Ableton, set a MIDI track's input to **aleatoric** (the virtual port)
6. Arm the track — notes appear in real-time

### Windows (loopMIDI)

1. Install [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html)
2. Create a virtual port (e.g. "loopMIDI Port")
3. Run `aleatoric-midi --port "loopMIDI Port" --generator random-pitch --loop`
4. In Ableton, set a MIDI track's input to the loopMIDI port
5. Arm the track — notes appear in real-time

### Linux (ALSA)

Virtual ports are created automatically. Run the CLI with `--port virtual` and connect using `aconnect` or your DAW's MIDI settings.

## Platform requirements

Requires **Node.js 20+** and a C++ toolchain for the native [RtMidi](https://www.music.mcgill.ca/~gary/rtmidi/) bindings (installed via easymidi). On macOS this is provided by Xcode Command Line Tools; on Linux, install `build-essential` and `libasound2-dev`.

## License

[MIT](../../LICENSE) © Collin Klippel
