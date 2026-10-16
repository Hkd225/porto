interface MarqueeProps {
  items: readonly string[];
  /** Seconds for one full pass. Higher is slower. */
  duration?: number;
  className?: string;
  itemClassName?: string;
  /** Accessible label, since the strip itself is decorative. */
  label?: string;
  /** Rendered between items. Defaults to a small acid diamond. */
  separator?: string;
}

/**
 * Seamless horizontal ticker.
 *
 * The track holds the item list twice and the keyframes slide it exactly -50%,
 * so the loop point lands where the copy does — no visible seam, no JS, no
 * measurement. Because the animation sits on the *track* (not on each list),
 * -50% is precisely one list width.
 *
 * Pauses on hover and focus so a keyboard user can actually read it; the
 * reduced-motion block in index.css stops it dead for everyone else.
 */
export function Marquee({
  items,
  duration = 38,
  className = '',
  itemClassName = '',
  label,
  separator = '◆',
}: MarqueeProps) {
  return (
    <div
      className={`group/marquee relative overflow-hidden ${className}`}
      role="region"
      aria-label={label}
      tabIndex={0}
    >
      <ul
        className={`animate-marquee flex w-max items-center group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] ${itemClassName}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {/* Two passes. Only the first is announced; the second is aria-hidden
            so a screen reader does not read every item twice. */}
        {[0, 1].map((copy) => (
          <li
            key={copy}
            aria-hidden={copy === 1 ? 'true' : undefined}
            className="flex shrink-0 items-center"
          >
            {items.map((item, i) => (
              <span key={i} className="flex shrink-0 items-center gap-8 pr-8">
                {item}
                <span aria-hidden="true" className="text-acid/60">
                  {separator}
                </span>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}