import {
  beatsPerMeasure,
  type MusicEvent,
  type TimeSignature,
} from 'aleatoric';

export interface SectionOptions {
  /** Name/label for this section (e.g., "A", "B", "intro") */
  name?: string;
  /** Number of measures in this section */
  measures: number;
  /** Time signature for this section (inherits from score if omitted) */
  timeSignature?: TimeSignature;
}

/**
 * A time-bounded region of a score with its own configuration.
 * Sections allow form structures like A-B-A where each section
 * uses different aleatoric rules.
 */
export class Section {
  readonly name: string;
  readonly measures: number;
  readonly timeSignature: TimeSignature | undefined;
  private events: MusicEvent[] = [];

  constructor(options: SectionOptions) {
    this.name = options.name ?? '';
    this.measures = options.measures;
    this.timeSignature = options.timeSignature;
  }

  /** Duration in beats using the given time signature */
  durationInBeats(fallbackTimeSignature: TimeSignature = [4, 4]): number {
    const ts = this.timeSignature ?? fallbackTimeSignature;
    return this.measures * beatsPerMeasure(ts);
  }

  setEvents(events: MusicEvent[]): void {
    this.events = events;
  }

  getEvents(): MusicEvent[] {
    return [...this.events];
  }
}
