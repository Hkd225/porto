# Hakid — portfolio

React + TypeScript + Vite. Animations by GSAP + ScrollTrigger, smooth scroll by Lenis,
React Bits for the interactive primitives.

## Running it

This is a **Vite app**, so it has to be served over HTTP. Opening `index.html` from
disk will always show a blank page — see [Why `file://` doesn't work](#why-file-doesnt-work).

```bash
npm install

npm run dev      # http://localhost:5173   — development, hot reload
npm run serve    # http://localhost:4173   — production build + preview
```

`npm run serve` builds and previews in one step. To rebuild without restarting
the preview server:

```bash
npm run build
npm run preview
```

### Why `file://` doesn't work

Two separate things stop it, and the second one cannot be worked around:

1. **Absolute asset paths.** `vite.config.ts` sets no `base`, so it defaults to `/`,
   and the built HTML references `/assets/index-<hash>.js`. From
   `file:///C:/Users/muham/hakid-portfolio/dist/index.html` that resolves to
   `file:///C:/assets/…` — the drive root, where nothing exists.

2. **Chrome blocks ES modules from `file://`.** The app is `<script type="module">`,
   and Chrome refuses to load those from a `null` origin:

   ```
   Access to script at 'file:///C:/assets/index-<hash>.js' from origin 'null'
   has been blocked by CORS policy
   ```

   This holds no matter how the paths are rewritten, so no build configuration can
   make the output double-clickable. It needs a real origin.

Separately, the `index.html` in the project root is **not** the site. It is the Vite
entry template — it references `/src/main.tsx`, which only the dev server compiles.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run serve` | Build **and** preview in one step |
| `npm run preview` | Serve an existing `dist/` |
| `npm run lint` | oxlint |
| `npm run probe` | Health check across 8 viewports, interactions, frame timing |
| `npm run audit` | Screenshot and interaction audit of the built site |
| `npm run assets` | Regenerate OG image and icons |

`probe` and `audit` need the preview server running, so run `npm run serve` first.

## Deployment

Static output in `dist/`. Canonical host is `https://hkd225.github.io/`; `404.html`
is prebuilt for GitHub Pages.

## Data

Project, model and writing data live in `src/data/`. Every field is grounded in
public API metadata — GitHub, the Hugging Face Hub — rather than estimated. Read the
header comment on each file before adding an entry.