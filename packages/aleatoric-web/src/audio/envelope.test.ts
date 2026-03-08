import { describe, expect, it, vi } from 'vitest';
import { applyEnvelope, totalEnvelopeDuration } from './envelope.js';
import { DEFAULT_ENVELOPE, type EnvelopeParams } from './types.js';

function mockAudioParam() {
  return {
    cancelScheduledValues: vi.fn(),
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  } as unknown as AudioParam;
}

describe('totalEnvelopeDuration', () => {
  it('adds hold and release using default envelope', () => {
    expect(totalEnvelopeDuration(0.5)).toBe(0.5 + DEFAULT_ENVELOPE.release);
  });

  it('uses custom envelope release', () => {
    const env: EnvelopeParams = {
      attack: 0,
      decay: 0,
      sustain: 1,
      release: 0.35,
    };
    expect(totalEnvelopeDuration(1.2, env)).toBeCloseTo(1.55, 10);
  });
});

describe('applyEnvelope', () => {
  it('schedules ADSR ramps for default envelope', () => {
    const param = mockAudioParam();
    const start = 1;
    const hold = 0.5;
    const { attack, decay, sustain, release } = DEFAULT_ENVELOPE;

    applyEnvelope(param, start, hold);

    expect(param.cancelScheduledValues).toHaveBeenCalledWith(start);
    expect(param.setValueAtTime).toHaveBeenCalledWith(0, start);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(
      1,
      start + attack,
    );
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(
      sustain,
      start + attack + decay,
    );

    const releaseStart = start + hold;
    expect(param.setValueAtTime).toHaveBeenCalledWith(sustain, releaseStart);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(
      0,
      releaseStart + release,
    );
  });

  it('uses custom envelope params', () => {
    const param = mockAudioParam();
    const env: EnvelopeParams = {
      attack: 0.02,
      decay: 0.05,
      sustain: 0.5,
      release: 0.1,
    };
    applyEnvelope(param, 0, 0.2, env);

    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(1, 0.02);
    expect(param.linearRampToValueAtTime).toHaveBeenCalledWith(0.5, 0.07);
    expect(param.setValueAtTime).toHaveBeenCalledWith(0.5, 0.2);
    const ramps = vi.mocked(param.linearRampToValueAtTime).mock.calls;
    const releaseToZero = ramps[ramps.length - 1];
    expect(releaseToZero?.[0]).toBe(0);
    expect(releaseToZero?.[1]).toBeCloseTo(0.3, 10);
  });
});
