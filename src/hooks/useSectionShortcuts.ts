import { useEffect, useRef } from 'react';
import { SECTION_SHORTCUTS, type SectionId } from '../data/sections';
import { scrollToSection } from './useSmoothScroll';

/** First key of the two-key sequences, e.g. `g` in "g then w". */
const LEADER = 'g';

/**
 * Second key → destination, parsed out of SECTION_SHORTCUTS.
 *
 * This used to be a hand-maintained copy of the same table, with a comment
 * noting it was "kept in step" with the data file. It was not: adding a section
 * updated the table the command palette renders and left this one untouched, so
 * the new section's shortcut appeared documented and did nothing at all.
 *
 * One source of truth instead. The sequences are `"<leader> <key>"`, so the
 * final token is the key to match.
 */
const NEXT: Record<string, SectionId> = Object.fromEntries(
  Object.entries(SECTION_SHORTCUTS).map(([id, sequence]) => {
    const key = sequence.trim().split(/\s+/).pop() ?? '';
    return [key, id as SectionId];
  }),
);

/**
 * Two-key section navigation — `g` then a letter, the pattern used by Gmail,
 * GitHub and most documentation sites.
 *
 * Deliberately inert while a text field has focus, and while any modifier is
 * held, so it never steals a keystroke from someone typing a search or using
 * Ctrl+K to open the palette.
 */
export function useSectionShortcuts(): void {
  // `useRef` rather than `useState`: nothing is rendered from this, and a
  // re-render on every keypress would be pure waste.
  const armed = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const disarm = () => {
      armed.current = false;
      clearTimeout(timer.current);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        el instanceof HTMLSelectElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        disarm();
        return;
      }

      const key = e.key.toLowerCase();

      if (armed.current) {
        const id = NEXT[key];
        disarm();
        if (!id) return;
        e.preventDefault();
        scrollToSection(`#${id}`, -80);
        return;
      }

      if (key === LEADER) {
        armed.current = true;
        // If the second key never arrives, quietly unarm rather than leaving
        // the site in a state where the next letter is swallowed.
        clearTimeout(timer.current);
        timer.current = setTimeout(disarm, 1600);
      }
    };

    const onBlur = () => disarm();

    window.addEventListener('keydown', onKey);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('blur', onBlur);
      clearTimeout(timer.current);
    };
  }, []);
}