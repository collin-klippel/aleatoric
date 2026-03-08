import type { ChanceMethod, MusicEvent } from 'aleatoric';
import { generateChanceOps, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { AMBER, drawPianoRoll } from '../lib/canvas';
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

  const handleGeneratePlay = () => {
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
    playEvents(evts, { waveform: 'sine' });
  };

  return (
    <section id="chance-ops">
      <h2>Chance Operations</h2>
      <p className="desc">
        Cage-style chance operations: every musical parameter is determined
        independently by coin flips, I Ching hexagrams, or pure randomness.
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
          aria-label="Piano roll of chance-operation output"
        />
        <CodeExample code={CODE_EXAMPLES['chance-ops']} />
      </div>
    </section>
  );
}
