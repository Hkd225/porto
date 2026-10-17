import { useState } from 'react';
import { AccordionGallery, ScrollVelocity, SplitText } from './reactbits';
import { profile } from '../data/profile';
import { stepVisuals } from '../lib/stepVisuals';

/**
 * Manifesto — "The method": Read. Rebuild. Push the vague part. Document.
 *
 * SplitText introduces the headline word by word; AccordionGallery is the
 * interaction — four hairline-inked panels that expand on hover/focus, while
 * the active panel's chrome (meta, title, detail, tags) re-renders below the
 * row. The redundant four-card grid is gone: the gallery IS the list now, so
 * nothing is said twice. The tools ticker stays as the kinetic footer.
 */
export function Manifesto() {
  const steps = profile.method;
  const [active, setActive] = useState(0);
  const step = steps[active] ?? steps[0];

  const items = steps.map((s, i) => ({
    image: stepVisuals[i % stepVisuals.length],
    label: s.word,
    alt: `${s.n} ${s.word} — method step`,
  }));

  return (
    <section id="method" aria-label="The method" className="border-t border-line-soft py-[var(--spacing-section)]">
      <div className="wrap">
        <div className="flex items-baseline justify-between gap-6">
          <p className="overline">The method</p>
          <p className="overline hidden md:block">How I work</p>
        </div>

        <div className="mt-10 md:mt-14">
          <SplitText
            text={profile.manifesto}
            tag="h2"
            splitType="words"
            effect="rise"
            mask
            trigger="view"
            delay={26}
            duration={1.1}
            staggerFrom="start"
            textAlign="left"
            threshold={0.12}
            rootMargin="-120px"
            className="font-display text-[clamp(2rem,5.6vw,4.6rem)] leading-[1.06] tracking-[-0.02em] text-bone"
          />
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
            Four principles. One continuous process.
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <AccordionGallery
            items={items}
            defaultIndex={0}
            accentColor="#a4aa9b"
            overlayColor="#080808"
            textColor="#e9e6de"
            height={440}
            gap={8}
            radius={3}
            expandRatio={0.52}
            tilt={5}
            parallax={0.4}
            duration={0.65}
            trigger="hover"
            onChange={setActive}
          />
        </div>

        {/* Active panel chrome — keyed by the active index so each swap plays
            one fade-up beat; static chrome above stays untouched. */}
        <div key={active} className="detail-in mt-10 border-t border-line-soft pt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="num">
                {step.n} / {step.word.toUpperCase()} — active panel
              </p>
              <h3 className="mt-4 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] italic leading-tight text-bone">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-muted">{step.detail}</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end lg:text-right">
              <p className="max-w-[34ch] text-sm leading-relaxed text-dim">{step.desc}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
                {step.tags.map((tag, i) => (
                  <span key={tag}>
                    {tag}
                    {i < step.tags.length - 1 && <span className="px-2">/</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Kinetic ticker of real tools — one continuous row (joined here, so
            the velocity component renders a single row, not one per tool). */}
        <div className="mt-16 border-y border-line-soft py-5">
          <ScrollVelocity
            texts={[profile.ticker.join(' / ')]}
            velocity={34}
            numCopies={3}
            fadeEdges
            gap={92}
            color="#5b5b58"
            fontSize={15}
            fontWeight={400}
            pauseOnHover
          />
          <p className="sr-only">Frequently used: {profile.ticker.join(', ')}.</p>
        </div>
      </div>
    </section>
  );
}
