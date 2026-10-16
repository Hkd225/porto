import { FlexCarousel } from './reactbits';

import { coverArtDataUri } from '../lib/coverArt';
import { profile } from '../data/profile';
import { ScrambleText } from './ScrambleText';

/**
 * Fields in motion (React Bits: FlexCarousel).
 *
 * Chapter 005 — after the research scene and the model coverage, before the
 * writing: the six areas of work from the About taxonomy, each given a
 * generated cover and set on a draggable strip. Not the project covers again —
 * those already live as cards (002) and in the pinned ambient band (covers) —
 * repeating them a third time is exactly the kind of noise a long page cannot
 * afford. The mapping of themes to motifs mirrors FocusConstellation, so the
 * reel and the diagram read as one idea shown twice.
 */
const MOTIF_BY_THEME: Record<string, 'nodes' | 'loop' | 'grid' | 'wave' | 'stack'> = {
  agentic: 'loop',
  memory: 'nodes',
  ml: 'stack',
  cv: 'grid',
  eval: 'wave',
  fe: 'nodes',
};

/**
 * ONE green family — the exact graded hue series the project covers above use,
 * so chapter 005 reads as a taxonomy of the same world rather than a new
 * palette. Motifs carry the variety; colour stays home.
 */
const HUES: Array<[number, number]> = [
  [88, 166],
  [102, 88],
  [116, 172],
  [130, 88],
  [94, 130],
  [78, 118],
];

const ITEMS = profile.focus.map((f, i) => ({
  src: coverArtDataUri(
    { hue: HUES[i][0], hue2: HUES[i][1], motif: MOTIF_BY_THEME[f.id] ?? 'nodes' },
    { index: String(i + 1).padStart(2, '0'), label: f.label },
  ),
  alt: `${f.label} — generated cover`,
  title: f.label,
  subtitle: f.blurb,
}));

export function Gallery() {
  return (
    <section
      id="gallery"
      className="relative z-10 border-t border-line py-section"
      aria-labelledby="gallery-title"
    >
      <div className="container-x mb-10">
        <p className="mono-label mb-5"><ScrambleText text="005 / Gallery" /></p>
        <h2 id="gallery-title" className="max-w-[16ch] text-h1">
          Six fields, <span className="text-outline-acid italic">one discipline.</span>
        </h2>
        <p className="mt-6 max-w-[46ch] text-[0.95rem] leading-relaxed text-muted">
          Drag the strip. Every frame is one area of work from the About chapter
          (007) — rendered from the same composition system as the covers above.
        </p>
      </div>

      <div className="h-[380px] sm:h-[440px] lg:h-[520px]" data-cursor-label="Drag">
        <FlexCarousel
          items={ITEMS}
          preset="ribbon"
          intro="rise"
          cardHeight={0.42}
          gap={14}
          radius={10}
          bend={0.2}
          curl="rise"
          dispersion={0.05}
          squeeze={0.24}
          captureWheel={false}
          captions
        />
      </div>

      <div className="container-x mt-6">
        <p className="mono-label text-dim">Drag, wheel or click a frame — click again to open it</p>
      </div>
    </section>
  );
}
