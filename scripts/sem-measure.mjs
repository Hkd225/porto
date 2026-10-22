/** sem-measure.mjs — cosine distances between test questions, printed raw. */
import fs from 'node:fs';

const key = fs.readFileSync('.env.local', 'utf8').match(/^GEMINI_API_KEY=(.*)$/m)[1].trim();
const { GoogleGenAI } = await import('@google/genai');
const ai = new GoogleGenAI({ apiKey: key });

const Q = {
  q1: 'What models has Hakid published, and where can I try them?',
  q2: 'Which models did Hakid publish on Hugging Face?',
  q3: 'can u tell me what models he has released and where to try them?',
  q4: 'how is his method verified?',
};

const one = async (label, text) => {
  const r = await ai.models.embedContent({
    model: 'gemini-embedding-001',
    contents: text,
    config: { outputDimensionality: 768, taskType: 'RETRIEVAL_QUERY' },
  });
  return r.embeddings[0].values;
};

const cos = (a, b) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

const vec = {};
for (const [k, t] of Object.entries(Q)) vec[k] = await one(k, t);
for (const [a, b] of [['q1', 'q2'], ['q1', 'q3'], ['q2', 'q3'], ['q1', 'q4']]) {
  console.log(`${a} vs ${b}  cosine=${cos(vec[a], vec[b]).toFixed(4)}  «${Q[a]}» «${Q[b]}»`);
}
