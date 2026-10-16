import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, refreshScrollTriggers } from '../lib/gsap';

/**
 * Smooth scrolling via Lenis, driven from the GSAP ticker.
 *
 * Exactly one scroll system is active at a time — Lenis *is* the scroller, and
 * ScrollTrigger is fed from it. We deliberately do not also set
 * `scroll-behavior: smooth` in CSS, which would fight Lenis.
 *
 * Disabled entirely when the user prefers reduced motion; native scrolling
 * takes over and ScrollTrigger still works via its own listener.
 */
export function useSmoothScroll(): void {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);

    // Expose the instance so anchor navigation can route through the same
    // scroller instead of fighting it with window.scrollTo.
    (window as Window & { __lenis?: Lenis }).__lenis = lenis;

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Pause the RAF loop when the tab is hidden — no point burning CPU.
    const onVisibility = () => {
      if (document.hidden) lenis.stop();
      else lenis.start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /*
      Re-measure once the document stops moving.

      Triggers are created during the first React commit, while the preloader
      is still up and the fallback font is still rendering. Both of those change
      the height of everything above the fold *after* the triggers cached their
      positions, which leaves every scrubbed scene measuring the wrong offset
      — silently, and worst on the scenes furthest down the page.
    */
    document.fonts?.ready.then(refreshScrollTriggers).catch(() => {});
    window.addEventListener('load', refreshScrollTriggers, { once: true });

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('load', refreshScrollTriggers);
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      delete (window as Window & { __lenis?: Lenis }).__lenis;
      ScrollTrigger.refresh();
    };
  }, []);
}

/** Scrolls to a section, accounting for the fixed header. */
export function scrollToSection(target: string | HTMLElement, offset = -72): void {
  const el =
    typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;

  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) {
    lenis.scrollTo(el, { offset, duration: 1.2 });
    return;
  }
  const top = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}