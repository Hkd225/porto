import { Particles, RotatingText, SplitText } from './reactbits';
import { profile } from '../data/profile';

/**
 * Hero — one background layer (sparse particles), one statement, one cue.
 *
 * LPAS's opening move is a statement, not a self-portrait: the site opens with
 * what it believes, then invites the scroll. Same grammar here — the statement
 * is in profile.statement and the name lives quietly in the overline.
 */
export function Hero() {
  return (
    <section id="index" className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Backdrop: one animated layer only — everything else stays quiet. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <Particles
          className="h-full w-full"
          particleCount={140}
          particleSpread={9}
          speed={0.08}
          particleColors={['#f2f2ef']}
          alphaParticles
          particleBaseSize={80}
          sizeRandomness={1}
          glow={0.16}
          twinkle={0.55}
          hoverEffect="parallax"
          particleHoverFactor={0.45}
          clickBurst={false}
          disableRotation
          opacity={0.5}
        />
        <div className="absolute inset-0 bg-[radial-gradient(85%_65%_at_50%_40%,transparent_35%,rgba(10,10,10,0.85)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink" />
      </div>

      <div className="wrap relative z-10 flex flex-1 flex-col justify-center pb-44 pt-36">
        <p className="overline">{profile.name} — Portfolio</p>

        <div className="mt-10 max-w-[19ch]">
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
            className="font-display text-display font-normal leading-[0.99] tracking-[-0.015em]"
          />
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
