import type { ChordQuality } from 'aleatoric';
import {
  Chord,
  createMusicEvent,
  midiToFrequency,
  pitchToMidi,
  pitchToString,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { playEvents } from '../lib/audio';
import { drawPianoRoll } from '../lib/canvas';
import { CHORD_QUALITIES, CODE_EXAMPLES, NOTE_NAMES_LIST } from '../lib/data';
import { eventsFromMidi } from '../lib/helpers';

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

  const handlePlayStack = () => {
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
    playEvents(evts, { waveform: 'triangle', bpm: 120 });
  };

  const handlePlayArp = () => {
    const evts = eventsFromMidi(
      pitches.map((p) => pitchToMidi(p)),
      0.5,
    );
    drawPianoRoll(canvasRef.current, evts);
    playEvents(evts, { waveform: 'triangle', bpm: 160 });
  };

  return (
    <section id="chords">
      <h2>Chord Explorer</h2>
      <p className="desc">
        Explore triads, sevenths, and extended chords. Hear them stacked or
        arpeggiated.
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
            onClick={handlePlayStack}
          >
            &#9654; Stacked
          </button>
          <button
            type="button"
            className="btn btn-play"
            onClick={handlePlayArp}
          >
            &#9654; Arpeggiate
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
      </div>
    </section>
  );
}
