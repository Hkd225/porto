/**
 * sem-survey.cjs — how interchangeable are the real questions, really?
 *
 * Embeds the LIVE cache questions plus a battery of fresh, diverse
 * questions, then prints: (a) each entry's stored reply head, (b) for
 * every battery question its top-2 cache neighbours and whether the
 * 0.88 gate would replay them. Reads the key the same way agent-dev
 * does; never touches the running server or its cache file.
 *
 * Usage: node scripts/sem-survey.cjs
 */
const fs = require('node:fs');
const path = require('node:path');

/* .env.local loader (same contract as agent-dev.cjs) */
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const CACHE = path.join(__dirname, '..', 'api', 'sem-cache.json');
const cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')).entries;

const BATTERY = [
  'siapa kamu?', /* identity */
  'kamu dari ai apa?', /* identity (already cached) */
  'apa yang bisa kamu lakukan?', /* capability (cached) */
  'proyek terbarunya apa?', /* project fact (cached) */
  'apa itu Evo2?', /* deep project fact */
  'berapa model yang dia punya?', /* countable fact */
  'kenapa langit berwarna biru?', /* off-topic */
  'berapa umur kamu?', /* playful identity */
  'cara menghubungi dia?', /* contact */
  'jelaskan uncertainty engine', /* deep project detail */
  'halo', /* bare greeting */
  'kamu pakai model apa untuk menjawab?', /* meta/technical */
];

(async () => {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const embed = async (text) => {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: String(text).slice(0, 400),
          config: { outputDimensionality: 768, taskType: 'RETRIEVAL_QUERY' },
        });
        return res.embeddings[0].values;
      } catch (e) {
        await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
      }
    }
    return null;
  };

  const cos = (a, b) => {
    let d = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) { d += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
    return d / (Math.sqrt(na) * Math.sqrt(nb) || 1);
  };

  console.log('=== LIVE CACHE (' + cache.length + ' entries) ===');
  for (const e of cache) console.log('-', JSON.stringify(e.q).slice(0, 50), '→', JSON.stringify((e.reply || '').slice(0, 70)));

  const entryVecs = cache.map((e) => e.vec);
  console.log('\n=== FRESH QUESTIONS vs the live cache ===');
  for (const q of BATTERY) {
    const v = await embed(q);
    if (!v) { console.log(q, 'EMBED-FAIL'); continue; }
    const scored = entryVecs
      .map((vec, i) => ({ q: cache[i].q, s: cos(v, vec) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 2);
    const verdict = scored[0].s >= 0.88 ? 'REPLAYS!' : scored[0].s >= 0.8 ? 'close' : 'fresh';
    console.log(
      JSON.stringify(q).padEnd(42),
      'top:' , JSON.stringify(scored[0].q).padEnd(38), scored[0].s.toFixed(3),
      '|2nd:', scored[1].s.toFixed(3),
      '→', verdict,
    );
  }
})();
