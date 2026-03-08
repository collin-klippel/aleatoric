import type { SynthEnvelope } from '../audio/tone-adapter';

interface Props {
  envelope: SynthEnvelope;
}

const W = 220;
const H = 56;
const PAD = 4;
// Fixed display durations for each phase (in display units, not seconds)
// Attack, Decay, Sustain-hold, Release are weighted so the viz feels balanced
const SUSTAIN_HOLD = 0.25; // fraction of total time always given to sustain plateau

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

export function EnvelopeViz({ envelope }: Props) {
  const { attack, decay, sustain, release } = envelope;

  // Normalise time values to proportional widths.
  // Give sustain a fixed visual "hold" width, then distribute the rest.
  const totalTime = attack + decay + release;
  const drawW = W - PAD * 2;
  const drawH = H - PAD * 2;

  const sustainW = drawW * SUSTAIN_HOLD;
  const timeW = drawW - sustainW;
  const scale = totalTime > 0 ? timeW / totalTime : 1;

  const xA = PAD + attack * scale;
  const xD = xA + decay * scale;
  const xS = xD + sustainW;
  const xR = xS + release * scale;

  const yPeak = PAD;
  const ySustain = PAD + drawH * (1 - clamp(sustain, 0, 1));
  const ySilence = PAD + drawH;

  const points = [
    `${PAD},${ySilence}`,
    `${xA},${yPeak}`,
    `${xD},${ySustain}`,
    `${xS},${ySustain}`,
    `${xR},${ySilence}`,
  ].join(' ');

  // Subtle fill under the envelope curve
  const fillPath = [
    `M ${PAD} ${ySilence}`,
    `L ${xA} ${yPeak}`,
    `L ${xD} ${ySustain}`,
    `L ${xS} ${ySustain}`,
    `L ${xR} ${ySilence}`,
    'Z',
  ].join(' ');

  return (
    <svg
      className="envelope-viz"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      aria-label="ADSR envelope shape"
    >
      <rect
        x={0}
        y={0}
        width={W}
        height={H}
        rx={4}
        className="envelope-viz-bg"
      />
      <path d={fillPath} className="envelope-viz-fill" />
      <polyline points={points} className="envelope-viz-line" />
      {/* Phase labels */}
      <text x={PAD + (xA - PAD) / 2} y={H - 3} className="envelope-viz-label">
        A
      </text>
      <text x={xA + (xD - xA) / 2} y={H - 3} className="envelope-viz-label">
        D
      </text>
      <text x={xD + (xS - xD) / 2} y={H - 3} className="envelope-viz-label">
        S
      </text>
      <text x={xS + (xR - xS) / 2} y={H - 3} className="envelope-viz-label">
        R
      </text>
    </svg>
  );
}
