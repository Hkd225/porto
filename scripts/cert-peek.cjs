/**
 * cert-peek.cjs — visual + interaction audit for the Certificates section.
 *
 * Captures the built site at three widths (desktop, narrow desktop for the
 * navbar, phone), counts registry rows, and drags the ring to prove the
 * interaction responds. Screenshots land in %TEMP%\porto-audit.
 */
const { chromium } = require('playwright');
const path = require('node:path');
const os = require('node:os');

const BASE = 'http://localhost:4173';
const OUT = path.join(os.tmpdir(), 'porto-audit');

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  const shoot = async (name, width, height, { scroll = '#certificates', settle = 3200 } = {}) => {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 2 });
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${name}] ${m.type()}: ${m.text().slice(0, 180)}`);
    });
    page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${String(e).slice(0, 220)}`));
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
    await page.evaluate((sel) => {
      document.querySelector(sel)?.scrollIntoView({ block: 'start' });
    }, scroll);
    await page.waitForTimeout(settle);
    await page.screenshot({ path: path.join(OUT, `cert-${name}.png`) });

    /* facts: registry rows + the ring's live counter */
    const rows = await page.locator('#certificates ol > li').count();
    const live = await page.locator('#certificates .circular-carousel__live').textContent().catch(() => '(none)');
    console.log(`${name}: registry rows=${rows}, ring live="${live?.trim()}"`);
    return page;
  };

  /* 1 — desktop: look, then drag the ring like a reader would */
  const desktop = await shoot('desktop-1400', 1400, 900);
  const ring = desktop.locator('#certificates .circular-carousel');
  const box = await ring.boundingBox();
  const before = (await desktop.locator('#certificates .circular-carousel__live').textContent())?.trim();
  await desktop.mouse.move(box.x + box.width * 0.66, box.y + box.height * 0.42);
  await desktop.mouse.down();
  for (let i = 0; i < 14; i++) {
    await desktop.mouse.move(box.x + box.width * 0.66 - i * 26, box.y + box.height * 0.42, { steps: 2 });
    await desktop.waitForTimeout(24);
  }
  await desktop.mouse.up();
  await desktop.waitForTimeout(1600);
  const after = (await desktop.locator('#certificates .circular-carousel__live').textContent())?.trim();
  console.log(`drag: "${before}" -> "${after}" (${before === after ? 'NO MOVE' : 'ring moved'})`);
  await desktop.screenshot({ path: path.join(OUT, 'cert-desktop-dragged.png') });
  await desktop.close();

  /* 2 — narrow desktop: does the 6th nav label still fit? */
  const narrow = await shoot('narrow-1024', 1024, 768, { settle: 2000 });
  await narrow.evaluate(() => window.scrollTo(0, 0));
  await narrow.waitForTimeout(700);
  await narrow.screenshot({ path: path.join(OUT, 'cert-navbar-1024.png') });
  await narrow.close();

  /* 3 — phone */
  const mobile = await shoot('mobile-390', 390, 844);
  await mobile.close();

  /* 4 — nav jump: click the new label, confirm it lands on the section */
  const nav = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await nav.goto(BASE, { waitUntil: 'networkidle', timeout: 45000 });
  await nav.getByRole('button', { name: 'Certificates', exact: true }).first().click();
  await nav.waitForTimeout(1400);
  const y = await nav.evaluate(() => location.hash);
  const heading = await nav.evaluate(() => {
    const el = document.getElementById('certificates');
    if (!el) return 'MISSING';
    const r = el.getBoundingClientRect();
    return Math.round(r.top);
  });
  console.log(`nav click: hash=${y || '(none)'} section top=${heading}px`);
  await nav.close();

  await browser.close();
  console.log(errors.length ? `console issues:\n${errors.join('\n')}` : 'console clean');
})();
