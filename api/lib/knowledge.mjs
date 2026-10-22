/**
 * knowledge.mjs — the static fallback syllabus.
 *
 * The RAG index (api/rag-index.json) is the assistant's real memory;
 * this hand-written brief is what it speaks from while the index is
 * absent or the embedding call falters. It carries only facts verified
 * from the owner's profiles — anything else gets "I don't know".
 */

export const SYLLABUS = `IDENTITY
- Muhammad Auffa Hakim Aditya — "Hakid" — a machine-learning engineering student. He builds, documents and ships models end to end, and treats honesty of data as the design law of his work.

WHERE TO FIND HIM
- GitHub: github.com/Hkd225 — five pinned repositories, roughly two hundred contributions in the last year.
- Hugging Face: huggingface.co/Hakid — five public models (about 12.7B parameters in total).
- Medium: medium.com/@hakid19 — essays.
- LinkedIn: muhammad-auffa-hakim-aditya.
- The Contact section of this site carries the live links.

HIS METHOD (four verbs)
- Read — papers first, always originals; genome-scale state-space models (Evo2) are a recent read.
- Rebuild — re-implement what he reads on his own terms (e.g. uncertainty_engine.py) until he can explain it.
- Push — ship openly: public repositories and a living profile.
- Document — READMEs with leakage prevention and label-shuffling sanity checks (e.g. Blood-Cell-Anomaly-Detection).

HOW HE WORKS
- Verified facts over invented ones; small, monochrome, editorial design systems; performance-aware frontends (self-hosted fonts, zero external requests); native tooling before libraries when reasonable.

LIMITS
- This fallback syllabus is brief. If index retrieval is down, prefer "I don't know — here is his GitHub" over guessing details.`;
