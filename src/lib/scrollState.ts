/**
 * Shared "is the page moving?" signal.
 *
 * Module-level rather than React state for the same reason as the old pin
 * registry: the scroll handler that *causes* the movement is the thing that
 * needs to tell other effects to stand down, and a state update is a render
 * away from that moment.
 *
 * Consumers use it to suspend anything that would strobe under a moving
 * pointer — the hover preview, mostly. A card sliding under a stationary
 * cursor fires pointerenter repeatedly, and re-triggering a swap animation on
 * each one reads as a strobe rather than as a transition.
 */

type Listener = (moving: boolean) => void;

let moving = false;
let attached = false;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l(moving));
}

export const scrollState = {
  isMoving: () => moving,

  /**
   * Called from the scroll handler. Marks moving immediately, then releases
   * after a short quiet period — a debounce rather than a frame check, because
   * momentum scrolling produces a burst of events followed by a genuine stop,
   * and a per-frame test flaps on the way down.
   */
  touch(quietMs = 140) {
    if (!moving) {
      moving = true;
      emit();
    }
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!moving) return;
      moving = false;
      emit();
    }, quietMs);
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    // Self-sufficient: the scroll-velocity effect also calls touch(), but it
    // deliberately does not mount on touch devices or under reduced motion, so
    // the signal cannot depend on it being there.
    attach();
    return () => {
      listeners.delete(listener);
    };
  },
};

/** Installed on first subscriber, never removed — the page always can scroll. */
function attach() {
  if (listeners.size !== 1 || attached) return;
  attached = true;
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => scrollState.touch(), { passive: true });
  }
}