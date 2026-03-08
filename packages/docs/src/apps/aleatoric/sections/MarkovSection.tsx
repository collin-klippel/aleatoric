import CodeExample from '@docs-shared/components/CodeExample';
import DocsPrereqs from '@docs-shared/components/DocsPrereqs';
import { ACCENT_DIM, drawPianoRoll, GREEN } from '@docs-shared/lib/canvas';
import { eventsFromMidi } from '@docs-shared/lib/helpers';
import type { MusicEvent } from 'aleatoric';
import {
  buildMidiTransitionMatrix,
  generateMarkovSequence,
  SeededRng,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { CODE_EXAMPLES, MELODIES } from '../lib/data';

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

  const handleGenerate = () => {
    const matrix = buildMidiTransitionMatrix(sourceMidi, order);
    const evts = generateMarkovSequence({
      count,
      transitionMatrix: matrix,
      duration: 0.4,
      rng: new SeededRng(seed),
    });
    setGenEvents(evts);
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    const matrix = buildMidiTransitionMatrix(sourceMidi, order);
    const evts = generateMarkovSequence({
      count,
      transitionMatrix: matrix,
      duration: 0.4,
      rng: new SeededRng(randomSeed),
    });
    setGenEvents(evts);
  };

  return (
    <section id="markov">
      <h2>Markov Chains</h2>
      <DocsPrereqs items={[{ label: 'Random Pitch', href: '#random-pitch' }]} />
      <p className="desc">
        A Markov model learns which notes tend to follow which others.{' '}
        <code>buildMidiTransitionMatrix</code> counts transitions in a source
        MIDI sequence; <code>generateMarkovSequence</code> walks the matrix with
        weighted random choices. Higher <strong>order</strong> uses longer
        prefixes (n-grams), so the output can capture short melodic gestures
        from the training material.
      </p>
      <p className="desc">
        Pick a source melody, order, and length, then generate: new lines
        inherit statistical flavour from the original without copying it
        verbatim.
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
