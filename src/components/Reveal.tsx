import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

type RevealMode = 'up' | 'fade' | 'clip' | 'left' | 'scale';

interface RevealProps {
  children: ReactNode;
  mode?: RevealMode;
  delay?: number;
  /** ScrollTrigger start position. */
  start?: string;
  className?: string;
  style?: CSSProperties;
  /** Accessible name when the wrapper is otherwise meaningless. */
  as?: 'div' | 'section' | 'article' | 'li' | 'figure';
}

/**
 * Scroll-triggered entrance.
 *
 * Lifecycle-safe: `useGSAP` builds a `gsap.context()` per instance and reverts
 * every tween *and* ScrollTrigger on unmount, so Strict Mode's double-mount
 * cannot stack duplicate triggers.
 *
 * The element's initial hidden state lives in CSS (`reveal-*` utilities) so the
 * page is never blank if GSAP fails to initialise — `useGSAP` also clears it
 * when reduced motion is on.
 */
export function Reveal({
  children,
  mode = 'up',
  delay = 0,
  start = 'top 88%',
  className,
  style,
  as: Tag = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced) {
        gsap.set(el, { clearProps: 'all' });
        el.classList.remove('reveal-up', 'reveal-fade', 'reveal-clip');
        return;
      }

      const vars: gsap.TweenVars =
        mode === 'clip'
          ? { clipPath: 'inset(0% 0% 0% 0%)' }
          : {
              opacity: 1,
              x: mode === 'left' ? 0 : 0,
              y: 0,
              scale: 1,
            };

      const from: gsap.TweenVars =
        mode === 'clip'
          ? { clipPath: 'inset(0% 0% 100% 0%)' }
          : {
              opacity: 0,
              x: mode === 'left' ? -28 : 0,
              y: mode === 'up' ? 26 : 0,
              scale: mode === 'scale' ? 0.96 : 1,
            };

      gsap.fromTo(el, from, {
        ...vars,
        duration: mode === 'clip' ? 1.15 : 0.95,
        delay,
        ease: mode === 'clip' ? EASE.inOutQuart : EASE.out,
        scrollTrigger: { trigger: el, start, once: true },
        /*
          Clear the inline transform when the tween ends.

          Not cosmetic: a lingering `transform` on an element makes it a
          containing block for `position: fixed` descendants, so anything
          ScrollTrigger pins inside a Reveal gets positioned against the Reveal
          box instead of the viewport and drifts off screen.
        */
        clearProps: mode === 'clip' ? 'clipPath' : 'transform,opacity',
        onComplete: () => {
          el.classList.remove('reveal-up', 'reveal-fade', 'reveal-clip');
        },
      });
    },
    { dependencies: [reduced, mode, delay, start], scope: ref }
  );

  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}

interface RevealGroupProps {
  children: ReactNode;
  step?: number;
  start?: string;
  className?: string;
}

/** Staggers direct children into view. Uses transform + opacity only. */
export function RevealGroup({ children, step = 0.08, start = 'top 86%', className }: RevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const kids = Array.from(el.children);
      if (!kids.length) return;

      if (reduced) {
        gsap.set(kids, { clearProps: 'all' });
        return;
      }

      gsap.fromTo(
        kids,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          stagger: step,
          ease: EASE.out,
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    },
    { dependencies: [reduced, step, start], scope: ref }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** Horizontal rule that draws itself in on scroll. */
export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        gsap.set(el, { scaleX: 1 });
        return;
      }
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.3,
          ease: EASE.inOutQuart,
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        }
      );
    },
    { dependencies: [reduced], scope: ref }
  );

  return <div ref={ref} className={`h-px origin-left bg-line ${className ?? ''}`} aria-hidden="true" />;
}