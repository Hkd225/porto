/**
 * cpu-probe.cjs — how much CPU does the portfolio itself burn while the
 * page sits IDLE in a real (headful, GPU-accelerated) browser? For each
 * zone the whole Playwright chromium process tree's cumulative CPU time
 * is sampled across a 4s window: delta / (4s * cores) = % of the machine.
 * Headless is unusable here (software GL rasterises on CPU and would
 * report a fantasy number), so a real window opens for the probe.
 *
 * Usage: node scripts/cpu-probe.cjs [url]
 */
const { execSync } = require('node:child_process');
const os = require('node:os');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const CORES = os.cpus().length;

const sample = () => {
  const out = execSync(
    `powershell -NoProfile -Command "Get-Process | Where-Object { $_.Path -like '*ms-playwright*' } | Measure-Object -Property CPU -Sum | ForEach-Object { $_.Sum }"`,
    { encoding: 'utf8' },
  );
  return parseFloat(out) || 0;
};

const measure = async (page, label, scrollTarget) => {
  if (scrollTarget) {
    await page.evaluate((t) => window.__lenis?.scrollTo(t, { duration: 1.2 }), scrollTarget);
    await page.waitForTimeout(2500);
  }
  const a = sample();
  await page.waitForTimeout(4000);
  const b = sample();
  const pct = ((b - a) / (4 * CORES)) * 100;
  console.log(`${label.padEnd(24)} idle CPU ${pct.toFixed(1)}% of machine (${CORES} cores)`);
  return pct;
};

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(4000); /* preloader + intro settle */

  await measure(page, 'hero (silk + pressure)');
  await measure(page, 'focus scene (pinned)', '#focus');
  await measure(page, 'method (gallery)', '#method');
  await measure(page, 'work (waves + cards)', '#work');
  await measure(page, 'models', '#models');
  await measure(page, 'writing', '#writing');

  await page.goto('about:blank');
  await page.waitForTimeout(1500);
  await measure(page, 'control (about:blank)');

  await browser.close();
})();
