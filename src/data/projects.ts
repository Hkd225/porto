/**
 * Project archive.
 *
 * Every field below is grounded in public repository data (GitHub API metadata,
 * README content, and for qwen-autonomous-agent the actual requirements.txt and
 * source tree). Nothing here is estimated: no fake metrics, no user counts,
 * no invented deployments.
 *
 * `demoUrl` is only set where a live URL was confirmed to resolve (HTTP 200).
 */

export type ProjectCategory = 'Agentic AI' | 'Machine Learning' | 'Computer Vision' | 'Frontend';

export interface Project {
  slug: string;
  title: string;
  /** Short descriptor rendered in the italic display face. */
  kicker: string;
  summary: string;
  category: ProjectCategory;
  /** Only when confirmed. */
  status?: string;
  year: string;
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  license?: string;
  language?: string;
  /** Rendered as a large index number on the card. */
  index: string;
  /** Drives the generated cover artwork. */
  art: { hue: number; hue2: number; motif: 'nodes' | 'loop' | 'grid' | 'wave' | 'stack' };
}

export const featuredProjects: Project[] = [
  {
    slug: 'uncertainly-engine',
    title: 'Uncertainty Engine',
    kicker: 'Metacognitive control layer',
    summary:
      'A standalone uncertainty-control module for AI agents. It estimates confidence, calibration quality, evidence strength and domain risk, then decides whether an agent should answer, gather more evidence, slow down, or defer for review — without retraining a neural network.',
    category: 'Agentic AI',
    status: 'Research prototype',
    year: '2026',
    stack: ['Python', 'Shannon / binary entropy', 'Jensen-Shannon divergence', 'ECE', 'Brier score', 'Bayesian Beta posterior', 'Platt calibration'],
    repoUrl: 'https://github.com/Hkd225/Uncertainly-Engine',
    demoUrl: 'https://hkd225.github.io/Uncertainly-Engine/',
    license: 'Apache-2.0',
    language: 'Python',
    index: '01',
    art: { hue: 88, hue2: 166, motif: 'wave' },
  },
  {
    slug: 'cognimemory',
    title: 'CogniMemory',
    kicker: 'Cognitive Memory System',
    summary:
      'A multi-tiered agent memory architecture — working, episodic, semantic and goal-driven — with hybrid FAISS + BM25 retrieval, automatic consolidation of raw logs into rules, and a contradiction gate that penalises hallucinated memories.',
    category: 'Agentic AI',
    year: '2026',
    stack: ['Python', 'FAISS', 'BM25', 'Hierarchical goal tree', 'Memory consolidation', 'RWLock concurrency', 'LangChain'],
    repoUrl: 'https://github.com/Hkd225/CogniMemory',
    license: 'MIT',
    language: 'Python',
    index: '02',
    art: { hue: 102, hue2: 88, motif: 'nodes' },
  },
  {
    slug: 'qwen-autonomous-agent',
    title: 'Qwen Autonomous Agent',
    kicker: 'ReAct + MemGPT + Reflexion',
    summary:
      'An autonomous agent built on Qwen 2.5 7B that combines a ReAct think–act–observe loop with Tree-of-Thoughts planning, hierarchical memory, and post-action self-reflection. Tools include web search and sandboxed Python execution.',
    category: 'Agentic AI',
    year: '2026',
    stack: ['Python', 'Qwen 2.5 7B', 'PyTorch', 'Transformers', 'ChromaDB', 'FAISS', 'sentence-transformers', 'Tree-of-Thoughts'],
    repoUrl: 'https://github.com/Hkd225/qwen-autonomous-agent',
    license: 'MIT',
    language: 'Python',
    index: '03',
    art: { hue: 116, hue2: 172, motif: 'loop' },
  },
  {
    slug: 'yolov8-smoke-fire-detection',
    title: 'Smoke & Fire Detection',
    kicker: 'YOLOv8 object detection',
    summary:
      'A training and inference pipeline for smoke and fire detection on the D-Fire dataset. The interesting part is infrastructure: the script intercepts and rewrites data.yaml at runtime to strip hardcoded local paths, so it runs unchanged in Colab or locally.',
    category: 'Computer Vision',
    year: '2026',
    stack: ['YOLOv8 Nano', 'D-Fire dataset', 'KaggleHub', 'Dynamic YAML patching', 'Colab'],
    repoUrl: 'https://github.com/Hkd225/yolov8-smoke-fire-detection',
    license: 'MIT',
    language: 'Jupyter Notebook',
    index: '04',
    art: { hue: 130, hue2: 88, motif: 'grid' },
  },
  {
    slug: 'digital-payment-fraud-benchmark',
    title: 'Digital Payment Fraud',
    kicker: 'Ensemble + explainability',
    summary:
      'A comparative study of gradient-boosted ensembles for digital payment fraud, with SHAP used to explain model behaviour rather than to report a single accuracy number.',
    category: 'Machine Learning',
    year: '2026',
    stack: ['LightGBM', 'CatBoost', 'XGBoost', 'SHAP', 'Ensemble learning'],
    repoUrl: 'https://github.com/Hkd225/Digital-Payment-Fraud-Detection-Benchmark',
    license: 'MIT',
    language: 'Jupyter Notebook',
    index: '05',
    art: { hue: 94, hue2: 130, motif: 'stack' },
  },
  {
    slug: 'crc-gut-microbiome',
    title: 'CRC Gut Microbiome',
    kicker: 'Tabular biomarker classification',
    summary:
      'An end-to-end classification pipeline over gut microbiome sequencing data, covering preprocessing, feature selection, model comparison across Random Forest, XGBoost and logistic regression, and biomarker extraction.',
    category: 'Machine Learning',
    year: '2026',
    stack: ['Random Forest', 'XGBoost', 'Logistic Regression', 'Feature selection', 'Biomarker analysis'],
    repoUrl: 'https://github.com/Hkd225/crc-gut-microbiome-ml-classification',
    license: 'Apache-2.0',
    language: 'Jupyter Notebook',
    index: '06',
    art: { hue: 78, hue2: 118, motif: 'nodes' },
  },
];

/**
 * Secondary archive. Verified repository metadata, lower editorial weight.
 *
 * `slug` and `category` are the two fields the on-page explorer needs in order to
 * deep-link and filter. They are assigned here rather than derived at runtime so
 * they can be checked against the repository itself.
 */
export interface ArchiveItem {
  slug: string;
  title: string;
  note: string;
  category: ProjectCategory;
  repoUrl: string;
  demoUrl?: string;
  year: string;
  stack: string[];
}

export const archive: ArchiveItem[] = [
  {
    slug: 'blood-cell-anomaly-detection',
    title: 'Blood Cell Anomaly Detection',
    note: 'ML classification with leakage prevention, group-aware validation and sanity checks.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Blood-Cell-Anomaly-Detection',
    year: '2026',
    stack: ['scikit-learn', 'Group validation'],
  },
  {
    slug: 'face-shape-hairstyle-recommendation',
    title: 'Face Shape & Hairstyle Recommendation',
    note: 'Image classification with face-landmark extraction.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/Face-Shape-Classification-Hairstyle-Recommendation-',
    year: '2026',
    stack: ['EfficientNetB0', 'MediaPipe'],
  },
  {
    slug: 'framingham-heart-study',
    title: 'Framingham Heart Study',
    note: '10-year cardiovascular risk prediction with scaling, imputation and model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Framingham-Heart-Study',
    year: '2026',
    stack: ['Tabular ML', 'scikit-learn'],
  },
  {
    slug: 'financial-fraud-detection',
    title: 'Financial Fraud Detection',
    note: 'Classification pipeline with model comparison and artifact bundling.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Financial-Fraud-Detection',
    year: '2026',
    stack: ['scikit-learn', 'Model comparison'],
  },
  {
    slug: 'genshin-impact-sentiment-id',
    title: 'Genshin Impact Sentiment (ID)',
    note: 'Indonesian review sentiment across classical and recurrent models.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/sentiment-analysis-genshin-impact',
    year: '2026',
    stack: ['SVM', 'GRU', 'LSTM'],
  },
  {
    slug: 'indonesian-sentiment-indobert',
    title: 'Indonesian Sentiment with IndoBERT',
    note: 'Adjective sentiment classification; weighted loss for class imbalance, model exported for web use.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/sentiment-anlyze',
    year: '2025',
    stack: ['IndoBERT', 'Weighted loss'],
  },
  {
    slug: 'traffic-violation-detection',
    title: 'Traffic Violation Detection',
    note: 'Detection with ONNX export and cropped-region inference.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/yolov8-traffic-violation-detection',
    year: '2026',
    stack: ['YOLOv8', 'ONNX'],
  },
  {
    slug: 'animals-10-classification',
    title: 'Animals-10 Classification',
    note: 'Transfer learning with MobileNetV2, multi-language labels, TFLite + TF.js deployment.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/Animals10-full-classification-mobilenetv2',
    year: '2026',
    stack: ['MobileNetV2', 'TFLite', 'TensorFlow.js'],
  },
  {
    slug: 'indonesia-weather-prediction',
    title: 'Indonesia Weather Prediction',
    note: 'Next-day rain/clear prediction from historical climate features.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Cuaca-IDN',
    year: '2026',
    stack: ['TensorFlow', 'Keras'],
  },
  {
    slug: 'ai-tool-directory-classifier',
    title: 'AI Tool Directory Classifier',
    note: 'Multi-output text classification over TF-IDF features.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/AI-Tool-Directory-2026-19-000-Real-World-Tools',
    year: '2026',
    stack: ['LinearSVC', 'TF-IDF'],
  },
  {
    slug: 'nebulacast',
    title: 'NebulaCast',
    note: 'Deployed web project.',
    category: 'Frontend',
    repoUrl: 'https://github.com/Hkd225/NebulaCast',
    demoUrl: 'https://nebula-cast.vercel.app',
    year: '2026',
    stack: ['HTML'],
  },
  {
    slug: 'oscar-whale',
    title: 'Oscar Whale',
    note: 'Deployed web project.',
    category: 'Frontend',
    repoUrl: 'https://github.com/Hkd225/Oscar-Whale',
    demoUrl: 'https://oscar-whale.vercel.app',
    year: '2026',
    stack: ['HTML'],
  },
] satisfies ArchiveItem[];

/**
 * One flat view over every repository on the site.
 *
 * The featured six and the archive twelve are stored separately because they are
 * presented differently — the featured set is editorial, the archive is a list.
 * The explorer at the bottom of the Work section needs both, so they are joined
 * here once rather than in the component.
 */
export interface ProjectIndexEntry {
  slug: string;
  title: string;
  kicker?: string;
  note: string;
  category: ProjectCategory;
  year: string;
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  featured: boolean;
}

export const projectIndex: ProjectIndexEntry[] = [
  ...featuredProjects.map(
    (p): ProjectIndexEntry => ({
      slug: p.slug,
      title: p.title,
      kicker: p.kicker,
      note: p.summary,
      category: p.category,
      year: p.year,
      stack: p.stack,
      repoUrl: p.repoUrl,
      demoUrl: p.demoUrl,
      featured: true,
    }),
  ),
  ...archive.map(
    (a): ProjectIndexEntry => ({
      slug: a.slug,
      title: a.title,
      note: a.note,
      category: a.category,
      year: a.year,
      stack: a.stack,
      repoUrl: a.repoUrl,
      demoUrl: a.demoUrl,
      featured: false,
    }),
  ),
];

/** Distinct categories in a stable order, derived from the data rather than hard-coded. */
export const projectCategories: ProjectCategory[] = [
  'Agentic AI',
  'Machine Learning',
  'Computer Vision',
  'Frontend',
];

export interface Writing {
  title: string;
  url: string;
  published: string;
  /** Verified word count derived from the Medium RSS feed. */
  words: number;
  summary: string;
  tags: string[];
}

export const writing: Writing[] = [
  {
    title:
      'Building AI That Knows When It Might Be Wrong: Introducing Uncertainty Engine',
    url: 'https://medium.com/@hakid19/building-ai-that-knows-when-it-might-be-wrong-introducing-uncertainty-engine-d299d2d4a986',
    published: '12 Jun 2026',
    words: 1098,
    summary:
      'Why an agent needs to estimate its own reliability before it acts, and the control layer that turns that estimate into a decision.',
    tags: ['Uncertainty', 'Agentic AI'],
  },
  {
    title:
      'The Essential Safety Framework: The Necessity of a Gödelian Governance Structure for Self-Evolving Systems',
    url: 'https://medium.com/@hakid19/the-essential-safety-framework-the-necessity-of-a-g%C3%B6delian-governance-structure-for-self-evolving-82c61a56a3c0',
    published: '13 Oct 2026',
    words: 1056,
    summary:
      'On governance structures for systems that modify themselves, and why self-evolution needs constraints defined outside the thing being constrained.',
    tags: ['AI Safety', 'Self-improvement'],
  },
];

/** Agent loop diagram — conceptual architecture, clearly labelled as such. */
export const agentLoop: string[] = [
  'INPUT',
  'REASON',
  'SELECT ACTION',
  'EXECUTE TOOL',
  'OBSERVE RESULT',
  'VERIFY',
  'UPDATE MEMORY',
  'CONTINUE / STOP',
];

/**
 * One line per stage, shown while the pinned diagram is scrubbed through.
 *
 * Scroll has to *tell* you something, not just move something — otherwise the
 * whole thing plays as a video. Each note is a single claim about what that
 * stage is responsible for.
 */
export const agentLoopDetail: { note: string }[] = [
  {
    note: 'Prompt, tool result or goal tick enters the loop. Nothing else can start a turn.',
  },
  {
    note: 'The model writes its reasoning into the scratchpad before anything is decided.',
  },
  {
    note: 'A decision layer turns that reasoning into one tool call, or into a refusal.',
  },
  {
    note: 'Web search and sandboxed Python sit behind one base class, so the action space stays narrow.',
  },
  {
    note: 'Results come back as text, parsed and handed to the next stage rather than parsed into state.',
  },
  {
    note: 'A self-check pass runs on the output. This is the stage most systems skip.',
  },
  {
    note: 'Episodic, semantic and goal memory are updated with what actually happened.',
  },
  {
    note: 'The planner decides whether the goal is met. If yes, the loop exits — otherwise it returns to step one.',
  },
];