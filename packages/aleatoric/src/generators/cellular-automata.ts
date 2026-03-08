import { midiToFrequency, midiToPitch, pitchToMidi } from '../core/note.js';
import { Scale } from '../core/scale.js';
import { MusicEvent, Octave } from '../core/types.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

export const CELLULAR_PITCH_MAPPING_KINDS = ['scale', 'chromatic'] as const;

export type CellularPitchMappingKind =
  (typeof CELLULAR_PITCH_MAPPING_KINDS)[number];

export const CELLULAR_AUTOMATA_MODES = ['1d', '2d'] as const;

export type CellularAutomataMode = (typeof CELLULAR_AUTOMATA_MODES)[number];

export interface CellularAutomataOptions {
  /** Number of time steps (rows) to generate */
  steps: number;
  /** Width of the automaton (number of cells) */
  width: number;
  /** Wolfram rule number (0-255) for 1D automata */
  rule?: number;
  /** Initial state. If omitted, starts with a single cell in the center */
  initialState?: boolean[];
  /** Mapping: which cells correspond to which pitches, or an explicit MIDI list */
  pitchMapping?: CellularPitchMappingKind | number[];
  /** Scale to use when pitchMapping is 'scale' */
  scale?: Scale;
  /** Base octave for pitch mapping (default 3) */
  baseOctave?: number;
  /** Duration of each step in beats (default 0.25) */
  stepDuration?: number;
  /** Velocity for active cells (default 80) */
  velocity?: number;
  /** Whether to use 2D (Game of Life) instead of 1D Wolfram (default false) */
  mode?: CellularAutomataMode;
  rng?: RandomSource;
}

/**
 * Map 1D Wolfram rules or 2D Game of Life evolution to pitch events.
 *
 * @see https://en.wikipedia.org/wiki/Elementary_cellular_automaton
 * @see https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life
 */
export function generateCellularAutomata(
  options: CellularAutomataOptions,
): MusicEvent[] {
  const {
    steps,
    width,
    rule = 30,
    mode = '1d',
    stepDuration = 0.25,
    velocity = 80,
    rng = new DefaultRng(),
  } = options;

  const grid =
    mode === '2d'
      ? generate2D(steps, width, options.initialState, rng)
      : generate1D(steps, width, rule, options.initialState);

  const pitchMap = buildPitchMap(width, options);
  const events: MusicEvent[] = [];

  for (let step = 0; step < grid.length; step++) {
    const row = grid[step];
    for (let cell = 0; cell < row.length; cell++) {
      if (!row[cell]) continue;
      const midi = pitchMap[cell];
      events.push(
        createMusicEvent({
          pitch: midiToPitch(midi),
          midi,
          frequency: midiToFrequency(midi),
          duration: { value: stepDuration },
          velocity,
          startBeat: step * stepDuration,
        }),
      );
    }
  }

  return events;
}

function generate1D(
  steps: number,
  width: number,
  ruleNum: number,
  initial?: boolean[],
): boolean[][] {
  const grid: boolean[][] = [];

  let current = initial ?? new Array(width).fill(false);
  if (!initial) {
    current[Math.floor(width / 2)] = true;
  }
  grid.push([...current]);

  const ruleBits = new Array(8)
    .fill(false)
    .map((_, i) => ((ruleNum >> i) & 1) === 1);

  for (let step = 1; step < steps; step++) {
    const next = new Array(width).fill(false);
    for (let i = 0; i < width; i++) {
      const left = current[(i - 1 + width) % width] ? 1 : 0;
      const center = current[i] ? 1 : 0;
      const right = current[(i + 1) % width] ? 1 : 0;
      const index = (left << 2) | (center << 1) | right;
      next[i] = ruleBits[index];
    }
    grid.push(next);
    current = next;
  }

  return grid;
}

function generate2D(
  steps: number,
  width: number,
  initial?: boolean[],
  rng?: RandomSource,
): boolean[][] {
  const grid: boolean[][] = [];
  const height = width;

  // Flatten 2D state into 1D for each step, using width*height cells
  let state = new Array(width * height).fill(false);
  if (initial) {
    for (let i = 0; i < Math.min(initial.length, state.length); i++) {
      state[i] = initial[i];
    }
  } else if (rng) {
    state = state.map(() => rng.nextBool(0.3));
  } else {
    state[Math.floor((width * height) / 2)] = true;
  }

  for (let step = 0; step < steps; step++) {
    // Extract the middle row as the "current" state for music
    const midRow = Math.floor(height / 2);
    grid.push(state.slice(midRow * width, (midRow + 1) * width));

    // Conway's Game of Life step
    const next = new Array(width * height).fill(false);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let neighbors = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dy === 0 && dx === 0) continue;
            const ny = (y + dy + height) % height;
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

  return grid;
}

function buildPitchMap(
  width: number,
  options: CellularAutomataOptions,
): number[] {
  const { pitchMapping = 'chromatic', scale, baseOctave = 3 } = options;

  if (Array.isArray(pitchMapping)) {
    // Direct MIDI mapping
    const map = new Array(width).fill(60);
    for (let i = 0; i < width; i++) {
      map[i] = pitchMapping[i % pitchMapping.length];
    }
    return map;
  }

  if (pitchMapping === 'scale' && scale) {
    const low = Math.max(0, Math.min(9, Math.floor(baseOctave))) as Octave;
    const high = Math.max(0, Math.min(9, Math.floor(baseOctave) + 3)) as Octave;
    const pitches = scale.getPitches(low, high);
    return new Array(width).fill(0).map((_, i) => {
      const p = pitches[i % pitches.length];
      return p ? pitchToMidi(p) : (baseOctave + 1) * 12;
    });
  }

  // Chromatic: map cells to consecutive semitones
  const baseMidi = (baseOctave + 1) * 12;
  return new Array(width).fill(0).map((_, i) => baseMidi + i);
}
