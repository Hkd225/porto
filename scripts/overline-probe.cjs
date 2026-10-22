/** overline-probe.cjs — what draws those rules around the hero overline? */
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
  await page.waitForTimeout(4300);

  const info = await page.evaluate(() => {
    const el = document.querySelector('main .overline');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    /* what sits at the top rule line just above the element? */
    const above = document.elementFromPoint(195, r.top - 8);
    return {
      box: { top: Math.round(r.top), h: Math.round(r.height) },
      border: `${cs.borderTopWidth} ${cs.borderTopStyle}`,
      deco: `${cs.textDecorationLine} ${cs.textDecorationStyle}`,
      bg: cs.backgroundColor,
      parent: el.parentElement.className,
      parentBorder: getComputedStyle(el.parentElement).borderTopWidth,
      elementAbove: above ? `${above.tagName}.${above.className}`.slice(0, 80) : null,
    };
  });
  console.log(JSON.stringify(info, null, 1));

  await page.screenshot({
    path: path.join(OUT, 'overline-clip.png'),
    clip: { x: 0, y: 120, width: 390, height: 220 },
  });
  console.log('overline clip captured');
  await browser.close();
})();
