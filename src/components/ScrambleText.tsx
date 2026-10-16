import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * Glyph set used while a string is decoding. Deliberately mixed case and
 * symbols so the intermediate frames read as noise rather than as text.
 */
const GLYPHS = '▚▞█▓▒░01<>/\\[]{}=+*#$%&@ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/** Characters that are never scrambled — scrambling whitespace breaks layout. */
const KEEP = /\s/;

interface ScrambleTextProps {
  text: string;
  className?: string;
  /** Seconds the decode takes once the element scrolls into view. */
  duration?: number;
  delay?: number;
}

/**
 * Text that resolves out of noise the first time it scrolls into view.
 *
 * Applied only to the small mono labels — the effect reads as instrumentation
 * there and would be unbearable on a headline. Each character gets its own
 * window inside the overall progress, so the string resolves left to right
 * instead of the whole line flickering at once.
 */
export function ScrambleText({ text, className, duration = 0.9, delay = 0 }: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      el.textContent = text;
      if (reduced) return;

      const chars = Array.from(text);
      const state = { p: 0 };

      const tween = gsap.to(state, {
        p: 1,
        duration,
        delay,
        // Linear: the per-character windows below do the shaping, and easing
        // the master clock on top of them makes the tail resolve unevenly.
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          let out = '';
          for (let i = 0; i < chars.length; i++) {
            const c = chars[i];
            if (KEEP.test(c)) {
              out += c;
              continue;
            }
            // 60% of the timeline is spent staggering the hand-off between
            // characters, 40% on each character's own window.
            const start = (i / Math.max(chars.length - 1, 1)) * 0.6;
            const end = start + 0.4;
            out += state.p >= end ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
          el.textContent = out;
        },
        // Guarantee the exact original, so the last frame is never one glyph
        // of noise away from the real text.
        onComplete: () => {
          el.textContent = text;
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        el.textContent = text;
      };
    },
    { dependencies: [reduced, text, duration, delay] }
  );

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}