import { useRef, type ElementType, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, SplitText, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface MaskLinesProps {
  children: ReactNode;
  /** Heading levels get a longer, slower reveal than body copy. */
  as?: ElementType;
  id?: string;
  className?: string;
  delay?: number;
  /** Stagger between lines, in seconds. */
  step?: number;
}

/**
 * Paragraph or heading that reveals line by line out of a mask.
 *
 * Uses SplitText's own `mask` option rather than hand-rolled wrappers: the
 * browser lays the lines out, so the masks match the real line boxes at every
 * breakpoint instead of assuming a fixed measure.
 *
 * The split is reverted on unmount, which puts the original markup back — the
 * text is readable with JavaScript disabled and with reduced motion on.
 */
export function MaskLines({
  children,
  as: Tag = 'p',
  id,
  className,
  delay = 0,
  step = 0.09,
}: MaskLinesProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (reduced) {
        SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true }).revert();
        return;
      }

      const split = SplitText.create(el, { type: 'lines', mask: 'lines', autoSplit: true });
      if (!split.lines.length) return;

      gsap.from(split.lines, {
        yPercent: 108,
        duration: 1,
        delay,
        stagger: step,
        ease: EASE.outExpo,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    },
    { scope: ref, dependencies: [reduced, delay, step] }
  );

  return (
    <Tag ref={ref as never} id={id} className={className}>
      {children}
    </Tag>
  );
}