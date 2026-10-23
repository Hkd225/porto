/**
 * rag-index.cjs — turn the site's own data into the assistant's memory.
 *
 * Reads src/data/*.ts (bundled with esbuild at runtime, so the truth
 * lives only in the TS the site itself ships), flattens every section
 * into syllabus entries and embeds them with gemini-embedding-001
 * (768-d Matryoshka truncation).
 * Output: api/rag-index.json — committed, so the deployed function
 * never needs the key to answer.
 *
 * The vectors serve the semantic cache (twin-question matching); the
 * chunk TEXT is shipped whole through the KV prompt cache (see
 * api/lib/agent.mjs), so no retrieval step runs at request time.
 *
 * Needs GEMINI_API_KEY (shell env or .env.local). Usage: npm run rag:index
 */

const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

/* ---- key from shell env or .env.local ------------------------------ */
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}
const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('[rag] GEMINI_API_KEY missing — copy .env.example to .env.local and paste your Google AI Studio key.');
  process.exit(1);
}

/* ---- bundle the site's TS data to requireable CJS ------------------- */
const esbuild = require('esbuild');
function loadTS(file) {
  const outfile = path.join(root, 'node_modules', '.cache-rag', `${file}.cjs`);
  fs.mkdirSync(path.dirname(outfile), { recursive: true });
  esbuild.buildSync({
    entryPoints: [path.join(root, 'src', 'data', file)],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outfile,
    logLevel: 'silent',
  });
  delete require.cache[outfile];
  return require(outfile);
}

/* ---- TEI flattening ------------------------------------------------ */
const cap = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
const stringify = (v) => cap((typeof v === 'string' ? v : JSON.stringify(v)) || '', 560);

function pushEntry(entries, seen, meta, value) {
  const text = stringify(value);
  if (text.length < 40) return; // too thin to retrieve
  if (seen.has(text)) return;
  seen.add(text);
  entries.push({ meta, text });
}

function flatten(entries, seen, section, value) {
  if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(entries, seen, `${section}[${i}]`, item));
  } else if (value && typeof value === 'object') {
    for (const k of Object.keys(value)) {
      const v = value[k];
      if (Array.isArray(v) || (v && typeof v === 'object')) flatten(entries, seen, `${section}.${k}`, v);
      else pushEntry(entries, seen, `${section}.${k}`, `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`);
    }
    /* also keep the whole object as one entry — small records retrieve better */
    if (Object.keys(value).length > 0 && section.split('.').length <= 2) {
      pushEntry(entries, seen, `${section}`, JSON.stringify(value));
    }
  } else {
    pushEntry(entries, seen, `${section}`, String(value));
  }
}

async function main() {
  const { GoogleGenAI } = require('@google/genai');
  const ai = new GoogleGenAI({ apiKey: key });

  const entries = [];
  const seen = new Set();
  for (const file of ['profile.ts', 'projects.ts', 'certificates.ts']) {
    let mod;
    try {
      mod = loadTS(file);
    } catch (err) {
      console.warn(`[rag] skip ${file}: ${err?.message}`);
      continue;
    }
    for (const name of Object.keys(mod)) {
      flatten(entries, seen, `${file}:${name}`, mod[name]);
    }
  }
  if (entries.length === 0) {
    console.error('[rag] nothing to index — the data modules produced no entries');
    process.exit(1);
  }

  console.log(`[rag] embedding ${entries.length} entries (gemini-embedding-001 · 768d)…`);
  const chunks = [];
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < entries.length; i += 50) {
    const batch = entries.slice(i, i + 50);
    /* free tier throttles embeddings per minute — honour the retry hint */
    let res;
    for (let attempt = 1; ; attempt += 1) {
      try {
        res = await ai.models.embedContent({
          model: 'gemini-embedding-001',
          contents: batch.map((e) => `${e.meta} ${e.text}`),
          config: { outputDimensionality: 768, taskType: 'RETRIEVAL_DOCUMENT' },
        });
        break;
      } catch (err) {
        const raw = typeof err === 'string' ? err : err?.message || JSON.stringify(err);
        const hint = /retry in ([\d.]+)s/i.exec(String(raw));
        if (attempt < 6 && hint) {
          const wait = Math.ceil(parseFloat(hint[1]) * 1000) + 500;
          console.log(`[rag] 429 — waiting ${wait}ms (attempt ${attempt})`);
          await sleep(wait);
          continue;
        }
        throw err;
      }
    }
    (res.embeddings || []).forEach((emb, j) => {
      if (!emb?.values) return;
      chunks.push({
        id: `${i + j}`,
        meta: batch[j].meta,
        text: batch[j].text,
        vec: emb.values.map((v) => Number(v.toFixed(5))),
      });
    });
  }

  const payload = {
    builtAt: new Date().toISOString(),
    model: 'gemini-embedding-001:768',
    chunks,
  };
  const out = path.join(root, 'api', 'rag-index.json');
  fs.writeFileSync(out, JSON.stringify(payload));
  console.log(`[rag] wrote ${chunks.length} chunks to api/rag-index.json — commit it.`);
}

main().catch((err) => {
  console.error('[rag] failed:', err?.message || err);
  process.exit(1);
});
