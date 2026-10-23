/**
 * agent.mjs — the portfolio chat agent's core.
 *
 * Runs identically in two shells:
 *   - Vercel Node function (api/chat.js imports handleChat)
 *   - local dev server (scripts/agent-dev.cjs imports handleChat)
 *
 * Pipeline per turn:
 *   1. guard the door     — CORS, method, rate limit, body sanity
 *   2. match memory       — embed the question (one cheap embedding
 *                           call), consult the SEMANTIC CACHE: a twin
 *                           question replays its grounded reply with
 *                           zero model calls (api/lib/semcache.mjs)
 *   3. assemble the turn  — history + question, riding the static
 *                           prefix (rules + site notes + tools) that
 *                           becomes the KV prompt cache
 *   4. generate           — Gemini streaming; the model may call the
 *                           web_search tool (DuckDuckGo scrape, official
 *                           Instant Answer API as second path) mid-
 *                           stream; function responses feed the next
 *                           round
 *   5. stream back        — SSE frames: meta / text / tool / done /
 *                           error
 *
 * The caching ladder (fresh question → full price, twin → free):
 *   - KV PROMPT CACHE: everything that never changes between visitors —
 *     the rules, the web_search tool and every rag-index chunk (the
 *     whole site syllabus, ~90 entries ≈ 5k tokens) — is cached as one
 *     Gemini cachedContent with a 600s TTL, refreshed on use. On this
 *     key's FREE TIER the cachedContent storage quota is 0 tokens, so
 *     the create fails and the same prefix ships INLINE inside the
 *     system instruction instead: an identical giant prefix on every
 *     round that the server's IMPLICIT caching discounts on its own.
 *     The explicit path stays in the code — a quota upgrade lights it
 *     up for free. usageMetadata is logged per round so the discount
 *     is verifiable from the server console.
 *   - The site notes live in the cached prefix, so unknown facts are
 *     available without a per-turn retrieval step: fresh questions
 *     cost one embedding (semantic cache gate) plus the model calls.
 *   - The embedding PROMPT cache question applies to text-embedding
 *     models only under retrievers; here embeddings run once per turn
 *     for the semantic gate, not per tool round.
 *
 * The Google AI Studio key lives only in server env (GEMINI_API_KEY) —
 * nothing lands in the SPA bundle. Everything degrades honestly: no key
 * → a clear offline note; DDG blocked → the tool reports it and the
 * model answers from what it knows.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { SYLLABUS } from './knowledge.mjs';
import { lookup as semLookup, store as semStore } from './semcache.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(here, '..', 'rag-index.json');

const MODEL = 'gemini-3.5-flash-lite';
const EMBED_MODEL = 'gemini-embedding-001';
const EMBED_DIMS = 768; /* Matryoshka truncation — tiny corpus, cheap vectors */
const MAX_HISTORY = 8; // turns we keep server-side
const MAX_ROUNDS = 3; // tool loop depth
const MAX_TOKENS = 900;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;
const CACHE_TTL = '600s'; // KV cache lifetime, refreshed on use

const WEB_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'web_search',
        description:
          'Search the public web via DuckDuckGo for facts outside the site notes: recent events, library versions, paper details, external links. Never use it for facts the site notes already contain.',
        parameters: {
          type: 'OBJECT',
          properties: {
            query: { type: 'STRING', description: 'a short, plain search query' },
          },
          required: ['query'],
        },
      },
    ],
  },
];

const SYSTEM_RULES = [
  'You are the assistant embedded in the portfolio site of Muhammad Auffa Hakim Aditya ("Hakid") — a machine-learning engineering student who builds, documents and ships models end to end.',
  '',
  'RULES',
  '- Reply in the visitor\u2019s language — the language of their LAST message decides, every time. Italian gets Italian, Japanese gets Japanese, English gets English, Indonesian gets Indonesian. When their language is ambiguous or unknown to you, reply in English. Never mix two languages in one reply. Never complete a URL mid-way — either write it whole or drop it.',
  '- Answer the exact question the visitor asked. Do not re-introduce yourself unless they ask who or what you are. Vary your openers and wording from turn to turn — never reuse the same opening sentence within one conversation.',
  '- Greetings and small talk ("hi", "ciao, come stai?", "apa kabar?", "tes") get ONE short, warm sentence in THEIR language plus at most one open question. No introduction, no project list, no biography, no GitHub link. Example: "Ora come stai? → Tutto bene, grazie! Vuoi che ti racconti qualcosa sui progetti di Hakid?"',
  '- Ground every claim about Hakid in the SITE NOTES below or in web_search results. If something is not there, say plainly that you do not know and point to his GitHub profile (github.com/Hkd225). Never invent projects, models, metrics or links.',
  '- Keep answers short and concrete (2-5 sentences unless depth is asked). No emojis. Plain text and simple lists only, no markdown headings.',
  '- Use the web_search tool at most once per question: when a question reaches beyond the site notes, or when the visitor asks you to check the web.',
  '- If web_search is unavailable, say so honestly and answer from what you know.',
  '- Stay inside the portfolio room by default: unrelated topics get a brief, friendly reply and a steer back to Hakid and his work — unless the visitor explicitly asks you to check the web, then honor that once and answer honestly.',
].join('\n');

/* The Method section's story lives partly OUTSIDE the data-file toolkit —
   in image alt texts and public/method/CREDITS.md — so the RAG index never
   saw it. Shipped as a static handbook instead; rides the same static
   prefix, so the caching ladder is untouched. */
const METHOD_HANDBOOK = [
  'SITE HANDBOOK',
  '- "Evo2" (without the superscript) refers to Evo² — "Evolving the Evolver through Weight-Harness Co-Evolution", the paper in the method section. Figure 1: a shared Proposer–Reflector policy evolves the agent harness; harness edits and execution outcomes provide training experience for the policy; crossover searching transfers useful strategies between branches.',
  '- The four method panels, in order: Read — the Evo² paper open on screen (Figure 1, weight-harness co-evolution), read line by line. Rebuild — uncertainty_engine.py in the editor, the entropy core re-implemented by hand, _clip01 through softmax. Push — the public GitHub profile (github.com/Hkd225), repositories pushed as they happened. Document — the public README of stress cases (github.com/Hkd225/Blood-Cell-Anomaly-Detection): strict leakage prevention, group validation, and labels shuffled to prove the accuracy is earned.',
].join('\n');

/* Deterministic language steering — tiny models follow an explicit
   in-turn directive far more reliably than a standing rule, and CJK/
   Cyrillic questions in particular kept coming back in the wrong
   tongue. Latin-script languages stay with the standing rule (the
   model handles those well); for everything else the detector confirms
   the script and the directive names the language outright. */
function visitorLanguage(q) {
  const s = String(q);
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(s)) return 'Japanese';
  if (/[\uAC00-\uD7AF]/.test(s)) return 'Korean';
  if (/[\u4E00-\u9FFF]/.test(s)) return 'Simplified Chinese';
  if (/[\u0400-\u04FF]/.test(s)) return 'Russian (Cyrillic)';
  if (/[\u0600-\u06FF]/.test(s)) return 'Arabic';
  if (/[\u0900-\u097F]/.test(s)) return 'Hindi';
  if (/[\u10A0-\u10FF]/.test(s)) return 'Georgian';
  if (/[\u0530-\u058F]/.test(s)) return 'Armenian';
  return null; /* Latin scripts — the standing RULES cover these */
}

let aiPromise = null;
function gemini() {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiPromise) {
    aiPromise = import('@google/genai').then(
      ({ GoogleGenAI }) => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }),
    );
  }
  return aiPromise;
}

/* ------------------------------------------------------------------ *
 * the site's own syllabus — loaded once, shipped as cache contents    *
 * ------------------------------------------------------------------ */

let indexPromise = null;
function siteIndex() {
  if (!indexPromise) {
    indexPromise = new Promise((resolve) => {
      try {
        const idx = JSON.parse(readFileSync(INDEX_PATH, 'utf8'));
        resolve(Array.isArray(idx.chunks) && idx.chunks.length > 0 ? idx : null);
      } catch {
        resolve(null);
      }
    });
  }
  return indexPromise;
}

async function siteNotes() {
  const idx = await siteIndex();
  if (!idx) return `${SYLLABUS}\n\n${METHOD_HANDBOOK}`; /* static syllabus covers every fallback */
  return `${idx.chunks.map((c) => `[${c.meta}]\n${c.text}`).join('\n\n')}\n\n${METHOD_HANDBOOK}`;
}

async function embedQuery(query) {
  const ai = await gemini();
  if (!ai) return null;
  try {
    const res = await ai.models.embedContent({
      model: EMBED_MODEL,
      contents: String(query).slice(0, 400),
      config: { outputDimensionality: EMBED_DIMS, taskType: 'RETRIEVAL_QUERY' },
    });
    return res.embeddings?.[0]?.values ?? null;
  } catch {
    /* embedding hiccup — the semantic gate just stays closed this turn */
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * KV prompt cache — one cachedContent per warm instance               *
 * ------------------------------------------------------------------ */

let kv = null; /* { name, fingerprint, refreshedAt, failed: bool } */

async function kvCache(ai, notes, log) {
  const fingerprint = notes.length;
  if (!kv || kv.fingerprint !== fingerprint) {
    kv = { name: null, fingerprint, refreshedAt: 0, failed: false };
  }
  if (kv.failed || !kv.name) {
    if (kv.failed) return null;
    try {
      const created = await ai.caches.create({
        model: MODEL,
        config: {
          systemInstruction: SYSTEM_RULES,
          tools: WEB_TOOLS,
          contents: [
            { role: 'user', parts: [{ text: `SITE NOTES (always in force):\n\n${notes}\n\n(end of notes)` }] },
          ],
          ttl: CACHE_TTL,
          displayName: 'hakid-agent-kv',
        },
      });
      kv.name = created.name;
      kv.refreshedAt = Date.now();
      log(`kv cache created ${kv.name} (ttl ${CACHE_TTL}) — explicit discounts active`);
      return kv.name;
    } catch (err) {
      /* free tier storage quota = 0 → the notes ride inline; the
         server's implicit caching discounts the identical prefix */
      kv.failed = true;
      log(`kv cache unavailable (${String(err?.message).slice(0, 140)}) — inline prefix + implicit caching`);
      return null;
    }
  }
  if (Date.now() - kv.refreshedAt > 60_000) {
    kv.refreshedAt = Date.now();
    ai.caches.update({ name: kv.name, config: { ttl: CACHE_TTL } }).catch(() => {});
  }
  return kv.name;
}

/* ------------------------------------------------------------------ *
 * web_search — DuckDuckGo first, official Instant Answer second        *
 * ------------------------------------------------------------------ */

async function webSearch(query) {
  const q = String(query || '').slice(0, 300).trim();
  if (!q) return { ok: false, hits: [], note: 'empty search query' };

  /* unofficial scrape — full results, but breaks when their markup does */
  try {
    const ddg = await import('duck-duck-scrape');
    let res;
    try {
      res = await ddg.search(q, { safeSearch: ddg.SafeSearchType?.STRICT ?? 1 });
    } catch {
      res = await ddg.search({ query: q });
    }
    const hits = (res?.results || [])
      .slice(0, 5)
      .map((r) => ({ title: String(r.title || ''), url: String(r.url || ''), snippet: String(r.description || '') }))
      .filter((h) => h.url);
    if (hits.length) return { ok: true, hits };
  } catch {
    /* fall through to the sanctioned endpoint */
  }

  /* official Instant Answer API — thin, but never blocked */
  try {
    const r = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`,
    );
    const j = await r.json();
    const hits = [];
    if (j.AbstractText && j.AbstractURL) {
      hits.push({ title: String(j.Heading || q), url: String(j.AbstractURL), snippet: String(j.AbstractText) });
    }
    for (const t of j.RelatedTopics || []) {
      if (hits.length >= 5) break;
      if (t.FirstURL) {
        hits.push({
          title: String(t.Text || '').split(' - ')[0].slice(0, 100),
          url: String(t.FirstURL),
          snippet: String(t.Text || ''),
        });
      }
    }
    if (hits.length) return { ok: true, hits };
  } catch {
    /* both roads are closed */
  }

  return { ok: false, hits: [], note: 'web search is unavailable right now — answer from what you know and say so' };
}

/* ------------------------------------------------------------------ *
 * the door — rate limit, body sanity                                   *
 * ------------------------------------------------------------------ */

const recentHits = new Map();
function tooMany(ip) {
  const now = Date.now();
  const list = (recentHits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  recentHits.set(ip, list);
  if (recentHits.size > 5000) {
    for (const [key, times] of recentHits) {
      if (times.every((t) => now - t > RATE_WINDOW_MS)) recentHits.delete(key);
    }
  }
  return list.length > RATE_MAX;
}

async function readBody(req, max = 32_000) {
  let size = 0;
  const parts = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > max) throw new Error('payload too large');
    parts.push(chunk);
  }
  return Buffer.concat(parts).toString('utf8');
}

function userMessage(err) {
  const text = String(err?.message || err || '');
  if (/429|quota|rate/i.test(text)) return 'Gemini\u2019s free tier is busy right now — try again in a minute.';
  if (/5\d\d/i.test(text)) return 'The model backend hiccuped — please try again.';
  return 'The assistant stumbled — please try again.';
}

function json(res, code, payload) {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

/* ------------------------------------------------------------------ *
 * handleChat — CORS, guard, stream                                     *
 * ------------------------------------------------------------------ */

export async function handleChat(req, res) {
  const log = (m) => console.info(`[agent] ${m}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('X-Accel-Buffering', 'no');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return void res.end();
  }
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'method not allowed' });
  }

  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'local').split(',')[0].trim();
  if (tooMany(ip)) {
    return json(res, 429, { error: 'slow down — 12 questions a minute per visitor' });
  }

  let body;
  try {
    body = JSON.parse(await readBody(req));
  } catch {
    return json(res, 400, { error: 'bad request body' });
  }

  const incoming = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .slice(-MAX_HISTORY)
    .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1400) }));
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return json(res, 400, { error: 'empty conversation' });
  }

  const question = messages[messages.length - 1].content;

  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
  });
  const send = (event) => {
    try {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    } catch {
      /* client walked away */
    }
  };

  const run = async () => {
    try {
      const ai = await gemini();
      if (!ai) {
        send({
          t: 'error',
          v: 'The assistant has no key wired yet (GEMINI_API_KEY missing on the server). It comes online as soon as the secret is set.',
        });
        send({ t: 'done', sources: [] });
        return;
      }

      /* the semantic gate — one embedding, twin questions never bill */
      send({ t: 'meta', v: 'matching memory…' });
      const vector = await embedQuery(question);
      const hit = semLookup(vector, question);
      if (hit) {
        log(`semantic HIT score ${hit.score} — replaying, 0 model calls`);
        send({ t: 'meta', v: 'memory hit (semantic cache)' });
        send({ t: 'text', v: hit.reply });
        send({ t: 'done', sources: hit.sources, cached: true });
        return;
      }

      /* assemble the turn — history first, question last. When the
         visitor explicitly asks for a web check, a directive part
         precedes the question: the smaller model still obeys the
         portfolio room unless it sees the visitor asked for it. */
      const asksWeb =
        /\b(check|search|look ?up|verify|google)\b[^.?!]{0,40}\b(web|internet|online)\b|\bweb search\b|\bsearch the web\b|\bcheck the web\b/i.test(
          question,
        );
      const contents = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
      const lang = visitorLanguage(question);
      if (lang) {
        contents[contents.length - 1].parts.unshift({
          text: `The visitor writes in ${lang}. Respond ONLY in ${lang} — every sentence, no second language anywhere (names and URLs excepted).`,
        });
      }
      if (asksWeb) {
        contents[contents.length - 1].parts.unshift({
          text: 'The visitor explicitly asked you to check the web for this one. Call web_search once, then answer honestly and steer back.',
        });
      }
      const sources = [];
      let reply = '';
      let toolUsed = false;

      const notes = await siteNotes();
      let config = null;
      const cacheName = await kvCache(ai, notes, log);
      if (cacheName) {
        /* tools live inside the cached prefix */
        config = { cachedContent: cacheName, temperature: 0.65, maxOutputTokens: MAX_TOKENS };
      } else {
        /* the identical giant prefix — implicit caching's breadcrumb */
        config = {
          systemInstruction: `${SYSTEM_RULES}\n\nSITE NOTES\n${notes}`,
          tools: WEB_TOOLS,
          temperature: 0.65,
          maxOutputTokens: MAX_TOKENS,
        };
      }

      log(`turn start q="${question.slice(0, 80)}" mode=${cacheName ? 'kv-cache' : 'inline-prefix'}`);
      send({ t: 'meta', v: 'reading the site\u2019s notes…' });

      for (let round = 0; round < MAX_ROUNDS; round++) {
        const stream = await ai.models.generateContentStream({ model: MODEL, contents, config });
        const rawParts = [];
        const calls = [];
        for await (const chunk of stream) {
          const parts = chunk.candidates?.[0]?.content?.parts ?? [];
          for (const p of parts) {
            if (p.thought) continue; /* thinking summaries never ship */
            rawParts.push(p);
            if (p.text) {
              send({ t: 'text', v: p.text });
              reply += p.text;
            } else if (p.functionCall) calls.push(p.functionCall);
          }
          if (chunk.usageMetadata) {
            const u = chunk.usageMetadata;
            log(
              `round ${round} usage in=${u.promptTokenCount} kv-cached=${u.cachedContentTokenCount ?? 0} out=${u.candidatesTokenCount ?? 0}`,
            );
          }
        }
        if (calls.length === 0) break;

        toolUsed = true;
        /* replay the model turn AS RECEIVED — Gemini 3.x function calls
           carry a thought_signature the API requires back on the next
           round ("Function call is missing a thought_signature") */
        contents.push({ role: 'model', parts: rawParts });
        const responses = [];
        for (const c of calls) {
          if (c.name === 'web_search') {
            const out = await webSearch(c.args?.query);
            for (const h of out.hits) sources.push({ title: h.title, url: h.url });
            send({ t: 'tool', v: `web_search · ${String(c.args?.query ?? '').slice(0, 60)}${out.ok ? '' : ' · unavailable'}` });
            responses.push({
              functionResponse: {
                name: 'web_search',
                response: { ok: out.ok, results: out.hits, note: out.note ?? '' },
              },
            });
          } else {
            responses.push({ functionResponse: { name: c.name ?? 'unknown', response: { error: 'unknown tool' } } });
          }
        }
        contents.push({ role: 'user', parts: responses });
      }

      send({ t: 'done', sources: sources.slice(0, 5), cached: false });

      /* a grounded, tool-free answer becomes tomorrow's memory hit —
         refusals never do */
      const refusal = /^.{0,120}\b(can only|cannot|can't|unable)\b/i.test(reply);
      if (!toolUsed && !refusal && reply.length >= 60) {
        semStore(question, vector, reply, sources.slice(0, 5));
      }
    } catch (err) {
      log(`turn failed — ${String(err?.stack || err?.message || err).slice(0, 400)}`);
      send({ t: 'error', v: userMessage(err) });
      send({ t: 'done', sources: [] });
    } finally {
      try {
        res.end();
      } catch {
        /* already closed */
      }
    }
  };

  run();
}
