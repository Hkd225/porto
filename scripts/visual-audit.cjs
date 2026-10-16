/**
 * Visual + interaction audit.
 *
 *   npm run audit           # requires `npm run build` first (serves ./dist)
 *   npm run audit:serve     # just the preview server
 *
 * Captures desktop / laptop / tablet / mobile screenshots plus a
 * reduced-motion pass, then checks for console errors, horizontal overflow,
 * dead links and broken interactions.
 *
 * This is a development tool. It is not part of the shipped bundle.
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.env.AUDIT_URL || 'http://localhost:4173/';
const OUT = path.resolve(__dirname, '..', 'audit');

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'tablet-834', width: 834, height: 1112 },
  { name: 'mobile-390', width: 390, height: 844 },
];

const SECTIONS = ['#work', '#research', '#writing', '#about', '#contact'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Screenshots are taken with CSS animations disabled and a generous timeout.
 * The hero runs a live canvas trace, so Chromium has no single "settled" frame
 * to grab and the capture takes seconds rather than milliseconds.
 */
const shot = (page, name) =>
  page.screenshot({ path: path.join(OUT, name), animations: 'disabled', timeout: 120000 });

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const report = { url: BASE, runs: [], failures: [] };
  const fail = (m) => report.failures.push(m);

  /* ---------- responsive + error sweep ---------- */
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 300)));
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 300)));

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(3800);
    await shot(page, `${vp.name}-hero.png`);

    for (let i = 0; i < SECTIONS.length; i++) {
      await page.evaluate((s) => {
        const el = document.querySelector(s);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40 });
      }, SECTIONS[i]);
      await sleep(1400);
      await shot(page, `${vp.name}-s${i + 1}${SECTIONS[i]}.png`);
    }

    const overflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      fail(`[${vp.name}] horizontal overflow ${overflow.scrollWidth} > ${overflow.clientWidth}`);
    }
    if (errors.length) fail(`[${vp.name}] ${errors.length} console error(s): ${errors[0]}`);

    report.runs.push({ viewport: vp.name, errors, ...overflow });
    await ctx.close();
  }

  /* ---------- reduced motion ---------- */
  {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(2200);
    await shot(page, 'reduced-motion.png');

    // Content must be visible without running a single animation.
    const hidden = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('main h1, main h2'));
      return els.filter((e) => Number(getComputedStyle(e).opacity) < 0.9).length;
    });
    if (hidden > 0) fail(`[reduced-motion] ${hidden} heading(s) left invisible`);
    if (errors.length) fail(`[reduced-motion] page error: ${errors[0]}`);

    report.runs.push({ viewport: 'reduced-motion', errors, invisibleHeadings: hidden });
    await ctx.close();
  }

  /* ---------- interaction checks ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await sleep(2500);

    await page.keyboard.press('Tab');
    const skip = await page.evaluate(() => document.activeElement.textContent.trim());
    if (!/skip/i.test(skip)) fail(`first tab stop is "${skip}", expected the skip link`);

    await page.click('header nav a[href="#work"]');
    await sleep(1800);
    const nav = await page.evaluate(() => ({
      y: Math.round(window.scrollY),
      active: document.querySelector('header nav a[aria-current="true"]')?.getAttribute('href'),
    }));
    if (nav.y < 500) fail(`anchor nav did not scroll (y=${nav.y})`);
    if (nav.active !== '#work') fail(`active nav not tracking (got ${nav.active})`);

    /* --- project index: search, filter, deep link ---
       Lenis animates every scroll, so the audit drives the field through
       `fill` (which does not wait for the element to be geometrically stable)
       and scrolls deliberately before interacting. */
    await page.evaluate(() =>
      document.querySelector('#project-search').scrollIntoView({ block: 'center' }),
    );
    await sleep(1600);

    const before = await page.evaluate(() => document.querySelectorAll('[data-project-index] [data-slug]').length);
    if (!before) fail('project index rendered no rows');

    await page.fill('#project-search', 'yolo');
    await sleep(500);
    const searched = await page.evaluate(() => document.querySelectorAll('[data-project-index] [data-slug]').length);
    if (searched === 0) fail('project search for "yolo" returned nothing (expected >= 1)');
    if (searched >= before) fail(`project search did not narrow results (${before} -> ${searched})`);

    await page.fill('#project-search', 'zzzznotathing');
    await sleep(400);
    const empty = await page.evaluate(() => document.body.innerText.includes('Nothing matches'));
    if (!empty) fail('project search has no empty state');

    await page.click('button:has-text("Reset")', { force: true });
    await sleep(400);
    const after = await page.evaluate(() => document.querySelectorAll('[data-project-index] [data-slug]').length);
    if (after !== before) fail(`project index reset did not restore all rows (${before} -> ${after})`);

    /* --- category filter --- */
    await page.click('button:has-text("Computer Vision")', { force: true });
    await sleep(500);
    const filtered = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[data-project-index] [data-slug]'));
      return rows.map((r) => r.textContent);
    });
    if (!filtered.length) fail('category filter removed every project');
    if (filtered.length >= before) fail('category filter did not narrow results');
    const stray = filtered.filter((t) => !/Computer Vision/.test(t));
    if (stray.length) fail(`category filter leaked a non-CV project: "${stray[0].slice(0, 60)}"`);
    await page.click('button:has-text("Reset")', { force: true });
    await sleep(400);

    /* --- command palette --- */
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(1200);
    await page.keyboard.press('Control+k');
    await sleep(500);
    const paletteOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (!paletteOpen) fail('Ctrl+K did not open the command palette');

    let hits = 0;
    if (paletteOpen) {
      await page.keyboard.type('cogni');
      await sleep(400);
      hits = await page.evaluate(() => document.querySelectorAll('[role="option"]').length);
      if (hits === 0) fail('palette search for "cogni" returned nothing');
      if (hits > 3) fail(`palette search for "cogni" did not narrow (${hits} results)`);

      const topLabel = await page.evaluate(
        () => document.querySelector('[role="option"]')?.innerText.split('\n')[0] ?? '',
      );
      if (!/cogni/i.test(topLabel)) fail(`palette top hit is "${topLabel}", expected CogniMemory`);

      await page.keyboard.press('ArrowDown');
      await sleep(150);
      await page.keyboard.press('Enter');
      await sleep(1400);
      const closed = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
      if (!closed) fail('palette did not close after selecting a result');
      const hash = await page.evaluate(() => location.hash);
      if (!/^#project-/.test(hash)) fail(`palette selection did not deep-link (hash="${hash}")`);
    }

    /* --- keyboard section jump --- */
    await page.keyboard.press('g');
    await page.keyboard.press('w');
    await sleep(1600);
    const jumped = await page.evaluate(() => Math.round(window.scrollY));
    if (jumped < 500) fail(`"g then w" did not jump to work (y=${jumped})`);

    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll('a[target="_blank"]')).map((a) => a.getAttribute('href')),
    );
    const bad = links.filter((h) => !/^https:\/\//.test(h));
    if (bad.length) fail(`${bad.length} insecure/non-http external link(s): ${bad[0]}`);

    const dead = await page.evaluate(
      () => document.querySelectorAll('a[href="#"], button:not([type]), [href=""]').length,
    );
    if (dead > 0) fail(`${dead} dead placeholder control(s) (href="#" / untyped button)`);

    const skips = await page.evaluate(() =>
      Array.from(document.querySelectorAll('h1,h2,h3,h4'))
        .map((h) => Number(h.tagName[1]))
        .reduce((acc, lvl) => { if (acc.length && lvl - acc[acc.length - 1] > 1) acc.push(lvl); return acc; }, []),
    );
    if (skips.length) fail(`heading level skipped: ${skips.join(', ')}`);

    report.interactions = {
      skipLink: skip,
      ...nav,
      projectIndex: { all: before, searched, afterReset: after, filtered: filtered.length },
      palette: { opened: paletteOpen, hits },
      shortcuts: { jumpedTo: jumped },
      externalLinks: links.length,
      deadControls: dead,
    };
    await ctx.close();
  }

  /* ---------- mobile drawer ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    /* Wait for the intro overlay to unmount. It covers the viewport at z-200,
       so interacting before it is gone is not a drawer bug. */
    await page
      .waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 20000 })
      .catch(() => fail('intro overlay never unmounted'));
    await sleep(600);
    await page.click('button[aria-controls="mobile-nav"]');
    await sleep(900);
    const open = await page.evaluate(() => {
      const d = document.querySelector('#mobile-nav');
      return { visible: !d.hidden, focusInside: d.contains(document.activeElement) };
    });
    if (!open.visible) fail('mobile drawer did not open');
    if (!open.focusInside) fail('mobile drawer did not move focus inside (keyboard trap risk)');

    await page.keyboard.press('Escape');
    await sleep(700);
    const closed = await page.evaluate(() => ({
      hidden: document.querySelector('#mobile-nav').hidden,
      scrollRestored: document.body.style.overflow === '',
    }));
    if (!closed.hidden) fail('Escape did not close the mobile drawer');
    if (!closed.scrollRestored) fail('body scroll left locked after closing the drawer');

    report.drawer = { ...open, ...closed };
    await ctx.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 1));
  console.log('\n' + (report.failures.length ? `FAILED:\n - ${report.failures.join('\n - ')}` : 'ALL CHECKS PASSED'));
  process.exit(report.failures.length ? 1 : 0);
})();