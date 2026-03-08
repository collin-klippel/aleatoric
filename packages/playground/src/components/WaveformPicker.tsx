import type { BasicOscType } from '../audio/tone-adapter';

interface WaveformDef {
  value: BasicOscType;
  label: string;
  path: string;
}

// All paths drawn on a 36×20 viewBox
const WAVEFORMS: WaveformDef[] = [
  {
    value: 'sine',
    label: 'Sine',
    // One full sine cycle using cubic bezier approximation
    path: 'M 0 10 C 4.5 10 4.5 2 9 2 C 13.5 2 13.5 18 18 18 C 22.5 18 22.5 10 27 10 C 31.5 10 31.5 2 36 2',
  },
  {
    value: 'triangle',
    label: 'Triangle',
    path: 'M 0 10 L 9 2 L 18 18 L 27 2 L 36 10',
  },
  {
    value: 'sawtooth',
    label: 'Saw',
    path: 'M 0 18 L 18 2 L 18 18 L 36 2',
  },
  {
    value: 'square',
    label: 'Square',
    path: 'M 0 2 L 18 2 L 18 18 L 36 18',
  },
];

interface Props {
  value: BasicOscType;
  onChange: (type: BasicOscType) => void;
}

export function WaveformPicker({ value, onChange }: Props) {
  return (
    <div
      className="waveform-picker"
      role="radiogroup"
      aria-label="Oscillator waveform"
    >
      {WAVEFORMS.map((wf) => (
        <label
          key={wf.value}
          className={`waveform-btn ${value === wf.value ? 'active' : ''}`}
          title={wf.label}
        >
          <input
            className="waveform-radio"
            type="radio"
            name="oscillator-waveform"
            value={wf.value}
            checked={value === wf.value}
            onChange={() => onChange(wf.value)}
          />
          <svg viewBox="0 0 36 20" width={36} height={20} aria-hidden>
            <title>{wf.label}</title>
            <path d={wf.path} className="waveform-icon" />
          </svg>
          <span className="waveform-btn-label">{wf.label}</span>
        </label>
      ))}
    </div>
  );
}
