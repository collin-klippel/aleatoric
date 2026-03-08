import { controlChange, noteOff, noteOn } from 'aleatoric';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('easymidi', () => {
  const outputs: string[] = ['IAC Driver Bus 1', 'USB MIDI'];
  class Output {
    name: string;
    private _calls: Array<{ event: string; params?: unknown }> = [];
    constructor(name: string, _virtual?: boolean) {
      this.name = name;
    }
    send(event: string, params?: unknown) {
      this._calls.push({ event, params });
    }
    close() {}
    isPortOpen() {
      return true;
    }
    get calls() {
      return this._calls;
    }
  }
  return { Output, getOutputs: () => outputs };
});

import { NodeMidiOutput } from './node-midi-output.js';

describe('NodeMidiOutput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listPorts', () => {
    it('returns available ports from easymidi', () => {
      const ports = NodeMidiOutput.listPorts();
      expect(ports).toEqual(['IAC Driver Bus 1', 'USB MIDI']);
    });
  });

  describe('openVirtual', () => {
    it('creates a virtual port with the given name', () => {
      const output = NodeMidiOutput.openVirtual('test-port');
      expect(output.name).toBe('test-port');
    });

    it('defaults to "aleatoric" as the name', () => {
      const output = NodeMidiOutput.openVirtual();
      expect(output.name).toBe('aleatoric');
    });
  });

  describe('connect', () => {
    it('connects to a named port', () => {
      const output = NodeMidiOutput.connect('IAC Driver Bus 1');
      expect(output.name).toBe('IAC Driver Bus 1');
    });

    it('throws when the port is not found', () => {
      expect(() => NodeMidiOutput.connect('Nonexistent')).toThrow(/not found/);
    });
  });

  describe('send', () => {
    // Access the private `port` property to inspect calls sent to the mock.
    // biome-ignore lint/suspicious/noExplicitAny: accessing mock internals
    const getPort = (output: NodeMidiOutput) => (output as any).port;

    it('translates note-on bytes to easymidi noteon event', () => {
      const output = NodeMidiOutput.openVirtual('test');
      const data = noteOn(60, 100, 0);
      output.send(data);

      expect(getPort(output).calls).toContainEqual({
        event: 'noteon',
        params: { note: 60, velocity: 100, channel: 0 },
      });
    });

    it('translates note-on with velocity 0 as noteoff', () => {
      const output = NodeMidiOutput.openVirtual('test');
      output.send(noteOn(60, 0, 0));

      expect(getPort(output).calls).toContainEqual({
        event: 'noteoff',
        params: { note: 60, velocity: 0, channel: 0 },
      });
    });

    it('translates note-off bytes', () => {
      const output = NodeMidiOutput.openVirtual('test');
      output.send(noteOff(64, 0, 3));

      expect(getPort(output).calls).toContainEqual({
        event: 'noteoff',
        params: { note: 64, velocity: 0, channel: 3 },
      });
    });

    it('translates CC bytes', () => {
      const output = NodeMidiOutput.openVirtual('test');
      output.send(controlChange(7, 100, 0));

      expect(getPort(output).calls).toContainEqual({
        event: 'cc',
        params: { controller: 7, value: 100, channel: 0 },
      });
    });

    it('ignores empty data', () => {
      const output = NodeMidiOutput.openVirtual('test');
      output.send([]);
      expect(getPort(output).calls).toHaveLength(0);
    });
  });
});
