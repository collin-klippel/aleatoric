import { beatsToSeconds, effectiveDuration, type MusicEvent } from 'aleatoric';
import { applyEnvelope, totalEnvelopeDuration } from './envelope.js';
import { DEFAULT_ENVELOPE, EnvelopeParams, Instrument } from './types.js';

export interface SampleMapping {
  /** The AudioBuffer for this sample */
  buffer: AudioBuffer;
  /** The MIDI note this sample was recorded at */
  rootNote: number;
  /** MIDI range this sample covers [low, high] inclusive */
  range: [number, number];
}

export interface SamplePlayerOptions {
  /** Array of sample mappings covering different pitch ranges */
  samples: SampleMapping[];
  envelope?: EnvelopeParams;
}

export class SamplePlayer implements Instrument {
  private readonly samples: SampleMapping[];
  private readonly envelope: EnvelopeParams;

  constructor(options: SamplePlayerOptions) {
    this.samples = options.samples;
    this.envelope = options.envelope ?? DEFAULT_ENVELOPE;
  }

  /**
   * Load a single sample from a URL, mapping it to a pitch range.
   */
  static async loadSample(
    audioContext: AudioContext,
    url: string,
    rootNote: number,
    range: [number, number],
  ): Promise<SampleMapping> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `Failed to load sample "${url}": ${response.status} ${response.statusText}`,
      );
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await audioContext.decodeAudioData(arrayBuffer);
    return { buffer, rootNote, range };
  }

  /**
   * Load multiple samples from URLs.
   */
  static async loadSamples(
    audioContext: AudioContext,
    definitions: { url: string; rootNote: number; range: [number, number] }[],
  ): Promise<SampleMapping[]> {
    return Promise.all(
      definitions.map((d) =>
        SamplePlayer.loadSample(audioContext, d.url, d.rootNote, d.range),
      ),
    );
  }

  play(
    event: MusicEvent,
    audioContext: AudioContext,
    destination: AudioNode,
    time: number,
    bpm: number = 120,
  ): void {
    if (event.isRest) return;

    const sample = this.findSample(event.midi);
    if (!sample) return;

    const durationBeats = effectiveDuration(event.duration);
    const durationSec = beatsToSeconds(durationBeats, bpm);

    const source = audioContext.createBufferSource();
    source.buffer = sample.buffer;

    // Pitch-shift by adjusting playback rate
    const semitoneDiff = event.midi - sample.rootNote;
    source.playbackRate.setValueAtTime(2 ** (semitoneDiff / 12), time);

    const gainNode = audioContext.createGain();
    applyEnvelope(gainNode.gain, time, durationSec, this.envelope);

    // Velocity scaling
    const velocityGain = audioContext.createGain();
    velocityGain.gain.setValueAtTime(event.velocity / 127, time);

    source.connect(gainNode);
    gainNode.connect(velocityGain);
    velocityGain.connect(destination);

    const stopTime = time + totalEnvelopeDuration(durationSec, this.envelope);
    source.start(time);
    source.stop(stopTime);
  }

  private findSample(midi: number): SampleMapping | undefined {
    return this.samples.find((s) => midi >= s.range[0] && midi <= s.range[1]);
  }
}
