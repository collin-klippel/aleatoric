import type { MusicEvent } from 'aleatoric';
import { expandLSystem, generateLSystem, SeededRng } from 'aleatoric';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES, L_PRESETS } from '../lib/data';

export default function LSystemSection() {
  const [presetKey, setPresetKey] = useState<string>('fibonacci');
  const [iterations, setIterations] = useState(4);
  const [seed, setSeed] = useState(42);
  const presetKeyId = useId();
  const iterationsId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [expandedText, setExpandedText] = useState('');

  const preset = L_PRESETS[presetKey] ?? L_PRESETS.fibonacci;

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events, '#c084fc');
  }, [events]);

  const generate = useCallback(() => {
    const expanded = expandLSystem(
      preset.axiom,
      preset.rules,
      iterations,
      new SeededRng(seed),
    );
    const display =
      expanded.length > 200 ? `${expanded.slice(0, 200)}...` : expanded;
    setExpandedText(`${expanded.length} symbols: ${display}`);

    const evts = generateLSystem({
      axiom: preset.axiom,
      rules: preset.rules,
      iterations,
      interpretation: preset.interpretation,
      baseDuration: 0.3,
      rng: new SeededRng(seed),
    });
    setEvents(evts);
    return evts;
  }, [preset, iterations, seed]);

  useEffect(() => {
    generate();
  }, [generate]);

  const handlePlay = () => {
    const evts = generate();
    const maxEvents = evts.slice(0, 120);
    playEvents(maxEvents, { waveform: 'triangle', bpm: 200 });
  };

  return (
    <section id="lsystem">
      <h2>L-Systems</h2>
      <p className="desc">
        Lindenmayer systems: string rewriting rules create self-similar
        structures, mapped to musical parameters via a turtle interpretation.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={presetKeyId}>Preset</label>
            <select
              id={presetKeyId}
              value={presetKey}
              onChange={(e) => setPresetKey(e.target.value)}
            >
              <option value="fibonacci">Fibonacci (A/B)</option>
              <option value="dragon">Dragon Curve</option>
              <option value="plant">Branching Plant</option>
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={iterationsId}>Iterations</label>
            <div className="range-row">
              <input
                id={iterationsId}
                type="range"
                min={1}
                max={7}
                value={iterations}
                onChange={(e) => setIterations(parseInt(e.target.value, 10))}
              />
              <span className="range-value">{iterations}</span>
            </div>
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
          <button type="button" className="btn btn-play" onClick={handlePlay}>
            &#9654; Generate &amp; Play
          </button>
        </div>
        <div className="note-output" style={{ marginBottom: 12, marginTop: 0 }}>
          {expandedText}
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll tall"
          role="img"
          aria-label="Piano roll of L-system output"
        />
        <CodeExample code={CODE_EXAMPLES.lsystem} />
      </div>
    </section>
  );
}
