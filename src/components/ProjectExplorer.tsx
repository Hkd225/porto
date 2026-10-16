import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { gsap } from '../lib/gsap';

import { CopyButton } from './CopyButton';
import { absoluteAnchor } from '../lib/url';
import { focusProject, projectSlugFromHash } from '../lib/projects';
import { Reveal } from './Reveal';
import {
  projectCategories,
  projectIndex,
  type ProjectCategory,
  type ProjectIndexEntry,
} from '../data/projects';

type CategoryFilter = ProjectCategory | 'All';

const FILTERS: CategoryFilter[] = ['All', ...projectCategories];

/**
 * Every repository on the site in one searchable list.
 *
 * The featured six above are presented editorially, so this deliberately joins
 * them back together with the archive rather than leaving the archive as a
 * separate, much smaller list — the point is that 18 projects are reachable
 * without leaving the page.
 */
export function ProjectExplorer({ publicRepos }: { publicRepos: number }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');
  const [deployedOnly, setDeployedOnly] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  /**
   * FLIP bookkeeping.
   *
   * Last-known final position of every row, so the next filter can be played
   * backwards: measure where a row was, let React put it where it now belongs,
   * then animate it from the old spot. Without this the grid simply snaps and
   * the filter reads as a page load rather than as a reorganisation.
   */
  const prevPositions = useRef(new Map<string, { top: number; left: number }>());
  const hasMeasured = useRef(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projectIndex.filter((p) => {
      if (category !== 'All' && p.category !== category) return false;
      if (deployedOnly && !p.demoUrl) return false;
      if (!q) return true;
      // Title and stack are what people actually search by; the note is the fallback.
      return (
        p.title.toLowerCase().includes(q) ||
        p.stack.some((s) => s.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.note.toLowerCase().includes(q)
      );
    });
  }, [query, category, deployedOnly]);

  /* Deep link: #project-<slug> flashes the matching card on load, so a project
     URL pasted into a chat visibly lands somewhere. */
  useEffect(() => {
    const slug = projectSlugFromHash();
    if (slug) focusProject(slug);
  }, []);

  /*
    Layout transition.

    Runs after the DOM has already been updated, and compares against the
    positions stored on the previous run — the "First, Last, Invert, Play"
    technique. Two rules it has to respect:

      - transforms are cleared before measuring, otherwise a row still being
        animated from a previous filter is measured mid-flight and the next
        filter inherits that error;
      - entering rows are not translated, they are faded and scaled in.
        Inventing a start position for a row that did not exist before is what
        produces the "everything flies in from the left" artefact.
  */
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-flip]'));
    if (!rows.length) {
      prevPositions.current = new Map();
      hasMeasured.current = false;
      return;
    }

    if (hasMeasured.current) gsap.set(rows, { clearProps: 'transform' });

    const next = new Map<string, { top: number; left: number }>();
    rows.forEach((row) => {
      const slug = row.dataset.flip!;
      const rect = row.getBoundingClientRect();
      next.set(slug, { top: rect.top, left: rect.left });

      const prev = prevPositions.current.get(slug);
      if (!hasMeasured.current) return;

      if (prev) {
        const dx = prev.left - rect.left;
        const dy = prev.top - rect.top;
        if (dx === 0 && dy === 0) return;
        gsap.fromTo(
          row,
          { x: dx, y: dy },
          {
            x: 0,
            y: 0,
            duration: 0.62,
            ease: 'power3.out',
            overwrite: true,
          },
        );
      } else {
        gsap.fromTo(
          row,
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out', overwrite: true },
        );
      }
    });

    prevPositions.current = next;
    hasMeasured.current = true;
  }, [results]);

  /* "/" focuses the filter, the way it works in most tools. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey) return;
      const el = document.activeElement;
      const typing =
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable);
      if (typing) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const dirty = query !== '' || category !== 'All' || deployedOnly;

  return (
    <div className="mt-24 border-t border-line pt-10 lg:mt-32">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h3 className="font-display text-h3 tracking-[-0.035em]">
          Project index{' '}
          <span className="font-mono text-base tracking-[0.1em] text-muted">
            ({results.length}/{projectIndex.length})
          </span>
        </h3>
        <p className="mono-label text-dim">
          {publicRepos} public repositories
        </p>
      </div>

      {/* Controls */}
      <div className="mt-8 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-dim"
            />
            <label htmlFor="project-search" className="sr-only">
              Search projects by name, stack or category
            </label>
            <input
              id="project-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, stack, category…"
              autoComplete="off"
              className="w-full border border-line bg-ink py-3 pr-10 pl-11 font-mono text-[0.72rem] tracking-[0.08em] text-bone placeholder:text-dim focus:border-acid focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-dim transition-colors hover:text-acid"
              >
                <X size={14} aria-hidden="true" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setDeployedOnly((v) => !v)}
            aria-pressed={deployedOnly}
            className={`mono-label border px-4 py-3 transition-colors ${
              deployedOnly ? 'border-acid text-acid' : 'border-line text-muted hover:text-bone'
            }`}
          >
            Deployed only
          </button>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {FILTERS.map((f) => {
            const active = category === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setCategory(f)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-1.5 font-mono text-[0.62rem] tracking-[0.14em] uppercase transition-colors ${
                  active
                    ? 'border-acid text-acid'
                    : 'border-line text-muted hover:border-bone/40 hover:text-bone'
                }`}
              >
                {f}
              </button>
            );
          })}

          {dirty && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setCategory('All');
                setDeployedOnly(false);
              }}
              className="mono-label ml-auto px-2 py-1.5 text-dim transition-colors hover:text-acid"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <p className="mt-10 border border-line-soft px-5 py-6 text-sm leading-relaxed text-dim">
          Nothing matches that. The archive holds {projectIndex.length} projects — try a stack name
          like <span className="text-acid">FAISS</span> or{' '}
          <span className="text-acid">YOLOv8</span>.
        </p>
      ) : (
        <ul
          ref={listRef}
          data-project-index
          className="mt-10 grid grid-cols-1 gap-x-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.map((p, i) => (
            <li key={p.slug}>
              <ProjectRow project={p} order={i + 1} />
            </li>
          ))}
        </ul>
      )}

      <p className="mono-label mt-8 text-dim">
        Press <Kbd>/</Kbd> to search · <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> for the command palette
      </p>
    </div>
  );
}

/* ============================================================
   ROW
   ============================================================ */

function ProjectRow({ project, order }: { project: ProjectIndexEntry; order: number }) {
  return (
    <Reveal as="div" mode="up" className="h-full border-t border-line pt-5">
      <div data-slug={project.slug} data-flip={project.slug} className="group flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <h4 className="text-base tracking-[-0.02em]">
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-display transition-colors group-hover:text-acid"
            >
              {project.title}
            </a>
          </h4>
          <span className="font-mono text-[0.62rem] tracking-[0.16em] text-dim">
            {String(order).padStart(2, '0')}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted">{project.note}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-mono text-[0.58rem] tracking-[0.12em] text-acid uppercase">
            {project.category}
          </span>
          <span className="font-mono text-[0.58rem] tracking-[0.12em] text-dim">
            {project.year}
          </span>
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[0.58rem] tracking-[0.12em] text-dim uppercase transition-colors hover:text-acid"
            >
              Deployed ↗
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {project.stack.slice(0, 4).map((s) => (
            <span
              key={s}
              className="rounded-full border border-line-soft px-2 py-0.5 font-mono text-[0.58rem] tracking-[0.1em] text-dim"
            >
              {s}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center gap-5 pt-5">
          <CopyButton value={absoluteAnchor(`#project-${project.slug}`)} label="Copy" />
          <CopyButton value={project.repoUrl} label="Repo URL" />
        </div>
      </div>
    </Reveal>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-bone">
      {children}
    </kbd>
  );
}