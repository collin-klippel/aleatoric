import { afterEach, describe, expect, it, vi } from 'vitest';
import { WebMidiOutput } from './web-midi-output.js';

type FakePort = {
  id: string;
  name?: string;
  send: ReturnType<typeof vi.fn>;
  close: ReturnType<typeof vi.fn>;
};

function createOutputMap(ports: FakePort[]) {
  return {
    forEach(cb: (port: FakePort) => void) {
      for (const p of ports) cb(p);
    },
  };
}

function createAccess(ports: FakePort[]) {
  return { outputs: createOutputMap(ports) };
}

describe('WebMidiOutput', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function installNavigator(ports: FakePort[]) {
    vi.stubGlobal('navigator', {
      requestMIDIAccess: vi.fn().mockResolvedValue(createAccess(ports)),
    } as Navigator);
  }

  describe('listOutputs', () => {
    it('returns one WebMidiOutput per port', async () => {
      const send = vi.fn();
      const close = vi.fn();
      installNavigator([
        { id: 'a', name: 'Port A', send, close },
        { id: 'b', name: 'Port B', send, close },
      ]);

      const outs = await WebMidiOutput.listOutputs();
      expect(outs).toHaveLength(2);
      expect(outs[0].name).toBe('Port A');
      expect(outs[1].name).toBe('Port B');
      expect(navigator.requestMIDIAccess).toHaveBeenCalledOnce();
    });
  });

  describe('connect', () => {
    it('returns first output when portName omitted', async () => {
      installNavigator([
        { id: '1', name: 'First', send: vi.fn(), close: vi.fn() },
        { id: '2', name: 'Second', send: vi.fn(), close: vi.fn() },
      ]);
      const out = await WebMidiOutput.connect();
      expect(out.name).toBe('First');
    });

    it('matches port name case-insensitively', async () => {
      installNavigator([
        { id: '1', name: 'My IAC Bus', send: vi.fn(), close: vi.fn() },
      ]);
      const out = await WebMidiOutput.connect('iac');
      expect(out.name).toBe('My IAC Bus');
    });

    it('throws when no outputs exist', async () => {
      installNavigator([]);
      await expect(WebMidiOutput.connect()).rejects.toThrow(
        'No MIDI outputs available',
      );
    });

    it('throws when name does not match', async () => {
      installNavigator([
        { id: '1', name: 'Only Port', send: vi.fn(), close: vi.fn() },
      ]);
      await expect(WebMidiOutput.connect('missing')).rejects.toThrow(
        /No MIDI output matching "missing"/,
      );
      await expect(WebMidiOutput.connect('missing')).rejects.toThrow(
        'Available: Only Port',
      );
    });
  });

  describe('instance', () => {
    it('forwards send to underlying port with timestamp', async () => {
      const send = vi.fn();
      const close = vi.fn();
      installNavigator([{ id: 'x', name: 'X', send, close }]);
      const out = await WebMidiOutput.connect();
      out.send([0x90, 60, 100], 12345.6);
      expect(send).toHaveBeenCalledWith([0x90, 60, 100], 12345.6);
    });

    it('calls close on underlying port', async () => {
      const send = vi.fn();
      const close = vi.fn();
      installNavigator([{ id: 'x', name: 'X', send, close }]);
      const out = await WebMidiOutput.connect();
      out.close();
      expect(close).toHaveBeenCalledOnce();
    });

    it('name falls back to Unknown MIDI Output when port has no name', async () => {
      const send = vi.fn();
      const close = vi.fn();
      installNavigator([{ id: 'x', send, close }]);
      const outs = await WebMidiOutput.listOutputs();
      expect(outs[0].name).toBe('Unknown MIDI Output');
    });
  });
});
