/**
 * Model weights published on Hugging Face.
 *
 * Same ground rules as projects.ts: every field is read from the public
 * Hugging Face API and each repo's model card, not estimated. Parameter counts
 * come from safetensors metadata; where a repo ships only a PEFT adapter the
 * honest parameter count is the base model's, so params stays undefined.
 */

export type Weights = 'adapter' | 'merged';

export interface HFArtifact {
  /** Repository name only — the owner is `HF_PROFILE`. */
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  weights: Weights;
  /** Only where the Hub reports safetensors metadata. */
  params?: number;
  /** The checkpoint this was fine-tuned from, owner included. */
  baseModel: string;
  datasets?: string[];
  stack: string[];
  /** ISO month, from the repo's creation date. */
  published: string;
}

export const HF_PROFILE = 'Hakid';
export const HF_PROFILE_URL = `https://huggingface.co/${HF_PROFILE}`;
export const artifactUrl = (slug: string) => `${HF_PROFILE_URL}/${slug}`;

export const hfArtifacts: HFArtifact[] = [
  {
    slug: 'marketmind-qwen35-9b-crewai-rag-lora',
    title: 'MarketMind 9B',
    kicker: 'Qwen 3.5 9B · merged weights',
    summary:
      'A LoRA fine-tune of Qwen 3.5 9B built for a CrewAI retrieval pipeline, published as merged weights — 9.65B parameters across four safetensors shards.',
    weights: 'merged',
    params: 9_653_104_368,
    baseModel: 'unsloth/Qwen3.5-9B',
    stack: ['LoRA', 'Unsloth', 'CrewAI', 'RAG'],
    published: '2026-06',
  },
  {
    slug: 'ai-research-assistant-qwen35-4b-lora-safe',
    title: 'Research Assistant · Safe',
    kicker: 'Grounded answers with a stated limit',
    summary:
      'The most fully documented of the set. Trained on QASPER and SciTLDR with evidence-free samples filtered out, so the model learns to answer from context and to say when the context is not enough. Output is fixed to three fields — Answer, Evidence, Limitation.',
    weights: 'adapter',
    baseModel: 'unsloth/Qwen3.5-4B',
    datasets: ['allenai/qasper', 'allenai/scitldr'],
    stack: ['LoRA', 'PEFT', 'QASPER', 'SciTLDR'],
    published: '2026-06',
  },
  {
    slug: 'ai-research-assistant-qwen3-4b-lora',
    title: 'Research Assistant · Qwen3 4B',
    kicker: 'LoRA adapter · tool calling',
    summary:
      'A LoRA adapter over Qwen3 4B Instruct, trained for research-assistant behaviour. The tokenizer template carries Qwen3’s multi-step tool-calling format.',
    weights: 'adapter',
    baseModel: 'unsloth/Qwen3-4B-Instruct-2507-unsloth-bnb-4bit',
    stack: ['LoRA', 'PEFT', 'Unsloth', 'TRL'],
    published: '2026-06',
  },
  {
    slug: 'qwen25-3b-alpaca-id-grpo',
    title: 'Alpaca-ID GRPO',
    kicker: 'Reinforcement pass on the QLoRA',
    summary:
      'Group Relative Policy Optimization applied on top of the QLoRA below — an adapter that ships beside its own base rather than as a second full copy of the network.',
    weights: 'adapter',
    baseModel: 'Hakid/qwen25-3b-alpaca-id-qlora',
    stack: ['GRPO', 'TRL', 'PEFT adapter'],
    published: '2026-06',
  },
  {
    slug: 'qwen25-3b-alpaca-id-qlora',
    title: 'Alpaca-ID QLoRA',
    kicker: 'Qwen 2.5 3B · merged weights',
    summary:
      'A QLoRA fine-tune of Qwen 2.5 3B Instruct, published as full merged weights. Trained with Unsloth and TRL — the card notes the 2× speedup over a standard HF training loop.',
    weights: 'merged',
    params: 3_085_938_688,
    baseModel: 'unsloth/Qwen2.5-3B-Instruct-bnb-4bit',
    stack: ['QLoRA', 'Unsloth', 'TRL', 'safetensors'],
    published: '2026-06',
  },
];

/** Total parameters actually published — adapters contribute none of their own. */
export const totalParams = hfArtifacts.reduce((n, m) => n + (m.params ?? 0), 0);
export const adapterCount = hfArtifacts.filter((a) => a.weights === 'adapter').length;
export const mergedCount = hfArtifacts.filter((a) => a.weights === 'merged').length;

/** 3_085_938_688 → "3.09B" */
export const formatParams = (n?: number): string =>
  n === undefined ? '—' : `${(n / 1e9).toFixed(2)}B`;
