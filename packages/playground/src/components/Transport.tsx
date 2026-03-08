import type { PlaybackControls } from '../audio/use-playback';
import { EnvelopeViz } from './EnvelopeViz';
import { WaveformPicker } from './WaveformPicker';

interface Props extends PlaybackControls {
  onGenerate: () => void;
  hasTimeline: boolean;
}

export function Transport({
  reverbWet,
  isReverbUpdating,
  sound,
  effects,
  setReverbWet,
  patchSound,
  patchEffects,
  setOscillatorType,
  setReverbDecay,
}: Props) {
  const env = sound.envelope;
  const ch = effects.chorus;
  const dl = effects.delay;

  return (
    <div className="transport">
      {/* ── Envelope ── */}
      <div className="sound-section">
        <span className="sound-section-label">Envelope</span>
        <EnvelopeViz envelope={env} />
        <div className="transport-sound-grid">
          <div className="transport-control transport-control-compact">
            <label
              htmlFor="env-a"
              title="Attack — time to reach peak amplitude"
            >
              Attack
            </label>
            <input
              id="env-a"
              type="range"
              min={0.001}
              max={2}
              step={0.001}
              value={env.attack}
              onChange={(e) =>
                patchSound({
                  envelope: { ...env, attack: e.target.valueAsNumber },
                })
              }
            />
            <span className="transport-value">{env.attack.toFixed(2)}s</span>
          </div>
          <div className="transport-control transport-control-compact">
            <label
              htmlFor="env-d"
              title="Decay — time to fall from peak to sustain level"
            >
              Decay
            </label>
            <input
              id="env-d"
              type="range"
              min={0.01}
              max={3}
              step={0.01}
              value={env.decay}
              onChange={(e) =>
                patchSound({
                  envelope: { ...env, decay: e.target.valueAsNumber },
                })
              }
            />
            <span className="transport-value">{env.decay.toFixed(2)}s</span>
          </div>
          <div className="transport-control transport-control-compact">
            <label
              htmlFor="env-s"
              title="Sustain — amplitude level while key is held"
            >
              Sustain
            </label>
            <input
              id="env-s"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={env.sustain}
              onChange={(e) =>
                patchSound({
                  envelope: { ...env, sustain: e.target.valueAsNumber },
                })
              }
            />
            <span className="transport-value">
              {Math.round(env.sustain * 100)}%
            </span>
          </div>
          <div className="transport-control transport-control-compact">
            <label
              htmlFor="env-r"
              title="Release — time to fade to silence after note ends"
            >
              Release
            </label>
            <input
              id="env-r"
              type="range"
              min={0.01}
              max={5}
              step={0.01}
              value={env.release}
              onChange={(e) =>
                patchSound({
                  envelope: { ...env, release: e.target.valueAsNumber },
                })
              }
            />
            <span className="transport-value">{env.release.toFixed(2)}s</span>
          </div>
        </div>
      </div>

      <div className="sound-section">
        <span className="sound-section-label">Oscillator</span>
        <WaveformPicker
          value={sound.oscillatorType}
          onChange={setOscillatorType}
        />
      </div>

      {/* ── Effects (chorus → delay before reverb) ── */}
      <div className="sound-section">
        <span className="sound-section-label">Effects</span>
        <div className="effects-subsection">
          <span className="effects-subsection-label">Chorus</span>
          <div className="transport-sound-grid">
            <div className="transport-control transport-control-compact">
              <label
                htmlFor="fx-ch-wet"
                title="How much chorused signal is mixed in"
              >
                Mix
              </label>
              <input
                id="fx-ch-wet"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={ch.wet}
                onChange={(e) =>
                  patchEffects({ chorus: { wet: e.target.valueAsNumber } })
                }
              />
              <span className="transport-value">
                {Math.round(ch.wet * 100)}%
              </span>
            </div>
            <div className="transport-control transport-control-compact">
              <label htmlFor="fx-ch-rate" title="Speed of the modulation LFO">
                Rate
              </label>
              <input
                id="fx-ch-rate"
                type="range"
                min={0.1}
                max={8}
                step={0.05}
                value={ch.frequency}
                onChange={(e) =>
                  patchEffects({
                    chorus: { frequency: e.target.valueAsNumber },
                  })
                }
              />
              <span className="transport-value">
                {ch.frequency.toFixed(2)} Hz
              </span>
            </div>
            <div className="transport-control transport-control-compact">
              <label
                htmlFor="fx-ch-depth"
                title="How far the delay time swings — higher = more warble"
              >
                Depth
              </label>
              <input
                id="fx-ch-depth"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={ch.depth}
                onChange={(e) =>
                  patchEffects({ chorus: { depth: e.target.valueAsNumber } })
                }
              />
              <span className="transport-value">
                {Math.round(ch.depth * 100)}%
              </span>
            </div>
            <div className="transport-control transport-control-compact">
              <label
                htmlFor="fx-ch-ms"
                title="Base delay time — typical chorus lives between ~2–20 ms"
              >
                Time
              </label>
              <input
                id="fx-ch-ms"
                type="range"
                min={2}
                max={20}
                step={0.1}
                value={ch.delayTimeMs}
                onChange={(e) =>
                  patchEffects({
                    chorus: { delayTimeMs: e.target.valueAsNumber },
                  })
                }
              />
              <span className="transport-value">
                {ch.delayTimeMs.toFixed(1)} ms
              </span>
            </div>
          </div>
        </div>
        <div className="effects-subsection">
          <span className="effects-subsection-label">Delay</span>
          <div className="transport-sound-grid">
            <div className="transport-control transport-control-compact">
              <label htmlFor="fx-dl-wet" title="Wet/dry mix for the delay line">
                Mix
              </label>
              <input
                id="fx-dl-wet"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={dl.wet}
                onChange={(e) =>
                  patchEffects({ delay: { wet: e.target.valueAsNumber } })
                }
              />
              <span className="transport-value">
                {Math.round(dl.wet * 100)}%
              </span>
            </div>
            <div className="transport-control transport-control-compact">
              <label htmlFor="fx-dl-time" title="Time between repeats">
                Time
              </label>
              <input
                id="fx-dl-time"
                type="range"
                min={0.05}
                max={2}
                step={0.01}
                value={dl.delayTimeSec}
                onChange={(e) =>
                  patchEffects({
                    delay: { delayTimeSec: e.target.valueAsNumber },
                  })
                }
              />
              <span className="transport-value">
                {dl.delayTimeSec.toFixed(2)}s
              </span>
            </div>
            <div className="transport-control transport-control-compact">
              <label
                htmlFor="fx-dl-fb"
                title="How much delayed signal is fed back — high values ring longer"
              >
                Feedback
              </label>
              <input
                id="fx-dl-fb"
                type="range"
                min={0}
                max={0.95}
                step={0.01}
                value={dl.feedback}
                onChange={(e) =>
                  patchEffects({ delay: { feedback: e.target.valueAsNumber } })
                }
              />
              <span className="transport-value">
                {Math.round(dl.feedback * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reverb ── */}
      <div className="sound-section">
        <span className="sound-section-label">
          Reverb
          {isReverbUpdating && (
            <span
              className="reverb-updating-dot"
              title="Regenerating impulse response…"
            />
          )}
        </span>
        <div className="transport-control">
          <label
            htmlFor="reverb"
            title="Wet/dry mix — how much reverb is applied"
          >
            Mix
          </label>
          <input
            id="reverb"
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={reverbWet}
            onChange={(e) => setReverbWet(e.target.valueAsNumber)}
          />
          <span className="transport-value">
            {Math.round(reverbWet * 100)}%
          </span>
        </div>
        <div className="transport-control">
          <label
            htmlFor="reverb-decay"
            title="How long the reverb tail lasts — higher = bigger space"
          >
            Decay
          </label>
          <input
            id="reverb-decay"
            type="range"
            min={0.5}
            max={10}
            step={0.1}
            value={sound.reverbDecaySec}
            onChange={(e) => setReverbDecay(e.target.valueAsNumber)}
          />
          <span className="transport-value">
            {sound.reverbDecaySec.toFixed(1)}s
          </span>
        </div>
      </div>
    </div>
  );
}
