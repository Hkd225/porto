import { useState } from 'react';
import type { IconType } from 'react-icons';
import {
  SiArxiv,
  SiGooglecolab,
  SiHuggingface,
  SiJupyter,
  SiKaggle,
  SiKeras,
  SiLangchain,
  SiLangflow,
  SiMilvus,
  SiMlflow,
  SiNumpy,
  SiNvidia,
  SiOllama,
  SiOnnx,
  SiOpencv,
  SiPandas,
  SiPytorch,
  SiQdrant,
  SiRoboflow,
  SiScikitlearn,
  SiStreamlit,
  SiTensorflow,
  SiUltralytics,
  SiWeightsandbiases,
} from 'react-icons/si';
import { AccordionGallery, LogoLoop, SplitText } from './reactbits';
import { profile } from '../data/profile';

/**
 * Panel photography — licensed frames downloaded from Wikimedia Commons
 * (public domain / CC0; see public/method/CREDITS.md). Keyed by the step
 * word so a data reorder can never desync a principle from its image.
 * Frames are chosen for texture in the mono system: a manuscript read
 * line by line, hand-etched copper, a crack driven through concrete, and
 * a real timestamped duty log.
 */
const stepPhotos: Record<string, { src: string; alt: string }> = {
  Read: {
    src: '/method/read.jpg',
    alt: 'A 15th-century manuscript page with ruled rows of script — the original text, studied closely.',
  },
  Rebuild: {
    src: '/method/rebuild.jpg',
    alt: 'A hand-etched circuit board, copper traces reconstructing a circuit by hand.',
  },
  Push: {
    src: '/method/push.webp',
    alt: 'A crack driven through a concrete slab — the vague part, found under load.',
  },
  Document: {
    src: '/method/document.jpg',
    alt: 'An open logbook of handwritten, timestamped entries — the record kept honestly.',
  },
};

/* Belt entry visuals — a pure mark for every entry, no words on the belt.
   Each entry is an ML/DL technology with a real brand icon, rendered in
   currentColor so it inherits the belt's dim grey and lights to ivory on
   hover — no spot colour. Names live in the accessible labels and the
   hover tip, so the glyphs stay legible to people and screen readers. */
const belt: Array<{ name: string; icon: IconType }> = [
  { name: 'PyTorch', icon: SiPytorch },
  { name: 'TensorFlow', icon: SiTensorflow },
  { name: 'Keras', icon: SiKeras },
  { name: 'OpenCV', icon: SiOpencv },
  { name: 'Ultralytics YOLO', icon: SiUltralytics },
  { name: 'ONNX', icon: SiOnnx },
  { name: 'NVIDIA', icon: SiNvidia },
  { name: 'scikit-learn', icon: SiScikitlearn },
  { name: 'NumPy', icon: SiNumpy },
  { name: 'pandas', icon: SiPandas },
  { name: 'Hugging Face', icon: SiHuggingface },
  { name: 'Ollama', icon: SiOllama },
  { name: 'LangChain', icon: SiLangchain },
  { name: 'Langflow', icon: SiLangflow },
  { name: 'Qdrant', icon: SiQdrant },
  { name: 'Milvus', icon: SiMilvus },
  { name: 'MLflow', icon: SiMlflow },
  { name: 'Weights & Biases', icon: SiWeightsandbiases },
  { name: 'Kaggle', icon: SiKaggle },
  { name: 'arXiv', icon: SiArxiv },
  { name: 'Jupyter', icon: SiJupyter },
  { name: 'Google Colab', icon: SiGooglecolab },
  { name: 'Streamlit', icon: SiStreamlit },
  { name: 'Roboflow', icon: SiRoboflow },
];

/**
 * Manifesto — "The method": Read. Rebuild. Push the vague part. Document.
 *
 * SplitText introduces the headline word by word; AccordionGallery is the
 * interaction — four photographic panels (PD/CC0 frames, credits above)
 * that expand on hover/focus, while the active panel's chrome (meta,
 * title, detail, tags) re-renders below the row. The redundant four-card
 * grid is gone: the gallery IS the list now, so nothing is said twice.
 * The tool ticker runs as a LogoLoop — an icon-only belt of ML/DL
 * technology marks (the belt constant names each one), draggable, no
 * spot colour; names surface as hover tips and in the access tree only.
 */
export function Manifesto() {
  const steps = profile.method;
  const [active, setActive] = useState(0);
  const step = steps[active] ?? steps[0];

  const items = steps.map((s) => ({
    image: stepPhotos[s.word]?.src ?? '',
    label: s.word,
    alt: stepPhotos[s.word]?.alt ?? `${s.n} ${s.word} — method step`,
  }));

  return (
    <section id="method" aria-label="The method" className="border-t border-line-soft pt-[var(--spacing-section)] pb-[clamp(1.75rem,4vw,3rem)]">
      <div className="wrap">
        <div className="flex items-baseline justify-between gap-8">
          <div className="flex items-baseline gap-4">
            <span className="num text-bone/70">02</span>
            <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
            <p className="overline">The method</p>
          </div>
          <p className="overline hidden md:block">How I work</p>
        </div>

        <div className="mt-10 md:mt-14">
          <SplitText
            text={profile.manifesto}
            tag="h2"
            splitType="words"
            effect="rise"
            mask
            trigger="view"
            delay={26}
            duration={1.1}
            staggerFrom="start"
            textAlign="left"
            threshold={0.12}
            rootMargin="-120px"
            className="font-display text-[clamp(2rem,5.6vw,4.6rem)] leading-[1.06] tracking-[-0.02em] text-bone"
          />
          <p className="mt-6 max-w-[52ch] text-sm leading-relaxed text-muted">
            Four principles. One continuous process.
          </p>
        </div>

        <div className="mt-12 md:mt-16">
          <AccordionGallery
            className="ag-mono"
            items={items}
            defaultIndex={0}
            accentColor="#a4aa9b"
            overlayColor="#080808"
            textColor="#e9e6de"
            height={440}
            gap={8}
            radius={3}
            expandRatio={0.52}
            tilt={5}
            parallax={0.4}
            duration={0.65}
            trigger="hover"
            onChange={setActive}
          />
        </div>

        {/* Active panel chrome — keyed by the active index so each swap plays
            one fade-up beat; static chrome above stays untouched. */}
        <div key={active} className="detail-in mt-10 border-t border-line-soft pt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <p className="num">
                {step.n} / {step.word.toUpperCase()} — active panel
              </p>
              <h3 className="mt-4 font-display text-[clamp(1.6rem,2.6vw,2.4rem)] italic leading-tight text-bone">
                {step.title}
              </h3>
              <p className="mt-4 max-w-[58ch] text-sm leading-relaxed text-muted">{step.detail}</p>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end lg:text-right">
              <p className="max-w-[34ch] text-sm leading-relaxed text-dim">{step.desc}</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
                {step.tags.map((tag, i) => (
                  <span key={tag}>
                    {tag}
                    {i < step.tags.length - 1 && <span className="px-2">/</span>}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>

        {/* Tool loop — icons only, no text on the belt. Every entry is an
            ML/DL technology mark in currentColor (inherits the dim grey,
            lights to ivory on hover — no spot colour). Names ride in the
            accessible labels and the vendor's hover tip, which renders the
            tool's name in the site's mono chrome. The loop pauses on hover
            and resumes on leave; the intro is the component's own staggered
            rise, played once when the row enters view. Draggable — fling
            the belt. */}
        <div className="mt-14 border-y border-line-soft py-6">
          <LogoLoop
            className="text-dim"
            labels="hover"
            logos={belt.map(({ name, icon: Icon }) => ({
              node: (
                <span role="img" aria-label={name} className="inline-flex">
                  <Icon size={36} aria-hidden />
                </span>
              ),
              title: name,
              ariaLabel: name,
              hoverColor: '#e9e6de',
            }))}
            speed={34}
            logoHeight={36}
            gap={64}
            fadeOutWidth={0.08}
            hoverSpeed={0}
            ariaLabel="Tools and methods used across machine learning work"
          />
        </div>
      </div>
    </section>
  );
}
