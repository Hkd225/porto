/** Screenshot the bottom of the #work section (the SlicedWaves band). */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(4000);

  // Walk the page so triggers settle, then land on the bottom of #work.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 260));
    }
  });

  await page.evaluate(() => {
    const work = document.getElementById('work');
    const r = work.getBoundingClientRect();
    window.scrollTo(0, window.scrollY + r.bottom - window.innerHeight + 60);
  });
  await page.waitForTimeout(1800);

  const probe = await page.evaluate(() => {
    const section = document.getElementById('work');
    const layer = section.querySelector(':scope > div[aria-hidden="true"]');
    const info = { children: [] };
    if (layer) {
      for (const child of layer.children) {
        const r = child.getBoundingClientRect();
        const cs = getComputedStyle(child);
        info.children.push({
          cls: child.className.slice(0, 80),
          height: { rect: +r.height.toFixed(1), computed: cs.height, position: cs.position },
          canvas: (() => {
            const c = child.querySelector?.('canvas');
            return c ? { w: c.width, h: c.height } : null;
          })(),
          background: cs.backgroundImage.slice(0, 110),
        });
      }
    }
    return info;
  });
  console.log(JSON.stringify(probe, null, 2));
  const name = process.argv[2] || 'work-band-a.png';
  await page.screenshot({ path: `${process.env.TEMP || '.'}/porto-audit/${name}` });
  await browser.close();
  console.log('saved', name);
})().catch(err => { console.error('FAILED:', err); process.exit(1); });
