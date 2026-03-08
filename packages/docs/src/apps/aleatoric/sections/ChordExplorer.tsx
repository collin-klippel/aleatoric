import CodeExample from '@docs-shared/components/CodeExample';
import { drawPianoRoll } from '@docs-shared/lib/canvas';
import { eventsFromMidi } from '@docs-shared/lib/helpers';
import type { ChordQuality } from 'aleatoric';
import {
  Chord,
  createMusicEvent,
  midiToFrequency,
  pitchToMidi,
  pitchToString,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import { AleatoricStaticCategoryInset } from '../components/AleatoricStaticCategorySection';
import { CHORD_QUALITIES, CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';

export default function ChordExplorer() {
  const [root, setRoot] = useState<string>('C');
  const [quality, setQuality] = useState<ChordQuality>('major');
  const rootId = useId();
  const qualityId = useId();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const chord = Chord.create(root, quality);
  const pitches = chord.getPitches(4);
  const events = eventsFromMidi(
    pitches.map((p) => pitchToMidi(p)),
    1,
  );

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  const handleShowStack = () => {
    const evts = pitches.map((p) =>
      createMusicEvent({
        pitch: p,
        midi: pitchToMidi(p),
        frequency: midiToFrequency(pitchToMidi(p)),
        duration: { value: 4 },
        velocity: 70,
        startBeat: 0,
      }),
    );
    drawPianoRoll(canvasRef.current, evts);
  };

  const handleShowArp = () => {
    const evts = eventsFromMidi(
      pitches.map((p) => pitchToMidi(p)),
      0.5,
    );
    drawPianoRoll(canvasRef.current, evts);
  };

  return (
    <section id="chords">
      <h2>Chord Explorer</h2>
      <p className="desc">
        Another <strong>reference tool</strong>: <code>Chord.create</code>{' '}
        resolves a root and quality into pitch classes, then{' '}
        <code>getPitches</code> places them in octave. No probability—just a
        clear picture of how the chord API lays out notes.
      </p>
      <p className="desc">
        Switch between a simultaneous stack and a short arpeggio to hear shape
        on the piano roll; qualities come from the same catalogue used elsewhere
        in the library.
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
            <label htmlFor={qualityId}>Quality</label>
            <select
              id={qualityId}
              value={quality}
              onChange={(e) => setQuality(e.target.value as ChordQuality)}
            >
              {CHORD_QUALITIES.map((q) => (
                <option key={q} value={q}>
                  {q.replace(/([A-Z])/g, ' $1').trim()}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn btn-play"
            onClick={handleShowStack}
          >
            Stacked
          </button>
          <button
            type="button"
            className="btn btn-play"
            onClick={handleShowArp}
          >
            Arpeggiate
          </button>
        </div>
        <canvas
          ref={canvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of the selected chord"
        />
        <div className="note-output">
          {root} {quality}: {pitches.map((p) => pitchToString(p)).join('  ')}
        </div>
        <CodeExample code={CODE_EXAMPLES.chords} />
        <AleatoricStaticCategoryInset categoryId="core-chords" />
      </div>
    </section>
  );
}
