import { createMusicEvent, Timeline } from 'aleatoric';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Instrument } from '../audio/types.js';
import { Player } from './player.js';

function note(startBeat: number, duration = 0.25) {
  return createMusicEvent({
    startBeat,
    duration: { value: duration },
  });
}

function makePlayer(
  clock: { t: number },
  timeline: Timeline,
  instrument: Instrument,
  options?: ConstructorParameters<typeof Player>[4],
) {
  const audioContext = {
    get currentTime() {
      return clock.t;
    },
  } as unknown as AudioContext;
  const destination = {} as AudioNode;
  return new Player(audioContext, timeline, instrument, destination, {
    interval: 10,
    lookahead: 0.2,
    bpm: 120,
    ...options,
  });
}

describe('Player', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('ignores second play while already playing', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(0)]), instrument);
    const onPlay = vi.fn();
    player.on('play', onPlay);
    player.play();
    player.play();
    expect(onPlay).toHaveBeenCalledTimes(1);
    player.stop();
  });

  it('play then pause emits pause and stops scheduling', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(0)]), instrument);
    const heard: string[] = [];
    player.on('play', () => heard.push('play'));
    player.on('pause', () => heard.push('pause'));
    player.play();
    vi.advanceTimersByTime(10);
    expect(instrument.play).toHaveBeenCalled();
    player.pause();
    expect(heard).toEqual(['play', 'pause']);
    expect(player.playbackState).toBe('paused');
    const callsAfterPause = vi.mocked(instrument.play).mock.calls.length;
    vi.advanceTimersByTime(50);
    expect(vi.mocked(instrument.play).mock.calls.length).toBe(callsAfterPause);
  });

  it('resume from pause adjusts start time and continues scheduling', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(
      clock,
      new Timeline([note(0), note(4)]),
      instrument,
    );
    player.play();
    vi.advanceTimersByTime(10);
    player.pause();
    clock.t = 1;
    player.play();
    vi.advanceTimersByTime(10);
    expect(player.playbackState).toBe('playing');
    player.stop();
  });

  it('stop resets beat and emits stop', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    // Distant event so the first scheduler tick does not auto-stop the player.
    const player = makePlayer(clock, new Timeline([note(16)]), instrument);
    const stops: unknown[] = [];
    player.on('stop', (e) => stops.push(e));
    player.seek(0.5);
    expect(player.beat).toBe(0.5);
    player.play();
    vi.advanceTimersByTime(10);
    player.stop();
    expect(stops).toHaveLength(1);
    expect(player.beat).toBe(0);
    expect(player.playbackState).toBe('stopped');
  });

  it('seek updates next event index', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const timeline = new Timeline([note(0), note(2), note(4)]);
    const player = makePlayer(clock, timeline, instrument);
    player.seek(2);
    expect(player.beat).toBe(2);
    player.play();
    vi.advanceTimersByTime(10);
    const firstMidi = vi.mocked(instrument.play).mock.calls[0]?.[0]?.midi;
    expect(firstMidi).toBeDefined();
    player.stop();
  });

  it('setTempo while playing preserves beat by shifting startTime', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(16)]), instrument);
    player.play();
    vi.advanceTimersByTime(10);
    clock.t = 0.5;
    vi.advanceTimersByTime(10);
    const beatBefore = player.beat;
    expect(beatBefore).toBeGreaterThan(0);
    player.setTempo(60);
    expect(player.beat).toBe(beatBefore);
    expect(player.playbackState).toBe('playing');
    player.stop();
  });

  it('emits end after timeline completes without loop', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const timeline = new Timeline([note(0, 0.25)]);
    const player = makePlayer(clock, timeline, instrument, { loop: false });
    const types: string[] = [];
    player.on('play', () => types.push('play'));
    player.on('beat', () => types.push('beat'));
    player.on('stop', () => types.push('stop'));
    player.on('end', () => types.push('end'));
    player.play();
    vi.advanceTimersByTime(10);
    clock.t = 0.2;
    vi.advanceTimersByTime(10);
    expect(types).toContain('end');
    expect(types).toContain('stop');
    expect(player.playbackState).toBe('stopped');
  });

  it('loops timeline when loop is true', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const timeline = new Timeline([note(0, 0.25)]);
    const player = makePlayer(clock, timeline, instrument, { loop: true });
    player.play();
    vi.advanceTimersByTime(10);
    clock.t = 0.2;
    vi.advanceTimersByTime(10);
    expect(player.playbackState).toBe('playing');
    const playCount = vi.mocked(instrument.play).mock.calls.length;
    expect(playCount).toBeGreaterThanOrEqual(1);
    clock.t = 0.35;
    vi.advanceTimersByTime(10);
    expect(vi.mocked(instrument.play).mock.calls.length).toBeGreaterThanOrEqual(
      playCount,
    );
    player.stop();
  });

  it('forwards events to wildcard listeners', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(0)]), instrument);
    const all: string[] = [];
    player.on('*', (e) => all.push(e.type));
    player.play();
    expect(all).toContain('play');
    player.stop();
    expect(all).toContain('stop');
  });

  it('off removes a listener', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(0)]), instrument);
    const cb = vi.fn();
    player.on('play', cb);
    player.off('play', cb);
    player.play();
    expect(cb).not.toHaveBeenCalled();
    player.stop();
  });

  it('isolates listener errors', () => {
    const clock = { t: 0 };
    const instrument: Instrument = { play: vi.fn() };
    const player = makePlayer(clock, new Timeline([note(0)]), instrument);
    const good = vi.fn();
    player.on('play', () => {
      throw new Error('boom');
    });
    player.on('play', good);
    expect(() => player.play()).not.toThrow();
    expect(good).toHaveBeenCalled();
    player.stop();
  });
});
