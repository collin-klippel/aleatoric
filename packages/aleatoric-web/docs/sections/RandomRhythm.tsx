import type { MusicEvent } from 'aleatoric';
import { generateRandomRhythm, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES } from '../lib/data';

export default function RandomRhythm() {
  const [count, setCount] = useState(16);
  const [restPct, setRestPct] = useState(15);
  const [seed, setSeed] = useState(7);
  const countId = useId();
  const restPctId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handleGeneratePlay = () => {
    const evts = generateRandomRhythm({
      count,
      restProbability: restPct / 100,
      midi: 60,
      rng: new SeededRng(seed),
    });
    setEvents(evts);
    playEvents(evts, { waveform: 'square' });
  };

  return (
    <section id="random-rhythm">
      <h2>Random Rhythm Generator</h2>
      <p className="desc">
        Generate random rhythmic patterns with configurable durations and rest
        probability.
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
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 7)}
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
          className="piano-roll"
          role="img"
          aria-label="Piano roll of generated rhythm pattern"
        />
        <CodeExample code={CODE_EXAMPLES['random-rhythm']} />
      </div>
    </section>
  );
}
