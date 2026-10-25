/**
 * Project archive.
 *
 * Every field is grounded in public repository data (GitHub API metadata,
 * README content, dependency lists). Nothing estimated: no fake metrics, no
 * invented deployments. `demoUrl` appears only where a live URL resolved.
 */

export type Category = 'Agentic AI' | 'Machine Learning' | 'Computer Vision' | 'Frontend' | 'Systems';

export interface Project {
  slug: string;
  title: string;
  /** Short descriptor rendered in the italic display face. */
  kicker: string;
  summary: string;
  category: Category;
  status?: string;
  year: string;
  stack: string[];
  repoUrl: string;
  demoUrl?: string;
  /** Rendered as a large index numeral on the card. */
  index: string;
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
    stack: ['Python', 'Entropy', 'Jensen–Shannon', 'ECE', 'Brier score', 'Platt calibration'],
    repoUrl: 'https://github.com/Hkd225/Uncertainly-Engine',
    demoUrl: 'https://hkd225.github.io/Uncertainly-Engine/',
    index: '01',
  },
  {
    slug: 'cognimemory',
    title: 'CogniMemory',
    kicker: 'Cognitive memory system',
    summary:
      'A multi-tiered agent memory architecture — working, episodic, semantic and goal-driven — with hybrid FAISS + BM25 retrieval, automatic consolidation of raw logs into rules, and a contradiction gate that penalises hallucinated memories.',
    category: 'Agentic AI',
    year: '2026',
    stack: ['Python', 'FAISS', 'BM25', 'Goal tree', 'Consolidation', 'LangChain'],
    repoUrl: 'https://github.com/Hkd225/CogniMemory',
    index: '02',
  },
  {
    slug: 'qwen-autonomous-agent',
    title: 'Qwen Autonomous Agent',
    kicker: 'ReAct + MemGPT + Reflexion',
    summary:
      'An autonomous agent built on Qwen 2.5 7B that combines a ReAct think–act–observe loop with Tree-of-Thoughts planning, hierarchical memory, and post-action self-reflection. Tools include web search and sandboxed Python execution.',
    category: 'Agentic AI',
    year: '2026',
    stack: ['Python', 'Qwen 2.5 7B', 'PyTorch', 'ChromaDB', 'Tree-of-Thoughts'],
    repoUrl: 'https://github.com/Hkd225/qwen-autonomous-agent',
    index: '03',
  },
  {
    slug: 'yolov8-smoke-fire-detection',
    title: 'Smoke & Fire Detection',
    kicker: 'YOLOv8 object detection',
    summary:
      'A training and inference pipeline for smoke and fire detection on the D-Fire dataset. The interesting part is infrastructure: the script intercepts and rewrites data.yaml at runtime to strip hardcoded local paths, so it runs unchanged in Colab or locally.',
    category: 'Computer Vision',
    year: '2026',
    stack: ['YOLOv8 Nano', 'D-Fire', 'KaggleHub', 'Dynamic YAML patching'],
    repoUrl: 'https://github.com/Hkd225/yolov8-smoke-fire-detection',
    index: '04',
  },
  {
    slug: 'digital-payment-fraud-benchmark',
    title: 'Digital Payment Fraud',
    kicker: 'Ensemble + explainability',
    summary:
      'A comparative study of gradient-boosted ensembles for digital payment fraud, with SHAP used to explain model behaviour rather than to report a single accuracy number.',
    category: 'Machine Learning',
    year: '2026',
    stack: ['LightGBM', 'CatBoost', 'XGBoost', 'SHAP'],
    repoUrl: 'https://github.com/Hkd225/Digital-Payment-Fraud-Detection-Benchmark',
    index: '05',
  },
  {
    slug: 'crc-gut-microbiome',
    title: 'CRC Gut Microbiome',
    kicker: 'Tabular biomarker classification',
    summary:
      'An end-to-end classification pipeline over gut microbiome sequencing data, covering preprocessing, feature selection, model comparison across Random Forest, XGBoost and logistic regression, and biomarker extraction.',
    category: 'Machine Learning',
    year: '2026',
    stack: ['Random Forest', 'XGBoost', 'Logistic Regression', 'Biomarkers'],
    repoUrl: 'https://github.com/Hkd225/crc-gut-microbiome-ml-classification',
    index: '06',
  },
  {
    slug: 'nebulacast',
    title: 'NebulaCast',
    kicker: 'In-browser edge ML',
    summary:
      'A weather predictor that runs in the browser: a TensorFlow.js model evaluates on the edge while GSAP drives the interface — an end-to-end deployed artifact rather than a notebook or a server behind an API.',
    category: 'Frontend',
    year: '2026',
    stack: ['TensorFlow.js', 'Keras', 'GSAP'],
    repoUrl: 'https://github.com/Hkd225/NebulaCast',
    demoUrl: 'https://nebula-cast.vercel.app',
    index: '07',
  },
  {
    slug: 'oscar-whale',
    title: 'Oscar Whale',
    kicker: 'Digital studio, live',
    summary:
      'The live storefront of Oscar Whale — a Surabaya digital studio for presentation templates, web design and curated premium assets — staged as a scroll-led marketing site from concept through release.',
    category: 'Frontend',
    year: '2026',
    stack: ['HTML', 'CSS'],
    repoUrl: 'https://github.com/Hkd225/Oscar-Whale',
    demoUrl: 'https://oscar-whale.vercel.app',
    index: '08',
  },
];

/**
 * Secondary archive — verified repository metadata with lower editorial weight.
 */
export interface ArchiveItem {
  slug: string;
  title: string;
  note: string;
  category: Category;
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
    stack: ['MobileNetV2', 'TFLite', 'TF.js'],
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
    slug: 'worker-burnout-attrition',
    title: 'Worker Burnout & Attrition',
    note: 'Burnout and attrition risk prediction with model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/AI-Worker-Burnout-Attrition-Risk',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'antenna-fault-detection',
    title: 'Antenna Fault Detection',
    note: 'Fault classification with model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Antenna-Fault-Detection',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'credit-card-fraud-10-models',
    title: 'Credit Card Fraud',
    note: 'Fraud classification benchmarking ten models.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Credit-Card-Fraud-Detection',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'ev-battery-qc',
    title: 'EV Battery Quality Control',
    note: 'Battery quality-control classification with ten-model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/EV-Battery-QC-Synthetic-Detect.',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'cardiovascular-disease',
    title: 'Cardiovascular Disease',
    note: 'Disease prediction with ten-model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Cardiovascular-Disease',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'alzheimer-diagnosis',
    title: "Alzheimer's Diagnosis",
    note: 'Diagnosis classification with ten-model comparison.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Alzheimer-s-Disease',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'spam-ham-phishing',
    title: 'Spam · Ham · Phishing',
    note: 'Logistic regression over TF-IDF for three-way email triage.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/The-Biggest-Spam-Ham-Phish-Email',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'spambase-benchmark',
    title: 'Spambase Benchmark',
    note: 'Ensemble, SVM and neural-network spam benchmark on the Spambase dataset.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Spam-Email-Classification',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'mental-health-risk',
    title: 'Mental Health Risk',
    note: 'Risk assessment into low, moderate and high levels across multiple models.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Mental-Health-Risk-Classification-Project',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'car-price-prediction',
    title: 'Car Price Prediction',
    note: 'Car price prediction from tabular features.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Prediksi-Harga-Mobil-ML',
    year: '2025',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'just-practice',
    title: 'Notebook Practice',
    note: 'Practice notebooks.',
    category: 'Machine Learning',
    repoUrl: 'https://github.com/Hkd225/Just_Practice',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'cnn4-animal-class',
    title: 'Animals-10 Custom CNN',
    note: 'Custom CNN plus MobileNetV2 on the four largest classes; multi-platform deployment.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/CNN-4--Animal-class',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'cnn-bunga',
    title: 'CIFAR-100 Flower CNN',
    note: 'Flower classification via MobileNetV2 transfer learning; TFLite and TF.js deployment.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/CNN-Bunga',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'intel-image-cnn',
    title: 'Intel Image Classification',
    note: 'Custom CNN with TensorFlow Lite for edge deployment.',
    category: 'Computer Vision',
    repoUrl: 'https://github.com/Hkd225/Intel-Image-Classification-using-Custom-CNN',
    year: '2026',
    stack: ['Jupyter Notebook'],
  },
  {
    slug: 'technoversary25-webdesign',
    title: "Technoverse '25 Web Design",
    note: 'Event web design piece for Oscar Whale.',
    category: 'Frontend',
    repoUrl: 'https://github.com/Hkd225/webdesign_OscarWhale_technoversary25',
    year: '2025',
    stack: ['HTML'],
  },
  {
    slug: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    note: 'A browser tic-tac-toe game.',
    category: 'Frontend',
    repoUrl: 'https://github.com/Hkd225/tic-tac-toe',
    year: '2025',
    stack: ['JavaScript'],
  },
  {
    slug: 'portfolio-website-bootcamp',
    title: 'Bootcamp Portfolio Website',
    note: 'The earlier portfolio from the bootcamp track.',
    category: 'Frontend',
    repoUrl: 'https://github.com/Hkd225/Portofolio-Website-Bootcamp',
    year: '2025',
    stack: ['CSS'],
  },
  {
    slug: 'os-thread-synchronisation',
    title: 'OS Thread Synchronisation',
    note: 'Three concurrent threads with synchronisation so no race condition occurs.',
    category: 'Systems',
    repoUrl: 'https://github.com/Hkd225/TugasSistemOperasi',
    year: '2026',
    stack: ['C'],
  },
];

/** Distinct categories in a stable order. */
export const categories: Category[] = ['Agentic AI', 'Machine Learning', 'Computer Vision', 'Frontend', 'Systems'];

/** Count per category over featured + archive, validated against the data. */
export const categoryCounts: Record<string, number> = (() => {
  const counts: Record<string, number> = {};
  for (const c of categories) counts[c] = 0;
  for (const p of [...featuredProjects, ...archive]) counts[p.category] += 1;
  return counts;
})();

export interface Writing {
  title: string;
  url: string;
  published: string;
  /** Word count verified against the Medium RSS feed. */
  words: number;
  summary: string;
  tags: string[];
  /** Decorative texture, treated greyscale; credited in public/img/CREDITS.md. */
  art: string;
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
    art: '/img/writing-fog.jpg',
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
    art: '/img/writing-glass.jpg',
  },
];
