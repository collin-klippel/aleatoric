import CodeExample from '@docs-shared/components/CodeExample';
import DocsPrereqs from '@docs-shared/components/DocsPrereqs';
import { drawCellGrid, drawPianoRoll } from '@docs-shared/lib/canvas';
import type { MusicEvent } from 'aleatoric';
import { generateCellularAutomata, Scale, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { CODE_EXAMPLES } from '../lib/data';

export default function CellularAutomata() {
  const [width, setWidth] = useState(16);
  const [steps, setSteps] = useState(24);
  const [scaleType, setScaleType] = useState('');
  const [seed, setSeed] = useState(42);
  const widthId = useId();
  const stepsId = useId();
  const scaleTypeId = useId();
  const seedId = useId();
  const gridCanvasRef = useRef<HTMLCanvasElement>(null);
  const pianoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);

  const scaleTypes = Scale.types;

  useEffect(() => {
    drawPianoRoll(pianoCanvasRef.current, events);
  }, [events]);

  const handleGenerate = () => {
    drawCellGrid(gridCanvasRef.current, steps, width, 0, '2d', seed);
    const evts = generateCellularAutomata({
      steps,
      width,
      stepDuration: 0.25,
      scale: scaleType ? Scale.create('C', scaleType) : undefined,
      pitchMapping: scaleType ? 'scale' : 'chromatic',
      rng: new SeededRng(seed),
    });
    setEvents(evts);
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    drawCellGrid(gridCanvasRef.current, steps, width, 0, '2d', randomSeed);
    const evts = generateCellularAutomata({
      steps,
      width,
      stepDuration: 0.25,
      scale: scaleType ? Scale.create('C', scaleType) : undefined,
      pitchMapping: scaleType ? 'scale' : 'chromatic',
      rng: new SeededRng(randomSeed),
    });
    setEvents(evts);
  };

  return (
    <section id="cellular">
      <h2>Cellular Automata</h2>
      <DocsPrereqs items={[{ label: 'Scales', href: '#scales' }]} />
      <p className="desc">
        <code>generateCellularAutomata</code> evolves a grid of on/off cells
        using Conway&apos;s Game of Life, then emits a note for every live cell.
        The seed randomises the initial cell state, producing a unique evolution
        each time.
      </p>
      <p className="desc">
        Each column maps to a pitch—either chromatic across the width or scale
        degrees when you pick a scale. Step length sets the rhythmic grid; the
        piano roll shows the resulting pattern.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={widthId}>Width</label>
            <input
              id={widthId}
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value, 10) || 16)}
              min={4}
              max={32}
            />
          </div>
          <div className="control-group">
            <label htmlFor={stepsId}>Steps</label>
            <input
              id={stepsId}
              type="number"
              value={steps}
              onChange={(e) => setSteps(parseInt(e.target.value, 10) || 24)}
              min={4}
              max={64}
            />
          </div>
          <div className="control-group">
            <label htmlFor={scaleTypeId}>Scale</label>
            <select
              id={scaleTypeId}
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value)}
            >
              <option value="">Chromatic</option>
              {scaleTypes.map((t) => (
                <option key={t} value={t}>
                  C {t}
                </option>
              ))}
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
          ref={gridCanvasRef}
          className="grid-viz"
          role="img"
          aria-label="Cellular automaton grid visualization"
        />
        <canvas
          ref={pianoCanvasRef}
          className="piano-roll"
          style={{ marginTop: 12 }}
          role="img"
          aria-label="Piano roll of notes from cellular automaton"
        />
        <CodeExample code={CODE_EXAMPLES.cellular} />
      </div>
    </section>
  );
}
