import { SynthesisScheduler, type Timeline } from 'aleatoric';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import {
  type BasicOscType,
  defaultEffectsOptions,
  defaultSynthSoundOptions,
  type EffectsOptions,
  mergeEffectsOptions,
  mergeSynthSound,
  type SynthSoundOptions,
  ToneAdapter,
} from './tone-adapter';

export interface PlaybackControls {
  isPlaying: boolean;
  /** Current timeline position in beats while the scheduler is playing; 0 when stopped. */
  playbackBeat: number;
  bpm: number;
  reverbWet: number;
  isReverbUpdating: boolean;
  sound: SynthSoundOptions;
  effects: EffectsOptions;
  play: () => Promise<void>;
  stop: () => void;
  setBpm: (bpm: number) => void;
  setReverbWet: (wet: number) => void;
  patchSound: (partial: Partial<SynthSoundOptions>) => void;
  patchEffects: (
    partial: Parameters<ToneAdapter['applyEffectsOptions']>[0],
  ) => void;
  setOscillatorType: (t: BasicOscType) => void;
  setReverbDecay: (sec: number) => void;
  getScopeAnalyser: () => Tone.Analyser | null;
}

export function usePlayback(timeline: Timeline | null): PlaybackControls {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackBeat, setPlaybackBeat] = useState(0);
  const [bpm, setBpmState] = useState(120);
  const [reverbWet, setReverbWetState] = useState(0.15);
  const [isReverbUpdating, setIsReverbUpdating] = useState(false);
  const [sound, setSound] = useState<SynthSoundOptions>(() =>
    defaultSynthSoundOptions(),
  );
  const [effects, setEffects] = useState<EffectsOptions>(() =>
    defaultEffectsOptions(),
  );

  const adapterRef = useRef<ToneAdapter | null>(null);
  const schedulerRef = useRef<SynthesisScheduler | null>(null);

  useEffect(() => {
    const adapter = new ToneAdapter(defaultSynthSoundOptions(), 0.15);
    adapterRef.current = adapter;
    return () => {
      adapter.dispose();
      adapterRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!timeline || !adapterRef.current) return;

    const wasPlaying = schedulerRef.current?.playbackState === 'playing';
    schedulerRef.current?.stop();

    schedulerRef.current = new SynthesisScheduler(
      adapterRef.current,
      timeline,
      {
        bpm,
        lookahead: 0.1,
        interval: 25,
        loop: true,
        getAudioTime: () => Tone.now(),
      },
    );

    if (wasPlaying) {
      void schedulerRef.current.play();
    }
  }, [timeline, bpm]);

  const play = useCallback(async () => {
    await Tone.start();
    adapterRef.current?.startLfoEffects();

    if (!schedulerRef.current) return;
    schedulerRef.current.play();
    setIsPlaying(true);
  }, []);

  const stop = useCallback(() => {
    schedulerRef.current?.stop();
    setIsPlaying(false);
  }, []);

  const setBpm = useCallback((newBpm: number) => {
    setBpmState(newBpm);
    schedulerRef.current?.setTempo(newBpm);
  }, []);

  const setReverbWet = useCallback((wet: number) => {
    setReverbWetState(wet);
    adapterRef.current?.setReverb(wet);
  }, []);

  const patchSound = useCallback((partial: Partial<SynthSoundOptions>) => {
    setSound((prev) => mergeSynthSound(prev, partial));
    adapterRef.current?.applySoundOptions(partial);
  }, []);

  const setOscillatorType = useCallback(
    (t: BasicOscType) => {
      patchSound({ oscillatorType: t });
    },
    [patchSound],
  );

  const setReverbDecay = useCallback((sec: number) => {
    setSound((prev) => ({ ...prev, reverbDecaySec: sec }));
    const adapter = adapterRef.current;
    if (!adapter) return;
    setIsReverbUpdating(true);
    void adapter.setReverbDecay(sec).finally(() => {
      setIsReverbUpdating(false);
    });
  }, []);

  const patchEffects = useCallback(
    (partial: Parameters<ToneAdapter['applyEffectsOptions']>[0]) => {
      setEffects((prev) => mergeEffectsOptions(prev, partial));
      adapterRef.current?.applyEffectsOptions(partial);
    },
    [],
  );

  const getScopeAnalyser = useCallback((): Tone.Analyser | null => {
    return adapterRef.current?.scopeAnalyser ?? null;
  }, []);

  useEffect(() => {
    return () => {
      schedulerRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setPlaybackBeat(0);
      return;
    }
    const id = setInterval(() => {
      const sched = schedulerRef.current;
      if (!sched || sched.playbackState !== 'playing') return;
      const b = sched.beat;
      setPlaybackBeat((prev) => (prev === b ? prev : b));
    }, 25);
    return () => clearInterval(id);
  }, [isPlaying]);

  return {
    isPlaying,
    playbackBeat,
    bpm,
    reverbWet,
    isReverbUpdating,
    sound,
    effects,
    play,
    stop,
    setBpm,
    setReverbWet,
    patchSound,
    patchEffects,
    setOscillatorType,
    setReverbDecay,
    getScopeAnalyser,
  };
}
