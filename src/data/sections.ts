/**
 * The single source of truth for on-page sections.
 *
 * Both the navbar and the command palette build their menus from this, so a new
 * section cannot appear in one and be missing from the other.
 */
export const SECTIONS = [
  { id: 'index', label: 'Index', hint: 'Top of page' },
  { id: 'work', label: 'Work', hint: 'Selected projects' },
  { id: 'research', label: 'Research', hint: 'Featured case study' },
  { id: 'models', label: 'Models', hint: 'Published model weights' },
  { id: 'writing', label: 'Writing', hint: 'Published notes' },
  { id: 'about', label: 'About', hint: 'Background and focus' },
  { id: 'contact', label: 'Contact', hint: 'Where to find the work' },
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

/**
 * Ambient colour per section, as `r g b`.
 *
 * The backdrop cross-fades between these as each section becomes active. It is
 * ONE green family, graded rather than rainbow: the page reads as a single
 * world whose light shifts slightly chapter to chapter — acid at both ends,
 * moss between, one neutral bone breath at Models. Never a colour change. The
 * effect should be felt, not noticed.
 */
export const SECTION_AMBIENT: Record<SectionId, string> = {
  index: '200 255 77',
  work: '162 222 64',
  research: '124 198 74',
  models: '206 214 202',
  writing: '176 216 122',
  about: '146 210 96',
  contact: '200 255 77',
};

/**
 * Blocks that take part in nav highlighting without earning their own nav item.
 *
 * The horizontal cover band is a pinned full-height scene between Work and
 * Research; without this it would sit in the viewport while no section matched,
 * and the nav would keep whatever it last saw. The same applies to the other
 * two bridges: the interlude (the opening frame the index expands through,
 * before 002) and the gallery (005, an unlisted chapter between Models and
 * Writing). Each maps to the chapter the reader is moving out of, so the
 * highlight advances exactly at the next section's edge — the same place it
 * would if these blocks were transparent to the reader.
 */
export const TRACKED: { id: string; highlight: SectionId }[] = [
  { id: 'method', highlight: 'index' },
  { id: 'covers', highlight: 'work' },
  { id: 'gallery', highlight: 'models' },
];

/** Shortcut hint shown in the palette. Two-key sequences are described as "g then w". */
export const SECTION_SHORTCUTS: Record<SectionId, string> = {
  index: 'g h',
  work: 'g w',
  research: 'g r',
  models: 'g m',
  writing: 'g n',
  about: 'g a',
  contact: 'g c',
};