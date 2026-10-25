/**
 * site-url.cjs — rebind every production URL once the real domain is known.
 *
 * The SEO surface (index.html canonical + og:url + og:image + JSON-LD
 * @id/url/@id references, robots.txt sitemap pointer, sitemap.xml <loc>)
 * all share one placeholder origin: https://hkd225.github.io/. Run this
 * with the deployed origin and every occurrence switches over, with
 * sitemap <lastmod> stamped to today:
 *
 *   node scripts/site-url.cjs https://porto-abc123.vercel.app
 *
 * Trailing slash is normalised; run it again anytime the domain changes.
 */
const { readFileSync, writeFileSync } = require('node:fs');
const path = require('node:path');

const OLD = 'https://hkd225.github.io/';
const arg = process.argv[2];

if (!arg) {
  console.error('usage: node scripts/site-url.cjs <origin>   e.g. https://porto-x.vercel.app');
  process.exit(1);
}

const url = new URL(arg);
const origin = `${url.protocol}//${url.host}/`; /* placeholder always carries a trailing slash */

const stamp = new Date().toISOString().slice(0, 10);
const files = ['index.html', 'public/robots.txt', 'public/sitemap.xml'].map((f) => path.join(__dirname, '..', f));

for (const file of files) {
  let text = readFileSync(file, 'utf8');
  const before = text;
  text = text.split(OLD).join(origin);
  text = text.replace(/<lastmod>[\s\S]*?<\/lastmod>/, `<lastmod>${stamp}</lastmod>`);
  if (text !== before) {
    writeFileSync(file, text);
    console.log(`updated ${path.basename(file)}`);
  } else {
    console.log(`no change ${path.basename(file)}`);
  }
}
console.log(`done — origin ${origin}, lastmod ${stamp}`);
