import {
  beatsPerMeasure,
  type MusicEvent,
  type TimeSignature,
} from 'aleatoric';
import { Instrument } from '../audio/types.js';
import { Section, SectionOptions } from './section.js';

export interface PartOptions {
  /** Name for this part (e.g., "melody", "bass") */
  name?: string;
  /** The instrument to play this part */
  instrument: Instrument;
  /** A function that generates events for a given number of beats */
  generator: (beats: number) => MusicEvent[];
  /** Number of measures (used if no sections are defined) */
  measures?: number;
}

/**
 * A single voice/instrument line in a score.
 * Can be divided into sections with different generators,
 * or use a single generator for the whole part.
 */
export class Part {
  readonly name: string;
  readonly instrument: Instrument;
  private readonly generatorFn: (beats: number) => MusicEvent[];
  private readonly measures: number;
  private sections: Section[] = [];

  constructor(options: PartOptions) {
    this.name = options.name ?? '';
    this.instrument = options.instrument;
    this.generatorFn = options.generator;
    this.measures = options.measures ?? 16;
  }

  addSection(options: SectionOptions): Section {
    const section = new Section(options);
    this.sections.push(section);
    return section;
  }

  /**
   * Generate all events for this part.
   * If sections are defined, generates per-section with beat offsets.
   * Otherwise generates for the full part duration.
   */
  generateEvents(timeSignature: TimeSignature = [4, 4]): MusicEvent[] {
    if (this.sections.length > 0) {
      return this.generateSectionEvents(timeSignature);
    }

    const totalBeats = this.measures * beatsPerMeasure(timeSignature);
    return this.generatorFn(totalBeats);
  }

  private generateSectionEvents(timeSignature: TimeSignature): MusicEvent[] {
    const allEvents: MusicEvent[] = [];
    let beatOffset = 0;

    for (const section of this.sections) {
      const beats = section.durationInBeats(timeSignature);
      const events = this.generatorFn(beats);

      // Offset events and store in section
      const offsetEvents = events.map((e) => ({
        ...e,
        startBeat: e.startBeat + beatOffset,
      }));

      section.setEvents(offsetEvents);
      allEvents.push(...offsetEvents);
      beatOffset += beats;
    }

    return allEvents;
  }

  getSections(): Section[] {
    return [...this.sections];
  }
}
