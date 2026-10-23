/** cert-probe.cjs — one PDF, loud logging: where does pdf.js stall?
 *  Variant B: the page is HOSTED next to the pdf.js build so relative
 *  module imports resolve; bytes still ride in as base64. */
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const PDF = 'C:\\Users\\muham\\hakid-portfolio\\sertfikat\\sertfikat\\Completion Certificate _ SkillsBuild.pdf';
const HOST = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'build', '.probe-host.html');

(async () => {
  fs.writeFileSync(
    HOST,
    [
      '<!doctype html>',
      '<script type="module">',
      "import * as lib from './pdf.min.mjs';",
      "lib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';",
      'window.pdfjsLib = lib;',
      "console.log('lib ready:', typeof lib);",
      '</script>',
    ].join('\n'),
  );

  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  page.on('console', (m) => console.log('  [page]', m.type(), m.text().slice(0, 160)));
  await page.goto('file:///' + HOST.replace(/\\/g, '/'), { timeout: 30000 });
  await page.waitForFunction('typeof window.pdfjsLib !== "undefined"', { timeout: 20000 });
  console.log('1 lib injected, passing bytes');
  const b64 = fs.readFileSync(PDF).toString('base64');
  const out = await page.evaluate(async (data64) => {
    const bin = atob(data64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    console.log('getDocument bytes=', bytes.length);
    const doc = await window.pdfjsLib.getDocument({ data: bytes }).promise;
    const p = await doc.getPage(1);
    const base = p.getViewport({ scale: 1 });
    const vp = p.getViewport({ scale: Math.min(2.4, 900 / base.width) });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    await p.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
    const tc = await p.getTextContent();
    return {
      jpegLen: canvas.toDataURL('image/jpeg', 0.82).length,
      text: tc.items.map((i) => i.str).join(' ').slice(0, 160),
    };
  }, b64, { timeout: 60000 });
  console.log('2 done — jpeg chars:', out.jpegLen, '| text:', out.text);
  await browser.close();
})().catch((e) => {
  console.error('PROBE FAIL:', String(e).slice(0, 300));
  process.exit(1);
});
