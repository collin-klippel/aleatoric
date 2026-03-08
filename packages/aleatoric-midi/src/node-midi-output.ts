import type { MidiOutput } from 'aleatoric';
import * as easymidi from 'easymidi';

type EasymidiChannel = easymidi.Channel;

/**
 * Node.js MIDI output backed by easymidi (RtMidi).
 *
 * Translates raw MIDI byte arrays from the `MidiOutput` interface into
 * easymidi's structured event calls. The `timestamp` parameter is ignored
 * because easymidi sends immediately — use `MidiPlayer` with
 * `deferSend: true` for proper scheduling.
 */
export class NodeMidiOutput implements MidiOutput {
  private port: easymidi.Output;

  private constructor(port: easymidi.Output) {
    this.port = port;
  }

  get name(): string {
    return this.port.name;
  }

  send(data: number[], _timestamp?: number): void {
    if (data.length < 1) return;

    const status = data[0] & 0xf0;
    const channel = (data[0] & 0x0f) as EasymidiChannel;

    switch (status) {
      case 0x90: {
        const velocity = data[2] ?? 0;
        if (velocity === 0) {
          this.port.send('noteoff', {
            note: data[1],
            velocity: 0,
            channel,
          });
        } else {
          this.port.send('noteon', {
            note: data[1],
            velocity,
            channel,
          });
        }
        break;
      }
      case 0x80:
        this.port.send('noteoff', {
          note: data[1],
          velocity: data[2] ?? 0,
          channel,
        });
        break;
      case 0xb0:
        this.port.send('cc', {
          controller: data[1],
          value: data[2] ?? 0,
          channel,
        });
        break;
    }
  }

  close(): void {
    this.port.close();
  }

  /** List names of all available MIDI output ports on this system. */
  static listPorts(): string[] {
    return easymidi.getOutputs();
  }

  /**
   * Create a virtual MIDI port visible to other applications (macOS/Linux).
   * On macOS this appears in Audio MIDI Setup; Ableton can select it as input.
   */
  static openVirtual(name: string = 'aleatoric'): NodeMidiOutput {
    return new NodeMidiOutput(new easymidi.Output(name, true));
  }

  /** Connect to an existing MIDI output port by name. */
  static connect(portName: string): NodeMidiOutput {
    const available = NodeMidiOutput.listPorts();
    if (!available.includes(portName)) {
      throw new Error(
        `MIDI output "${portName}" not found. Available: ${available.join(', ') || '(none)'}`,
      );
    }
    return new NodeMidiOutput(new easymidi.Output(portName));
  }
}
