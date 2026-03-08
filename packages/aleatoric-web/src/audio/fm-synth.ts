import { beatsToSeconds, effectiveDuration, type MusicEvent } from 'aleatoric';
import { applyEnvelope, totalEnvelopeDuration } from './envelope.js';
import { DEFAULT_ENVELOPE, EnvelopeParams, Instrument } from './types.js';

export interface FMSynthOptions {
  /** Carrier waveform (default 'sine') */
  carrierWaveform?: OscillatorType;
  /** Modulator waveform (default 'sine') */
  modulatorWaveform?: OscillatorType;
  /**
   * Ratio of modulator frequency to carrier frequency.
   * Integer ratios produce harmonic timbres; non-integer produce inharmonic/metallic sounds.
   */
  modulationRatio?: number;
  /**
   * Modulation index (depth). Higher = more overtones.
   * Typical range: 0-20.
   */
  modulationIndex?: number;
  /** ADSR for carrier amplitude */
  carrierEnvelope?: EnvelopeParams;
  /** ADSR for modulation depth */
  modulatorEnvelope?: EnvelopeParams;
}

export class FMSynth implements Instrument {
  private readonly carrierWaveform: OscillatorType;
  private readonly modulatorWaveform: OscillatorType;
  private readonly modulationRatio: number;
  private readonly modulationIndex: number;
  private readonly carrierEnvelope: EnvelopeParams;
  private readonly modulatorEnvelope: EnvelopeParams;

  constructor(options: FMSynthOptions = {}) {
    this.carrierWaveform = options.carrierWaveform ?? 'sine';
    this.modulatorWaveform = options.modulatorWaveform ?? 'sine';
    this.modulationRatio = options.modulationRatio ?? 2;
    this.modulationIndex = options.modulationIndex ?? 5;
    this.carrierEnvelope = options.carrierEnvelope ?? DEFAULT_ENVELOPE;
    this.modulatorEnvelope = options.modulatorEnvelope ?? {
      attack: 0.01,
      decay: 0.2,
      sustain: 0.5,
      release: 0.3,
    };
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
    const carrierFreq = event.frequency;
    const modulatorFreq = carrierFreq * this.modulationRatio;

    // Modulation depth in Hz
    const modDepth = modulatorFreq * this.modulationIndex;

    // Modulator oscillator -> modGain (depth envelope) -> carrier.frequency
    const modOsc = audioContext.createOscillator();
    modOsc.type = this.modulatorWaveform;
    modOsc.frequency.setValueAtTime(modulatorFreq, time);

    const modGain = audioContext.createGain();
    modGain.gain.setValueAtTime(0, time);
    applyEnvelope(modGain.gain, time, durationSec, this.modulatorEnvelope);
    // Scale the envelope (0-1) to the modulation depth
    const modEnvScale = audioContext.createGain();
    modEnvScale.gain.setValueAtTime(modDepth, time);

    modOsc.connect(modGain);
    modGain.connect(modEnvScale);

    // Carrier oscillator
    const carrier = audioContext.createOscillator();
    carrier.type = this.carrierWaveform;
    carrier.frequency.setValueAtTime(carrierFreq, time);
    modEnvScale.connect(carrier.frequency);

    // Carrier amplitude envelope
    const carrierGain = audioContext.createGain();
    applyEnvelope(carrierGain.gain, time, durationSec, this.carrierEnvelope);

    carrier.connect(carrierGain);

    // Velocity scaling
    const velocityGain = audioContext.createGain();
    velocityGain.gain.setValueAtTime(event.velocity / 127, time);
    carrierGain.connect(velocityGain);
    velocityGain.connect(destination);

    const stopTime =
      time + totalEnvelopeDuration(durationSec, this.carrierEnvelope);
    modOsc.start(time);
    modOsc.stop(stopTime);
    carrier.start(time);
    carrier.stop(stopTime);
  }
}
