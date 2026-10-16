import { useCallback, useEffect, useRef, useState } from 'react';

import { refreshScrollTriggers } from './lib/gsap';

import { Backdrop, AmbientBackdrop, CustomCursor, ParallaxNumerals, Preloader, ScrollProgress } from './components/Chrome';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { SelectedWork } from './components/Work';
import { HorizontalBand } from './components/HorizontalBand';
import { CaseStudy } from './components/CaseStudy';
import { Interlude } from './components/Interlude';
import { Models } from './components/Models';
import { Writing } from './components/Writing';
import { Gallery } from './components/Gallery';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { CommandPalette } from './components/CommandPalette';
import { BackToTop } from './components/BackToTop';
import { ScrollVelocity } from './components/ScrollVelocity';
import { Curtain } from './components/Curtain';
import { HoverPreviewProvider } from './components/HoverPreview';

import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useSectionShortcuts } from './hooks/useSectionShortcuts';

export default function App() {
  // One smooth-scroll system for the whole app, started once.
  useSmoothScroll();
  useSectionShortcuts();

  const [ready, setReady] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const handleIntroDone = useCallback(() => setReady(true), []);

  /**
   * The intro finishing is the last point at which the document's height is
   * final. Scroll triggers cache their start/end on creation — during the very
   * first commit, with the preloader still up — so without this every scrubbed
   * scene below the fold measures a scroll offset that no longer exists and
   * renders as though it were already fully scrolled.
   */
  useEffect(() => {
    if (!ready) return;
    // One frame for the intro's own layout writes to land before measuring.
    const id = requestAnimationFrame(() => refreshScrollTriggers());
    return () => cancelAnimationFrame(id);
  }, [ready]);
  /** Scroll velocity and the curtain both act on the page body. */
  const mainRef = useRef<HTMLElement>(null);

  return (
    <>
      <a
        href="#work"
        className="mono-label sr-only rounded-sm bg-acid px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[300]"
      >
        Skip to work
      </a>

      <Preloader onDone={handleIntroDone} />
      <ScrollProgress />
      <ParallaxNumerals />
      <CustomCursor />
      <AmbientBackdrop />
      <Backdrop />

      <Navbar onSearch={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      <ScrollVelocity targetRef={mainRef} />
      <Curtain />

      {/* The provider owns the single shared hover preview; every card inside
          registers with it and the cover swaps between them. */}
      <HoverPreviewProvider>
        <main ref={mainRef} className="relative">
          <Hero ready={ready} />
          <Ticker />
          {/* Bridge, not a chapter: the frame opening between the index and
              002 / Selected work. Carries no numeral and no nav slot. */}
          <Interlude />
          <SelectedWork />
          <HorizontalBand />
          <CaseStudy />
          <Models />
          {/* Gallery — chapter 005. The focus taxonomy as an interactive
              dossier: the last media act before the page turns to prose. */}
          <Gallery />
          <Writing />
          <About />
          <Contact />
        </main>
      </HoverPreviewProvider>

      <BackToTop />
    </>
  );
}