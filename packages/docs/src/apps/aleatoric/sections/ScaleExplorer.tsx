import CodeExample from '@docs-shared/components/CodeExample';
import { drawPianoRoll } from '@docs-shared/lib/canvas';
import { eventsFromMidi } from '@docs-shared/lib/helpers';
import { pitchToMidi, pitchToString, Scale } from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { AleatoricStaticCategoryInset } from '../components/AleatoricStaticCategorySection';
import { CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';

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

  return (
    <section id="scales">
      <h2>Scale Explorer</h2>
      <p className="desc">
        This is a <strong>theory reference</strong>, not a random generator:{' '}
        <code>Scale.create</code> builds the object, <code>getPitches</code>{' '}
        lists degrees in register, and the roll visualises them in order.
      </p>
      <p className="desc">
        Use it to compare built-in scale types (from <code>Scale.types</code>)
        and spellings before wiring scales into generators such as random pitch
        or Perlin-noise melodies.
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
        <AleatoricStaticCategoryInset categoryId="core-scales" />
      </div>
    </section>
  );
}
