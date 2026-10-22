/** desktop-method-peek.cjs — prove the desktop accordion survived the mobile snap swap. */
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const OUT = path.join(os.tmpdir(), 'porto-audit');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('http://localhost:4173/', { waitUntil: 'commit' });
  await page.waitForTimeout(3900); /* boot veil fully lifted before scrolling */
  await page.evaluate(() => {
    const l = window.__lenis;
    const el = document.getElementById('method');
    if (l && el) l.scrollTo(el, { immediate: true });
    else if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, 'd-method.png') });
  console.log('desktop method captured');
  await browser.close();
})();
