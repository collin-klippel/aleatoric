import CodeExample from '@docs-shared/components/CodeExample';
import DocsPrereqs from '@docs-shared/components/DocsPrereqs';
import { drawPianoRoll } from '@docs-shared/lib/canvas';
import type { MusicEvent, NoteName } from 'aleatoric';
import {
  generatePerlinNoiseMelody,
  parsePitch,
  pitchToMidi,
  Scale,
  SeededRng,
  Timeline,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';

export default function AmbientSection() {
  const [root, setRoot] = useState<NoteName>('C');
  const [scaleType, setScaleType] = useState('pentatonic');
  const [noteBeats, setNoteBeats] = useState(0.5);
  const [eventCount, setEventCount] = useState(80);
  const [seed, setSeed] = useState(42);
  const rootId = useId();
  const scaleTypeId = useId();
  const noteBeatsId = useId();
  const eventCountId = useId();
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
    const low = pitchToMidi(parsePitch('C2'));
    const high = pitchToMidi(parsePitch('C6'));
    const raw = generatePerlinNoiseMelody({
      count: eventCount,
      low,
      high,
      scale,
      duration: noteBeats,
      velocity: 78,
      rng: new SeededRng(seed),
    });
    const timeline = new Timeline(raw);
    const evts = timeline.getEvents();
    setEvents(evts);
    const unique = new Set(
      evts.map((e) => (e.pitch ? `${e.pitch.name}${e.pitch.octave}` : '')),
    ).size;
    const approxBeats = eventCount * noteBeats;
    setStats(
      `${evts.length} events · ${unique} unique pitches · ~${approxBeats.toFixed(0)} beats of material`,
    );
  };

  const handleRandom = () => {
    const randomSeed = Date.now();
    setSeed(randomSeed);
    const scale = Scale.create(root, scaleType);
    const low = pitchToMidi(parsePitch('C2'));
    const high = pitchToMidi(parsePitch('C6'));
    const raw = generatePerlinNoiseMelody({
      count: eventCount,
      low,
      high,
      scale,
      duration: noteBeats,
      velocity: 78,
      rng: new SeededRng(randomSeed),
    });
    const timeline = new Timeline(raw);
    const evts = timeline.getEvents();
    setEvents(evts);
    const unique = new Set(
      evts.map((e) => (e.pitch ? `${e.pitch.name}${e.pitch.octave}` : '')),
    ).size;
    const approxBeats = eventCount * noteBeats;
    setStats(
      `${evts.length} events · ${unique} unique pitches · ~${approxBeats.toFixed(0)} beats of material`,
    );
  };

  return (
    <section id="perlin-noise">
      <h2>Perlin noise melody</h2>
      <DocsPrereqs items={[{ label: 'Scales', href: '#scales' }]} />
      <p className="desc">
        <code>generatePerlinNoiseMelody</code> walks through a smooth contour of
        MIDI heights (Perlin-like interpolation between random waypoints), then
        snaps each step to your scale. Events are sequential on the beat grid;
        wrap them in a <code>Timeline</code> if you want to merge or offset them
        with other material.
      </p>
      <p className="desc">
        Longer note values and a higher event count stretch the contour in time.
        This demo is useful for pads and slow-moving lines at low BPM when you
        feed the events to a player.
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
            <label htmlFor={noteBeatsId}>Note length (beats)</label>
            <div className="range-row">
              <input
                id={noteBeatsId}
                type="range"
                min={0.25}
                max={4}
                step={0.25}
                value={noteBeats}
                onChange={(e) =>
                  setNoteBeats(parseFloat(e.target.value) || 0.25)
                }
              />
              <span className="range-value">{noteBeats}</span>
            </div>
          </div>
          <div className="control-group">
            <label htmlFor={eventCountId}>Events</label>
            <div className="range-row">
              <input
                id={eventCountId}
                type="range"
                min={16}
                max={200}
                step={4}
                value={eventCount}
                onChange={(e) =>
                  setEventCount(parseInt(e.target.value, 10) || 16)
                }
              />
              <span className="range-value">{eventCount}</span>
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
          className="piano-roll tall"
          role="img"
          aria-label="Piano roll of Perlin noise melody"
        />
        <div className="note-output">{stats}</div>
        <CodeExample code={CODE_EXAMPLES.perlinNoise} />
      </div>
    </section>
  );
}
