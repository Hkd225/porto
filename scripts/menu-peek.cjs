/** menu-peek.cjs — the mobile menu open + the hero's first seconds. */
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const OUT = os.tmpdir() + '/porto-audit';

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

  /* hero the moment the veil clears, then at rest */
  for (const t of [2900, 3300, 3700]) {
    const wait = t - (await page.evaluate(() => performance.now()));
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(OUT, `hero-t${t}.png`) });
  }

  /* the open mobile menu (opaque?) */
  await page.tap('header button[aria-haspopup], header button[aria-expanded]');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'm-menu.png') });

  /* scroll a little, menu closed — the navbar's scrolled face */
  await page.tap('header button[aria-expanded="true"]');
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const l = window.__lenis;
    const el = document.getElementById('work');
    if (l && el) l.scrollTo(el, { immediate: true });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'm-navbar-scrolled.png') });
  console.log('menu + hero captured');
  await browser.close();
})();
