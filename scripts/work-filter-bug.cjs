/**
 * work-filter-bug.cjs — reproduce the "blink downward" when switching Work
 * filters (Agentic AI → Machine Learning). Measures scrollY, document
 * height and the Work/pill offsets before and after each click so a jump
 * is quantified, not guessed.
 *
 * Usage: node scripts/work-filter-bug.cjs [url]
 * Output: %TEMP%/porto-audit/wf-*.png + console measurements.
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
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1800);

  const snap = async (label) => {
    const r = await page.evaluate((l) => {
      const work = document.querySelector('#work');
      const pills = document.querySelector('#work .flex.flex-wrap');
      return {
        label: l,
        scrollY: Math.round(window.scrollY),
        docHeight: document.documentElement.scrollHeight,
        workTop: Math.round(work.getBoundingClientRect().top + window.scrollY),
        pillsTop: pills ? Math.round(pills.getBoundingClientRect().top + window.scrollY) : null,
      };
    }, label);
    console.log(JSON.stringify(r));
    return r;
  };

  await page.evaluate(() => window.__lenis?.scrollTo('#work', { duration: 1.2 }));
  await page.waitForTimeout(2200);
  await snap('rest-all');
  await page.screenshot({ path: path.join(outDir, 'wf-rest.png') });

  const pill = (name) => page.locator('#work button', { hasText: name }).first();
  await pill('Agentic AI').click();
  await page.waitForTimeout(1400);
  await snap('after-agentic');
  await page.screenshot({ path: path.join(outDir, 'wf-agentic.png') });

  await pill('Machine Learning').click();
  await page.waitForTimeout(250);
  await snap('ml-mid-glide');
  await page.screenshot({ path: path.join(outDir, 'wf-ml-mid.png') });
  await page.waitForTimeout(1200);
  await snap('after-ml');
  await page.screenshot({ path: path.join(outDir, 'wf-ml.png') });

  /* settle longer — catch a late jump (lenis easing, late refresh) */
  await page.waitForTimeout(2500);
  await snap('after-ml-settle');

  console.log(JSON.stringify({ errors }, null, 2));
  await browser.close();
})();
