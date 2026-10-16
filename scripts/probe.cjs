/**
 * Deep health probe. Goes further than visual-audit: walks the whole page at
 * several viewports, exercises every interaction, and reports console noise,
 * overflow, layout thrash and leftover GSAP state.
 *
 *   node scripts/probe.cjs
 */

const { chromium } = require('playwright');

const BASE = process.env.PROBE_URL || 'http://localhost:4173/';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const VIEWPORTS = [
  { name: 'desktop-1920', width: 1920, height: 1080 },
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'laptop-1280', width: 1280, height: 800 },
  { name: 'laptop-1152', width: 1152, height: 720 },
  { name: 'tablet-834', width: 834, height: 1112 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-320', width: 320, height: 568 },
];

const SECTIONS = ['index', 'method', 'work', 'covers', 'research', 'models', 'gallery', 'writing', 'about', 'contact'];

const problems = [];
const note = (m) => problems.push(m);

(async () => {
  const browser = await chromium.launch();

  /* ---------- responsive sweep ---------- */
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 240)));
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 240)));

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await page
      .waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 25000 })
      .catch(() => note(`[${vp.name}] intro overlay never unmounted`));
    await sleep(1200);

    /* walk the page */
    for (const id of SECTIONS) {
      await page.evaluate((s) => {
        const el = document.getElementById(s);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY });
      }, id);
      await sleep(900);
    }

    const metrics = await page.evaluate(() => {
      const de = document.documentElement;
      const over = [];

      /* elements sticking out horizontally that are not inside a clipper */
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.right > de.clientWidth + 1) {
          let clipped = false;
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            if (getComputedStyle(p).overflowX !== 'visible') { clipped = true; break; }
          }
          if (!clipped) {
            over.push(`${el.tagName}.${String(el.className).slice(0, 50)} right=${Math.round(r.right)}`);
          }
        }
      }

      /* fixed elements that are not where they should be */
      const stray = [];
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (cs.position !== 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (cs.pointerEvents === 'none' || el.getAttribute('aria-hidden') === 'true') continue;
        if (r.left < -2 || r.top < -2 || r.right > de.clientWidth + 2 || r.bottom > de.clientHeight + 2) {
          stray.push(`${el.tagName}.${String(el.className).slice(0, 40)} [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}x${Math.round(r.height)}]`);
        }
      }

      /* focusables outside the viewport.
         Elements inside a horizontally scrollable strip or a scrubbed track are
         excluded: they are meant to sit outside the viewport and are reached by
         scrolling sideways, so flagging them would be noise, not a finding. */
      const inHorizontalFlow = (el) => {
        for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
          const o = getComputedStyle(p);
          if (o.overflowX === 'auto' || o.overflowX === 'scroll') return true;
          if (p.hasAttribute('data-project-index')) return true;
        }
        return !!el.closest('#covers');
      };
      const focusables = document.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])');
      const offscreen = [];
      for (const el of focusables) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        if (inHorizontalFlow(el)) continue;
        if (r.right > de.clientWidth + 2 || r.left < -2) {
          offscreen.push(`${el.tagName}[${(el.textContent || '').trim().slice(0, 24)}] right=${Math.round(r.right)}`);
        }
      }

      return {
        clientWidth: de.clientWidth,
        scrollWidth: de.scrollWidth,
        docHeight: de.scrollHeight,
        over: over.slice(0, 5),
        stray: stray.slice(0, 5),
        offscreen: offscreen.slice(0, 5),
        focusableCount: focusables.length,
      };
    });

    if (metrics.scrollWidth > metrics.clientWidth + 1) {
      note(`[${vp.name}] horizontal overflow ${metrics.scrollWidth} > ${metrics.clientWidth}`);
    }
    if (metrics.over.length) note(`[${vp.name}] unclipped overflow: ${metrics.over.join(' | ')}`);
    if (metrics.stray.length) note(`[${vp.name}] stray fixed element: ${metrics.stray.join(' | ')}`);
    if (metrics.offscreen.length) note(`[${vp.name}] focusable offscreen: ${metrics.offscreen.join(' | ')}`);
    if (errors.length) note(`[${vp.name}] console: ${errors.slice(0, 2).join(' | ')}`);

    console.log(
      `${vp.name.padEnd(14)} doc=${String(metrics.docHeight).padStart(6)}  ` +
        `overflow=${metrics.scrollWidth - metrics.clientWidth}  focusable=${metrics.focusableCount}  errors=${errors.length}`,
    );
    await ctx.close();
  }

  /* ---------- interaction pass ---------- */
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text().slice(0, 200)));
    page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message.slice(0, 200)));

    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page
      .waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 25000 })
      .catch(() => {});
    await sleep(1200);

    /* cursor trail */
    await page.mouse.move(300, 300);
    await page.mouse.move(900, 600, { steps: 25 });
    await sleep(120);
    const trail = await page.evaluate(() => {
      const dots = document.querySelectorAll('.cursor-trail-dot');
      if (!dots.length) return { n: 0 };
      const host = dots[0].parentElement;
      return { n: dots.length, opacity: getComputedStyle(host).opacity };
    });
    if (!trail.n) note('cursor trail produced no dots');
    await sleep(900);
    const trailIdle = await page.evaluate(() => {
      const dots = document.querySelectorAll('.cursor-trail-dot');
      return dots.length ? Number(getComputedStyle(dots[0].parentElement).opacity) : -1;
    });
    if (trailIdle > 0.2) note(`cursor trail did not fade when idle (opacity ${trailIdle})`);

    /* hover preview swap — see below for why the band is used. */

    /* A swap is only observable with two targets on screen at once. The
       featured cards are nearly a full viewport tall, so a 1440x900 window
       shows one at a time; the horizontal band shows four. Test there. */
    await page.evaluate(() => document.getElementById('covers').scrollIntoView({ block: 'start' }));
    await sleep(1800);
    const bandBoxes = await page.$$eval('#covers article', (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width) };
      }),
    );
    const visible = bandBoxes
      .map((b, i) => ({ i, ...b }))
      .filter((b) => b.y > 100 && b.y < 800 && b.x > -50 && b.x < 1440);
    if (visible.length >= 2) {
      await page.mouse.move(visible[0].x + visible[0].w / 2, visible[0].y + 160, { steps: 8 });
      await sleep(600);
      /* Read only the visible panel. Reading the wrapper returns the outgoing and
       incoming content concatenated, which is identical before and after a
       correct swap. */
    const visibleText = () =>
      page.evaluate(() => {
        const box = document.querySelector('div.w-\\[19rem\\]');
        if (!box) return '';
        const rows = Array.from(box.children)
          .map((c) => ({ c, op: Number(getComputedStyle(c).opacity) }))
          .filter((r) => r.op > 0.5)
          .sort((a, b) => b.op - a.op);
        return rows.length ? rows[0].c.innerText.replace(/\n/g, ' ') : '';
      });

    const first = await visibleText();
      await page.mouse.move(visible[1].x + visible[1].w / 2, visible[1].y + 160, { steps: 8 });
      await sleep(800);
      const second = await visibleText();
      if (!first || !second) note('hover preview did not render');
      else if (first === second) note('hover preview did not swap between two different projects');
    } else {
      note('could not get two featured cards on screen at once');
    }

    /* FLIP */
    await page.evaluate(() => document.querySelector('#project-search').scrollIntoView({ block: 'center' }));
    await sleep(1200);
    await page.click('button:has-text("Computer Vision")', { force: true });
    await sleep(120);
    const mid = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-flip]')).some((e) => getComputedStyle(e).transform !== 'none'),
    );
    await sleep(1200);
    const settled = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[data-flip]')).every((e) => {
        const t = getComputedStyle(e).transform;
        return t === 'none' || t === 'matrix(1, 0, 0, 1, 0, 0)';
      }),
    );
    if (!mid) note('FLIP: rows did not move after filtering');
    if (!settled) note('FLIP: rows did not settle back to identity');

    /* palette */
    await page.evaluate(() => window.scrollTo({ top: 0 }));
    await sleep(1000);
    await page.keyboard.press('Control+k');
    await sleep(500);
    const opened = await page.evaluate(() => !!document.querySelector('[role="dialog"]'));
    if (!opened) note('Ctrl+K did not open the palette');
    await page.keyboard.type('cogni', { delay: 30 });
    await sleep(400);
    const hits = await page.evaluate(() => document.querySelectorAll('[role="option"]').length);
    const typed = await page.inputValue('#palette-input');
    if (typed !== 'cogni') note(`palette input lost characters (got "${typed}")`);
    if (hits === 0 || hits > 3) note(`palette search returned ${hits} hits for "cogni"`);
    await page.keyboard.press('Enter');
    await sleep(1500);
    const hash = await page.evaluate(() => location.hash);
    if (!/^#project-/.test(hash)) note(`palette selection did not deep-link (hash "${hash}")`);

    /* reduced motion */
    {
      const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      const rp = await rm.newPage();
      const rmErrors = [];
      rp.on('pageerror', (e) => rmErrors.push(e.message.slice(0, 200)));
      await rp.goto(BASE, { waitUntil: 'networkidle' });
      await sleep(2500);
      const rmState = await rp.evaluate(() => ({
        preloader: !!document.querySelector('[role="status"][aria-label="Loading portfolio"]'),
        curtain: document.querySelectorAll('.absolute.inset-0.flex.scale-y-0').length,
        trail: document.querySelectorAll('.cursor-trail-dot').length,
        headingOpacity: Array.from(document.querySelectorAll('main h1, main h2'))
          .map((h) => Number(getComputedStyle(h).opacity))
          .filter((o) => o < 0.9).length,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      }));
      if (rmState.preloader) note('[reduced-motion] preloader still mounted');
      if (rmState.curtain) note(`[reduced-motion] ${rmState.curtain} curtain panels still mounted`);
      if (rmState.trail) note('[reduced-motion] cursor trail still mounted');
      if (rmState.headingOpacity) note(`[reduced-motion] ${rmState.headingOpacity} heading(s) hidden`);
      if (rmState.overflow > 1) note(`[reduced-motion] overflow ${rmState.overflow}`);
      if (rmErrors.length) note(`[reduced-motion] ${rmErrors[0]}`);
      console.log('reduced-motion ', JSON.stringify(rmState));
      await rm.close();
    }

    if (errors.length) note(`[interactions] console: ${errors.slice(0, 2).join(' | ')}`);
    await ctx.close();
  }

  /* ---------- frame health ---------- */
  /* Launched HEADED on purpose. A frame-rate audit is an audit of the display
     pipeline, and headless Chromium has none worth calling one: no GPU
     process, so every frame is drawn by the software compositor —
     DirectRenderer::DrawFrame saturates its CPU pool and what gets measured is
     the host machine's raster throughput, not the page (measured on this very
     page: p95 100ms headless vs p95 12ms headed, identical build). Headed
     keeps the window bounded but the compositor real, so this stage measures
     what a user's browser measures. */
  {
    const gpuBrowser = await chromium.launch({ headless: false });
    const ctx = await gpuBrowser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 25000 }).catch(() => {});
    await sleep(1200);

    await page.evaluate(() => {
      window.__frames = [];
      let last = performance.now();
      const tick = (t) => { window.__frames.push(t - last); last = t; requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    await page.mouse.move(400, 300);
    await page.mouse.wheel(0, 6000);
    await sleep(2500);
    const frames = await page.evaluate(() => window.__frames.slice(10));
    const sorted = [...frames].sort((a, b) => a - b);
    const p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    const worst = sorted[sorted.length - 1] || 0;
    const dropped = frames.filter((f) => f > 34).length;
    console.log(`frames          n=${frames.length}  p95=${p95.toFixed(1)}ms  worst=${worst.toFixed(1)}ms  dropped>34ms=${dropped}`);
    if (dropped > frames.length * 0.08) note(`frame drops during fast scroll: ${dropped}/${frames.length}`);

    const filter = await page.evaluate(() => getComputedStyle(document.querySelector('main')).filter);
    const lingering = await page.evaluate(() => {
      const m = document.querySelector('main');
      return { filter: m.style.filter, transform: m.style.transform, willChange: m.style.willChange };
    });
    console.log('after scroll    ', JSON.stringify({ filter, ...lingering }));
    if (lingering.willChange) note(`will-change left on <main> after settling: ${lingering.willChange}`);

    await ctx.close();
    await gpuBrowser.close();
  }

  await browser.close();

  console.log('\n' + '='.repeat(56));
  if (problems.length) {
    console.log(`FOUND ${problems.length} PROBLEM(S):`);
    problems.forEach((p) => console.log(' - ' + p));
  } else {
    console.log('NO PROBLEMS FOUND');
  }
})();