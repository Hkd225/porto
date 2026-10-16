import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

let registered = false;

/**
 * Single registration point for GSAP plugins.
 *
 * Guarded by a module-level flag so that React Strict Mode's double-invoke and
 * any number of component mounts can never re-register plugins.
 *
 * Note: `SplitText` ships in the public `gsap` package since GSAP 3.13.
 */
export function registerGsap(): void {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText };

/**
 * Re-measure every scroll trigger against the live document.
 *
 * ScrollTrigger computes each trigger's start and end *once*, when the trigger
 * is created, and then trusts them until something explicitly refreshes it.
 * On this page that creation happens during the very first React commit —
 * while the webfont fallback is still in use and the preloader has not handed
 * over — so every trigger below the hero caches an offset that is roughly
 * 1400px too early.
 *
 * The failure is silent and deceptive: the start/end *range* stays internally
 * consistent, so the trigger reports a smooth-looking progress, but it is
 * measuring the wrong part of the page. A scrubbed scene therefore renders
 * fully scrolled from the moment you reach it and never animates.
 *
 * `invalidateOnRefresh` does not help — it only re-measures when a refresh
 * already happens, and the page had no reason to trigger one.
 */
export const refreshScrollTriggers = (): void => ScrollTrigger.refresh();

/** Shared easing — used everywhere so motion feels like one system. */
export const EASE = {
  out: 'power3.out',
  outExpo: 'expo.out',
  inOut: 'power3.inOut',
  inOutQuart: 'power4.inOut',
} as const;

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: none), (pointer: coarse)').matches;

/** True on low-signal devices where we shed the expensive visuals. */
export const isLowPower = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return cores <= 4 || mem <= 4;
};