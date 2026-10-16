import { GradientText, ScrollExpand } from './reactbits';

import { coverArtDataUri } from '../lib/coverArt';
import { scrollToSection } from '../hooks/useSmoothScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Opening interlude — the frame between the hero and the work.
 *
 * React Bits: ScrollExpand. Sits directly under the hero and ticker: a resting
 * frame that opens to the whole stage as you scroll, the held title lifting
 * away as the media takes over, the method statement arriving at full bleed.
 * That is its whole job — the one cinematic breath that turns the index into
 * the act of looking at work — so it carries no section number and claims no
 * nav slot; it is a bridge, like the ticker above it.
 *
 * The cover is generated locally (see lib/coverArt) rather than a photograph:
 * everything visual on this site is derived from data, and a stock photo would
 * be the one thing that breaks that rule.
 */
/**
 * One acid-family diagram. hue2 was purple earlier — every wash now stays in
 * the site's green family. The label furniture is dropped on purpose: the
 * overlay copy already names the piece, and at full bleed an SVG label scales
 * into a billboard behind the text.
 */
const MEDIA = coverArtDataUri(
  { hue: 88, hue2: 96, motif: 'loop' },
  { width: 1600, height: 900 },
);

export function Interlude() {
  const reduced = useReducedMotion();
  /**
   * With reduced motion the expansion is disabled and the component holds the
   * frame fully open: a static full-bleed plate with the overlay visible —
   * the same message, no scrub to reach it.
   */
  return (
    <section aria-label="Working method" className="relative z-10">
      <ScrollExpand
        id="method"
        src={MEDIA}
        alt="Generated loop diagram — the verify-and-remember loop every module on this site grew from"
        title="Reason · Verify · Remember"
        scrollHint="Scroll"
        startWidth={62}
        startHeight={56}
        startRadius={18}
        mediaZoom={1.28}
        scrollDistance={1.15}
        holdDistance={0.12}
        smoothing={0.12}
        overlayScrim={0.62}
        useWindowScroll
        enabled={!reduced}
      >
        {/**
         * A quiet plate under the copy: at full bleed the diagram's ring can
         * pass behind the text, and ink-on-diagram must never fight for
         * legibility. One plate, hairline border — no blur (site rule).
         */}
        <div className="flex w-full max-w-[760px] flex-col items-center gap-5 rounded-2xl border border-line bg-ink/70 px-7 py-10 sm:px-12 sm:py-12">
          <p className="mono-label text-bone/75">The practice</p>
          <h3 className="max-w-[22ch] text-center font-display text-3xl font-bold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
            <GradientText colors={['#c8ff4d', '#ecffc4', '#8ea53b']} animationSpeed={7}>
              Know when unsure.
            </GradientText>
          </h3>
          <p className="max-w-[56ch] text-center text-sm leading-relaxed text-bone/70 sm:text-base">
            Every module on this site comes from the same discipline: estimate confidence,
            verify the result, and keep only the memory that earned its place.
          </p>
          <button
            type="button"
            onClick={() => scrollToSection('#work', -40)}
            className="mono-label mt-2 inline-flex items-center gap-3 text-bone/85 transition-colors hover:text-acid"
          >
            <span aria-hidden="true" className="h-px w-10 bg-current opacity-50" />
            Selected work / 002
          </button>
        </div>
      </ScrollExpand>
    </section>
  );
}
