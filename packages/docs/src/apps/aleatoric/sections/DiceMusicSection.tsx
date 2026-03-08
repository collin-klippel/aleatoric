import CodeExample from '@docs-shared/components/CodeExample';
import DocsPrereqs from '@docs-shared/components/DocsPrereqs';
import { drawPianoRoll } from '@docs-shared/lib/canvas';
import type { MusicEvent } from 'aleatoric';
import { createSimpleDiceTable, generateDiceMusic, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { CODE_EXAMPLES } from '../lib/data';

function buildDemoTable() {
  const entries: Record<number, number[][]> = {};
  for (let sum = 2; sum <= 12; sum++) {
    const o = (sum - 2) % 3;
    entries[sum] = [
      [60 + o, 64 + o, 67 + o, 72 + o],
      [62 + o, 65 + o, 69 + o, 74 + o],
    ];
  }
  return createSimpleDiceTable(entries, 0.5, 82);
}

const DEMO_TABLE = buildDemoTable();

export default function DiceMusicSection() {
  const [measures, setMeasures] = useState(12);
  const [seed, setSeed] = useState(99);
  const measuresId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handleGenerate = () => {
    const evts = generateDiceMusic({
      measures,
      table: DEMO_TABLE,
      rng: new SeededRng(seed),
    });
    setEvents(evts);
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    const evts = generateDiceMusic({
      measures,
      table: DEMO_TABLE,
      rng: new SeededRng(randomSeed),
    });
    setEvents(evts);
  };

  return (
    <section id="dice-music">
      <h2>Dice Music</h2>
      <DocsPrereqs items={[{ label: 'Random Pitch', href: '#random-pitch' }]} />
      <p className="desc">
        <code>generateDiceMusic</code> follows the{' '}
        <em>Musikalisches Würfelspiel</em> idea: each measure, roll 2d6 and pick
        a pre-composed fragment from a table keyed by the sum (2–12). Fragments
        can offer several columns so measure position cycles through variants,
        like historical dice minuets.
      </p>
      <p className="desc">
        <code>createSimpleDiceTable</code> helps build a table from MIDI note
        rows: each row becomes one measure of evenly spaced notes. This demo
        uses a fixed toy table covering every dice sum; change measures and seed
        to hear different concatenations.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={measuresId}>Measures</label>
            <input
              id={measuresId}
              type="number"
              value={measures}
              onChange={(e) =>
                setMeasures(
                  Math.min(64, Math.max(1, parseInt(e.target.value, 10) || 1)),
                )
              }
              min={1}
              max={64}
            />
          </div>
          <div className="control-group">
            <label htmlFor={seedId}>Seed</label>
            <input
              id={seedId}
              type="number"
              value={seed}
              onChange={(e) => setSeed(parseInt(e.target.value, 10) || 99)}
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
          aria-label="Piano roll of dice-selected measures"
        />
        <CodeExample code={CODE_EXAMPLES['dice-music']} />
      </div>
    </section>
  );
}
