import type { ParamDef } from '../generators/generator-configs';

interface Props {
  def: ParamDef;
  value: number | string;
  onChange: (value: number | string) => void;
}

function fmt(value: number | string, def: ParamDef): string {
  if (typeof value === 'string') return value;
  if (def.step !== undefined && def.step < 1) return value.toFixed(2);
  return String(Math.round(value as number));
}

export function ParamControl({ def, value, onChange }: Props) {
  if (def.type === 'select') {
    return (
      <div className="param-row">
        <label htmlFor={def.id} className="param-label" title={def.description}>
          {def.label}
        </label>
        <select
          id={def.id}
          className="param-select"
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
        >
          {def.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  // slider (and number fallback)
  return (
    <div className="param-row">
      <label htmlFor={def.id} className="param-label" title={def.description}>
        {def.label}
      </label>
      <div className="param-slider-group">
        <input
          id={def.id}
          type="range"
          className="param-slider"
          min={def.min}
          max={def.max}
          step={def.step}
          value={value as number}
          onChange={(e) => onChange(e.target.valueAsNumber)}
        />
        <span className="param-value">{fmt(value, def)}</span>
      </div>
    </div>
  );
}
