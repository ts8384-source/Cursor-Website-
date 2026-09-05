---
title: What this site is
slug: overview
nav: Overview
order: 1
gist: One local loop — iPad ink parks into hybrid RAG, Markdown is the site, agents use tools not HTML.
questions:
  - What is the system, in one pass?
  - Where does drawing stop and the scholarly site start?
  - Which papers license the chrome versus the retrieve stack?
glossary:
  - term: Living Papers
    def: Markdown compiled to web, PDF, and an extraction API (Heer et al., UIST 2023).
  - term: park
    def: Snapshot the iPad canvas into inbox/ so an agent can read ink without retyping.
  - term: labeled merge
    def: Hits stay tagged by ground. Lists are concatenated, not fused with cross-ground RRF.
citations:
  - living-papers-heer-2023
  - fidyll-conlen-2022
  - dashboard-design-patterns-2022
  - treereader-2025
  - paper-plain-august-2023
  - semantic-reader-project-2023
  - scrollyvis-2023
  - graphrag-2024
scrolly: true
---

# What this site is

This website **is** the project. The source of every article is Markdown on disk. The renderer is a thin Living Papers / Fidyll stance: content in `data/md/` and `content/`, a machine-readable page list at `GET /api/pages`, chrome from the reading-UI literature rather than from a drawing aesthetic [@living-papers-heer-2023] [@fidyll-conlen-2022].

The pad at `/` stays a scratch board. This `/site` tree is the scholarly explanation, the paper-reading environment, and the agent control surface.

## Overview first

Dashboard Design Patterns: show the whole object, then open detail on demand [@dashboard-design-patterns-2022]. The object is a five-stage loop.

1. **Ink** — Apple Pencil on tldraw (`/`). Park writes `inbox/message.md` and `inbox/latest.png`.
2. **Retrieve** — Co-Assistant-grade hybrid index in `rag/` (Chroma + BM25 + in-ground RRF). Grounds: `papers`, `code`, `scribble`, `cursor`, `md`.
3. **Write** — Ask writes an article under `data/md/` and bookkeeps the event.
4. **Site** — These pages compile that Markdown plus permanent papers.
5. **Agents** — `GET /api/tools`. Structured actions (SWE-agent / Gorilla), not DOM scraping.

Search hits are not dumped into this column. Use the search field; results stay in the rail, grouped by ground.

## Guided loop (one ScrollyVis section)

ScrollyVis is used for **this section only** — not the whole site as scroll-hijack [@scrollyvis-2023]. As you move through the steps, the rail marks the same stage.

### Stage A — Draw

Home is a scratch surface. Chrome stays out of the ink (handbook + iPad bindings). The site may scroll; the canvas must not steal pan.

### Stage B — Park

Park is the typed-chat substitute. The agent reads the inbox snapshot. Do not ask the user to retype the canvas.

### Stage C — Hybrid retrieve

Each ground is a separate library. Query-time HyDE and extra BM25 lists stay inside that library. Labeled merge afterward.

### Stage D — Markdown site

Living Papers: one MD source. TreeReader: hierarchical left TOC [@treereader-2025]. Paper Plain: key questions and gists in the rail [@paper-plain-august-2023]. Semantic Reader: citation cards to ingested papers [@semantic-reader-project-2023].

### Stage E — ACI

Control lives in [CONTROL.md](/site/control). That file is both operations manual and a rendered page.

## Graph-lite map

GraphRAG argues for a content graph over flat chunks [@graphrag-2024]. This pass does **not** rebuild a GraphRAG index. `GET /api/overview` is the cheap substitute: a short map generated from the Markdown catalog plus the paper catalog. Use it when you need “what is this site?” without opening every file.

## What the chrome is not

It is not a 3Blue1Brown night-mode diagram wall. It is not React Flow project pages. Those kitchen-sink routes are gone. Visual taste from the iPad drawing is not a design input. Handbook 7:5 / 7:3 still apply: primary navigation on the left, a clickable list of contents on long pages.
