/**
 * Generated SVG covers as data URIs.
 *
 * `<ProjectArt>` renders live DOM art inside the cards. Where an <img> element
 * is required instead — the FlexCarousel texture loader and the ScrollExpand
 * media frame — these static vector equivalents keep the same composition
 * language (ink ground, hue washes, hairline grid, one motif) so the reel, the
 * cards and the interlude read as one family rather than three unrelated
 * visual sources. The scatter formulas are lifted verbatim from ProjectArt.
 */

export interface CoverArt {
  hue: number;
  hue2: number;
  motif: 'nodes' | 'loop' | 'grid' | 'wave' | 'stack';
}

interface CoverMeta {
  /** Large corner numeral, e.g. "02". Empty string omits it. */
  index?: string;
  /** Small mono label along the lower edge, uppercased by the caller. */
  label?: string;
  width?: number;
  height?: number;
}

const INK = '#0a0c0a';
const LINE = 'rgba(240,240,232,0.30)';
const FAINT = 'rgba(240,240,232,0.13)';
/** ProjectArt's accent: hsl(88 100% 65%) with headroom for legibility. */
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

/* Standalone compositions use the hero acid, not the project hue, so the
   interlude keeps the site's voice even though no project palette owns it. */
const ACID_SOFT = 'rgba(200,255,77,0.85)';

function nodesMotif(): string {
  const dots: string[] = [];
  const links: string[] = [];
  for (let i = 0; i < 34; i++) {
    const cx = ((i * 97) % 400) + 6;
    const cy = ((i * 173) % 300) + 6;
    dots.push(`<circle cx="${cx}" cy="${cy}" r="${i % 7 === 0 ? 3 : (i % 7) / 2.6 + 0.9}" fill="${i % 7 === 0 ? ACID_SOFT : LINE}"/>`);
  }
  for (let i = 0; i < 26; i++) {
    const x1 = ((i * 97) % 400) + 6;
    const y1 = ((i * 173) % 300) + 6;
    const j = (i * 7 + 3) % 34;
    const x2 = ((j * 97) % 400) + 6;
    const y2 = ((j * 173) % 300) + 6;
    if (Math.hypot(x2 - x1, y2 - y1) > 130) continue;
    links.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${FAINT}" stroke-width="0.8"/>`);
  }
  return `${links.join('')}${dots.join('')}`;
}

function loopMotif(): string {
  const ring: string[] = ['<circle r="92" fill="none" stroke="rgba(240,240,232,0.13)" stroke-width="1" stroke-dasharray="3 7"/>', '<circle r="62" fill="none" stroke="rgba(240,240,232,0.30)" stroke-width="1.2"/>'];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
    ring.push(`<circle cx="${(Math.cos(a) * 62).toFixed(1)}" cy="${(Math.sin(a) * 62).toFixed(1)}" r="${i % 3 === 0 ? 4.5 : 2.5}" fill="${i === 3 || i === 9 ? ACID_SOFT : LINE}"/>`);
  }
  ring.push('<path d="M 0 -62 A 62 62 0 0 1 54 31" fill="none" stroke="#c8ff4d" stroke-width="2"/>');
  ring.push('<path d="M 46 22 L 54 31 L 43 36 Z" fill="#c8ff4d"/>');
  return `<g transform="translate(200 150)">${ring.join('')}</g>`;
}

function gridMotif(): string {
  const cells = 9;
  const step = 300 / cells;
  const out: string[] = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const x = 50 + c * step;
      const y = ((r * step) % 300) + step / 2;
      const seed = (r * cells + c) % 11;
      if (seed === 3) {
        out.push(`<rect x="${x - 9}" y="${y - 9}" width="18" height="18" fill="none" stroke="#c8ff4d" stroke-width="1.4"/>`);
      } else if (seed % 4 === 1) {
        out.push(`<circle cx="${x}" cy="${y}" r="2.4" fill="${LINE}"/>`);
      } else {
        out.push(`<path d="M ${x - 5} ${y} H ${x + 5} M ${x} ${y - 5} V ${y + 5}" stroke="${FAINT}" stroke-width="1"/>`);
      }
    }
  }
  return out.join('');
}

function waveMotif(): string {
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const y0 = 42 + i * 36;
    const amp = 13 - i * 1.2;
    const k = 0.02 + i * 0.004;
    const phase = i * 0.9;
    let d = `M 0 ${y0}`;
    for (let x = 0; x <= 400; x += 20) {
      d += ` L ${x} ${(y0 + Math.sin(x * k + phase) * amp).toFixed(1)}`;
    }
    const hot = i === 2;
    out.push(`<path d="${d}" fill="none" stroke="${hot ? '#c8ff4d' : LINE}" stroke-width="${hot ? 2 : 1}" opacity="${hot ? 0.9 : 0.55}"/>`);
  }
  return out.join('');
}

function stackMotif(): string {
  const out: string[] = [];
  for (let i = 0; i < 8; i++) {
    const y = 52 + i * 26;
    const w = i % 2 === 0 ? i * 44 + 60 : (8 - i) * 38 + 44;
    const hot = i === 3 || i === 6;
    out.push(`<rect x="52" y="${y}" width="${w}" height="9" rx="4.5" fill="${hot ? '#c8ff4d' : 'rgba(240,240,232,0.22)'}" opacity="${hot ? 0.85 : 0.8}"/>`);
  }
  return out.join('');
}

function motif(art: CoverArt): string {
  if (art.motif === 'nodes') return nodesMotif();
  if (art.motif === 'loop') return loopMotif();

  if (art.motif === 'grid') return gridMotif();
  if (art.motif === 'wave') return waveMotif();
  return stackMotif();
}

/**
 * Escapes text written into SVG content. A raw `&` (e.g. `Memory &
 * Retrieval`) makes the whole document invalid XML and the image silently
 * fails to decode. URL encoding is not enough: after the data URI is decoded
 * back, the `&` is raw again inside the markup.
 */
function esc(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Full in-card caption corner furniture: numeral, label, crosshair. */
function furniture(meta: Required<CoverMeta>): string {
  const index = meta.index
    ? `<text x="34" y="128" font-family="${MONO}" font-size="120" font-weight="600" letter-spacing="-4" fill="#f0f0e8" opacity="0.16">${esc(meta.index)}</text>`
    : '';
  const label = meta.label
    ? `<text x="34" y="268" font-family="${MONO}" font-size="13" letter-spacing="4.5" fill="rgba(200,255,77,0.66)">${esc(meta.label.toUpperCase())}</text>`
    : '';
  return index + label;
}

/**
 * Build the cover. viewBox stays at the ProjectArt 400x300 geometry and the
 * `slice` fit scales it, so one motif definition serves every frame shape.
 */
export function coverArtDataUri(art: CoverArt, meta: CoverMeta = {}): string {
  const width = meta.width ?? 1200;
  const height = meta.height ?? 675;
  const wash = art.hue;
  const wash2 = art.hue2;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">` +
    `<defs>` +
    `<radialGradient id="w1"><stop offset="0%" stop-color="hsl(${wash} 62% 42%)" stop-opacity="0.26"/><stop offset="100%" stop-color="hsl(${wash} 62% 42%)" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="w2"><stop offset="0%" stop-color="hsl(${wash2} 58% 46%)" stop-opacity="0.18"/><stop offset="100%" stop-color="hsl(${wash2} 58% 46%)" stop-opacity="0"/></radialGradient>` +
    `<pattern id="hair" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M 32 0 V 32 M 0 32 H 32" stroke="rgba(240,240,232,0.05)" stroke-width="1" fill="none"/></pattern>` +
    `</defs>` +
    `<rect width="400" height="300" fill="${INK}"/>` +
    `<rect width="400" height="300" fill="url(#hair)"/>` +
    `<rect width="400" height="300" fill="url(#w1)"/>` +
    `<rect width="400" height="300" fill="url(#w2)" x="-30" y="90"/>` +
    `<g opacity="0.72">${motif(art)}</g>` +
    `<rect x="0.5" y="0.5" width="399" height="299" fill="none" stroke="rgba(240,240,232,0.10)"/>` +
    furniture({ index: meta.index ?? '', label: meta.label ?? '', width, height }) +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
