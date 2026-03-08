import { midiToFrequency, midiToPitch } from '../core/note.js';
import { MusicEvent } from '../core/types.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { createMusicEvent } from './types.js';

export interface ProductionRule {
  /** Character(s) to match */
  match: string;
  /** Replacement string, or array for stochastic rules */
  replacement: string | { value: string; weight: number }[];
}

export interface LSystemInterpretation {
  /** Symbol -> action mapping */
  [symbol: string]: LSystemAction;
}

export type LSystemAction =
  | { type: 'note' }
  | { type: 'rest' }
  | { type: 'pitchUp'; semitones: number }
  | { type: 'pitchDown'; semitones: number }
  | { type: 'durationScale'; factor: number }
  | { type: 'velocityUp'; amount: number }
  | { type: 'velocityDown'; amount: number }
  | { type: 'push' }
  | { type: 'pop' }
  | { type: 'noop' };

/** Discriminator `type` strings for `LSystemAction`. */
export const LSYSTEM_ACTION_TYPES = [
  'note',
  'rest',
  'pitchUp',
  'pitchDown',
  'durationScale',
  'velocityUp',
  'velocityDown',
  'push',
  'pop',
  'noop',
] as const;

export type LSystemActionType = (typeof LSYSTEM_ACTION_TYPES)[number];

export interface LSystemOptions {
  axiom: string;
  rules: ProductionRule[];
  iterations: number;
  interpretation: LSystemInterpretation;
  /** Starting MIDI note (default 60) */
  startingPitch?: number;
  /** Base duration in beats (default 0.5) */
  baseDuration?: number;
  /** Base velocity (default 80) */
  baseVelocity?: number;
  rng?: RandomSource;
}

/** Expand an L-system string for n iterations */
export function expandLSystem(
  axiom: string,
  rules: ProductionRule[],
  iterations: number,
  rng: RandomSource = new DefaultRng(),
): string {
  let current = axiom;

  for (let iter = 0; iter < iterations; iter++) {
    let next = '';
    for (const char of current) {
      const rule = rules.find((r) => r.match === char);
      if (!rule) {
        next += char;
        continue;
      }
      if (typeof rule.replacement === 'string') {
        next += rule.replacement;
      } else {
        // Stochastic: weighted random selection
        const total = rule.replacement.reduce((s, r) => s + r.weight, 0);
        let r = rng.next() * total;
        for (const option of rule.replacement) {
          r -= option.weight;
          if (r <= 0) {
            next += option.value;
            break;
          }
        }
      }
    }
    current = next;
  }

  return current;
}

interface TurtleState {
  midi: number;
  duration: number;
  velocity: number;
}

/**
 * Interpret an expanded L-system string as music events.
 *
 * @see https://en.wikipedia.org/wiki/L-system
 */
export function generateLSystem(options: LSystemOptions): MusicEvent[] {
  const {
    axiom,
    rules,
    iterations,
    interpretation,
    startingPitch = 60,
    baseDuration = 0.5,
    baseVelocity = 80,
    rng = new DefaultRng(),
  } = options;

  const expanded = expandLSystem(axiom, rules, iterations, rng);
  const events: MusicEvent[] = [];
  let beat = 0;

  const state: TurtleState = {
    midi: startingPitch,
    duration: baseDuration,
    velocity: baseVelocity,
  };
  const stack: TurtleState[] = [];

  for (const char of expanded) {
    const action = interpretation[char];
    if (!action) continue;

    switch (action.type) {
      case 'note': {
        const midi = Math.max(0, Math.min(127, state.midi));
        events.push(
          createMusicEvent({
            pitch: midiToPitch(midi),
            midi,
            frequency: midiToFrequency(midi),
            duration: { value: state.duration },
            velocity: Math.max(1, Math.min(127, state.velocity)),
            startBeat: beat,
          }),
        );
        beat += state.duration;
        break;
      }
      case 'rest':
        events.push(
          createMusicEvent({
            midi: 0,
            frequency: 0,
            duration: { value: state.duration },
            velocity: 0,
            startBeat: beat,
            isRest: true,
          }),
        );
        beat += state.duration;
        break;
      case 'pitchUp':
        state.midi += action.semitones;
        break;
      case 'pitchDown':
        state.midi -= action.semitones;
        break;
      case 'durationScale':
        state.duration *= action.factor;
        break;
      case 'velocityUp':
        state.velocity += action.amount;
        break;
      case 'velocityDown':
        state.velocity -= action.amount;
        break;
      case 'push':
        stack.push({ ...state });
        break;
      case 'pop': {
        const restored = stack.pop();
        if (restored) {
          state.midi = restored.midi;
          state.duration = restored.duration;
          state.velocity = restored.velocity;
        }
        break;
      }
      case 'noop':
        break;
    }
  }

  return events;
}
