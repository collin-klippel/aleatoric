export interface AleatoricAudioOptions {
  /** Master volume (0-1, default 0.8) */
  masterVolume?: number;
}

export interface FrequencyBands {
  bass: number;
  mid: number;
  high: number;
  overall: number;
}

/**
 * Manages the Web Audio AudioContext lifecycle, master gain, effects bus,
 * and a built-in AnalyserNode for frequency-band extraction.
 */
export class AleatoricAudio {
  private _context: AudioContext | null = null;
  private _masterGain: GainNode | null = null;
  private _effectsBus: GainNode | null = null;
  private _analyser: AnalyserNode | null = null;
  private _analyserBuffer: Uint8Array<ArrayBuffer> | null = null;
  private readonly masterVolume: number;

  constructor(options: AleatoricAudioOptions = {}) {
    this.masterVolume = options.masterVolume ?? 0.8;
  }

  get context(): AudioContext {
    if (!this._context) {
      this._context = new AudioContext();
      this.initNodes();
    }
    return this._context;
  }

  get masterGain(): GainNode {
    if (!this._masterGain) {
      this.context;
    }
    if (!this._masterGain) {
      throw new Error('AleatoricAudio: master gain not initialized');
    }
    return this._masterGain;
  }

  get effectsBus(): GainNode {
    if (!this._effectsBus) {
      this.context;
    }
    if (!this._effectsBus) {
      throw new Error('AleatoricAudio: effects bus not initialized');
    }
    return this._effectsBus;
  }

  /** The main output node instruments should connect to */
  get destination(): AudioNode {
    return this.masterGain;
  }

  /** The AnalyserNode wired after masterGain (before ctx.destination) */
  get analyser(): AnalyserNode {
    if (!this._analyser) {
      this.context;
    }
    if (!this._analyser) {
      throw new Error('AleatoricAudio: analyser not initialized');
    }
    return this._analyser;
  }

  private initNodes(): void {
    if (!this._context) {
      throw new Error('AleatoricAudio: AudioContext missing in initNodes');
    }
    const ctx = this._context;

    this._masterGain = ctx.createGain();
    this._masterGain.gain.value = this.masterVolume;

    this._analyser = ctx.createAnalyser();
    this._analyser.fftSize = 256;
    this._analyser.smoothingTimeConstant = 0.85;
    this._analyserBuffer = new Uint8Array(
      this._analyser.frequencyBinCount,
    ) as Uint8Array<ArrayBuffer>;

    // Chain: masterGain → analyser → destination
    this._masterGain.connect(this._analyser);
    this._analyser.connect(ctx.destination);

    this._effectsBus = ctx.createGain();
    this._effectsBus.gain.value = 1;
    this._effectsBus.connect(this._masterGain);
  }

  /**
   * Read frequency band levels from the AnalyserNode.
   * Splits the FFT bins into bass (bottom 15%), mid (15–50%), and high (50–100%).
   * Returns normalized 0–1 values. Safe to call every animation frame.
   */
  getFrequencyBands(): FrequencyBands {
    if (!this._analyser || !this._analyserBuffer) {
      return { bass: 0, mid: 0, high: 0, overall: 0 };
    }

    this._analyser.getByteFrequencyData(this._analyserBuffer);

    const bins = this._analyserBuffer.length;
    const bassEnd = Math.floor(bins * 0.15);
    const midEnd = Math.floor(bins * 0.5);

    let bass = 0;
    let mid = 0;
    let high = 0;

    for (let i = 0; i < bassEnd; i++) bass += this._analyserBuffer[i];
    for (let i = bassEnd; i < midEnd; i++) mid += this._analyserBuffer[i];
    for (let i = midEnd; i < bins; i++) high += this._analyserBuffer[i];

    bass /= bassEnd * 255;
    mid /= (midEnd - bassEnd) * 255;
    high /= (bins - midEnd) * 255;

    return { bass, mid, high, overall: (bass + mid + high) / 3 };
  }

  /** Resume a suspended context (required after user gesture in browsers) */
  async resume(): Promise<void> {
    if (this._context?.state === 'suspended') {
      await this._context.resume();
    }
  }

  /** Suspend the audio context to save resources */
  async suspend(): Promise<void> {
    if (this._context?.state === 'running') {
      await this._context.suspend();
    }
  }

  /** Close and dispose the audio context */
  async dispose(): Promise<void> {
    if (this._context) {
      await this._context.close();
      this._context = null;
      this._masterGain = null;
      this._effectsBus = null;
      this._analyser = null;
      this._analyserBuffer = null;
    }
  }

  /** Set master volume (0-1) */
  setVolume(volume: number): void {
    if (this._masterGain) {
      this._masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }
}
