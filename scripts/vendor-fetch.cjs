/* Pull React Bits components from the official registry into
   src/components/reactbits/ unmodified.
   Usage: node scripts/vendor-fetch.cjs StarBorder [GlareHover ...]
   Registry: https://reactbits.dev/r/{Name}-JS-CSS.json (flat "Name.jsx" file paths;
   falls back to "Name/Name.jsx" when the registry nests them). */
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../src/components/reactbits');

(async () => {
  const names = process.argv.slice(2);
  if (names.length === 0) {
    console.error('Usage: node scripts/vendor-fetch.cjs <ComponentName> [...]');
    process.exit(1);
  }
  for (const base of names) {
    const res = await fetch(`https://reactbits.dev/r/${base}-JS-CSS.json`);
    if (!res.ok) throw new Error(`${base}: HTTP ${res.status}`);
    const json = await res.json();
    for (const ext of ['jsx', 'css']) {
      const file =
        json.files.find((f) => path.basename(f.path) === `${base}.${ext}`) ??
        json.files.find((f) => f.path === `${base}/${base}.${ext}`);
      if (!file) {
        if (ext === 'css') {
          console.log(`${base}: no ${base}.${ext} — motion-only component, skipped`);
          continue;
        }
        throw new Error(
          `${base}: no ${base}.${ext} — registry lists ${json.files.map((f) => f.path).join(', ')}`
        );
      }
      fs.writeFileSync(path.join(OUT, `${base}.${ext}`), file.content);
      console.log(`wrote ${base}.${ext} (${file.content.length} chars)`);
    }
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
