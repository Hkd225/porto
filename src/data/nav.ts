/**
 * The single source of truth for on-page navigation.
 *
 * Both the navbar and the active-section tracker build from this file, so a
 * section cannot be reachable from one surface and missing from the other.
 * `index` is the hero — it is tracked for highlighting but deliberately has no
 * nav item; clicking the `Hakid.` mark returns there.
 */
export const NAV_ITEMS = [
  { id: 'work', label: 'Work' },
  { id: 'models', label: 'Models' },
  { id: 'writing', label: 'Writing' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const;

export type NavId = 'index' | (typeof NAV_ITEMS)[number]['id'];

/** Sections the navbar highlights while the reader passes through them. */
export const TRACKED_IDS: readonly string[] = [
  'index',
  'work',
  'models',
  'writing',
  'about',
  'contact',
];
