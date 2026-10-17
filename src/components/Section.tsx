import type { ReactNode } from 'react';

interface SectionProps {
  id: string;
  /** Two-digit chapter number, e.g. "01". */
  num: string;
  label: string;
  title?: string;
  /** Short right-hand note on the overline row. */
  lede?: string;
  className?: string;
  /** Optional animated backdrop rendered behind the chapter content. */
  background?: ReactNode;
  children: ReactNode;
}

/**
 * Shared chapter shell — the consistent frame every tracked section sits in:
 * a numbered overline row, an optional display title, then the body. The
 * uniform chrome is what makes the occasional full-bleed scene (hero, focus
 * carousel) read as intentional rather than random.
 */
export function Section({ id, num, label, title, lede, className = '', background, children }: SectionProps) {
  return (
    <section
      id={id}
      className={`relative border-t border-line-soft py-[var(--spacing-section)]${background ? ' overflow-hidden' : ''} ${className}`}
    >
      {background && (
        <div className="pointer-events-none absolute inset-0 isolate" aria-hidden="true">
          {background}
        </div>
      )}
      <div className="wrap relative z-10">
        <div className="flex items-start justify-between gap-8">
          <div className="flex items-baseline gap-4">
            <span className="num text-bone/70">{num}</span>
            <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
            <span className="overline">{label}</span>
          </div>
          {lede && <p className="hidden max-w-[300px] text-right text-sm leading-relaxed text-dim md:block">{lede}</p>}
        </div>

        {title && (
          <h2 className="mt-8 font-display leading-[1.0] tracking-[-0.015em] text-[clamp(2.1rem,4.6vw,4rem)]">
            {title}
          </h2>
        )}
      </div>

      <div className="wrap relative z-10 mt-14 sm:mt-16">{children}</div>
    </section>
  );
}
