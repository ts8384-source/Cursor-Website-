---
title: Paper diagrams and visualizations
slug: diagrams
id: page:diagrams
type: page
nav: Diagrams
order: 8
gist: Loop diagram plus figure notes extracted from papers. ColPali-grade page images are future work.
summaryShort: Small nodes, panel holds summaries
summaryLong: React Flow stays compact. Click a node for summaryLong and id links to pages and papers. Connectivity is metadata, not hardcoded chrome.
tags:
  - diagram
  - react-flow
  - metadata
related:
  - node:hybrid-rag-loop:hybrid
  - diagram:hybrid-rag-loop
  - module:diagrams
updated: 2026-09-05
questions:
  - What does the current loop diagram contain?
  - Which paper figures are on disk as text captions?
  - How do I jump from a figure to the code that implements the idea?
glossary:
  - term: figure note
    def: A caption or “Figure N” sentence extracted from a paper’s ingest Markdown.
  - term: ColPali
    def: Page-as-image retrieval. Cited, not indexed here.
  - term: mid-path chevron
    def: Small open arrowheads along a uniform skinny stroke at about 72px spacing; no taper toward the target.
citations:
  - vidorag-2025
  - dashboard-design-patterns-2022
  - scrollyvis-2023
  - living-papers-heer-2023
  - holten-directed-edges-2009
embeds:
  - diagrams
---

# Paper diagrams and visualizations

The board put **Paper — diagram, visualization** at the top. This page is that surface.

The **loop diagram** is `data/diagrams/latest.json` (ask/park write-back). Three high-level dotted regions — **iPad**, **local PC**, **website** — cover every node on that graph. Scribble/inbox sit on the iPad; site, wiki, vis, and frontend sit on the website; the rest of the loop sits on the local PC. The RSNN diagram does not use these layers. Nodes stay small; click opens `summaryLong` plus page and paper links from `GET /api/meta` in the panel below the graph. Directed edges keep Holten & van Wijk’s warning about fat terminal arrowheads, but the stroke is **uniform and skinny** (no taper ribbon). Small pointy chevrons sit in open space at about 72px spacing. One neon `#00e8ff` plus a traveling dash (always on) shows direction; there is no rust/black key and no flow toolbar [@holten-directed-edges-2009]. `prefers-reduced-motion` stops the dash. Paper **figure notes** come from the permanent DB. Together they are a Dashboard-style overview: the whole object, then per-paper figures [@dashboard-design-patterns-2022].

Cited paper or arXiv ids on a node or its page are upserted into that paper DB (`POST /api/papers/fetch`) when the diagram is written.

Wiki-memory graphs (`wiki-memory-compare`, `wiki-memory-grounding`) live on this board’s switcher and on [Wiki memory](/site/wiki-memory). They are think-through flows, not an implemented compiler. The three-mash index (`flagged-schemes-loop`) sits on [Agents](/site/agents). Those regions are hats, not iPad / local PC / website. The live wiki graph is [Knowledge graph](/site/knowledge-graph).

ViDoRAG / ColPali would retrieve the page *as an image* [@vidorag-2025]. That index is still a gap. Until it exists, agents use `GET /api/diagrams` and then `POST /api/maps/fetch` with `{ "kind": "diagram", "q": "…" }` to attach repo files.

## What you should see below

- A React Flow graph of the latest ask diagram (inputs → hybrid RAG → md / vector DB) plus the RSNN vs MLP board, with neon directed edges (traveling dash; no flow chrome).
- A list of extracted or curated figure notes, each linked to `/site/papers#<id>`.
- A control to map a figure label onto code (same contract as [Maps](/site/maps)).

Living Papers still owns the prose above the visual [@living-papers-heer-2023]. ScrollyVis is not used on this page.
