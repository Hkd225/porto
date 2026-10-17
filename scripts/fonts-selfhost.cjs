/**
 * fonts-selfhost — download the site's Google Fonts as local woff2 files.
 *
 * Primary source: the same css2 URLs the site used to link, parsed for the
 * `latin` subset blocks (covers ASCII + General Punctuation, incl. the
 * en-dash). Fallback source on flaky networks: fontsource mirrors on
 * jsDelivr (variable files where stable, static weights otherwise).
 *
 * Every saved file is verified to start with the wOF2 magic bytes.
 *
 * Usage: node scripts/fonts-selfhost.cjs
 * Writes into ../public/fonts and prints a JSON manifest to stdout.
 */
const fs = require('node:fs');
const path = require('node:path');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';
const OUT = path.join(__dirname, '..', 'public', 'fonts');

/** The css2 requests the site needed. Roboto Flex is requested once with the
    widest axis set (opsz + wdth + wght) so one file serves both consumers:
    TextPressure wants wdth, VariableProximity only wght. */
const CSS2 = [
  'https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap',
  'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000&display=swap',
];

/* fontsource fallbacks — file name == "family@latest/subset-weight-style" */
const FALLBACKS = {
  'instrument-serif': [
    { slug: 'instrument-serif-400.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-normal.woff2' },
    { slug: 'instrument-serif-400-italic.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/instrument-serif@latest/latin-400-italic.woff2' },
  ],
  inter: [
    { slug: 'inter-var.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-wght-normal.woff2' },
  ],
  'jetbrains-mono': [
    { slug: 'jetbrains-mono-var.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/jetbrains-mono@latest/latin-wght-normal.woff2' },
  ],
  'roboto-flex': [
    /* "standard" packs opsz + wdth + wght in one variable file */
    { slug: 'roboto-flex-var.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto-flex@latest/latin-standard-normal.woff2' },
    { slug: 'roboto-flex-var.woff2', url: 'https://cdn.jsdelivr.net/fontsource/fonts/roboto-flex@latest/latin-wght-normal.woff2' },
  ],
};

function slugOf(family, style, weight) {
  const base = family.toLowerCase().replace(/\s+/g, '-');
  const isVar = /\s/.test(weight); // "100 900" style ranges mark variable faces
  const stylePart = style === 'italic' ? '-italic' : '';
  return `${base}${isVar ? '-var' : `-${weight.replace(' ', 'x')}`}${stylePart}.woff2`;
}

async function fetchCss(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`css2 ${res.status}`);
  return res.text();
}

/** Pull the blocks tagged `/* latin * /` out of a css2 response. */
function latinBlocks(css) {
  const blocks = [];
  const re = /\/\* latin \*\/\s*@font-face\s*{([^}]+)}/g;
  for (const m of css.matchAll(re)) {
    const body = m[1];
    const family = (body.match(/font-family:\s*'([^']+)'/) || [])[1] || '';
    const style = (body.match(/font-style:\s*(\w+)/) || [])[1] || 'normal';
    const weight = (body.match(/font-weight:\s*([\d ]+(?=\s*;))/) || [])[1] || '400';
    const src = (body.match(/url\((https:[^)]+\.woff2)\)/) || [])[1] || '';
    if (family && src) blocks.push({ family, style, weight, src });
  }
  return blocks;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`woff2 ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.subarray(0, 4).toString() !== 'wOF2') throw new Error('not woff2');
  return buf;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const manifest = [];
  const wanted = [
    { family: 'Instrument Serif', style: 'normal' },
    { family: 'Instrument Serif', style: 'italic' },
    { family: 'Inter', style: 'normal' },
    { family: 'JetBrains Mono', style: 'normal' },
    { family: 'Roboto Flex', style: 'normal' },
  ];

  for (const url of CSS2) {
    try {
      for (const block of latinBlocks(await fetchCss(url))) {
        const slug = slugOf(block.family, block.style, block.weight);
        const buf = await download(block.src);
        fs.writeFileSync(path.join(OUT, slug), buf);
        manifest.push({
          family: block.family,
          style: block.style,
          weight: block.weight,
          file: slug,
          bytes: buf.length,
          source: 'google',
        });
      }
    } catch (e) {
      console.warn(`css2 failed (${e.message}) — falling back for later verification`);
    }
  }

  /* Backfill anything the css2 run could not fetch. */
  for (const w of wanted) {
    const got = manifest.some((m) => m.family === w.family && m.style === w.style);
    if (got) continue;
    for (const f of FALLBACKS[w.family.toLowerCase()] || []) {
      try {
        const buf = await download(f.url);
        fs.writeFileSync(path.join(OUT, f.slug), buf);
        manifest.push({ family: w.family, style: w.style, weight: 'variable', file: f.slug, bytes: buf.length, source: 'fontsource' });
        console.warn(`fallback ok: ${w.family} -> ${f.slug}`);
        break;
      } catch (e) {
        console.warn(`fallback miss: ${f.url} (${e.message})`);
      }
    }
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(JSON.stringify(manifest, null, 2));
  if (manifest.length < wanted.length) {
    console.error('MISSING fonts — inspect before wiring');
    process.exitCode = 1;
  }
})();
