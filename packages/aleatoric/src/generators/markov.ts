import { midiToFrequency, midiToPitch } from '../core/note.js';
import { MusicEvent } from '../core/types.js';
import { DefaultRng } from '../random/rng.js';
import { RandomSource } from '../random/types.js';
import { WeightedItem, weightedChoice } from '../random/weighted.js';
import { createMusicEvent } from './types.js';

export type TransitionMatrix = Record<string, Record<string, number>>;

export interface MarkovOptions {
  count: number;
  /** Transition matrix: state -> { nextState -> weight } */
  transitionMatrix: TransitionMatrix;
  /** Initial state. If omitted, picks randomly from available states */
  initialState?: string;
  /** Interpret states as MIDI numbers (default true) */
  statesAreMidi?: boolean;
  /** Duration for each note (default 1 beat) */
  duration?: number;
  /** Velocity (default 80) */
  velocity?: number;
  rng?: RandomSource;
}

/** Build a transition matrix from a sequence of observed states */
export function buildTransitionMatrix(
  sequence: string[],
  order: number = 1,
): TransitionMatrix {
  const matrix: TransitionMatrix = {};

  for (let i = 0; i < sequence.length - order; i++) {
    const key = sequence.slice(i, i + order).join(',');
    const next = sequence[i + order];
    if (!matrix[key]) matrix[key] = {};
    matrix[key][next] = (matrix[key][next] || 0) + 1;
  }

  return matrix;
}

/** Build a transition matrix from a sequence of MIDI numbers */
export function buildMidiTransitionMatrix(
  midiSequence: number[],
  order: number = 1,
): TransitionMatrix {
  return buildTransitionMatrix(midiSequence.map(String), order);
}

/**
 * For order > 1, the first emitted MIDI is the last symbol of the randomly chosen
 * initial n-gram (the “current” state before the first transition).
 *
 * @see https://en.wikipedia.org/wiki/Markov_chain
 */
export function generateMarkovSequence(options: MarkovOptions): MusicEvent[] {
  const {
    count,
    transitionMatrix,
    statesAreMidi = true,
    duration = 1,
    velocity = 80,
    rng = new DefaultRng(),
  } = options;

  const allStates = Object.keys(transitionMatrix);
  if (allStates.length === 0) {
    throw new Error('Transition matrix is empty');
  }

  let currentState =
    options.initialState ?? allStates[rng.nextInt(0, allStates.length - 1)];
  const events: MusicEvent[] = [];
  let beat = 0;

  for (let i = 0; i < count; i++) {
    const parts = currentState.split(',');
    const lastPart = parts[parts.length - 1];
    const midi =
      statesAreMidi && lastPart !== undefined ? parseInt(lastPart, 10) : 60;
    const pitch = midiToPitch(midi);

    events.push(
      createMusicEvent({
        pitch,
        midi,
        frequency: midiToFrequency(midi),
        duration: { value: duration },
        velocity,
        startBeat: beat,
      }),
    );

    beat += duration;

    const transitions = transitionMatrix[currentState];
    if (!transitions || Object.keys(transitions).length === 0) {
      // Dead end: pick a random state to continue
      currentState = allStates[rng.nextInt(0, allStates.length - 1)];
    } else {
      const items: WeightedItem<string>[] = Object.entries(transitions).map(
        ([state, weight]) => ({ value: state, weight }),
      );
      const nextLast = weightedChoice(items, rng);
      // For higher-order chains, shift the key window
      const parts = currentState.split(',');
      if (parts.length > 1) {
        currentState = [...parts.slice(1), nextLast].join(',');
      } else {
        currentState = nextLast;
      }
    }
  }

  return events;
}
