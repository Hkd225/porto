/**
 * Models section peeks — stats + axis, row at rest, hover-open band,
 * tall overview, mobile.
 *
 * Usage: node scripts/models-peek.cjs [url]
 * Output: %TEMP%/porto-audit/models-*.png + models-report.json
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

  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) errors.push(`[console.${m.type()}] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  // Stats + axis
  await page.evaluate(() => window.__lenis?.scrollTo('#models', { duration: 1.4 }));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(outDir, 'models-top.png') });

  // Rows at rest (probe bottom part)
  await page.evaluate(() => window.__lenis?.scrollTo(window.scrollY + 950, { duration: 1.2 }));
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'models-rest.png') });

  // Hover the second row — band should slide open
  const row = page.locator('#models ul a').nth(1);
  await row.hover();
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(outDir, 'models-hover.png') });

  // Keyboard focus also opens the band (a11y sanity)
  await page.evaluate(() => window.__lenis?.scrollTo(window.scrollY - 400, { duration: 0.8 }));
  await page.waitForTimeout(1400);
  await page.keyboard.press('Tab'); // focus may land elsewhere; check open state via CSS
  const focusedOpen = await page.evaluate(() => {
    const band = document.querySelector('#models a:nth-of-type(1) > div:last-child');
    return band ? getComputedStyle(band).gridTemplateRows : null;
  });

  // Full-section overview
  const tall = await browser.newPage({ viewport: { width: 1600, height: 2900 } });
  tall.on('pageerror', (e) => errors.push(`[pageerror tall] ${e.message}`));
  await tall.goto(url, { waitUntil: 'networkidle' });
  await tall.evaluate(() => document.fonts.ready);
  await tall.waitForTimeout(2200);
  await tall.evaluate(() => window.__lenis?.scrollTo('#models', { duration: 1.4 }));
  await tall.waitForTimeout(2800);
  await tall.screenshot({ path: path.join(outDir, 'models-overview.png') });
  await tall.close();

  // Mobile — bands print open
  const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mob.on('pageerror', (e) => errors.push(`[pageerror mobile] ${e.message}`));
  await mob.goto(url, { waitUntil: 'networkidle' });
  await mob.evaluate(() => document.fonts.ready);
  await mob.waitForTimeout(1500);
  await mob.evaluate(() => window.__lenis?.scrollTo('#models', { immediate: true }));
  await mob.waitForTimeout(1400);
  await mob.screenshot({ path: path.join(outDir, 'models-mobile.png') });
  await mob.close();

  const report = { url, focusedOpenGridTemplateRows: focusedOpen, errors };
  fs.writeFileSync(path.join(outDir, 'models-report.json'), JSON.stringify(report, null, 2));
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
