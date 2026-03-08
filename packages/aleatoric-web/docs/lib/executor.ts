import * as aleatoric from 'aleatoric';
import * as aleatoricWeb from 'aleatoric-web';
import {
  type PreviewPlayOptions,
  previewPlay,
  previewStop,
} from 'aleatoric-web';

export interface LogEntry {
  /** Monotonic id within a single `executeCode` run (stable React list key). */
  id: number;
  level: 'log' | 'warn' | 'error' | 'info';
  args: unknown[];
  timestamp: number;
}

export interface ExecutionResult {
  logs: LogEntry[];
  error: string | null;
  durationMs: number;
  playedEvents: aleatoric.MusicEvent[];
}

interface ParsedImport {
  source: 'aleatoric' | 'aleatoric-web';
  symbols: string[];
}

/** Multiline-safe for `aleatoric` and `aleatoric-web` named imports. */
const IMPORT_RE =
  /\s*import\s+\{([\s\S]*?)\}\s*from\s+['"](aleatoric(?:-web)?)['"]\s*;?/g;
const TIMEOUT_MS = 5000;

function parseImports(code: string): {
  imports: ParsedImport[];
  strippedCode: string;
} {
  const imports: ParsedImport[] = [];
  const strippedCode = code
    .replace(
      IMPORT_RE,
      (_match, specifiers: string, source: ParsedImport['source']) => {
        const names = specifiers
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0 && !s.startsWith('type '));
        imports.push({ source, symbols: names });
        return '';
      },
    )
    .trim();
  return { imports, strippedCode };
}

function resolveSymbols(imports: ParsedImport[]): Record<string, unknown> {
  const resolved: Record<string, unknown> = {};
  const modules: Record<ParsedImport['source'], Record<string, unknown>> = {
    aleatoric: aleatoric as Record<string, unknown>,
    'aleatoric-web': aleatoricWeb as Record<string, unknown>,
  };

  for (const { source, symbols } of imports) {
    const mod = modules[source];
    for (const name of symbols) {
      const local = name.includes(' as ') ? name.split(' as ')[1].trim() : name;
      const imported = name.includes(' as ')
        ? name.split(' as ')[0].trim()
        : name;
      if (imported in mod) {
        resolved[local] = mod[imported];
      }
    }
  }
  return resolved;
}

export interface ExecuteCodeOptions {
  /** Merged into every `play(events, opts?)` call; explicit `opts` from user code win. */
  defaultPlayOpts?: Partial<PreviewPlayOptions>;
}

export async function executeCode(
  code: string,
  onLog: (entry: LogEntry) => void,
  options?: ExecuteCodeOptions,
): Promise<ExecutionResult> {
  const logs: LogEntry[] = [];
  let nextLogId = 0;
  const start = performance.now();

  const { imports, strippedCode } = parseImports(code);
  const resolved = resolveSymbols(imports);

  const capture =
    (level: LogEntry['level']) =>
    (...args: unknown[]) => {
      const entry: LogEntry = {
        id: ++nextLogId,
        level,
        args,
        timestamp: Date.now(),
      };
      logs.push(entry);
      onLog(entry);
    };

  const defaults = options?.defaultPlayOpts ?? {};
  let playedEvents: aleatoric.MusicEvent[] = [];
  const playHelper = (
    eventsOrFn: aleatoric.MusicEvent[] | (() => aleatoric.MusicEvent[]),
    opts?: PreviewPlayOptions,
  ) => {
    if (typeof eventsOrFn === 'function') {
      let captured = false;
      const wrappedFn = () => {
        const events = eventsOrFn();
        if (!captured) {
          playedEvents = events;
          captured = true;
        }
        return events;
      };
      previewPlay(wrappedFn, { ...defaults, ...opts });
    } else {
      playedEvents = eventsOrFn;
      previewPlay(eventsOrFn, { ...defaults, ...opts });
    }
  };
  const stopHelper = () => previewStop();

  const paramNames = [...Object.keys(resolved), 'console', 'play', 'stop'];
  const paramValues = [
    ...Object.values(resolved),
    {
      log: capture('log'),
      warn: capture('warn'),
      error: capture('error'),
      info: capture('info'),
    },
    playHelper,
    stopHelper,
  ];

  try {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const fn = new AsyncFunction(...paramNames, strippedCode);

    const _result = await Promise.race([
      fn(...paramValues),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error(`Execution timed out after ${TIMEOUT_MS}ms`)),
          TIMEOUT_MS,
        ),
      ),
    ]);

    return {
      logs,
      error: null,
      durationMs: performance.now() - start,
      playedEvents,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      logs,
      error: message,
      durationMs: performance.now() - start,
      playedEvents,
    };
  }
}
