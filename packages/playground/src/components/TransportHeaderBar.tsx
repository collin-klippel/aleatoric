import type { PlaybackControls } from '../audio/use-playback';

type Props = Pick<
  PlaybackControls,
  'isPlaying' | 'bpm' | 'play' | 'stop' | 'setBpm'
> & {
  onGenerate: () => void;
  hasTimeline: boolean;
};

export function TransportHeaderBar({
  isPlaying,
  bpm,
  play,
  stop,
  setBpm,
  onGenerate,
  hasTimeline,
}: Props) {
  const handlePlayStop = async () => {
    if (isPlaying) {
      stop();
    } else {
      await play();
    }
  };

  return (
    <div className="transport-header-bar">
      <div className="transport-row transport-main">
        <button type="button" className="btn btn-generate" onClick={onGenerate}>
          Generate
        </button>
        <button
          type="button"
          className={`btn btn-play ${isPlaying ? 'playing' : ''}`}
          onClick={handlePlayStop}
          disabled={!hasTimeline}
          title={hasTimeline ? (isPlaying ? 'Stop' : 'Play') : 'Generate first'}
        >
          {isPlaying ? '⏹ Stop' : '▶ Play'}
        </button>
      </div>
      <div className="transport-control transport-header-tempo">
        <label htmlFor="bpm">Tempo</label>
        <input
          id="bpm"
          type="range"
          min={40}
          max={240}
          step={1}
          value={bpm}
          onChange={(e) => setBpm(e.target.valueAsNumber)}
        />
        <span className="transport-value">{bpm} BPM</span>
      </div>
    </div>
  );
}
