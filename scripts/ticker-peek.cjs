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

  /* Hover: the loop renders off-screen copies too — pick an item whose box
     sits inside the viewport, hover it, probe the tip, clip a closeup. */
  const boxes = await page
    .locator('.logoloop__item')
    .evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, w: r.width, h: r.height };
      }),
    );
  const on = boxes.find((r) => r.h > 0 && r.x > 240 && r.x < 1100);
  if (on) {
    await page.mouse.move(on.x + on.w / 2, on.y + on.h / 2);
    await page.waitForTimeout(500);
    const probe = await page.evaluate(() => {
      const hovered = document.querySelector('.logoloop__item:hover');
      if (!hovered) return 'no :hover item';
      const tip = hovered.querySelector('.logoloop__tip');
      if (!tip) return 'no tip element';
      const cs = getComputedStyle(tip);
      const r = tip.getBoundingClientRect();
      return { text: tip.textContent, opacity: cs.opacity, color: cs.color, visible: r.width > 0 && r.bottom <= innerHeight };
    });
    console.log('tip probe:', JSON.stringify(probe));
    await page.screenshot({
      path: path.join(outDir, 'ticker-hover.png'),
      clip: { x: on.x - 160, y: Math.max(0, on.y - 70), width: 420, height: on.h + 130 },
    });
  }
  await browser.close();
  console.log('ticker shots written');
})();
