/* Screenshot by section anchor — pinned scenes make absolute Y drift. */
const { chromium } = require('playwright');
const BASE = 'http://localhost:4173';
const ANCHORS = ['covers', 'research', 'models', 'gallery', 'writing', 'about', 'contact'];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page
    .waitForSelector('[role="status"][aria-label="Loading portfolio"]', { state: 'detached', timeout: 25000 })
    .catch(() => {});
  await page.waitForTimeout(1600);

  for (const id of ANCHORS) {
    await page.evaluate((i) => document.getElementById(i)?.scrollIntoView({ block: 'start' }), id);
    await page.waitForTimeout(2200);
    await page.screenshot({ path: `C:/Users/muham/AppData/Local/Temp/opencode/shots/A-${id}-top.png` });
    // and a half-view deeper look
    await page.evaluate(() => window.scrollBy({ top: Math.round(window.innerHeight * 0.75), behavior: 'instant' }));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `C:/Users/muham/AppData/Local/Temp/opencode/shots/A-${id}-deep.png` });
    console.log(`${id} ok`);
  }
  await browser.close();
})();
