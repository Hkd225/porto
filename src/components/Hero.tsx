import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { ExternalLink, MoveDown } from 'lucide-react';

import { BlurText } from './reactbits';
import { Magnet } from './reactbits';
import { DotGrid } from './reactbits';
import { DecryptedText, ShinyText } from './reactbits';
import { SignalPanel } from './SignalPanel';
import { HeroField } from './HeroField';
import { CountUp } from './CountUp';
import { ScrambleText } from './ScrambleText';

import { gsap, EASE, isLowPower } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { profile } from '../data/profile';
import { scrollToSection } from '../hooks/useSmoothScroll';

interface HeroProps {
  /** Flipped on when the intro sequence finishes. */
  ready: boolean;
}

export function Hero({ ready }: HeroProps) {
  const rootRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const lowPower = isLowPower();

  /**
   * The DotGrid field is a continuous WebGL loop. Leaving it running once the
   * hero has scrolled away costs a full rAF and a repaint every frame for
   * something nobody can see — it was the single largest contributor to dropped
   * frames on long scrolls.
   */
  const [fieldVisible, setFieldVisible] = useState(true);

  /**
   * Set when the WebGL field cannot run at all — no WebGL2 context, or a shader
   * that will not link. The canvas is then transparent for the life of the page,
   * so the hero falls back to the CSS field.
   */
  const [fieldFallback, setFieldFallback] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([entry]) => setFieldVisible(entry.isIntersecting), {
      threshold: 0,
    });
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!ready) return;
      const root = rootRef.current;
      if (!root) return;

      if (reduced) {
        gsap.set('[data-hero]', { clearProps: 'all', opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: EASE.outExpo } });

      /*
        The entry curtain.

        The hero has been rendered behind the intro overlay the whole time, so
        the handover is a single clip-path sweep rather than a second screen
        appearing. It opens from the bottom edge while the headline is already
        resolving underneath, which is what makes the two read as one event
        rather than two.

        Direction matters, and getting it backwards is invisible in a still and
        fatal on screen. The curtain is an opaque `bg-ink` sheet sitting at z-5
        — above the background field at z-0, below the content at z-10. Tweened
        the wrong way it finishes *covering* the hero instead of clearing it:
        every headline stays perfectly readable, the field never appears at all,
        and the page looks deliberately flat rather than broken.
      */
      tl.fromTo(
        '[data-hero-curtain]',
        { clipPath: 'inset(0% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.25, ease: EASE.inOutQuart },
        0,
      );

      tl.fromTo('[data-hero-eyebrow]', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
        .fromTo('[data-hero-name]', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9 }, 0.38)
        .fromTo('[data-hero-line]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.8 }, 0.46)
        .fromTo('[data-hero-body]', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.62)
        .fromTo('[data-hero-cta] > *', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.72)
        .fromTo('[data-hero-foot]', { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.88);

      // Scroll-linked drift: headline recedes, meta drifts the other way.
      gsap.to('[data-hero-headline]', {
        yPercent: -12,
        opacity: 0.28,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });

      /*
        Kinetic type.

        Space Grotesk is loaded as a variable font, so the headline's weight axis
        is animatable. It thins out and opens its tracking as the hero leaves —
        the line keeps changing while you scroll instead of just travelling.
        `fontVariationSettings` is used rather than `fontWeight` because the
        latter re-resolves the family and defeats the interpolation on some
        engines.
      */
      const headline = root.querySelector('[data-kinetic]');
      if (headline) {
        const scroll = {
          trigger: root,
          start: 'top top',
          end: 'bottom top',
          scrub: true as const,
        };
        gsap.fromTo(
          headline,
          { fontVariationSettings: "'wght' 700, 'wdth' 100" },
          { fontVariationSettings: "'wght' 300, 'wdth' 112", ease: 'none', scrollTrigger: scroll },
        );
        gsap.fromTo(
          headline,
          { letterSpacing: '-0.05em' },
          { letterSpacing: '-0.012em', ease: 'none', scrollTrigger: scroll },
        );
      }

      gsap.to('[data-hero-grid]', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top top', end: 'bottom top', scrub: true },
      });
    },
    { dependencies: [ready, reduced], scope: rootRef }
  );

  return (
    <section
      id="index"
      ref={rootRef}
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden pt-24 pb-5 md:pt-28 md:pb-7"
    >
      {/* Hidden until the intro hands over, then clipped away from the bottom edge.
          Starts *covering*: before `ready` the hero has to be behind this sheet
          or its content is on screen during the preloader. */}
      <div
        data-hero-curtain
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[5] bg-ink"
        style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      />
      {/* ── React Bits: DotGrid (WebGL interactive field) ──
          z-0, not -z-10: the root backdrop is also z-0, so a negative layer
          would push the canvas behind it and hide it entirely.

          This was not the thing that had gone missing — an opaque curtain sat
          above it (see the tween below). The CSS field is the backstop for the
          one case the canvas cannot cover: a browser that refuses WebGL2, where
          the canvas renders nothing for the life of the page. */}
      <div data-hero-grid className="absolute inset-0 z-0" aria-hidden="true">
        <DotGrid
          dotSize={2.5}
          gap={24}
          baseColor="#2b3324"
          activeColor="#c8ff4d"
          proximity={150}
          strength={1.3}
          bounce={0.45}
          shape="circle"
          opacity={0.95}
          mouseInteraction={!reduced}
          paused={reduced || !fieldVisible}
          dpr={lowPower ? 1 : undefined}
          intro={!reduced && fieldVisible}
          onUnavailable={() => setFieldFallback(true)}
        />
        {fieldFallback && <HeroField />}
        {/* Light vignette — enough to hold type contrast, not enough to erase the field */}
        <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_45%,rgba(9,10,9,0.28),rgba(9,10,9,0.80)_82%)]" />
      </div>

      <div className="container-x relative z-10 flex flex-1 flex-col justify-between gap-8">
        {/* ── Eyebrow row ── */}
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <p data-hero-eyebrow className="mono-label">
            <ScrambleText text="Agentic systems · Memory · Uncertainty" />
          </p>
          <p data-hero-eyebrow className="mono-label">
            001 / Index
          </p>
        </div>

        {/* ── Main block ── */}
        <div className="flex flex-col gap-6">
          <h1 id="hero-title" data-hero-name>
            {/* React Bits: DecryptedText — the name resolves out of scrambled
                glyphs as the curtain clears. Mounted only once `ready` flips,
                because the IntersectionObserver fires the moment the component
                exists: mounted behind the preloader, the whole run completes
                offscreen and the effect is silently spent. */}
            <span className="block font-mono text-[0.7rem] tracking-[0.2em] text-muted uppercase md:text-xs">
              {ready ? (
                <DecryptedText
                  text={profile.name}
                  animateOn="view"
                  speed={38}
                  maxIterations={12}
                  scrambleColor="rgba(200,255,77,0.55)"
                />
              ) : (
                profile.name
              )}
            </span>
          </h1>

          <div data-hero-headline className="flex flex-col gap-1">
            {/* `data-kinetic` owns the variable-font axes and the tracking for the
                whole block, so all three lines change together as the hero
                scrolls out. The gap must be absolute: an `em` here would resolve
                against this container's 16px font-size, not the display size. */}
            <div
              data-kinetic
              className="flex flex-col gap-1"
              style={{ fontVariationSettings: "'wght' 700, 'wdth' 100" }}
            >
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:gap-x-9">
                <BlurText
                  text="I BUILD"
                  className="font-display text-display leading-[0.86] text-bone"
                  delay={45}
                  animateBy="words"
                  direction="bottom"
                />
                <BlurText
                  text="INTELLIGENT"
                  className="font-display text-display leading-[0.86] text-acid"
                  delay={45}
                  animateBy="words"
                  direction="bottom"
                />
              </div>
              <div>
                <BlurText
                  text="SYSTEMS."
                  className="font-display text-display leading-[0.86] text-bone"
                  delay={45}
                  animateBy="words"
                  direction="bottom"
                />
              </div>
            </div>
          </div>

          {/* ── Bio + live panel ──
              `panel-room` (see index.css) is both a width and a height
              breakpoint, so the panel never squeezes the scroll cue off screen. */}
          <div className="flex flex-col gap-8 panel-room:flex-row panel-room:items-end panel-room:justify-between panel-room:gap-14">
            <p data-hero-body className="max-w-[58ch] text-lead font-light text-muted">
              {profile.bio}
            </p>
            <div className="hidden panel-room:block">
              <SignalPanel />
            </div>
          </div>
        </div>

        {/* ── Actions + secondary line ── */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div data-hero-cta className="flex flex-wrap items-center gap-3">
            <Magnet
              padding={40}
              magnetStrength={1.6}
              disabled={reduced}
              wrapperClassName="inline-block"
            >
              <a
                href="#work"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#work', -80);
                }}
                className="group inline-flex items-center gap-3 rounded-full border border-bone/25 bg-bone px-6 py-3.5 font-display text-sm tracking-[-0.01em] text-ink transition-colors duration-500 hover:bg-acid hover:border-acid"
              >
                Explore selected work
                <MoveDown
                  size={15}
                  aria-hidden="true"
                  className="transition-transform duration-500 group-hover:translate-y-0.5"
                />
              </a>
            </Magnet>

            <Magnet padding={40} magnetStrength={1.4} disabled={reduced} wrapperClassName="inline-block">
              <a
                href={profile.links.github}
                target="_blank"
                rel="noreferrer noopener"
                className="group inline-flex items-center gap-3 rounded-full border border-line px-6 py-3.5 font-display text-sm tracking-[-0.01em] text-bone transition-colors duration-500 hover:border-bone/60"
              >
                GitHub / Hkd225
                <ExternalLink
                  size={14}
                  aria-hidden="true"
                  className="text-muted transition-colors group-hover:text-acid"
                />
              </a>
            </Magnet>
          </div>

          <dl data-hero-foot className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4 lg:text-right">
            <div>
              <dt className="mono-label">Focus</dt>
              <dd className="mt-1.5 text-sm text-bone">Agentic AI</dd>
            </div>
            <div>
              <dt className="mono-label">Repos</dt>
              <dd className="mt-1.5 font-mono text-sm text-bone tabular-nums">
                <CountUp value={profile.meta.publicRepos} />
              </dd>
            </div>
            <div>
              <dt className="mono-label">Primary</dt>
              <dd className="mt-1.5 text-sm text-bone">Python / PyTorch</dd>
            </div>
            <div>
              <dt className="mono-label">Statement</dt>
              <dd className="mt-1.5 text-sm text-bone">Know when unsure</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* ── Scroll cue ── */}
      <div className="container-x relative z-10 mt-6">
        <button
          type="button"
          onClick={() => scrollToSection('#work', -80)}
          className="mono-label group flex items-center gap-3 transition-colors hover:text-bone"
        >
          <span className="relative block h-px w-14 overflow-hidden bg-line">
            <span className="absolute inset-0 origin-left bg-acid transition-transform duration-1000 group-hover:scale-x-100" />
          </span>
          {/* React Bits: ShinyText — a slow sweep of light across the cue. The
              gradient paints over the inline color, so the button's hover
              tint is retired here; the sweep is the affordance. */}
          <ShinyText text="Scroll" speed={3.4} color="#8f938a" shineColor="#c8ff4d" trigger="loop" />
        </button>
      </div>
    </section>
  );
}