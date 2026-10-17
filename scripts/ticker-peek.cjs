/**
 * ticker-peek — one close-up of the Method tool loop (LogoLoop).
 * Usage: node scripts/ticker-peek.cjs [url]
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
  await page.waitForTimeout(1500);

  /* Frame the ticker: bottom edge of the method section, ~62% down the view. */
  await page.evaluate(() => {
    const el = document.querySelector('#method > div > div:last-child');
    const y = el.getBoundingClientRect().top + window.scrollY - 620;
    window.__lenis?.scrollTo(y, { immediate: true });
  });
  await page.waitForTimeout(2600); // let the intro rise play + drift
  await page.screenshot({ path: path.join(outDir, 'ticker-rest.png') });

  /* Hover: the belt pauses; one entry lights to ivory. Raw mouse coords —
     locator.hover fights the wrap padding and the fixed nav. */
  const box = await page.locator('.logoloop').boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width * 0.5, box.y + box.height / 2);
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(outDir, 'ticker-hover.png') });
  }
  await browser.close();
  console.log('ticker shots written');
})();
