import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';

import { gsap, ScrollTrigger } from '../lib/gsap';
import { profile } from '../data/profile';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { FlowingMenu } from './reactbits';

const PIN_PER_CHAPTER = 620;

/** Chapter navigator rows — module-level so the item identity stays
    stable across the scroll-driven re-renders the pinned scene emits. */
const menuItems = profile.focus.map((area, i) => ({
  text: area.label,
  meta: String(i + 1).padStart(2, '0'),
}));

/**
 * Focus — six chapters in one pinned scene.
 *
 * Editorial composition first: a static chrome row ("Selected focus" / range
 * counter), a left text column whose title, blurb and metadata stagger in per
 * chapter, a ghost serif numeral that marks the active chapter and serves as
 * the swapping background, and the chapter navigator — a React Bits
 * FlowingMenu whose band glides row to row with scroll (activeIndex drives
 * it; pointer interaction inside the menu still wins while it hovers) and
 * whose rows jump the Lenis scroller straight to a chapter. Scroll owns the
 * state. No autoplay or extra effects.
 *
 * Under reduced motion or on narrow viewports there is no pinning: the six
 * chapters stack and read like any other document.
 */
export function Focus() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const isDesktop = useMediaQuery('(min-width: 768px) and (min-height: 620px)');
  const areas = profile.focus;
  const total = areas.length;
  const pinned = isDesktop && !reduced;

  useGSAP(
    () => {
      if (!pinned) {
        triggerRef.current = null;
        return;
      }
      const stage = stageRef.current;
      if (!stage) return;

      // The chrome eases in once; the chapters themselves are owned by scroll.
      gsap.from(stage.querySelectorAll('[data-chapter-chrome]'), {
        y: 16,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: stage, start: 'top 80%', once: true },
      });

      triggerRef.current = ScrollTrigger.create({
        trigger: stage,
        start: 'top top',
        end: `+=${total * PIN_PER_CHAPTER}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          setActive(Math.max(0, Math.min(total - 1, Math.floor(self.progress * total))));
        },
      });
    },
    { dependencies: [pinned, total] }
  );

  /** Land mid-chapter so the scroll state settles inside it. */
  const jumpTo = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const target = st.start + ((i + 0.5) * (st.end - st.start)) / total;
    const lenis = (window as Window & { __lenis?: { scrollTo: (v: number, o?: object) => void } }).__lenis;
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: 'auto' });
  };

  /* Reduced motion or narrow viewport — a plain vertical chapter list. */
  if (!pinned) {
    return (
      <section aria-label="Focus areas" className="border-t border-line-soft">
        <div className="wrap py-[var(--spacing-section)]">
          <div className="flex items-baseline justify-between gap-8">
            <div className="flex items-baseline gap-4">
              <span className="num text-bone/70">01</span>
              <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
              <span className="kicker">Selected focus</span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.3em] text-dim">
              01 — {String(total).padStart(2, '0')}
            </span>
          </div>

          <div className="mt-10 grid gap-10 sm:mt-16 sm:gap-16">
            {areas.map((area, i) => (
              <article
                key={area.id}
                className="grid gap-4 border-t border-line-soft pt-7 first:border-0 first:pt-0"
              >
                <div className="flex items-baseline gap-4">
                  <span className="num text-accent/80">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-px w-8 bg-line" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                    {area.label}
                  </span>
                </div>
                <h2 className="font-display italic leading-[0.96] text-[clamp(1.75rem,6.5vw,4.4rem)]">
                  {area.label}
                </h2>
                <p className="max-w-[48ch] leading-relaxed text-muted">{area.blurb}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
                  {area.items.join(' · ')}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Focus areas" className="relative border-t border-line-soft bg-ink">
      <div ref={stageRef} className="relative min-h-svh overflow-hidden">
        <div className="wrap relative h-svh">
          {/* Static chrome — identical for every chapter. Positioned on the
              wrap's content edges so it aligns with every other section. */}
          <div
            data-chapter-chrome
            className="absolute inset-x-0 top-0 z-20 flex items-baseline justify-between px-5 pt-24 sm:px-8 lg:px-12"
          >
            <div className="flex items-baseline gap-4">
              <span className="num text-bone/70">01</span>
              <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
              <span className="kicker">Selected focus</span>
            </div>
            <span className="font-mono text-[11px] tracking-[0.3em] text-dim">
              01 — {String(total).padStart(2, '0')}
            </span>
          </div>

          {/* Ghost numerals — the chapter's visual identity, one at a time. */}
          {areas.map((area, i) => (
            <span
              key={`num-${area.id}`}
              aria-hidden="true"
              className={`pointer-events-none absolute right-[8%] top-1/2 hidden -translate-y-1/2 select-none font-display italic leading-none text-[clamp(11rem,24vh,20rem)] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] sm:block lg:right-[14%] ${
                i === active ? 'scale-100 opacity-100' : 'scale-[0.97] opacity-0'
              }`}
              style={{
                color: 'transparent',
                WebkitTextStroke: `1px ${i === active ? 'rgba(164, 170, 155, 0.3)' : 'rgba(233, 230, 222, 0.1)'}`,
                transitionDelay: i === active ? '60ms' : '0ms',
              }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
          ))}

          {/* Chapters — the text column, left. Each layer staggers in. */}
          {areas.map((area, i) => {
            const on = i === active;
            const reveal = (level: number) => ({
              className: `transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                on ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
              }`,
              style: { transitionDelay: on ? `${level * 90}ms` : '0ms' },
            });
            const meta = reveal(0);
            const title = reveal(1);
            const blurb = reveal(2);
            const items = reveal(3);

            return (
              <div
                key={area.id}
                aria-hidden={!on}
                className="absolute inset-y-0 left-5 z-10 flex w-full max-w-[44rem] flex-col justify-center pb-24 pt-28 sm:left-8 lg:left-12"
              >
                <div className={`flex items-baseline gap-4 ${meta.className}`} style={meta.style}>
                  <span className="num text-accent/80">{String(i + 1).padStart(2, '0')}</span>
                  <span className="h-px w-10 bg-line-2" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted">
                    Area of work
                  </span>
                </div>

                <h2
                  className={`max-w-[13ch] font-display italic leading-[0.96] tracking-[-0.01em] text-[clamp(2.6rem,6.2vw,5.6rem)] ${title.className}`}
                  style={title.style}
                >
                  {area.label}
                </h2>

                <p
                  className={`mt-5 max-w-[44ch] text-[clamp(1.02rem,1.4vw,1.25rem)] leading-relaxed text-muted ${blurb.className}`}
                  style={blurb.style}
                >
                  {area.blurb}
                </p>

                <div
                  className={`mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-dim ${items.className}`}
                  style={items.style}
                >
                  {area.items.map((item, j) => (
                    <span key={item} className="flex items-center gap-4">
                      {item}
                      {j < area.items.length - 1 && (
                        <span className="inline-block h-1 w-1 rounded-full bg-accent/50" aria-hidden="true" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Chapter navigator — React Bits FlowingMenu. Scroll owns the
              band's position: the activeIndex effect glides it row to row
              (with the other rows dimming to focus the current one), while
              a pointer inside the menu still steers it directly. The ghost
              numeral continues to swap behind as the chapter background.
              Rows are buttons — each walks the Lenis scroller to its
              chapter, so the rail's jump behaviour survives intact. */}
          <div
            data-chapter-chrome
            className="absolute top-1/2 right-5 z-30 hidden w-[min(26vw,380px)] -translate-y-1/2 lg:block sm:right-8 lg:right-12"
          >
            <div className="h-[62vh] border-y border-line-soft">
              <FlowingMenu
                className="focus-menu"
                items={menuItems}
                activeIndex={active}
                align="left"
                showArrow
                dimInactive
                bgColor="transparent"
                textColor="#e9e6de"
                marqueeBgColor="#e9e6de"
                marqueeTextColor="#080808"
                borderColor="rgba(233, 230, 222, 0.1)"
                ariaLabel="Focus areas"
                onItemClick={(_item, index) => jumpTo(index)}
              />
            </div>
            <p className="mt-3 text-right font-mono text-[10px] tabular-nums tracking-[0.3em] text-accent">
              {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
