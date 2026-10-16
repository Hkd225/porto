import { useEffect, useRef } from 'react';

import { isCoarsePointer, prefersReducedMotion } from '../lib/gsap';

/**
 * The hero's background field: a dot grid that lights up around the pointer.
 *
 * This replaces a WebGL dot grid, and the reason is worth recording.
 *
 * The WebGL version was never *broken* — `readPixels` showed the right pixels
 * in the right place — but it was only ever verifiable through the GL API, and
 * the field still went missing for real visitors. Three things had to be true
 * at once for it to appear: a WebGL2 context, a compositor willing to keep a
 * layer alive for a canvas that had stopped being drawn to, and a browser that
 * actually composites it. Any one of those failing leaves the hero flat black,
 * with no error and nothing to debug from.
 *
 * The field is the hero's only texture. It has to be something that is either
 * there or not there — not something that can quietly fail. So it is CSS: two
 * gradients and a transform, which any browser will render, at a fraction of
 * the cost of a live WebGL loop that has to idle anyway.
 *
 * Pointer tracking writes two custom properties straight to the element. No
 * React state — this updates on every mouse move and re-rendering the hero to
 * move a glow would be absurd.
 */
export function HeroField() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    // Touch devices have no hover, and reduced motion means the field should
    // hold still. Either way there is nothing to track.
    if (prefersReducedMotion() || isCoarsePointer()) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    let dirty = false;

    const flush = () => {
      frame = 0;
      if (!dirty) return;
      dirty = false;
      root.style.setProperty('--field-x', `${x}px`);
      root.style.setProperty('--field-y', `${y}px`);
      root.style.setProperty('--field-alpha', '1');
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      dirty = true;
      if (!frame) frame = requestAnimationFrame(flush);
    };

    const onLeave = () => {
      dirty = true;
      x = 0;
      y = 0;
      root.style.setProperty('--field-alpha', '0');
      frame = 0;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={rootRef} data-hero-field className="absolute inset-0 z-0" aria-hidden="true">
      <div className="hero-field__dots" />
      <div className="hero-field__glow" />
      <div className="hero-field__drift" />
    </div>
  );
}