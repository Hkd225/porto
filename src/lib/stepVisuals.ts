/**
 * Hairline "ink" visuals for the four method panels (Read / Rebuild / Push /
 * Document) in the manifesto accordion.
 *
 * They are generated inline as SVG data URIs so the panels need no image
 * assets: 1.5–2px strokes on the Void black, drawn to match the site. Collapsed
 * panels sit under a `grayscale` filter and a dim overlay, so only the sage
 * accent of the *expanded* panel shows its colour — which is exactly the
 * accent-only rule of the system.
 */

const INK = '#E9E6DE';
const ACCENT = '#A4AA9B';

const svg = (body: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 840" fill="none">${body}</svg>`
  )}`;

const rect = (x: number, y: number, extra = '') =>
  `<rect x='${x}' y='${y}' width='84' height='84'${extra}/>`;

/* 01 · Read — a ruled page: paragraph lines, one key line boxed in sage. */
const read = `
<g stroke='${INK}' stroke-opacity='0.28' stroke-width='1.5'><path d='M64 96v656'/></g>
<g stroke='${INK}' stroke-opacity='0.42' stroke-width='1.5'>
<path d='M96 156h468'/><path d='M96 204h420'/><path d='M96 252h444'/><path d='M96 300h352'/>
<path d='M96 348h238'/><path d='M96 532h444'/><path d='M96 580h396'/><path d='M96 628h210'/>
</g>
<g stroke='${ACCENT}' stroke-width='2'>
<rect x='88' y='440' width='308' height='34' rx='17' stroke-opacity='0.9'/>
<path d='M96 466h292' stroke-opacity='0.5'/>
</g>
<g stroke='${ACCENT}' stroke-width='1.5' stroke-opacity='0.65'>
<circle cx='486' cy='596' r='30' stroke-dasharray='3 7'/>
</g>`;

/* 02 · Rebuild — a staircase of outlined blocks, one solid block lit and a
   dashed block above marking the next piece of the build. */
const rows: Array<Array<number>> = [
  [72, 164, 256, 348, 440],
  [164, 256, 348, 440],
  [256, 348, 440],
  [348, 440],
];
const rowY = [652, 560, 468, 376];
const rebuild = `
<g stroke='${INK}' stroke-opacity='0.42' stroke-width='2'>
${rows.flatMap((row, i) => row.map((x) => rect(x, rowY[i]))).join('')}
</g>
<g stroke='${ACCENT}' stroke-width='2'>
${rect(440, 284)}
<g stroke-opacity='0.6'>
${rect(440, 192, ` stroke-dasharray='4 8'`)}
<path d='M482 168v-40' stroke-dasharray='4 8'/>
<path d='M72 744L556 244' stroke-opacity='0.3' stroke-dasharray='2 10'/>
</g>
</g>`;

/* 03 · Push — a crack running diagonally through the frame, its sharpest
   break circled in sage with radiating stress ticks. */
const push = `
<g stroke='${INK}' stroke-opacity='0.42' stroke-width='2'>
<path d='M40 792L144 700L112 648L228 544L190 494L318 376L290 322L422 208L402 156L524 44'/>
<path d='M228 544L296 566'/><path d='M318 376L258 340'/><path d='M402 156L452 190'/>
</g>
<g stroke='${ACCENT}' stroke-width='2'>
<path d='M190 494L318 376' stroke-opacity='0.95'/>
<circle cx='290' cy='322' r='30' stroke-opacity='0.8'/>
<g stroke-opacity='0.55'>
<path d='M290 292v-18'/><path d='M290 352v18'/><path d='M260 322h-18'/><path d='M320 322h18'/>
<path d='M269 301l-14-14'/><path d='M311 301l14-14'/><path d='M269 343l-14 14'/><path d='M311 343l14 14'/>
</g>
</g>`;

/* 04 · Document — a ledger: dashed margin, two columns of entries, sage
   checkmarks closing the verified rows. */
const leftLens = [318, 262, 340, 236, 300, 266, 312, 222, 286, 246, 308, 190];
const checkRows = [2, 5, 9, 11];
const document_ = `
<g stroke='${INK}' stroke-opacity='0.28' stroke-width='1.5'>
<path d='M40 88h560'/><path d='M64 104v652' stroke-dasharray='2 8'/>
</g>
<g stroke='${INK}' stroke-opacity='0.42' stroke-width='2'>
${leftLens.map((len, i) => {
  const y = 148 + i * 47;
  return `<path d='M96 ${y}h${len}'/><path d='M432 ${y}h56'/>`;
}).join('')}
</g>
<g stroke='${ACCENT}' stroke-width='2' stroke-opacity='0.9'>
${checkRows
  .map((i) => {
    const y = 148 + i * 47;
    return `<path d='M512 ${y}l10 12l20 -24'/>`;
  })
  .join('')}
</g>`;

export const stepVisuals: readonly string[] = [svg(read), svg(rebuild), svg(push), svg(document_)];
