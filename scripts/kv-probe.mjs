/**
 * kv-probe.mjs — the KV prompt cache, measured with the real corpus.
 *
 * The cached prefix is everything that never changes between visitors:
 *   system rules + web_search tools + every rag-index chunk (the whole
 *   site syllabus as cache CONTENTS — text-only, small corpus, no
 *   query-time retrieval needed).
 *
 * Measures two identical rounds through the cache and prints the
 * usageMetadata deltas — cachedContentTokenCount is the KV discount
 * in action. Usage: node scripts/kv-probe.mjs
 */

import fs from 'node:fs';

const key = fs.readFileSync('.env.local', 'utf8').match(/^GEMINI_API_KEY=(.*)$/m)[1].trim();
const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });
const MODEL = 'gemini-3.5-flash-lite';

const idx = JSON.parse(fs.readFileSync('api/rag-index.json', 'utf8'));
const SITE_NOTES = (idx.chunks || []).map((c) => `[${c.meta}]\n${c.text}`).join('\n\n');
console.log(`[kv] corpus bytes = ${SITE_NOTES.length}, chunks = ${idx.chunks.length}`);

const SYSTEM = [
  'You are the assistant embedded in the portfolio site of Muhammad Auffa Hakim Aditya ("Hakid") — a machine-learning engineering student who builds, documents and ships models end to end.',
  'Visitors ask you about his projects, models, writing, methods, stack and how to reach him.',
  '',
  'RULES',
  '- Ground every claim about Hakid in the SITE NOTES below or in web_search results. If something is not there, say plainly that you do not know and point to his GitHub profile (github.com/Hkd225).',
  '- Never invent projects, models, metrics or links.',
  '- Reply in the language the visitor writes in; default to English.',
  '- Keep answers short and concrete (2-5 sentences unless depth is asked). No emojis. Plain text and simple lists only, no markdown headings.',
  '- Use the web_search tool at most once per question, only when a question reaches beyond the notes.',
  '- If web_search is unavailable, say so honestly and answer from what you know.',
  '- Stay inside the portfolio room: unrelated topics get a brief, friendly reply and a steer back to Hakid and his work.',
].join('\n');

const TOOLS = [
  {
    functionDeclarations: [
      {
        name: 'web_search',
        description:
          'Search the public web via DuckDuckGo for facts outside the notes: recent events, library versions, paper details, external links. Never use it for facts the notes already contain.',
        parameters: {
          type: 'OBJECT',
          properties: { query: { type: 'STRING', description: 'a short, plain search query' } },
          required: ['query'],
        },
      },
    ],
  },
];

const CONTENTS = [{ role: 'user', parts: [{ text: `SITE NOTES (always in force):\n\n${SITE_NOTES}\n\n(end of notes)` }] }];

let name = null;
try {
  const created = await ai.caches.create({
    model: MODEL,
    config: { systemInstruction: SYSTEM, tools: TOOLS, contents: CONTENTS, ttl: '600s', displayName: 'hakid-agent-kv' },
  });
  name = created.name;
  console.log('[kv] cache created:', name);
} catch (err) {
  console.log('[kv] create FAILED:', String(err?.message).replace(/\s+/g, ' ').slice(0, 300));
}

async function round(label, question) {
  const contents = [{ role: 'user', parts: [{ text: question }] }];
  const config = name
    ? { cachedContent: name, temperature: 0.5, maxOutputTokens: 900 }
    : { systemInstruction: SYSTEM, tools: TOOLS, temperature: 0.5, maxOutputTokens: 900 };
  const t0 = Date.now();
  try {
    const stream = await ai.models.generateContentStream({ model: MODEL, contents, config });
    let text = '';
    let usage = null;
    for await (const chunk of stream) {
      if (chunk.text) text += chunk.text;
      if (chunk.usageMetadata) usage = chunk.usageMetadata;
    }
    console.log(`[${label}] ${(Date.now() - t0) | 0}ms | ${String(text).replace(/\s+/g, ' ').slice(0, 100)}`);
    console.log(`[kv] usage: ${JSON.stringify(usage)}`);
  } catch (err) {
    console.log(`[${label}] FAIL ${String(err?.message).replace(/\s+/g, ' ').slice(0, 300)}`);
  }
}

const question1 = 'What models has he published and where can I try them?';
await round('round 1 (cold)', question1);
await round('round 2 (identical)', question1);

if (name) await ai.caches.delete({ name }).catch(() => {});
console.log('[kv] done');
