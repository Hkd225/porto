import { ArrowUpRight } from 'lucide-react';

import { CountUp } from './CountUp';
import { Section } from './Section';
import { ShinyText } from './reactbits';
import {
  HF_PROFILE_URL,
  adapterCount,
  artifactUrl,
  formatParams,
  hfArtifacts,
  mergedCount,
  totalParams,
} from '../data/models';

/* Stats first — four counts that describe the shelf, read once on entry
   (the local CountUp pins its ScrollTrigger with `once`, so the numbers
   never re-roll on later passes). All values come from the public
   Hugging Face API and safetensors metadata, same as the rows below. */
const STATS = [
  { label: 'Published models', value: hfArtifacts.length, decimals: 0, suffix: '' },
  { label: 'Parameters trained', value: totalParams / 1e9, decimals: 2, suffix: 'B' },
  { label: 'Merged checkpoints', value: mergedCount, decimals: 0, suffix: '' },
  { label: 'Adapters', value: adapterCount, decimals: 0, suffix: '' },
] as const;

/**
 * The one technical visual in the section: a linear 0–10B parameter axis.
 * Merged checkpoints (real safetensors counts) are marked in sage; the
 * adapters' shared base is pinned at ≈4B. Static by design — a quiet
 * measuring instrument between the counts and the archive rows, not
 * another animated background.
 */
const AXIS_MAX_B = 10;
const MARKERS: Array<{ pos: string; hot: boolean; text: string }> = [
  ...hfArtifacts
    .filter((m) => m.params !== undefined)
    .map((m) => ({
      pos: `${((m.params as number) / 1e9 / AXIS_MAX_B) * 100}%`,
      hot: true,
      text: `${formatParams(m.params)} — ${m.title}`,
    })),
  { pos: `${(4 / AXIS_MAX_B) * 100}%`, hot: false, text: '≈4B — base of the two Research Assistants' },
].sort((a, b) => Number.parseFloat(a.pos) - Number.parseFloat(b.pos));

const TICKS: Array<{ label: string; at: number }> = [
  { label: '0', at: 0 },
  { label: '2.5B', at: 25 },
  { label: '5B', at: 50 },
  { label: '7.5B', at: 75 },
  { label: '10B', at: 100 },
];

/**
 * Models — the shelf as an archive.
 *
 * Five editorial rows, newest first. At rest a row shows its catalog face
 * (name, weight type, scale, date); hovering opens the band beneath with
 * the description, tooling chips and exact base repo. The band opens only
 * on hover-capable pointers — on touch/mobile it prints open, because a
 * row that hides its own summary behind a touch target hides it forever.
 * ShinyText appears exactly once, labelling the shelf as open source.
 */
export function Models() {
  return (
    <Section
      id="models"
      num="04"
      label="Model research"
      title="The model archive"
      lede={`${mergedCount} merged checkpoints and ${adapterCount} adapters on Hugging Face — fine-tuned on Qwen bases.`}
    >
      {/* Counts — animated once, on first arrival. */}
      <div className="grid grid-cols-2 gap-px border border-line-soft bg-line-soft lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-3 bg-ink p-7 sm:p-8">
            <CountUp
              value={s.value}
              decimals={s.decimals}
              suffix={s.suffix}
              className="font-display text-[clamp(2.4rem,4.2vw,3.8rem)] leading-none"
            />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Parameter axis — the section's single technical visual. */}
      <div className="mt-14 border-b border-line-soft pb-8 sm:mt-16">
        <div className="flex items-baseline justify-between gap-6">
          <p className="num">Parameter axis — linear, 0–10B</p>
          <p className="hidden text-sm text-dim sm:block">Full networks in sage; adapters ride their base</p>
        </div>
        <div className="relative mt-6 h-16" aria-hidden="true">
          <span className="absolute inset-x-0 top-5 h-px bg-line-2" />
          {TICKS.map((t) => (
            <span key={t.label} className="absolute top-5 h-2 w-px bg-line-2" style={{ left: `${t.at}%` }} />
          ))}
          {MARKERS.map((m) => (
            <span
              key={m.text}
              className={`absolute top-5 w-px ${m.hot ? 'h-6 bg-accent' : 'h-3.5 bg-line-2'}`}
              style={{ left: m.pos }}
            />
          ))}
          {TICKS.map((t) => (
            <span
              key={t.label}
              className="absolute top-10 font-mono text-[10px] tracking-[0.15em] text-dim"
              style={
                t.at === 0
                  ? { left: 0 }
                  : t.at === 100
                    ? { right: 0 }
                    : { left: `${t.at}%`, transform: 'translateX(-50%)' }
              }
            >
              {t.label}
            </span>
          ))}
        </div>
        <p className="mt-4 flex flex-wrap gap-x-7 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          {MARKERS.map((m) => (
            <span key={m.text} className="flex items-center gap-2.5">
              <span className={`h-3.5 w-px ${m.hot ? 'bg-accent' : 'bg-line-2'}`} aria-hidden="true" />
              {m.text}
            </span>
          ))}
        </p>
      </div>

      {/* Archive rows. */}
      <div className="mt-14 flex flex-wrap items-baseline justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
          {hfArtifacts.length} entries — newest first, from {HF_PROFILE_URL.replace('https://', '')}
        </p>
        <ShinyText
          text="Open source"
          speed={2.4}
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/80"
        />
      </div>

      <ul className="mt-5 divide-y divide-line-soft border-y border-line-soft">
        {hfArtifacts.map((m, i) => (
          <li key={m.slug}>
            <a
              href={artifactUrl(m.slug)}
              target="_blank"
              rel="noreferrer"
              className="group block transition-colors duration-200 hover:bg-surface/45"
            >
              {/* Catalog face — what a caller needs before loading a checkpoint. */}
              <div className="grid gap-x-8 gap-y-4 px-3 pb-7 pt-8 sm:px-4 lg:grid-cols-[3.25rem_minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
                <span className="num pt-1.5 text-bone/70">{String(i + 1).padStart(2, '0')}</span>

                <div className="min-w-0">
                  <h3 className="font-display text-[clamp(1.5rem,2.2vw,2.05rem)] leading-tight">{m.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{m.kicker}</p>
                </div>

                <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 lg:justify-end lg:text-right">
                  <span
                    className={`font-mono text-[10px] uppercase tracking-[0.22em] ${
                      m.weights === 'merged' ? 'text-bone/80' : 'text-dim'
                    }`}
                  >
                    {m.weights === 'merged' ? 'Merged weights' : 'Adapter'}
                  </span>
                  {m.params !== undefined && (
                    <span className="font-mono text-[10px] tracking-[0.08em] text-dim">{formatParams(m.params)}</span>
                  )}
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                    {m.published.replace('-', '/')}
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors duration-200 group-hover:text-bone">
                    Open on HF <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                  </span>
                </div>
              </div>

              {/* Hover band — description, tooling and the exact base repo.
                  grid-rows 0fr→1fr opens it without measuring; on touch it
                  prints open from the start. */}
              <div className="grid grid-rows-[1fr] opacity-100 transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-rows-[0fr] lg:opacity-0 lg:group-focus-within:grid-rows-[1fr] lg:group-focus-within:opacity-100 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100">
                <div className="lg:overflow-hidden">
                  <div className="grid gap-5 border-t border-line-soft/60 px-3 pb-7 pt-5 sm:px-4 lg:pl-[calc(3.25rem+2rem)]">
                    <p className="max-w-[62ch] text-sm leading-relaxed text-muted">{m.summary}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {m.stack.map((s) => (
                        <span key={s} className="chip">
                          {s}
                        </span>
                      ))}
                      {m.datasets?.map((d) => (
                        <span key={d} className="chip opacity-80">
                          {d}
                        </span>
                      ))}
                    </div>
                    <p className="font-mono text-[10px] tracking-[0.08em] text-dim">Base — {m.baseModel}</p>
                  </div>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
        Counts read from the public Hugging Face API and safetensors metadata — adapters report no weights of their own.
      </p>
    </Section>
  );
}
