import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE, isCoarsePointer, prefersReducedMotion } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { profile } from '../data/profile';
import { SECTIONS, SECTION_AMBIENT, type SectionId } from '../data/sections';

const SESSION_KEY = 'hakid-portfolio-intro-seen';

/** Dots in the cursor trail. More is smoother and more expensive. */
const TRAIL_LENGTH = 9;

/* ============================================================
   PRELOADER
   ============================================================ */

export function Preloader({ onDone }: { onDone?: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  // If motion is reduced, or we've already played the intro this session,
  // render nothing at all — never gate real content behind a fake loader.
  const [skipped] = useState(() => reduced || prefersReducedMotion() || sessionStorageSafe());
  /**
   * Unmounted once the intro has played out.
   *
   * The timeline only slides the overlay off the top of the screen; leaving it
   * in the tree would keep a `role="status" aria-live="polite"` region reading
   * "Loading portfolio" to assistive technology long after loading finished.
   */
  const [finished, setFinished] = useState(false);

  useGSAP(
    () => {
      if (skipped) {
        onDone?.();
        return;
      }

      const root = rootRef.current;
      const bar = barRef.current;
      const pct = pctRef.current;
      if (!root || !bar || !pct) return;

      document.body.style.overflow = 'hidden';

      const state = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          try {
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {
            /* private mode — ignore */
          }
          onDone?.();
          setFinished(true);
        },
      });

      tl.fromTo(
        '[data-intro-mark] > span',
        { yPercent: 118, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: EASE.outExpo },
      );

      tl.to(
        state,
        {
          v: 100,
          duration: 1.45,
          ease: 'power2.inOut',
          onUpdate: () => {
            const v = Math.round(state.v);
            bar.style.transform = `scaleX(${v / 100})`;
            pct.textContent = String(v).padStart(3, '0');
          },
        },
        0.1,
      );

      /*
        End on a dissolve rather than a slide.

        The hero does not start somewhere else — it is already on screen behind
        this overlay. Fading the overlay out hands the page over instead of
        replacing it, which is the difference between "a loading screen then a
        site" and "the site arriving". The hero's own curtain takes it from here.
      */
      tl.to('[data-intro-mark]', { scale: 0.94, opacity: 0, duration: 0.5, ease: EASE.inOutQuart });
      tl.to('[data-intro-meta]', { opacity: 0, duration: 0.4, ease: 'power2.in' }, '<');
      tl.to(root, { opacity: 0, duration: 0.45, ease: 'power2.inOut' }, '-=0.15');
    },
    { dependencies: [skipped] }
  );

  if (skipped || finished) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] flex flex-col justify-between bg-ink px-6 py-6 md:px-10 md:py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading portfolio"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="mono-label">{profile.navMark} / {profile.altMark}</span>
        <span className="mono-label text-right">
          AI Systems
          <br />
          Researcher
        </span>
      </div>

      <div className="flex flex-1 items-center">
        <h1
          data-intro-mark
          className="font-display text-[clamp(2.5rem,13vw,12rem)] leading-[0.82] tracking-[-0.05em]"
        >
          {'HAKID'.split('').map((c, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="inline-block">{c}</span>
            </span>
          ))}
        </h1>
      </div>

      <div data-intro-meta className="flex items-end justify-between gap-6">
        <div className="h-px flex-1 bg-line">
          <div ref={barRef} className="h-px w-full origin-left bg-acid" />
        </div>
        <span
          ref={pctRef}
          className="font-mono text-sm tabular-nums text-bone sm:text-base"
        >
          000
        </span>
      </div>
    </div>
  );
}

function sessionStorageSafe(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

/* ============================================================
   SCROLL PROGRESS
   ============================================================ */

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const bar = barRef.current;
      if (!bar || reduced) {
        if (bar) bar.style.transform = 'scaleX(0)';
        return;
      }
      gsap.to(bar, {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.25 },
      });
    },
    { dependencies: [reduced] }
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-px bg-line-soft"
      aria-hidden="true"
    >
      <div ref={barRef} className="h-px w-full origin-left scale-x-0 bg-acid" />
    </div>
  );
}

/* ============================================================
   CUSTOM CURSOR
   Dot + restrained ring, optionally carrying a short contextual label.
   Never loaded on touch devices, and the native cursor is only hidden once
   this component is actually alive.
   ============================================================ */

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  // Derived during render, not in an effect: this is a static capability check,
  // so there is nothing to synchronise and no cascading render to trigger.
  const [enabled] = useState(() => !prefersReducedMotion() && !isCoarsePointer());

  useEffect(() => {
    if (!enabled) return;

    document.documentElement.classList.add('custom-cursor-active');

    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      gsap.set(dotRef.current, { x: e.clientX, y: e.clientY });
      gsap.to(ringRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.55,
        ease: 'power3.out',
        overwrite: true,
      });
    };

    /* --- trail ---
       A short chain of dots, each following the one ahead it with a slightly
       longer duration. The lag is what turns a cursor into a trail; equal
       durations would just stack six dots on the same pixel.

       Built here rather than in JSX so the per-dot quickTo functions can be
       created once, outside the render path. */
    const trailHost = trailRef.current;
    const trail: { el: HTMLElement; x: gsap.QuickToFunc; y: gsap.QuickToFunc }[] = [];

    if (trailHost) {
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const el = document.createElement('span');
        el.className = 'cursor-trail-dot';
        el.style.setProperty('--i', String(i));
        trailHost.appendChild(el);
        trail.push({
          el,
          x: gsap.quickTo(el, 'x', { duration: 0.06 + i * 0.045, ease: 'power3.out' }),
          y: gsap.quickTo(el, 'y', { duration: 0.06 + i * 0.045, ease: 'power3.out' }),
        });
      }
      // Park the whole trail under the cursor on first paint so it does not
      // streak in from the top-left corner.
      gsap.set(
        trail.map((t) => t.el),
        { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      );
    }

    const trailMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      for (const t of trail) {
        t.x(e.clientX);
        t.y(e.clientY);
      }
    };

    /* The trail is only interesting while the pointer is moving. Once it stops
       — or leaves the window — the dots fade out rather than sitting as a
       permanent smear over the page. */
    let last = performance.now();
    let dimmed = false;

    const wake = () => {
      last = performance.now();
      if (!dimmed) return;
      dimmed = false;
      gsap.to(trailHost, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    };

    const onTrailMove = (e: PointerEvent) => {
      trailMove(e);
      wake();
    };

    const dim = () => {
      if (dimmed || !trailHost) return;
      dimmed = true;
      gsap.to(trailHost, { opacity: 0, duration: 0.45, ease: 'power2.in' });
    };

    // Cheap idle check on the GSAP ticker rather than a scroll listener.
    const poll = () => {
      if (dimmed) return;
      if (performance.now() - last > 180) dim();
    };

    const over = (e: Event) => {
      const t = e.target as HTMLElement | null;
      const hit = t?.closest?.('a, button, [data-cursor="grow"]');
      const ring = ringRef.current;
      if (!ring) return;

      ring.classList.toggle('is-active', Boolean(hit));

      // `data-cursor-label` opts a control into a word — the ring grows to fit
      // it. Controls without the attribute keep the plain circle.
      const label = hit?.getAttribute('data-cursor-label') ?? null;
      if (labelRef.current) labelRef.current.textContent = label ?? '';
      ring.classList.toggle('has-label', Boolean(label));

      // The trail steps aside when the cursor is pointing at something.
      gsap.to(trailHost, { opacity: hit ? 0 : 1, duration: 0.25, overwrite: true });
      // `last` is reset here as well as on move. Leaving it at -Infinity while
      // dimmed meant the first idle frame after leaving a link faded the trail
      // straight back out, before the pointer had moved again.
      dimmed = Boolean(hit);
      last = hit ? -Infinity : performance.now();
    };

    const leave = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 0, duration: 0.25 });
      if (trailHost) gsap.to(trailHost, { opacity: 0, duration: 0.25 });
    };
    const enter = () => {
      gsap.to([dotRef.current, ringRef.current], { opacity: 1, duration: 0.25 });
    };
    const down = () => ringRef.current?.classList.add('is-down');
    const up = () => ringRef.current?.classList.remove('is-down');

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointermove', onTrailMove, { passive: true });
    document.addEventListener('pointerover', over, { passive: true });
    document.addEventListener('mouseleave', leave);
    document.addEventListener('mouseenter', enter);
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    gsap.ticker.add(poll);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointermove', onTrailMove);
      document.removeEventListener('pointerover', over);
      document.removeEventListener('mouseleave', leave);
      document.removeEventListener('mouseenter', enter);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      gsap.ticker.remove(poll);
      trailHost?.replaceChildren();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[190] hidden lg:block">
      <div ref={trailRef} className="absolute inset-0 opacity-0" />
      <div
        ref={dotRef}
        className="absolute top-0 left-0 h-1 w-1 -translate-x-[2px] -translate-y-[2px] rounded-full bg-acid"
      />
      <div
        ref={ringRef}
        className="cursor-ring absolute top-0 left-0 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-bone/40"
      >
        <span
          ref={labelRef}
          className="cursor-label font-mono text-[0.58rem] tracking-[0.14em] text-ink uppercase"
        />
      </div>
    </div>
  );
}

/* ============================================================
   SECTION AMBIENT
   One fixed glow whose colour cross-fades between sections. Without it every
   section sits in the same black void and the page reads as one long room
   rather than a sequence of them.
   ============================================================ */

export function AmbientBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;

    type Zone = { id: string; key: SectionId; node: HTMLElement };

    /** Every block that owns a colour, in document order. */
    const zones: Zone[] = [];
    const candidates: { id: string; key: SectionId }[] = [
      ...SECTIONS.map((s) => ({ id: s.id, key: s.id })),
      // The cover band has no colour of its own — it belongs to the Work story,
      // so it must not blank out whatever was active before it.
      { id: 'covers', key: 'work' },
    ];
    for (const c of candidates) {
      const node = document.getElementById(c.id);
      if (node) zones.push({ ...c, node });
    }

    if (!zones.length) return;

    const state = { r: 200, g: 255, b: 77 };
    let current: SectionId = 'index';

    const apply = () => {
      el.style.setProperty('--ambient', `${Math.round(state.r)} ${Math.round(state.g)} ${Math.round(state.b)}`);
    };

    const pick = () => {
      /* The block covering the most of the viewport owns the screen.

         Measured as overlap rather than "closest centre": a section several
         screens tall has its centre far below the fold, so a centre-distance
         test would hand the screen to whichever short section happened to be
         nearest — which is exactly one section behind, every time. */
      const vh = window.innerHeight;
      let best = current;
      let bestScore = 0;

      for (const z of zones) {
        const r = z.node.getBoundingClientRect();
        const overlap = Math.min(r.bottom, vh) - Math.max(r.top, 0);
        if (overlap > bestScore) {
          bestScore = overlap;
          best = z.key;
        }
      }

      if (best === current) return;
      current = best;
      const next = SECTION_AMBIENT[best].split(' ').map(Number);
      gsap.to(state, {
        r: next[0],
        g: next[1],
        b: next[2],
        duration: 1.1,
        ease: 'power2.inOut',
        overwrite: true,
        onUpdate: apply,
      });
    };

    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      // One measurement per frame; a scroll handler that reads layout on every
      // event is the classic way to make smooth scrolling stutter.
      requestAnimationFrame(() => {
        queued = false;
        pick();
      });
    };

    pick();
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        ref={ref}
        style={{
          '--ambient': '200 255 77',
          background:
            'radial-gradient(120% 90% at 50% 100%, rgb(var(--ambient) / 0.09), transparent 62%)',
        } as React.CSSProperties}
      />
    </div>
  );
}

/* ============================================================
   SECTION NUMERAL PARALLAX
   The oversized outlined numerals sit behind their sections. Left static they
   read as decoration; a slow vertical drift gives the page a sense of depth
   without moving anything the reader is trying to read.
   ============================================================ */

export function ParallaxNumerals() {
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const numerals = gsap.utils.toArray<HTMLElement>('.section-numeral');
      if (!numerals.length) return;

      if (reduced) {
        gsap.set(numerals, { clearProps: 'transform' });
        return;
      }

      // scrub ties the drift to scroll position rather than to time, so the
      // numeral is always exactly where the scroll left it.
      numerals.forEach((el) => {
        gsap.fromTo(
          el,
          { yPercent: 18 },
          {
            yPercent: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: el.closest('section') ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.6,
            },
          },
        );
      });
    },
    { dependencies: [reduced] }
  );

  return null;
}

/* ============================================================
   BACKDROP — grain, grid lines, pointer light
   ============================================================ */

export function Backdrop() {
  const lightRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || isCoarsePointer()) return;
    const el = lightRef.current;
    if (!el) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3.out' });

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      xTo(e.clientX);
      yTo(e.clientY);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduced]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* structural grid */}
      <div className="absolute inset-0 grid-lines opacity-60" />
      {/* ambient vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_0%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
      {/* pointer light — no blur filter: the radial gradient already falls off
          to transparent, and a 40px blur on a 576px layer that moves on every
          pointer event is a repaint per event for no visible gain. */}
      <div
        ref={lightRef}
        className="absolute top-0 left-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(200,255,77,0.075)_0%,rgba(200,255,77,0.03)_35%,transparent_70%)] will-change-transform"
      />
      {/* idle drift — keeps moving when nothing else does. Same no-blur rule:
          the gradients are soft at source. */}
      {!reduced && (
        <>
          <div className="orb-a absolute top-[12%] left-[8%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(240,240,232,0.05)_0%,rgba(240,240,232,0.018)_40%,transparent_72%)] will-change-transform" />
          <div className="orb-b absolute right-[6%] bottom-[8%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(200,255,77,0.07)_0%,rgba(200,255,77,0.025)_40%,transparent_72%)] will-change-transform" />
        </>
      )}
      {/* grain */}
      <div className="grain-layer absolute inset-0 opacity-[0.055]" />
    </div>
  );
}