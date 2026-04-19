import DocsPageHero from '@docs-shared/components/DocsPageHero';
import AleatoricStaticCategorySection from './components/AleatoricStaticCategorySection';
import Nav from './Nav';
import AmbientSection from './sections/AmbientSection';
import CellularAutomata from './sections/CellularAutomata';
import ChanceOps from './sections/ChanceOps';
import ChordExplorer from './sections/ChordExplorer';
import DiceMusicSection from './sections/DiceMusicSection';
import MarkovSection from './sections/MarkovSection';
import RandomPitch from './sections/RandomPitch';
import RandomRhythm from './sections/RandomRhythm';
import ScaleExplorer from './sections/ScaleExplorer';

export default function AleatoricApp() {
  return (
    <div className="root-layout">
      <div className="root-content">
        <div className="aleatoric-docs">
          <Nav />
          <main className="docs-main">
            <DocsPageHero
              id="intro"
              className="docs-page-intro"
              title="aleatoric"
            >
              <p className="desc">
                <strong>aleatoric</strong> is a TypeScript library for{' '}
                <strong>algorithmic and aleatoric music</strong>—using rules,
                randomness, and process as musical material, in the spirit of
                composers who made indeterminacy part of the work itself.
              </p>
              <p className="desc">
                It gives you typed pitch and rhythm primitives (through chords
                and meters), a seeded PRNG with statistical distributions plus
                dice- and I&nbsp;Ching–style chance, and generators: random
                pitch and rhythm, Markov chains, cellular automata (Game of
                Life), Cage-style chance operations, dice-music tables, and
                Perlin noise contours. Constraint helpers reshape any{' '}
                <code>MusicEvent[]</code>; merge and edit in a{' '}
                <code>Timeline</code>. To hear it, pair <code>MidiPlayer</code>{' '}
                with any <code>MidiOutput</code>, or{' '}
                <code>SynthesisScheduler</code> with a{' '}
                <code>SynthesisAdapter</code> for Web Audio. The library has
                zero runtime dependencies—you supply the instruments and
                transports.
              </p>
            </DocsPageHero>
            <section id="quickstart" className="docs-page-quickstart">
              <h2>Quickstart</h2>
              <p className="desc">
                Install the package, then generate a short sequence of{' '}
                <code>MusicEvent</code>s you can wrap in a <code>Timeline</code>{' '}
                or feed to MIDI/audio players.
              </p>
              <pre className="code-block open">
                <code>{`npm install aleatoric@beta`}</code>
              </pre>
              <h3>TypeScript</h3>
              <pre className="code-block open">
                <code>{`import { Scale, generateRandomPitches, SeededRng } from 'aleatoric';

const events = generateRandomPitches({
  count: 16,
  scale: Scale.pentatonic('C'),
  low: 48,
  high: 84,
  distribution: 'gaussian',
  rng: new SeededRng(42),
});`}</code>
              </pre>
            </section>
            <div className="docs-page-body">
              <AleatoricStaticCategorySection categoryId="core-notes" />
              <AleatoricStaticCategorySection categoryId="core-intervals" />
              <ScaleExplorer />
              <ChordExplorer />
              <AleatoricStaticCategorySection categoryId="core-rhythm" />
              <AleatoricStaticCategorySection categoryId="gen-constraints" />
              <RandomPitch />
              <RandomRhythm />
              <MarkovSection />
              <ChanceOps />
              <CellularAutomata />
              <AmbientSection />
              <DiceMusicSection />
              <AleatoricStaticCategorySection categoryId="random-rng" />
              <AleatoricStaticCategorySection categoryId="random-distributions" />
              <AleatoricStaticCategorySection categoryId="random-dice" />
              <AleatoricStaticCategorySection categoryId="core-timeline" />
              <AleatoricStaticCategorySection categoryId="core-events" />
              <AleatoricStaticCategorySection categoryId="core-midi" />
              <AleatoricStaticCategorySection categoryId="core-playback" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
