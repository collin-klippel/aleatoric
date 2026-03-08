import { parseArgs } from 'node:util';
import {
  allNotesOff,
  generateAmbientTimeline,
  generateCellularAutomata,
  generateRandomPitches,
  type MidiChannel,
  MidiPlayer,
  SCALE_TYPE_NAMES,
  Scale,
  Timeline,
} from 'aleatoric';
import { NodeMidiOutput } from './node-midi-output.js';

const GENERATORS = ['random-pitch', 'cellular-automata', 'ambient'] as const;
type GeneratorName = (typeof GENERATORS)[number];

function printUsage(): void {
  console.log(
    `
Usage: aleatoric-midi [options]

Options:
  --help                 Show this help message
  --list-ports           List available MIDI output ports
  --port <name>          MIDI output port name, or "virtual" to create one (default: virtual)
  --generator <name>     Generator: ${GENERATORS.join(' | ')} (default: random-pitch)
  --bpm <number>         Tempo in BPM (default: 120)
  --scale <root> <type>  Scale constraint, e.g. --scale C minor
                         Types: ${SCALE_TYPE_NAMES.join(', ')}
  --low <midi>           Lowest MIDI note (default: 48)
  --high <midi>          Highest MIDI note (default: 84)
  --count <number>       Number of events to generate (default: 16)
  --loop                 Loop playback indefinitely
  --channel <0-15>       MIDI channel (default: 0)
  --duration <beats>     Note duration in beats (default: 1)
  --velocity <0-127>     Note velocity (default: 80)
`.trim(),
  );
}

interface CliOptions {
  help: boolean;
  listPorts: boolean;
  port: string;
  generator: GeneratorName;
  bpm: number;
  scaleRoot: string | undefined;
  scaleType: string | undefined;
  low: number;
  high: number;
  count: number;
  loop: boolean;
  channel: MidiChannel;
  duration: number;
  velocity: number;
}

function parseCliArgs(argv: string[]): CliOptions {
  const { values, positionals } = parseArgs({
    args: argv,
    options: {
      help: { type: 'boolean', default: false },
      'list-ports': { type: 'boolean', default: false },
      port: { type: 'string', default: 'virtual' },
      generator: { type: 'string', default: 'random-pitch' },
      bpm: { type: 'string', default: '120' },
      scale: { type: 'string' },
      low: { type: 'string', default: '48' },
      high: { type: 'string', default: '84' },
      count: { type: 'string', default: '16' },
      loop: { type: 'boolean', default: false },
      channel: { type: 'string', default: '0' },
      duration: { type: 'string', default: '1' },
      velocity: { type: 'string', default: '80' },
    },
    allowPositionals: true,
    strict: true,
  });

  const generator = values.generator as string;
  if (!GENERATORS.includes(generator as GeneratorName)) {
    throw new Error(
      `Unknown generator "${generator}". Choose from: ${GENERATORS.join(', ')}`,
    );
  }

  const channel = Number(values.channel);
  if (channel < 0 || channel > 15 || !Number.isInteger(channel)) {
    throw new Error('Channel must be an integer 0-15');
  }

  let scaleRoot: string | undefined;
  let scaleType: string | undefined;
  if (values.scale) {
    scaleRoot = values.scale;
    scaleType = positionals[0];
    if (!scaleType) {
      throw new Error(
        'Scale requires both root and type, e.g. --scale C minor',
      );
    }
  }

  return {
    help: values.help as boolean,
    listPorts: values['list-ports'] as boolean,
    port: values.port as string,
    generator: generator as GeneratorName,
    bpm: Number(values.bpm),
    scaleRoot,
    scaleType,
    low: Number(values.low),
    high: Number(values.high),
    count: Number(values.count),
    loop: values.loop as boolean,
    channel: channel as MidiChannel,
    duration: Number(values.duration),
    velocity: Number(values.velocity),
  };
}

function buildTimeline(opts: CliOptions): Timeline {
  const scale =
    opts.scaleRoot && opts.scaleType
      ? Scale.create(opts.scaleRoot, opts.scaleType)
      : undefined;

  switch (opts.generator) {
    case 'random-pitch': {
      const events = generateRandomPitches({
        count: opts.count,
        low: opts.low,
        high: opts.high,
        scale,
        duration: opts.duration,
        velocity: opts.velocity,
      });
      return new Timeline(events);
    }
    case 'cellular-automata': {
      const events = generateCellularAutomata({
        steps: opts.count,
        width: 8,
        scale,
        stepDuration: opts.duration,
        velocity: opts.velocity,
      });
      return new Timeline(events);
    }
    case 'ambient': {
      return generateAmbientTimeline({
        low: opts.low,
        high: opts.high,
        scale: scale ?? Scale.create('C', 'major'),
        bpm: opts.bpm,
        totalDuration: (opts.count * opts.duration * 60) / opts.bpm,
      });
    }
  }
}

export function main(argv: string[] = process.argv.slice(2)): void {
  let opts: CliOptions;
  try {
    opts = parseCliArgs(argv);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    printUsage();
    process.exitCode = 1;
    return;
  }

  if (opts.help) {
    printUsage();
    return;
  }

  if (opts.listPorts) {
    const ports = NodeMidiOutput.listPorts();
    if (ports.length === 0) {
      console.log('No MIDI output ports found.');
    } else {
      console.log('Available MIDI output ports:');
      for (const p of ports) console.log(`  ${p}`);
    }
    return;
  }

  const output =
    opts.port === 'virtual'
      ? NodeMidiOutput.openVirtual('aleatoric')
      : NodeMidiOutput.connect(opts.port);

  console.log(`MIDI output: ${output.name}`);
  console.log(
    `Generator: ${opts.generator} | BPM: ${opts.bpm} | Channel: ${opts.channel} | Loop: ${opts.loop}`,
  );

  const timeline = buildTimeline(opts);
  console.log(
    `Timeline: ${timeline.length} events, ${timeline.duration.toFixed(1)} beats`,
  );

  const player = new MidiPlayer(output, timeline, {
    bpm: opts.bpm,
    channel: opts.channel,
    loop: opts.loop,
    deferSend: true,
  });

  player.on('end', () => {
    console.log('Playback complete.');
    cleanup();
  });

  function cleanup(): void {
    player.stop();
    output.send(allNotesOff(opts.channel));
    output.close();
    process.exit(0);
  }

  process.on('SIGINT', () => {
    console.log('\nStopping...');
    cleanup();
  });
  process.on('SIGTERM', cleanup);

  console.log('Playing... (Ctrl+C to stop)');
  player.play();
}
