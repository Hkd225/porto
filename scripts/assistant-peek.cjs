/**
 * assistant-peek.cjs — end-to-end smoke of the resident assistant.
 * Opens the page, blooms the dock, sends a question, screenshots the
 * ledger mid-answer, and reports console errors.
 *
 * Usage: node scripts/assistant-peek.cjs [url]
 */

const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://localhost:4173/';
const OUT = path.join(os.tmpdir(), 'porto-audit');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3500);

  /* bloom the dock */
  await page.click('button[aria-controls="ai-panel"]');
  await page.waitForTimeout(700);
  const panel = await page.$('#ai-panel');
  console.log('panel mounted:', !!panel);
  await page.screenshot({ path: path.join(OUT, 'ai-dock-open.png') });

  /* ask + stream (no key → the honest offline note is the right answer) */
  await page.fill('#ai-panel input', 'What is Hakid working on?');
  await page.press('#ai-panel input', 'Enter');
  await page.waitForTimeout(2800);
  await page.screenshot({ path: path.join(OUT, 'ai-answer.png') });

  const ledger = await page.$$eval('#ai-panel [class*="text-"]', (els) =>
    els.slice(-6).map((e) => e.textContent.trim().slice(0, 80)),
  );
  console.log('ledger tail:\n', ledger.join('\n'));
  console.log('console errors:', errors.length ? errors : 'none');

  await browser.close();
})();
