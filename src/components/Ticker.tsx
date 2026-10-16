import { Marquee } from './Marquee';
import { profile } from '../data/profile';
import { useReducedMotion } from '../hooks/useReducedMotion';

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
    <section aria-label="Technologies used" className="relative z-10 border-y border-line py-5">
      <Marquee
        items={profile.ticker}
        duration={46}
        label="Technologies used across the projects below"
        /* No negative margin: the fade is done with a mask on the strip itself,
           and pulling it outside its container widened the page by a few pixels
           on a 390px viewport — enough to push the mobile menu button off
           screen, since body only clips overflow-x. */
        className="[mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
        itemClassName="mono-label text-lg tracking-[0.06em] text-muted"
      />
    </section>
  );
}