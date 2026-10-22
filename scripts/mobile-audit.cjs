/**
 * mobile-audit.cjs — the phone's eye on the site.
 *
 * 390x844 @2x, touch, motion allowed. Waits for the boot veil to lift,
 * then walks every tracked section (plus Focus and Manifesto which have
 * no nav slot) and screenshots each at rest — the scrub scenes get a
 * settle beat. Output: %TEMP%\porto-audit\m-*.png
 *
 * Usage: node scripts/mobile-audit.cjs [url]
 */

const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const OUT = path.join(os.tmpdir(), 'porto-audit');
fs.mkdirSync(OUT, { recursive: true });

const SECTIONS = ['index', 'method', 'work', 'models', 'writing', 'about', 'contact'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(url, { waitUntil: 'commit' });
  /* let the boot veil finish (tap-through if needed) */
  await page.waitForTimeout(4500);

  for (const id of SECTIONS) {
    const shot = path.join(OUT, `m-${id}.png`);
    try {
      await page.evaluate((sid) => {
        const el = document.getElementById(sid);
        if (!el) throw new Error(`no section #${sid}`);
        const l = window.__lenis;
        if (l) l.scrollTo(el, { immediate: true });
        else window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY);
      }, id);
      /* scrub scenes settle */
      await page.waitForTimeout(900);
      await page.screenshot({ path: shot });
    } catch (e) {
      console.log(`skip ${id}: ${e?.message}`);
    }
  }

  /* the assistant panel open — the dock's other face */
  try {
    await page.evaluate(() => {
      const l = window.__lenis;
      if (l) l.scrollTo(0, { immediate: true });
      else window.scrollTo(0, 0);
    });
    await page.waitForTimeout(400);
    await page.tap('button[aria-controls="ai-panel"]');
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, 'm-ai-panel.png') });
  } catch (e) {
    console.log(`skip ai-panel: ${e?.message}`);
  }

  console.log('console errors:', errors.length ? errors : 'none');
  await browser.close();
})();
