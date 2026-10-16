import { useRef, type ElementType, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface CascadeProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds between successive [data-cascade] elements. */
  step?: number;
  /** Distance each element travels, in pixels. */
  distance?: number;
}

/**
 * Staggered reveal for a group of cards or rows.
 *
 * The difference from a plain stagger is what happens *inside* each item: a
 * card arriving as one opaque block reads as a list loading, whereas its meta
 * line, title and body arriving in sequence reads as the card assembling
 * itself. Mark the inner pieces with `data-cascade` and they inherit an
 * order-based delay, so the second card's title does not animate before the
 * first card's title.
 *
 * Marking is per-group, not global, so two cards side by side cascade
 * together instead of interleaving.
 */
export function Cascade({
  children,
  as: Tag = 'div',
  className,
  step = 0.09,
  distance = 26,
}: CascadeProps) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      const groups = Array.from(root.children) as HTMLElement[];
      if (!groups.length) return;

      if (reduced) {
        gsap.set(root.querySelectorAll('[data-cascade]'), { clearProps: 'all' });
        return;
      }

      // Every cascade-able piece on the page, ordered by its own group index
      // first and its position within that group second.
      const pieces: { el: Element; delay: number }[] = [];
      groups.forEach((group, gi) => {
        const inner = Array.from(group.querySelectorAll('[data-cascade]'));
        inner.forEach((el, ii) => {
          pieces.push({ el, delay: gi * step + ii * step * 0.55 });
        });
      });

      if (!pieces.length) return;

      gsap.fromTo(
        pieces.map((p) => p.el),
        { opacity: 0, y: distance, scale: 0.985 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: EASE.outExpo,
          stagger: (i) => pieces[i].delay,
          scrollTrigger: { trigger: root, start: 'top 84%', once: true },
        },
      );
    },
    { scope: ref, dependencies: [reduced, step, distance] }
  );

  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}