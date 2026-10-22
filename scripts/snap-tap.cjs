/** snap-tap.cjs — tapping the second MethodSnap card: horizontal centering
 *  only; the page's vertical scroll must not move. */
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const OUT = path.join(os.tmpdir(), 'porto-audit');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://localhost:4173/', { waitUntil: 'commit' });
  await page.waitForTimeout(4200); /* boot fully lifted */

  await page.evaluate(() => {
    const l = window.__lenis;
    const el = document.getElementById('method');
    if (l && el) l.scrollTo(el, { immediate: true });
    else if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  });
  await page.waitForTimeout(800);

  const before = await page.evaluate(() => ({
    y: window.scrollY,
    row: document.querySelector('[data-lenis-prevent]')?.scrollLeft ?? null,
  }));

  /* tap the second card */
  await page.evaluate(() => {
    const row = document.querySelector('[data-lenis-prevent]');
    const cards = row ? [...row.querySelectorAll('button')] : [];
    if (cards[1]) cards[1].click();
  });
  await page.waitForTimeout(900);

  const after = await page.evaluate(() => ({
    y: window.scrollY,
    row: document.querySelector('[data-lenis-prevent]')?.scrollLeft ?? null,
  }));
  console.log('before', JSON.stringify(before), 'after', JSON.stringify(after));

  await page.screenshot({ path: path.join(OUT, 'm-snap-tap.png') });
  console.log('snap tap captured');
  await browser.close();
})();
