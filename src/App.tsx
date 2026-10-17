import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FocusCarousel } from './components/FocusCarousel';
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
        <FocusCarousel />
        <Manifesto />
        <Work />
        <Models />
        <Writing />
        <About />
        <Contact />
      </main>
    </div>
  );
}
