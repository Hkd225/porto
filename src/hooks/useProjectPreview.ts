import { createContext, useContext, useMemo } from 'react';
import type { Project } from '../data/projects';

/**
 * What the shared hover preview renders.
 *
 * Deliberately not project-shaped. The same slot that previews a repository
 * cover also previews a written piece and a contact channel — one shared
 * surface that swaps between three different kinds of content is a much
 * stronger effect than three separate previews that only ever appear in their
 * own section.
 */
export interface PreviewContent {
  /** Identity of the thing being shown. Used to skip redundant swaps. */
  id: string;
  title: string;
  /** Small label in the top right of the card. */
  eyebrow: string;
  /** Small label in the bottom left. */
  meta?: string;
  /** Generated cover, when the thing has one. */
  art?: Project['art'];
  /** Shown instead of a cover when there is nothing to render art from. */
  icon?: React.ComponentType<{ size?: number | string; className?: string }>;
  /** Project index number, drawn into the cover. */
  index?: string;
}

export interface HoverPreviewApi {
  show: (content: PreviewContent) => void;
  hide: () => void;
}

export const HoverPreviewContext = createContext<HoverPreviewApi>({ show: () => {}, hide: () => {} });

/**
 * Registers a target with the shared hover preview.
 *
 * Returns handlers to spread onto the element. Keyboard focus registers the
 * same way hover does, so the preview is reachable without a pointer.
 */
export function useHoverPreview(content: PreviewContent) {
  const { show, hide } = useContext(HoverPreviewContext);
  return useMemo(
    () => ({
      onPointerEnter: () => show(content),
      onPointerLeave: hide,
      onPointerCancel: hide,
      onFocus: () => show(content),
      onBlur: hide,
    }),
    [show, hide, content],
  );
}

/**
 * Deterministic cover for something that has no repository metadata of its own.
 *
 * Same hash → same hue and motif, so a given article keeps the same generated
 * cover across sessions and across machines. Written by hand rather than
 * pulled from a library: the whole cover-art system is already this idea.
 */
export function artFor(seed: string): Project['art'] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = h >>> 0;
  const hue = u % 360;
  const hue2 = (hue + 30 + ((u >> 9) % 140)) % 360;
  const motifs = ['nodes', 'loop', 'grid', 'wave', 'stack'] as const;
  return { hue, hue2, motif: motifs[(u >> 16) % motifs.length] };
}