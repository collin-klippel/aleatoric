import type { MusicEvent, NoteName } from 'aleatoric';
import { generateAmbientTimeline, Scale, SeededRng } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';

export default function AmbientSection() {
  const [root, setRoot] = useState<NoteName>('C');
  const [scaleType, setScaleType] = useState('pentatonic');
  const [harmonyPct, setHarmonyPct] = useState(30);
  const [seed, setSeed] = useState(42);
  const rootId = useId();
  const scaleTypeId = useId();
  const harmonyPctId = useId();
  const seedId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [stats, setStats] = useState('');

  const scaleTypes = Scale.types;

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handleGenerate = () => {
    const scale = Scale.create(root, scaleType);
    const bpm = 20;
    const timeline = generateAmbientTimeline({
      low: 'C2',
      high: 'C6',
      scale,
      bpm,
      durationRange: [6, 12],
      gapRange: [3, 7],
      velocityRange: [40, 90],
      harmonyProbability: harmonyPct / 100,
      totalDuration: 60,
      rng: new SeededRng(seed),
    });
    const evts = timeline.getEvents();
    setEvents(evts);
    const unique = new Set(
      evts.map((e) => (e.pitch ? `${e.pitch.name}${e.pitch.octave}` : '')),
    ).size;
    setStats(
      `${evts.length} events · ${unique} unique pitches · ~60s material (playing at 4× speed)`,
    );
    playEvents(evts, { waveform: 'sine', bpm: bpm * 4 });
  };

  return (
    <section id="ambient">
      <h2>Ambient Generator</h2>
      <p className="desc">
        Pre-generate a sparse, overlapping ambient timeline for looped playback.
        Notes have long randomised durations and variable gaps so they layer
        naturally. Preview plays at 4× speed.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={rootId}>Root</label>
            <select
              id={rootId}
              value={root}
              onChange={(e) => setRoot(e.target.value as NoteName)}
            >
              {NOTE_NAMES_LIST.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={scaleTypeId}>Scale</label>
            <select
              id={scaleTypeId}
              value={scaleType}
              onChange={(e) => setScaleType(e.target.value)}
            >
              {scaleTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label htmlFor={harmonyPctId}>Harmony</label>
            <div className="range-row">
              <input
                id={harmonyPctId}
                type="range"
                min={0}
                max={100}
                value={harmonyPct}
                onChange={(e) => setHarmonyPct(parseInt(e.target.value, 10))}
              />
              <span className="range-value">{harmonyPct}%</span>
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
          <button
            type="button"
            className="btn btn-play"
            onClick={handleGenerate}
          >
            &#9654; Generate &amp; Preview
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll tall"
          role="img"
          aria-label="Piano roll of ambient timeline"
        />
        <div className="note-output">{stats}</div>
        <CodeExample code={CODE_EXAMPLES.ambient} />
      </div>
    </section>
  );
}
