/**
 * Console + visual audit.
 *
 * Loads the page in headless Chromium, walks the full scroll length so every
 * section mounts and every scroll trigger fires, then reports console
 * errors/warnings, uncaught page errors, and failed/4xx+ requests, and saves a
 * set of screenshots for visual review.
 *
 * Usage:
 *   node scripts/console-audit.cjs [baseURL]
 *   baseURL defaults to http://localhost:4173/ (vite preview).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const base = process.argv[2] || 'http://localhost:4173/';
const outDir = process.env.TEMP
  ? path.join(process.env.TEMP, 'opencode', 'porto-audit')
  : path.join('.', '.audit');

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleIssues = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on('pageerror', err => pageErrors.push(String(err?.stack || err)));
  page.on('requestfailed', req => {
    failedRequests.push(`${req.method()} ${req.url()} -> ${req.failure()?.errorText}`);
  });
  page.on('response', res => {
    if (res.status() >= 400) failedRequests.push(`HTTP ${res.status()} ${res.url()}`);
  });

  await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(5000);

  // Walk the full scroll length so every section mounts and every
  // scroll-triggered animation has fired at least once.
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const step = Math.round(window.innerHeight * 0.8);
    for (let y = 0; y <= document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(resolve => setTimeout(resolve, 320));
    }
  });
  await page.waitForTimeout(2500);

  // Back to top, then sample fixed viewport shots at key scroll stops.
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, '01-hero.png') });

  const docH = await page.evaluate(() => document.body.scrollHeight);
  const innerH = await page.evaluate(() => window.innerHeight);
  const stops = [0.18, 0.38, 0.58, 0.82, 1].map(f => Math.round(f * (docH - innerH)));
  for (let i = 0; i < stops.length; i++) {
    await page.evaluate(y => window.scrollTo(0, y), stops[i]);
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(outDir, `${String(i + 2).padStart(2, '0')}-scroll-${Math.round((stops[i] / docH) * 100)}pct.png`) });
  }

  const report = {
    url: base,
    consoleIssues: [...new Set(consoleIssues)],
    pageErrors: [...new Set(pageErrors)],
    failedRequests: [...new Set(failedRequests)],
    screenshots: outDir,
  };
  fs.writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});
