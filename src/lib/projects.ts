/**
 * Deep-link handling for individual projects.
 *
 * Every repository on the site is addressable as `#project-<slug>`. Both the
 * featured cards and the rows in the project index carry `data-slug`, and the
 * featured ones come first in the document — so a featured slug lands on its
 * large card and an archive slug lands on its row, with no per-project code.
 */
export function findProject(slug: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(`[data-slug="${CSS.escape(slug)}"]`);
}

/**
 * Scroll a project into view and flash it, so a pasted link visibly lands on
 * something rather than silently repositioning the page.
 *
 * Returns false when the slug is unknown, which lets callers avoid pretending
 * the navigation worked.
 */
export function focusProject(slug: string): boolean {
  const el = findProject(slug);
  if (!el) return false;

  el.scrollIntoView({ block: 'center', behavior: 'smooth' });

  // Re-trigger the animation even when the same link is followed twice: the
  // class has to come off and layout has to be read before it goes back on.
  el.classList.remove('flash-target');
  void el.offsetWidth;
  el.classList.add('flash-target');
  window.setTimeout(() => el.classList.remove('flash-target'), 2200);

  return true;
}

/** The slug encoded in the current URL, if the hash points at a project. */
export function projectSlugFromHash(hash: string = location.hash): string | null {
  return hash.startsWith('#project-') ? hash.slice('#project-'.length) : null;
}