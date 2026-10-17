import { useEffect, useState } from 'react';

/**
 * Returns the id of the tracked section most visible in the viewport.
 *
 * Deliberately intersection-ratio-based rather than scroll-offset-based: the
 * pinned focus carousel and the manifesto bridge are not tracked items, so a
 * scroll-offset approach would highlight nothing while passing through them.
 * With ratios, the last visited tracked section simply keeps the highlight
 * until the next tracked section carries real mass in the viewport — the same
 * place the visual reading advances anyway.
 */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    const ratios = new Map<string, number>();
    const pick = () => {
      let best = ids[0] ?? '';
      let bestRatio = -1;
      for (const id of ids) {
        const ratio = ratios.get(id) ?? 0;
        // `>=` so a later id wins ties at zero mass — matches reading direction.
        if (ratio >= bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      }
      setActive(best);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
        pick();
      },
      { threshold: [0, 0.05, 0.15, 0.35, 0.6, 0.85] }
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ids]);

  return active;
}
