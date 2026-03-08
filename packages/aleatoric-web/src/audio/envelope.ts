import { DEFAULT_ENVELOPE, EnvelopeParams } from './types.js';

/**
 * Apply an ADSR envelope to an AudioParam (typically a GainNode.gain).
 * Returns the total envelope duration (excluding sustain hold time).
 */
export function applyEnvelope(
  param: AudioParam,
  startTime: number,
  holdDuration: number,
  envelope: EnvelopeParams = DEFAULT_ENVELOPE,
): void {
  const { attack, decay, sustain, release } = envelope;

  param.cancelScheduledValues(startTime);
  param.setValueAtTime(0, startTime);

  // Attack: ramp to 1
  param.linearRampToValueAtTime(1, startTime + attack);

  // Decay: ramp to sustain level
  param.linearRampToValueAtTime(sustain, startTime + attack + decay);

  // Sustain: hold at sustain level
  const releaseStart = startTime + holdDuration;
  param.setValueAtTime(sustain, releaseStart);

  // Release: ramp to 0
  param.linearRampToValueAtTime(0, releaseStart + release);
}

/**
 * Total time from note-on to silence for a given hold duration and envelope.
 */
export function totalEnvelopeDuration(
  holdDuration: number,
  envelope: EnvelopeParams = DEFAULT_ENVELOPE,
): number {
  return holdDuration + envelope.release;
}
