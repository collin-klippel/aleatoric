import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMusicEvent } from '../generators/types.js';
import { Timeline } from '../scheduler/timeline.js';
import type {
  ScheduledSynthesisNote,
  SynthesisAdapter,
} from './synthesis-adapter.js';
import { SynthesisScheduler } from './synthesis-adapter.js';

function createMockAdapter(): SynthesisAdapter & {
  scheduled: ScheduledSynthesisNote[];
  cancelAt: number[];
} {
  const scheduled: ScheduledSynthesisNote[] = [];
  const cancelAt: number[] = [];
  return {
    scheduled,
    cancelAt,
    schedule(note) {
      scheduled.push({ ...note });
    },
    cancelAll(atTimeSec) {
      cancelAt.push(atTimeSec);
    },
  };
}

describe('SynthesisScheduler', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in stopped state', () => {
    const audio = { t: 0 };
    const adapter = createMockAdapter();
    const scheduler = new SynthesisScheduler(adapter, new Timeline([]), {
      getAudioTime: () => audio.t,
    });
    expect(scheduler.playbackState).toBe('stopped');
  });

  it('schedules non-rest events with correct audio times and duration', () => {
    const audio = { t: 1000 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, duration: { value: 1 } }),
      createMusicEvent({ midi: 64, startBeat: 1, duration: { value: 1 } }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    vi.advanceTimersByTime(20);

    expect(adapter.scheduled).toHaveLength(2);
    expect(adapter.scheduled[0]?.startTimeSec).toBe(1000);
    expect(adapter.scheduled[0]?.durationSec).toBe(0.5);
    expect(adapter.scheduled[0]?.midi).toBe(60);
    expect(adapter.scheduled[1]?.startTimeSec).toBeCloseTo(1000.5);
    expect(adapter.scheduled[1]?.midi).toBe(64);
    expect(adapter.scheduled[0]?.source).toBeDefined();
    expect(adapter.scheduled[0]?.frequencyHz).toBeDefined();

    scheduler.stop();
  });

  it('skips rest events', () => {
    const audio = { t: 0 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, isRest: true }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    vi.advanceTimersByTime(20);

    expect(adapter.scheduled).toHaveLength(0);
    scheduler.stop();
  });

  it('calls cancelAll on stop', () => {
    const audio = { t: 42 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    vi.advanceTimersByTime(20);
    scheduler.stop();

    expect(adapter.cancelAt).toContain(42);
  });

  it('does not throw when adapter omits cancelAll', () => {
    const audio = { t: 0 };
    const scheduled: ScheduledSynthesisNote[] = [];
    const adapter: SynthesisAdapter = {
      schedule(n) {
        scheduled.push(n);
      },
    };
    const scheduler = new SynthesisScheduler(
      adapter,
      new Timeline([createMusicEvent({ midi: 60, startBeat: 0 })]),
      { getAudioTime: () => audio.t, lookahead: 5, interval: 10 },
    );
    scheduler.play();
    vi.advanceTimersByTime(20);
    expect(() => scheduler.stop()).not.toThrow();
  });

  it('seek before play skips earlier events', () => {
    const audio = { t: 1000 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 62, startBeat: 2 }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 5,
      interval: 10,
    });

    scheduler.seek(2);
    expect(scheduler.beat).toBe(2);
    scheduler.play();
    vi.advanceTimersByTime(20);

    expect(adapter.scheduled).toHaveLength(1);
    expect(adapter.scheduled[0]?.midi).toBe(62);
    expect(adapter.scheduled[0]?.startTimeSec).toBeCloseTo(1000);
    scheduler.stop();
  });

  it('pauses and resumes from paused state', () => {
    const audio = { t: 1000 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, duration: { value: 1 } }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    expect(scheduler.playbackState).toBe('playing');
    audio.t = 1000.25;
    scheduler.pause();
    expect(scheduler.playbackState).toBe('paused');
    audio.t = 1000.75;
    scheduler.play();
    expect(scheduler.playbackState).toBe('playing');
    scheduler.stop();
  });

  it('seek while playing updates anchor and beat', () => {
    const audio = { t: 500 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 62, startBeat: 2 }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    vi.advanceTimersByTime(10);
    scheduler.seek(2);
    expect(scheduler.beat).toBe(2);
    scheduler.stop();
  });

  it('setTempo while playing adjusts anchor time', () => {
    const audio = { t: 200 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 5,
      interval: 10,
    });

    scheduler.play();
    vi.advanceTimersByTime(10);
    audio.t = 250;
    scheduler.setTempo(180);
    expect(() => vi.advanceTimersByTime(10)).not.toThrow();
    scheduler.stop();
  });

  it('keeps playing past timeline end when loop is enabled', () => {
    const audio = { t: 0 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, duration: { value: 1 } }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 2,
      interval: 10,
      loop: true,
    });

    scheduler.play();
    for (let i = 0; i < 100; i++) {
      audio.t += 0.1;
      vi.advanceTimersByTime(10);
    }
    expect(scheduler.playbackState).toBe('playing');
    scheduler.stop();
  });

  it('stops at timeline end when loop is disabled', () => {
    const audio = { t: 0 };
    const adapter = createMockAdapter();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, duration: { value: 1 } }),
    ]);
    const scheduler = new SynthesisScheduler(adapter, timeline, {
      getAudioTime: () => audio.t,
      bpm: 120,
      lookahead: 2,
      interval: 10,
      loop: false,
    });

    scheduler.play();
    for (let i = 0; i < 100; i++) {
      audio.t += 0.1;
      vi.advanceTimersByTime(10);
    }
    expect(scheduler.playbackState).toBe('stopped');
  });
});
