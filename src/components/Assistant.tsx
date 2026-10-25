/**
 * Assistant.tsx — the site's resident Q&A agent.
 *
 * An awwwards-style dock: a quiet 48px ignition in the corner that
 * blooms into a ledger-style panel. Behind it sits a server-held
 * Gemini agent (api/) with RAG over the site's own data and a
 * DuckDuckGo web-search tool — the key never reaches this bundle.
 * Streams over SSE; abortable; reduced-motion aware; Esc closes.
 *
 * Endpoint: ${VITE_CHAT_API_URL || '/api'}/chat
 */

import { useEffect, useRef, useState } from 'react';

type Hist = { who: 'me' | 'ai'; text: string };
type Source = { title: string; url: string };
type SseEvent = { t: 'text' | 'meta' | 'tool' | 'done' | 'error'; v?: string; sources?: Source[] };

const API = ((import.meta.env.VITE_CHAT_API_URL as string | undefined) ?? '/api').replace(/\/$/, '');

const OPENERS = [
  'What is Hakid working on?',
  'Walk me through his models.',
  'How does he read and rebuild papers?',
  'How can I reach him?',
] as const;

export function Assistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Hist[]>([]);
  const [input, setInput] = useState('');
  const [working, setWorking] = useState(false);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [sources, setSources] = useState<Source[]>([]);

  const histRef = useRef<Hist[]>([]);
  const busyRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Esc closes; focus lands on the input */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        abortRef.current?.abort();
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    const id = window.setTimeout(() => inputRef.current?.focus(), 150);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(id);
    };
  }, [open]);

  /* unmount → abort a mid-stream request */
  useEffect(() => () => abortRef.current?.abort(), []);

  /* keep the ledger pinned to the newest line */
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, note, error]);

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, 600);
    if (!text || busyRef.current) return;
    busyRef.current = true;

    setError('');
    setNote('reading the syllabus…');
    setSources([]);
    setInput('');

    const history = [
      ...histRef.current.slice(-14).map((m) => ({
        role: (m.who === 'me' ? 'user' : 'model') as 'user' | 'model',
        content: m.text,
      })),
      { role: 'user' as const, content: text },
    ];
    const nextHist = [...histRef.current, { who: 'me' as const, text }, { who: 'ai' as const, text: '' }];
    histRef.current = nextHist;
    setMsgs(nextHist);
    setWorking(true);

    const ctrl = new AbortController();
    abortRef.current?.abort();
    abortRef.current = ctrl;

    /* whether the desk spoke at all — read again in `finally` */
    let got = false;

    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        let msg = `the desk is unreachable (${res.status})`;
        try {
          const j = await res.json();
          if (typeof j.error === 'string') msg = j.error;
        } catch {
          /* plain status is fine */
        }
        throw new Error(msg);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('no stream');
      const dec = new TextDecoder();
      let buf = '';

      const append = (t: string) => {
        got = true;
        setMsgs((prev) => {
          const copy = prev.slice();
          const last = copy[copy.length - 1];
          if (last?.who === 'ai') copy[copy.length - 1] = { who: 'ai', text: last.text + t };
          return copy;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let idx: number;
        while ((idx = buf.indexOf('\n\n')) !== -1) {
          const line = buf.slice(0, idx).trim();
          buf = buf.slice(idx + 2);
          if (!line.startsWith('data: ')) continue;
          let ev: SseEvent;
          try {
            ev = JSON.parse(line.slice(6)) as SseEvent;
          } catch {
            continue;
          }
          if (ev.t === 'text') append(ev.v ?? '');
          else if (ev.t === 'tool') setNote(ev.v ?? '');
          else if (ev.t === 'error') {
            setError(ev.v ?? 'the assistant went quiet');
            got = true; /* the desk spoke — just not in words */
          } else if (ev.t === 'done') setSources(ev.sources ?? []);
        }
      }
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setError((err as Error)?.message || 'the desk is unreachable');
      }
      /* aborted: the partial answer may stay on the page */
    } finally {
      /* an AI line that never received a breath shouldn't keep the seat —
         but a partial streaming answer with real words stays untouched */
      if (!got) {
        histRef.current = histRef.current.filter((m) => m.text !== '');
        setMsgs((prev) => {
          const kept = prev.filter((m) => m.text !== '');
          return kept.length !== prev.length ? kept : prev;
        });
      }
      busyRef.current = false;
      setWorking(false);
      setNote('');
    }
  };

  const close = () => {
    abortRef.current?.abort();
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={open ? close : () => setOpen(true)}
        aria-expanded={open}
        aria-controls="ai-panel"
        className="group fixed bottom-5 right-5 z-[95] grid size-12 cursor-pointer place-items-center rounded-full border border-line-2 bg-ink text-bone transition-colors duration-300 hover:border-bone sm:bottom-7 sm:right-7 sm:size-14"
      >
        <span className="font-mono text-[11px] tracking-widest sm:text-xs">{open ? '×' : 'AI'}</span>
        {!open && <span aria-hidden="true" className="absolute right-2.5 top-2.5 size-1.5 rounded-full bg-accent" />}
        {!open && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute right-14 sm:right-16 border border-line bg-ink px-2 py-1 font-mono text-[10px] tracking-widest text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          >
            ask the assistant
          </span>
        )}
      </button>

      {open && (
        <section
          id="ai-panel"
          role="dialog"
          aria-label="Portfolio assistant"
          className="ai-rise fixed bottom-[5.5rem] right-5 z-[95] flex h-[min(560px,72svh)] w-[min(380px,calc(100svw-2.5rem))] flex-col border border-line-2 bg-ink-2/95 backdrop-blur-md [@supports(not(backdrop-filter:blur(6px)))]:bg-ink-2 sm:bottom-[6.75rem] sm:right-7 sm:w-[min(400px,calc(100svw-3.5rem))]"
        >
          <header className="flex items-start justify-between border-b border-line px-4 py-3">
            <div>
              <p className="font-mono text-[11px] tracking-[0.22em] text-bone">ASSISTANT</p>
              <p className="mt-0.5 font-mono text-[10px] text-dim">gemini · ddg web search · site syllabus</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close assistant"
              className="-mr-1 -mt-1 cursor-pointer px-1 font-mono text-sm text-dim transition-colors hover:text-bone"
            >
              ×
            </button>
          </header>

          <div ref={scrollRef} data-lenis-prevent="" className="ai-scroll flex-1 overflow-y-auto overscroll-contain px-4 py-4">
            <div className="space-y-4">
              {msgs.length === 0 && (
                <div className="ai-line space-y-3">
                  <p className="text-[13px] leading-relaxed text-bone/90">
                    Hi — I'm the resident of this site. Ask me about Hakid's work, models, essays, or how to reach him.
                  </p>
                  <div className="flex flex-col items-start gap-1.5 pt-1">
                    {OPENERS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => void send(o)}
                        className="cursor-pointer border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:border-bone hover:text-bone"
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {msgs.map((m, i) =>
                m.who === 'me' ? (
                  <p
                    key={i}
                    className="ai-line ml-auto max-w-[88%] border border-line bg-surface/50 px-3 py-2 text-[13px] leading-relaxed text-bone"
                  >
                    {m.text}
                  </p>
                ) : (
                  <div key={i} className="ai-line">
                    <p className="mb-1 font-mono text-[10px] tracking-[0.2em] text-dim">
                      AI
                      {i === msgs.length - 1 && note ? ` · ${note}` : ''}
                    </p>
                    <p className="max-w-full text-[13px] leading-relaxed text-bone">
                      {m.text}
                      {i === msgs.length - 1 && working && <span className="ai-caret" aria-hidden="true">▌</span>}
                    </p>
                    {i === msgs.length - 1 && sources.length > 0 && (
                      <ul className="mt-2 space-y-0.5 border-l border-line-2 pl-2.5">
                        <li className="font-mono text-[10px] tracking-widest text-dim">SOURCES</li>
                        {sources.map((s) => (
                          <li key={s.url}>
                            <a
                              href={s.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-[11px] text-accent/90 underline-offset-2 hover:underline"
                            >
                              {s.title.slice(0, 70) || s.url}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ),
              )}

              {error && <p className="border-l border-accent/50 pl-3 font-mono text-[11px] text-accent/95">{error}</p>}
            </div>
          </div>

          <form
            className="flex items-center gap-1 border-t border-line px-2 py-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={working}
              placeholder={working ? '…' : 'Ask something…'}
              className="min-w-0 flex-1 bg-transparent px-2 py-1.5 font-mono text-[12px] text-bone caret-accent placeholder:text-dim focus:outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={working || input.trim().length === 0}
              className="cursor-pointer px-2 font-mono text-[11px] tracking-widest text-dim transition-colors hover:enabled:text-accent disabled:opacity-40 enabled:text-bone"
            >
              ↵
            </button>
          </form>
        </section>
      )}
    </>
  );
}
