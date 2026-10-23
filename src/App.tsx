import { useCallback, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Boot } from './components/Boot';
import { Assistant } from './components/Assistant';
import { Hero } from './components/Hero';
import { Focus } from './components/Focus';
import { Manifesto } from './components/Manifesto';
import { Work } from './components/Work';
import { Models } from './components/Models';
import { Writing } from './components/Writing';
import { About } from './components/About';
import { Certificates } from './components/Certificates';
import { Contact } from './components/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

  /* The boot veil owns the first beat: 'veil' covers, 'armed' is the
     curtain mid-lift (hero intro joins), 'gone' unmounts the veil. */
  const [bootStage, setBootStage] = useState<'veil' | 'armed' | 'gone'>('veil');
  /* stable — the veil's effect must never re-run mid-ceremony */
  const armBoot = useCallback(() => setBootStage((s) => (s === 'veil' ? 'armed' : s)), []);
  const endBoot = useCallback(() => setBootStage('gone'), []);

  return (
    <div className="relative min-h-svh bg-ink text-bone">
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-bone focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:text-ink"
      >
        Skip to content
      </a>

      <Navbar />

      <main>
        <Hero statementArmed={bootStage !== 'veil'} />
        <Focus />
        <Manifesto />
        <Work />
        <Models />
        <Writing />
        <About />
        <Certificates />
        <Contact />
      </main>

      {/* The resident Q&A agent — dock + ledger; the key stays server-side. */}
      <Assistant />

      {bootStage !== 'gone' && <Boot onArm={armBoot} onDone={endBoot} />}

      {/* The one grain layer — shared film over every section and scene. */}
      <div aria-hidden="true" className="grain-layer" />
    </div>
  );
}
