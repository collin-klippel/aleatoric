import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createMusicEvent } from '../generators/types.js';
import { Timeline } from '../scheduler/timeline.js';
import { MidiPlayer } from './midi-player.js';
import type { MidiOutput } from './types.js';

function createMockOutput(): MidiOutput & { messages: number[][] } {
  const messages: number[][] = [];
  return {
    messages,
    name: 'mock',
    send(data: number[]) {
      messages.push([...data]);
    },
  };
}

function createTimestampMockOutput(): MidiOutput & {
  sends: Array<{ data: number[]; ts?: number }>;
} {
  const sends: Array<{ data: number[]; ts?: number }> = [];
  return {
    sends,
    name: 'mock-ts',
    send(data: number[], timestamp?: number) {
      sends.push({ data: [...data], ts: timestamp });
    },
  };
}

describe('MidiPlayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts in stopped state', () => {
    const output = createMockOutput();
    const timeline = new Timeline([]);
    const player = new MidiPlayer(output, timeline);
    expect(player.playbackState).toBe('stopped');
  });

  it('transitions through play / pause / stop states', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline);

    player.play();
    expect(player.playbackState).toBe('playing');

    player.pause();
    expect(player.playbackState).toBe('paused');

    player.play();
    expect(player.playbackState).toBe('playing');

    player.stop();
    expect(player.playbackState).toBe('stopped');
  });

  it('sends note-on and note-off in deferSend mode', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 64, velocity: 100, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
    });

    player.play();
    // The scheduler runs every 25ms; advance past the first tick.
    vi.advanceTimersByTime(30);

    const noteOnMsg = output.messages.find((m) => (m[0] & 0xf0) === 0x90);
    expect(noteOnMsg).toBeDefined();
    expect(noteOnMsg?.[1]).toBe(64);
    expect(noteOnMsg?.[2]).toBe(100);

    // Advance past the note duration (1 beat = 0.5s at 120 bpm = 500ms).
    vi.advanceTimersByTime(600);

    const noteOffMsg = output.messages.find((m) => (m[0] & 0xf0) === 0x80);
    expect(noteOffMsg).toBeDefined();
    expect(noteOffMsg?.[1]).toBe(64);

    player.stop();
  });

  it('sends allNotesOff on stop', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    player.play();
    vi.advanceTimersByTime(30);
    player.stop();

    const ccMsg = output.messages.find(
      (m) => (m[0] & 0xf0) === 0xb0 && m[1] === 123,
    );
    expect(ccMsg).toBeDefined();
  });

  it('skips rest events', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0, isRest: true }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    player.play();
    vi.advanceTimersByTime(30);

    const noteMessages = output.messages.filter((m) => (m[0] & 0xf0) === 0x90);
    expect(noteMessages).toHaveLength(0);

    player.stop();
  });

  it('emits play and stop events', () => {
    const output = createMockOutput();
    const timeline = new Timeline([]);
    const player = new MidiPlayer(output, timeline);

    const events: string[] = [];
    player.on('play', () => events.push('play'));
    player.on('stop', () => events.push('stop'));

    player.play();
    player.stop();

    expect(events).toContain('play');
    expect(events).toContain('stop');
  });

  it('sets tempo while playing', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    player.play();
    player.setTempo(180);
    vi.advanceTimersByTime(30);

    expect(player.playbackState).toBe('playing');
    player.stop();
  });

  it('respects MIDI channel option', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      channel: 5,
      deferSend: true,
    });

    player.play();
    vi.advanceTimersByTime(30);

    const noteOnMsg = output.messages.find((m) => (m[0] & 0xf0) === 0x90);
    expect(noteOnMsg).toBeDefined();
    expect((noteOnMsg?.[0] ?? 0) & 0x0f).toBe(5);

    player.stop();
  });

  it('passes DOM-style timestamps when deferSend is false', () => {
    const output = createTimestampMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, velocity: 80, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: false,
    });

    player.play();
    vi.advanceTimersByTime(30);

    const withTs = output.sends.filter(
      (s) => s.ts !== undefined && typeof s.ts === 'number',
    );
    expect(withTs.length).toBeGreaterThanOrEqual(1);
    expect(withTs.some((s) => (s.data[0] & 0xf0) === 0x90)).toBe(true);

    player.stop();
  });

  it('emits end when playback finishes without loop', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
      loop: false,
    });

    const types: string[] = [];
    player.on('end', () => types.push('end'));

    player.play();
    vi.advanceTimersByTime(700);

    expect(types).toContain('end');
    expect(player.playbackState).toBe('stopped');
  });

  it('does not emit end when timeline completes with loop enabled', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
      loop: true,
    });

    let ended = false;
    player.on('end', () => {
      ended = true;
    });

    player.play();
    vi.advanceTimersByTime(900);

    expect(ended).toBe(false);
    expect(player.playbackState).toBe('playing');

    player.stop();
  });

  it('seek skips earlier events', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 72, startBeat: 4 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
    });

    player.seek(4);
    expect(player.beat).toBe(4);
    player.play();
    vi.advanceTimersByTime(30);

    const noteOns = output.messages.filter((m) => (m[0] & 0xf0) === 0x90);
    expect(noteOns).toHaveLength(1);
    expect(noteOns[0]?.[1]).toBe(72);

    player.stop();
  });

  it('off removes a listener', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    let removedHeard = 0;
    let keptHeard = 0;
    const removed = (): void => {
      removedHeard++;
    };
    const kept = (): void => {
      keptHeard++;
    };

    player.on('stop', removed);
    player.on('stop', kept);
    player.off('stop', removed);

    player.play();
    player.stop();

    expect(removedHeard).toBe(0);
    expect(keptHeard).toBe(1);
  });

  it('isolates listener errors so other listeners still run', () => {
    const output = createMockOutput();
    const timeline = new Timeline([]);
    const player = new MidiPlayer(output, timeline);

    let ok = 0;
    player.on('play', () => {
      throw new Error('boom');
    });
    player.on('play', () => {
      ok++;
    });

    player.play();
    expect(ok).toBe(1);
    player.stop();
  });

  it('wildcard listener receives beat events', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    const types: string[] = [];
    player.on('*', (e) => types.push(e.type));

    player.play();
    vi.advanceTimersByTime(30);

    expect(types).toContain('beat');

    player.stop();
  });

  it('play() while already playing is a no-op', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    const plays: string[] = [];
    player.on('play', () => plays.push('play'));

    player.play();
    player.play();

    expect(plays).toHaveLength(1);
    player.stop();
  });

  it('pause() while stopped is a no-op', () => {
    const output = createMockOutput();
    const timeline = new Timeline([]);
    const player = new MidiPlayer(output, timeline);

    expect(() => player.pause()).not.toThrow();
    expect(player.playbackState).toBe('stopped');
  });

  it('stop() while already stopped does not throw', () => {
    const output = createMockOutput();
    const timeline = new Timeline([]);
    const player = new MidiPlayer(output, timeline);

    expect(() => player.stop()).not.toThrow();
    expect(player.playbackState).toBe('stopped');
  });

  it('resumes from paused position without replaying earlier events', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 72, startBeat: 4 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
    });

    player.play();
    // Advance past the first event but not to the second.
    vi.advanceTimersByTime(200);
    player.pause();
    expect(player.playbackState).toBe('paused');

    // Resume — should still be 'playing' and not re-emit note 60.
    const noteOnsBefore = output.messages.filter(
      (m) => (m[0] & 0xf0) === 0x90,
    ).length;

    player.play();
    expect(player.playbackState).toBe('playing');
    vi.advanceTimersByTime(30);

    // No additional note-ons for note 60 should have been sent from replay.
    const noteOnsAfter = output.messages.filter(
      (m) => (m[0] & 0xf0) === 0x90 && m[1] === 60,
    ).length;
    expect(noteOnsAfter).toBe(noteOnsBefore);

    player.stop();
  });

  it('seek while paused updates startTime so resume plays correctly', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 72, startBeat: 4 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
    });

    player.play();
    vi.advanceTimersByTime(50);
    player.pause();

    player.seek(4);
    expect(player.playbackState).toBe('paused');

    player.play();
    vi.advanceTimersByTime(30);

    const noteOns = output.messages.filter((m) => (m[0] & 0xf0) === 0x90);
    const notes = noteOns.map((m) => m[1]);
    expect(notes).toContain(72);

    player.stop();
  });

  it('seek past the last event sets nextEventIndex to end of timeline', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
      createMusicEvent({ midi: 64, startBeat: 2 }),
    ]);
    const player = new MidiPlayer(output, timeline, {
      bpm: 120,
      deferSend: true,
    });

    player.seek(999);
    player.play();
    vi.advanceTimersByTime(200);

    const noteOns = output.messages.filter((m) => (m[0] & 0xf0) === 0x90);
    expect(noteOns).toHaveLength(0);

    player.stop();
  });

  it('beat event carries a non-negative beat number', () => {
    const output = createMockOutput();
    const timeline = new Timeline([
      createMusicEvent({ midi: 60, startBeat: 0 }),
    ]);
    const player = new MidiPlayer(output, timeline, { deferSend: true });

    const beats: (number | undefined)[] = [];
    player.on('beat', (e) => beats.push(e.beat));

    player.play();
    vi.advanceTimersByTime(60);

    expect(beats.length).toBeGreaterThan(0);
    expect(beats.every((b) => typeof b === 'number' && b >= 0)).toBe(true);

    player.stop();
  });
});
