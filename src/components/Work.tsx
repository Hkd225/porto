import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, GitBranch, Globe } from 'lucide-react';

import { ProjectArt } from './ProjectArt';
import { Reveal } from './Reveal';
import { ScrambleText } from './ScrambleText';
import { MaskLines } from './MaskLines';
import { CopyButton } from './CopyButton';
import { CursorGrid, PixelSwap } from './reactbits';
import { absoluteAnchor } from '../lib/url';
import { ProjectExplorer } from './ProjectExplorer';
import { useHoverPreview } from '../hooks/useProjectPreview';
import { featuredProjects, type Project } from '../data/projects';
import { profile } from '../data/profile';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Deterministic alternate composition per cover.
 *
 * React Bits: PixelSwap swaps the two layers with a pixel wave from the
 * pointer. The every-card double render is cheap static SVG-DOM; the wave only
 * runs while a card is hovered, and `intro: false` keeps the eight covers from
 * pixel-building on mount deep below the fold where nobody would see it.
 */
const ALT_MOTIF = { nodes: 'loop', loop: 'grid', grid: 'wave', wave: 'stack', stack: 'nodes' } as const;

function altArt(art: Project['art']) {
  return {
    hue: (art.hue + 164) % 360,
    hue2: (art.hue2 + 96) % 360,
    motif: ALT_MOTIF[art.motif],
  };
}

/* ============================================================
   PROJECT CARD
   ============================================================ */

function ProjectCard({ project }: { project: Project }) {
  const lightRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState(false);
  const preview = useHoverPreview({
    id: project.slug,
    title: project.title,
    eyebrow: project.category,
    meta: project.year,
    art: project.art,
    index: project.index,
  });

  useGSAP(
    () => {
      const frame = frameRef.current;
      const art = artRef.current;
      const wipe = wipeRef.current;
      if (!frame) return;
      if (reduced) {
        wipe?.remove();
        return;
      }

      // Cover drifts against the scroll while the card moves with it. The art
      // is 24% taller than the frame precisely so this has room to travel.
      if (art) {
        gsap.fromTo(
          art,
          { yPercent: -7 },
          {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.5 },
          },
        );
      }

      // Wipe the cover in from the bottom edge on first sight.
      if (wipe) {
        gsap.fromTo(
          wipe,
          { clipPath: 'inset(0% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 100% 0%)',
            duration: 1.05,
            ease: EASE.inOutQuart,
            scrollTrigger: { trigger: frame, start: 'top 86%', once: true },
            onComplete: () => wipe.remove(),
          },
        );
      }
    },
    { dependencies: [reduced] }
  );

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = lightRef.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
  };

  return (
    <article
      id={`project-${project.slug}`}
      data-slug={project.slug}
      data-cursor-label="Inspect"
      className="group relative flex flex-col scroll-mt-32 border-t border-line pt-6"
      onPointerMove={onPointerMove}
      {...preview}
    >
      {/* pointer-following light */}
      <div
        ref={lightRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-6 -z-0 h-72 opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:-inset-x-6"
        style={{
          background:
            'radial-gradient(340px circle at var(--x, 50%) var(--y, 50%), rgba(200,255,77,0.07), transparent 65%)',
        }}
      />

      {/* header row */}
      <div className="relative z-10 mb-5 flex items-start justify-between gap-6">
        <span className="font-mono text-[0.68rem] tracking-[0.2em] text-muted transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-x-1.5">
          {project.index}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase">
          <span className="text-acid">{project.category}</span>
          <span>{project.year}</span>
          {project.status && <span className="border border-line px-2 py-0.5">{project.status}</span>}
        </div>
      </div>

      {/* Explicit height rather than aspect-ratio: pairing `aspect-ratio` with a
          `max-height` makes the browser re-derive the *width* from the clamped
          height, which collapsed these covers to 544px on a 1360px card.

          The artwork is deliberately taller than the frame and centred, so the
          parallax below can drift it without ever exposing an edge. */}
      <div
        ref={frameRef}
        className="relative z-10 overflow-hidden rounded-sm border border-line-soft"
      >
        <div className="h-[240px] transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04] sm:h-[280px] lg:h-[340px]">
          {/* Cover drifts against the scroll while the card moves with it. The
              art is 24% taller than the frame precisely so this has room to
              travel. `will-change`: the scrubbed transform invalidates the
              whole PixelSwap subtree per frame otherwise — a full-card repaint
              while scrolling; promoted, it is one repeatable texture the
              compositor translates. Measured: the burst raster load across
              this section halved with the promotion alone. */}
          <div ref={artRef} className="h-[124%] -translate-y-[10%] will-change-transform">
            {/* React Bits: PixelSwap — hovering re-encodes the cover to its
                alternate composition, wave starting from the cursor. */}
            <PixelSwap
              firstContent={
                <ProjectArt art={project.art} index={project.index} label={project.category} className="h-full w-full" />
              }
              secondContent={
                <ProjectArt art={altArt(project.art)} index={project.index} label={project.category} className="h-full w-full" />
              }
              pattern="pointer"
              pixelSize={48}
              gap={2}
              pixelDuration={480}
              duration={640}
              bounce={0.3}
              randomness={0.16}
              trigger="hover"
              intro={false}
              className="h-full w-full"
              style={{ aspectRatio: 'auto' }}
            />
          </div>
        </div>

        {/* Clip wipe: the cover is drawn in from the bottom edge as the card enters,
            which reads as the system "loading" the system. Removed from the DOM
            once it has done its job. */}
        <span ref={wipeRef} aria-hidden="true" className="cover-wipe pointer-events-none absolute inset-0 bg-ink" />
      </div>

      {/* title — the kicker and the rule slide in from the left on hover, so
          the card feels like it is opening rather than just recolouring. */}
      <div className="relative z-10 mt-6">
        <h3 className="flex flex-wrap items-baseline gap-x-3">
          <span className="font-display text-h3 tracking-[-0.035em] text-bone transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-1.5">
            {project.title}
          </span>
          <span className="font-display text-h3 italic text-muted transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-3">
            {project.kicker}
          </span>
        </h3>

        <p
          className={`mt-4 max-w-[62ch] text-[0.95rem] leading-relaxed text-muted transition-opacity duration-500 ${
            expanded ? 'opacity-100' : 'opacity-90'
          }`}
        >
          {project.summary}
        </p>

        {/* stack */}
        <ul className="mt-5 flex flex-wrap gap-x-2 gap-y-2">
          {project.stack.map((s) => (
            <li
              key={s}
              className="rounded-full border border-line px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.1em] text-muted"
            >
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* actions */}
      <div className="relative z-10 mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="mono-label group/btn inline-flex items-center gap-2 text-bone transition-colors hover:text-acid"
        >
          <GitBranch size={13} aria-hidden="true" />
          View source
          <ArrowUpRight
            size={13}
            aria-hidden="true"
            className="transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5"
          />
        </a>

        {project.demoUrl && (
          <a
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mono-label inline-flex items-center gap-2 text-muted transition-colors hover:text-bone"
          >
            <Globe size={13} aria-hidden="true" />
            Live demo
          </a>
        )}

        {project.license && (
          <span className="mono-label text-dim">{project.license}</span>
        )}

        <CopyButton
          value={absoluteAnchor(`#project-${project.slug}`)}
          label="Copy link"
          className="ml-auto"
        />
      </div>

      {/* Touch users get a real disclosure button instead of hover-only detail */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="mono-label relative z-10 mt-4 self-start text-acid sm:hidden"
      >
        {expanded ? 'Less detail' : 'More detail'}
      </button>
    </article>
  );
}

/* ============================================================
   SECTION
   ============================================================ */

export function SelectedWork() {
  return (
    <section id="work" className="relative z-10 py-section" aria-labelledby="work-title">
      <div className="container-x">
        {/* header */}
        <div className="grid gap-8 border-b border-line pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mono-label mb-5"><ScrambleText text="002 / Selected work" /></p>
            <MaskLines as="h2" id="work-title" className="max-w-[14ch] text-h1" step={0.11}>
              Systems built to <span className="text-outline-acid italic">be inspected.</span>
            </MaskLines>
          </div>
          <p className="max-w-[38ch] text-[0.95rem] leading-relaxed text-muted">
            Six projects from a public archive of {profile.meta.publicRepos}. Each description
            comes from the repository itself — README, structure, dependencies — rather than intent.
          </p>
        </div>

        {/* asymmetric grid */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-20 md:grid-cols-2 lg:gap-y-28">
          {featuredProjects.map((p, i) => (
            <Reveal
              key={p.slug}
              mode="up"
              delay={i % 2 === 1 ? 0.1 : 0}
              className={[
                i === 0 || i === 5 ? 'lg:col-span-2' : '',
                i === 5 ? 'lg:mt-6' : '',
              ].join(' ')}
            >
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>

        {/* ── The explorer (React Bits: CursorGrid) ──
            The archive search gets one contained reactive surface: a survey
            grid behind the index rows only. Cells light under the pointer
            while the table is scanned — thematically an index machine, not an
            ambient page-wide field. Tuned dim so the rows stay the subject. */}
        <div className="relative" data-cursor-label="Search">
          <div aria-hidden="true" className="absolute inset-0">
            <CursorGrid
              cellSize={56}
              radius={120}
              gridOpacity={0.05}
              fillOpacity={0.04}
              maxOpacity={0.5}
              spotlight={0.28}
              holdTime={420}
              fadeDuration={900}
              edgeFade={0.25}
              ambient={0.1}
              pulseSpeed={720}
              color="#c8ff4d"
              gridColor="#f0f0e8"
            />
          </div>
          <div className="relative">
            <ProjectExplorer publicRepos={profile.meta.publicRepos} />
          </div>
        </div>
      </div>
    </section>
  );
}