import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, CornerDownLeft, Search } from 'lucide-react';
import { gsap, EASE } from '../lib/gsap';

import { SECTIONS, SECTION_SHORTCUTS } from '../data/sections';
import { featuredProjects, archive } from '../data/projects';
import { hfArtifacts, artifactUrl } from '../data/huggingface';
import { profile } from '../data/profile';
import { scrollToSection } from '../hooks/useSmoothScroll';
import { focusProject } from '../lib/projects';

/* ============================================================
   COMMANDS
   ============================================================ */

type Command =
  | { kind: 'section'; id: string; label: string; hint: string; shortcut: string }
  | { kind: 'project'; id: string; label: string; hint: string; repo: string }
  | { kind: 'external'; label: string; hint: string; href: string }
  | { kind: 'action'; label: string; hint: string; run: () => void }
  | { kind: 'copy'; label: string; hint: string; value: string };

/**
 * The palette is built once at module scope. It is a static menu — every entry
 * reads from data that does not change while the page is alive — so there is no
 * reason to rebuild and re-filter the list on every keystroke.
 */
const COMMANDS: Command[] = [
  ...SECTIONS.map((s) => ({
    kind: 'section' as const,
    id: s.id,
    label: s.label,
    hint: s.hint,
    shortcut: SECTION_SHORTCUTS[s.id],
  })),
  ...featuredProjects.map((p) => ({
    kind: 'project' as const,
    id: p.slug,
    label: p.title,
    hint: `${p.category} · ${p.year}`,
    repo: p.repoUrl,
  })),
  ...archive.map((p) => ({
    kind: 'project' as const,
    id: p.slug,
    label: p.title,
    hint: `${p.category} · ${p.year}`,
    repo: p.repoUrl,
  })),
  ...hfArtifacts.map((m) => ({
    kind: 'project' as const,
    id: `hf-${m.slug}`,
    label: m.title,
    hint: `${m.weights === 'adapter' ? 'Adapter' : 'Merged'} · ${m.published}`,
    repo: artifactUrl(m.slug),
  })),
  {
    kind: 'external',
    label: 'GitHub',
    hint: '@Hkd225 — source for every project',
    href: profile.links.github,
  },
  {
    kind: 'external',
    label: 'Hugging Face',
    hint: '@Hakid — public models',
    href: profile.links.huggingface,
  },
  {
    kind: 'external',
    label: 'Medium',
    hint: '@hakid19 — published notes',
    href: profile.links.medium,
  },
  {
    kind: 'external',
    label: 'LinkedIn',
    hint: 'Professional profile',
    href: profile.links.linkedin,
  },
  {
    kind: 'action',
    label: 'Back to top',
    hint: 'Scroll back to the index',
    run: () => scrollToSection('#index', 0),
  },
  ...(profile.links.email
    ? [
        {
          kind: 'copy' as const,
          label: 'Copy email address',
          hint: profile.links.email,
          value: profile.links.email,
        },
      ]
    : []),
];

/**
 * Substring scoring. Ranked rather than filtered so that a prefix hit on the
 * title always outranks a mid-word hit in the hint text.
 */
function score(command: Command, query: string): number {
  if (!query) return 1;
  const q = query.toLowerCase();
  const label = command.label.toLowerCase();
  if (label === q) return 100;
  if (label.startsWith(q)) return 80;
  if (label.includes(q)) return 60;
  if (command.hint.toLowerCase().includes(q)) return 30;
  return 0;
}

/* ============================================================
   PALETTE
   ============================================================ */

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Fully controlled: the trigger lives in the Navbar, so the open state has to
 * be owned above both rather than kept here.
 */
export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  /**
   * Separate from `open`.
   *
   * Closing needs to play an exit before anything unmounts; flipping `open`
   * straight to false would delete the dialog mid-animation and the palette
   * would snap shut every time.
   */
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  /** Last position of each result row, for the layout transition below. */
  const prevRows = useRef(new Map<string, { top: number }>());

  const results = useMemo(() => {
    return COMMANDS.map((c) => ({ c, s: score(c, query.trim()) }))
      .filter((r) => r.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c);
  }, [query]);

  /* The highlight index is clamped during render rather than resynced from an
     effect. A narrower query can leave the cursor past the end of the list, and
     deriving the safe value here avoids the extra render that a
     setState-in-effect would cost on every keystroke. */
  const cursor = results.length === 0 ? 0 : Math.min(active, results.length - 1);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const run = useCallback(
    (command: Command) => {
      onOpenChange(false);
      switch (command.kind) {
        case 'section':
          requestAnimationFrame(() => scrollToSection(`#${command.id}`, -80));
          break;
        case 'project':
          // Write the deep link first so the address bar matches what is on
          // screen, then let the shared helper scroll and flash the card.
          history.replaceState(null, '', `#project-${command.id}`);
          if (!focusProject(command.id)) {
            // Nothing on this page matched the slug, so open the repository
            // rather than appearing to do nothing.
            window.open(command.repo, '_blank', 'noopener,noreferrer');
          }
          break;
        case 'external':
          window.open(command.href, '_blank', 'noopener,noreferrer');
          break;
        case 'action':
          command.run();
          break;
        case 'copy':
          // Fire-and-forget: the palette closes either way, and a clipboard
          // rejection has nowhere useful to surface to.
          void navigator.clipboard?.writeText(command.value).catch(() => {});
          break;
      }
    },
    [onOpenChange],
  );

  /* Global bindings: Ctrl/Cmd+K to open, Escape to close. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (!open) restoreRef.current = document.activeElement as HTMLElement;
        onOpenChange(!open);
        return;
      }
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  /* While open: lock scroll, move focus in, and hand focus back on close.

     Keyed on `mounted` as well as `open`. The dialog only exists in the DOM
     once `mounted` is true, and `setMounted` happens in an effect — so an
     effect keyed on `open` alone runs one commit before the input exists,
     finds a null ref, and silently never focuses anything. */
  useEffect(() => {
    if (!open || !mounted) return;

    document.body.style.overflow = 'hidden';
    inputRef.current?.focus();
    inputRef.current?.select();

    return () => {
      document.body.style.overflow = '';
      restoreRef.current?.focus?.();
    };
  }, [open, mounted]);

  /* While open: own the keyboard. */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || (e.key === 'n' && e.ctrlKey)) {
        e.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
      } else if (e.key === 'ArrowUp' || (e.key === 'p' && e.ctrlKey)) {
        e.preventDefault();
        setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
      } else if (e.key === 'Home') {
        setActive(0);
      } else if (e.key === 'End') {
        setActive(Math.max(0, results.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const picked = results[cursor];
        if (picked) run(picked);
      } else if (e.key === 'Tab') {
        // Focus is deliberately trapped: the only focusable things are the
        // input and the option list, so there is nowhere useful to go.
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, cursor, results, run]);

  /* Keep the highlighted option inside the scroll viewport. */
  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor, open]);

  /* Open and close are animated, so the dialog stays mounted for the length of
     its exit. Flipping `open` straight to false would delete it mid-animation
     and the palette would snap shut every time. */
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    if (!mounted) return;
    const panel = panelRef.current;
    if (!panel) {
      setMounted(false);
      return;
    }
    const tween = gsap.to(panel, {
      opacity: 0,
      scale: 0.97,
      y: -8,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setMounted(false);
        gsap.set(panel, { clearProps: 'all' });
      },
    });
    return () => {
      tween.kill();
    };
  }, [open, mounted]);

  /* Enter animation. Its deps are the open/mount pair, which only changes on
     open and on the tail of close — so this fires once per opening and cannot
     restart the stagger in the middle of a search. */
  useEffect(() => {
    if (!open || !mounted) return;
    const panel = panelRef.current;
    if (!panel) return;

    gsap
      .timeline()
      .fromTo(
        panel,
        { opacity: 0, scale: 0.97, y: -10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.34, ease: EASE.out },
      )
      .fromTo(
        panel.querySelectorAll('[data-option]'),
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.022, ease: EASE.out },
        0.05,
      );
  }, [open, mounted]);

  /*
    Layout transition for the results.

    Typing reorders the list — the ranking jumps around as the query narrows —
    and without a transition every row teleports. Same FLIP approach as the
    project filter: remember where each row was, let React re-rank, then play
    the difference back.

    Only surviving rows are moved; new ones fade in. Inventing a start position
    for something that was not previously on screen is what produces the
    "everything flies in from the left" artefact.
  */
  useLayoutEffect(() => {
    if (!open) return;
    const list = listRef.current;
    if (!list) return;

    const rows = Array.from(list.querySelectorAll<HTMLElement>('[data-flip-key]'));
    if (!rows.length) {
      prevRows.current = new Map();
      return;
    }

    if (prevRows.current.size) gsap.set(rows, { clearProps: 'transform' });

    const next = new Map<string, { top: number }>();
    rows.forEach((row) => {
      const key = row.dataset.flipKey!;
      const top = row.getBoundingClientRect().top;
      next.set(key, { top });

      const prev = prevRows.current.get(key);
      if (!prevRows.current.size) return;

      if (prev) {
        const dy = prev.top - top;
        if (Math.abs(dy) > 0.5) {
          gsap.fromTo(row, { y: dy }, { y: 0, duration: 0.42, ease: 'power3.out', overwrite: true });
        }
      } else {
        gsap.fromTo(
          row,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.34, ease: 'power3.out', overwrite: true },
        );
      }
    });

    prevRows.current = next;
  }, [results, open]);

  return (
    <>
      {mounted && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className="fixed inset-0 z-[220] flex items-start justify-center bg-ink/80 px-4 pt-[12vh] backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={panelRef}
            className="w-full max-w-xl border border-line bg-ink shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search size={15} aria-hidden="true" className="shrink-0 text-dim" />
              <label htmlFor="palette-input" className="sr-only">
                Search sections, projects and links
              </label>
              <input
                id="palette-input"
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Jump to a section, project or link…"
                autoComplete="off"
                spellCheck={false}
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[cursor] ? `palette-opt-${cursor}` : undefined}
                className="w-full bg-transparent font-mono text-[0.8rem] tracking-[0.06em] text-bone placeholder:text-dim focus:outline-none"
              />
              <button
                type="button"
                onClick={close}
                className="mono-label shrink-0 text-dim transition-colors hover:text-acid"
              >
                Esc
              </button>
            </div>

            <div
              ref={listRef}
              id="palette-list"
              role="listbox"
              aria-label="Results"
              className="max-h-[52vh] overflow-y-auto overscroll-contain py-2"
            >
              {results.length === 0 ? (
                <p className="px-5 py-6 text-sm text-dim">
                  Nothing matches “{query}”. Try a project name, a section, or a platform.
                </p>
              ) : (
                results.map((c, i) => (
                  <button
                    key={`${c.kind}-${'id' in c ? c.id : c.label}`}
                    id={`palette-opt-${i}`}
                    data-index={i}
                    data-option
                    data-flip-key={'id' in c ? c.id : c.label}
                    role="option"
                    aria-selected={i === cursor}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => run(c)}
                    className={`flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors ${
                      i === cursor ? 'bg-surface' : ''
                    }`}
                  >
                    <span className="min-w-0">
                      <span
                        className={`block truncate font-display text-[0.95rem] tracking-[-0.02em] ${
                          i === cursor ? 'text-acid' : 'text-bone'
                        }`}
                      >
                        {c.label}
                      </span>
                      <span className="mono-label block truncate text-dim">{c.hint}</span>
                    </span>

                    <span className="flex shrink-0 items-center gap-3">
                      {c.kind === 'section' && (
                        <span className="font-mono text-[0.6rem] tracking-[0.14em] text-dim">
                          {c.shortcut}
                        </span>
                      )}
                      {c.kind === 'external' && (
                        <ArrowUpRight size={13} aria-hidden="true" className="text-dim" />
                      )}
                      {i === cursor && (
                        <CornerDownLeft size={13} aria-hidden="true" className="text-dim" />
                      )}
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-5 py-3">
              <span className="mono-label text-dim">{results.length} results</span>
              <span className="mono-label text-dim">↑ ↓ to move · ↵ to open</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}