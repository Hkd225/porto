/**
 * focus-peek — audits the pinned Focus scene: FlowingMenu band glides
 * with scroll, pointer steers it inside the menu, clicking a row jumps
 * the Lenis scroller, and the ghost numeral swaps behind the menu.
 * Usage: node scripts/focus-peek.cjs [url]
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
  await page.waitForTimeout(1200);

  /* Chapter 3 midpoint (index 2): scroll owns the band. */
  await page.evaluate(() => {
    const stage = document.querySelector('section[aria-label="Focus areas"]');
    const top = stage.getBoundingClientRect().top + window.scrollY;
    window.__lenis?.scrollTo(top + 2.5 * 620, { immediate: true });
  });
  await page.waitForTimeout(1700);
  await page.screenshot({ path: path.join(outDir, 'focus-ch3.png') });

  /* Hover: the band follows the pointer inside the menu. */
  const rows = await page
    .locator('.flowing-menu__item')
    .evaluateAll((els) =>
      els
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        })
        .filter((r) => r.h > 0 && r.w > 0 && r.x > 600 && r.x < 1600),
    );
  const row = rows[Math.floor(rows.length / 2)];
  let hoverLabel = '';
  if (row) {
    await page.mouse.move(row.x + row.w / 2, row.y + row.h / 2);
    await page.waitForTimeout(800);
    hoverLabel = await page.evaluate(() => {
      const hovered = document.querySelector('.flowing-menu__item:hover');
      return hovered ? hovered.querySelector('.flowing-menu__label-text')?.textContent ?? '?' : 'no hover';
    });
    await page.screenshot({ path: path.join(outDir, 'focus-hover.png'), clip: { x: row.x - 220, y: Math.max(0, row.y - 140), width: 720, height: row.h + 240 } });
  }

  /* Click row 3 — the menu should walk the scroller to chapter 3. */
  await page.locator('.flowing-menu__link').nth(2).click();
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(outDir, 'focus-click.png') });
  const counter = await page.evaluate(() => {
    const nodes = [...document.querySelectorAll('.text-accent')];
    return nodes.find((n) => /\d{2} \/ \d{2}/.test(n.textContent || ''))?.textContent?.trim() ?? '?';
  });
  console.log(JSON.stringify({ hoverLabel, counterAfterClick: counter }));

  await browser.close();
  console.log('focus shots written');
})();
