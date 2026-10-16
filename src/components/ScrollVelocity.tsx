import { useEffect, type RefObject } from 'react';
import { gsap } from '../lib/gsap';
import { scrollState } from '../lib/scrollState';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { isCoarsePointer } from '../lib/gsap';

interface ScrollVelocityProps {
  /** The element that reacts — normally the whole <main>. */
  targetRef: RefObject<HTMLElement | null>;
}

/** Speed in px/ms at which the effect is fully saturated. */
const MAX_SPEED = 2.2;
/**
 * Transform only — no blur.
 *
 * `filter: blur()` on <main> rasterises the entire page every frame. Measured
 * at ~15fps (p95 frame time 66ms) on a fast scroll, versus a smooth frame
 * budget with transform alone. A skew plus a small pull-back reads as speed
 * just as clearly and costs nothing, because transforms stay on the compositor.
 */
const MAX_SKEW = 2.6;
/**
 * The page *shrinks* slightly on a fast scroll rather than growing.
 *
 * A scale above 1 widens <main> past the viewport, which shows up as real
 * horizontal overflow — the audit catches it, and so would a user dragging the
 * page sideways. Pulling back is also the better read: the content recedes as
 * it moves fast.
 */
const MAX_PULLBACK = 0.016;

/** How long the effect takes to wind back down once scrolling stops. */
const SETTLE = 0.62;

/**
 * The page reacts to how fast you are moving through it.
 *
 * Blur, skew and a hair of scale are driven by scroll velocity, so the site
 * behaves like an object with mass rather than a document sliding past. This
 * is the last piece of the "not a video" work: a video plays at its own pace,
 * this responds to yours.
 *
 * Deliberately off on touch — a flick gesture is fast by definition, so every
 * swipe would smear the page — and under reduced motion.
 */
export function ScrollVelocity({ targetRef }: ScrollVelocityProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = targetRef.current;
    if (!el || reduced || isCoarsePointer()) return;

    let lastY = window.scrollY;
    let lastT = performance.now();
    let velocity = 0;
    let engaged = false;
    /** Only unwind once something has actually been applied. */
    let dirty = false;

    const state = { skew: 0, scale: 1 };

    /**
     * Writes the current state to the DOM.
     *
     * Every tween below runs `onUpdate: paint` rather than relying on the
     * scroll handler to repaint — a quickTo only mutates the proxy on its own
     * frames, so painting once per scroll event would render the *previous*
     * value and the whole effect would read as no effect at all.
     */
    const paint = () => {

      const transform =
        Math.abs(state.skew) > 0.01 || Math.abs(state.scale - 1) > 0.001
          ? `skewY(${state.skew.toFixed(3)}deg) scale(${state.scale.toFixed(4)})`
          : '';

      el.style.transform = transform;

      // `will-change` keeps a compositing layer alive for the whole session
      // otherwise, which on a page this long is a permanent memory cost. It
      // also creates the same containing block as a transform, so it has to be
      // torn down in exactly the same circumstances.
      if (!engaged && transform) {
        engaged = true;
        el.style.willChange = 'transform';
      } else if (engaged && !transform) {
        engaged = false;
        el.style.willChange = '';
      }
    };

    const skewTo = gsap.quickTo(state, 'skew', {
      duration: SETTLE * 0.8,
      ease: 'power3.out',
      onUpdate: paint,
    });
    const scaleTo = gsap.quickTo(state, 'scale', {
      duration: SETTLE,
      ease: 'power3.out',
      onUpdate: paint,
    });

    const onScroll = () => {
      // Everything else on the page asks whether we are moving through this.
      scrollState.touch();

      const now = performance.now();
      const y = window.scrollY;
      const dt = now - lastT;
      // Ignore the first sample and any gap long enough to make the rate
      // meaningless — a backgrounded tab produces enormous fake velocities.
      if (dt > 0 && dt < 120) {
        velocity = gsap.utils.clamp(-MAX_SPEED * 2, MAX_SPEED * 2, (y - lastY) / dt);
      }
      lastY = y;
      lastT = now;
      dirty = true;

      const norm = gsap.utils.clamp(-1, 1, velocity / MAX_SPEED);
      const mag = Math.abs(norm);

      // Below a threshold the difference is invisible but the cost is not:
      // retargeting a tween on every scroll event is what turns a smooth
      // effect into a stuttering one.
      if (mag < 0.012) {
        skewTo(0);
        scaleTo(1);
        return;
      }

      skewTo(norm * MAX_SKEW);
      scaleTo(1 - mag * MAX_PULLBACK);
    };

    const settle = () => {
      // Guarded: without this the ticker retargets both tweens sixty times a
      // second forever, even on a completely still page.
      if (!dirty) return;
      dirty = false;
      skewTo(0);
      scaleTo(1);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const tick = () => {
      settle();
    };
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      gsap.ticker.remove(tick);
      el.style.transform = '';
      el.style.willChange = '';
    };
  }, [targetRef, reduced]);

  return null;
}