/**
 * Factory functions for common Web Audio effect nodes.
 * Each returns a pair of [input, output] nodes for chaining.
 */

export interface EffectNode {
  input: AudioNode;
  output: AudioNode;
  dispose(): void;
}

/** Simple delay effect with feedback */
export function createDelay(
  audioContext: AudioContext,
  delayTime: number = 0.3,
  feedback: number = 0.4,
  wetMix: number = 0.3,
): EffectNode {
  const input = audioContext.createGain();
  const output = audioContext.createGain();

  const delay = audioContext.createDelay(5);
  delay.delayTime.value = delayTime;

  const feedbackGain = audioContext.createGain();
  feedbackGain.gain.value = feedback;

  const wetGain = audioContext.createGain();
  wetGain.gain.value = wetMix;

  const dryGain = audioContext.createGain();
  dryGain.gain.value = 1 - wetMix;

  // Dry path
  input.connect(dryGain);
  dryGain.connect(output);

  // Wet path with feedback loop
  input.connect(delay);
  delay.connect(feedbackGain);
  feedbackGain.connect(delay);
  delay.connect(wetGain);
  wetGain.connect(output);

  return {
    input,
    output,
    dispose() {
      delay.disconnect();
      feedbackGain.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      input.disconnect();
      output.disconnect();
    },
  };
}

/** Biquad filter (lowpass, highpass, bandpass) */
export function createFilter(
  audioContext: AudioContext,
  type: BiquadFilterType = 'lowpass',
  frequency: number = 2000,
  q: number = 1,
): EffectNode {
  const filter = audioContext.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = frequency;
  filter.Q.value = q;

  return {
    input: filter,
    output: filter,
    dispose() {
      filter.disconnect();
    },
  };
}

/** Waveshaper distortion */
export function createDistortion(
  audioContext: AudioContext,
  amount: number = 50,
  wetMix: number = 0.5,
): EffectNode {
  const input = audioContext.createGain();
  const output = audioContext.createGain();

  const shaper = audioContext.createWaveShaper();
  shaper.curve = makeDistortionCurve(amount);
  shaper.oversample = '4x';

  const wetGain = audioContext.createGain();
  wetGain.gain.value = wetMix;

  const dryGain = audioContext.createGain();
  dryGain.gain.value = 1 - wetMix;

  input.connect(shaper);
  shaper.connect(wetGain);
  wetGain.connect(output);

  input.connect(dryGain);
  dryGain.connect(output);

  return {
    input,
    output,
    dispose() {
      shaper.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      input.disconnect();
      output.disconnect();
    },
  };
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const samples = 44100;
  const buffer = new ArrayBuffer(samples * 4);
  const curve = new Float32Array(buffer);
  const deg = Math.PI / 180;
  for (let i = 0; i < samples; i++) {
    const x = (i * 2) / samples - 1;
    curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
  }
  return curve;
}

/**
 * Convolver reverb. Requires an impulse response AudioBuffer.
 * Use loadImpulseResponse() to fetch one from a URL.
 */
export function createReverb(
  audioContext: AudioContext,
  impulseResponse: AudioBuffer,
  wetMix: number = 0.3,
): EffectNode {
  const input = audioContext.createGain();
  const output = audioContext.createGain();

  const convolver = audioContext.createConvolver();
  convolver.buffer = impulseResponse;

  const wetGain = audioContext.createGain();
  wetGain.gain.value = wetMix;

  const dryGain = audioContext.createGain();
  dryGain.gain.value = 1 - wetMix;

  input.connect(convolver);
  convolver.connect(wetGain);
  wetGain.connect(output);

  input.connect(dryGain);
  dryGain.connect(output);

  return {
    input,
    output,
    dispose() {
      convolver.disconnect();
      wetGain.disconnect();
      dryGain.disconnect();
      input.disconnect();
      output.disconnect();
    },
  };
}

/** Load an impulse response from a URL for use with createReverb */
export async function loadImpulseResponse(
  audioContext: AudioContext,
  url: string,
): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to load impulse response "${url}": ${response.status} ${response.statusText}`,
    );
  }
  const arrayBuffer = await response.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}

/** Chain multiple effects together, returning a single EffectNode */
export function chainEffects(effects: EffectNode[]): EffectNode {
  if (effects.length === 0) {
    throw new Error('Cannot chain zero effects');
  }
  if (effects.length === 1) return effects[0];

  for (let i = 0; i < effects.length - 1; i++) {
    effects[i].output.connect(effects[i + 1].input);
  }

  return {
    input: effects[0].input,
    output: effects[effects.length - 1].output,
    dispose() {
      for (const e of effects) {
        e.dispose();
      }
    },
  };
}
