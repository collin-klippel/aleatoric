import type { MusicEvent } from 'aleatoric';
import { useEffect, useRef } from 'react';
import { drawPianoRoll } from '../lib/canvas';
import type { LogEntry } from '../lib/executor';

interface OutputPanelProps {
  logs: LogEntry[];
  error: string | null;
  events: MusicEvent[];
  running: boolean;
  durationMs: number | null;
}

function formatArg(arg: unknown): string {
  if (typeof arg === 'string') return arg;
  try {
    return JSON.stringify(arg, null, 2);
  } catch {
    return String(arg);
  }
}

function formatLogLine(entry: LogEntry): string {
  return entry.args.map(formatArg).join(' ');
}

export default function OutputPanel({
  logs,
  error,
  events,
  running,
  durationMs,
}: OutputPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    drawPianoRoll(canvasRef.current, events);
  }, [events]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const hasOutput = logs.length > 0 || error;

  return (
    <div className="output-panel">
      {events.length > 0 && (
        <canvas
          ref={canvasRef}
          className="piano-roll output-piano-roll"
          role="img"
          aria-label="Piano roll visualization of generated notes"
        />
      )}
      <div className="console-output">
        <div className="console-header">
          <span className="console-title">Console</span>
          {running && <span className="console-running">Running...</span>}
          {!running && durationMs !== null && (
            <span className="console-duration">{durationMs.toFixed(0)}ms</span>
          )}
        </div>
        <div
          className="console-body"
          role="log"
          aria-relevant="additions"
          aria-label="Console output"
        >
          {!hasOutput && !running && (
            <div className="console-placeholder">
              Output will appear here. Press Run or ⌘/Ctrl+Enter.
            </div>
          )}
          {logs.map((entry) => (
            <div
              key={entry.id}
              className={`console-line console-${entry.level}`}
            >
              {formatLogLine(entry)}
            </div>
          ))}
          {error && <div className="console-line console-error">{error}</div>}
          <div ref={consoleEndRef} />
        </div>
      </div>
    </div>
  );
}
