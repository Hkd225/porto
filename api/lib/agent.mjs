/**
 * agent.mjs — the portfolio chat agent's core.
 *
 * Runs identically in two shells:
 *   - Vercel Node function (api/chat.js imports handleChat)
 *   - local dev server (scripts/agent-dev.cjs imports handleChat)
 *
 * Pipeline per turn:
 *   1. guard the door     — CORS, method, rate limit, body sanity
 *   2. recover knowledge  — RAG: embed the question, cosine over
 *                           api/rag-index.json (the site's own data);
 *                           a static syllabus covers every fallback
 *   3. generate           — Gemini streaming; the model may call the
 *                           web_search tool (DuckDuckGo scrape, official
 *                           Instant Answer API as second path) mid-
 *                           stream; function responses feed the next
 *                           round
 *   4. stream back        — SSE frames: meta / text / tool / done /
 *                           error
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

const here = path.dirname(fileURLToPath(import.meta.url));
const INDEX_PATH = path.join(here, '..', 'rag-index.json');

const MODEL = 'gemini-2.0-flash';
const MAX_HISTORY = 8; // turns we keep server-side
const MAX_ROUNDS = 3; // tool loop depth
const MAX_TOKENS = 900;
const RAG_TOP_K = 4;
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 12;

const WEB_TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'web_search',
        description:
          'Search the public web via DuckDuckGo for facts outside the syllabus: recent events, library versions, paper details, external links. Never use it for facts the syllabus already contains.',
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
 * RAG — the site's own syllabus                                        *
 * ------------------------------------------------------------------ */

let indexPromise = null;
function loadIndex() {
  if (!indexPromise) {
    indexPromise = new Promise((resolve) => {
      try {
        resolve(JSON.parse(readFileSync(INDEX_PATH, 'utf8')));
      } catch {
        resolve(null);
      }
    });
  }
  return indexPromise;
}

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

async function retrieve(query) {
  const ai = await gemini();
  if (!ai) return SYLLABUS;
  const idx = await loadIndex();
  if (!idx || !Array.isArray(idx.chunks) || idx.chunks.length === 0) return SYLLABUS;
  try {
    const res = await ai.models.embed({
      model: 'text-embedding-004',
      contents: String(query).slice(0, 400),
    });
    const qv = res.embeddings?.[0]?.values;
    if (!qv) return SYLLABUS;
    const top = idx.chunks
      .map((chunk) => ({ chunk, s: cosine(qv, chunk.vec) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, RAG_TOP_K);
    return top.map((t) => `[${t.chunk.meta}]\n${t.chunk.text}`).join('\n\n');
  } catch {
    /* embedding quota hiccup — the static syllabus still knows */
    return SYLLABUS;
  }
}

function systemPrompt(syllabus) {
  return [
    'You are the assistant embedded in the portfolio site of Muhammad Auffa Hakim Aditya ("Hakid") — a machine-learning engineering student who builds, documents and ships models end to end.',
    'Visitors ask you about his projects, models, writing, methods, stack and how to reach him.',
    '',
    'RULES',
    '- Ground every claim about Hakid in the SYLLABUS below or in web_search results. If something is not there, say plainly that you do not know and point to his GitHub profile (github.com/Hkd225).',
    '- Never invent projects, models, metrics or links.',
    '- Reply in the language the visitor writes in; default to English.',
    '- Keep answers short and concrete (2-5 sentences unless depth is asked). No emojis. Plain text and simple lists only, no markdown headings.',
    '- Use the web_search tool at most once per question, only when a question reaches beyond the syllabus.',
    '- If web_search is unavailable, say so honestly and answer from what you know.',
    '- Stay inside the portfolio room: unrelated topics get a brief, friendly reply and a steer back to Hakid and his work.',
    '',
    'SYLLABUS',
    syllabus,
  ].join('\n');
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

      send({ t: 'meta', v: 'reading the syllabus…' });
      const syllabus = await retrieve(messages[messages.length - 1].content);

      const contents = messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] }));
      const config = {
        systemInstruction: systemPrompt(syllabus),
        tools: WEB_TOOLS,
        temperature: 0.5,
        maxOutputTokens: MAX_TOKENS,
      };
      const sources = [];

      for (let round = 0; round < MAX_ROUNDS; round++) {
        const stream = await ai.models.generateContentStream({ model: MODEL, contents, config });
        const calls = [];
        for await (const chunk of stream) {
          const parts = chunk.candidates?.[0]?.content?.parts ?? [];
          for (const p of parts) {
            if (p.text) send({ t: 'text', v: p.text });
            else if (p.functionCall) calls.push(p.functionCall);
          }
        }
        if (calls.length === 0) break;

        contents.push({ role: 'model', parts: calls.map((c) => ({ functionCall: { name: c.name, args: c.args ?? {} } })) });
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

      send({ t: 'done', sources: sources.slice(0, 5) });
    } catch (err) {
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
