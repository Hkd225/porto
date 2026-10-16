import { ArrowUp, ArrowUpRight, BookOpen, Boxes, Contact as ContactIcon, GitBranch } from 'lucide-react';
import { FadeContent, GradientText, LogoLoop, Magnet, StarBorder, VariableProximity } from './reactbits';
import { profile } from '../data/profile';
import { Reveal } from './Reveal';
import { Cascade } from './Cascade';
import { useHoverPreview } from '../hooks/useProjectPreview';
import { ScrambleText } from './ScrambleText';
import { MaskLines } from './MaskLines';
import { CopyButton } from './CopyButton';
import { scrollToSection } from '../hooks/useSmoothScroll';
import { useReducedMotion } from '../hooks/useReducedMotion';

const CHANNELS = [
  {
    key: 'github',
    label: 'GitHub',
    handle: 'Hkd225',
    href: profile.links.github,
    Icon: GitBranch,
    note: 'Source for every project on this site.',
  },
  {
    key: 'huggingface',
    label: 'Hugging Face',
    handle: 'Hakid',
    href: profile.links.huggingface,
    Icon: Boxes,
    note: `${profile.meta.hfModels} public LoRA / QLoRA models.`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    /**
     * Display handle only. LinkedIn slugs are immutable in practice, so the
     * real profile is still reached through profile.links.linkedin below —
     * do not "fix" these two strings to match each other.
     */
    handle: 'muhammad-hakid-hakim-aditya',
    href: profile.links.linkedin,
    Icon: ContactIcon,
    note: 'Professional profile.',
  },
] as const;

/**
 * React Bits: LogoLoop — the same channels as the list above, drifting.
 * Nodes are lucide icons, so no extra icon package is pulled in, and the
 * hoverColor stays within the site's single acid accent.
 */
const LINK_LOOP = [
  ...CHANNELS.map((c) => ({
    node: <c.Icon size={20} aria-hidden="true" />,
    title: c.label,
    href: c.href,
    hoverColor: '#c8ff4d',
  })),
  { node: <BookOpen size={20} aria-hidden="true" />, title: 'Medium', href: profile.links.medium, hoverColor: '#c8ff4d' },
];

/** Rendered programmatically rather than hard-coded, per the brief. */
const YEAR = new Date().getFullYear();

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 rounded-sm border border-line px-1.5 py-0.5 font-mono text-[0.6rem] text-muted">
      {children}
    </kbd>
  );
}

function ChannelRow({ channel }: { channel: (typeof CHANNELS)[number] }) {
  const c = channel;
  const preview = useHoverPreview({
    id: `channel-${c.key}`,
    title: c.label,
    eyebrow: 'Direct',
    meta: c.handle,
    icon: c.Icon,
  });

  return (
    <a
      href={c.href}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor-label="Open"
      className="group flex items-center justify-between gap-6 bg-ink px-6 py-7 transition-colors duration-500 hover:bg-surface"
      {...preview}
    >
      <span className="flex items-center gap-5">
        {/* The icon rotates a quarter turn on hover — a small mechanical detail,
            the kind that makes a list feel built rather than typeset. */}
        <c.Icon
          size={18}
          className="shrink-0 text-acid transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-90"
          aria-hidden="true"
        />
        <span className="flex flex-col gap-1.5">
          <span
            data-cascade
            className="font-display text-h3 tracking-[-0.03em] transition-colors duration-500 group-hover:text-acid"
          >
            {c.label}
          </span>
          <span
            data-cascade
            className="font-mono text-[0.66rem] tracking-[0.08em] break-all text-muted"
          >
            {c.handle}
          </span>
        </span>
      </span>

      <span className="flex shrink-0 items-center gap-4">
        <span
          data-cascade
          className="hidden max-w-[22ch] text-right text-sm leading-snug text-dim sm:block"
        >
          {c.note}
        </span>
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="text-dim transition-all duration-500 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-acid"
        />
      </span>
    </a>
  );
}

export function Contact() {
  const reduced = useReducedMotion();

  return (
    <>
      <section
        id="contact"
        className="relative z-10 border-t border-line py-section"
        aria-labelledby="contact-title"
      >
        <div className="container-x">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
            {/* ── Pitch ── */}
            <div>
              <div aria-hidden="true" className="section-numeral select-none">
                08
              </div>

              <p className="mono-label mb-6"><ScrambleText text="008 / Contact" /></p>

              <MaskLines as="h2" id="contact-title" className="max-w-[13ch] text-h1" step={0.11}>
                Have a hard{' '}
                <GradientText colors={['#c8ff4d', '#eaffc8', '#86a52e']} animationSpeed={7} className="italic">
                  problem?
                </GradientText>
              </MaskLines>

              <p className="mt-7 max-w-[46ch] text-lead font-light leading-relaxed text-muted">
                Interested in AI systems, agentic architecture, or building something worth
                exploring? The repositories are the fastest way to judge whether the work fits
                — read first, then get in touch.
              </p>
            </div>

            {/* ── Channels ──
                No contact form: there is no verified submission endpoint yet, so
                nothing on this page is a dead button. */}
            <div className="lg:pt-28">
              <Cascade step={0.11} className="flex flex-col gap-px border border-line">
                {CHANNELS.map((c) => (
                  <ChannelRow key={c.key} channel={c} />
                ))}
              </Cascade>

              {/* ── Direct email ──
                  No contact form on purpose: there is no submission endpoint,
                  and a form that silently drops messages is worse than none.
                  The address is given plainly, with a copy control, because
                  the fastest real path to a reply starts with an address
                  someone can actually take. */}
              {profile.links.email && (
                <Reveal mode="up" className="mt-10">
                  <div className="overflow-hidden border border-line bg-ink/50 p-6 md:p-8">
                    {/* `overflow-hidden` contains StarBorder's 48px canvas bleed so the
                        pill's orbit never pushes the page horizontally on phones; the
                        star head still rides the pill's own edge, not the plate's. */}
                    <p className="mono-label">Direct</p>
                    {/* Stack on narrow screens: a 35-character address at display
                        size has no chance of fitting on one line at 390px, and a
                        nowrap "truncate" here pushed the whole page wider than
                        the viewport — which is enough to push the mobile menu
                        button off screen. */}
                    <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      {/* React Bits: StarBorder — the one true call to action gets
                          the one living edge. An acid star orbits the address at
                          rest (5 s a lap), does a quick lap on approach, and pulses
                          from the click point. The vendor loop parks itself when the
                          element leaves the viewport and under prefers-reduced-motion. */}
                      <StarBorder
                        as="a"
                        href={`mailto:${profile.links.email}`}
                        data-cursor-label="Write"
                        className="group min-w-0 max-w-full self-start font-display text-lg tracking-[-0.01em] sm:text-xl"
                        color="#c8ff4d"
                        trailColor="#9dc73a"
                        backgroundColor="#111310"
                        textColor="#c8ff4d"
                        borderColor="rgba(240, 240, 232, 0.14)"
                        duration={5}
                        glow={0.45}
                        radius={999}
                        thickness={1}
                        hover="lap"
                      >
                        {/* `wrap-anywhere` rather than `wrap` / `break-word`: the address is one long
                        token inside a flex item, and only `overflow-wrap: anywhere`
                        is allowed to shrink that item's min-content width. The
                        plain variants leave the flex item at its intrinsic width,
                        which pushed the whole page wider than a 390px screen. */}
                        <span className="wrap-anywhere">{profile.links.email}</span>
                        <ArrowUpRight
                          size={18}
                          aria-hidden="true"
                          className="shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        />
                      </StarBorder>
                      <CopyButton
                        value={profile.links.email}
                        label="Copy address"
                        className="shrink-0 self-start sm:self-auto"
                      />
                    </div>
                    <p className="mt-5 max-w-[46ch] text-sm leading-relaxed text-dim">
                      No form, no tracking, no newsletter. If a repository answers the question
                      faster, start there — but a mail to this address reaches the same person.
                    </p>
                  </div>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-line">
        {/* React Bits: FadeContent (effect: mist) — the footer resolves out of
            fine grain the first time it scrolls into view. One reveal for the
            block as a unit: the content sections own their per-line motion,
            and repeating that voice down here would read as noise. */}
        <FadeContent effect="mist" duration={1.4} threshold={0.02}>
        <div className="container-x py-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-display text-2xl tracking-[-0.04em]">
                {profile.navMark}
                <span className="ml-3 font-mono text-[0.65rem] tracking-[0.2em] text-muted">
                  {profile.altMark}
                </span>
              </p>
              <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-muted">
                Systems that reason, remember, and know when they might be wrong.
              </p>
              <nav aria-label="Footer" className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {CHANNELS.map((c) => (
                  <a
                    key={c.key}
                    href={c.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mono-label link-underline-center transition-colors hover:text-acid"
                  >
                    {c.label}
                  </a>
                ))}
              </nav>

              {/* Keyboard legend. Shown rather than hidden because an
                  undiscoverable shortcut is the same as no shortcut. */}
              <div className="mt-8 border-t border-line-soft pt-5">
                <p className="mono-label text-dim">Keyboard</p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
                  <li className="mono-label text-dim">
                    <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> command palette
                  </li>
                  <li className="mono-label text-dim">
                    <Kbd>/</Kbd> search projects
                  </li>
                  <li className="mono-label text-dim">
                    <Kbd>g</Kbd> then <Kbd>w</Kbd> jump to work
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-end justify-between gap-8 lg:flex-col lg:items-end">
              <Magnet padding={30} magnetStrength={1.4} disabled={reduced} wrapperClassName="inline-block">
                <button
                  type="button"
                  onClick={() => scrollToSection('#index', 0)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-line transition-colors duration-300 hover:border-acid hover:text-acid"
                >
                  <span className="sr-only">Back to top</span>
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
              </Magnet>

              <div className="text-right">
                <p className="mono-label">© {YEAR} {profile.name}</p>
                <p className="mono-label mt-2 text-dim">
                  React · TypeScript · GSAP · React Bits
                </p>
              </div>
            </div>
          </div>

          {/* wordmark — React Bits: VariableProximity. At rest it is the ghost
              bone it always was (14% alpha, the old gradient's top stop); as the
              cursor approaches, each letter presses to full weight and tints
              acid through color-mix. Only the wght axis is driven because that
              is what our Space Grotesk variable font carries, so the vendor's
              default font is overridden inline — same typeface as the rest of
              the site. The loop parks whenever the pointer settles. */}
          <div aria-hidden="true" className="mt-14 select-none text-center">
            <VariableProximity
              label="HAKID"
              fromFontVariationSettings="'wght' 300"
              toFontVariationSettings="'wght' 700"
              radius={340}
              falloff="gaussian"
              smoothing={0.28}
              fromColor="rgba(240, 240, 232, 0.14)"
              toColor="#c8ff4d"
              lift={0.045}
              idleWave={false}
              className="font-display text-[clamp(3.5rem,19vw,18rem)] leading-[0.78] tracking-[-0.055em]"
              style={{ fontFamily: "'Space Grotesk', ui-sans-serif, system-ui, sans-serif" }}
            />
          </div>
        </div>

        {/* React Bits: LogoLoop — the channels as a drifting, draggable strip.
            Drag it and it glides with the fling; hover a mark and it steps to
            full color. The joined-edge fade keeps the loop melting into the
            border above and the page below. */}
        <div className="border-t border-line-soft py-4 text-bone">
          <LogoLoop
            logos={LINK_LOOP}
            speed={55}
            gap={56}
            logoHeight={20}
            muted={0.35}
            labels="hover"
            scaleOnHover
            fadeOutWidth={0.18}
            ariaLabel="Profiles on other networks"
          />
        </div>
        </FadeContent>
      </footer>
    </>
  );
}