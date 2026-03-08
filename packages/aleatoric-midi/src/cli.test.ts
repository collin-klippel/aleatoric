import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('easymidi', () => {
  class Output {
    name: string;
    constructor(name: string, _virtual?: boolean) {
      this.name = name;
    }
    send() {}
    close() {}
    isPortOpen() {
      return true;
    }
  }
  return {
    Output,
    getOutputs: () => ['IAC Driver Bus 1'],
  };
});

vi.mock('aleatoric', async (importOriginal) => {
  const mod = await importOriginal<typeof import('aleatoric')>();
  return {
    ...mod,
    MidiPlayer: vi.fn(),
  };
});

import * as aleatoric from 'aleatoric';
import { main } from './cli.js';

describe('CLI argument parsing', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    process.exitCode = undefined;
  });

  it('prints help without error', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    main(['--help']);
    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('Usage');
  });

  it('lists ports without error', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    main(['--list-ports']);
    expect(consoleSpy).toHaveBeenCalled();
    const output = consoleSpy.mock.calls.map((c) => c[0]).join('\n');
    expect(output).toContain('MIDI output ports');
  });

  it('rejects unknown generator', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    main(['--generator', 'nope']);
    expect(process.exitCode).toBe(1);
  });

  it('rejects invalid channel', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    main(['--channel', '20']);
    expect(process.exitCode).toBe(1);
  });
});

describe('CLI main playback path', () => {
  afterEach(() => {
    vi.mocked(aleatoric.MidiPlayer).mockClear();
    process.exitCode = undefined;
  });

  it('constructs MidiPlayer, plays, and exits when end fires', () => {
    let endCb: (() => void) | undefined;
    const play = vi.fn(() => {
      endCb?.();
    });
    const stop = vi.fn();
    const on = vi.fn((type: string, cb: () => void) => {
      if (type === 'end') endCb = cb;
    });

    vi.mocked(aleatoric.MidiPlayer).mockImplementation(
      () =>
        ({
          play,
          stop,
          on,
        }) as unknown as InstanceType<(typeof aleatoric)['MidiPlayer']>,
    );

    const exitSpy = vi
      .spyOn(process, 'exit')
      .mockImplementation(() => undefined as never);
    vi.spyOn(console, 'log').mockImplementation(() => {});

    main([]);

    expect(aleatoric.MidiPlayer).toHaveBeenCalled();
    expect(play).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
  });
});
