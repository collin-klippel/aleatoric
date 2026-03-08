import type { MusicEvent } from 'aleatoric';
import {
  applyConstraints,
  ContourConstraint,
  generateRandomPitches,
  MaxLeapConstraint,
  RangeConstraint,
  Scale,
  ScaleConstraint,
  SeededRng,
} from 'aleatoric';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { ACCENT_DIM, drawPianoRoll, GREEN } from '../lib/canvas';
import { CODE_EXAMPLES } from '../lib/data';

export default function ConstraintsSection() {
  const [constraintType, setConstraintType] = useState('scale');
  const [seed, setSeed] = useState(42);
  const constraintTypeId = useId();
  const seedId = useId();
  const rawCanvasRef = useRef<HTMLCanvasElement>(null);
  const constrainedCanvasRef = useRef<HTMLCanvasElement>(null);
  const [rawEvents, setRawEvents] = useState<MusicEvent[]>([]);
  const [constrainedEvents, setConstrainedEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(rawCanvasRef.current, rawEvents, ACCENT_DIM);
  }, [rawEvents]);
  useEffect(() => {
    drawPianoRoll(constrainedCanvasRef.current, constrainedEvents, GREEN);
  }, [constrainedEvents]);

  const generateConstrained = useCallback(() => {
    const raw = generateRandomPitches({
      count: 20,
      low: 36,
      high: 96,
      duration: 0.5,
      rng: new SeededRng(seed),
    });
    let constrained: MusicEvent[];
    switch (constraintType) {
      case 'scale':
        constrained = applyConstraints(raw, [
          new ScaleConstraint(Scale.major('C')),
        ]);
        break;
      case 'leap':
        constrained = applyConstraints(raw, [new MaxLeapConstraint(5)]);
        break;
      case 'contour-arch':
        constrained = applyConstraints(raw, [new ContourConstraint('arch')]);
        break;
      case 'contour-valley':
        constrained = applyConstraints(raw, [new ContourConstraint('valley')]);
        break;
      case 'range':
        constrained = applyConstraints(raw, [new RangeConstraint(48, 72)]);
        break;
      default:
        constrained = raw;
    }
    setRawEvents(raw);
    setConstrainedEvents(constrained);
    return { raw, constrained };
  }, [constraintType, seed]);

  const handlePlayRaw = () => {
    const { raw } = generateConstrained();
    setRawEvents(raw);
    drawPianoRoll(rawCanvasRef.current, raw);
    playEvents(raw, { waveform: 'triangle' });
  };

  const handlePlayConstrained = () => {
    const { raw, constrained } = generateConstrained();
    setRawEvents(raw);
    setConstrainedEvents(constrained);
    drawPianoRoll(rawCanvasRef.current, raw, ACCENT_DIM);
    drawPianoRoll(constrainedCanvasRef.current, constrained, GREEN);
    playEvents(constrained, { waveform: 'triangle' });
  };

  useEffect(() => {
    generateConstrained();
  }, [generateConstrained]);

  return (
    <section id="constraints">
      <h2>Constraints</h2>
      <p className="desc">
        Apply musical constraints to generated output: snap to scale, limit
        leaps, enforce contour shapes, or prevent parallel fifths.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={constraintTypeId}>Constraint</label>
            <select
              id={constraintTypeId}
              value={constraintType}
              onChange={(e) => setConstraintType(e.target.value)}
            >
              <option value="scale">Scale Snap (C Major)</option>
              <option value="leap">Max Leap (5 semitones)</option>
              <option value="contour-arch">Contour: Arch</option>
              <option value="contour-valley">Contour: Valley</option>
              <option value="range">Range (C3–C5)</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={seedId}>Seed</label>
            <input
              id={seedId}
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 42)}
              min={1}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className="btn btn-play"
            onClick={handlePlayRaw}
          >
            &#9654; Play Raw
          </button>
          <button
            type="button"
            className="btn btn-play"
            onClick={handlePlayConstrained}
          >
            &#9654; Play Constrained
          </button>
        </div>
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            marginBottom: 8,
          }}
        >
          BEFORE
        </h3>
        <canvas
          ref={rawCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll before constraints"
        />
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            margin: '12px 0 8px',
          }}
        >
          AFTER
        </h3>
        <canvas
          ref={constrainedCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll after constraints"
        />
        <CodeExample code={CODE_EXAMPLES.constraints} />
      </div>
    </section>
  );
}
