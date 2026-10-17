# Hakid — Portfolio (Monochrome Rebuild)

Portfolio of **Muhammad Auffa Hakim Aditya** (Hakid) — independent AI systems
researcher. Agentic AI, memory architectures, uncertainty-aware reasoning,
machine learning and computer vision.

This is a full rebuild in plain elegant black. The previous (acid-green) build
remains in git history under the `Awwwards rebuild` commits.

## Structure

- **Index** — sparse-particles hero, masked statement (SplitText), rotating roles
- **Focus** — LPAS-style numbered pinned carousel (6 areas of work)
- **Method** — ScrollFloat manifesto + kinetic tech ticker + 4-step loop
- **Work** — featured hairline grid (SpotlightCard) + archive rows, category tabs with counts
- **Models** — Hugging Face weights: merged/adapter badges (ShinyText), CountUp stats
- **Writing** — Medium notes, titles decrypt on view (DecryptedText), greyscale plates
- **About** — verified-facts rail (37 repos, 5 models, since 2025)
- **Contact** — TextPressure signature wordmark, StarBorder mailto, copy-email, link cells

## Stack

Vite + React 19 + TypeScript strict + Tailwind 4 · GSAP + Lenis + Motion ·
React Bits vendored as source (`src/components/reactbits/`, MIT, with typed
facade). Fonts: Instrument Serif (display), Inter (UI), JetBrains Mono (meta).

## Data integrity

Every project description, model parameter count, and link in `src/data/` is
derived from the public GitHub / Hugging Face / Medium APIs of
[Hkd225](https://github.com/Hkd225), [Hakid](https://huggingface.co/Hakid),
and [@hakid19](https://medium.com/@hakid19). Nothing invented.

## Scripts

```bash
npm run dev      # vite dev server
npm run build    # tsc -b && vite build
npm run lint     # oxlint (warnings confined to unmodified vendored sources)
npm run preview  # serve dist
```

## Known follow-ups

- `public/og.png` and the PNG icon rasterisations still carry the old green
  accent (SVG favicon + manifest already re-tinted). Regenerate with the asset
  script once convenient.
