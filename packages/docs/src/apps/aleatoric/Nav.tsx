import DocsSidebarNav from '@docs-shared/components/DocsSidebarNav';

const SECTIONS = [
  {
    step: 1,
    href: '#intro',
    label: 'Overview',
    desc: 'Purpose & capabilities',
  },
  {
    step: 2,
    href: '#quickstart',
    label: 'Quickstart',
    desc: 'Install & minimal example',
  },
  {
    step: 3,
    href: '#core-notes',
    label: 'Notes & Pitch',
    desc: 'Pitch, MIDI, transpose',
  },
  {
    step: 4,
    href: '#core-intervals',
    label: 'Intervals',
    desc: 'Names, consonance',
  },
  { step: 5, href: '#scales', label: 'Scales', desc: 'Scale types & spelling' },
  { step: 6, href: '#chords', label: 'Chords', desc: 'Voicings, not random' },
  {
    step: 7,
    href: '#core-rhythm',
    label: 'Rhythm',
    desc: 'Durations & beats',
  },
  {
    step: 8,
    href: '#gen-constraints',
    label: 'Constraints',
    desc: 'Post-process events',
  },
  {
    step: 9,
    href: '#random-pitch',
    label: 'Random Pitch',
    desc: 'IID picks from a pool',
  },
  {
    step: 10,
    href: '#random-rhythm',
    label: 'Random Rhythm',
    desc: 'Durations & rests',
  },
  {
    step: 11,
    href: '#markov',
    label: 'Markov Chains',
    desc: 'N-gram transitions',
  },
  {
    step: 12,
    href: '#chance-ops',
    label: 'Chance Operations',
    desc: 'Independent params',
  },
  {
    step: 13,
    href: '#cellular',
    label: 'Cellular Automata',
    desc: 'Game of Life → notes',
  },
  {
    step: 14,
    href: '#perlin-noise',
    label: 'Perlin noise',
    desc: 'Smooth pitch contour',
  },
  {
    step: 15,
    href: '#dice-music',
    label: 'Dice Music',
    desc: '2d6 → measure fragments',
  },
  {
    step: 16,
    href: '#random-rng',
    label: 'RNG & Chance',
    desc: 'Seeded PRNG & choices',
  },
  {
    step: 17,
    href: '#random-distributions',
    label: 'Distributions',
    desc: 'Gaussian, Poisson, …',
  },
  {
    step: 18,
    href: '#random-dice',
    label: 'Dice & Coins',
    desc: 'Dice, I Ching',
  },
  {
    step: 19,
    href: '#core-timeline',
    label: 'Timeline',
    desc: 'Merge, quantize, slice',
  },
  {
    step: 20,
    href: '#core-events',
    label: 'MusicEvent',
    desc: 'Note & rest factory',
  },
  {
    step: 21,
    href: '#core-midi',
    label: 'MIDI & player',
    desc: 'Scheduling & bytes',
  },
  {
    step: 22,
    href: '#core-playback',
    label: 'Synthesis bridge',
    desc: 'Web Audio adapters',
  },
];

const GROUPS = [
  { label: 'Start', start: 0, end: 2 },
  { label: 'Library', start: 2, end: 8 },
  { label: 'Generators', start: 8, end: 15 },
  { label: 'Randomness & playback', start: 15, end: 22 },
];

export default function Nav() {
  return (
    <DocsSidebarNav
      logo="aleatoric"
      tagline="Core library"
      sections={SECTIONS}
      groups={GROUPS}
    />
  );
}
