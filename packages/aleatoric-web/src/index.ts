// Audio

export { MidiPlayer, Timeline } from 'aleatoric';
export {
  AleatoricAudio,
  type AleatoricAudioOptions,
  type FrequencyBands,
} from './audio/context.js';
export {
  chainEffects,
  createDelay,
  createDistortion,
  createFilter,
  createReverb,
  type EffectNode,
  loadImpulseResponse,
} from './audio/effects.js';
export { applyEnvelope, totalEnvelopeDuration } from './audio/envelope.js';
export { FMSynth, type FMSynthOptions } from './audio/fm-synth.js';
export {
  OscillatorSynth,
  type OscillatorSynthOptions,
} from './audio/oscillator-synth.js';
export {
  type SampleMapping,
  SamplePlayer,
  type SamplePlayerOptions,
} from './audio/sample-player.js';
export {
  DEFAULT_ENVELOPE,
  type EnvelopeParams,
  type Instrument,
} from './audio/types.js';
export { Part, type PartOptions } from './composition/part.js';
export { Score, type ScoreOptions } from './composition/score.js';
// Composition
export { Section, type SectionOptions } from './composition/section.js';
// MIDI
export { WebMidiOutput } from './midi/web-midi-output.js';
export { Player } from './scheduler/player.js';
// Scheduler
export {
  type PlaybackState,
  type PlayerEvent,
  type PlayerEventCallback,
  type PlayerEventType,
  type SchedulerOptions,
} from './scheduler/types.js';
// Preview
export {
  ensureAudioReady,
  getAudioCtx,
  isPlaybackActive,
  type PreviewPlayOptions,
  previewPlay,
  previewStop,
  scheduleNote,
  subscribePlaybackState,
  warmAudioContext,
} from './web/preview.js';
