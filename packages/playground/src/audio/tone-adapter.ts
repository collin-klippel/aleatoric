import type { ScheduledSynthesisNote, SynthesisAdapter } from 'aleatoric';
import * as Tone from 'tone';

export type BasicOscType = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface SynthEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface SynthSoundOptions {
  envelope: SynthEnvelope;
  oscillatorType: BasicOscType;
  reverbDecaySec: number;
}

export interface ChorusEffectOptions {
  /** Wet/dry (0 = dry). */
  wet: number;
  /** LFO rate in Hz. */
  frequency: number;
  /** Modulation depth 0–1. */
  depth: number;
  /** Base delay in ms (typical chorus range ~2–20). */
  delayTimeMs: number;
}

export interface DelayEffectOptions {
  wet: number;
  delayTimeSec: number;
  feedback: number;
}

export interface EffectsOptions {
  chorus: ChorusEffectOptions;
  delay: DelayEffectOptions;
}

export function defaultSynthSoundOptions(): SynthSoundOptions {
  return {
    envelope: { attack: 0.02, decay: 0.1, sustain: 0.5, release: 0.8 },
    oscillatorType: 'triangle',
    reverbDecaySec: 1.5,
  };
}

export function defaultEffectsOptions(): EffectsOptions {
  return {
    chorus: {
      wet: 0,
      frequency: 1.5,
      depth: 0.7,
      delayTimeMs: 3.5,
    },
    delay: {
      wet: 0,
      delayTimeSec: 0.25,
      feedback: 0.35,
    },
  };
}

export function mergeSynthSound(
  base: SynthSoundOptions,
  partial: Partial<SynthSoundOptions>,
): SynthSoundOptions {
  return {
    ...base,
    ...partial,
    envelope: partial.envelope
      ? { ...base.envelope, ...partial.envelope }
      : base.envelope,
  };
}

export function mergeEffectsOptions(
  base: EffectsOptions,
  partial: Partial<{
    chorus: Partial<ChorusEffectOptions>;
    delay: Partial<DelayEffectOptions>;
  }>,
): EffectsOptions {
  return {
    chorus: partial.chorus
      ? { ...base.chorus, ...partial.chorus }
      : base.chorus,
    delay: partial.delay ? { ...base.delay, ...partial.delay } : base.delay,
  };
}

function buildBasicPolySynth(sound: SynthSoundOptions): Tone.PolySynth {
  const env = sound.envelope;
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: sound.oscillatorType },
    envelope: { ...env },
  });
}

function voiceSetPayload(sound: SynthSoundOptions): Record<string, unknown> {
  const env = sound.envelope;
  return {
    envelope: { ...env },
    oscillator: { type: sound.oscillatorType },
  };
}

/**
 * Bridges aleatoric's SynthesisAdapter interface to a Tone.js PolySynth.
 *
 * Signal path: synth → chorus → feedbackDelay → reverb → analyser → destination.
 * Chorus LFOs are started from {@link ToneAdapter.startLfoEffects} after the
 * AudioContext is running (call from the same user gesture as Tone.start()).
 *
 * The SynthesisScheduler passes absolute audio-clock seconds for start times
 * (from `getAudioTime`). Since we use `Tone.now()` as the audio clock source,
 * startTimeSec values are on the same Tone time axis and can be passed directly
 * to triggerAttackRelease's `time` parameter.
 */
export class ToneAdapter implements SynthesisAdapter {
  private synth: Tone.PolySynth;
  private chorus: Tone.Chorus;
  private feedbackDelay: Tone.FeedbackDelay;
  private reverb: Tone.Reverb;
  private _scopeAnalyser: Tone.Analyser;
  private sound: SynthSoundOptions;
  private effects: EffectsOptions;
  private chorusLfoStarted = false;

  constructor(
    sound?: Partial<SynthSoundOptions>,
    reverbWet = 0.15,
    effects?: Partial<{
      chorus: Partial<ChorusEffectOptions>;
      delay: Partial<DelayEffectOptions>;
    }>,
  ) {
    this.sound = mergeSynthSound(defaultSynthSoundOptions(), sound ?? {});
    this.effects = mergeEffectsOptions(defaultEffectsOptions(), effects ?? {});

    const ch = this.effects.chorus;
    const dl = this.effects.delay;

    this.reverb = new Tone.Reverb({
      decay: this.sound.reverbDecaySec,
      wet: reverbWet,
    });

    this._scopeAnalyser = new Tone.Analyser({
      type: 'waveform',
      size: 1024,
      smoothing: 0,
    });
    this.reverb.connect(this._scopeAnalyser);
    this._scopeAnalyser.toDestination();

    this.feedbackDelay = new Tone.FeedbackDelay({
      delayTime: dl.delayTimeSec,
      feedback: dl.feedback,
      wet: dl.wet,
      maxDelay: 4,
    });

    this.chorus = new Tone.Chorus({
      frequency: ch.frequency,
      delayTime: ch.delayTimeMs,
      depth: ch.depth,
      wet: ch.wet,
    });

    this.synth = buildBasicPolySynth(this.sound);
    this.synth.disconnect();
    // synth → chorus → delay → reverb → analyser → out
    this.synth.connect(this.chorus);
    this.chorus.connect(this.feedbackDelay);
    this.feedbackDelay.connect(this.reverb);
  }

  /** Waveform analyser on the post-FX bus (same signal sent to the speakers). */
  get scopeAnalyser(): Tone.Analyser {
    return this._scopeAnalyser;
  }

  /** Start chorus modulation; safe to call repeatedly. Invoke after `Tone.start()`. */
  startLfoEffects(): void {
    if (this.chorusLfoStarted) return;
    this.chorus.start();
    this.chorusLfoStarted = true;
  }

  schedule(note: ScheduledSynthesisNote): void {
    this.synth.triggerAttackRelease(
      note.frequencyHz,
      note.durationSec,
      note.startTimeSec,
      note.velocity / 127,
    );
  }

  cancelAll(): void {
    this.synth.releaseAll();
  }

  applySoundOptions(partial: Partial<SynthSoundOptions>): void {
    this.sound = mergeSynthSound(this.sound, partial);
    this.synth.set(
      voiceSetPayload(this.sound) as Parameters<Tone.PolySynth['set']>[0],
    );
  }

  applyEffectsOptions(
    partial: Partial<{
      chorus: Partial<ChorusEffectOptions>;
      delay: Partial<DelayEffectOptions>;
    }>,
  ): void {
    this.effects = mergeEffectsOptions(this.effects, partial);
    const ch = this.effects.chorus;
    const dl = this.effects.delay;

    if (partial.chorus) {
      this.chorus.wet.value = ch.wet;
      this.chorus.frequency.value = ch.frequency;
      this.chorus.depth = ch.depth;
      this.chorus.delayTime = ch.delayTimeMs;
    }
    if (partial.delay) {
      this.feedbackDelay.wet.value = dl.wet;
      this.feedbackDelay.delayTime.value = dl.delayTimeSec;
      this.feedbackDelay.feedback.value = dl.feedback;
    }
  }

  setReverb(wet: number): void {
    this.reverb.wet.value = wet;
  }

  async setReverbDecay(sec: number): Promise<void> {
    this.sound.reverbDecaySec = sec;
    this.reverb.decay = sec;
    await this.reverb.ready;
  }

  dispose(): void {
    this.synth.dispose();
    this.chorus.dispose();
    this.feedbackDelay.dispose();
    this.reverb.dispose();
    this._scopeAnalyser.dispose();
  }
}
