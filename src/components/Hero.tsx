import { GradientText, LightPillar, RotatingText, SplitText } from './reactbits';
import { profile } from '../data/profile';

/**
 * Hero — one background layer (the monochrome light pillar), one statement,
 * one cue.
 *
 * The pillar is recoloured into the site's own tones ("ubah warna saja"):
 * a dense bone core fading into graphite, slow rotation, edges melting into
 * the page. The statement rides over it protected by an ink scrim, revealed
 * via SplitText in a monochrome GradientText.
 */
export function Hero({ statementArmed = true }: { statementArmed?: boolean }) {
  return (
    <section id="index" className="relative flex min-h-svh flex-col overflow-hidden bg-ink">
      {/* Backdrop: the light pillar alone, then legibility overlays. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {/* A leaner pillar, nudged 11% right so it rides the open half of
            the page clear of the statement column. */}
        <div className="absolute inset-0 translate-x-[11%]">
          <LightPillar
            topColor="#f2f2ef"
            bottomColor="#4a4a50"
            intensity={1}
            glowAmount={0.0017}
            bloom={0.45}
            pillarWidth={2.3}
            pillarHeight={0.4}
            pillarRotation={20}
            twist={0.4}
            detail={4}
            rotationSpeed={0.25}
            flow={1}
            noiseIntensity={0.5}
            fade={0.55}
            interactive
            clickPulse
            intro
            quality="high"
            mixBlendMode="screen"
          />
        </div>
        {/* Ink scrim over the statement column — keeps the type legible
            where the pillar's halo crosses it; edges stay open. */}
        <div className="absolute inset-0 bg-[linear-gradient(78deg,rgba(10,10,10,0.66)_0%,rgba(10,10,10,0.4)_38%,transparent_66%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(88%_70%_at_50%_42%,transparent_30%,rgba(10,10,10,0.72)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="wrap relative z-10 flex flex-1 flex-col justify-center pb-36 pt-32">
        <p className="overline">{profile.name} — Portfolio</p>

        <div className="mt-10">
          <GradientText
            colors={['#f8f8f5', '#d6d6d0', '#f8f8f5']}
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
              armed={statementArmed}
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
