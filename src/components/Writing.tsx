import { ArrowUpRight, BookOpen } from 'lucide-react';
import { writing, type Writing } from '../data/projects';
import { Reveal } from './Reveal';
import { Cascade } from './Cascade';
import { useHoverPreview, artFor } from '../hooks/useProjectPreview';
import { ScrambleText } from './ScrambleText';
import { MaskLines } from './MaskLines';
import { GlareHover } from './reactbits';

/** Rough reading time from the verified word count. ~220 wpm. */
const readingTime = (words: number) => Math.max(1, Math.round(words / 220));

function WritingCard({ post, index }: { post: Writing; index: number }) {
  /* No repository metadata to draw from, so the cover is derived from the
     title — deterministic, so a given piece keeps the same cover forever. */
  const preview = useHoverPreview({
    id: post.url,
    title: post.title,
    eyebrow: post.tags[0],
    meta: `${readingTime(post.words)} min read`,
    art: artFor(post.title),
    index: String(index + 1).padStart(2, '0'),
  });

  return (
    /* React Bits: GlareHover — a bone sheen travels the card on approach.
        The wrapper renders inline-grid with place-items center, so the card
        must own w-full; its own bg and hover tint stay untouched because the
        glare layer sits above the content. */
    <GlareHover
      width="100%"
      background="transparent"
      borderColor="transparent"
      borderRadius="0px"
      glareColor="#f0f0e8"
      glareOpacity={0.32}
      glareAngle={-35}
      glareSize={30}
      softness={0.55}
      variant="streak"
      mode="follow"
      transitionDuration={700}
      className="w-full"
    >
      <a
        href={post.url}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor-label="Read"
        className="group relative flex w-full flex-col justify-between gap-10 bg-ink p-7 transition-colors duration-500 hover:bg-surface md:p-9"
        {...preview}
      >
        <div>
          <div
            data-cascade
            className="flex flex-wrap items-center gap-3 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase"
          >
            <span className="text-acid">{post.tags[0]}</span>
            <span aria-hidden="true">/</span>
            <span>{post.published}</span>
            <span aria-hidden="true">/</span>
            <span className="inline-flex items-center gap-1.5">
              <BookOpen size={11} aria-hidden="true" />
              {readingTime(post.words)} min read
            </span>
          </div>

          <h3
            data-cascade
            className="mt-6 max-w-[24ch] font-display text-h3 leading-[1.1] tracking-[-0.035em] text-bone transition-colors duration-500 group-hover:text-acid"
          >
            {post.title}
          </h3>

          <p data-cascade className="mt-4 max-w-[46ch] leading-relaxed text-muted">
            {post.summary}
          </p>
        </div>

        <div data-cascade className="flex items-center justify-between">
          <span className="mono-label">{String(index + 1).padStart(2, '0')}</span>
          <span className="flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.16em] text-muted uppercase transition-colors duration-500 group-hover:text-acid">
            Read on Medium
            <ArrowUpRight
              size={14}
              aria-hidden="true"
              className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </a>
    </GlareHover>
  );
}

export function Writing() {
  return (
    <section
      id="writing"
      className="relative z-10 border-t border-line py-section"
      aria-labelledby="writing-title"
    >
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mono-label mb-5"><ScrambleText text="006 / Notes & writing" /></p>
            <MaskLines as="h2" id="writing-title" className="max-w-[16ch] text-h1" step={0.11}>
              Reasoning <span className="italic text-acid">written down.</span>
            </MaskLines>
          </div>
          <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">
            Two published pieces. Both are listed with their real titles and dates — nothing here
            is padded with placeholder articles.
          </p>
        </div>

        <Cascade step={0.12} className="mt-16 grid gap-px border border-line md:grid-cols-2">
          {writing.map((post, i) => (
            <WritingCard key={post.url} post={post} index={i} />
          ))}
        </Cascade>

        <Reveal mode="fade" delay={0.1} className="mt-8">
          <p className="max-w-[62ch] border border-line-soft px-5 py-4 text-sm leading-relaxed text-dim">
            More notes are in progress — mostly on memory consolidation and on measuring whether
            an agent’s self-reported confidence means anything. They will appear here as they
            are published.
          </p>
        </Reveal>
      </div>
    </section>
  );
}