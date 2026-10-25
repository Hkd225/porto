import { useEffect, useRef, useState } from 'react';
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
 * Panel plates — the gallery runs on the author's own artifacts: one
 * family of screenshots of real work. The Evo² paper being read, the
 * uncertainty_engine.py core being rebuilt by hand, a README of stress
 * cases (leakage prevention, label-shuffling sanity check), and the
 * public GitHub record (see public/method/CREDITS.md). Keyed by the
 * step word so a data reorder can never desync a principle from its
 * image.
 */
const stepPhotos: Record<string, { src: string; alt: string }> = {
  Read: {
    src: '/method/read.png',
    alt: 'The Evo² paper open on screen — Figure 1, weight-harness co-evolution, read line by line.',
  },
  Rebuild: {
    src: '/method/rebuild.png',
    alt: 'uncertainty_engine.py in the editor — the entropy core re-implemented by hand, _clip01 through softmax.',
  },
  Push: {
    src: '/method/push.png',
    alt: 'The public GitHub profile — repositories pushed as they happened, a year of contributions on the graph.',
  },
  Document: {
    src: '/method/document.png',
    alt: 'A README of stress cases — strict leakage prevention, group validation, labels shuffled to prove the accuracy is earned.',
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
 * The wrench-shaped LogoLoop prop — identity held at module scope.
 *
 * LogoLoop re-measures its whole belt (per-item getBoundingClientRect plus a
 * synchronous paint frame) whenever the `logos` identity changes. Building
 * that array inline during render handed it a fresh identity on every re-render
 * of this section — and a hover/report emit mid-scroll turns into a full
 * measure pass at strict intervals. Created once here, the engine refreshes
 * only when the belt genuinely changes. Same JSX, same labels, one mount.
 */
const beltLogos = belt.map(({ name, icon: Icon }) => ({
  node: (
    <span role="img" aria-label={name} className="inline-flex">
      <Icon size={36} aria-hidden />
    </span>
  ),
  title: name,
  ariaLabel: name,
  hoverColor: '#e9e6de',
}));

/* AccordionGallery items — hoisted like beltLogos: the vendor re-measures when
   the prop changes form, so the same four objects must be one array, built
   once, at module level. */
const galleryItems = profile.method.map((s) => ({
  image: stepPhotos[s.word]?.src ?? '',
  label: s.word,
  alt: stepPhotos[s.word]?.alt ?? `${s.n} ${s.word} — method step`,
}));

/**
 * MethodSnap — the mobile face of the gallery.
 *
 * AccordionGallery's four panels turn into vertical slivers on a phone
 * (390px wide ÷ 4 panels ≈ 90px each showing full-width captures) and
 * touch has no hover, so below `md` the same four plates render as a
 * horizontal snap scroller instead: one full card per artifact, tap to
 * activate. Same data, same active-panel chrome underneath — the
 * desktop accordion above `md` is untouched.
 */
function MethodSnap({
  items,
  active,
  onChange,
}: {
  items: Array<{ image: string; label: string; alt: string }>;
  active: number;
  onChange: (i: number) => void;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const rowRef = useRef<HTMLDivElement | null>(null);
  /* tap-driven only: on mount this effect must NOT run — recentering on
     load drags the whole page to the Method section while the boot veil is
     still up (the reader un-veils mid-document instead of at the hero). The
     pure scrollLeft centering keeps the correction strictly horizontal. */
  const settled = useRef(false);
  useEffect(() => {
    if (!settled.current) {
      settled.current = true;
      return;
    }
    const card = refs.current[active];
    const row = rowRef.current;
    if (card && row) {
      row.scrollTo({
        left: card.offsetLeft - (row.clientWidth - card.clientWidth) / 2,
        behavior: 'smooth',
      });
    }
  }, [active]);

  return (
    <div
      ref={rowRef}
      className="no-bar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2"
      data-lenis-prevent
      aria-label="The method, one panel per principle"
    >
      {items.map((item, i) => {
        const isActive = i === active;
        return (
          <button
            key={item.label}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(i)}
            className={`relative w-[76vw] max-w-[340px] shrink-0 snap-center overflow-hidden rounded-[3px] border text-left transition-colors duration-300 ${
              isActive ? 'border-accent/35' : 'border-line-soft'
            }`}
          >
            <span className="block aspect-[3/2] w-full bg-surface">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.alt}
                  loading="lazy"
                  className={`h-full w-full object-cover transition-[filter,opacity] duration-300 ${
                    isActive ? 'opacity-100' : 'grayscale opacity-55'
                  }`}
                />
              )}
            </span>
            <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.22em] text-bone">
              <span className={isActive ? 'text-accent' : 'text-dim'}>{String(i + 1).padStart(2, '0')}</span>
              <span className="px-2 text-dim">·</span>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Manifesto — "The method": Read. Rebuild. Push the vague part. Document.
 *
 * SplitText introduces the headline word by word; AccordionGallery is the
 * interaction — four panel plates (the author's own captures, credits
 * above) that expand on hover/focus, while the active panel's chrome (meta,
 * title, detail, tags) re-renders below the row. The redundant four-card
 * grid is gone: the gallery IS the list now, so nothing is said twice.
 * On phones the accordion becomes the MethodSnap scroller (see above).
 * The tool ticker runs as a LogoLoop — an icon-only belt of ML/DL
 * technology marks (the belt constant names each one), draggable, no
 * spot colour; names surface as hover tips and in the access tree only.
 */
export function Manifesto() {
  const steps = profile.method;
  const [active, setActive] = useState(0);
  const step = steps[active] ?? steps[0];

  const items = galleryItems;

  return (
    <section id="method" aria-label="The method" className="border-t border-line-soft pt-[var(--spacing-section)] pb-[clamp(1.75rem,4vw,3rem)]">
      <div className="wrap">
        <div className="flex items-baseline justify-between gap-8">
          <div className="flex items-baseline gap-4">
            <span className="num text-bone/70">02</span>
            <span className="h-px w-10 translate-y-[-4px] bg-line-2" aria-hidden="true" />
            <p className="kicker">The method</p>
          </div>
          <p className="kicker hidden md:block">How I work</p>
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
          {/* The one interaction, two faces: vendor accordion on desktop,
              snap scroller on phones (same items, same active index). */}
          <div className="hidden md:block">
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
          <div className="md:hidden">
            <MethodSnap items={items} active={active} onChange={setActive} />
          </div>
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
            logos={beltLogos}
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
