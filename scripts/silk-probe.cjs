/**
 * Silk presence probe — quick health check of the hero WebGL background.
 *
 * Verifies:
 *  1. .silk-container / .silk-canvas are mounted with a resized backing buffer
 *  2. the background region actually contains non-black pixels (render check)
 *
 * Usage: node scripts/silk-probe.cjs [baseURL]   (default http://localhost:4173/)
 */
const { chromium } = require('playwright');

const base = process.argv[2] || 'http://localhost:4173/';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', err => console.log('PAGEERROR:', String(err)));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
  });

  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  const dom = await page.evaluate(() => {
    const container = document.querySelector('.silk-container');
    const canvas = document.querySelector('.silk-canvas');
    if (!container || !canvas) return { containerPresent: !!container, canvasPresent: !!canvas };
    const r = canvas.getBoundingClientRect();
    const gl = canvas.getContext('webgl2');
    return {
      containerPresent: true,
      canvasPresent: true,
      canvasBuffer: { w: canvas.width, h: canvas.height },
      canvasRect: { x: r.x, y: r.y, w: r.width, h: r.height },
      contextLost: gl ? gl.isContextLost() : 'no-context',
      visibility: getComputedStyle(canvas).visibility,
      opacity: getComputedStyle(canvas).opacity,
    };
  });

  // Screenshot a background-only region and decode it back inside the browser
  // to measure brightness (the canvas buffer itself is non-preserved).
  const clip = { x: 850, y: 80, width: 500, height: 400 };
  const shot = await page.screenshot({ clip });
  const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;
  const stats = await page.evaluate(async url => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    const cv = document.createElement('canvas');
    cv.width = img.width;
    cv.height = img.height;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let sum = 0;
    let max = 0;
    let nonzero = 0;
    let maxPixel = null;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      const v = (r + g + b) / 3;
      sum += v;
      if (v > max) { max = v; maxPixel = [r, g, b]; }
      if (v > 10) nonzero++;
    }
    const n = d.length / 4;
    return {
      avgBrightness: +(sum / n).toFixed(2),
      maxBrightness: +max.toFixed(2),
      maxPixel,
      nonzeroPct: +((100 * nonzero) / n).toFixed(1),
    };
  }, dataUrl);

  console.log(JSON.stringify({ url: base, dom, stats }, null, 2));
  await browser.close();
})().catch(err => {
  console.error('PROBE FAILED:', err);
  process.exit(1);
});
