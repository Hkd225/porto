import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import { GitBranch } from 'lucide-react';

import { agentLoop, agentLoopDetail } from '../data/projects';
import { RevealGroup } from './Reveal';
import { ScrambleText } from './ScrambleText';
import { MaskLines } from './MaskLines';
import { gsap, EASE } from '../lib/gsap';
import { useReducedMotion } from '../hooks/useReducedMotion';

/**
 * The loop diagram, annotated with where each stage actually lives in code.
 *
 * The *shape* of the loop is a generic agent architecture — it is not a claim
 * that any single repository implements every stage. The `source` on each node
 * points at the module that genuinely covers it, and nodes without an exact
 * match are labelled "conceptual".
 */
const STAGE_SOURCES: Record<string, { repo: string; file: string; conceptual?: boolean }> = {
  INPUT: { repo: 'qwen-autonomous-agent', file: 'main.py' },
  REASON: { repo: 'qwen-autonomous-agent', file: 'agent.py · decision.py', conceptual: true },
  'SELECT ACTION': { repo: 'qwen-autonomous-agent', file: 'decision.py', conceptual: true },
  'EXECUTE TOOL': {
    repo: 'qwen-autonomous-agent',
    file: 'tools/web_search.py · tools/code_executor.py',
  },
  'OBSERVE RESULT': { repo: 'qwen-autonomous-agent', file: 'agent.py', conceptual: true },
  VERIFY: { repo: 'qwen-autonomous-agent', file: 'self_improvement.py', conceptual: true },
  'UPDATE MEMORY': {
    repo: 'qwen-autonomous-agent',
    file: 'memory/episodic_memory.py · memory/goal_memory.py',
  },
  'CONTINUE / STOP': { repo: 'qwen-autonomous-agent', file: 'planning.py', conceptual: true },
};

/**
 * Scroll runway per stage, in px.
 *
 * This is the dial that decides whether the diagram reads as something you
 * scrub through or as a slideshow. At 150px per stage the whole eight-step
 * sequence completed inside one flick of the wheel and every stage was gone
 * before it could be read. 260px gives each decision roughly a quarter of a
 * viewport of scroll, so you arrive at a stage, see it light up, and keep
 * going — which is the whole point of a scrubbed scene.
 */
const STAGE_RUNWAY = 260;

/**
 * Total runway, known at render time.
 *
 * This has to be a constant rather than something written imperatively during
 * the animation setup. ScrollTrigger measures its start and end positions the
 * moment it is created; if the extra height arrives a frame later — which is
 * exactly what `gsap.set(el, { '--travel': … })` inside the effect does — the
 * trigger measures a 100svh-tall element, computes start === end, and reports
 * progress 1 for the entire pass. The scene then renders fully scrolled: every
 * stage dimmed, head parked at the bottom, nothing moving.
 */
const TRAVEL = agentLoop.length * STAGE_RUNWAY;

function AgentArchitecture() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  /**
   * Scroll drives this diagram rather than replaying it.
   *
   * Two things happen as the block is scrubbed: a rail head travels down the
   * eight stages, and React swaps the stage note on the left. The second part
   * is the point — scrolling has to reveal *information*, otherwise the page is
   * a video with the sound off.
   */
  useGSAP(
    () => {
      const section = sectionRef.current;
      const list = listRef.current;
      if (!section || !list) return;

      const items = Array.from(list.children) as HTMLLIElement[];
      if (!items.length) return;

      if (reduced) {
        gsap.set(items, { opacity: 1 });
        if (headRef.current) headRef.current.style.transform = 'translateY(0)';
        return;
      }

      const mm = gsap.matchMedia();

      /*
        Scroll-driven hold, built on `position: sticky` rather than a ScrollTrigger
        pin.

        A pin reserves its scroll distance with a spacer div *after* the pinned
        element. Because the element is `100svh` tall and the viewport is too,
        the pin released while the element was already 250px above the fold —
        leaving roughly 1100px of empty section between the case study and
        Writing. Sticky keeps the element in flow, so it scrolls away normally
        and the next section arrives the instant the hold ends.

        It also removes the whole class of problems a `position: fixed` pin has
        on this page — a transform on <main> (the scroll-velocity effect) turns
        into its containing block and throws the scene off screen.
      */
      mm.add('(min-width: 1024px)', () => {
        const head = headRef.current;
        /** Rail height in px, cached — read on refresh, not every frame. */
        let railHeight = 0;

        const place = (progress: number) => {
          if (!head) return;
          const row = progress * (items.length - 1);
          head.style.transform = `translateY(${row * (railHeight / (items.length - 1))}px)`;
        };

        /*
          One timeline, one trigger.

          The head and the stage note are driven from the timeline's own
          progress rather than from a second, independent trigger. A scrubbed
          timeline reports the *smoothed* progress it is actually rendering, so
          the head glides into place instead of tracking the wheel in 1px
          steps — and there is no way for the two to disagree about where in
          the sequence we are.
        */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: () => {
              railHeight = list.getBoundingClientRect().height;
              place(tl.progress());
            },
          },
          onUpdate() {
            const progress = tl.progress();
            place(progress);
            // React swap happens on index change only — eight times per pass,
            // not once per frame.
            const idx = Math.min(
              items.length - 1,
              Math.max(0, Math.round(progress * (items.length - 1))),
            );
            setActive((prev) => (prev === idx ? prev : idx));
          },
        });

        // Light each stage as the head reaches it, then dim it again so the
        // list reads as progress rather than as a set of switches. Positions
        // are laid out in timeline time, one unit per stage, so the lit stage
        // always lands on the note's index.
        items.forEach((li, i) => {
          tl.fromTo(li, { opacity: 0.28 }, { opacity: 1, duration: 0.45, ease: EASE.out }, i);
          // The final stage stays lit: dimming it would end the scene on an
          // empty list with the head still parked at the bottom.
          if (i < items.length - 1) {
            tl.to(li, { opacity: 0.42, duration: 0.45, ease: 'power2.in' }, i + 0.75);
          }
        });

        // Tail padding so the last stage actually reaches full opacity before
        // the trigger runs out, rather than being cut off mid-fade at progress
        // 1.
        tl.to({}, { duration: 0.45 }, (items.length - 1) + 0.75);

        // Seed the rail height immediately — `onRefresh` only fires when ScrollTrigger
        // recalculates, which is not necessarily before the first painted frame.
        railHeight = list.getBoundingClientRect().height;
        place(tl.progress());

        return () => {
          tl.scrollTrigger?.kill();
          tl.kill();
        };
      });

      /* Mobile: plain reveal. Pinning a tall panel on a phone traps scroll. */
      mm.add('(max-width: 1023px)', () => {
        gsap.fromTo(
          items,
          { opacity: 0.15 },
          {
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: EASE.out,
            scrollTrigger: { trigger: section, start: 'top 82%', once: true },
          },
        );
      });
    },
    { dependencies: [reduced], scope: sectionRef }
  );

  return (
    <div
      ref={sectionRef}
      /* Extra viewport-height of runway for the sticky child to be scrubbed
         over. Set inline — and as a render-time constant — because
         ScrollTrigger measures the element the instant it is created, and a
         height applied later measures as a zero-length scroll range. */
      className="arch lg:h-[calc(100svh+var(--travel,0px))]"
      style={{ '--travel': `${TRAVEL}px` } as React.CSSProperties}
    >
      <div className="lg:sticky lg:top-0 lg:flex lg:min-h-[100svh] lg:flex-col lg:justify-center">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        {/* prose + the stage note that scroll swaps in.
            `min-w-0`: a grid track's default minimum is its content's, and the
            long module paths on the diagram side were pushing the whole block
            past a 320px viewport. */}
        <div className="min-w-0">
          <p className="mono-label mb-5">The loop</p>
          <h3 className="text-h2 max-w-[16ch]">One turn, eight decisions.</h3>
          <p className="mt-6 max-w-[52ch] leading-relaxed text-muted">
            An agent loop is easy to draw and hard to make honest. This one is annotated with
            the module that genuinely implements each stage — and marked{' '}
            <span className="text-acid">conceptual</span> where the stage belongs to the
            general architecture rather than to a specific file.
          </p>

          {/* The scrubbed note. Fixed height so swapping text never nudges the
              layout mid-scroll. */}
          <div className="mt-8 border-t border-line pt-5 lg:min-h-[9.5rem]">
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[0.62rem] tracking-[0.2em] text-acid">
                {String(active + 1).padStart(2, '0')}
              </span>
              <span className="mono-label">{agentLoop[active]}</span>
            </div>
            <p
              key={active}
              className="mt-3 max-w-[46ch] text-sm leading-relaxed text-muted motion-safe:animate-[fade-in_320ms_ease-out]"
            >
              {agentLoopDetail[active].note}
            </p>
          </div>

          <p className="mt-4 max-w-[52ch] text-sm leading-relaxed text-dim">
            Pinned and scrubbed on desktop. On smaller screens the same eight stages render as a
            plain ordered list — no trapped scroll.
          </p>
        </div>

        {/* diagram */}
        <div className="arch__diagram min-w-0">
          <div className="relative">
            {/* rail */}
            <div
              aria-hidden="true"
              className="absolute top-2 bottom-2 left-0 w-px bg-line"
            />
            <div
              ref={headRef}
              aria-hidden="true"
              className="absolute top-2 left-0 h-px w-5 bg-acid shadow-[0_0_12px_rgba(200,255,77,0.7)]"
            />

            <ol ref={listRef} className="flex flex-col gap-px">
              {agentLoop.map((stage, i) => {
                const src = STAGE_SOURCES[stage];
                return (
                  <li
                    key={stage}
                    data-stage={stage}
                    className={`group flex flex-col gap-2 py-4 pl-6 transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
                      i === active ? 'bg-ink' : 'bg-transparent'
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-[0.6rem] tracking-[0.2em] text-dim">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className={`font-display text-lg tracking-[-0.02em] transition-colors duration-300 ${
                          i === active ? 'text-acid' : 'text-bone'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>

                    <div className="flex min-w-0 items-center gap-3 sm:justify-end">
                      {src?.conceptual && (
                        <span className="shrink-0 rounded-full border border-acid/40 px-2 py-0.5 font-mono text-[0.55rem] tracking-[0.12em] text-acid uppercase">
                          conceptual
                        </span>
                      )}
                      <span className="min-w-0 truncate font-mono text-[0.62rem] tracking-[0.08em] text-dim">
                        {src?.file ?? '—'}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-4 flex items-start gap-3 border border-line-soft px-4 py-3">
            <span className="mono-label shrink-0">Source</span>
            <a
              href="https://github.com/Hkd225/qwen-autonomous-agent"
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label inline-flex items-center gap-2 text-bone transition-colors hover:text-acid"
            >
              <GitBranch size={12} aria-hidden="true" />
              Hkd225/qwen-autonomous-agent
            </a>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CASE STUDY
   ============================================================ */

const NARRATIVE: { heading: string; body: string }[] = [
  {
    heading: 'The problem',
    body: 'A single prompt produces a single answer. There is no persistence between runs, no record of what failed, and no signal that the model was guessing. The obvious fix — a bigger context window — treats memory as a quantity problem when it is really a structure problem.',
  },
  {
    heading: 'System design',
    body: 'The agent is assembled from four separated concerns: the loop itself, the language-model interface, a decision layer, and a self-improvement layer. Keeping them apart means the reflection logic can be deleted without touching planning, and the planner can be replaced without losing stored experience.',
  },
  {
    heading: 'Memory architecture',
    body: 'Three stores, deliberately different in kind. Episodic memory keeps chronological State–Action–Result–Reward logs; semantic memory holds consolidated knowledge; goal memory tracks a priority-decayed goal tree in SQLite. Retrieval scores blend recency, relevance and importance rather than relying on similarity alone.',
  },
  {
    heading: 'Planning and tool execution',
    body: 'Tree-of-Thoughts expands candidate plans instead of committing to the first one. Tools are a narrow interface — web search and sandboxed Python execution — behind a common base class, so adding a capability does not mean widening the agent’s action space arbitrarily.',
  },
  {
    heading: 'Reflection and verification',
    body: 'After each action, a reflection pass records what happened and adjusts. This is the part most systems skip, and it is where most of the reliability lives: an agent that cannot detect its own drift will drift. The uncertainty work exists to make that detection measurable rather than anecdotal.',
  },
  {
    heading: 'Evaluation',
    body: 'Evaluation here is comparative, not absolute: a table of models on a fixed protocol beats a single headline number, because a single number hides the variance that actually matters. Where a metric can be gamed by leakage, the leakage is controlled explicitly first.',
  },
  {
    heading: 'Known limitations',
    body: 'Self-reported evaluation is weaker than external benchmark. Local models are slower and less capable than hosted ones on long-horizon tasks. Memory scoring heuristics are hand-tuned rather than learned. None of these are solved; they are documented.',
  },
  {
    heading: 'What comes next',
    body: 'Closing the gap between the uncertainty module and the agent loop — letting one system’s calibration inform the other’s gating — is the next thread, and it is where the two most recent repositories already point.',
  },
];

export function CaseStudy() {
  return (
    <section
      id="research"
      className="relative z-10 border-t border-line py-section"
      aria-labelledby="case-title"
    >
      <div className="container-x">
        {/* oversized numeral */}
        <div aria-hidden="true" className="section-numeral select-none">
          03
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="mono-label mb-5"><ScrambleText text="003 / Featured case study" /></p>
            <MaskLines as="h2" id="case-title" className="text-h1 max-w-[12ch]" step={0.11}>
              Beyond the <span className="text-outline-acid italic">single prompt.</span>
            </MaskLines>
            <p className="mt-6 max-w-[40ch] leading-relaxed text-muted">
              A long-form walkthrough of the agent architecture behind{' '}
              <span className="text-bone">qwen-autonomous-agent</span> — what each module does,
              where the ideas came from, and which parts are load-bearing.
            </p>
            <a
              href="https://github.com/Hkd225/qwen-autonomous-agent"
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label group mt-8 inline-flex items-center gap-2 text-bone transition-colors hover:text-acid"
            >
              <GitBranch size={13} aria-hidden="true" />
              Read the source
            </a>
          </div>

          <RevealGroup step={0.06} className="flex flex-col gap-10 lg:gap-14">
            {NARRATIVE.map((n) => (
              <article key={n.heading} className="border-t border-line pt-7">
                <h3 className="font-display text-h3 tracking-[-0.035em]">{n.heading}</h3>
                <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">{n.body}</p>
              </article>
            ))}
          </RevealGroup>
        </div>

        {/* Not wrapped in Reveal on purpose: this block is pinned by ScrollTrigger,
            and a Reveal wrapper leaves a transform on the parent, which would
            become the containing block for the pinned `position: fixed`. */}
        <div className="mt-20 lg:mt-28">
          <AgentArchitecture />
        </div>
      </div>
    </section>
  );
}