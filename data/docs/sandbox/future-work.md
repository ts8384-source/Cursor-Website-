---
title: Future work
slug: future
id: page:future
type: page
nav: Future work
order: 1
parent: page:docs-home
sandbox: false
depth: long
pageBudget: 750
project: framework
gist: Shareable v1 snapshot — what this lab already ships, and what stays later or off unless hired.
summaryShort: v1 shipped vs later, not a promise list
summaryLong: Lab-bench page that records the drawing-loop site as of this clean pass. What is live now is listed with tools that already exist. Later items are discuss-only. ClawVM, Mem0, Caesar, article decay, and MGM evolution stay off unless the operator hires MGM.
tags:
  - sandbox
  - ia
  - agents
related:
  - page:sandbox
  - page:sandbox-how-the-lab-works
  - page:control
  - page:wiki-writing
  - page:overview
  - page:implement
  - page:knowledge-graph
  - page:hybrid-rag
  - page:papers-ingest
  - page:memory
  - page:agents
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - dashboard-design-patterns-2022
  - gorilla-2023
  - swe-agent-2024
  - hm-rag-2025
  - graphrag-2024
  - agent-workflow-memory-2024
updated: 2026-09-06
questions:
  - What is already in this v1?
  - What is later, not a commitment?
  - What stays off unless hired?
glossary:
  - term: v1
    def: The shareable drawing-loop site after the lab nest was emptied of this-build scratch notes.
  - term: later
    def: Discuss-only. Not will-implement unless the operator parks it onto the queue.
  - term: hire-only
    def: MGM stays disarmed until the operator says hire MGM.
---

# Future work

This page is the **shareable snapshot** of the lab after a clean pass. Living Papers: the file is the page [@living-papers-heer-2023]. Paper Plain gists stay collapsed chrome; the open body is the long form [@paper-plain-august-2023]. Overview-then-detail: [Lab bench](/site/sandbox) holds current work; this article is the v1 / later split [@dashboard-design-patterns-2022]. It is not a promise list.

## What

Two lists. **What we did in the meantime** names tools that already exist (`GET /api/tools`, CONTROL). **What we might do later** is discuss-only. Cite-or-fetch: claims below name pages and catalog papers already on disk. No invented paper results.

| Surface | URL |
| --- | --- |
| **This page** | `/site/future` |
| **How the lab works** | [How the lab works](/site/sandbox-how-the-lab-works) |
| **Lab bench** | [Lab bench](/site/sandbox) |
| **Operator ACI** | [CONTROL](/site/control) |

## Why

Scratch notes from one build are not the product. The operator asked for a clean nest so a stranger can open the site without reading personal lab tape. Encyclopedia pages and papers stay; they do not decay [@living-papers-heer-2023] [@agent-workflow-memory-2024]. Scratch user/project memory still forgets (`GET /api/memory`).

## What we did in the meantime (v1)

These are **shipped hooks**, not slogans. Agents list tools, then call them [@gorilla-2023] [@swe-agent-2024].

- **Drawing loop / pad** — park writes `inbox/PENDING`; the canvas is the spec. Pad `:5174`, API `:5175`. Autosave does not write the site.
- **Lab bench vs encyclopedia** — work starts under `data/md/sandbox/` (`sandbox: true`). Encyclopedia peers appear only after `POST /api/sandbox/promote` with **promote to main**. How-to is a child, not a lane.
- **Hats stay separate** — fetch / generate / coding are three skills. Do not collapse generate and fetch. Coding implements against wiki/fetch results already on the page.
- **Cite-or-fetch** — retrieve first; every factual claim names a hit id; missing work → `POST /api/papers/fetch`. Do not invent.
- **Papers ingest** — OA only. Recipe: [Papers from the internet](/site/papers-ingest). Permanent paper DB: `GET /api/papers/db`. Papers do not forget.
- **Hybrid RAG, isolated grounds** — `GET /api/search`, `POST /api/ask`. Labeled merge. No cross-ground RRF [@hm-rag-2025].
- **Knowledge graph** — `GET /api/graph`, `GET /api/graph/neighborhood`, [Knowledge graph](/site/knowledge-graph). Zoom clusters are a **view**, not new facts. GraphRAG communities stay cited and off [@graphrag-2024].
- **To-implement queue** — `GET/POST /api/implement`, [To-implement](/site/implement). Not the Overview tree. Workbench nest is **removed**.
- **Condensed returns** — isolated helpers return ids + a 1–3 sentence gist (`GET/POST /api/condensed`). Not a child transcript.
- **Trash bin** — lab only. `GET/POST /api/sandbox/trash`. 14-day forget from the live nest. Encyclopedia and papers refused.
- **Framework vs later-project filter** — frontmatter `project:` plus `GET /api/graph?project=` and `GET /api/pages?project=`. This page is `project: framework`. Explicit edges may cross; the store is still one graph.
- **Metadata bus** — `GET /api/meta` records carry `href`, `parent`, `nest`, `flags`, `graphDegree`. Same ids on pages, papers, diagram nodes, `@chunk` code.
- **RAM cuts** — API search is BM25-only unless `RAG_DENSE=1`. One pad, one API. Do not start a second `:5175`.

House style for new architecture pages: [Wiki writing](/site/wiki-writing) (`depth: long`, What / Why / How).

## What we might do later (not commitments)

Discuss. Do **not** treat this list as will-implement unless the operator parks it onto [To-implement](/site/implement).

- **SPA stale-body fix** — site chrome sometimes keeps an old article body across a route change. Fix the reader, do not invent a second renderer.
- **Git lab merge as human-check** — `POST /api/sandbox/propose` still does not merge. Promote copies MD only. Any merge stays a human step. No auto-merge.
- **Writer pass on thin pages** — some encyclopedia pages are still short of house style. Expand from `GET /api/meta/:id` and neighborhood hits. Do not invent.
- **Condensed-return habit** — keep using `POST /api/condensed` for isolated Task packets so the parent never pastes a child transcript.
- **Context-editing** — discuss only. Not decided. Do not mark will-implement from this sentence.
- **Separate project graphs** — the filter hook exists; later projects may set `project: <id>`. Do not stand up a second graph store.

**Stay off unless hired or explicitly parked**

- ClawVM / Oblivion / a second memory VM
- Mem0-style product memory
- Caesar crawl / IntrAgent runtime
- Article decay on `data/md` or the paper DB
- MGM evolution / scaffold self-rewrite — hire hook exists (`POST /api/tripwires/hire`); `armed` stays false until the operator says **hire MGM**

## How

1. Open this URL after a park if the question is “what is v1 vs later.”
2. New work still goes under [Lab bench](/site/sandbox). Chat only points at `/site/<slug>`.
3. Queue a later item only with `POST /api/implement` when the operator wants it tracked.
4. Do not arm MGM from this page.

## Tools / MD paths

| Tool | Role |
| --- | --- |
| `GET /api/pages` | Nest children of `page:sandbox` |
| `GET /api/graph?project=framework` | Framework-scoped view; this page is in that filter |
| `GET/POST /api/condensed` | Isolated packet contract |
| `GET/POST /api/implement` | Discuss / will-implement / implemented |
| `GET/POST /api/sandbox/trash` | Lab dump only |
| `POST /api/tripwires/hire` | Hire MGM — phrase lock |

Files: `data/md/sandbox/future-work.md`, `data/md/sandbox.md`, `data/md/sandbox/how-the-lab-works.md`, `content/CONTROL.md`.

## Worked example

A stranger opens `/site/future`, then `/site/sandbox-how-the-lab-works`, then `/site/overview`. They should see the map, the lab rules, and this v1/later split — not this-build scorecards or personal names. Cite-or-fetch still applies on every later park [@hm-rag-2025].
