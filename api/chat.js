/**
 * api/chat.js — Vercel Node function; a thin shell over the agent core.
 *
 * The Google AI Studio key lives only in Vercel environment variables
 * (GEMINI_API_KEY) — the SPA never sees a secret. Deploy: import this
 * repo at vercel.com, add the env var, done. GitHub Pages frontends
 * call this function via VITE_CHAT_API_URL (CORS is open for POSTs).
 */

import { handleChat } from './lib/agent.mjs';

/* SSE turns can spend a few extra seconds on the 5xx retry — lift Hobby's
   10s default so a busy free-tier moment degrades into one retry instead
   of a dropped connection. */
export const config = { maxDuration: 30 };

export default async function handler(req, res) {
  return handleChat(req, res);
}
