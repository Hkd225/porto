/** rotating-peek.cjs — catch the RotatingText row mid-cycle on mobile. */
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
  await page.waitForTimeout(4200);

  for (let i = 0; i < 6; i++) {
    await page.screenshot({ path: path.join(OUT, `rot-${i}.png`), clip: { x: 0, y: 400, width: 390, height: 260 } });
    await page.waitForTimeout(560);
  }
  /* what does the DOM say? */
  const probe = await page.evaluate(() => {
    const wrap = [...document.querySelectorAll('main section')][0];
    const row = wrap?.querySelector('.num')?.parentElement;
    return {
      rowHTML: row
        ? row.innerHTML.replace(/\s+/g, ' ').slice(0, 400)
        : null,
      rowBox: row ? row.getBoundingClientRect().toJSON() : null,
    };
  });
  console.log(JSON.stringify(probe, null, 1));
  await browser.close();
})();
