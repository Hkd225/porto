/**
 * Absolute URL for an in-page anchor, so a copied link works anywhere rather
 * than only as a fragment relative to the page the user is already on.
 */
export function absoluteAnchor(hash: string): string {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${hash}`;
}