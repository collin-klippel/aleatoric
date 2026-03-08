import { usePlayback } from './audio/use-playback';
import { EventDisplay } from './components/EventDisplay';
import { Oscilloscope } from './components/Oscilloscope';
import { ParamControl } from './components/ParamControl';
import { Transport } from './components/Transport';
import { TransportHeaderBar } from './components/TransportHeaderBar';
import { GENERATORS } from './generators/generator-configs';
import { useGenerator } from './generators/use-generator';

export default function App() {
  const generator = useGenerator();
  const playback = usePlayback(generator.timeline);

  const handleGeneratorChange = (id: string) => {
    playback.stop();
    generator.setGeneratorId(id);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-brand">
          <h1 className="app-title">
            <span className="app-title-accent">aleatoric</span>
            <span className="app-title-sep"> × </span>
            <span className="app-title-tone">tone.js</span>
          </h1>
          <p className="app-subtitle">Algorithmic composition playground</p>
        </div>
        <TransportHeaderBar
          isPlaying={playback.isPlaying}
          bpm={playback.bpm}
          play={playback.play}
          stop={playback.stop}
          setBpm={playback.setBpm}
          onGenerate={generator.generate}
          hasTimeline={generator.timeline !== null}
        />
      </header>

      <main className="app-main">
        {/* Left column: generator config */}
        <section className="panel panel-config">
          <div className="generator-picker">
            <label htmlFor="generator-select" className="section-label">
              Algorithm
            </label>
            <select
              id="generator-select"
              className="generator-select"
              value={generator.generatorId}
              onChange={(e) => handleGeneratorChange(e.target.value)}
            >
              {GENERATORS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
            <p className="generator-description">
              {generator.selectedConfig.description}
            </p>
          </div>

          <div className="params-section">
            <span className="section-label">Parameters</span>
            <div className="params-list">
              {generator.selectedConfig.params.map((def) => (
                <ParamControl
                  key={def.id}
                  def={def}
                  value={generator.params[def.id] ?? def.default}
                  onChange={(v) => generator.setParam(def.id, v)}
                />
              ))}
            </div>
          </div>

          <Transport
            {...playback}
            onGenerate={generator.generate}
            hasTimeline={generator.timeline !== null}
          />

          {generator.error && (
            <div className="error-banner" role="alert">
              {generator.error}
            </div>
          )}
        </section>

        {/* Right column: scope + event display */}
        <section className="panel panel-events">
          <div className="scope-section">
            <span className="section-label">Output</span>
            <Oscilloscope getAnalyser={playback.getScopeAnalyser} />
          </div>
          <div className="events-header">
            <span className="section-label">Generated Events</span>
            {generator.events.length > 0 && (
              <span className="events-count">
                {generator.events.length} events
                {generator.timeline
                  ? ` · ${generator.timeline.duration.toFixed(2)} beats`
                  : ''}
              </span>
            )}
          </div>
          <EventDisplay
            events={generator.events}
            isPlaying={playback.isPlaying}
            playbackBeat={playback.playbackBeat}
          />
        </section>
      </main>
    </div>
  );
}
