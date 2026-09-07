---
name: drawing-loop
description: >-
  Runs the full iPad park → hybrid RAG → Markdown site → paper DB →
  memory/forgetting → math/diagram↔code map loop. Use at the start of a turn
  when inbox/PENDING exists, when the user parks the canvas, or when implementing
  a drawing as the website spec.
---

# Drawing-loop (this repo)

This project is the **drawing-loop scholarly site**, not a Co-Assistant / RSNN research crew. Prefer thoroughness: too much is better.

## Strict sandbox output (every working turn)

**If this turn does work, write a page under `data/md/sandbox/`.** Chat is not the encyclopedia. Do not dump a long article only in the transcript.

- File: `data/md/sandbox/<slug>.md` with `sandbox: true`, `parent: page:sandbox`, `sandboxLane: idea|code|research`, `depth: long`.
- Chat **only** points at `/site/<slug>`. One or two sentences + the URL.
- Explain-the-lab copy is **not** a lane. That page is [How the lab works](/docs/sandbox-how-the-lab-works) (doc bin). The **Lab bench** is `/site/sandbox` (`highlight: lab`) — where children are written.
- Promote encyclopedia pages only with the phrase `promote to main` (`POST /api/sandbox/promote`). Do not silently graduate a lab note.
- Standing house-style updates: **boot / forker pages → `data/md/`**. **Framework explain → `data/docs/`**. CONTROL stays `content/CONTROL.md`. The **new work product** of the turn still also lands in the sandbox nest. Do not mix bins.

## Start of turn

Start of turn: read inbox PNG + message + PENDING. Also `GET /api/sandbox/flags` (or when the user says “flagged”) — flagged labs are interesting come-backs, not implement-queue statuses. Isolated **Task / subagent** returns must be a **condensed packet** (`POST /api/condensed`): stable ids (page / paper / chunk) plus a 1–3 sentence gist. Do not paste the child transcript into the parent. Contract: `/site/future`.

Do **not** spawn a second API or pad. One `:5175`, one `:5174`. Do not `POST /api/scripts` rebuild or fetch giant PDFs unless the park named a missing OA paper. Do not load unused RAG grounds into RAM; API search is BM25-only unless `RAG_DENSE=1`.

If `inbox/PENDING` exists, `inbox/message.md` plus `inbox/latest.png` **are** the user message. Do not ask them to retype the board. `inbox/meta.json` has timestamps, whether a PNG was written, and (when present) **tied-board** fields: `boardId`, `pageId`, `paperIds`, `sourceType`, `sourceId`, `sourceSlug`, `boardKey`, `surface`, `assetPath`. `surface=stamped` — the PNG is ink plus the underlying page/paper/diagram. `surface=clean` — empty pad; use metadata ids for context.

Autosave may snapshot ink into `inbox/` without `PENDING`. **Never live-write the site from autosave.** Apply MD / papers / diagrams only on a parked turn.

## Three inference-time roles (thin isolated skills)

Keep these hats **separate when work runs**. Later imported crews (coding-scheme, co-scientist) stay **off**. These three skills are on:

1. **Coding** — `.cursor/skills/coding-agent/SKILL.md`. Implement / test. A3 turn-control. Against wiki/fetch results already on the page.
2. **Generate** — `.cursor/skills/research-generate/SKILL.md`. Ideate / draft. Must `POST /api/generate/seed` (in-DB `paperId` only).
3. **Fetch** — `.cursor/skills/research-fetch/SKILL.md`. Retrieve / cite / extract. Lantern as wiki verb + cite-or-fetch. Not generation.

If the user says **“do the research”** (or equivalent), **clarify generate vs fetch** before acting. Coding is a third hat. Prefer **one mash per role**. Hierarchy only if a single mash would bottleneck. Do not collapse generate and fetch into one research runtime. Do not use coding-as-fetch.

Park faithfulness: implement what is on the parked board; do not improve-in extras that were not on the park. Operator pages: `/site/agents`, `/site/knowledge-graph`.

A4: lazy-load **hand-authored** skills in this repo only. No community/GitHub skills. Sandbox headline is fork/lab — `POST /api/sandbox/fork`, work in the lab until send-back, `POST /api/sandbox/propose` (no auto-merge). **Website Lab bench:** write the deliverable to `data/md/sandbox/` (`sandboxLane: idea|code|research`, `depth: long`). **No chat-only encyclopedia dumps.** Chat only points at `/site/<slug>`. Promote is `POST /api/sandbox/promote` with phrase `promote to main` (copies MD to **boot** `data/md/`; does not merge git). How-to copy: `/docs/sandbox-how-the-lab-works`. Two bins: boot `data/md` + `/site`; doc `data/docs` + `/docs` (delete that folder to dump the manual). Trash bin: `POST /api/sandbox/trash` — agents dump **only when the operator explicitly asks**; never encyclopedia; forgotten after 14 days. Security still applies. Do not require Docker Desktop. MGM: hire hook via `POST /api/tripwires/hire`; `armed` stays false until the **user says hire MGM**; if stuck, **ask the user** first. Do not auto-arm. Never “production.” TraceCoder is **abandoned** (we looked, we dropped it). To-implement queue: `GET /api/implement`. Flagged explorations: `GET /api/sandbox/flags` (interesting, not will-implement).

## Hybrid retrieve

Run hybrid RAG ask (papers/code/scribble/cursor/md grounds, labeled merge, no cross-ground RRF)

- Call `GET /api/search?q=...` and/or `POST /api/ask`. Isolated grounds only.
- Hits stay labeled by `ground`. Never fuse ranks across libraries.
- Graph neighborhood is a **labeled** `graph` hit list from `GET /api/graph` / `/api/graph/neighborhood`. Use it for context, then open the real page or paper. Not a new RRF soup.
- Do not invent a second vector store. Index lives in `rag/` (`python -m rag.cli`).

## Cite-or-fetch (sight or vision)

Grounded answers **must** retrieve first, then cite. No sight, no claim.

- Every factual claim names a hit id (paper / page / chunk).
- Park and ask output include a **citations** list of those ids (`POST /api/ask` also returns `citeOrFetch` + `grounding`).
- If the work is not in the DB: say so and `POST /api/papers/fetch` (or offer fetch). **Do not invent.**
- `grounding.unsupported` is cheap token overlap, not an LLM judge. Do not treat it as a verdict you can ignore.

## Living Papers: MD is the site

Update Living Papers MD from the idea. **Boot** pages in `data/md`. **Doc** pages in `data/docs`. Do not mix.

**New work this turn goes in `data/md/sandbox/` first.** Chat only points at `/site/<slug>`. Do not publish an encyclopedia dump in the transcript.

New or changed articles get YAML frontmatter (`title`, `slug`, `id`, `tags`, `related`, `parent`, `summaryShort`, `summaryLong`, `depth`, `pageBudget`, `nav`, `order`, `gist`, `questions`, `glossary`, `citations`). Child `parent: page:<slug>` builds the sidebar tree and Overview map. React only renders chrome. `architecture.md` is the latest ask dump, not a TOC page.

**Do not stop at one-liners.** `gist` / `summaryShort` are chrome and meta, not the article. New or updated architecture pages default to `depth: long` (target ~700 words, or `pageBudget` if set). `long` must include What / Why / How / Tools / MD paths / one worked example. **Expand from meta:** when writing a page, pull `GET /api/meta/:id` `summary.long`, `related`, `citations`, and `GET /api/graph/neighborhood` into cited sections. Paper Plain section-gist stays collapsed; the open body is the long form. Overview and To-implement stay as-is. House style: `/site/wiki-writing`.

## Metadata bus

Write/update the shared metadata layer (pages, papers, diagram nodes, modules, code chunks)

- Same `id` across `GET /api/meta`, pages, paper DB, `data/diagrams/*.json` node `meta`, and `@chunk` comments (`data/meta/code.json`).
- Code comments: `.cursor/skills/code-meta/SKILL.md`. Bus type is `code`. Comment `type` is kind (`function`, …).
- Schema: `data/meta/schema.json`. Index: `GET /api/meta`. One record: `GET /api/meta/:id`.
- Filter by `type`, `tag`, `citation`, `related`, `q`, `nest`, `parent`, `flagged`. Records carry `href`, `parent`, `nest`, `flags`, `graphDegree`. Agents fetch here instead of hardcoding node→page→paper links.
- Diagram nodes: attach `meta` (`summaryShort`, `summaryLong`, `pageId`, `paperIds`, `related`). Canvas stays minimal; the panel below React Flow shows `summaryLong` and id links.
- **Regions (hybrid loop only):** the architecture diagram has exactly three high-level partitions — iPad, local PC, website. Scribble/inbox → iPad; site/wiki/vis/frontend → website; everything else on that loop → local PC. Do not add a fourth leftover region. Do not put this split on the RSNN graph. Labels stay “iPad”, “local PC”, “website”. See [diagram-create](../diagram-create/SKILL.md).
- Search/ask prefer title and tags (labeled `meta` hits). Do not RRF meta into other grounds.

## Papers on demand

Fetch/ingest papers on demand if the board names any

`POST /api/fetch` or `POST /api/papers/fetch` with `{ "arxiv": "…" }` or `{ "url": "…" }` (OA only). Then confirm `GET /api/papers` and `GET /api/papers/db`.

When writing a diagram, if a node or page cites a paper/arXiv id, fetch + upsert into that same paper DB (`ensurePapersForDiagrams` after `POST /api/ask`).

## Chrome is literature, not taste

Site is literature chrome (Paper Plain / Semantic Reader / Living Papers), not taste

Left TOC, gists, key questions, citation cards. Handbook + `packs/ui-hci` before UI edits. Do not restyle from the ink aesthetic.

## Agents use tools

Agents use `GET /api/tools`, not DOM scrape

The ACI is `content/CONTROL.md` (also `/site/control`). Structured routes only.

## Thoroughness

Too much is better: write full pages at the page `depth`, cite papers, update CONTROL.md

Implement the drawing in `frontend/`, `backend/`, `data/md/` (boot), `data/docs/` (framework explain only), and RAG ingest when the diagram asks. Permanent papers live in `data/papers` and `GET /api/papers/db`. User/project memory uses forgetting (`GET /api/memory`); papers, `data/md`, and `data/docs` do not decay. If a parked correction contradicts a note, `POST /api/memory` with `supersedes: <old-id>` — do not append a second fact. Forget writes bookkeep `AUDIT` on those lanes only.

## End of turn

Delete PENDING after acting

Remove `inbox/PENDING` so the next park is a new turn.

## Ports and Node

- Pad `/` :5174, site `/site`, API :5175. Do not steal 5173.
- Node: `C:\Program Files\nodejs`.
- Do not commit unless the user asked.

## Extra loop pieces (this site)

| Board idea | Tool / page |
| --- | --- |
| Metadata bus | `GET /api/meta`, `GET /api/meta/:id`, `data/meta/schema.json` |
| Code `@chunk` | `rag/code_meta.py`, `GET /api/meta?type=code`, `.cursor/skills/code-meta/SKILL.md` |
| Permanent paper DB | `GET /api/papers/db`, `/site/summaries` |
| Math → terms | `GET /api/math`, glossary + `$…$` links |
| Diagram / viz | `GET /api/diagrams`, `/site/diagrams` |
| How a paper is executed | `GET /api/execution`, `/site/execution` |
| Fetch code from math/diagram | `POST /api/maps/fetch`, `/site/maps` |
| Long-term memory + forgetting | `GET /api/memory`, `/site/memory`. Corrections use `supersedes`. Forget → bookkeep `AUDIT` (lanes only). |
| Tied iPad boards | On-demand `POST /api/boards` `{ surface: clean\|stamped }` (one click, one source). Writes `data/boards/ACTIVE`; the open pad at `/` polls `GET /api/boards/pending` and switches `persistenceKey` on that same tab. Clean = empty + meta. Stamped = artifact images. Do not `window.open` a PC tab. Do not preload the catalog onto `/`. |

Details: [reference.md](reference.md). Operator copy on the site: `/site/control`.
