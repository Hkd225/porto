/* Screenshot every scene of the page for visual review. */
const { chromium } = require('playwright');
const fs = require('fs');

const BASE = 'http://localhost:4173';
const OUT = process.argv[2] || 'C:/Users/muham/AppData/Local/Temp/opencode/shots';

const SPOTS = [
  ['00-hero', 0, 2400],
  ['01-ticker', 780, 1400],
  ['02-interlude-rest', 900, 1800],
  ['03-interlude-open', 2150, 1600],
  ['04-work-head', 3250, 2000],
  ['05-work-grid', 3900, 2000],
  ['06-work-grid-2', 5000, 2000],
  ['07-explorer', 6900, 1600],
  ['08-band', null, 2000],
  ['09-casestudy', 9600, 2000],
  ['10-models', 12600, 2000],
  ['11-gallery', 14400, 2000],
  ['12-writing', 16300, 2000],
  ['13-about', 18500, 2000],
  ['14-contact', 21600, 2200],
  ['15-footer', null, 2200],
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page
    .waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 25000 })
    .catch(() => {});
  await page.waitForTimeout(1600);

  const doc = await page.evaluate(() => document.body.scrollHeight);
  const vh = await page.evaluate(() => window.innerHeight);

  for (const [name, y, settle] of SPOTS) {
    let target = y;
    if (target === null && name === '08-band') target = await page.evaluate(() => { const el = document.getElementById('covers'); return el ? el.offsetTop + 40 : 0; });
    if (target === null) target = doc - vh;
    await page.evaluate((v) => window.scrollTo({ top: v, behavior: 'instant' }), Math.max(0, Math.min(target, doc - vh)));
    await page.waitForTimeout(settle);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(`shot ${name} @${Math.round(await page.evaluate(() => window.scrollY))}`);
  }
  await browser.close();
})();
