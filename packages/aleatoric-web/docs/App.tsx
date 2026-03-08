import type { MusicEvent } from 'aleatoric';
import { useCallback, useEffect, useState } from 'react';
import ApiReference from './components/ApiReference';
import Editor from './components/Editor';
import OutputPanel from './components/OutputPanel';
import { STARTER_CODE } from './lib/api-reference';
import { stopAll, warmAudioContext } from './lib/audio';
import { executeCode, type LogEntry } from './lib/executor';

export default function App() {
  const [code, setCode] = useState(STARTER_CODE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<MusicEvent[]>([]);
  const [running, setRunning] = useState(false);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loopPlayback, setLoopPlayback] = useState(false);

  const handleRun = useCallback(async () => {
    warmAudioContext();
    stopAll();
    setLogs([]);
    setError(null);
    setEvents([]);
    setRunning(true);
    setDurationMs(null);

    const result = await executeCode(
      code,
      (entry) => {
        setLogs((prev) => [...prev, entry]);
      },
      { defaultPlayOpts: { loop: loopPlayback } },
    );

    setError(result.error);
    setEvents(result.playedEvents);
    setDurationMs(result.durationMs);
    setRunning(false);
  }, [code, loopPlayback]);

  const handleStop = useCallback(() => {
    stopAll();
  }, []);

  const handleClear = useCallback(() => {
    setLogs([]);
    setError(null);
    setEvents([]);
    setDurationMs(null);
  }, []);

  const handleLoadExample = useCallback((example: string) => {
    setCode(example);
    setLogs([]);
    setError(null);
    setEvents([]);
    setDurationMs(null);
  }, []);

  const toggleLoopPlayback = useCallback(() => {
    setLoopPlayback((v) => !v);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stopAll();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="playground">
      <ApiReference onLoadExample={handleLoadExample} />
      <main className="playground-main">
        <div className="playground-toolbar">
          <button
            type="button"
            className="btn btn-play"
            onClick={handleRun}
            disabled={running}
            aria-busy={running}
            onPointerEnter={warmAudioContext}
          >
            &#9654; Run
          </button>
          <button type="button" className="btn" onClick={handleStop}>
            Stop
          </button>
          <button type="button" className="btn" onClick={handleClear}>
            Clear
          </button>
          <label
            className="toolbar-loop"
            title="Repeat until Stop; override in code with play(events, { loop: false }). ⌘/Ctrl+L toggles when the editor is focused — browsers may capture this shortcut for the address bar."
          >
            <input
              type="checkbox"
              checked={loopPlayback}
              onChange={(e) => setLoopPlayback(e.target.checked)}
            />
            Loop
          </label>
          <span className="toolbar-hint">
            ⌘/Ctrl+Enter run · ⌘/Ctrl+L loop · Esc stop
          </span>
        </div>
        <div className="playground-editor">
          <Editor
            value={code}
            onChange={setCode}
            onRun={handleRun}
            onToggleLoop={toggleLoopPlayback}
          />
        </div>
        <OutputPanel
          logs={logs}
          error={error}
          events={events}
          running={running}
          durationMs={durationMs}
        />
      </main>
    </div>
  );
}
