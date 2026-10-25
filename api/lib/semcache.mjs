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
/* a recently served twin stands down for a minute — a visitor asking the
   same question right after someone else (or testing in a row) falls to
   the live model, whose phrasing now varies; the cache still earns its
   discount whenever anyone asks again after the cooldown */
const SERVE_COOLDOWN_MS = 60_000;

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
   reply would arrive in the wrong language through no fault of the gate. */
const scriptOf = (text) => {
  const s = String(text);
  if (/[\u0400-\u04FF]/.test(s)) return 'cyr';
  if (/[\u3040-\u30FF\u4E00-\u9FFF]/.test(s)) return 'cjk';
  if (/[\u0600-\u06FF]/.test(s)) return 'arb';
  if (/[\u0900-\u097F]/.test(s)) return 'dev';
  return 'lat';
};

/* Latin goes one level deeper — Indonesian vs English vs other. Sharing an
   alphabet is NOT language identity: "Sen kimsin" (Turkish) once twinned
   an Indonesian entry and the visitor got a self-introduction instead of
   an answer about language flexibility. Function-word fingerprints decide;
   short or code-switching messages fall to 'xx' (unknown Latin), which
   refuses to twin id/en entries — one live call is the honest cost.
   Exported so the agent can reuse the same fingerprints for steering. */
const ID_MARKERS = /\b(yang|dan|dengan|untuk|pada|apa|apakah|bagaimana|kenapa|siapa|bisa|tidak|bukan|ini|itu|saya|kamu|ada|adalah|dalam|sudah|akan|juga|semua|kalau|karena|masih|tolong|satu|sebutkan|contoh|bahasa|proyekny[ai])\b/gi;
const EN_MARKERS = /\b(what|how|why|who|where|when|the|is|are|can|could|would|do|does|did|you|your|his|him|their|about|tell|give|show|list|any|that|this|and|of|for|hello|hi|thanks|please)\b/gi;

export const languageOf = (text) => {
  const script = scriptOf(text);
  if (script !== 'lat') return script;
  const low = String(text).toLowerCase();
  const id = (low.match(ID_MARKERS) || []).length;
  const en = (low.match(EN_MARKERS) || []).length;
  if (id >= 2 && id > en) return 'id';
  if (en >= 2 && en > id) return 'en';
  return 'xx';
};

export function lookup(vector, question) {
  if (!vector) return null;
  const lang = languageOf(question);
  const store = load();
  const now = Date.now();
  /* NOTE: the winner is mutated IN PLACE inside store.entries — copying it
     out first (best = {...e}) keeps the copy's served/at flags out of
     persist() and the cooldown silently stops working */
  let bestEntry = null;
  let bestScore = 0;
  for (const e of store.entries) {
    if (now - e.at > TTL_MS) continue;
    if (e.script && e.script !== scriptOf(question)) continue;
    /* language twins only replay for the same language — a stored '.it'
       reply never reaches an Indonesian question again */
    if (e.lang && e.lang !== lang) continue;
    /* a poisoned entry (stored answer in a DIFFERENT language than its own
       question) is dead weight — regenerate gives the model a fair chance */
    if (e.lang && e.rlang && e.rlang !== e.lang) continue;
    if (e.served && now - e.served < SERVE_COOLDOWN_MS) continue;
    const score = cosine(vector, e.vec);
    if (score > bestScore) {
      bestEntry = e;
      bestScore = score;
    }
  }
  if (!bestEntry || bestScore <= SEM_THRESHOLD) return null;
  bestEntry.at = now; /* LRU — twins keep the entry young */
  bestEntry.served = now; /* enrollment into the cooldown */
  persist(store);
  return { reply: bestEntry.reply, sources: bestEntry.sources || [], score: Number(bestScore.toFixed(3)) };
}

export function store(question, vector, reply, sources) {
  if (!vector || !reply) return;
  const store = load();
  const now = Date.now();
  store.entries = store.entries.filter((e) => now - e.at < TTL_MS);

  const lang = languageOf(question);
  const script = scriptOf(question);

  /* a near-identical twin already stored — nothing new to remember, only
     the freshness beats on; a twin in another language falls through so
     the fresh answer does land in the cache under its own language */
  const twin = store.entries.find((e) => e.script === script && e.lang === lang && cosine(vector, e.vec) >= TWIN_DEDUPE);
  if (twin) {
    twin.at = now;
    persist(store);
    return;
  }

  store.entries.push({
    q: String(question).slice(0, 300),
    script,
    lang,
    /* the answer's own language — recorded so lookup can discard entries
       whose reply betrayed the question's tongue (wrong-tongue live
       answers used to become immortal bad replays) */
    rlang: languageOf(reply),
    vec: vector.map((v) => Number(v.toFixed(3))),
    reply: String(reply).slice(0, 1500),
    sources: (sources || []).slice(0, 5),
    at: now,
    served: now, /* the cooldown starts at birth: immediate repeats go live */
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
