import type { MusicEvent, PitchDistribution } from 'aleatoric';
import { generateRandomPitches, Scale, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES } from '../lib/data';

export default function RandomPitch() {
  const [count, setCount] = useState(16);
  const [low, setLow] = useState(48);
  const [high, setHigh] = useState(84);
  const [scaleType, setScaleType] = useState('');
  const [distribution, setDistribution] =
    useState<PitchDistribution>('uniform');
  const [seed, setSeed] = useState(42);
  const countId = useId();
  const lowId = useId();
  const highId = useId();
  const scaleTypeId = useId();
  const distributionId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);

  const scaleTypes = Scale.types;

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handleGeneratePlay = () => {
    const scale = scaleType ? Scale.create('C', scaleType) : undefined;
    const evts = generateRandomPitches({
      count,
      low,
      high,
      scale,
      distribution,
      duration: 0.5,
      rng: new SeededRng(seed),
    });
    setEvents(evts);
    playEvents(evts, { waveform: 'triangle' });
  };

  return (
    <section id="random-pitch">
      <h2>Random Pitch Generator</h2>
      <p className="desc">
        Generate random pitches within a range, optionally constrained to a
        scale. Choose a probability distribution to shape the output.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={countId}>Count</label>
            <input
              id={countId}
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 16)}
              min={4}
              max={64}
            />
          </div>
          <div className="control-group">
            <label htmlFor={lowId}>Low MIDI</label>
            <input
              id={lowId}
              type="number"
              value={low}
              onChange={(e) => setLow(parseInt(e.target.value, 10) || 48)}
              min={21}
              max={108}
            />
          </div>
          <div className="control-group">
            <label htmlFor={highId}>High MIDI</label>
            <input
              id={highId}
              type="number"
              value={high}
              onChange={(e) => setHigh(parseInt(e.target.value, 10) || 84)}
              min={21}
              max={108}
            />
          </div>
          <div className="control-group">
            <label htmlFor={scaleTypeId}>Scale</label>
            <select
              id={scaleTypeId}
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value)}
            >
              <option value="">None (chromatic)</option>
              {scaleTypes.map((t) => (
                <option key={t} value={t}>
                  C {t}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={distributionId}>Distribution</label>
            <select
              id={distributionId}
              value={distribution}
              onChange={(e) =>
                setDistribution(e.target.value as PitchDistribution)
              }
            >
              <option value="uniform">Uniform</option>
              <option value="gaussian">Gaussian</option>
              <option value="edges">Edges (bimodal)</option>
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
          <button
            type="button"
            className="btn btn-play"
            onClick={handleGeneratePlay}
          >
            &#9654; Generate &amp; Play
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll tall"
          role="img"
          aria-label="Piano roll of generated random pitches"
        />
        <CodeExample code={CODE_EXAMPLES['random-pitch']} />
      </div>
    </section>
  );
}
