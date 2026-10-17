import { GradientText, RotatingText, Silk, SplitText } from './reactbits';
import { profile } from '../data/profile';

/**
 * Hero — one background layer (monochrome silk), one statement, one cue.
 *
 * The silk shader is recoloured into the site's own tones ("ubah warna saja"):
 * graphite folds on ink, bone-white sheen, calm speed, edges melting into the
 * page. The statement rides over it in a slow monochrome gradient via
 * GradientText wrapping the masked SplitText reveal.
 */
export function Hero() {
  return (
    <section id="index" className="relative flex min-h-svh flex-col overflow-hidden bg-ink">
      {/* Backdrop: silk, then legibility overlays. Nothing else. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Silk
          color="#4a4a50"
          sheenColor="#f2f2ef"
          speed={3.2}
          scale={1.25}
          rotation={-0.35}
          sheen={0.55}
          depth={0.66}
          glow={0.25}
          noiseIntensity={1.1}
          wave={1}
          ripple={1}
          fade={0.45}
          mouseInteraction
          interactionStrength={0.8}
          clickRipple={false}
          intro
        />
        <div className="absolute inset-0 bg-[radial-gradient(88%_70%_at_50%_42%,transparent_30%,rgba(10,10,10,0.72)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="wrap relative z-10 flex flex-1 flex-col justify-center pb-36 pt-32">
        <p className="overline">{profile.name} — Portfolio</p>

        <div className="mt-10">
          <GradientText
            colors={['#f6f6f3', '#a3a39d', '#f6f6f3']}
            variant="flow"
            animationSpeed={13}
            scale={3}
            yoyo
            glow={0}
          >
            <SplitText
              text={profile.statement}
              tag="h1"
              splitType="lines"
              mask
              trigger="load"
              delay={160}
              duration={1.5}
              ease="expo.out"
              textAlign="left"
              from={{ yPercent: 116, opacity: 0 }}
              to={{ yPercent: 0, opacity: 1 }}
              className="font-display max-w-[16ch] text-display font-normal leading-[0.99] tracking-[-0.015em]"
            />
          </GradientText>
        </div>

        <div className="mt-12 flex flex-wrap items-baseline gap-x-4 gap-y-3">
          <span className="num">01</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">Currently</span>
          <RotatingText
            texts={profile.roles}
            effect="blur"
            rotationInterval={3000}
            mainClassName="font-sans font-light leading-none text-[clamp(1.15rem,1.8vw,1.5rem)] text-bone"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-x-10 gap-y-3 font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
          <span>GitHub — {profile.meta.publicRepos} public repos</span>
          <span>Hugging Face — {profile.meta.hfModels} models</span>
          <span>Sharing since {profile.meta.githubSince}</span>
        </div>
      </div>

      {/* Scroll cue — a line that drops, holds, exits. */}
      <div className="absolute bottom-8 left-0 z-10 w-full">
        <div className="wrap flex items-center gap-6">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">Scroll to explore</span>
          <span className="h-14 w-px overflow-hidden bg-line-soft" aria-hidden="true">
            <span className="cue-line block h-full w-px bg-bone/60" />
          </span>
        </div>
      </div>
    </section>
  );
}
