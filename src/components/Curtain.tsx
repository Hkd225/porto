import { useRef } from 'react';
import { useGSAP } from '@gsap/react';

import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Section boundaries that get a full-screen wipe.
 *
 * Only three, on purpose. A wipe is punctuation: used at every boundary it
 * stops meaning anything and the page turns into a slideshow. These three are
 * where the page genuinely changes kind — hero into work, work into the
 * horizontal scene, and the horizontal scene back into reading.
 */
const CHAPTERS = [
  { id: 'work', label: 'Selected work' },
  { id: 'covers', label: 'Covers' },
  { id: 'research', label: 'Case study' },
] as const;

/**
 * Scroll-linked chapter curtains.
 *
 * Each panel scales over a window around its boundary: in from the top, out
 * through the bottom, with the chapter name held at full height in between.
 *
 * Scrubbed rather than timed on purpose — the reader owns the pace, and
 * stopping mid-wipe holds a legible frame instead of a black screen. The panel
 * is also never fully opaque at the very top and bottom of the sweep, so a
 * halted scroll always shows something.
 */
export function Curtain() {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const panels = Array.from(root.children) as HTMLElement[];

      CHAPTERS.forEach((chapter, i) => {
        const trigger = document.getElementById(chapter.id);
        const panel = panels[i];
        if (!trigger || !panel) return;

        gsap
          .timeline({
            scrollTrigger: {
              trigger,
              start: 'top bottom',
              end: 'top top',
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          })
          // In from the top edge, holding at full height for the middle of the
          // sweep so the chapter name is actually readable.
          .fromTo(panel, { scaleY: 0 }, { scaleY: 1, duration: 1, ease: EASE.inOutQuart })
          .to(panel, { scaleY: 0, duration: 1, ease: EASE.inOutQuart });
      });
    },
    { dependencies: [reduced] }
  );

  if (reduced) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[150] overflow-hidden"
    >
      {CHAPTERS.map((c) => (
        <div
          key={c.id}
          className="absolute inset-0 flex scale-y-0 origin-top flex-col justify-between bg-ink px-6 py-8 md:px-10 md:py-10"
        >
          <div className="grain-layer absolute inset-0 opacity-[0.05]" />
          <div className="relative flex items-start justify-between gap-4">
            <span className="mono-label">{'Hakid.'}</span>
            <span className="mono-label text-dim">{c.label}</span>
          </div>
          <div className="relative">
            <p className="font-display text-[clamp(3rem,11vw,10rem)] leading-[0.84] tracking-[-0.05em] text-bone">
              {c.label}
            </p>
            <span className="mt-6 block h-px w-24 origin-left bg-acid" />
          </div>
        </div>
      ))}
    </div>
  );
}