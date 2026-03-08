import { effectiveDuration, type MusicEvent } from 'aleatoric';

interface Props {
  events: MusicEvent[];
  isPlaying?: boolean;
  playbackBeat?: number;
}

function pitchLabel(event: MusicEvent): string {
  if (event.isRest) return '—';
  if (event.pitch) return `${event.pitch.name}${event.pitch.octave}`;
  return `M${event.midi}`;
}

function durationLabel(event: MusicEvent): string {
  const v = event.duration.value;
  let s = v < 1 ? `1/${Math.round(1 / v)}` : `${v}`;
  if (event.duration.dotted) s += '.';
  if (event.duration.triplet) s += 't';
  return s;
}

function isEventActiveAtBeat(ev: MusicEvent, beat: number): boolean {
  const endBeat = ev.startBeat + effectiveDuration(ev.duration);
  return ev.startBeat <= beat && beat < endBeat;
}

export function EventDisplay({
  events,
  isPlaying = false,
  playbackBeat = 0,
}: Props) {
  if (events.length === 0) {
    return (
      <div className="event-display empty">
        <p>No events yet — configure parameters and click Generate.</p>
      </div>
    );
  }

  return (
    <div className="event-display">
      <div className="event-table-header">
        <span>#</span>
        <span>Beat</span>
        <span>Pitch</span>
        <span>MIDI</span>
        <span>Hz</span>
        <span>Dur</span>
        <span>Vel</span>
      </div>
      <div className="event-list">
        {events.map((ev, i) => {
          const isCurrent = isPlaying && isEventActiveAtBeat(ev, playbackBeat);
          return (
            <div
              key={`${ev.startBeat}-${ev.midi}-${ev.duration.value}-${ev.velocity}-${ev.frequency}`}
              className={`event-row${ev.isRest ? ' is-rest' : ''}${isCurrent ? ' is-current' : ''}`}
            >
              <span className="ev-index">{i + 1}</span>
              <span className="ev-beat">{ev.startBeat.toFixed(2)}</span>
              <span className="ev-pitch">{pitchLabel(ev)}</span>
              <span className="ev-midi">{ev.isRest ? '—' : ev.midi}</span>
              <span className="ev-hz">
                {ev.isRest ? '—' : ev.frequency.toFixed(1)}
              </span>
              <span className="ev-dur">{durationLabel(ev)}</span>
              <span className="ev-vel">{ev.isRest ? '—' : ev.velocity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
