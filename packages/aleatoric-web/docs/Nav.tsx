import { useEffect, useState } from 'react';

const SECTIONS = [
  { href: '#scales', label: 'Scales' },
  { href: '#chords', label: 'Chords' },
  { href: '#random-pitch', label: 'Random Pitch' },
  { href: '#random-rhythm', label: 'Random Rhythm' },
  { href: '#markov', label: 'Markov Chains' },
  { href: '#chance-ops', label: 'Chance Operations' },
  { href: '#lsystem', label: 'L-Systems' },
  { href: '#cellular', label: 'Cellular Automata' },
  { href: '#ambient', label: 'Ambient Generator' },
  { href: '#constraints', label: 'Constraints' },
  { href: '#synths', label: 'Synth Comparison' },
  { href: '#composition', label: 'Full Score' },
];

const GROUPS = [
  { label: 'Explore', start: 0, end: 2 },
  { label: 'Generators', start: 2, end: 9 },
  { label: 'Processing', start: 9, end: 10 },
  { label: 'Audio', start: 10, end: 11 },
  { label: 'Composition', start: 11, end: 12 },
];

export default function Nav() {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const sections = document.querySelectorAll('main section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -70% 0px' },
    );
    for (const s of sections) {
      observer.observe(s);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav>
      <div className="logo">aleatoric</div>
      <div className="tagline">Music through chance</div>
      {GROUPS.map((g) => (
        <div key={g.label}>
          <div className="group-label">{g.label}</div>
          {SECTIONS.slice(g.start, g.end).map(({ href, label }) => {
            const isActive = activeId === href.slice(1);
            return (
              <a
                key={href}
                href={href}
                className={isActive ? 'active' : ''}
                aria-current={isActive ? 'location' : undefined}
              >
                {label}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
