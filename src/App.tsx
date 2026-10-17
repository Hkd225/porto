import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Focus } from './components/Focus';
import { Manifesto } from './components/Manifesto';
import { Work } from './components/Work';
import { Models } from './components/Models';
import { Writing } from './components/Writing';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { useSmoothScroll } from './hooks/useSmoothScroll';

export default function App() {
  useSmoothScroll();

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
        <Hero />
        <Focus />
        <Manifesto />
        <Work />
        <Models />
        <Writing />
        <About />
        <Contact />
      </main>

      {/* The one grain layer — shared film over every section and scene. */}
      <div aria-hidden="true" className="grain-layer" />
    </div>
  );
}
