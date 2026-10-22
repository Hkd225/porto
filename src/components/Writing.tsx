import { ArrowUpRight } from 'lucide-react';

import { Section } from './Section';
import { DecryptedText } from './reactbits';
import { writing } from '../data/projects';

/** Polled reading pace — long-form web essays at a calm stride. */
const READ_WPM = 220;

/**
 * Writing — the published record.
 *
 * An editorial ledger instead of a card grid: a sticky stat column whose
 * counts are read from the Medium RSS feed (honest about being fetched,
 * not remembered) beside full-width essay rows. Titles decrypt once when
 * they enter view — the section's only effect — and hovering a row brings
 * its texture plate up behind the type at whisper opacity, staying inside
 * the mono world.
 */
export function Writing() {
  const words = writing.reduce((sum, w) => sum + w.words, 0);
  const minutes = Math.max(1, Math.round(words / READ_WPM));

  return (
    <Section
      id="writing"
      num="05"
      label="Writing"
      title="Published notes"
      lede="Two long-form pieces on Medium so far — process, not tutorials."
    >
      <div className="grid gap-14 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-16">
        {/* Stat ledger — small print, carried honestly. */}
        <aside className="h-fit border border-line-soft lg:sticky lg:top-28">
          <div className="border-b border-line-soft px-6 py-5">
            <p className="kicker">Reading ledger</p>
          </div>
          <dl className="flex flex-col divide-y divide-line-soft">
            <div className="flex items-baseline justify-between gap-6 px-6 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">Essays</dt>
              <dd className="font-mono text-sm tabular-nums text-bone">{String(writing.length).padStart(2, '0')}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 px-6 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">Words</dt>
              <dd className="font-mono text-sm tabular-nums text-bone">{words.toLocaleString('en-US')}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 px-6 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">Reading</dt>
              <dd className="font-mono text-sm tabular-nums text-bone">≈ {minutes} min</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 px-6 py-5">
              <dt className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">Venue</dt>
              <dd className="font-mono text-sm tracking-[0.08em] text-bone">Medium</dd>
            </div>
          </dl>
          <p className="border-t border-line-soft px-6 py-5 text-[11px] leading-relaxed text-dim">
            Counts are read from the Medium RSS feed — never from memory.
          </p>
        </aside>

        {/* Essay ledger — one row per piece; hover raises its texture. */}
        <ol className="flex flex-col border-y border-line-soft">
          {writing.map((w, i) => {
            const mins = Math.max(1, Math.round(w.words / READ_WPM));
            return (
              <li key={w.title}>
                <a
                  href={w.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block border-b border-line-soft last:border-b-0"
                >
                  {/* Texture plate — whisper opacity behind the type. */}
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <img
                      src={w.art}
                      alt=""
                      loading="lazy"
                      className="h-full w-full scale-[1.02] object-cover opacity-0 grayscale transition-opacity duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-[0.16]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-ink" />
                  </div>

                  <div className="relative z-10 flex flex-col gap-5 px-1 py-10 sm:px-3">
                    <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-[0.24em] text-dim">
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      <span className="h-px w-6 translate-y-[-3px] bg-line-2" aria-hidden="true" />
                      <span>{w.published}</span>
                      <span>{w.words.toLocaleString('en-US')} words</span>
                      <span>≈ {mins} min read</span>
                    </div>

                    <h3 className="max-w-[26ch] font-display leading-[1.04] tracking-[-0.01em] text-[clamp(1.9rem,3.4vw,3rem)] transition-colors duration-300">
                      <DecryptedText
                        text={w.title}
                        effect="scramble"
                        animateOn="view"
                        speed={22}
                        maxIterations={9}
                        revealDirection="start"
                        characters="01:<>/#—"
                        encryptedClassName="text-dim/70"
                      />
                    </h3>

                    <p className="max-w-[58ch] text-sm leading-relaxed text-muted">{w.summary}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-5">
                      <div className="flex flex-wrap gap-2">
                        {w.tags.map((t) => (
                          <span key={t} className="chip">{t}</span>
                        ))}
                      </div>
                      <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors duration-200 group-hover:text-bone">
                        Read on Medium <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
