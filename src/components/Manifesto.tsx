import { FadeContent, ScrollFloat, ScrollVelocity } from './reactbits';
import { profile } from '../data/profile';

/**
 * Manifesto — the "Listen. Plan. Analyze. Shape." beat.
 *
 * One big method statement (ScrollFloat, word-level, scrubbed so the reader
 * drives it), one quiet kinetic ticker of real tools, and the four steps laid
 * out under a hairline. Nothing here is decorative for its own sake: the
 * scroll *tells* you the method as it moves.
 */
export function Manifesto() {
  return (
    <section id="method" aria-label="The method" className="border-t border-line-soft py-[var(--spacing-section)]">
      <div className="wrap">
        <p className="overline">The method</p>

        <div className="mt-10 md:mt-14">
          <ScrollFloat
            splitBy="words"
            effect="float"
            order="start"
            stagger={0.05}
            distance={110}
            scrollStart="top bottom-=16%"
            scrollEnd="center center+=14%"
            containerClassName="my-0"
            textClassName="!font-display !text-[clamp(2rem,5.6vw,4.6rem)] !font-normal !text-left !leading-[1.06] tracking-[-0.02em] text-bone"
          >
            {profile.manifesto}
          </ScrollFloat>
        </div>

        {/* Kinetic ticker of real tools — sr text keeps it honest for readers. */}
        <div className="mt-16 border-y border-line-soft py-5">
          <ScrollVelocity
            texts={profile.ticker}
            velocity={34}
            numCopies={3}
            fadeEdges
            gap={52}
            color="#5b5b58"
            fontSize={15}
            fontWeight={400}
            pauseOnHover
          />
          <p className="sr-only">Frequently used: {profile.ticker.join(', ')}.</p>
        </div>

        <FadeContent
          duration={0.9}
          delay={0.1}
          stagger={0.08}
          threshold={0.25}
          className="mt-16 grid gap-12 border-t border-line-soft pt-12 sm:grid-cols-2 lg:grid-cols-4"
        >
          {profile.method.map((step) => (
            <div key={step.n} className="flex flex-col gap-3">
              <span className="num text-bone/70">{step.n}</span>
              <h3 className="font-display italic text-[1.9rem] leading-none">{step.word}</h3>
              <p className="text-sm leading-relaxed text-dim">{step.desc}</p>
            </div>
          ))}
        </FadeContent>
      </div>
    </section>
  );
}
