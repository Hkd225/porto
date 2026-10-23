/**
 * semcache.mjs — the semantic cache ("memory hit").
 *
 * Stores question→answer pairs (question vector + reply + sources) so
 * a semantically twin question replays the grounded answer without
 * touching the model — the 100% discount of this server's caching
 * ladder:
 *
 *   1. semantic cache  — same sense asked again → replay the answer
 *   2. KV prompt cache — the static prefix (rules + site notes + tools)
 *                       rides a Gemini cachedContent; on this key's
 *                       free tier the storage quota is 0, so the same
 *                       prefix ships inline and the server's implicit
 *                       (automatic) caching discounts it instead. The
 *                       code keeps trying the explicit path so a
 *                       quota upgrade lights it up for free.
 *   3. the model turn  — fresh questions only
 *
 * Threshold honesty: the brief said "twins at ≥45–50%". That number is
 * right for similarity metrics scaled so 0.5 = "same meaning". On
 * 768-d gemini-embedding-001 cosine, 0.5 = "loosely related topics" —
 * treating that as a twin would replay factual portfolio answers that
 * are WRONG. Twin questions score ≈0.90+; the gate sits at 0.88 and
 * anything looser falls through to the live model.
 *
 * Storage is best-effort: locally api/sem-cache.json (gitignored); on
 * Vercel the deploy filesystem is read-only, so writes fall through to
 * os.tmpdir() — the cache survives warm instances and quietly rebuilds
 * on cold starts. Nothing depends on it for correctness: a hit only
 * replays a reply, fresh questions always work.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const LOCAL_FILE = path.join(here, '..', 'sem-cache.json');
const TMP_FILE = path.join(os.tmpdir(), 'hakid-sem-cache.json');

export const SEM_THRESHOLD = 0.88;
const TWIN_DEDUPE = 0.93;
const MAX_ENTRIES = 200;
const TTL_MS = 24 * 60 * 60 * 1000;

const cosine = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return -1;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
};

let loaded = null; /* { file, entries } */

function load() {
  if (loaded) return loaded;
  for (const file of [LOCAL_FILE, TMP_FILE]) {
    try {
      const j = JSON.parse(readFileSync(file, 'utf8'));
      if (Array.isArray(j?.entries)) {
        loaded = { file, entries: j.entries };
        return loaded;
      }
    } catch {
      /* next candidate */
    }
  }
  loaded = { file: LOCAL_FILE, entries: [] };
  return loaded;
}

function persist(store) {
  try {
    const payload = JSON.stringify({ savedAt: new Date().toISOString(), entries: store.entries });
    try {
      writeFileSync(store.file, payload);
    } catch {
      /* deploy filesystem read-only → tmp disk */
      writeFileSync(TMP_FILE, payload);
    }
  } catch {
    /* a cache that cannot persist still answers — it just misses */
  }
}

/* Script identity of a question — CJK vs Cyrillic vs Latin etc. A twin
   answer saved for a question in another script must never replay: the
   reply would arrive in the wrong language through no fault of the gate.
   (Languages sharing a script, e.g. Italian vs Indonesian, stay safe to
   twin; the model still answers in the STORED language, so the gate
   refuses entries whose stored question tells a different script.) */
const scriptOf = (text) => {
  const s = String(text);
  if (/[\u0400-\u04FF]/.test(s)) return 'cyr';
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(s)) return 'cjk';
  if (/[\u0600-\u06FF]/.test(s)) return 'arb';
  if (/[\u0900-\u097F]/.test(s)) return 'dev';
  return 'lat';
};

export function lookup(vector, question) {
  if (!vector) return null;
  const script = scriptOf(question);
  const store = load();
  const now = Date.now();
  let best = null;
  for (const e of store.entries) {
    if (now - e.at > TTL_MS) continue;
    if (e.script && e.script !== script) continue;
    const score = cosine(vector, e.vec);
    if (score > SEM_THRESHOLD && (!best || score > best.score)) {
      best = { ...e, score };
    }
  }
  if (!best) return null;
  best.at = now; /* LRU — twins keep the entry young */
  best.script = script; /* keep the entry's identity current */
  persist(store);
  return { reply: best.reply, sources: best.sources || [], score: Number(best.score.toFixed(3)) };
}

export function store(question, vector, reply, sources) {
  if (!vector || !reply) return;
  const store = load();
  const now = Date.now();
  store.entries = store.entries.filter((e) => now - e.at < TTL_MS);

  /* a near-identical twin already stored — nothing new to remember */
  const script = scriptOf(question);
  const twin = store.entries.find((e) => e.script === script && cosine(vector, e.vec) >= TWIN_DEDUPE);
  if (twin) {
    twin.at = now;
    persist(store);
    return;
  }

  store.entries.push({
    q: String(question).slice(0, 300),
    script: scriptOf(question),
    vec: vector.map((v) => Number(v.toFixed(3))),
    reply: String(reply).slice(0, 1500),
    sources: (sources || []).slice(0, 5),
    at: now,
  });

  /* keep the floor small: newest MAX_ENTRIES survive */
  while (store.entries.length > MAX_ENTRIES) {
    let oldest = 0;
    for (let i = 1; i < store.entries.length; i++) {
      if (store.entries[i].at < store.entries[oldest].at) oldest = i;
    }
    store.entries.splice(oldest, 1);
  }
  persist(store);
}
