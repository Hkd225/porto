/**
 * cert-render.cjs —Certificates: PDF → JPEG plates, with honest titles.
 *
 * Walks the source folder of certificate PDFs, dedupes by SHA-256
 * (pairs of identical files ship in the folder), renders page 1 of each
 * unique PDF to a ~900px-wide JPEG via pdf.js inside Chromium, and dumps
 * the extracted page-1 text next to each plate so titles come from the
 * documents themselves.
 *
 * Usage: node scripts/cert-render.cjs [sourceDir]
 * Output: public/certificates/cert-NN.jpg + scripts/.cert-text.json
 */
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const { chromium } = require('playwright');

const SRC = 'C:\\Users\\muham\\hakid-portfolio\\sertfikat\\sertfikat';
const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'public', 'certificates');
const TEXT_DUMP = path.join(__dirname, '.cert-text.json');

const PDFJS_MJS = path
  .join(ROOT, 'node_modules', 'pdfjs-dist', 'build', 'pdf.min.mjs')
  .replace(/\\/g, '/');

const uniqueDocs = () => {
  const files = fs
    .readdirSync(SRC)
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .sort();
  const seen = new Map();
  const docs = [];
  for (const f of files) {
    const buf = fs.readFileSync(path.join(SRC, f));
    const sha = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 16);
    if (seen.has(sha)) {
      docs.push({ name: f, duplicateOf: seen.get(sha).name });
      continue;
    }
    const rec = { name: f, sha, bytes: buf.length };
    seen.set(sha, rec);
    docs.push(rec);
  }
  return { docs, seen };
};

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  /* the page is HOSTED next to the pdf.js build files so relative module
     imports resolve (--allow-file-access-from-files), while every PDF
     rides in as a base64 argument — no file fetching from the page at all. */
  const HOST = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'build', '.cert-host.html');
  fs.writeFileSync(
    HOST,
    [
      '<!doctype html>',
      '<script type="module">',
      "import * as lib from './pdf.min.mjs';",
      "lib.GlobalWorkerOptions.workerSrc = './pdf.worker.min.mjs';",
      'window.pdfjsLib = lib;',
      '</script>',
    ].join('\n'),
  );
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage();
  await page.goto('file:///' + HOST.replace(/\\/g, '/'));
  await page.waitForFunction('typeof window.pdfjsLib !== "undefined"', { timeout: 30000 });

  const { docs, seen } = uniqueDocs();
  const uniques = docs.filter((d) => !d.duplicateOf);
  console.log(`source PDFs: ${docs.length}, unique: ${uniques.length}`);
  for (const d of docs.filter((x) => x.duplicateOf)) console.log(`  dup: ${d.name} == ${d.duplicateOf}`);

  const results = [];
  let n = 0;
  for (const doc of uniques) {
    n += 1;
    /* the PDF rides in as a base64 argument: the file-host page cannot
       fetch cross-file, so node reads the bytes and the page decodes */
    const b64 = fs.readFileSync(path.join(SRC, doc.name)).toString('base64');
    try {
      const out = await page.evaluate(async (data64) => {
        const bin = atob(data64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
        const page1 = await pdf.getPage(1);
        const base = page1.getViewport({ scale: 1 });
        const scale = Math.min(2.4, 1000 / base.width);
        const vp = page1.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(vp.width);
        canvas.height = Math.round(vp.height);
        const ctx = canvas.getContext('2d');
        await page1.render({ canvasContext: ctx, viewport: vp }).promise;
        const jpeg = canvas.toDataURL('image/jpeg', 0.82);
        const tc = await page1.getTextContent();
        const text = tc.items.map((it) => it.str).join(' ').replace(/\s+/g, ' ').slice(0, 500);
        return { jpeg, text };
      }, b64, { timeout: 120000 });
      const num = String(n).padStart(2, '0');
      const file = `cert-${num}.jpg`;
      fs.writeFileSync(path.join(OUT_DIR, file), Buffer.from(out.jpeg.split(',')[1], 'base64'));
      results.push({ nn: num, name: doc.name, bytes: doc.bytes, text: out.text });
      console.log(`  ${file} ← ${doc.name} (${Math.round(doc.bytes / 1024)} KB)`);
    } catch (e) {
      console.log(`  FAIL ${doc.name} — ${String(e).slice(0, 120)}`);
      results.push({ name: doc.name, error: String(e) });
    }
  }

  fs.writeFileSync(TEXT_DUMP, JSON.stringify(results, null, 1));
  console.log(`plates in ${OUT_DIR}, text dump: ${TEXT_DUMP}`);
  await browser.close();
})();
