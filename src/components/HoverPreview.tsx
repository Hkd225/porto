import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { gsap, EASE, isCoarsePointer, prefersReducedMotion } from '../lib/gsap';
import { scrollState } from '../lib/scrollState';

import { ProjectArt } from './ProjectArt';
import { HoverPreviewContext, type HoverPreviewApi, type PreviewContent } from '../hooks/useProjectPreview';

/* ============================================================
   PROVIDER
   Two content slots are kept, each holding its own thing.
   ============================================================ */

interface Slots {
  a: PreviewContent | null;
  b: PreviewContent | null;
}

/** Which slot is currently facing the user. Held in state, not a ref — a ref
 *  would not re-render, and the layer needs to know which one is the front. */
interface PreviewState {
  slots: Slots;
  front: 'a' | 'b';
}

export function HoverPreviewProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PreviewState>({ slots: { a: null, b: null }, front: 'a' });
  const [moving, setMoving] = useState(false);

  /**
   * While the page is moving, hover means nothing.
   *
   * In the horizontal band a card slides under a stationary cursor and fires
   * pointerenter over and over. Acting on each one restarted the swap tween
   * every frame or two, so the preview read as a hard strobe and appeared to be
   * pinned to the cursor. Hovering is a deliberate act; a card sweeping past
   * is not.
   */
  useEffect(() => {
    return scrollState.subscribe((moving) => {
      setMoving(moving);
      if (moving) return;
      /* Once scrolling stops, drop whatever was on screen. Without this the
         layer would treat the stale slots as a fresh enter and pop the preview
         back into view with nothing under the cursor. The next real
         pointerenter repopulates it. */
      setState((prev) => ({ slots: { a: null, b: null }, front: prev.front }));
    });
  }, []);

  const show = useCallback((content: PreviewContent) => {
    if (scrollState.isMoving()) return;
    setState((prev) => {
      if (prev.slots[prev.front]?.id === content.id) return prev;

      const back: 'a' | 'b' = prev.front === 'a' ? 'b' : 'a';
      // Write into the back slot only. The front slot keeps the outgoing
      // content, which is what makes two different things crossfade instead of
      // both re-rendering to the same picture at once.
      return { slots: { ...prev.slots, [back]: content }, front: back };
    });
  }, []);

  const hide = useCallback(() => setState((prev) => ({ ...prev })), []);
  const api = useMemo<HoverPreviewApi>(() => ({ show, hide }), [show, hide]);

  return (
    <HoverPreviewContext.Provider value={api}>
      {children}
      <HoverPreviewLayer slots={state.slots} front={state.front} suppressed={moving} />
    </HoverPreviewContext.Provider>
  );
}

/* ============================================================
   LAYER
   ============================================================ */

function HoverPreviewLayer({
  slots,
  front,
  suppressed,
}: {
  slots: Slots;
  front: 'a' | 'b';
  suppressed: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);
  const shown = useRef<string | null>(null);

  const enabled =
    typeof window !== 'undefined' && !prefersReducedMotion() && !isCoarsePointer();

  /* Follow the pointer. quickTo gives the lag that makes the preview feel
     attached to the cursor rather than teleporting after it. */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || !enabled) return;

    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

    // Start at the pointer rather than sliding in from 0,0 on the first hover.
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const x = e.clientX + 28;
      const y = e.clientY - 28;
      if (shown.current === null) gsap.set(el, { x, y });
      xTo(x);
      yTo(y);
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, [enabled]);

  /* Enter, leave, swap and scroll-suppression — driven by the slot that changed,
     so the outgoing content is never re-rendered. */
  useEffect(() => {
    const root = rootRef.current;
    const a = aRef.current;
    const b = bRef.current;
    if (!root || !a || !b || !enabled) return;

    const incoming = front === 'a' ? a : b;
    const outgoing = front === 'a' ? b : a;
    const content = slots[front];

    // Scrolling away takes precedence over whatever the slots say. Clearing
    // `shown` means the next deliberate hover plays a full enter, rather than
    // resuming a swap that was already half finished.
    if (suppressed) {
      if (shown.current !== null) {
        gsap.to(root, { opacity: 0, scale: 0.94, duration: 0.22, ease: 'power2.in' });
        shown.current = null;
      }
      return;
    }

    const id = content?.id ?? null;
    if (id === shown.current) return;

    if (!id) {
      gsap.to(root, { opacity: 0, scale: 0.94, duration: 0.34, ease: EASE.out });
      gsap.set([a, b], { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)', scale: 1 });
      shown.current = null;
      return;
    }

    shown.current = id;
    gsap
      .timeline()
      .set(root, { opacity: 1, scale: 1 })
      .fromTo(
        incoming,
        { opacity: 0, clipPath: 'inset(14% 0% 86% 0%)', scale: 1.09 },
        {
          opacity: 1,
          clipPath: 'inset(0% 0% 0% 0%)',
          scale: 1,
          duration: 0.85,
          ease: EASE.outExpo,
          // Without overwrite a second swap arriving mid-flight leaves two
          // timelines fighting over the same panels, which is what made the
          // transition look like it was snapping.
          overwrite: true,
        },
        0,
      )
      .to(outgoing, { opacity: 0, scale: 0.95, duration: 0.5, ease: 'power2.in', overwrite: true }, 0);
  }, [slots, front, suppressed, enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[185] hidden opacity-0 lg:block"
    >
      <div className="relative w-[19rem]">
        <div ref={aRef} className="overflow-hidden rounded-sm border border-line bg-ink">
          {slots.a && <PreviewCard content={slots.a} />}
        </div>
        <div
          ref={bRef}
          className="absolute inset-0 overflow-hidden rounded-sm border border-line bg-ink"
        >
          {slots.b && <PreviewCard content={slots.b} />}
        </div>
      </div>
    </div>
  );
}

function PreviewCard({ content }: { content: PreviewContent }) {
  const Icon = content.icon;

  return (
    <div className="w-[19rem]">
      {content.art ? (
        <div className="h-[13rem]">
          <ProjectArt
            art={content.art}
            index={content.index ?? ''}
            label={content.eyebrow}
            className="h-full w-full"
          />
        </div>
      ) : (
        /* No cover to generate — a quiet plate built from the icon instead of
           dropping the card to half height, which would make the swap jump. */
        <div className="relative flex h-[13rem] items-center justify-center bg-ink-2">
          <div className="grid-lines absolute inset-0 opacity-40" />
          {Icon && <Icon size={52} className="relative text-acid/70" />}
          <span className="mono-label absolute bottom-4 left-5 text-dim">
            {content.meta ?? ''}
          </span>
        </div>
      )}

      <div className="flex items-baseline justify-between gap-3 border-t border-line px-4 py-3">
        <span className="truncate font-display text-sm tracking-[-0.02em] text-bone">
          {content.title}
        </span>
        <span className="shrink-0 font-mono text-[0.58rem] tracking-[0.16em] text-acid uppercase">
          {content.eyebrow}
        </span>
      </div>
    </div>
  );
}