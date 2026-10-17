import { useEffect, useState } from 'react';

/**
 * Returns the id of the tracked section carrying the most viewport mass.
 *
 * Deliberately intersection-ratio-based rather than scroll-offset-based: the
 * pinned focus scene and the manifesto bridge are not tracked items — while
 * they hold the screen, no tracked section has mass, and the highlight keeps
 * the last chapter that did (empty over the index, where nothing has been
 * read yet). Navigation and links stay functional regardless of this state.
 */
export function useActiveSection(ids: readonly string[]): string {
  // Empty until the first tracked section actually carries the viewport.
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const ratios = new Map<string, number>();
    const pick = () => {
      let best = '';
      let bestRatio = 0;
      for (const id of ids) {
        const ratio = ratios.get(id) ?? 0;
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      }
      // Zero mass everywhere (pinned scene, manifesto bridge) — hold the
      // last visited chapter rather than inventing a highlight.
      if (best) setActive(best);
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
