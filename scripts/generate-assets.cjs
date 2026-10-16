/**
 * Generates the static image assets that cannot be hand-written:
 *   public/og.png                 1200x630 social card
 *   public/icon-192.png           PWA icon
 *   public/icon-512.png           PWA icon
 *   public/icon-maskable-512.png  PWA icon, inside the 80% maskable safe zone
 *
 * Everything is rendered from HTML/CSS so the card stays in step with the
 * design tokens in src/index.css. Run with: npm run assets
 */

const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const INK = '#090A09';
const BONE = '#F0F0E8';
const MUTED = '#969A90';
const ACID = '#C8FF4D';
const LINE = 'rgba(240,240,232,0.14)';

/* The wordmark path from public/favicon.svg, reused for the PWA icons so the
   installed app and the browser tab show the same mark. */
const MARK_PATH =
  'M14 46V18h7.2l7.6 16.4L36.4 18H43.6v28h-6.4V29.6L29.6 46h-5.2L20.4 29.6V46H14z';

function ogCard() {
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'SpaceGrotesk'; src: local('Segoe UI'); }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background: ${INK}; color: ${BONE};
    font-family: 'Segoe UI', 'Helvetica Neue', system-ui, sans-serif;
    position: relative;
  }
  .grid {
    position: absolute; inset: 0;
    background-image: repeating-linear-gradient(to right, rgba(240,240,232,0.055) 0 1px, transparent 1px 100px);
    -webkit-mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
    mask-image: linear-gradient(to bottom, transparent, #000 18%, #000 82%, transparent);
  }
  .glow {
    position: absolute; right: -160px; top: -180px; width: 720px; height: 720px; border-radius: 999px;
    background: radial-gradient(circle, rgba(200,255,77,0.10), transparent 62%);
  }
  .wave {
    position: absolute; left: 0; right: 0; bottom: 0; height: 230px; opacity: 0.55;
  }
  .wrap { position: relative; padding: 64px 72px; height: 100%; display: flex; flex-direction: column; }
  .top { display: flex; align-items: baseline; justify-content: space-between; }
  .mark { font-size: 26px; letter-spacing: -0.03em; }
  .mark span { font-family: Consolas, monospace; font-size: 13px; letter-spacing: 0.2em; color: ${MUTED}; margin-left: 10px; }
  .status {
    font-family: Consolas, monospace; font-size: 13px; letter-spacing: 0.18em;
    text-transform: uppercase; color: ${MUTED};
    display: flex; align-items: center; gap: 10px;
  }
  .dot { width: 7px; height: 7px; border-radius: 999px; background: ${ACID}; box-shadow: 0 0 12px rgba(200,255,77,0.9); }
  .name {
    margin-top: auto; font-family: Consolas, monospace; font-size: 15px;
    letter-spacing: 0.18em; text-transform: uppercase; color: ${MUTED};
  }
  h1 {
    margin-top: 18px; font-size: 82px; line-height: 0.95; font-weight: 600; letter-spacing: -0.045em;
  }
  h1 em { font-style: italic; color: ${ACID}; }
  .foot {
    margin-top: 40px; padding-top: 22px; border-top: 1px solid ${LINE};
    display: flex; gap: 14px; flex-wrap: wrap;
  }
  .tag {
    font-family: Consolas, monospace; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase;
    color: ${MUTED}; border: 1px solid ${LINE}; border-radius: 999px; padding: 7px 15px;
    background: rgba(9,10,9,0.88);
  }
  .tag.acid { color: ${ACID}; border-color: rgba(200,255,77,0.4); }
</style>
</head>
<body>
  <div class="grid"></div>
  <div class="glow"></div>
  <svg class="wave" viewBox="0 0 1200 240" preserveAspectRatio="none">
    <path d="M0 160 C 180 96, 320 208, 520 150 S 860 70, 1200 140" fill="none" stroke="${ACID}" stroke-width="3" opacity="0.85"/>
    <path d="M0 200 C 200 150, 340 236, 560 196 S 900 128, 1200 190" fill="none" stroke="${BONE}" stroke-width="1" opacity="0.28"/>
    <path d="M0 120 C 160 66, 300 160, 480 108 S 820 36, 1200 100" fill="none" stroke="${BONE}" stroke-width="1" opacity="0.18"/>
  </svg>
  <div class="wrap">
    <div class="top">
      <div class="mark">Hakid.<span>MA</span></div>
      <div class="status"><i class="dot"></i>Independent AI Projects</div>
    </div>
    <div class="name">Muhammad Auffa Hakim Aditya</div>
    <h1>I build <em>intelligent</em><br />systems.</h1>
    <div class="foot">
      <span class="tag acid">Agentic AI</span>
      <span class="tag">Cognitive memory</span>
      <span class="tag">Uncertainty</span>
      <span class="tag">hkd225.github.io</span>
    </div>
  </div>
</body>
</html>`;
}

/** @param {{ size: number, pad: number }} opts */
function appIcon({ size, pad }) {
  const inner = size - pad * 2;
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { width: ${size}px; height: ${size}px; background: ${INK}; }
  svg { position: absolute; left: ${pad}px; top: ${pad}px; width: ${inner}px; height: ${inner}px; }
</style>
</head>
<body>
  <svg viewBox="0 0 64 64">
    <path d="${MARK_PATH}" fill="${BONE}"/>
    <circle cx="52" cy="13" r="5" fill="${ACID}"/>
  </svg>
</body>
</html>`;
}

async function shoot(page, html, out, { width, height, scale = 1 }) {
  await page.setViewportSize({ width, height });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(PUBLIC_DIR, out), scale: 'css' });
  const bytes = fs.statSync(path.join(PUBLIC_DIR, out)).size;
  console.log(`  ${out.padEnd(26)} ${width}x${height}${scale !== 1 ? ` @${scale}x` : ''}  ${(bytes / 1024).toFixed(1)} kB`);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 1 });

  console.log('generating assets into public/');

  await shoot(page, ogCard(), 'og.png', { width: 1200, height: 630 });
  await shoot(page, appIcon({ size: 192, pad: 0 }), 'icon-192.png', { width: 192, height: 192 });
  await shoot(page, appIcon({ size: 512, pad: 0 }), 'icon-512.png', { width: 512, height: 512 });
  // Maskable icons get cropped to a circle by the launcher, so the mark is
  // inset into the safe zone instead of touching the edges.
  await shoot(page, appIcon({ size: 512, pad: 64 }), 'icon-maskable-512.png', {
    width: 512,
    height: 512,
  });

  await browser.close();
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});