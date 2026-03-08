import { pitchToMidi, pitchToString, Scale } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';
import { eventsFromMidi } from '../lib/helpers';

export default function ScaleExplorer() {
  const [root, setRoot] = useState<string>('C');
  const [scaleType, setScaleType] = useState<string>('major');
  const rootId = useId();
  const scaleTypeId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scaleTypes = Scale.types;

  const scale = Scale.create(root, scaleType);
  const pitches = scale.getPitches(4, 5);
  const events = eventsFromMidi(
    pitches.map((p) => pitchToMidi(p)),
    0.4,
  );

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handlePlay = () => {
    playEvents(events, { waveform: 'triangle', bpm: 200 });
  };

  return (
    <section id="scales">
      <h2>Scale Explorer</h2>
      <p className="desc">
        Browse 16 scale types. Select a root and scale, then play to hear it
        ascending.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={rootId}>Root</label>
            <select
              id={rootId}
              value={root}
              onChange={(e) => setRoot(e.target.value)}
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
                  {t.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="btn btn-play" onClick={handlePlay}>
            &#9654; Play
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of the selected scale"
        />
        <div className="note-output">
          {pitches.map((p) => pitchToString(p)).join('  ')}
        </div>
        <CodeExample code={CODE_EXAMPLES.scales} />
      </div>
    </section>
  );
}
