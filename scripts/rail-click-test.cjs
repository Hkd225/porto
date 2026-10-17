/** Click the fifth rail row and verify the scroller lands in chapter 05. */
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3500);

  await page.locator('nav[aria-label="Focus chapters"] button').nth(4).click();
  await page.waitForTimeout(2600);

  const state = await page.evaluate(() => {
    const rail = document.querySelector('nav[aria-label="Focus chapters"]');
    const current = rail ? rail.querySelector('[aria-current]') : null;
    return {
      scrollY: Math.round(window.scrollY),
      active: current ? current.textContent.slice(0, 30) : null,
    };
  });
  console.log(JSON.stringify(state));
  await page.screenshot({ path: process.env.TEMP + '/porto-audit/rail-click.png' });
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
