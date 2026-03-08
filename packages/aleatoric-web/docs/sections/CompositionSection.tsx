import type { MusicEvent } from 'aleatoric';
import {
  applyConstraints,
  beatsToSeconds,
  buildMidiTransitionMatrix,
  effectiveDuration,
  generateCellularAutomata,
  generateLSystem,
  generateMarkovSequence,
  RangeConstraint,
  Scale,
  ScaleConstraint,
  SeededRng,
} from 'aleatoric';
import { useEffect, useId, useRef, useState } from 'react';
import CodeExample from '../components/CodeExample';
import { getAudioCtx, playEvents, scheduleNote, stopAll } from '../lib/audio';
import { ACCENT, AMBER, drawPianoRoll, GREEN } from '../lib/canvas';
import { CODE_EXAMPLES, MELODIES } from '../lib/data';

export default function CompositionSection() {
  const [tempo, setTempo] = useState(110);
  const [seed, setSeed] = useState(42);
  const tempoId = useId();
  const seedId = useId();
  const melodyCanvasRef = useRef<HTMLCanvasElement>(null);
  const bassCanvasRef = useRef<HTMLCanvasElement>(null);
  const percCanvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('');
  const [melodyEvents, setMelodyEvents] = useState<MusicEvent[]>([]);
  const [bassEvents, setBassEvents] = useState<MusicEvent[]>([]);
  const [percEvents, setPercEvents] = useState<MusicEvent[]>([]);

  useEffect(() => {
    drawPianoRoll(melodyCanvasRef.current, melodyEvents, ACCENT);
  }, [melodyEvents]);
  useEffect(() => {
    drawPianoRoll(bassCanvasRef.current, bassEvents, GREEN);
  }, [bassEvents]);
  useEffect(() => {
    drawPianoRoll(percCanvasRef.current, percEvents, AMBER);
  }, [percEvents]);

  const handlePlay = () => {
    const bpm = tempo;
    const rng = new SeededRng(seed);

    const melodyMatrix = buildMidiTransitionMatrix(MELODIES.ode, 2);
    let melody = generateMarkovSequence({
      count: 32,
      transitionMatrix: melodyMatrix,
      duration: 0.5,
      rng: rng.fork(),
    });
    melody = applyConstraints(melody, [
      new ScaleConstraint(Scale.major('C')),
      new RangeConstraint(60, 84),
    ]);

    let bass = generateLSystem({
      axiom: 'F',
      rules: [{ match: 'F', replacement: 'F[+F]-F' }],
      iterations: 3,
      interpretation: {
        F: { type: 'note' },
        '+': { type: 'pitchUp', semitones: 7 },
        '-': { type: 'pitchDown', semitones: 5 },
        '[': { type: 'push' },
        ']': { type: 'pop' },
      },
      startingPitch: 48,
      baseDuration: 1,
      baseVelocity: 70,
      rng: rng.fork(),
    });
    bass = applyConstraints(bass, [
      new ScaleConstraint(Scale.major('C')),
      new RangeConstraint(36, 55),
    ]);
    const melodyEnd = melody[melody.length - 1].startBeat + 0.5;
    bass = bass.filter((e: MusicEvent) => e.startBeat < melodyEnd);

    let perc = generateCellularAutomata({
      steps: Math.ceil(melodyEnd / 0.5),
      width: 4,
      rule: 110,
      stepDuration: 0.5,
      pitchMapping: [42, 38, 45, 49],
      velocity: 60,
      rng: rng.fork(),
    });
    perc = perc.filter((e: MusicEvent) => e.startBeat < melodyEnd);

    setMelodyEvents(melody);
    setBassEvents(bass);
    setPercEvents(perc);
    setStatus(
      `melody: ${melody.length} notes | bass: ${bass.length} notes | perc: ${perc.length} hits`,
    );

    stopAll();
    playEvents(melody, { waveform: 'triangle', bpm });
    const ctx = getAudioCtx();
    const now = ctx.currentTime + 0.05;
    for (const e of bass) {
      if (e.isRest || e.frequency <= 0) continue;
      const time = now + beatsToSeconds(e.startBeat, bpm);
      const dur = beatsToSeconds(effectiveDuration(e.duration), bpm);
      scheduleNote(
        ctx,
        e.frequency,
        time,
        dur,
        e.velocity,
        {
          waveform: 'sine',
        },
        ctx.destination,
      );
    }
    for (const e of perc) {
      if (e.isRest || e.frequency <= 0) continue;
      const time = now + beatsToSeconds(e.startBeat, bpm);
      const dur = beatsToSeconds(effectiveDuration(e.duration), bpm);
      scheduleNote(
        ctx,
        e.frequency,
        time,
        dur,
        e.velocity,
        {
          waveform: 'square',
        },
        ctx.destination,
      );
    }
  };

  return (
    <section id="composition">
      <h2>Full Composition</h2>
      <p className="desc">
        Combine multiple generators, instruments, and constraints into a
        multi-part score — a complete aleatoric piece built with the library.
      </p>
      <div className="card">
        <div className="controls">
          <div className="control-group">
            <label htmlFor={tempoId}>Tempo</label>
            <div className="range-row">
              <input
                id={tempoId}
                type="range"
                min={60}
                max={200}
                value={tempo}
                onChange={(e) => setTempo(parseInt(e.target.value, 10))}
              />
              <span className="range-value">{tempo}</span>
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
            &#9654; Play Composition
          </button>
        </div>
        <div className="status">{status}</div>
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--accent-dim)',
            margin: '16px 0 8px',
          }}
        >
          MELODY — Markov + Scale Constraint
        </h3>
        <canvas
          ref={melodyCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of melody part"
        />
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--green)',
            margin: '12px 0 8px',
          }}
        >
          BASS — L-System + Range Constraint
        </h3>
        <canvas
          ref={bassCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of bass part"
        />
        <h3
          style={{
            fontSize: '0.75rem',
            color: 'var(--amber)',
            margin: '12px 0 8px',
          }}
        >
          PERCUSSION — Cellular Automata
        </h3>
        <canvas
          ref={percCanvasRef}
          className="piano-roll"
          role="img"
          aria-label="Piano roll of percussion part"
        />
        <CodeExample code={CODE_EXAMPLES.composition} />
      </div>
    </section>
  );
}
