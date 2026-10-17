import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

import { SlicedWaves, SpotlightCard } from './reactbits';
import type { CSSPropertiesWithVars } from './reactbits/types';
import { Section } from './Section';
import { prefersReducedMotion, refreshScrollTriggers } from '../lib/gsap';
import {
  archive,
  categories,
  categoryCounts,
  featuredProjects,
  type Category,
  type Project,
} from '../data/projects';

/** One flat view over featured + archive, in presentation order. */
interface Row {
  slug: string;
  title: string;
  kicker?: string;
  summary?: string;
  category: Category;
  year: string;
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  index?: string;
  featured: boolean;
}

const ROWS: Row[] = [
  ...featuredProjects.map((p): Row => ({ ...p, featured: true })),
  ...archive.map((a): Row => ({ slug: a.slug, title: a.title, summary: a.note, category: a.category, year: a.year, stack: a.stack, repoUrl: a.repoUrl, demoUrl: a.demoUrl, featured: false })),
];

type Filter = 'All' | Category;
const FILTERS: Filter[] = ['All', ...categories];

const countFor = (f: Filter) => (f === 'All' ? ROWS.length : categoryCounts[f] ?? 0);

export function Work() {
  const [filter, setFilter] = useState<Filter>('All');

  /*
    Filter swap = a recomposition, not a relayout shock. Jumping from
    "All" (18 rows) to a narrow category collapses ~1.3kpx of document in
    one commit, and switching back lurches everything below downward —
    the "blink downward". So the board frame glides to the new height
    (FLIP: measure, clamp, ease, release), the content dissolves in with
    one soft rise (`.work-board-in`), and ScrollTrigger re-measures once
    the height settles so the scenes below never fire at stale offsets.
  */
  const boardRef = useRef<HTMLDivElement | null>(null);
  const boardHeight = useRef<number | null>(null);

  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return undefined;
    const to = el.offsetHeight;
    const from = Number.parseFloat(el.style.height) || boardHeight.current;
    boardHeight.current = to;
    if (from == null || Math.abs(from - to) < 2) return undefined;
    if (prefersReducedMotion()) {
      refreshScrollTriggers();
      return undefined;
    }
    el.style.overflow = 'hidden';
    el.style.height = `${from}px`;
    el.style.transition = 'none';
    void el.offsetHeight; /* commit the clamped frame before easing out */
    el.style.transition = 'height 0.55s cubic-bezier(0.22, 1, 0.36, 1)';
    el.style.height = `${to}px`;
    const settle = () => {
      el.style.height = '';
      el.style.overflow = '';
      el.style.transition = '';
      refreshScrollTriggers();
    };
    el.addEventListener('transitionend', settle, { once: true });
    return () => el.removeEventListener('transitionend', settle);
  }, [filter]);

  const visible = useMemo(
    () => ROWS.filter((p) => filter === 'All' || p.category === filter),
    [filter]
  );
  const visFeatured = useMemo(() => visible.filter((p) => p.featured), [visible]);
  const visArchive = useMemo(() => visible.filter((p) => !p.featured), [visible]);
  const firstFeatured = visFeatured[0] as Project | Row | undefined; // index present only on featured

  return (
    <Section
      id="work"
      num="03"
      label="Selected work"
      title="A selection of built work"
      lede={`${featuredProjects.length} flagships and ${archive.length} archived builds — every description taken from the repositories themselves.`}
      className="pt-[calc(var(--spacing-section)*0.35)]"
      background={
        <>
          {/* Monochrome waves of light — same recolour discipline as the hero
              silk: bone, grey and graphite, nothing else. The effect is built
              for a ~600px stage, so it lives in its own bottom band instead of
              being stretched across the whole chapter; opacity stays low so
              the archive rows keep full legibility. */}
          <div className="absolute inset-x-0 bottom-0 h-[480px]">
            <SlicedWaves
              color1="#f2f2ef"
              color2="#8e8e88"
              color3="#3c3c39"
              ribbons={3}
              spacing={26}
              barWidth={0.5}
              ribbonHeight={0.24}
              spread={0.08}
              amplitude={0.09}
              frequency={1.1}
              speed={0.8}
              perspective={0.42}
              curve={0.45}
              blur={0.9}
              glow={0.4}
              brightness={1}
              position={0.72}
              rotation={0}
              slices={0}
              grain={0.08}
              fade={0.55}
              opacity={0.32}
              mouseInteraction
              intro
            />
          </div>
          {/* Legibility: ink melt at the header zone and both edges, plus a
              band-top melt so the last archive rows keep their contrast.
              All melts sit at z-10 to beat the composited WebGL canvas; the
              whole background layer is isolated so they cannot escape it. */}
          <div className="absolute inset-x-0 top-0 z-10 h-56 bg-gradient-to-b from-ink/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-56 bg-gradient-to-t from-ink/85 to-transparent" />
          <div
            className="absolute inset-x-0 bottom-0 z-10 h-[480px]"
            style={{
              background:
                'linear-gradient(to bottom, rgba(10,10,10,0.9), rgba(10,10,10,0.78) 52%, transparent 78%)',
            }}
          />
        </>
      }
    >
      {/* Category tabs with live counts — LPAS's "Housing 31 / Interiors 17…" grammar. */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors duration-200 ${
              filter === f
                ? 'border-bone bg-bone text-ink'
                : 'border-line text-muted hover:border-line-2 hover:text-bone'
            }`}
          >
            {f}
            <span className="ml-2 opacity-50">{countFor(f)}</span>
          </button>
        ))}
      </div>

      {/* The board — one measured frame for both tiers. The frame glides
          to the height of the active filter (FLIP in the layout effect
          above) while the content recomposes with one soft rise, so the
          page below follows instead of lurching. */}
      <div ref={boardRef}>
        <div key={filter} className="work-board-in">
          {/* Featured — hairline Swiss grid, spotlight follows the pointer. */}
          {firstFeatured && (
            <div className="mt-10 grid grid-cols-1 gap-px border border-line-soft bg-line-soft sm:grid-cols-2 xl:grid-cols-3">
              {visFeatured.map((p) => (
                <SpotlightCard
                  key={p.slug}
                  className="relative flex min-h-[380px] flex-col justify-between"
                  style={
                    {
                      padding: 'clamp(1.5rem, 2.6vw, 2.4rem)',
                      backgroundColor: 'var(--color-ink)',
                      borderRadius: '0px',
                      boxShadow: 'none',
                      '--spotlight-card-surface': 'var(--color-ink)',
                      '--spotlight-card-border': 'rgba(242, 242, 239, 0.12)',
                      '--spotlight-card-shadow': 'none',
                    } as CSSPropertiesWithVars
                  }
                  spotlightColor="rgba(242,242,239,0.07)"
                  intensity={0.55}
                  spotlightSize={560}
                  softness={0.8}
                  borderGlow={0.35}
                >
                  <div className="flex h-full flex-col justify-between">
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-[11px] tracking-[0.24em] text-dim">{p.index}</span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">{p.category}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <h3 className="font-display text-[clamp(1.7rem,2.4vw,2.35rem)] leading-[1.02]">{p.title}</h3>
                      {p.kicker && <p className="font-display italic text-lg text-muted">{p.kicker}</p>}
                      {p.summary && <p className="max-w-[52ch] text-sm leading-relaxed text-muted">{p.summary}</p>}
                    </div>

                    <div className="flex flex-col gap-5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.stack.slice(0, 5).map((s) => (
                          <span key={s} className="chip">{s}</span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-line-soft pt-4">
                        <div className="flex gap-5">
                          <a
                            href={p.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-bone"
                          >
                            Code <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                          </a>
                          {p.demoUrl && (
                            <a
                              href={p.demoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-bone"
                            >
                              Live <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                            </a>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-dim">{p.year}</span>
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          )}

          {/* Archive rows. */}
          {visArchive.length > 0 && (
            <div className="mt-16">
              <p className="overline">Archive — {visArchive.length} more</p>
              <ul className="mt-6 divide-y divide-line-soft border-b border-line-soft">
                {visArchive.map((p) => (
                  <li key={p.slug}>
                    <a
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 px-2 py-5 transition-colors duration-200 hover:bg-surface/60 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto]"
                    >
                      <span className="font-display text-lg italic text-bone/90 transition-colors duration-200 group-hover:text-bone">
                        {p.title}
                      </span>
                      <span className="col-span-2 text-sm text-dim sm:col-span-1">{p.summary}</span>
                      <span className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                        <span className="hidden md:inline">{p.year}</span>
                        <ArrowUpRight
                          size={13}
                          strokeWidth={1.5}
                          className="opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
