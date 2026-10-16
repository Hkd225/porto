import { useState } from 'react';
import { profile } from '../data/profile';
import { Reveal } from './Reveal';
import { MaskLines } from './MaskLines';
import { ScrambleText } from './ScrambleText';
import { Shuffle } from './reactbits';

/* ============================================================
   TECHNOLOGY TAXONOMY
   Editorial groups, not proficiency bars. On desktop the hovered group
   lights up a node in the constellation; on mobile it degrades to a
   plain, readable list.
   ============================================================ */

function FocusConstellation() {
  const [active, setActive] = useState<string>(profile.focus[0].id);
  const current = profile.focus.find((f) => f.id === active) ?? profile.focus[0];

  return (
    <div className="mt-16 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* group list — doubles as the accessible navigation for the diagram */}
      <ul
        className="flex flex-col gap-px border border-line"
        onMouseLeave={() => setActive(profile.focus[0].id)}
      >
        {profile.focus.map((f) => {
          const isActive = f.id === active;
          return (
            <li key={f.id}>
              <button
                type="button"
                onMouseEnter={() => setActive(f.id)}
                onFocus={() => setActive(f.id)}
                onClick={() => setActive(f.id)}
                aria-pressed={isActive}
                className={`flex w-full flex-col gap-2 px-5 py-5 text-left transition-colors duration-300 ${
                  isActive ? 'bg-surface' : 'bg-ink hover:bg-surface/60'
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                      isActive ? 'bg-acid' : 'bg-dim'
                    }`}
                  />
                  <span
                    className={`font-display text-lg tracking-[-0.025em] transition-colors duration-300 ${
                      isActive ? 'text-acid' : 'text-bone'
                    }`}
                  >
                    {f.label}
                  </span>
                </span>
                <span className="text-sm leading-relaxed text-muted">{f.blurb}</span>
                <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.6rem] tracking-[0.1em] text-dim uppercase">
                  {f.items.join(' · ')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* constellation */}
      <div className="relative hidden overflow-hidden border border-line lg:block">
        <svg
          viewBox="0 0 400 400"
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="node-glow">
              <stop offset="0%" stopColor="#c8ff4d" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#c8ff4d" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* static constellation */}
          {profile.focus.map((f, i) => {
            const angle = (i / profile.focus.length) * Math.PI * 2 - Math.PI / 2;
            const x = 200 + Math.cos(angle) * 128;
            const y = 200 + Math.sin(angle) * 128;
            const isActive = f.id === active;

            return (
              <g key={f.id}>
                <line
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke={isActive ? '#c8ff4d' : 'rgba(240,240,232,0.16)'}
                  strokeWidth={isActive ? 1.4 : 1}
                  style={{ transition: 'stroke 400ms' }}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 5 : 3}
                  fill={isActive ? '#c8ff4d' : 'rgba(240,240,232,0.4)'}
                  style={{ transition: 'all 400ms cubic-bezier(.16,1,.3,1)' }}
                />
                {isActive && <circle cx={x} cy={y} r={26} fill="url(#node-glow)" />}
                <text
                  x={x}
                  y={y + 20}
                  textAnchor="middle"
                  className="font-mono"
                  fontSize="9"
                  letterSpacing="1.4"
                  fill={isActive ? '#c8ff4d' : 'rgba(240,240,232,0.4)'}
                  style={{ transition: 'fill 400ms' }}
                >
                  {f.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          <circle
            cx="200"
            cy="200"
            r="30"
            fill="none"
            stroke="rgba(240,240,232,0.22)"
            strokeDasharray="2 6"
          />
          <text
            x="200"
            y="203"
            textAnchor="middle"
            className="font-mono"
            fontSize="10"
            letterSpacing="2"
            fill="#969a90"
          >
            {current.label.split(' ')[0].toUpperCase()}
          </text>
        </svg>

        <span className="absolute bottom-4 left-4 font-mono text-[0.6rem] tracking-[0.18em] text-dim uppercase">
          Areas of work — not certifications
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   ABOUT
   ============================================================ */

export function About() {
  return (
    <section
      id="about"
      className="relative z-10 border-t border-line py-section"
      aria-labelledby="about-title"
    >
      {/* Photographic wallpaper — an ink-wash scan flipped to white strokes on
          black, i.e. the photograph's own paper/ink relationship reversed to
          sit inside this palette. Ghosted at rest under ink gradients so the
          long read keeps full contrast. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <img
          src="/img/wash-grey.jpg"
          alt=""
          loading="lazy"
          className="h-full w-full object-cover object-center opacity-15 [filter:invert(1)_grayscale(1)_brightness(.55)_contrast(1.1)]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/10 to-ink" />
      </div>

      <div className="container-x">
        <p className="mono-label mb-5"><ScrambleText text="007 / About" /></p>

        <div className="grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-20">
          <div>
            <MaskLines as="h2" id="about-title" className="max-w-[15ch] text-h1" step={0.11}>
              Curious about what{' '}
              <span className="text-outline-acid italic">intelligence can become.</span>
            </MaskLines>

            <div className="mt-10 flex flex-col gap-6">
              {profile.longBio.map((p, i) => (
                /* Masked line reveal instead of a block fade: the paragraph
                   resolves line by line, so the eye is led down the column
                   rather than being handed three blocks at once. */
                <MaskLines
                  key={i}
                  className="max-w-[58ch] text-lead font-light leading-relaxed text-muted"
                  delay={i * 0.08}
                >
                  {p}
                </MaskLines>
              ))}
            </div>

            {/* statement plate */}
            <Reveal mode="up" className="mt-12">
              <blockquote className="border-l-2 border-acid py-2 pl-6">
                {/* React Bits: Shuffle — the statement deals itself in letter
                    by letter the first time it enters view, and re-deals on
                    hover. Inline styles beat the component's stylesheet
                    defaults (4rem 'Press Start 2P'): className alone loses the
                    specificity contest as often as it wins it. */}
                <Shuffle
                  key={profile.statement}
                  text={profile.statement}
                  tag="p"
                  className="max-w-[30ch] font-display italic text-bone"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-h3)',
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    textAlign: 'left',
                    textTransform: 'none',
                  }}
                  shuffleTimes={1}
                  duration={0.42}
                  stagger={0.028}
                  animationMode="evenodd"
                  ease="power3.out"
                  accentColor="rgba(200,255,77,0.8)"
                  triggerOnHover
                />
              </blockquote>
            </Reveal>
          </div>

          {/* facts — only verified values */}
          <Reveal mode="left" className="lg:pt-24">
            <dl className="flex flex-col border-t border-line">
              {[
                { k: 'Focus', v: 'Agentic AI · Uncertainty' },
                { k: 'Primary language', v: 'Python' },
                { k: 'Public repositories', v: String(profile.meta.publicRepos) },
                { k: 'On GitHub since', v: profile.meta.githubSince },
                { k: 'Based in', v: 'Not disclosed publicly' },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-4"
                >
                  <dt className="mono-label">{row.k}</dt>
                  <dd className="text-right text-sm text-bone">{row.v}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 text-sm leading-relaxed text-dim">
              Exact dates, affiliations and formal qualifications are omitted rather than
              guessed.
            </p>
          </Reveal>
        </div>

        <Reveal mode="up" className="mt-24 lg:mt-32">
          <p className="mono-label mb-6">Technology constellation</p>
          <FocusConstellation />
        </Reveal>
      </div>
    </section>
  );
}