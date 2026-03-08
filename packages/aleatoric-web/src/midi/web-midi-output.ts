import type { MidiOutput } from 'aleatoric';

/**
 * Browser MIDI output backed by the Web MIDI API.
 *
 * Timestamps passed to `send()` are forwarded directly to the underlying
 * `MIDIOutput.send()` as DOMHighResTimeStamp (milliseconds from
 * `performance.timeOrigin`), enabling sample-accurate scheduling.
 */
export class WebMidiOutput implements MidiOutput {
  private port: MIDIOutput;

  private constructor(port: MIDIOutput) {
    this.port = port;
  }

  get name(): string {
    return this.port.name ?? 'Unknown MIDI Output';
  }

  send(data: number[], timestamp?: number): void {
    this.port.send(data, timestamp);
  }

  close(): void {
    this.port.close();
  }

  /**
   * Request Web MIDI access and return all available output ports.
   * Throws if the browser denies permission or does not support Web MIDI.
   */
  static async listOutputs(): Promise<WebMidiOutput[]> {
    const access = await navigator.requestMIDIAccess();
    const outputs: WebMidiOutput[] = [];
    access.outputs.forEach((port) => {
      outputs.push(new WebMidiOutput(port));
    });
    return outputs;
  }

  /**
   * Connect to the first output whose name contains `portName` (case-insensitive).
   * If `portName` is omitted, connects to the first available output.
   */
  static async connect(portName?: string): Promise<WebMidiOutput> {
    const outputs = await WebMidiOutput.listOutputs();

    if (outputs.length === 0) {
      throw new Error('No MIDI outputs available');
    }

    if (!portName) return outputs[0];

    const needle = portName.toLowerCase();
    const match = outputs.find((o) => o.name.toLowerCase().includes(needle));
    if (!match) {
      const available = outputs.map((o) => o.name).join(', ');
      throw new Error(
        `No MIDI output matching "${portName}". Available: ${available}`,
      );
    }
    return match;
  }
}
