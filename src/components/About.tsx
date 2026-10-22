import { FadeContent } from './reactbits';
import { Section } from './Section';
import { profile } from '../data/profile';

/**
 * About — the honest version.
 *
 * Three paragraphs (the middle one is the actual method), then a right rail
 * with only verifiable facts: repo counts, licence-like availability, and one
 * contact hint. Nothing aspirational is added.
 */
export function About() {
  return (
    <Section
      id="about"
      num="06"
      label="About"
      title="Independent projects, built and documented in public"
    >
      <FadeContent duration={0.9} threshold={0.2} className="grid gap-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {/* Narrative column */}
        <div className="flex max-w-[62ch] flex-col gap-8">
          <p className="font-display text-[clamp(1.45rem,2.3vw,2rem)] leading-[1.3] text-bone/95">
            {profile.longBio[0]}
          </p>
          {profile.longBio.slice(1).map((p) => (
            <p key={p.slice(0, 24)} className="text-[0.95rem] leading-relaxed text-muted">
              {p}
            </p>
          ))}

          <p className="border-t border-line-soft pt-6 font-mono text-[10px] uppercase leading-loose tracking-[0.22em] text-dim">
            {profile.availability}
          </p>
        </div>

        {/* Verified facts rail */}
        <aside className="flex flex-col gap-8 border border-line-soft p-7 sm:p-9">
          <div>
            <p className="kicker">Verified</p>
            <dl className="mt-6 grid gap-4 font-mono text-[11px] tracking-[0.12em]">
              <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-4">
                <dt className="uppercase tracking-[0.2em] text-dim">GitHub</dt>
                <dd className="text-bone/90">@Hkd225 · {profile.meta.publicRepos} repos</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-4">
                <dt className="uppercase tracking-[0.2em] text-dim">Hugging Face</dt>
                <dd className="text-bone/90">@Hakid · {profile.meta.hfModels} models</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-b border-line-soft pb-4">
                <dt className="uppercase tracking-[0.2em] text-dim">Medium</dt>
                <dd className="text-bone/90">@hakid19</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="uppercase tracking-[0.2em] text-dim">Sharing publicly since</dt>
                <dd className="text-bone/90">{profile.meta.githubSince}</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <p className="kicker">Where the work lives</p>
            <p className="text-sm leading-relaxed text-muted">
              Code on GitHub, weights and model cards on Hugging Face, long-form notes on Medium.
              Descriptions here mirror the repositories — if a project changes, the README is the
              source of truth.
            </p>
          </div>
        </aside>
      </FadeContent>
    </Section>
  );
}
