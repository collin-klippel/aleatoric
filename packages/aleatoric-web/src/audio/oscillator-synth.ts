import {
  beatsToSeconds,
  effectiveDuration,
  type MusicEvent,
  uniform,
} from 'aleatoric';
import { applyEnvelope, totalEnvelopeDuration } from './envelope.js';
import { DEFAULT_ENVELOPE, EnvelopeParams, Instrument } from './types.js';

export interface OscillatorSynthOptions {
  waveform?: OscillatorType;
  envelope?: EnvelopeParams;
  detune?: number;
  /** Filter cutoff frequency in Hz (0 = no filter) */
  filterFrequency?: number;
  filterType?: BiquadFilterType;
  /**
   * Spawn two oscillators detuned ±cents for a chorus/unison effect.
   * When set, creates two oscillators at -detuneAmount and +detuneAmount cents.
   * Supersedes the `detune` option.
   */
  detuneAmount?: number;
  /**
   * Stereo pan position (-1 to 1), or 'random' for per-note random panning
   * uniformly distributed in [-0.7, 0.7].
   */
  pan?: number | 'random';
}

export class OscillatorSynth implements Instrument {
  private readonly waveform: OscillatorType;
  private readonly envelope: EnvelopeParams;
  private readonly detune: number;
  private readonly filterFrequency: number;
  private readonly filterType: BiquadFilterType;
  private readonly detuneAmount: number;
  private readonly pan: number | 'random' | undefined;

  constructor(options: OscillatorSynthOptions = {}) {
    this.waveform = options.waveform ?? 'sine';
    this.envelope = options.envelope ?? DEFAULT_ENVELOPE;
    this.detune = options.detune ?? 0;
    this.filterFrequency = options.filterFrequency ?? 0;
    this.filterType = options.filterType ?? 'lowpass';
    this.detuneAmount = options.detuneAmount ?? 0;
    this.pan = options.pan;
  }

  play(
    event: MusicEvent,
    audioContext: AudioContext,
    destination: AudioNode,
    time: number,
    bpm: number = 120,
  ): void {
    if (event.isRest) return;

    const durationBeats = effectiveDuration(event.duration);
    const durationSec = beatsToSeconds(durationBeats, bpm);

    const gainNode = audioContext.createGain();
    applyEnvelope(gainNode.gain, time, durationSec, this.envelope);

    const stopTime = time + totalEnvelopeDuration(durationSec, this.envelope);

    // When detuneAmount is set, spawn two oscillators at ±detuneAmount cents.
    // Otherwise use a single oscillator with the `detune` offset (default 0).
    const detuneValues =
      this.detuneAmount > 0
        ? [-this.detuneAmount, this.detuneAmount]
        : [this.detune];

    for (const detuneValue of detuneValues) {
      const osc = audioContext.createOscillator();
      osc.type = this.waveform;
      osc.frequency.setValueAtTime(event.frequency, time);
      if (detuneValue !== 0) osc.detune.setValueAtTime(detuneValue, time);

      if (this.filterFrequency > 0) {
        const filter = audioContext.createBiquadFilter();
        filter.type = this.filterType;
        filter.frequency.setValueAtTime(this.filterFrequency, time);
        osc.connect(filter);
        filter.connect(gainNode);
      } else {
        osc.connect(gainNode);
      }

      osc.start(time);
      osc.stop(stopTime);
    }

    // Optional stereo panning: fixed value or random per note
    const panValue = this.pan === 'random' ? uniform(-0.7, 0.7) : this.pan;

    if (panValue !== undefined) {
      const panNode = audioContext.createStereoPanner();
      panNode.pan.setValueAtTime(panValue, time);
      gainNode.connect(panNode);
      panNode.connect(destination);
    } else {
      gainNode.connect(destination);
    }
  }
}
