import { ScrollVelocity } from './reactbits';
import { profile } from '../data/profile';
import { useReducedMotion } from '../hooks/useReducedMotion';

const TOOLS = profile.ticker.join('  ·  ');

/**
 * Capability ticker between the hero and the work.
 *
 * It carries real weight for a reviewer — the stack is the fastest honest
 * signal of what the repositories actually contain — so it is a list of tools
 * that appear in the projects below, not decoration.
 */
export function Ticker() {
  const reduced = useReducedMotion();

  // Static and stacked under reduced motion: a frozen half-scrolled ticker
  // reads as broken, so the list is simply laid out and allowed to wrap.
  if (reduced) {
    return (
      <section aria-label="Technologies used" className="relative z-10 border-y border-line py-6">
        <div className="container-x">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {profile.ticker.map((t) => (
              <li key={t} className="mono-label text-dim">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Technologies used" className="relative z-10 border-y border-line py-4">
      {/* React Bits: ScrollVelocity — the strip is now a slab of type that
          cruises at its own pace and answers your scroll: flick the page and
          the rows surge and flip direction; sit still and they coast. The
          second row counter-runs as an outline ghost, so the seam reads as a
          solid statement above its hollow echo. Data unchanged — the same
          real tool names from the repositories below. */}
      <ScrollVelocity
        texts={[TOOLS, TOOLS]}
        velocity={26}
        numCopies={6}
        pauseOnHover
        fadeEdges
        outlineAlternate
        velocityMapping={{ input: [0, 900], output: [0, 4] }}
        scrollerClassName="flex whitespace-nowrap"
        scrollerStyle={{
          fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
          letterSpacing: '0.04em',
          color: 'var(--color-muted)',
          paddingTop: '0.35rem',
          paddingBottom: '0.35rem',
        }}
        fontSize="clamp(1rem, 1.7vw, 1.45rem)"
        fontWeight={500}
        gap={44}
      />
    </section>
  );
}
