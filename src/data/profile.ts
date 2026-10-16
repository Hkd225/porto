/**
 * Central profile configuration.
 * Every external link here was verified to resolve during research.
 *
 * VERIFICATION NOTES
 * - GitHub       : https://github.com/Hkd225 — verified via GitHub API. Public profile.
 * - Hugging Face : https://huggingface.co/Hakid — verified, HTTP 200, 5 public models.
 *                  (Note: the handle is capitalised `Hakid`; the HF API is case-sensitive,
 *                  so `author=hkd225` returns 404.)
 * - Medium       : https://medium.com/@hakid19 — verified via the profile RSS feed (2 posts).
 * - LinkedIn     : supplied by the site owner; LinkedIn blocks automated verification,
 *                  so this link is self-declared rather than machine-checked.
 *                  The slug still reads "auffa" — that is the real profile path and
 *                  must not be rewritten. The on-screen handle is set separately in
 *                  components/Contact.tsx.
 * - Email        : muhammadaufahakimaditya@gmail.com — supplied by the site owner.
 *                  Published as a mailto plus a copy-to-clipboard control, so the
 *                  section has a route that actually works without a form
 *                  backend.
 */

export const profile = {
  name: 'Muhammad Auffa Hakim Aditya',
  /** Left side of the nav — the public-facing brand mark. */
  navMark: 'Hakid.',
  /** Secondary mark shown beside the nav wordmark. */
  altMark: 'MA',
  monogram: 'MA',

  roles: [
    'AI/ML Engineer',
    'Independent AI Systems Researcher',
    'Agentic AI Developer',
  ],

  /**
   * Draft brand statement. This is original copy written for this site,
   * not a quotation from the person it describes.
   */
  statement:
    'Build systems that reason, remember, adapt, and know when they might be wrong.',

  bio: "I build and experiment with AI systems, autonomous agents, and machine learning architectures. My work explores how software can reason through tasks, retain useful memories, evaluate uncertainty, and make better decisions.",

  longBio: [
    "I'm interested in building AI systems that do more than generate responses. I explore how models can use tools, organize memory, reason through complex tasks, estimate uncertainty, and improve through structured evaluation.",
    'Most of my work is self-directed: reading a paper, rebuilding the idea, and then pushing on the part that was left vague. The agentic projects are extracted from larger cognitive architectures I was designing, which is why they are structured as standalone modules rather than demos.',
    'This site documents that work honestly. Project descriptions are taken from the repositories themselves, including the README, file structure and dependency list — not from aspiration.',
  ],

  /**
   * Deliberately conservative: the public GitHub profile has no location and
   * no website, so nothing is invented here.
   */
  meta: {
    /** Shown in the hero — real numbers from the GitHub API. */
    publicRepos: 37,
    followers: 2,
    /** GitHub account created — verified from the API. */
    githubSince: '2025',
    /** Public models on the Hugging Face profile — verified from the HF API. */
    hfModels: 5,
  },

  /** Neutral availability copy (no unverified claims). */
  availability: 'INDEPENDENT AI PROJECTS',

  /**
   * Ticker under the hero. Real tools from the repositories on this site, not
   * a logo wall of things that were never actually used.
   */
  ticker: [
    'ReAct',
    'Reflexion',
    'Tree-of-Thoughts',
    'FAISS',
    'BM25',
    'PyTorch',
    'YOLOv8',
    'ONNX',
    'SHAP',
    'LangChain',
    'ChromaDB',
    'IndoBERT',
    'Jensen-Shannon',
    'Calibration',
    'Agent Memory',
    'Self-verification',
  ],

  links: {
    github: 'https://github.com/Hkd225',
    /** Capitalised handle — verified. */
    huggingface: 'https://huggingface.co/Hakid',
    /** Still linked from the Notes section, which cites the real published posts. */
    medium: 'https://medium.com/@hakid19',
    /** Real, immutable LinkedIn slug — kept verbatim. Display name lives in Contact.tsx. */
    linkedin: 'https://id.linkedin.com/in/muhammad-auffa-hakim-aditya',
    /**
     * Published address. There is no contact form because there is no
     * submission endpoint — a form that silently drops messages is worse than
     * no form, so the address is offered directly plus a copy control.
     */
    email: 'muhammadaufahakimaditya@gmail.com',
  },

  /**
   * Areas of work and interest. Explicitly NOT certifications or proficiency scores.
   */
  focus: [
    {
      id: 'agentic',
      label: 'Agentic AI',
      blurb: 'Planning loops, reflection after action, and reliable tool execution.',
      items: ['ReAct', 'Reflexion', 'Tree-of-Thoughts', 'Tool use', 'Self-verification'],
    },
    {
      id: 'memory',
      label: 'Memory & Retrieval',
      blurb: 'Hybrid dense + sparse retrieval, consolidation, and contradiction detection.',
      items: ['FAISS', 'BM25', 'ChromaDB', 'Hybrid ranking', 'Episodic memory'],
    },
    {
      id: 'ml',
      label: 'Machine Learning',
      blurb: 'Tabular pipelines, leakage-aware validation, and model comparison.',
      items: ['scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'SHAP', 'leakage control'],
    },
    {
      id: 'cv',
      label: 'Computer Vision',
      blurb: 'Detection and classification workflows built for reproducible training.',
      items: ['YOLOv8', 'MobileNetV2', 'EfficientNetB0', 'MediaPipe', 'ONNX'],
    },
    {
      id: 'eval',
      label: 'Uncertainty & Evaluation',
      blurb: 'Calibration, disagreement and risk-aware decision gating.',
      items: ['ECE', 'Brier score', 'Jensen-Shannon divergence', 'Beta posterior', 'Hallucination control'],
    },
    {
      id: 'fe',
      label: 'Frontend for AI',
      blurb: 'Interfaces that make model behaviour inspectable rather than magic.',
      items: ['React', 'TypeScript', 'GSAP', 'Canvas', 'WebGL'],
    },
  ],
} as const;

export type Profile = typeof profile;