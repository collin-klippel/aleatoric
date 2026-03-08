import CodeExample from '../components/CodeExample';
import { type PlayOpts, playEvents } from '../lib/audio';
import { CODE_EXAMPLES } from '../lib/data';
import { eventsFromMidi } from '../lib/helpers';

const ARP_MIDI = [
  60, 64, 67, 72, 67, 64, 60, 55, 60, 64, 67, 72, 76, 72, 67, 64,
];
const EVENTS = eventsFromMidi(ARP_MIDI, 0.4, 75);

const SYNTH_CONFIGS: Record<string, PlayOpts> = {
  sine: { waveform: 'sine' },
  square: { waveform: 'square' },
  sawtooth: { waveform: 'sawtooth' },
  triangle: { waveform: 'triangle' },
  'fm-bell': { waveform: 'sine', fm: { ratio: 3.5, index: 8 } },
  'fm-brass': { waveform: 'sine', fm: { ratio: 1, index: 3 } },
};

export default function SynthComparison() {
  const handleSynthClick = (synth: string) => {
    playEvents(EVENTS, { ...SYNTH_CONFIGS[synth], bpm: 200 });
  };

  return (
    <section id="synths">
      <h2>Synth Comparison</h2>
      <p className="desc">
        Hear the same melody played through different synthesis engines: basic
        oscillators, FM synthesis, and more.
      </p>
      <div className="card">
        <h3>Play a C major arpeggio with each synth</h3>
        <div className="synth-group">
          {Object.keys(SYNTH_CONFIGS).map((synth) => (
            <button
              key={synth}
              type="button"
              className="btn btn-play"
              data-synth={synth}
              onClick={() => handleSynthClick(synth)}
            >
              &#9654;{' '}
              {synth === 'fm-bell'
                ? 'FM Bell'
                : synth === 'fm-brass'
                  ? 'FM Brass'
                  : synth.charAt(0).toUpperCase() + synth.slice(1)}
            </button>
          ))}
        </div>
        <CodeExample code={CODE_EXAMPLES.synths} />
      </div>
    </section>
  );
}
