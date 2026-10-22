/**
 * api/chat.js — Vercel Node function; a thin shell over the agent core.
 *
 * The Google AI Studio key lives only in Vercel environment variables
 * (GEMINI_API_KEY) — the SPA never sees a secret. Deploy: import this
 * repo at vercel.com, add the env var, done. GitHub Pages frontends
 * call this function via VITE_CHAT_API_URL (CORS is open for POSTs).
 */

import { handleChat } from './lib/agent.mjs';

export default async function handler(req, res) {
  return handleChat(req, res);
}
