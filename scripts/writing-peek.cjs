/**
 * writing-peek — one rest shot of the essay ledger + one hover shot of a
 * row raising its texture plate.
 * Usage: node scripts/writing-peek.cjs [url]
 */
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const outDir = path.join(os.tmpdir(), 'porto-audit');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
  page.on('pageerror', (e) => console.error(`[pageerror] ${e.message}`));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    window.__lenis?.scrollTo('#writing', { immediate: true });
  });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'writing-rest.png') });

  /* Hover the second essay row — the fog/plate texture fades in. The
     row sits below the fold after jumping to the section top, so let
     playwright scroll it into view. */
  const row = page.locator('#writing a[href*="medium.com"]').last();
  await row.hover({ position: { x: 420, y: 170 } });
  await page.waitForTimeout(1000);
  const plate = await page.evaluate(() => {
    const img = [...document.querySelectorAll('#writing a img')].at(-1);
    if (!img) return 'no plate';
    const cs = getComputedStyle(img);
    return { opacity: cs.opacity, transform: cs.transform.slice(0, 40) };
  });
  console.log('plate probe:', JSON.stringify(plate));
  await page.screenshot({ path: path.join(outDir, 'writing-hover.png') });

  await browser.close();
  console.log('writing shots written');
})();
