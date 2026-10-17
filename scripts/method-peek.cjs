/**
 * Method (manifesto) peeks — screenshots of the AccordionGallery section at
 * rest and with a collapsed panel hovered, plus dedicated console collection.
 *
 * Usage: node scripts/method-peek.cjs [url]
 * Output: %TEMP%/porto-audit/method-*.png + report.json
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const outDir = path.join(os.tmpdir(), 'porto-audit');
fs.mkdirSync(outDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  // --- desktop: rest state, then hover the third panel ("Push") ------------
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(`[console.${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  await page.evaluate(() => window.__lenis?.scrollTo('#method', { duration: 1.6 }));
  await page.waitForTimeout(2800);
  await page.screenshot({ path: path.join(outDir, 'method-rest.png') });

  const panel = page.locator('.ag-panel').nth(2);
  await panel.hover();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(outDir, 'method-push.png') });

  const activeText = await page.evaluate(() => document.querySelector('.detail-in .num')?.textContent ?? '');
  // --- mobile: vertical stack --------------------------------------------
  await page.setViewportSize({ width: 1000, height: 900 }); // still row, plus size sanity
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(outDir, 'method-md.png') });

  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mob.on('pageerror', (e) => errors.push(`[pageerror mobile] ${e.message}`));
  await mob.goto(url, { waitUntil: 'networkidle' });
  await mob.evaluate(() => document.fonts.ready);
  await mob.waitForTimeout(1500);
  await mob.evaluate(() => window.__lenis?.scrollTo('#method', { immediate: true }));
  await mob.waitForTimeout(1200);
  await mob.screenshot({ path: path.join(outDir, 'method-mobile.png'), fullPage: false });

  // scroll a bit deeper to see the whole stacked gallery
  await mob.evaluate(() => window.__lenis?.scrollTo(window.scrollY + 1400, { immediate: true }));
  await mob.waitForTimeout(900);
  await mob.screenshot({ path: path.join(outDir, 'method-mobile-deep.png') });

  const report = { url, activeDetailText: activeText, errors };

  // --- overview: tall viewport shows the whole section in one frame -------
  const tall = await browser.newPage({ viewport: { width: 1600, height: 2400 } });
  tall.on('pageerror', (e) => errors.push(`[pageerror tall] ${e.message}`));
  await tall.goto(url, { waitUntil: 'networkidle' });
  await tall.evaluate(() => document.fonts.ready);
  await tall.waitForTimeout(2200);
  await tall.evaluate(() => window.__lenis?.scrollTo('#method', { duration: 1.4 }));
  await tall.waitForTimeout(2400);
  await tall.screenshot({ path: path.join(outDir, 'method-overview.png') });
  await tall.close();

  fs.writeFileSync(path.join(outDir, 'method-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
