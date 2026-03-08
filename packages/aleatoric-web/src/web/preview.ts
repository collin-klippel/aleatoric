import { beatsToSeconds, effectiveDuration, type MusicEvent } from 'aleatoric';

let audioCtx: AudioContext | null = null;
let currentSessionGain: GainNode | null = null;
let currentTimeouts: ReturnType<typeof setTimeout>[] = [];
let didPrimeOutput = false;
let playbackGeneration = 0;

const playbackStateListeners = new Set<(playing: boolean) => void>();

function notifyPlaybackStateListeners(): void {
  const playing = currentSessionGain !== null;
  playbackStateListeners.forEach((fn) => {
    try {
      fn(playing);
    } catch {
      /* ignore listener errors */
    }
  });
}

/** Subscribe to play/stop (phrase end, Stop, or new play). */
export function subscribePlaybackState(
  listener: (playing: boolean) => void,
): () => void {
  playbackStateListeners.add(listener);
  listener(isPlaybackActive());
  return () => playbackStateListeners.delete(listener);
}

/** One-shot silent buffer after context runs. */
function primeAudioOutput(ctx: AudioContext): void {
  if (didPrimeOutput) return;
  didPrimeOutput = true;
  try {
    const buf = ctx.createBuffer(1, 1, ctx.sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
  } catch {
    /* ignore */
  }
}

export function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

/** Call before scheduling; awaits context resume so playback starts immediately. */
export async function ensureAudioReady(): Promise<AudioContext> {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') await ctx.resume();
  return ctx;
}

/** Synchronous resume kickoff so autoplay policy sees user gesture. */
function primeAudioFromUserGesture(): void {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended')
    ctx.resume().catch(() => {
      /* autoplay policy may deny outside gesture */
    });
}

/** Hover / focus path: start resuming before the user clicks Play. */
export function warmAudioContext(): void {
  primeAudioFromUserGesture();
}

function installEarlyAudioUnlock(): void {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    try {
      primeAudioFromUserGesture();
    } catch {
      /* ignore */
    }
  };
  window.addEventListener('pointerdown', unlock, {
    capture: true,
    passive: true,
  });
  window.addEventListener('keydown', unlock, { capture: true, passive: true });
}
installEarlyAudioUnlock();

/** True while a phrase session is active (playing or looping). */
export function isPlaybackActive(): boolean {
  return currentSessionGain !== null;
}

/** Stops current playback and ensures only one sequence plays at a time. */
export function previewStop(): void {
  playbackGeneration += 1;
  for (const t of currentTimeouts) {
    clearTimeout(t);
  }
  currentTimeouts = [];
  if (audioCtx && currentSessionGain) {
    try {
      currentSessionGain.disconnect();
    } catch {
      // already disconnected
    }
    currentSessionGain = null;
  }
  notifyPlaybackStateListeners();
}

export interface PreviewPlayOptions {
  waveform?: OscillatorType;
  fm?: { ratio: number; index: number };
  bpm?: number;
  /** Repeat phrase until stopped */
  loop?: boolean;
}

function schedulePhrasePass(
  events: MusicEvent[],
  baseTime: number,
  bpm: number,
  ctx: AudioContext,
  opts: PreviewPlayOptions,
  sessionGain: GainNode,
): void {
  for (const event of events) {
    if (event.isRest || event.frequency <= 0) continue;
    const time = baseTime + beatsToSeconds(event.startBeat, bpm);
    const dur = beatsToSeconds(effectiveDuration(event.duration), bpm);
    scheduleNote(
      ctx,
      event.frequency,
      time,
      dur,
      event.velocity,
      opts,
      sessionGain,
    );
  }
}

export async function previewPlay(
  eventsOrFn: MusicEvent[] | (() => MusicEvent[]),
  opts: PreviewPlayOptions = {},
): Promise<void> {
  try {
    primeAudioFromUserGesture();
    const ctx = await ensureAudioReady();
    primeAudioOutput(ctx);
    previewStop();
    const sessionGen = playbackGeneration;

    const sessionGain = ctx.createGain();
    sessionGain.gain.value = 1;
    sessionGain.connect(ctx.destination);
    currentSessionGain = sessionGain;
    notifyPlaybackStateListeners();

    const getEvents =
      typeof eventsOrFn === 'function' ? eventsOrFn : () => eventsOrFn;
    const bpm = opts.bpm ?? 140;
    const now = ctx.currentTime;
    const startTime = now + 0.01;

    const firstEvents = getEvents();
    schedulePhrasePass(firstEvents, startTime, bpm, ctx, opts, sessionGain);

    const totalBeats = Math.max(
      0.0001,
      firstEvents.reduce(
        (max, e) => Math.max(max, e.startBeat + effectiveDuration(e.duration)),
        0,
      ),
    );
    const phraseDurationSec = Math.max(0.05, beatsToSeconds(totalBeats, bpm));
    const phraseDurationMs = phraseDurationSec * 1000;
    const tailMs = 200;

    if (!opts.loop) {
      currentTimeouts.push(
        globalThis.setTimeout(() => {
          if (playbackGeneration !== sessionGen) return;
          previewStop();
        }, phraseDurationMs + tailMs),
      );
    } else {
      let nextIteration = 1;
      const queueNextLoop = (): void => {
        currentTimeouts.push(
          globalThis.setTimeout(() => {
            if (playbackGeneration !== sessionGen) return;
            const base = startTime + nextIteration * phraseDurationSec;
            schedulePhrasePass(getEvents(), base, bpm, ctx, opts, sessionGain);
            nextIteration += 1;
            queueNextLoop();
          }, phraseDurationMs),
        );
      };
      queueNextLoop();
    }
  } catch {
    previewStop();
  }
}

export function scheduleNote(
  ctx: AudioContext,
  freq: number,
  time: number,
  dur: number,
  velocity: number,
  opts: PreviewPlayOptions,
  destination: AudioNode,
): void {
  const gain = ctx.createGain();
  const vol = (velocity / 127) * 0.25;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(vol, time + 0.01);
  gain.gain.setValueAtTime(vol, time + dur * 0.7);
  gain.gain.linearRampToValueAtTime(0, time + dur + 0.08);
  gain.connect(destination);

  if (opts.fm) {
    const carrier = ctx.createOscillator();
    carrier.type = opts.waveform ?? 'sine';
    carrier.frequency.setValueAtTime(freq, time);

    const modFreq = freq * opts.fm.ratio;
    const modDepth = modFreq * opts.fm.index;
    const mod = ctx.createOscillator();
    mod.frequency.setValueAtTime(modFreq, time);
    const modGain = ctx.createGain();
    modGain.gain.setValueAtTime(modDepth, time);
    modGain.gain.linearRampToValueAtTime(modDepth * 0.3, time + dur);

    mod.connect(modGain);
    modGain.connect(carrier.frequency);
    carrier.connect(gain);

    mod.start(time);
    mod.stop(time + dur + 0.1);
    carrier.start(time);
    carrier.stop(time + dur + 0.1);
  } else {
    const osc = ctx.createOscillator();
    osc.type = opts.waveform ?? 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.connect(gain);
    osc.start(time);
    osc.stop(time + dur + 0.1);
  }
}
