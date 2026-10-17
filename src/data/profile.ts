/**
 * Central profile configuration.
 *
 * Ground rules carried over from the previous build: every external link was
 * verified against the live profile (GitHub API, Hugging Face API, Medium RSS
 * feed). Nothing decorative is invented — no location, no certifications, no
 * false availability claims.
 */

export const profile = {
  name: 'Muhammad Auffa Hakim Aditya',
  /** The public-facing brand mark, top-left of the nav. */
  navMark: 'Hakid.',
  roles: ['AI/ML Engineer', 'Agentic AI Developer', 'AI Systems Researcher'],

  /**
   * The statement the whole site is organized around. Rendered by the hero as
   * big masked lines.
   */
  statement: 'Build systems that reason, remember, adapt, and know when they might be wrong.',

  manifesto: 'Read. Rebuild. Push the vague part. Document honestly.',

  bio: "I build and experiment with AI systems, autonomous agents, and machine learning architectures. My work explores how software can reason through tasks, retain useful memories, evaluate uncertainty, and make better decisions.",

  longBio: [
    "I'm interested in building AI systems that do more than generate responses. I explore how models can use tools, organize memory, reason through complex tasks, estimate uncertainty, and improve through structured evaluation.",
    'Most of my work is self-directed: reading a paper, rebuilding the idea, and then pushing on the part that was left vague. The agentic projects are extracted from larger cognitive architectures I was designing, which is why they are structured as standalone modules rather than demos.',
    'This site documents that work honestly. Project descriptions are taken from the repositories themselves — the README, the file structure, the dependency list — not from aspiration.',
  ],

  /** Verified numbers from the GitHub and Hugging Face APIs. */
  meta: {
    publicRepos: 37,
    followers: 2,
    githubSince: '2025',
    hfModels: 5,
  },

  availability: 'INDEPENDENT AI PROJECTS — BUILT AND DOCUMENTED IN PUBLIC',

  /** Real tools from the public repositories — not a logo wall of aspirations. */
  ticker: [
    'ReAct',
    'Reflexion',
    'Tree-of-Thoughts',
    'FAISS',
    'BM25',
    'PyTorch',
    'TensorFlow',
    'Keras',
    'YOLOv8',
    'ONNX',
    'SHAP',
    'LangChain',
    'Langflow',
    'ChromaDB',
    'IndoBERT',
    'Jensen–Shannon',
    'Calibration',
    'Agent Memory',
    'Self-verification',
    'Jupyter',
    'Google Colab',
  ],

  links: {
    github: 'https://github.com/Hkd225',
    /** Capitalised handle — the HF API is case-sensitive. */
    huggingface: 'https://huggingface.co/Hakid',
    medium: 'https://medium.com/@hakid19',
    /** Real profile slug, kept verbatim. */
    linkedin: 'https://id.linkedin.com/in/muhammad-auffa-hakim-aditya',
    /** Offered directly plus a copy control — no form that silently drops mail. */
    email: 'muhammadaufahakimaditya@gmail.com',
  },

  /**
   * Areas of work, in the order the focus carousel walks through them.
   * Deliberately NOT certifications or fake proficiency scores.
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
      blurb: 'Tabular pipelines, leakage-aware validation, and honest model comparison.',
      items: ['scikit-learn', 'XGBoost', 'LightGBM', 'CatBoost', 'SHAP'],
    },
    {
      id: 'cv',
      label: 'Computer Vision',
      blurb: 'Detection and classification workflows built for reproducible training.',
      items: ['YOLOv8', 'MobileNetV2', 'EfficientNetB0', 'MediaPipe', 'ONNX'],
    },
    {
      id: 'eval',
      label: 'Uncertainty & Eval',
      blurb: 'Calibration, disagreement, and risk-aware decision gating.',
      items: ['ECE', 'Brier score', 'Jensen–Shannon', 'Beta posterior', 'Hallucination control'],
    },
    {
      id: 'fe',
      label: 'Frontend for AI',
      blurb: 'Interfaces that make model behaviour inspectable rather than magic.',
      items: ['React', 'TypeScript', 'GSAP', 'Canvas', 'WebGL'],
    },
  ] as FocusArea[],

  /**
   * The method — the four-step loop behind every project, shown in the
   * manifesto section.
   */
  method: [
    {
      n: '01',
      word: 'Read',
      desc: 'Start from a paper, not a trend.',
      title: 'Start from the source.',
      detail:
        'Find the paper, isolate its central claim, and separate the method the authors actually ran from the assumptions they carried in.',
      tags: ['Research', 'Close reading', 'Extraction'],
    },
    {
      n: '02',
      word: 'Rebuild',
      desc: 'Reconstruct the idea by hand until it runs.',
      title: 'Rebuild it from zero.',
      detail:
        'No skimming ahead to the conclusions — the components are re-implemented by hand until the pipeline runs end to end on its own.',
      tags: ['From scratch', 'PyTorch', 'Iteration'],
    },
    {
      n: '03',
      word: 'Push',
      desc: 'Attack whatever the paper left vague.',
      title: 'Attack the vague part.',
      detail:
        'Benchmarks, ablations and stress cases aimed exactly at the section the original work left vague — that is where the interesting failures live.',
      tags: ['Baselines', 'Ablations', 'Stress cases'],
    },
    {
      n: '04',
      word: 'Document',
      desc: 'Publish what actually happened, honestly.',
      title: 'Write down what happened.',
      detail:
        'Results, failures and dead ends go into the repo as they happened — the history stays honest, and the work stays reproducible.',
      tags: ['Write-ups', 'Reproducibility', 'Honest history'],
    },
  ] as MethodStep[],
};

export interface FocusArea {
  id: string;
  label: string;
  blurb: string;
  items: string[];
}

export interface MethodStep {
  n: string;
  word: string;
  /** One-line gloss — sits in the right column of the active panel chrome. */
  desc: string;
  /** Headline of the active panel detail block. */
  title: string;
  /** Body copy of the active panel detail block. */
  detail: string;
  /** Tool / discipline tags for the step. */
  tags: string[];
}
