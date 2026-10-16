import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Cpu, Layers, Link2 } from 'lucide-react';

import {
  HF_PROFILE,
  HF_PROFILE_URL,
  adapterCount,
  artifactUrl,
  datasets,
  formatParams,
  lineages,
  mergedCount,
  models,
  spaces,
  totalDownloads,
  totalParams,
  type HFArtifact,
} from '../data/huggingface';
import { ProjectArt } from './ProjectArt';
import { Reveal } from './Reveal';
import { Cascade } from './Cascade';
import { MaskLines } from './MaskLines';
import { ScrambleText } from './ScrambleText';
import { CountUp } from './CountUp';
import { SpotlightCard } from './reactbits';
import { useHoverPreview } from '../hooks/useProjectPreview';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/** `unsloth/Qwen2.5-3B-Instruct-bnb-4bit` → `Qwen2.5 3B Instruct` */
const shortModel = (id: string): string => {
  const name = id.includes('/') ? id.slice(id.indexOf('/') + 1) : id;
  return name
    .replace(/-bnb-4bit$/i, '')
    .replace(/-unsloth$/i, '')
    .replace(/-Instruct-/i, ' ')
    .replace(/-/g, ' ');
};

const isOwnRepo = (base: string) => base.startsWith(`${HF_PROFILE}/`);

/**
 * `qwen25-3b-alpaca-id-qlora` → `Qwen2.5 3B`
 *
 * The Hub's own slashes encode the version oddly — `qwen25` is Qwen 2.5, `qwen3`
 * is Qwen 3, and the parameter count follows as `-3b`. Reading it back out gives
 * a short, non-redundant corner label; the card's kicker line already says what
 * the adapter does, so repeating it on the cover is noise.
 */
const familyOf = (slug: string): string => {
  const q = /qwen(\d)(\d?)-(\d+)b/i.exec(slug);
  if (!q) return 'Hugging Face';
  return `Qwen${q[1]}${q[2] ? `.${q[2]}` : ''} ${q[3]}B`;
};

/* ------------------------------------------------------------------ card -- */

function ModelCard({ model, index }: { model: HFArtifact; index: number }) {
  const preview = useHoverPreview({
    id: model.slug,
    title: model.title,
    eyebrow: model.kicker,
    meta: model.weights === 'adapter' ? 'PEFT adapter' : `${formatParams(model.params)} params`,
    art: model.art,
    index: String(index + 1).padStart(2, '0'),
  });

  return (
    <a
      href={artifactUrl(model.slug)}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor-label="Open"
      className="group flex min-w-0 flex-col"
      {...preview}
    >
      <div className="relative aspect-[4/3] overflow-hidden border-b border-line-soft">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.05]">
          <ProjectArt
            art={model.art}
            index={String(index + 1).padStart(2, '0')}
            label={familyOf(model.slug)}
            /* Required: every layer inside ProjectArt is absolutely positioned,
               so without an explicit size its root collapses to zero height and
               the SVG renders at 0px tall. */
            className="h-full w-full"
          />
        </div>

        {/* Adapter vs merged — the one thing worth knowing before loading it. */}
        <span
          data-cascade
          className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-ink/70 px-2.5 py-1 font-mono text-[0.58rem] tracking-[0.16em] text-bone uppercase backdrop-blur-sm"
        >
          {model.weights === 'adapter' ? <Layers size={10} aria-hidden="true" /> : <Cpu size={10} aria-hidden="true" />}
          {model.weights === 'adapter' ? 'Adapter' : 'Merged'}
        </span>

        {model.params !== undefined && (
          <span
            data-cascade
            className="absolute right-4 bottom-4 font-mono text-[0.6rem] tracking-[0.14em] text-bone/80"
          >
            {formatParams(model.params)} params
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-8 p-6 md:p-7">
        <div>
          <h3
            data-cascade
            className="font-display text-h3 leading-[1.1] tracking-[-0.035em] text-bone transition-colors duration-500 group-hover:text-acid"
          >
            {model.title}
          </h3>
          <p data-cascade className="mt-2 text-lg italic text-muted">
            {model.kicker}
          </p>
          <p data-cascade className="mt-4 max-w-[44ch] text-[0.95rem] leading-relaxed text-muted">
            {model.summary}
          </p>
        </div>

        <div data-cascade>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.6rem] tracking-[0.15em] uppercase">
            <span className="text-acid">{model.license}</span>
            <span aria-hidden="true" className="text-line">/</span>
            <span className="text-dim">{model.published}</span>
            <span aria-hidden="true" className="text-line">/</span>
            <span className="text-dim">{model.downloads} downloads</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-line-soft pt-4">
            {/*
              `min-w-0 flex-1` on the wrapper and `truncate` on the text inside,
              rather than `truncate max-w-[60%]` on one element.

              A percentage max-width against a grid track is indefinite while the
              track's own min-content is being resolved, so the nowrap text set
              the track's minimum instead of shrinking inside it — which pushed
              every card to 327px and overflowed a 320px viewport by 47px.
              A flex item with `min-w-0` has a definite width to truncate against.
            */}
            <span
              className={`inline-flex min-w-0 flex-1 items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.12em] ${
                isOwnRepo(model.baseModel) ? 'text-acid' : 'text-dim'
              }`}
              title={`Fine-tuned from ${model.baseModel}`}
            >
              <Link2 size={10} aria-hidden="true" className="shrink-0" />
              <span className="truncate">from {shortModel(model.baseModel)}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[0.6rem] tracking-[0.16em] text-muted uppercase transition-colors duration-500 group-hover:text-acid">
              Model card
              <ArrowUpRight
                size={13}
                aria-hidden="true"
                className="transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

/* --------------------------------------------------------------- lineage -- */

/**
 * The fine-tuning graph, drawn as you scroll past it.
 *
 * Worth the scroll-linked treatment because it is the one structural fact the
 * card grid cannot show: these are not five parallel experiments. Two of them
 * chain — the GRPO pass is trained *on top of* the QLoRA checkpoint beside it,
 * so the arrow points at a repo in this same section.
 */
function LineageMap() {
  const rootRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-lineage-row]'));
      const links = Array.from(root.querySelectorAll<HTMLElement>('[data-lineage-link]'));

      if (reduced) {
        gsap.set(links, { scaleX: 1 });
        return;
      }

      // Drawn from their own row, so the connector extends as the row enters
      // rather than all of them finishing together at the bottom of the block.
      links.forEach((link) => {
        const row = link.closest('[data-lineage-row]');
        gsap.fromTo(
          link,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: EASE.outExpo,
            scrollTrigger: { trigger: row ?? link, start: 'top 88%', once: true },
          },
        );
      });

      gsap.from(rows, {
        opacity: 0,
        y: 18,
        duration: 0.7,
        stagger: 0.09,
        ease: EASE.out,
        scrollTrigger: { trigger: root, start: 'top 82%', once: true },
      });
    },
    { dependencies: [reduced], scope: rootRef },
  );

  return (
    <ol ref={rootRef} className="mt-16 grid gap-px border border-line bg-line">
      {lineages.map((chain) => (
        <li
          key={chain.key}
          data-lineage-row
          className="flex flex-col gap-4 bg-ink p-6 md:flex-row md:items-center md:gap-6 md:p-7"
        >
          <span className="mono-label md:w-44 md:shrink-0">{shortModel(chain.base)}</span>

          <span aria-hidden="true" className="relative hidden h-px w-full shrink-0 bg-line md:block md:w-14">
            <span
              data-lineage-link
              className="absolute inset-0 origin-left bg-acid/70"
              style={{ transformOrigin: 'left center' }}
            />
          </span>

          <ul className="flex flex-wrap gap-2">
            {chain.stages.map((s) => (
              <li key={s.slug}>
                <a
                  href={artifactUrl(s.slug)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 border border-line px-3 py-1.5 font-mono text-[0.62rem] tracking-[0.12em] text-muted transition-colors duration-300 hover:border-acid hover:text-acid"
                >
                  {s.title}
                  <span className="text-dim">
                    {s.weights === 'adapter' ? 'adapter' : formatParams(models.find((m) => m.slug === s.slug)?.params)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

/* ----------------------------------------------------------------- stats -- */

function Stat({
  label,
  value,
  decimals = 0,
  suffix = '',
  note,
}: {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  note?: string;
}) {
  return (
    <div className="bg-ink px-6 py-7">
      <dt className="mono-label">{label}</dt>
      <dd className="mt-3 font-display text-h2 leading-none text-bone">
        <CountUp value={value} decimals={decimals} suffix={suffix} />
        {note && <span className="ml-2 align-baseline text-base text-dim">{note}</span>}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ page -- */

export function Models() {
  const emptyKinds = [
    { kind: 'Spaces', count: spaces.length },
    { kind: 'Datasets', count: datasets.length },
  ];

  return (
    <section
      id="models"
      className="relative z-10 border-t border-line py-section"
      aria-labelledby="models-title"
    >
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="mono-label mb-5"><ScrambleText text="004 / Model weights" /></p>
            <MaskLines as="h2" id="models-title" className="max-w-[16ch] text-h1" step={0.11}>
              Weights you can <span className="italic text-acid">load.</span>
            </MaskLines>
          </div>
          <p className="max-w-[36ch] text-[0.95rem] leading-relaxed text-muted">
            Fine-tuned checkpoints published on Hugging Face. Sizes, licences and download counts are
            read from the Hub — adapters show no parameter count because they do not carry weights of
            their own.
          </p>
        </div>

        {/* Stat strip. Every figure is a real count from the data file. */}
        <Reveal mode="fade" delay={0.05}>
          <dl className="mt-16 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
            <Stat label="Models" value={models.length} />
            {/* Counted in billions so the roll-up reads 0 → 12.74 rather than
                crawling through twelve trillion. */}
            <Stat label="Parameters" value={totalParams / 1e9} decimals={2} suffix="B" />
            <Stat label="Adapters" value={adapterCount} note={`/ ${mergedCount} merged`} />
            <Stat label="Downloads" value={totalDownloads} />
          </dl>
        </Reveal>

        <LineageMap />

        {/*
          Five cards do not divide into three columns, and a dead cell at the end
          of a bordered grid reads as a mistake rather than as breathing room —
          so the last card spans the remaining two and closes the row.
        */}
        <Cascade
          step={0.1}
          className="mt-16 grid gap-px border border-line md:grid-cols-2 xl:grid-cols-3 xl:[&>*:last-child]:col-span-2"
        >
          {models.map((model, i) => (
            <SpotlightCard
              key={model.slug}
              spotlightColor="#c8ff4d"
              intensity={0.14}
              spotlightSize={280}
              softness={0.75}
              borderGlow={0.7}
              proximity={60}
              grain={0}
              style={{
                /* The card surface lives on this root so the spotlight
                   layer (z -1) stays visible beneath the card's content;
                   outer pills/edges are neutralized because the cascade
                   grid already draws the hairlines. */
                '--spotlight-card-surface': 'var(--color-ink)',
                '--spotlight-card-border': 'transparent',
                '--spotlight-card-shadow': 'none',
                padding: 0,
                borderRadius: 0,
              }}
            >
              <ModelCard model={model} index={i} />
            </SpotlightCard>
          ))}
        </Cascade>

        <Reveal mode="fade" delay={0.1}>
          <div className="mt-8 flex flex-col gap-6 border border-line-soft px-5 py-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-[58ch] text-sm leading-relaxed text-dim">
              Every repository links to its own model card, including the training configuration and
              the datasets it was tuned on.
              {emptyKinds.every((k) => k.count === 0) && (
                <> No Spaces or Datasets are published yet.</>
              )}
            </p>
            <a
              href={HF_PROFILE_URL}
              target="_blank"
              rel="noreferrer me noopener"
              className="mono-label inline-flex shrink-0 items-center gap-2 border border-line px-5 py-3 transition-colors duration-300 hover:border-acid hover:text-acid"
            >
              huggingface.co/{HF_PROFILE}
              <ArrowUpRight size={13} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}