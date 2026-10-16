import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface CountUpProps {
  /** Target value. May be fractional; the default render rounds. */
  value: number;
  /** Decimal places in the final render. */
  decimals?: number;
  /** Fixed prefix, e.g. a currency symbol. */
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Counts from zero to `value` when the element first scrolls into view.
 *
 * With reduced motion the final value is rendered immediately and no tween is
 * created at all — a number that rolls up is decoration, and decoration is
 * exactly what the preference is asking us to drop.
 *
 * The accessible value lives in `aria-label`; the digits themselves are marked
 * `aria-hidden` so a screen reader does not read a mid-animation value.
 */
export function CountUp({ value, decimals = 0, prefix = '', suffix = '', className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const format = (n: number) =>
    `${prefix}${n.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (reduced) {
        el.textContent = format(value);
        return;
      }

      const state = { n: 0 };
      gsap.to(state, {
        n: value,
        duration: 1.6,
        ease: EASE.outExpo,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          el.textContent = format(state.n);
        },
        // Guarantee the exact final string, so rounding never leaves the
        // element showing 36.9999 of 37.
        onComplete: () => {
          el.textContent = format(value);
        },
      });
    },
    { dependencies: [reduced, value, prefix, suffix, decimals] }
  );

  return (
    <span ref={ref} className={className} aria-label={format(value)}>
      <span aria-hidden="true">{format(reduced ? value : 0)}</span>
    </span>
  );
}