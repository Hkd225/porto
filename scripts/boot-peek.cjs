/**
 * boot-peek.cjs — capture the boot veil's four beats.
 * Snaps early (on 'commit', before the veil finishes) then at staged
 * times: counter climbing, curtain mid-lift (hero statement joining),
 * and the fully revealed page.
 *
 * Usage: node scripts/boot-peek.cjs [url]
 */

const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const OUT = path.join(os.tmpdir(), 'porto-audit');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  /* headful — the headless build's screenshot pipeline planes the topmost
     fixed layer wrong AND warps animation clocks; a real window composites
     exactly like the visitor's browser */
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  /* this headless build defaults to reduced motion — emulate a visitor
     who allowed it, otherwise the whole boot ballet is (correctly) skipped */
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'info' && m.text().includes('[boot]')) console.log('  ', m.text());
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(url, { waitUntil: 'commit' });
  const probe = () =>
    page.evaluate(() => {
      const veil = document.querySelector('[role="presentation"]');
      const cs = veil ? getComputedStyle(veil) : null;
      return {
        veil: !!veil,
        opacity: cs?.opacity,
        clip: cs?.clipPath,
        zIndex: cs?.zIndex,
        bg: cs?.backgroundColor,
        text: veil?.textContent?.replace(/\s+/g, ' ').slice(0, 60) ?? '',
        overflow: document.documentElement.style.overflow,
      };
    });

  await page.waitForTimeout(400);
  console.log('t≈0.4:', await probe());
  await page.screenshot({ path: path.join(OUT, 'boot-0-veil.png') });

  await page.waitForTimeout(850);
  console.log('t≈1.25:', await probe());
  await page.screenshot({ path: path.join(OUT, 'boot-1-count.png') });

  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'boot-2-lift.png') });

  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, 'boot-3-revealed.png') });

  const veilGone = await page.evaluate(() => !document.querySelector('[role="presentation"]'));
  console.log('veil unmounted by t~3.5s:', veilGone);
  console.log('console errors:', errors.length ? errors : 'none');

  await browser.close();
})();
