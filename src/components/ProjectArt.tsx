interface ProjectArtProps {
  art: { hue: number; hue2: number; motif: 'nodes' | 'loop' | 'grid' | 'wave' | 'stack' };
  index: string;
  label: string;
  className?: string;
}

/**
 * Generated cover artwork.
 *
 * These are honest placeholders: deterministic vector compositions derived from
 * the project's palette, not fake screenshots. Swap for real captures when the
 * repositories have them — every project already links to its source.
 */
export function ProjectArt({ art, index, label, className }: ProjectArtProps) {
  const { hue, hue2, motif } = art;
  const wash = `hsl(${hue} 62% 42% / 0.20)`;
  const wash2 = `hsl(${hue2} 58% 46% / 0.14)`;
  const accent = `hsl(88 100% 65% / 0.85)`;
  const line = 'rgba(240,240,232,0.30)';
  const faint = 'rgba(240,240,232,0.13)';

  return (
    <div
      className={`relative overflow-hidden bg-ink-2 ${className ?? ''}`}
      aria-hidden="true"
    >
      {/* colour wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(70% 80% at 22% 18%, ${wash}, transparent 62%), radial-gradient(65% 75% at 82% 88%, ${wash2}, transparent 64%)`,
        }}
      />
      {/* hairline grid */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(240,240,232,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(240,240,232,.05) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        {motif === 'nodes' && (
          <g>
            {Array.from({ length: 34 }).map((_, i) => {
              // Deterministic pseudo-random scatter — stable across renders.
              const x = ((i * 97) % 400) + 6;
              const y = ((i * 173) % 300) + 6;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={i % 7 === 0 ? 3 : 1.8}
                  fill={i % 7 === 0 ? accent : line}
                />
              );
            })}
            {Array.from({ length: 26 }).map((_, i) => {
              const x1 = ((i * 97) % 400) + 6;
              const y1 = ((i * 173) % 300) + 6;
              const j = (i * 7 + 3) % 34;
              const x2 = ((j * 97) % 400) + 6;
              const y2 = ((j * 173) % 300) + 6;
              if (Math.hypot(x2 - x1, y2 - y1) > 130) return null;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={faint} strokeWidth={0.8} />;
            })}
          </g>
        )}

        {motif === 'loop' && (
          <g transform="translate(200 150)">
            <circle r={92} fill="none" stroke={faint} strokeWidth={1} strokeDasharray="3 7" />
            <circle r={62} fill="none" stroke={line} strokeWidth={1.2} />
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
              return (
                <circle
                  key={i}
                  cx={Math.cos(a) * 62}
                  cy={Math.sin(a) * 62}
                  r={i % 3 === 0 ? 4.5 : 2.5}
                  fill={i === 3 || i === 9 ? accent : line}
                />
              );
            })}
            <path d="M 0 -62 A 62 62 0 0 1 54 31" fill="none" stroke={accent} strokeWidth={2} />
            <path d="M 46 22 L 54 31 L 43 36 Z" fill={accent} />
          </g>
        )}

        {motif === 'grid' && (
          <g>
            {Array.from({ length: 13 }).map((_, r) =>
              Array.from({ length: 20 }).map((_, c) => {
                const hot = r === 6 && c === 9;
                const warm = (r + c) % 9 === 0;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={8 + c * 20}
                    y={10 + r * 22}
                    width={hot ? 12 : 6}
                    height={hot ? 12 : 6}
                    fill={hot ? accent : warm ? line : faint}
                  />
                );
              }),
            )}
            <rect
              x={8 + 9 * 20 - 7}
              y={10 + 6 * 22 - 7}
              width={26}
              height={26}
              fill="none"
              stroke={accent}
              strokeWidth={1.2}
            />
          </g>
        )}

        {motif === 'wave' && (
          <g>
            {Array.from({ length: 15 }).map((_, i) => {
              const y = 14 + i * 20;
              const amp = 8 + (i % 3) * 5;
              const d = Array.from({ length: 17 })
                .map((_, s) => {
                  const x = -10 + s * 27;
                  const yy = y + Math.sin((s + i) * 0.55) * amp;
                  return `${s === 0 ? 'M' : 'L'} ${x} ${yy.toFixed(1)}`;
                })
                .join(' ');
              return (
                <path
                  key={i}
                  d={d}
                  fill="none"
                  stroke={i === 6 ? accent : i % 2 ? line : faint}
                  strokeWidth={i === 6 ? 1.8 : 0.8}
                />
              );
            })}
          </g>
        )}

        {motif === 'stack' && (
          <g>
            {Array.from({ length: 15 }).map((_, i) => {
              const w = 70 + ((i * 67) % 320);
              const hot = i === 8;
              return (
                <g key={i}>
                  <rect x={10} y={12 + i * 19} width={w} height={9} fill={hot ? accent : i % 2 ? line : faint} />
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* technical marks */}
      <span className="absolute top-4 right-4 font-mono text-[0.6rem] tracking-[0.2em] text-bone/55">
        {index}
      </span>
      <span className="absolute bottom-4 left-4 font-mono text-[0.6rem] tracking-[0.2em] text-bone/55 uppercase">
        {label}
      </span>
    </div>
  );
}