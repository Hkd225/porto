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
import { profile } from '../data/profile';

const STATS = [
  { label: 'Published models', value: hfArtifacts.length, decimals: 0, suffix: '' },
  { label: 'Parameters trained', value: totalParams / 1e9, decimals: 2, suffix: 'B' },
  { label: 'Public repos', value: profile.meta.publicRepos, decimals: 0, suffix: '' },
  { label: 'Adapter checkpoints', value: adapterCount, decimals: 0, suffix: '' },
] as const;

/**
 * Models — the Hugging Face shelf.
 *
 * Weight/adapter is the first thing a caller needs to know before loading a
 * checkpoint, so it leads every row. Merged rows get the ShinyText sheen — the
 * one place in the section that quietly states "these are complete networks".
 */
export function Models() {
  return (
    <Section
      id="models"
      num="03"
      label="Models"
      title="Published model weights"
      lede={`${mergedCount} merged checkpoints and ${adapterCount} adapters on Hugging Face — fine-tuned on Qwen bases.`}
    >
      {/* Counts. */}
      <div className="grid grid-cols-2 gap-px border border-line-soft bg-line-soft lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-3 bg-ink p-7 sm:p-8">
            <CountUp value={s.value} decimals={s.decimals} suffix={s.suffix} className="font-display text-[clamp(2.4rem,4.2vw,3.8rem)] leading-none" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Rows. */}
      <ul className="mt-14 divide-y divide-line-soft border-y border-line-soft">
        {hfArtifacts.map((m, i) => (
          <li key={m.slug}>
            <a
              href={artifactUrl(m.slug)}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-6 px-2 py-9 transition-colors duration-200 hover:bg-surface/60 lg:grid-cols-[minmax(0,4fr)_minmax(0,3fr)_auto] lg:items-center"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-baseline gap-4">
                  <span className="num text-bone/70">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-[clamp(1.45rem,2vw,1.9rem)] leading-tight">{m.title}</h3>
                </div>
                <p className="font-display text-base italic text-muted">{m.kicker}</p>
                <p className="max-w-[56ch] text-sm leading-relaxed text-muted">{m.summary}</p>
              </div>

              <div className="flex flex-wrap content-start gap-1.5">
                {m.stack.map((s) => (
                  <span key={s} className="chip">{s}</span>
                ))}
                {m.datasets?.map((d) => (
                  <span key={d} className="chip opacity-80">{d}</span>
                ))}
              </div>

              <div className="flex flex-col items-start gap-1.5 lg:items-end">
                {m.weights === 'merged' ? (
                  <ShinyText
                    text="Merged weights"
                    speed={2.4}
                    className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/80"
                  />
                ) : (
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Adapter</span>
                )}
                <span className="font-mono text-[10px] tracking-[0.08em] text-dim lg:text-right">{m.baseModel}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                  {m.params ? `${formatParams(m.params)} · ` : ''}Published {m.published.replace('-', '/')}
                </span>
                <span className="mt-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim transition-colors duration-200 group-hover:text-bone">
                  Open on HF <ArrowUpRight size={12} strokeWidth={1.5} className="link-caret" />
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
        Weights live on {HF_PROFILE_URL.replace('https://', '')}
      </p>
    </Section>
  );
}
