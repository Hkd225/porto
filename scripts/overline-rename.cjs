/** overline-rename.cjs — one-off: rename the custom `.overline` className to
 *  `.kicker` everywhere, killing the Tailwind `overline` utility collision.
 *  Only className strings are touched; prose/comments keep their wording. */
const fs = require('node:fs');

const files = [
  'src/components/About.tsx',
  'src/components/Boot.tsx',
  'src/components/Contact.tsx',
  'src/components/Hero.tsx',
  'src/components/Focus.tsx',
  'src/components/Manifesto.tsx',
  'src/components/Writing.tsx',
  'src/components/Work.tsx',
  'src/components/Section.tsx',
];

let total = 0;
for (const p of files) {
  const before = fs.readFileSync(p, 'utf8');
  const after = before.split('className="overline').join('className="kicker');
  const n = (before.match(/className="overline/g) || []).length;
  if (n) {
    fs.writeFileSync(p, after);
    total += n;
    console.log(p, '→', n);
  }
}
console.log('total', total);
