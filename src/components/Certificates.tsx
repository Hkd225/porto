import { useMemo } from 'react';
import type { Certificate } from '../data/certificates';
import { certificates, plateMerit } from '../data/certificates';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ArrowUpRight } from 'lucide-react';

import { Section } from './Section';
import { CircularCarousel } from './reactbits';

/**
 * Certificates — the receipts.
 *
 * Twelve flagship plates ride the vendor ring (drift, drag, snap); the
 * registry below carries all forty documents in full, transcribed from the
 * original PDFs — title, issuer, issue date and verification route exactly
 * as printed. Nothing here is paraphrased ambition: where a document carries
 * no URL, its printed certificate number is shown instead.
 */
export function Certificates() {
  const wide = useMediaQuery('(min-width: 768px)');

  /* The ring scales to fit its container, so a narrow viewport gets fewer
     cards to keep the front plate legible — eight on phones, twelve on. */
  const ring = useMemo(() => {
    const byPath = new Map(certificates.map((c) => [c.src, c] as const));
    return plateMerit
      .slice(0, wide ? 12 : 8)
      .map((src) => byPath.get(src))
      .filter((c): c is Certificate => Boolean(c))
      .map((c) => ({
        src: c.src,
        alt: `${c.title} — ${c.issuer}, issued ${c.date}.`,
        title: c.title,
        subtitle: `${c.issuer} · ${c.date}`,
      }));
  }, [wide]);

  const issuers = new Set(certificates.map((c) => c.issuer)).size;
  const verified = certificates.filter((c) => c.verify).length;

  return (
    <Section
      id="certificates"
      num="07"
      label="Certificates"
      title="Proof on paper"
      lede="Every claim above this line keeps a receipt. Forty documents, transcribed from the originals."
    >
      {/* The ring — the section's single interaction. */}
      <CircularCarousel
        items={ring}
        preset="cylinder"
        intro="rise"
        cardWidth={210}
        aspectRatio={1.41}
        gap={24}
        autoplay="drift"
        speed={10}
        parallax={0.25}
        stretch={0.35}
        fadeColor="#080808"
        innerShade={0.6}
        cornerRadius={8}
        captions
        style={{ height: 'clamp(430px, 64vw, 620px)' }}
      />

      {/* The registry — all forty, newest first. */}
      <div className="mt-16 sm:mt-20">
        <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-b border-line-soft pb-4">
          <p className="kicker">The registry</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
            {certificates.length} documents · {issuers} issuing bodies · {verified} verification links
          </p>
        </div>

        <ol className="grid gap-x-12 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((c) => (
            <li key={c.src} className="border-b border-line-soft py-4">
              <div className="flex items-baseline justify-between gap-4">
                <p className="min-w-0 truncate text-[13px] leading-snug text-bone/90" title={c.title}>
                  {c.title}
                </p>
                {c.verify && (
                  <a
                    href={c.verify}
                    target="_blank"
                    rel="noreferrer"
                    title={`Verify "${c.title}" with the issuer`}
                    className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors duration-200 hover:text-bone"
                  >
                    <span className="flex items-center gap-1">
                      Verify <ArrowUpRight size={11} strokeWidth={1.5} className="link-caret" />
                    </span>
                  </a>
                )}
              </div>
              <p className="mt-1 font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-dim">
                {c.date} · {c.issuer}
              </p>
              {c.ref && (
                <p className="mt-0.5 break-all font-mono text-[10px] leading-relaxed text-dim/80" title={c.ref}>
                  ref {c.ref}
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
