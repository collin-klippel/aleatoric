import type { MusicEvent } from 'aleatoric';
import {
  buildMidiTransitionMatrix,
  generateMarkovSequence,
  SeededRng,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { ACCENT_DIM, drawPianoRoll, GREEN } from '../lib/canvas';
import { CODE_EXAMPLES, MELODIES } from '../lib/data';
import { eventsFromMidi } from '../lib/helpers';

const _MELODY_KEYS = ['twinkle', 'ode', 'blues'] as const;

export default function MarkovSection() {
  const [source, setSource] = useState<string>('twinkle');
  const [order, setOrder] = useState(2);
  const [count, setCount] = useState(24);
  const [seed, setSeed] = useState(42);
  const sourceId = useId();
  const orderId = useId();
  const countId = useId();
  const seedId = useId();
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const genCanvasRef = useRef<HTMLCanvasElement>(null);

  const sourceMidi = MELODIES[source] ?? MELODIES.twinkle;
  const sourceEvents = eventsFromMidi(sourceMidi, 0.4);
  const [genEvents, setGenEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(sourceCanvasRef.current, sourceEvents, ACCENT_DIM);
  }, [sourceEvents]);

  useEffect(() => {
    drawPianoRoll(genCanvasRef.current, genEvents, GREEN);
  }, [genEvents]);

  const handlePlaySource = () => {
    playEvents(sourceEvents, { waveform: 'triangle', bpm: 180 });
  };

  const handleGeneratePlay = () => {
    const matrix = buildMidiTransitionMatrix(sourceMidi, order);
    const evts = generateMarkovSequence({
      count,
      transitionMatrix: matrix,
      duration: 0.4,
      rng: new SeededRng(seed),
    });
    setGenEvents(evts);
    playEvents(evts, { waveform: 'triangle', bpm: 180 });
  };

  return (
    <section id="markov">
      <h2>Markov Chains</h2>
      <p className="desc">
        Train a Markov chain on a melody, then generate new sequences following
        the learned transition probabilities.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={sourceId}>Source Melody</label>
            <select
              id={sourceId}
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="twinkle">Twinkle Twinkle</option>
              <option value="ode">Ode to Joy</option>
              <option value="blues">Blues Riff</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={orderId}>Order</label>
            <select
              id={orderId}
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value, 10))}
            >
              <option value={1}>1st order</option>
              <option value={2}>2nd order</option>
              <option value={3}>3rd order</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={countId}>Notes</label>
            <input
              id={countId}
              type="number"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value, 10) || 24)}
              min={8}
              max={64}
            />
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
            onClick={handlePlaySource}
          >
            &#9654; Play Source
          </button>
          <button
            type="button"
            className="btn btn-play"
            onClick={handleGeneratePlay}
          >
            &#9654; Generate &amp; Play
          </button>
        </div>
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            marginBottom: 8,
          }}
        >
          SOURCE
        </h3>
        <canvas
          ref={sourceCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of source melody"
        />
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            margin: '12px 0 8px',
          }}
        >
          GENERATED
        </h3>
        <canvas
          ref={genCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of Markov-generated melody"
        />
        <CodeExample code={CODE_EXAMPLES.markov} />
      </div>
    </section>
  );
}
