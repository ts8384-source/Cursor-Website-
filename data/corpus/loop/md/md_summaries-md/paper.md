# summaries.md

---
title: Paper summaries
slug: summaries
nav: Summaries
order: 7
gist: Permanent Summary MD for every ingested paper — future reference, not a decaying log.
questions:
  - What is each paper actually claiming, in one paragraph?
  - Where is that claim stored so it cannot be forgotten?
  - How do I open the live DB instead of this prose?
glossary:
  - term: Summary MD
    def: A Markdown page of paper abstracts plus GET /api/papers/db as the machine record.
  - term: permanent Paper DB
    def: data/papers plus db.json. Forgetting never applies.
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - semantic-reader-project-2023
  - agent-workflow-memory-2024
---

# Paper summaries

The parked board asked for **Summary MD** and a **permanent Paper DB**. This article is the human page. The durable record is `GET /api/papers/db` (also written to `data/papers/db.json` on rebuild). Papers are future reference. They do not use the forgetting curve that user and project memory use [@agent-workflow-memory-2024].

Paper Plain’s lesson: a gist next to the source, not a replacement for it [@paper-plain-august-2023]. Each row below is a gist. Citation cards and catalog rows stay on [Papers](/site/papers).

## How the DB is filled

1. Catalog headers in `data/papers/<id>.md`.
2. Curated execution notes in `backend/persist/paper-curated.ts` (how the idea is wired here).
3. Extracted figure captions and `$math$` tokens from the ingest text.
4. `POST /api/papers/db/rebuild` after a new fetch.

The live table under this article is that DB, not a second handwritten list.

## Frontend / reading papers (gists)

- **Living Papers** — MD is the source; compile to web + list API [@living-papers-heer-2023].
- **Fidyll** — one narrative source for explorables.
- **ScrollyVis** — one guided section, not site-wide scroll hijack.
- **Dashboard Design Patterns** — overview, then filter, then passages.
- **Semantic Reader** — citation cards and scholarly navigation [@semantic-reader-project-2023].
- **Paper Plain** — gists, key questions, term definitions.
- **InReAcTable** — insight-graph neighbor; we keep a catalog map only.
- **VADIS** — query-conditioned seeking; hits stay in the search rail.
- **TreeReader** — hierarchical left TOC.

## Backend / retrieve papers (gists)

- **ViDoRAG / ColPali** — diagram-as-page retrieve, **cited**, not a VLM index.
- **HM-RAG / HetaRAG** — heterogeneous stores → isolated grounds, no cross-RRF.
- **MA-RAG** — planner chain neighbor; agents call `/api/search`.
- **GraphRAG** — `GET /api/overview` is the cheap graph.
- **WebArena / Mind2Web / SWE-agent / Gorilla** — structured tools, not HTML.
- **Agent Workflow Memory** — reusable routines. We store CONTROL + decaying memory, not full AWM induction.
