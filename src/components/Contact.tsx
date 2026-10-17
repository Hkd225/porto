import { useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowUpRight, Check, Copy } from 'lucide-react';

import { StarBorder, TextPressure } from './reactbits';
import { profile } from '../data/profile';
import { scrollToSection } from '../hooks/useSmoothScroll';

const LINKS = [
  { label: 'GitHub', handle: '@Hkd225', url: profile.links.github },
  { label: 'Hugging Face', handle: '@Hakid', url: profile.links.huggingface },
  { label: 'LinkedIn', handle: 'Auffa Hakim', url: profile.links.linkedin },
  { label: 'Medium', handle: '@hakid19', url: profile.links.medium },
];

/**
 * Contact + footer.
 *
 * The signature moment: the name, set in a variable font that breathes while
 * idle and leans into the cursor when approached (TextPressure). Under it, the
 * email offered as a real mailto plus a copy control — a form with no backend
 * would drop mail, so there is none.
 */
export function Contact() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.links.email);
      setCopied(true);
      timer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the mailto link is the fallback. */
    }
  };

  return (
    <footer id="contact" className="border-t border-line-soft pt-[var(--spacing-section)]">
      <div className="wrap">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-baseline gap-4">
            <span className="num text-bone/70">06</span>
            <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
            <span className="overline">Contact</span>
          </div>
          <p className="hidden max-w-[300px] text-right text-sm leading-relaxed text-dim md:block">
            Open to research collaboration, agent infrastructure work, and interesting ML problems.
          </p>
        </div>

        {/* Signature wordmark — variable font breathes while idle. */}
        <div className="mt-14 h-[clamp(4rem,10vw,9rem)]">
          <TextPressure
            text="HAKID"
            italic={false}
            idle="pulse"
            idleSpeed={0.7}
            minFontSize={44}
            className="text-bone"
          />
        </div>

        {/* CTAs */}
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <StarBorder
            as="a"
            href={`mailto:${profile.links.email}`}
            theme="dark"
            color="#f2f2ef"
            radius={999}
            hover="brighten"
            className="px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em]"
          >
            <span className="flex items-center gap-3">
              Say hello
              <ArrowUpRight size={13} strokeWidth={1.5} className="link-caret" />
            </span>
          </StarBorder>

          <button
            type="button"
            onClick={copyEmail}
            className="flex items-center gap-3 rounded-full border border-line px-8 py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted transition-colors duration-200 hover:border-line-2 hover:text-bone"
          >
            {copied ? <Check size={13} strokeWidth={1.5} /> : <Copy size={13} strokeWidth={1.5} />}
            {copied ? 'Copied' : 'Copy email'}
          </button>
        </div>

        {/* Link cells — one per platform, hairline grid. */}
        <div className="mt-24 grid grid-cols-2 gap-px border border-line-soft bg-line-soft lg:grid-cols-4">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="group flex min-h-[150px] flex-col justify-between gap-10 bg-ink p-7"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim">{l.label}</span>
              <span className="flex items-center justify-between gap-2">
                <span className="font-display text-xl italic text-bone/90 transition-colors duration-200 group-hover:text-bone">
                  {l.handle}
                </span>
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.5}
                  className="text-dim transition-all duration-200 group-hover:-translate-y-[2px] group-hover:translate-x-[2px] group-hover:text-bone"
                />
              </span>
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-24 flex flex-wrap items-center justify-between gap-6 border-t border-line-soft py-10 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          <span>© 2026 {profile.name}</span>
          <span className="hidden md:inline">Monochrome — React Bits · GSAP · Lenis</span>
          <button
            type="button"
            onClick={() => scrollToSection('#index')}
            className="flex items-center gap-2 transition-colors duration-200 hover:text-bone"
          >
            Back to top <ArrowUp size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </footer>
  );
}
