import CodeExample from '@docs-shared/components/CodeExample';
import { AMBER, drawPianoRoll } from '@docs-shared/lib/canvas';
import type { ChanceMethod, MusicEvent } from 'aleatoric';
import { generateChanceOps, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { CODE_EXAMPLES } from '../lib/data';

export default function ChanceOps() {
  const [method, setMethod] = useState<ChanceMethod>('random');
  const [count, setCount] = useState(16);
  const [restPct, setRestPct] = useState(15);
  const [seed, setSeed] = useState(11);
  const methodId = useId();
  const countId = useId();
  const restPctId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events, AMBER);
  }, [events]);

  const handleGenerate = () => {
    const evts = generateChanceOps({
      count,
      method,
      mapping: {
        pitchRange: [48, 84],
        durationRange: [0.25, 1.5],
        velocityRange: [50, 110],
        restProbability: restPct / 100,
      },
      rng: new SeededRng(seed),
    });
    setEvents(evts);
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    const evts = generateChanceOps({
      count,
      method,
      mapping: {
        pitchRange: [48, 84],
        durationRange: [0.25, 1.5],
        velocityRange: [50, 110],
        restProbability: restPct / 100,
      },
      rng: new SeededRng(randomSeed),
    });
    setEvents(evts);
  };

  return (
    <section id="chance-ops">
      <h2>Chance Operations</h2>
      <p className="desc">
        <code>generateChanceOps</code> follows an indeterminate-music idea: each
        event&apos;s pitch, duration, velocity, and rest-or-note decision are
        chosen separately. The <strong>method</strong> only changes <em>how</em>{' '}
        random decisions are drawn—coin flips, I Ching hexagrams, or uniform{' '}
        <code>RandomSource</code> output—not the parameter ranges.
      </p>
      <p className="desc">
        That independence produces irregular, unpredictable textures compared to
        Markov or L-system output. Adjust count, method, and rest probability
        below.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={methodId}>Method</label>
            <select
              id={methodId}
              value={method}
              onChange={(e) => setMethod(e.target.value as ChanceMethod)}
            >
              <option value="random">Random</option>
              <option value="coin">Coin Flips</option>
              <option value="iching">I Ching</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={countId}>Notes</label>
            <input
              id={countId}
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 16)}
              min={4}
              max={48}
            />
          </div>
          <div className="control-group">
            <label htmlFor={restPctId}>Rest %</label>
            <div className="range-row">
              <input
                id={restPctId}
                type="range"
                min={0}
                max={50}
                value={restPct}
                onChange={(e) => setRestPct(parseInt(e.target.value, 10))}
              />
              <span className="range-value">{restPct}%</span>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor={seedId}>Seed</label>
            <input
              id={seedId}
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 11)}
              min={1}
            />
          </div>
          <button type="button" className="btn btn-play" onClick={handleRandom}>
            Random
          </button>
          <button
            type="button"
            className="btn btn-play"
            onClick={handleGenerate}
          >
            Generate
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll tall"
          role="img"
          aria-label="Piano roll of chance-operation output"
        />
        <CodeExample code={CODE_EXAMPLES['chance-ops']} />
      </div>
    </section>
  );
}
