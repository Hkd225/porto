/**
 * Model weights published on Hugging Face.
 *
 * Same ground rules as `projects.ts`: every field below is read from the public
 * Hugging Face API (`/api/models?author=…` and each repo's `README.md`), not
 * estimated. Parameter counts come from the `safetensors` metadata the Hub
 * reports; where a repo ships only a PEFT adapter there is no honest parameter
 * count to show, so `params` is left undefined rather than filled with the base
 * model's size.
 *
 * `published` is the repo's `createdAt` date.
 */

export type HFKind = 'model' | 'space' | 'dataset';

/**
 * Whether the repo holds full weights or only a PEFT/LoRA adapter.
 *
 * This is the single most useful thing to know before loading one: an adapter is
 * a few megabytes and needs its base model present, a merged repo is the whole
 * network. It comes straight from the file listing — `adapter_model.safetensors`
 * versus numbered `model-*-of-*.safetensors` shards.
 */
export type HFWeights = 'adapter' | 'merged';

export interface HFArtifact {
  /** Repository name only — the owner is `HF_PROFILE`. */
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  kind: HFKind;
  weights: HFWeights;
  /** Only where the Hub reports safetensors metadata. */
  params?: number;
  /** The checkpoint this was fine-tuned from, owner included. */
  baseModel: string;
  pipeline?: string;
  downloads: number;
  likes: number;
  license: string;
  /** Training corpora, from the model card's `datasets:` field. */
  datasets?: string[];
  stack: string[];
  /** ISO month, from the repo's creation date. */
  published: string;
  art: { hue: number; hue2: number; motif: 'nodes' | 'loop' | 'grid' | 'wave' | 'stack' };
}

export const HF_PROFILE = 'Hakid';
export const HF_PROFILE_URL = `https://huggingface.co/${HF_PROFILE}`;
export const artifactUrl = (slug: string) => `${HF_PROFILE_URL}/${slug}`;

export const hfArtifacts: HFArtifact[] = [
  {
    slug: 'qwen25-3b-alpaca-id-qlora',
    title: 'Alpaca-ID QLoRA',
    kicker: 'Qwen 2.5 3B · merged weights',
    summary:
      'A QLoRA fine-tune of Qwen 2.5 3B Instruct, published as full merged weights. Trained with Unsloth and TRL — the card notes the 2× speedup over a standard HF training loop.',
    kind: 'model',
    weights: 'merged',
    params: 3_085_938_688,
    baseModel: 'unsloth/Qwen2.5-3B-Instruct-bnb-4bit',
    pipeline: 'text-generation',
    downloads: 15,
    likes: 0,
    license: 'apache-2.0',
    stack: ['QLoRA', 'Unsloth', 'TRL', 'safetensors', 'Qwen2'],
    published: '2026-06',
    art: { hue: 88, hue2: 166, motif: 'loop' },
  },
  {
    slug: 'qwen25-3b-alpaca-id-grpo',
    title: 'Alpaca-ID GRPO',
    kicker: 'Reinforcement pass on the QLoRA',
    summary:
      'Group Relative Policy Optimization applied on top of the QLoRA above — an adapter that ships beside its own base rather than as a second full copy of the network.',
    kind: 'model',
    weights: 'adapter',
    baseModel: 'Hakid/qwen25-3b-alpaca-id-qlora',
    pipeline: 'text-generation',
    downloads: 0,
    likes: 0,
    license: 'apache-2.0',
    stack: ['GRPO', 'TRL', 'PEFT adapter', 'Qwen2'],
    published: '2026-06',
    art: { hue: 102, hue2: 88, motif: 'nodes' },
  },
  {
    slug: 'ai-research-assistant-qwen3-4b-lora',
    title: 'Research Assistant · Qwen3 4B',
    kicker: 'LoRA adapter · tool calling',
    summary:
      'A LoRA adapter over Qwen3 4B Instruct, trained for research-assistant behaviour. The tokenizer template carries Qwen3’s multi-step tool-calling format.',
    kind: 'model',
    weights: 'adapter',
    baseModel: 'unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit',
    pipeline: 'text-generation',
    downloads: 0,
    likes: 0,
    license: 'apache-2.0',
    stack: ['LoRA', 'PEFT', 'Unsloth', 'TRL', 'Qwen3'],
    published: '2026-06',
    art: { hue: 116, hue2: 172, motif: 'grid' },
  },
  {
    slug: 'ai-research-assistant-qwen35-4b-lora-safe',
    title: 'Research Assistant · Safe',
    kicker: 'Grounded answers with a stated limit',
    summary:
      'The most fully documented of the set. Trained on QASPER and SciTLDR with QASPER samples lacking evidence filtered out, so the model learns to answer from context and to say when the context is not enough. Output is fixed to three fields — Answer, Evidence, Limitation.',
    kind: 'model',
    weights: 'adapter',
    baseModel: 'unsloth/Qwen3.5-4B',
    pipeline: 'text-generation',
    downloads: 0,
    likes: 0,
    license: 'apache-2.0',
    datasets: ['allenai/qasper', 'allenai/scitldr'],
    stack: [
      'LoRA',
      'PEFT',
      'Unsloth',
      'QASPER',
      'SciTLDR',
      'Conservative training profile',
    ],
    published: '2026-06',
    art: { hue: 130, hue2: 88, motif: 'stack' },
  },
  {
    slug: 'marketmind-qwen35-9b-crewai-rag-lora',
    title: 'MarketMind 9B',
    kicker: 'Qwen 3.5 9B · merged weights',
    summary:
      'A LoRA fine-tune of Qwen 3.5 9B built for a CrewAI retrieval pipeline, published as merged weights — 9.65B parameters across four safetensors shards.',
    kind: 'model',
    weights: 'merged',
    params: 9_653_104_368,
    baseModel: 'unsloth/Qwen3.5-9B',
    pipeline: 'text-generation',
    downloads: 0,
    likes: 0,
    license: 'apache-2.0',
    stack: ['LoRA', 'Unsloth', 'CrewAI', 'RAG', 'Qwen3.5'],
    published: '2026-06',
    art: { hue: 94, hue2: 130, motif: 'wave' },
  },
];

export const models = hfArtifacts.filter((a) => a.kind === 'model');
export const spaces = hfArtifacts.filter((a) => a.kind === 'space');
export const datasets = hfArtifacts.filter((a) => a.kind === 'dataset');

/** Total parameters actually published — adapters contribute none of their own. */
export const totalParams = models.reduce((n, m) => n + (m.params ?? 0), 0);
export const totalDownloads = hfArtifacts.reduce((n, a) => n + a.downloads, 0);
export const adapterCount = hfArtifacts.filter((a) => a.weights === 'adapter').length;
export const mergedCount = hfArtifacts.filter((a) => a.weights === 'merged').length;

/** 3_085_938_688 → "3.09B" */
export const formatParams = (n?: number): string =>
  n === undefined ? '—' : `${(n / 1e9).toFixed(2)}B`;

/**
 * Fine-tuning lineages, walked by ancestry rather than grouped by base.
 *
 * The distinction matters here. Grouping by `baseModel` would file the GRPO
 * adapter under `Hakid/qwen25-3b-alpaca-id-qlora` as though that were just
 * another public checkpoint, which flattens the most interesting fact about the
 * set: two of these checkpoints were trained *on top of each other*, one
 * public base leading to the second stage.
 *
 * So the roots are the artifacts whose base is not itself one of these repos,
 * and each chain is followed forwards for as long as something points at it.
 */
export interface Lineage {
  key: string;
  base: string;
  stages: { slug: string; title: string; weights: HFWeights }[];
}

export const lineages: Lineage[] = (() => {
  /** True when `base` is one of these repos rather than a public checkpoint. */
  const isOwn = (base: string) => models.some((o) => base === `${HF_PROFILE}/${o.slug}`);

  const roots = models.filter((m) => !isOwn(m.baseModel));

  return roots.map((root) => {
    const stages: Lineage['stages'] = [];
    const seen = new Set<string>();
    let cursor: HFArtifact | undefined = root;

    while (cursor && !seen.has(cursor.slug)) {
      seen.add(cursor.slug);
      stages.push({
        slug: cursor.slug,
        title: cursor.title,
        weights: cursor.weights,
      });
      /* `cursor` still holds the previous value while the predicate runs, so
         this correctly follows "who was fine-tuned from the repo I just
         pushed?" — no `isOwn` guard here, or the first hop out of a public
         base would terminate the walk immediately. */
      const current: HFArtifact = cursor;
      cursor = models.find((m) => m.baseModel === `${HF_PROFILE}/${current.slug}`);
    }

    return { key: root.baseModel, base: root.baseModel, stages };
  });
})();