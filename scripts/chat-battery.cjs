/**
 * chat-battery.cjs — E2E style check: does the new persona steerAnswers
 * reply to the QUESTION rather than with a fixed self-introduction?
 * Posts each question to the local agent (:8787), collects the SSE
 * stream, prints the assembled reply. Space the posts: 12 req/min cap.
 *
 * Usage: node scripts/chat-battery.cjs
 */
const QUESTIONS = [
  '你好，你是谁？',
  'Hakid 做过什么项目？',
  '안녕하세요, 무엇을 도와줄 수 있나요?',
  'привет, что можно узнать о Хакиде?',
];

const post = async (q) => {
  const res = await fetch('http://localhost:8787/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ messages: [{ role: 'user', content: q }] }),
  });
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  let text = '';
  let meta = [];
  let cached = null;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) >= 0) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      const line = frame.split('\n').find((l) => l.startsWith('data: '));
      if (!line) continue;
      try {
        const ev = JSON.parse(line.slice(6));
        if (ev.t === 'text') text += ev.v;
        else if (ev.t === 'meta') meta.push(ev.v);
        else if (ev.t === 'done') cached = ev.cached;
        else if (ev.t === 'error') text += ` [ERROR: ${ev.v}]`;
      } catch {
        /* partial frame */
      }
    }
  }
  return { text: text.trim(), meta, cached };
};

(async () => {
  for (const q of QUESTIONS) {
    const r = await post(q);
    console.log('Q :', q);
    console.log('A :', r.text.replace(/\s+/g, ' ').slice(0, 260));
    console.log('   meta:', r.meta.join(' → '), '| cached:', r.cached);
    console.log('---');
    await new Promise((r2) => setTimeout(r2, 2500));
  }
})();
