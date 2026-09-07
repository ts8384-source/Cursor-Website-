# wiki-writing.md

---
title: Wiki writing length
slug: wiki-writing
id: page:wiki-writing
type: page
nav: Wiki writing
order: 6
depth: long
pageBudget: 700
gist: House style — write cited long-form bodies. Tune with depth and pageBudget. Gist is chrome, not the article.
summaryShort: Cited bodies, tunable length
summaryLong: Architecture pages default to depth long. Expand GET /api/meta summary.long, related, citations, and graph neighbors into cited sections. Paper Plain gists stay collapsed. Overview and To-implement stay map and queue. Articles do not decay.
tags:
  - wiki
  - living-papers
  - metadata
  - agents
related:
  - page:metadata
  - page:control
  - page:overview
  - page:wiki-memory
  - page:agents-fetch
  - page:agents-generate
  - page:agents-coding-generate
  - page:knowledge-graph
updated: 2026-09-06
questions:
  - How does the operator tune how much text a page should have?
  - What already lives on the metadata bus that never appears in the article?
  - Which sections must a long page include?
  - What did this fetch session actually hit?
glossary:
  - term: depth
    def: Frontmatter short, standard, or long. Authoring budget, not a reader theme.
  - term: pageBudget
    def: Optional target word count. Zero means use the depth default.
  - term: expand from meta
    def: When writing a page, copy cited facts from GET /api/meta and graph neighbors into the body.
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - dashboard-design-patterns-2022
  - treereader-2025
  - semantic-reader-project-2023
  - gorilla-2023
  - swe-agent-2024
  - knowrag-2026
---

# Wiki writing length

This is the standing house style for how long a Living Papers page should be. Markdown on disk is the article [@living-papers-heer-2023]. The renderer already has a gist rail and section-gist toggles [@paper-plain-august-2023]. Those are **not** a license to leave the open column as a slogan.

## What

A page is `data/md/<slug>.md` (or `content/CONTROL.md`) with frontmatter plus a **body**. `GET /api/pages/:slug` already returns `gist`, `summaryShort`, `summaryLong`, `related`, `citations`, `questions`, and `glossary` (`page:agents-coding-generate`, `page:metadata`). The site chrome shows `gist` at the top of the article and questions / terms / citation cards in the rail (`frontend/src/site/SiteApp.tsx`). It does **not** render `summaryLong` or `related` as article sections. Agents who stop after writing a gist therefore hide the extra text that the metadata bus already stored.

`depth` and `pageBudget` are the knobs. Missing `depth` parses as `standard` so old pages are not silently relabeled. New or updated **architecture** pages default to `depth: long`. [Overview](/site/overview) and [To-implement](/site/implement) stay map and queue.

| `depth` | Default budget | What to write |
| --- | --- | --- |
| `short` | 120 words | Gist-scale body. Maps and queues only. |
| `standard` | 350 words | At least three cited sections. |
| `long` | 700 words | What / Why / How / Tools / MD paths / one worked example. |

Set `pageBudget: 900` (or any positive integer) to override the default.

## Why

the operator’s lock on [Wiki memory](/site/wiki-memory): the wiki is collaborative Living Papers MD; articles and the paper DB **do not decay**. A one-line “what it does” is not that wiki. Paper Plain’s own extract says plain-language gists should help a reader understand the **original document**, not replace it; section gists are on-demand [@paper-plain-august-2023]. Our `markdown.ts` already hides `.section-gist` until the toggle. If the only paragraph is the lead line, the “gist” **is** the article — that is the failure mode.

Cite-or-fetch still applies: name a hit id, or say **not in DB** [@knowrag-2026] [@swe-agent-2024]. Length is not an excuse to invent.

## How

1. Read CONTROL and `GET /api/pages/:slug` (or create the file).
2. `GET /api/meta/:id` — copy `summary.long`, `related`, `citations`, glossary into **cited** sections. Do not leave those fields only on the bus.
3. `GET /api/graph/neighborhood?id=` then open the real neighbors (`GET /api/pages`, `GET /api/papers/:id`). Graph hits are labeled context, not a second corpus.
4. Write the body to `depth` / `pageBudget`. Architecture default: **long**.
5. Keep `[@paper-id]` cites so Semantic Reader cards stay in the rail [@semantic-reader-project-2023].
6. Leave Paper Plain gists collapsed. The open column is the long form [@paper-plain-august-2023].

**Combinatorial seed (not a fact about this repo):** `POST /api/generate/seed` `{ "paperId": "dashboard-design-patterns-2022" }` returned that in-DB id. The catalog gist is “Overview first, then filter and detail-on-demand for dense catalogs” [@dashboard-design-patterns-2022]. Use that as an **analogy** for page shape: gist + Overview tree = overview; the article body = detail-on-demand. Do not claim Bach et al. specified our frontmatter.

TreeReader is already how the left TOC nests [@treereader-2025]. It does not write the body for you.

## Tools

| Tool | Role |
| --- | --- |
| `GET /api/tools` | List, then call [@gorilla-2023]. |
| `GET /api/search?q=` | Isolated grounds. This turn used the writing-knobs query. |
| `GET /api/meta/:id` | `summary.short` / `summary.long`, `related`, `citations`. |
| `GET /api/graph/neighborhood?id=` | Neighbors of a page or paper. |
| `GET /api/pages/:slug` | Body + the same frontmatter fields. |
| `GET /api/papers/:id` | Catalog + paper-DB notes (figures, math, `executedIn`). |
| `POST /api/papers/fetch` | Missing OA only. Do not invent. |
| `POST /api/generate/seed` | In-DB paperId for generate. Not fetch. |

`POST /api/ask` was attempted this session and the connection closed. It is **not** a hit.

## MD paths

- House style: `data/md/wiki-writing.md` → `/site/wiki-writing`
- Contract: `content/CONTROL.md` (`depth`, `pageBudget`, how to add a page)
- Parser: `backend/persist/pages.ts` (`PageDepth`, `pageBudget`)
- Skills: `.cursor/skills/drawing-loop/SKILL.md`, `research-fetch/SKILL.md`, `research-generate/SKILL.md`
- Chrome (gist only): `frontend/src/site/SiteApp.tsx`, `frontend/src/site/markdown.ts`
- Bus: `data/meta/schema.json` (`summary.short` / `summary.long` — **no** `depth` on the meta record; depth is page frontmatter)

## Worked example

`GET /api/meta/page:agents-coding-generate` already had `summary.long` (“Nested under Coding. Everyday implement path…”) and `related` (`page:agents-coding`, `page:workbench-sandbox`, `page:control`, diagrams). The old body was a short list. The expanded [Code generation](/site/agents-coding-generate) page now pulls those links and the same catalog cites into sections. That is expand-from-meta, not a new paper.

## Fetch log (session hits only)

Opened or retrieved this turn:

- `page:metadata`, `page:overview`, `page:wiki-memory`, `page:agents-fetch`, `page:agents-generate`, `page:agents-coding-generate`, `page:control`
- Papers: `paper-plain-august-2023`, `living-papers-heer-2023`; confirmed in DB `dashboard-design-patterns-2022`, `treereader-2025`, `semantic-reader-project-2023`, `fidyll-conlen-2022`
- Search chunks: `md:metadata-md`, `md:wiki-memory-md`, `papers:paper-plain-august-2023-md#12` `#14` `#100` `#51`
- Neighborhood seeds: `page:overview`, `page:metadata`, `page:agents-coding-generate`
- Code/schema: `backend/persist/pages.ts`, `data/meta/schema.json`

**Already on the bus, not previously on the open page:** `summaryShort` / `summaryLong`, `related` ids, paper-DB `figures` / `math` / `executedIn`, graph neighbors. Rail already had questions, glossary, and citation cards.

**Not in DB this turn:** no extra OA title was required. `POST /api/ask` did not return hits.

**Dropped generate ideas:** LLM-written MetaRAG tags as body (declined on [Metadata](/site/metadata)); invented Paper Plain study numbers; Caesar crawl.

## Website sandbox (same pass)

New drafts default to `data/md/sandbox/` with `parent: page:sandbox` and optional `sandboxLane: idea|code|research`. They nest under [Sandbox](/site/sandbox) (olive **Lab** badge, immediately under Overview). They stay off encyclopedia peers until **promote to main**. Every `/site` page can still show the olive pointer block. Chat points at `/site/<slug>`. `POST /api/sandbox/promote` copies to `data/md/` only after the lock phrase. Git lab merge is still discuss. Operator fork: [Sandbox fork](/site/workbench-sandbox).

## Leftover thin pages (honest)

Still short after this pass: [Fetch](/site/agents-fetch), [Generate](/site/agents-generate), [Agents](/site/agents), most Workbench children, [Inbox](/site/inbox), [Papers](/site/papers), [Maps](/site/maps), [Execution](/site/execution), [Summaries](/site/summaries). Overview and Implement are **intentionally** short chrome. Do not “fix” those two by turning them into essays.
