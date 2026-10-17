/**
 * Method plates — final pass. Capture the Push and Document panel frames
 * from the author's own live artifacts, so all four Method panels share
 * one family: real screenshots of real work (the Evo² paper → Read, the
 * uncertainty_engine.py editor → Rebuild, the public GitHub record →
 * Push, the Blood-Cell README → Document). Final crops are written
 * straight into public/method/.
 *
 * Mapping follows the literal step words, settled in review: Push = work
 * pushed to GitHub (the public profile with its contribution year),
 * Document = the README as the written record (leakage prevention,
 * label-shuffling sanity check). Medium is Cloudflare-blocked from this
 * machine (tried headless Chromium and real Chrome). The HF unsloth
 * model cards were probed too but are auto-generated and tableless —
 * weak for either step.
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { chromium } = require('playwright');

const outDir = path.join(os.tmpdir(), 'porto-audit');
fs.mkdirSync(outDir, { recursive: true });
const publicDir = path.resolve(__dirname, '..', 'public', 'method');

const stripOverlays = () => {
  document
    .querySelectorAll('[class*="cookie" i], [id*="cookie" i], [data-testid*="cookie" i], [class*="consent" i], .butterBar')
    .forEach((el) => el.remove());
};

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome' });
    console.log('browser: real Chrome');
  } catch {
    browser = await chromium.launch();
    console.log('browser: bundled chromium');
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  /* push — the public GitHub profile (github.com/Hkd225): repositories
     pushed and a year of contributions on the graph */
  await page.goto('https://github.com/Hkd225', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.evaluate(stripOverlays);
  await page.screenshot({ path: path.join(outDir, 'plate-push-final-stage.png') });
  /* final crop — pinned repositories + contribution year, below the nav */
  await page.screenshot({
    path: path.join(publicDir, 'push.png'),
    clip: { x: 0, y: 72, width: 1440, height: 828 },
  });

  /* document — the Blood-Cell-Anomaly-Detection README: strict leakage
     prevention, group-aware validation, and the label-shuffling sanity
     check — the written record of the stress cases */
  await page.goto('https://github.com/Hkd225/Blood-Cell-Anomaly-Detection', {
    waitUntil: 'domcontentloaded',
    timeout: 90000,
  });
  await page.waitForTimeout(3500);
  await page.evaluate(stripOverlays);
  /* land on the rendered README body, not the file list */
  await page.evaluate(() => {
    const article = document.querySelector('article');
    if (article) article.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, 'plate-document-final-stage.png') });
  await page.screenshot({
    path: path.join(publicDir, 'document.png'),
    clip: { x: 130, y: 0, width: 910, height: 880 },
  });

  await browser.close();
  console.log('plates final written');
})();
