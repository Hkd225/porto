/**
 * Boot.tsx — the site's entry veil, awwwards-style.
 *
 * A Void-curtain that counts in: the serif mark holds the center, a
 * giant mono counter climbs 00→99 at the bottom right, a hairline of
 * sage crawls across, and one honest line of boot copy sits bottom
 * left. When fonts are ready (and the minimum beat has played) the
 * content fades, then the curtain wipes up via clip-path — revealing
 * the page while the hero statement is armed to rise inside the lift.
 *
 * Honesty baked in: click (or press Enter/space) to skip the ceremony;
 * prefers-reduced-motion reduces the whole ballet to one fade.
 *
 * Contract: onArm() fires the moment the curtain starts moving (hero
 * intro joins the lift); onDone() once fully gone (scroll unlocks, the
 * veil unmounts, App drops the component).
 */

import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/gsap';

const COUNT_MS = 1250; /* 00 → 99 */
const BOOT_MIN = 1500; /* the counter's own show, minimum beat */
const HOLD_100 = 260; /* a breath on "100" before the curtain moves */

const STATUS = [
  'reading the syllabus',
  'self-hosted fonts',
  'warming the pillar',
  'keeping the data honest',
] as const;

/* audit counter across StrictMode/dev double-mounts */
let runCounter = 0;

export function Boot({ onArm, onDone }: { onArm: () => void; onDone: () => void }) {
  const [status, setStatus] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const skipRef = useRef(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const root = rootRef.current;
    const stage = stageRef.current;
    /* audit log — the boot sequence should be explicable from the console */
    const runId = ++runCounter;
    const log = (m: string) => console.info(`[boot] run#${runId} ${m}`);
    log(`start reduced=${reduced}`);
    if (!root) return;

    document.documentElement.style.overflow = 'hidden';
    /* lenis is created in the parent effect (children commit first), so
       poll briefly until the smooth scroller exists, then put it asleep */
    let lenisTimer: number | undefined;
    const trySleep = () => {
      const l = (window as Window & { __lenis?: { stop(): void } }).__lenis;
      if (l) {
        l.stop();
        window.clearInterval(lenisTimer);
      }
    };
    lenisTimer = window.setInterval(trySleep, 100);
    trySleep();

    const statusId = window.setInterval(() => setStatus((s) => (s + 1) % STATUS.length), 480);

    const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
    const t0 = performance.now();
    let raf = 0;
    let left = false;
    let killed = false; /* this run's own stop — the previous run's skip never leaks in */

    const leave = () => {
      if (left) return;
      left = true;
      log('leave -> curtain lifts');
      window.cancelAnimationFrame(raf);
      window.clearInterval(statusId);

      const num = numRef.current;
      if (num) num.textContent = '100';

      const finish = () => {
        log('done -> veil unmounts, scroll freed');
        document.documentElement.style.overflow = '';
        (window as Window & { __lenis?: { start(): void } }).__lenis?.start();
        window.clearInterval(lenisTimer);
        onDone();
      };

      const wipe = gsap.timeline({
        onComplete: finish,
      });

      if (reduced) {
        wipe.to(root, { opacity: 0, duration: 0.25, ease: 'power2.out' }, 0).call(() => onArm(), undefined, 0);
        return;
      }

      wipe
        .call(() => onArm(), undefined, 0) /* hero joins the lift */
        .to(stage, { yPercent: -12, opacity: 0, duration: 0.5, ease: 'power2.in' }, 0)
        .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.95, ease: 'expo.inOut' }, 0.4);
    };

    const frame = () => {
      if (killed || left) return;
      /* fresh wall clock — the rAF timestamp arg leaped under this
         headless build's compositor backpressure (el=4319 for <1s of
         real time), so we time the beat ourselves */
      const el = performance.now() - t0;
      let p = easeInOut(Math.min(1, el / COUNT_MS));
      if (skipRef.current) p = 1;
      if (numRef.current) numRef.current.textContent = String(Math.min(99, Math.floor(p * 100))).padStart(2, '0');
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (p >= 1 && (el >= BOOT_MIN || skipRef.current)) {
        log(`count done el=${el | 0} skip=${skipRef.current} -> leave in ${skipRef.current ? 0 : HOLD_100}ms`);
        window.setTimeout(leave, skipRef.current ? 0 : HOLD_100);
        return;
      }
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);

    const skip = () => {
      skipRef.current = true;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      killed = true; /* the NEXT run starts clean — never inherit a skip */
      log('cleanup (unmount or gate re-run)');
      window.cancelAnimationFrame(raf);
      window.clearInterval(statusId);
      window.clearInterval(lenisTimer);
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
      gsap.killTweensOf([root, stage]);
    };
  }, [onArm, onDone]);

  return (
    <div
      ref={rootRef}
      onClick={() => {
        skipRef.current = true;
      }}
      className="fixed inset-0 z-[96] flex cursor-pointer flex-col bg-ink"
      style={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      aria-hidden={false}
      role="presentation"
    >
      {/* frame corners of the veil's own chrome */}
      <div ref={stageRef} className="relative flex flex-1 flex-col">
        <p className="kicker absolute left-5 top-5 sm:left-7 sm:top-6">Portfolio — v2.0</p>
        <p className="num absolute right-5 top-5 sm:right-7 sm:top-6">2026</p>

        {/* the mark */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] text-center">
          <p className="font-display text-[clamp(3rem,9vw,6.5rem)] italic leading-none tracking-[-0.02em] text-bone">
            Hakid.
          </p>
          <span className="mx-auto mt-5 block h-px w-40 overflow-hidden bg-line">
            <span ref={barRef} className="block h-px w-full origin-left scale-x-0 bg-accent" />
          </span>
        </div>

        {/* honest boot copy */}
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim absolute bottom-7 left-5 sm:bottom-8 sm:left-7">
          {STATUS[status]}
          <span className="text-accent"> ·</span>
        </p>

        {/* giant counter */}
        <p className="font-mono text-[clamp(3.4rem,11vw,7.5rem)] leading-none tracking-tight text-bone absolute bottom-4 right-5 sm:bottom-6 sm:right-7 tabular-nums">
          <span ref={numRef}>00</span>
          <span className="text-[0.35em] text-dim">%</span>
        </p>

        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-dim/70 absolute bottom-7 left-1/2 hidden -translate-x-1/2 sm:block">
          click to enter
        </p>
      </div>
    </div>
  );
}
