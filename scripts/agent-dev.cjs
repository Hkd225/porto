/**
 * agent-dev.cjs — run the chat agent locally so `npm run dev` can use it.
 *
 * Serves api/lib/agent.mjs on http://localhost:8787/api/chat; Vite
 * proxies /api here (see vite.config.ts) — the same shape as production.
 * Loads .env.local for GEMINI_API_KEY if present.
 *
 * Usage: npm run chat:dev
 */

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const root = path.join(__dirname, '..');

/* load the local key without depending on dotenv */
const envPath = path.join(root, '.env.local');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim();
  }
}

(async () => {
  const mod = await import(
    pathToFileURL(path.join(root, 'api', 'lib', 'agent.mjs')).href
  );
  const server = http.createServer(async (req, res) => {
    try {
      if (req.url !== '/api/chat') {
        res.writeHead(404, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: 'not found' }));
      }
      await mod.handleChat(req, res);
    } catch (err) {
      console.error('[agent]', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'content-type': 'application/json' });
      }
      try {
        res.end(JSON.stringify({ error: 'internal error' }));
      } catch {
        /* already gone */
      }
    }
  });
  const port = Number(process.env.CHAT_PORT || 8787);
  server.listen(port, () => {
    console.log(`[agent] local api on http://localhost:${port}/api/chat`);
    if (!fs.existsSync(envPath)) {
      console.log('[agent] no .env.local — copy .env.example and add GEMINI_API_KEY');
    }
  });
})();
