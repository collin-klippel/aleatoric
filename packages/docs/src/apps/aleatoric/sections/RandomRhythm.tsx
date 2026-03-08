import CodeExample from '@docs-shared/components/CodeExample';
import DocsPrereqs from '@docs-shared/components/DocsPrereqs';
import { drawPianoRoll } from '@docs-shared/lib/canvas';
import type { MusicEvent } from 'aleatoric';
import { generateRandomRhythm, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
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

  const handleGenerate = () => {
    const evts = generateRandomRhythm({
      count,
      restProbability: restPct / 100,
      midi: 60,
      rng: new SeededRng(seed),
    });
    setEvents(evts);
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    const evts = generateRandomRhythm({
      count,
      restProbability: restPct / 100,
      midi: 60,
      rng: new SeededRng(randomSeed),
    });
    setEvents(evts);
  };

  return (
    <section id="random-rhythm">
      <h2>Random Rhythm Generator</h2>
      <DocsPrereqs items={[{ label: 'Random Pitch', href: '#random-pitch' }]} />
      <p className="desc">
        <code>generateRandomRhythm</code> builds a sequence of events on a fixed
        MIDI pitch (middle C in this demo). Each step picks a duration from an
        allowed set—by default quarter, eighth, and half notes—and may turn the
        step into a rest according to <code>restProbability</code>.
      </p>
      <p className="desc">
        The API also supports a <code>density</code> mode that derives durations
        from an average events-per-beat target. Here you can vary note count,
        rest chance, and seed to explore sparse versus busy grids on the piano
        roll.
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
          className="piano-roll"
          role="img"
          aria-label="Piano roll of generated rhythm pattern"
        />
        <CodeExample code={CODE_EXAMPLES['random-rhythm']} />
      </div>
    </section>
  );
}
