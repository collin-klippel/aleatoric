import { effectiveDuration, type MusicEvent, SeededRng } from 'aleatoric';

export const ACCENT = '#8b5cf6';
export const ACCENT_DIM = 'rgba(139, 92, 246, 0.4)';
export const GREEN = '#34d399';
export const AMBER = '#fbbf24';
const BG = '#1a1a32';
const GRID = 'rgba(255,255,255,0.04)';

export function drawPianoRoll(
  canvas: HTMLCanvasElement | null,
  events: MusicEvent[],
  color: string = ACCENT,
): void {
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  const nonRests = events.filter((e) => !e.isRest && e.midi > 0);
  if (nonRests.length === 0) return;

  const minMidi = Math.min(...nonRests.map((e) => e.midi)) - 2;
  const maxMidi = Math.max(...nonRests.map((e) => e.midi)) + 2;
  const totalBeats = events.reduce(
    (max, e) => Math.max(max, e.startBeat + effectiveDuration(e.duration)),
    0,
  );

  const pitchRange = Math.max(maxMidi - minMidi, 1);
  const pad = 8;
  const plotW = w - pad * 2;
  const plotH = h - pad * 2;

  ctx.strokeStyle = GRID;
  ctx.lineWidth = 1;
  for (let beat = 0; beat <= totalBeats; beat++) {
    const x = pad + (beat / totalBeats) * plotW;
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, h - pad);
    ctx.stroke();
  }

  for (const e of nonRests) {
    const x = pad + (e.startBeat / totalBeats) * plotW;
    const dur = effectiveDuration(e.duration);
    const noteW = Math.max((dur / totalBeats) * plotW - 1, 2);
    const y = pad + ((maxMidi - e.midi) / pitchRange) * plotH;
    const noteH = Math.max(plotH / pitchRange - 1, 2);

    ctx.fillStyle = color;
    ctx.globalAlpha = 0.3 + (e.velocity / 127) * 0.7;
    ctx.beginPath();
    ctx.roundRect(x, y, noteW, noteH, 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function drawCellGrid(
  canvas: HTMLCanvasElement | null,
  steps: number,
  width: number,
  rule: number,
  mode: '1d' | '2d',
  seed: number,
): boolean[][] {
  if (!canvas) return [];
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.scale(dpr, dpr);
  const w = rect.width;
  const h = rect.height;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, w, h);

  const rng = new SeededRng(seed);
  const grid: boolean[][] = [];

  if (mode === '1d') {
    let current = new Array(width).fill(false);
    current[Math.floor(width / 2)] = true;
    grid.push([...current]);
    const ruleBits = new Array(8)
      .fill(false)
      .map((_, i) => ((rule >> i) & 1) === 1);
    for (let s = 1; s < steps; s++) {
      const next = new Array(width).fill(false);
      for (let i = 0; i < width; i++) {
        const l = current[(i - 1 + width) % width] ? 1 : 0;
        const c = current[i] ? 1 : 0;
        const r = current[(i + 1) % width] ? 1 : 0;
        next[i] = ruleBits[(l << 2) | (c << 1) | r];
      }
      grid.push(next);
      current = next;
    }
  } else {
    let state = new Array(width * width)
      .fill(false)
      .map(() => rng.nextBool(0.3));
    for (let s = 0; s < steps; s++) {
      const midRow = Math.floor(width / 2);
      grid.push(state.slice(midRow * width, (midRow + 1) * width));
      const next = new Array(width * width).fill(false);
      for (let y = 0; y < width; y++) {
        for (let x = 0; x < width; x++) {
          let neighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dy === 0 && dx === 0) continue;
              const ny = (y + dy + width) % width;
              const nx = (x + dx + width) % width;
              if (state[ny * width + nx]) neighbors++;
            }
          }
          const alive = state[y * width + x];
          next[y * width + x] = alive
            ? neighbors === 2 || neighbors === 3
            : neighbors === 3;
        }
      }
      state = next;
    }
  }

  const cellW = w / width;
  const cellH = h / steps;
  for (let s = 0; s < grid.length; s++) {
    for (let c = 0; c < grid[s].length; c++) {
      if (grid[s][c]) {
        ctx.fillStyle = ACCENT;
        ctx.globalAlpha = 0.8;
        ctx.fillRect(c * cellW + 0.5, s * cellH + 0.5, cellW - 1, cellH - 1);
      }
    }
  }
  ctx.globalAlpha = 1;
  return grid;
}
