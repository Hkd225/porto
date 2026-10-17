import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';

import { ScrollTrigger } from '../lib/gsap';
import { profile } from '../data/profile';
import { useReducedMotion } from '../hooks/useReducedMotion';

const PIN_DISTANCE_PER_SLIDE = 620;

/**
 * Focus areas — LPAS's numbered market carousel, rebuilt for the six areas of
 * work.
 *
 * Scroll drives a pinned stage; each step cross-fades one chapter to the next
 * (CSS transitions only — GSAP pins and reports progress, the transition is
 * pure CSS). Under reduced motion there is no pinning: the chapters stack and
 * read like any other document.
 */
export function FocusCarousel() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();
  const areas = profile.focus;

  useGSAP(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: stageRef.current,
        start: 'top top',
        end: `+=${areas.length * PIN_DISTANCE_PER_SLIDE}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (self) => {
          const idx = Math.max(0, Math.min(areas.length - 1, Math.floor(self.progress * areas.length)));
          setActive(idx);
        },
      });
    },
    { dependencies: [reduced] }
  );

  if (reduced) {
    return (
      <section aria-label="Focus areas" className="border-t border-line-soft">
        <div className="wrap py-[var(--spacing-section)]">
          <p className="overline">Focus — {areas.length} areas</p>
          <div className="mt-14 grid gap-16">
            {areas.map((area, i) => (
              <article key={area.id} className="grid gap-5 border-t border-line-soft pt-10 first:border-0 first:pt-0">
                <div className="flex items-baseline gap-4">
                  <span className="num text-bone/70">0{i + 1}</span>
                  <span className="h-px w-8 bg-line" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-dim">{area.label}</span>
                </div>
                <h2 className="font-display italic leading-[0.95] text-[clamp(2rem,5vw,4.4rem)]">{area.label}</h2>
                <p className="max-w-[46ch] leading-relaxed text-muted">{area.blurb}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">{area.items.join(' · ')}</p>
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
        {areas.map((area, i) => {
          const isActive = i === active;
          return (
            <div
              key={area.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 flex flex-col justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isActive ? 'opacity-100 translate-y-0' : i < active ? 'opacity-0 -translate-y-7' : 'opacity-0 translate-y-7'
              }`}
            >
              <div className="wrap flex flex-col gap-8">
                <div className="flex items-baseline gap-4">
                  <span className="num text-bone/70">0{i + 1}</span>
                  <span className="h-px w-10 bg-line" aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-dim">Focus</span>
                </div>

                <h2 className="max-w-[14ch] font-display italic leading-[0.96] tracking-[-0.01em] text-[clamp(2.6rem,7vw,7rem)]">
                  {area.label}
                </h2>

                <p className="max-w-[48ch] text-[clamp(1.02rem,1.45vw,1.32rem)] leading-relaxed text-muted">
                  {area.blurb}
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
                  {area.items.map((item, j) => (
                    <span key={item} className="flex items-center gap-3">
                      {item}
                      {j < area.items.length - 1 && (
                        <span className="inline-block h-1 w-1 rounded-full bg-line-2" aria-hidden="true" />
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}

        {/* Counter + progress — the only stateful chrome in the chapter. */}
        <div className="absolute inset-x-0 bottom-8 z-10 pointer-events-none">
          <div className="wrap flex items-center justify-between gap-8">
            <span className="font-mono text-[11px] tracking-[0.3em] text-dim">
              {String(active + 1).padStart(2, '0')} / {String(areas.length).padStart(2, '0')}
            </span>
            <div className="relative h-px w-40 bg-line-soft sm:w-72">
              <div
                className="absolute inset-y-0 left-0 bg-bone/40 transition-all duration-500 ease-out"
                style={{ width: `${((active + 1) / areas.length) * 100}%` }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
