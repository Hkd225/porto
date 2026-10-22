/** scroll-probe.cjs — where is the page ACTUALLY scrolled during boot? */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const samples = [];
  await page.goto('http://localhost:4173/', { waitUntil: 'commit' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (let i = 0; i < 14; i++) {
    const s = await page.evaluate(() => {
      const y = window.scrollY;
      const el = document.elementFromPoint(195, 422);
      return {
        t: Math.round(performance.now()),
        y,
        docH: document.documentElement.scrollHeight,
        center: el ? (el.className || el.tagName).toString().slice(0, 60) : null,
      };
    }).catch(() => null);
    if (s) samples.push(s);
    await page.waitForTimeout(300);
  }
  console.log(JSON.stringify(samples, null, 1));
  await browser.close();
})();
