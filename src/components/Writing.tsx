import { ArrowUpRight } from 'lucide-react';

import { Section } from './Section';
import { DecryptedText } from './reactbits';
import { writing } from '../data/projects';

/**
 * Writing — published notes on Medium.
 *
 * Titles decrypt on first view (a quiet nod to the subject matter); textures
 * are treated to the site's greyscale so the section stays inside the
 * monochrome world. Word counts and dates come from the RSS feed, not memory.
 */
export function Writing() {
  return (
    <Section
      id="writing"
      num="04"
      label="Writing"
      title="Published notes"
      lede="Two long-form pieces on Medium so far — process, not tutorials."
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {writing.map((w) => (
          <a
            key={w.title}
            href={w.url}
            target="_blank"
            rel="noreferrer"
            className="group flex flex-col border border-line-soft bg-ink transition-colors duration-300 hover:border-line-2"
          >
            {/* Texture plate — greyscale, credited in public/img/CREDITS.md. */}
            <div className="relative h-44 overflow-hidden" aria-hidden="true">
              <img
                src={w.art}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover opacity-70 grayscale transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            </div>

            <div className="flex flex-1 flex-col gap-5 p-7 sm:p-9">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
                <span>{w.published}</span>
                <span>{w.words} words</span>
              </div>

              <h3 className="font-display text-[clamp(1.4rem,1.9vw,1.8rem)] leading-[1.12]">
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

              <p className="text-sm leading-relaxed text-muted">{w.summary}</p>

              <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-5">
                <div className="flex gap-2">
                  {w.tags.map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>
                <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors duration-200 group-hover:text-bone">
                  Read <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </Section>
  );
}
