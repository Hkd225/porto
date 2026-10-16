import { useCallback, useLayoutEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight } from 'lucide-react';

import { ProjectArt } from './ProjectArt';
import { useHoverPreview } from '../hooks/useProjectPreview';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { featuredProjects, type Project } from '../data/projects';

/**
 * Extra runway per pixel of horizontal travel.
 *
 * At 1:1 the strip crosses the screen exactly as fast as you scroll, which
 * reads as a fast horizontal swipe rather than as a band you travel through.
 * A little over 1 gives each card roughly a third more of the screen to arrive
 * in, and costs one extra viewport of scroll across the whole band.
 */
const RUNWAY_PADDING = 1.25;

/**
 * A full-bleed band that travels sideways while you scroll down.
 *
 * This is the clearest break from the one-to-one scroll mapping that makes a
 * long page read like a video: here the scroll direction and the movement
 * direction are different axes, so scrolling is driving something rather than
 * playing something.
 *
 * Desktop pins the band and scrubs the track. Mobile drops to native
 * scroll-snap, because pinning a horizontal band on a phone either traps
 * scroll or fights the swipe.
 */
export function HorizontalBand() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const refreshRaf = useRef(0);
  const reduced = useReducedMotion();

  /**
   * Runway height: the sticky panel, plus however far the track has to travel.
   *
   * Sticky rather than a ScrollTrigger pin, for the same reason as the case
   * study: a pin reserves its distance with a spacer *after* the element, which
   * here would leave a screen of nothing between the band and the next section,
   * and a `position: fixed` element is reparented by any transform on <main>.
   *
   * Written straight to the element rather than held in state. It is a live DOM
   * measurement that changes on resize, on font swap, and on orientation
   * change — routing it through React would mean a render per measurement for a
   * value nothing renders.
   */
  const applyRunway = useCallback(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const track = trackRef.current;
    if (!section || !panel || !track) return;

    if (!window.matchMedia('(min-width: 1024px)').matches) {
      // Below `lg` the strip is a native scroll-snap row, the sticky never
      // engages, and a multi-thousand-pixel height would leave the phone page
      // mostly empty.
      section.style.height = '';
    } else {
      /*
        Measure the panel, do not assume a viewport.

        The sticky child is `min-h-[100svh]`, but it is also `justify-center`
        with a heading and a row of cards — on a short window it is taller than
        the viewport. Sizing the runway as `innerHeight + travel` in that case
        grants the sticky less travel than the track needs: the cards run out of
        runway before they reach the end of the strip, and the section hands
        over to the next one with the track still part-way across.
      */
      const travel = Math.max(0, track.scrollWidth - window.innerWidth + 80);
      section.style.height = `${Math.round(panel.offsetHeight + travel * RUNWAY_PADDING)}px`;
    }

    /*
      ScrollTrigger caches start/end at creation, so moving the document height
      without telling it leaves the trigger measuring a runway that no longer
      exists — which is how the band came to finish its travel early and leave
      empty space behind it. Deferred a frame because the height we just wrote
      has to be laid out before anything measures it.
    */
    cancelAnimationFrame(refreshRaf.current);
    refreshRaf.current = requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  useLayoutEffect(() => {
    applyRunway();
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(applyRunway);
    ro.observe(track);
    // The panel can change height on its own — a reflowed heading, a longer
    // title — and the runway is derived from it.
    const panel = panelRef.current;
    if (panel) ro.observe(panel);
    window.addEventListener('resize', applyRunway);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', applyRunway);
      cancelAnimationFrame(refreshRaf.current);
    };
  }, [applyRunway]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;
      if (!section || !track || reduced) return;

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const tween = gsap.to(track, {
          x: () => -Math.max(0, track.scrollWidth - window.innerWidth + 80),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        /*
          Undo only what this callback created.

          Returning `() => mm.revert()` here looks tidier and is a trap: it
          reverts the *whole* matchMedia, including the context whose cleanup is
          currently running. GSAP walks that context's revert list, calls this
          function again, which reverts again — and under React StrictMode's
          double-mount the simulated unmount is enough to drive it into
          `RangeError: Maximum call stack size exceeded` before the first paint.

          The symptom is brutal and very misleading, because it is confined to
          development: the production build does not double-invoke effects, so
          the same code renders perfectly there. It looks like "the site is
          broken", and the only reason it is broken is that `npm run dev` is
          being used to look at it.
        */
        return () => {
          tween.scrollTrigger?.kill();
          tween.kill();
        };
      });
    },
    { dependencies: [reduced] }
  );

  return (
    <section
      id="covers"
      ref={sectionRef}
      aria-labelledby="band-title"
      /*
        `overflow-x: clip`, never `overflow: hidden`.

        The track is `w-max` and translates past both edges, so the section has
        to clip it or the page grows a horizontal scrollbar. But `overflow:
        hidden` also makes the section a *scroll container*, and a sticky child
        resolves against its nearest scrollport — so with `hidden` the panel
        silently stopped sticking, scrolled off the top with the rest of the
        section, and left the runway translating a track nobody could see. That
        is the band of empty space after the cards.

        `clip` contains the overflow without establishing a scrollport, and
        unlike `hidden` it leaves the other axis alone, so the section keeps its
        natural height and the sticky panel holds for the whole runway.
      */
      className="relative z-10 py-section lg:py-0 lg:overflow-x-clip"
    >
      <div
        ref={panelRef}
        className="lg:sticky lg:top-0 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center"
      >
        <div className="container-x">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 id="band-title" className="max-w-[18ch] text-h3 tracking-[-0.035em]">
              Every cover is generated from the project&apos;s own metadata.
            </h2>
            <span className="mono-label text-dim">
              Drag with the pointer · or just keep scrolling
            </span>
          </div>
        </div>

        {/* `lg:overflow-visible` lets the track escape the container; below that
            it is a normal scroll-snap strip. */}
        <div className="mt-10 snap-x snap-mandatory overflow-x-auto pb-4 [scrollbar-width:none] lg:mt-16 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
          <div
            ref={trackRef}
            className="flex w-max gap-6 px-5 will-change-transform lg:gap-8 lg:px-[max(2.5rem,calc((100vw-92rem)/2+2.5rem))]"
          >
            {featuredProjects.map((p) => (
              <BandCard key={p.slug} project={p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function BandCard({ project: p }: { project: Project }) {
  const preview = useHoverPreview({
    id: p.slug,
    title: p.title,
    eyebrow: p.category,
    meta: p.year,
    art: p.art,
    index: p.index,
  });

  return (
    <article
      data-cursor-label="Open"
      className="group w-[78vw] shrink-0 snap-start sm:w-[62vw] lg:w-[30vw] lg:min-w-[26rem]"
      {...preview}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm border border-line-soft">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]">
          <ProjectArt art={p.art} index={p.index} label={p.category} className="h-full w-full" />
        </div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-5">
        <div className="min-w-0">
          <h3 className="font-display text-xl tracking-[-0.03em] text-bone transition-colors duration-300 group-hover:text-acid">
            {p.title}
          </h3>
          <p className="mt-1 font-display text-lg italic text-muted">{p.kicker}</p>
        </div>
        <span className="font-mono text-[0.62rem] tracking-[0.16em] text-dim">{p.index}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="font-mono text-[0.6rem] tracking-[0.16em] text-acid uppercase">
          {p.category}
        </span>
        <span className="font-mono text-[0.6rem] tracking-[0.16em] text-dim">{p.year}</span>
        <a
          href={p.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`${p.title} — view source`}
          className="mono-label ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-acid"
        >
          Source
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}