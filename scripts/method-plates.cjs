/**
 * Method plates — final pass. Capture the Push and Document panel frames
 * from the author's own live artifacts, so all four Method panels share
 * one family: real screenshots of real work (the Evo² paper → Read, the
 * uncertainty_engine.py editor → Rebuild, the Blood-Cell README of stress
 * cases → Push, the public GitHub record → Document). Final crops are
 * written straight into public/method/.
 *
 * Medium is Cloudflare-blocked from this machine (tried headless Chromium
 * and real Chrome) — Document uses the public GitHub profile instead,
 * which the Document step text matches literally ("results, failures and
 * dead ends go into the repo as they happened — the history stays
 * honest, and the work stays reproducible"). The HF unsloth model cards
 * were probed too but are auto-generated and tableless — weak for the
 * Push step's benchmark semantics.
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

  /* push — the Blood-Cell-Anomaly-Detection README: strict leakage
     prevention, group-aware validation, and the label-shuffling sanity
     check — the stress cases the Push step is about */
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
  await page.screenshot({ path: path.join(outDir, 'plate-push-final-stage.png') });
  await page.screenshot({
    path: path.join(publicDir, 'push.png'),
    clip: { x: 130, y: 0, width: 910, height: 880 },
  });

  /* document — the public GitHub profile (github.com/Hkd225) */
  await page.goto('https://github.com/Hkd225', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(3500);
  await page.evaluate(stripOverlays);
  await page.screenshot({ path: path.join(outDir, 'plate-document-final-stage.png') });
  /* final crop — pinned repositories + contribution year, below the nav */
  await page.screenshot({
    path: path.join(publicDir, 'document.png'),
    clip: { x: 0, y: 72, width: 1440, height: 828 },
  });

  await browser.close();
  console.log('plates final written');
})();
