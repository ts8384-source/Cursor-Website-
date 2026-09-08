---
title: Math rendering
slug: math-rendering
id: page:math-rendering
nav: Math rendering
order: 12
depth: long
pageBudget: 700
gist: Framework default is KaTeX for wiki math. JSXGraph is for interactive prototypes. Vendor script copies assets for offline HTML.
summaryShort: KaTeX default; JSXGraph optional; vendor script for offline
summaryLong: Wiki dollar-math and eq fences render with KaTeX. Interactive plots use JSXGraph. npm bundles for the site; scripts/vendor-math-assets.sh copies into frontend/public/vendor for offline or daily refresh.
tags:
  - docs
  - math
  - katex
  - jsxgraph
related:
  - page:docs-home
  - page:control
  - page:math-render-compare-lab
citations:
  - living-papers-heer-2023
questions:
  - How does `$\\psi$` render on a page?
  - How do I offline-copy KaTeX and JSXGraph?
  - When do I use JSXGraph instead of KaTeX?
glossary:
  - term: KaTeX
    def: Default TeX renderer for boot and doc wiki Markdown.
  - term: JSXGraph
    def: Interactive geometry/plots for sandbox prototypes — not the text math path.
  - term: vendor-math-assets
    def: scripts/vendor-math-assets.sh — copies katex + jsxgraph into frontend/public/vendor.
---

# Math rendering

## What

The **framework** always draws wiki math with **KaTeX**. Interactive boards for prototyping use **JSXGraph**. The four-library compare on successor-features was a lab; KaTeX won for text.

## Why

Monospace `$…$` map chips were agent-friendly and human-ugly. One default keeps Living Papers pages readable without per-page React mounts [@living-papers-heer-2023].

## How

### In Markdown (always KaTeX)

- Inline: `$\psi_n \approx \varphi_n$` → KaTeX (still links to the math map).
- Block: fenced `eq` — first line is the formula (TeX preferred; house unicode is auto-mapped), following `term | def` lines stay callouts.

Implementation: `frontend/src/site/katexRender.ts` + `markdown.ts`. CSS: `import 'katex/dist/katex.min.css'` from `frontend/src/main.tsx`.

### JSXGraph (prototypes)

Use `JsxGraphPlot` (`frontend/src/site/JsxGraphPlot.tsx`) when you need a slider/plot, not when you need a glyph. Example mount: sandbox pages or a future ML data-flow board.

### Download / pre-download / daily refresh

**Site runtime (preferred):** `npm ci` — Vite bundles KaTeX from `node_modules`. No extra download step.

**Offline / plain HTML / refresh from disk:**

```bash
npm ci
./scripts/vendor-math-assets.sh
```

Writes:

| Path | Contents |
| --- | --- |
| `frontend/public/vendor/katex/` | `katex.min.css`, `katex.min.js`, `fonts/` |
| `frontend/public/vendor/jsxgraph/` | `jsxgraph.css`, `jsxgraphcore.js` |
| `frontend/public/vendor/README.md` | How to load in scratch HTML |

Heavy `katex/` and `jsxgraph/` trees are gitignored; re-run the script anytime (including a daily cron). The README stays as the durable pointer.

Scratch HTML:

```html
<link rel="stylesheet" href="/vendor/katex/katex.min.css" />
<script defer src="/vendor/katex/katex.min.js"></script>
<link rel="stylesheet" href="/vendor/jsxgraph/jsxgraph.css" />
<script src="/vendor/jsxgraph/jsxgraphcore.js"></script>
```

## Tools / MD paths

| Path | Role |
| --- | --- |
| `frontend/src/site/katexRender.ts` | KaTeX helper + unicode→TeX |
| `frontend/src/site/markdown.ts` | `$…$` + `eq` → KaTeX |
| `frontend/src/site/JsxGraphPlot.tsx` | Prototype plot |
| `scripts/vendor-math-assets.sh` | Offline copy |
| Lab compare | any page with `embeds: [math-compare]` |

## Worked example

Open any page with `$\\varphi$` or an `eq` fence — glyphs render as KaTeX. Run `./scripts/vendor-math-assets.sh`, then hit `/vendor/katex/katex.min.css` in the browser to confirm the offline copy.
