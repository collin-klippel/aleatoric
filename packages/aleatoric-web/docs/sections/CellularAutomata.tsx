import type { MusicEvent } from 'aleatoric';
import { generateCellularAutomata, Scale, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawCellGrid, drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES } from '../lib/data';

export default function CellularAutomata() {
  const [mode, setMode] = useState<'1d' | '2d'>('1d');
  const [rule, setRule] = useState(30);
  const [width, setWidth] = useState(16);
  const [steps, setSteps] = useState(24);
  const [scaleType, setScaleType] = useState('');
  const [seed, setSeed] = useState(42);
  const modeId = useId();
  const ruleId = useId();
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

  const handleGeneratePlay = () => {
    drawCellGrid(gridCanvasRef.current, steps, width, rule, mode, seed);
    const evts = generateCellularAutomata({
      steps,
      width,
      rule,
      mode,
      stepDuration: 0.25,
      scale: scaleType ? Scale.create('C', scaleType) : undefined,
      pitchMapping: scaleType ? 'scale' : 'chromatic',
      rng: new SeededRng(seed),
    });
    setEvents(evts);
    playEvents(evts, { waveform: 'sine', bpm: 160 });
  };

  return (
    <section id="cellular">
      <h2>Cellular Automata</h2>
      <p className="desc">
        Wolfram elementary automata and Conway&apos;s Game of Life mapped to
        pitch and time. Active cells become notes.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={modeId}>Mode</label>
            <select
              id={modeId}
              value={mode}
              onChange={(e) => setMode(e.target.value as '1d' | '2d')}
            >
              <option value="1d">1D (Wolfram)</option>
              <option value="2d">2D (Game of Life)</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={ruleId}>Rule (1D)</label>
            <input
              id={ruleId}
              type="number"
              value={rule}
              onChange={(e) => setRule(parseInt(e.target.value, 10) || 30)}
              min={0}
              max={255}
            />
          </div>
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
          <button
            type="button"
            className="btn btn-play"
            onClick={handleGeneratePlay}
          >
            &#9654; Generate &amp; Play
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
