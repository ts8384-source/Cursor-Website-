# content/CONTROL.md

---
title: Agent-computer interface
slug: control
nav: Control
order: 5
gist: Structured tools plus this file are the ACI. Agents must not scrape the site DOM.
questions:
  - How do I run the pad, backend, and RAG index?
  - How should retrieve, render, and test agents stay modular?
  - How do I add a paper or a Markdown page and rebuild?
  - What happens on every iPad park (the drawing-loop scheme)?
  - Where is the permanent paper DB versus decaying memory?
  - How does cite-or-fetch work (sight or vision)?
glossary:
  - term: ACI
    def: Agent-computer interface — a small, structured action space (SWE-agent, NeurIPS 2024).
  - term: ground
    def: An isolated retrieve index. This repo never runs RRF across grounds.
  - term: seed
    def: Copy drop-folder files into data/corpus so rebuild can index them.
  - term: forgetting
    def: Half-life decay on user/project memory. Permanent papers are excluded.
  - term: drawing-loop
    def: Park → hybrid RAG → MD pages → paper DB / maps / memory → delete PENDING. Autosave never writes the site.
  - term: tied board
    def: A pad canvas keyed to a page, paper, diagram, or math record. Created by POST /api/boards as clean (empty) or stamped (artifact images). Applied only after Park.
  - term: "@chunk"
    def: Comment-only code metadata fence. Parser writes the same GET /api/meta records (type=code).
  - term: cite-or-fetch
    def: Every factual claim must cite a retrieve hit id. If the work is not in the DB, say so and POST /api/papers/fetch — do not invent.
  - term: wiki knowledge graph
    def: GET /api/graph view over meta links. Neighborhood then real pages. No invented edges.
  - term: wiki nest
    def: Child frontmatter parent (page id). Sidebar tree and Overview map both read GET /api/pages. Hidden pages stay out.
  - term: generate seed
    def: POST /api/generate/seed returns an in-DB paperId. Missing ids are not in DB.
  - term: will-implement
    def: Wiki status — decided, not built. discuss = thinking; implemented = done. Never “production.”
  - term: To-implement
    def: Write/erase work queue (GET/POST /api/implement). Not the Overview page tree. First Workbench child.
  - term: depth
    def: Page frontmatter short|standard|long. Tunes how much cited body to write. Not a gist replacement.
  - term: pageBudget
    def: Optional target word count. 0 means use the depth default (120 / 350 / 700).
  - term: website sandbox
    def: Lab nest at /site/sandbox (highlight lab). Children under data/md/sandbox/ stay off encyclopedia peers until promote to main. Lanes idea | code | research.
citations:
  - swe-agent-2024
  - gorilla-2023
  - webarena-2024
  - mind2web-2023
  - agent-workflow-memory-2024
  - living-papers-heer-2023
  - paper-plain-august-2023
  - semantic-reader-project-2023
---

# Agent-computer interface

This file is the **primary control surface** for humans and agents. It is Markdown on disk (`content/CONTROL.md`) and a page on the site (`/site/control`). That is the Living Papers idea applied to operations: one source, machine-readable list via `GET /api/pages`, not a hidden wiki in chat [@living-papers-heer-2023].

SWE-agent shows that agents fail when the interface is a raw shell or an unbounded webpage. Give them a designed ACI [@swe-agent-2024]. WebArena and Mind2Web show the same failure mode on the open web: HTML is too large; filter, then act on structured controls [@webarena-2024] [@mind2web-2023]. Gorilla is the catalog pattern: list tools, then call them [@gorilla-2023].

**Do not scrape this site’s DOM.** Use `GET /api/tools` and the routes below. **Cite-or-fetch:** retrieve first; cite a hit id; not in DB → `POST /api/papers/fetch` (do not invent).

## How to run

Node is `C:\Program Files\nodejs`. From the repo root:

1. Backend API on **5175**: `npm run dev:backend` (or `npm run dev`, which starts both).
2. Pad + site on **5174**: `npm run dev:frontend`. Canvas is `/`. Scholarly site is `/site`.
3. RAG (Python): `pip install -r requirements-rag.txt`, then `python -m rag.cli seed` and `python -m rag.cli rebuild`.

**PC website:** `http://127.0.0.1:5174/site/overview` (this machine). Same Wi‑Fi also serves `http://10.17.3.251:5174/site/overview`. **iPad Safari:** stay on Tailscale `http://100.107.135.79:5174/` (pad at `/`). Do not put Safari on the LAN IP if Tailscale already works. API is proxied as `/api` on the pad host (same origin → 5175), or `http://127.0.0.1:5175/api/...` directly. Incoming pad heartbeat is not an SSRF check; CGNAT `100.64/10` is blocked only on outbound paper fetch. Pairing omits Hyper‑V/WSL (`172.25.64.1`) — that address is not reachable from the iPad.

Health check: `GET /api/health`.

## Process map

| Process | Port | Role |
| --- | --- | --- |
| Vite frontend | 5174 | tldraw pad at `/`; MD site at `/site` |
| Node backend | 5175 | HTTP tools only — no canvas |
| `python -m rag.cli` | none | seed, rebuild, search, ask, site JSON |

Keep `frontend/` vs `backend/` vs `rag/`. Do not invent a second vector store.

## Multi-agent scheme (modular)

Split work by **tool**, not by scraping pages. Suggested hats:

- **Retrieve** — `GET /api/search?q=...`, `GET /api/papers`, `GET /api/pages/:slug`. Reads isolated grounds. Never invents a toy JSON index.
- **Render** — writes Markdown under `data/md/` or `content/`. The site compiles from disk. Does not restyle chrome from taste.
- **Test** — `curl` the new routes; run `npx tsx --test scholar.test.ts` in `backend/`. Fix failures in the module that broke.
- **Fix** — one small file at a time. If search misses a new paper, seed and rebuild the **papers** ground, then re-query.

Do not stand up a Co-Assistant research crew or an RSNN specialist stack. This is the **drawing-loop site**. Workflow memory is this file, `data/bookkeep`, and decaying lanes in `data/memory` — not induced web workflows [@agent-workflow-memory-2024].

## Drawing-loop scheme (every park)

Durable operator: `.cursor/skills/drawing-loop/SKILL.md` plus this page. When `inbox/PENDING` exists, the canvas **is** the spec. Too much is better.

1. **Read the board** — `inbox/PENDING`, `inbox/message.md`, `inbox/latest.png`, `inbox/meta.json`. If `meta.json` has `boardId` / `pageId` / `paperIds` / `sourceType`, this is a **tied board**. `surface=clean` is an empty whiteboard: use the ids for context (the picture is not on the pad). `surface=stamped` means `latest.png` is ink **on** the page/paper/diagram export. Do not ask for a retyped prompt. **Autosave is not a site write.** Only a Park (`PENDING`) is an agent turn.
2. **Retrieve** — hybrid RAG ask on isolated grounds (`papers`, `code`, `scribble`, `cursor`, `md`). Labeled merge only. No cross-ground RRF. `GET /api/search`, `POST /api/ask`. Then **cite-or-fetch**: every factual claim cites a hit id; if it is not in the DB, say so and `POST /api/papers/fetch` — do not invent. Park/ask replies list citations.
3. **Write Markdown** — drafts go to the **website sandbox** first (`data/md/sandbox/`, `sandbox: true`, `parent: page:sandbox`, optional `sandboxLane: idea|code|research`, `depth: long`). Chat only points at `/site/<slug>`. Honor `depth` / `pageBudget`. **Do not stop at one-liners.** New or updated architecture pages (once promoted) default to `depth: long`. Overview and To-implement stay as-is (map / queue). `long` bodies include What / Why / How / Tools / MD paths / one worked example, and expand from `GET /api/meta/:id` (`summary.long`, `related`, `citations`) plus `GET /api/graph/neighborhood` — cited, not slogans. Paper Plain page-gist and section-gist stay collapsed chrome; the open article is the long form [@paper-plain-august-2023]. Explorations nest under `/site/sandbox` (Lab highlight). Main nest uses `parent: page:<slug>` after promote. Overview and the left TOC rebuild from `GET /api/pages` (sandbox children appear **only** under the Sandbox nest, not as encyclopedia peers).
3b. **Write metadata** — same ids on pages, papers, diagram nodes, modules, and `@chunk` code records (`data/meta/schema.json`, `GET /api/meta`). Nodes stay small; `summaryLong` and links live in meta. Code comments upsert `type=code` via `python -m rag.cli seed` (`data/meta/code.json`).
4. **Fetch papers** if the board names any — `POST /api/papers/fetch`, then `POST /api/papers/db/rebuild`.
5. **Permanent paper DB** — summaries, figures, math terms, execution notes. `GET /api/papers/db`. Papers do **not** forget.
6. **Math and diagrams → code** — `POST /api/maps/fetch` `{ "q": "RRF", "kind": "math" }`. Bidirectional edges in `data/maps`. Pages: `/site/maps`, `/site/diagrams`, `/site/execution`.
7. **Memory with forgetting** — user and project lanes (`GET /api/memory`). Half-life decay; `POST /api/memory/touch` strengthens. Not for papers or `data/md`. Parked corrections that contradict a note use `POST /api/memory` `{ "supersedes": "<old-id>" }` (do not append-only). `POST /api/memory/forget` writes bookkeep `AUDIT` on those lanes only.
8. **Chrome** — Paper Plain / Semantic Reader / Living Papers, not ink taste. UI HCI pack first.
9. **Agents** — `GET /api/tools` only. No DOM scrape.
10. **Close** — delete `inbox/PENDING`. Update this file when tools or hats change.

Hats stay modular by **tool** (Retrieve / Render / Map / Memory / Test / Fix). That is the useful part of “the-scheme” language. It is not a hierarchical research crew.

**Three inference-time walls** (thin isolated skills **on**; imported crews **off**): **Coding** (`.cursor/skills/coding-agent/SKILL.md`) vs **Research-Generate** (`.cursor/skills/research-generate/SKILL.md`) vs **Research-Fetch** (`.cursor/skills/research-fetch/SKILL.md`). If the user says “do the research,” **clarify generate vs fetch** before acting. Fetch backbone = Paper Lantern as a **wiki verb** + **cite-or-fetch** + `GET /api/graph/neighborhood`. Coding PED = A3 turn-control (one focused change-set; do not replay expired dumps; no LLM history rewriter). A4 = lazy **hand-authored** skills in this repo only. **Sandbox fork:** `POST /api/sandbox/fork` — work in the lab until send-back; `POST /api/sandbox/propose` is human-check only (no auto-merge); no Docker Desktop. **MGM hire:** `POST /api/tripwires/hire`; `armed` false until the **user says hire MGM**; if stuck, **ask the operator** first; never production. **TraceCoder is abandoned** (we looked, we dropped it). Prefer **one mash per wall**. Temporary Workbench nest: `/site/workbench` — **To-implement** (`/site/implement`) is the first child, above Sandbox. See `/site/agents` and `/site/knowledge-graph`.

## Cite-or-fetch (sight or vision)

Grounded answers are **retrieve-then-cite**. No sight, no claim.

1. **Retrieve first** — `GET /api/search?q=` and/or `POST /api/ask`. Isolated grounds (`papers`, `code`, `scribble`, `cursor`, `md`, plus labeled `meta`). Labeled merge only. **No cross-ground RRF.**
2. **Cite every factual claim** — each fact names a hit id (`chunk_id`, `doc_id`, paper id, or `page:<slug>`). Park and ask output include a **citations** list of those ids.
3. **Not in DB → fetch, do not invent** — if the paper, page, or chunk is missing, say so and offer `POST /api/papers/fetch` `{ "arxiv": "…" }` or `{ "url": "…" }` (OA only). Do not fill the gap from memory.
4. **Ask JSON** — `POST /api/ask` returns `hits[]`, `citeOrFetch: { mustCite: true, hits, notInDb, fetch }`, and `grounding: { cited[], unsupported[] }`. `unsupported` is cheap token overlap against hits, not an LLM judge.

## Later hats (imported crews still off)

Later: coding-scheme + research-assistant (Co-Assistant) hats stay **off as imported crews**. Do not stand up those skills. The three isolated skills above **are** the live runtime for this pass.

## Live vs later

**Live now**

- Nested wiki IA: child `parent:` in frontmatter → `GET /api/pages` `{ pages, tree }`. Left TOC expands; `/site/overview` is the live page map. Hidden pages stay out. **Sandbox** sits immediately under Overview (`highlight: lab`, olive Lab badge). Explorations are children of `page:sandbox`.
- Page length knob: frontmatter `depth` + optional `pageBudget`. House style: `/site/wiki-writing`. New architecture pages default **long**. Overview / Implement / Sandbox highlights stay map / queue / lab.
- Temporary Workbench nest: `/site/workbench` parent (`parent: page:workbench` children). **To-implement** queue first (`/site/implement`, `GET/POST /api/implement`). Sandbox fork/lab (`GET/POST /api/sandbox*`). MGM hire hook (`POST /api/tripwires/hire`). TraceCoder abandoned. ClawVM = explore-only. Never “production.” Pointer only — do not adopt their runtime.
- Wiki knowledge graph: `GET /api/graph`, `GET /api/graph/neighborhood`, `/site/knowledge-graph`, jump-to-node on pages.
- Hybrid retrieve prepends labeled `graph` hits (no cross-ground RRF).
- Fetch / coding / generate operator skills + `/site/agents*`.
- `POST /api/generate/seed` (in-DB paperId only).
- MGM hire hook (`GET /api/tripwires`, `POST /api/tripwires/hire`). `armed` false until the user hires; if stuck, ask first. Never production.
- Sandbox fork/lab (`GET /api/sandbox`, `POST /api/sandbox/fork`, `POST /api/sandbox/propose`). Website sandbox **nest** at `/site/sandbox`. Olive block on articles is a pointer. `POST /api/sandbox/promote` copies MD after “promote to main”. `requireDocker: false`. No auto-merge. Git lab merge still discuss.
- Internet → local papers: `/site/papers-ingest` (`POST /api/papers/fetch`, OA only, cite-or-fetch).

**Later / never this pass**

- MGM evolution, scaffold self-rewrite. (Hire hook is implemented; user starts it.)
- Docker / ClawVM / Oblivion runtimes. Sandbox is a git lab, not a container product.
- Paper Lantern MCP, second corpus, Caesar crawl, IntrAgent runtime.
- Microsoft GraphRAG community detection.
- Community / GitHub skills.

## Temporary — wiki-based LLM memory

`/site/wiki-memory`: wiki is Living Papers MD + meta bus, grown collaboratively on the focused pages (no article decay, no compiler). We will fix the section later.

## Retired — flagged schemes

`/site/flagged-schemes` is hidden from nav. Content lives on `/site/agents` and `/site/knowledge-graph`.

## Software engineering

- Small modules: `backend/persist/*` for disk, `backend/http/routes.ts` for HTTP, `frontend/src/site/*` for chrome, `rag/` for retrieve.
- Site **source is Markdown**. React only renders and hosts Paper Plain / Semantic Reader chrome.
- Test the contract (JSON routes), not the pixels, unless you changed hit targets.
- If both a fix and an exploit are requested, do the fix only.

## How an agent adds a paper

**On-demand (preferred when network is up):** `POST /api/fetch` or `POST /api/papers/fetch` with `{ "arxiv": "2407.01449" }` or `{ "url": "https://arxiv.org/pdf/2407.01449.pdf" }` (OA PDF or arXiv abs/pdf). The server downloads only OA, blocks localhost / private nets / link-local metadata IPs, writes `data/papers/<id>.md` (and `data/papers/pdf/` when a PDF arrives), updates `CATALOG.md`, then `python -m rag.cli seed` and `rebuild --grounds papers`. Already-ingested ids skip download and return `{ ok: true, skipped: true }`. Failures are non-200 with `{ ok: false, error }`.

**Offline drop folder:**

1. Write `data/papers/<id>.md` with the catalog header (`id`, `list`, `authors`, `year`, `venue`, `oa_url`) plus extracted text under 400 KB. Optional PDF in `data/papers/pdf/`.
2. Update `data/papers/CATALOG.md` with one line.
3. `python -m rag.cli seed` (drop folder → `data/corpus/loop/papers`).
4. `python -m rag.cli rebuild --grounds papers` (or full `rebuild`).
5. Confirm with `GET /api/papers` and `GET /api/search?q=<title keywords>`.

## How an agent adds a page

1. Drafts: create `data/md/sandbox/<slug>.md` with `sandbox: true`, `sandboxLane: idea|code|research`, `parent: page:sandbox-<lane>`, optional `sandboxFor: page:<host>`, plus the usual YAML (`title`, `slug`, `id`, `tags`, `related`, `summaryShort`, `summaryLong`, `depth` default **long**, optional `pageBudget`, `nav`, `order`, `gist`, `questions`, `glossary`, `citations`). Chat only points at `/site/<slug>`. Standing house-style pages may still live under `data/md/` or `content/`. `gist` / `summaryShort` are rail and meta — they are not the article. Expand `summaryLong`, `related`, citations, and graph neighbors into **cited** body sections. Do not invent.
2. Sandbox pages show in the Sandbox block (`GET /api/pages` → `sandbox`, `GET /api/sandbox`). They stay out of Overview. Promote with `POST /api/sandbox/promote` `{ "slug", "phrase": "promote to main", "destSlug"? }` — copies to `data/md/`. Does not merge git.
3. Seed + rebuild so the **md** ground can retrieve the new prose.
4. Cite ingested papers as `[@paper-id]` so the rail can show Semantic Reader cards.

## How an agent (or a fork) marks a code chunk

Comments only. Do not execute source to learn ids. Canonical grammar: `.cursor/skills/code-meta/SKILL.md` and `/site/code-meta`.

1. Allowlist roots in `data/meta/code-scan.json` (this template: `rag`, `backend`). Forks add `src` / `lib`. Never `node_modules`.
2. Put a fence above the function:

```
# @chunk
# id: code:loop.hybrid_search
# type: function
# implements: page:hybrid-rag
# citations: [hm-rag-2025]
# tags: [retrieve, rrf]
# summary: RRF fuse of BM25 and dense
# @end
```

   Tiny helpers: `# @chunk id=code:loop.tokenize type=function`.
3. `python -m rag.cli seed` writes `data/meta/code.json` and a **code**-ground corpus doc per chunk. Then `python -m rag.cli rebuild --grounds code`.
4. Confirm `GET /api/meta?type=code` and `GET /api/meta/code:loop.hybrid_search`. Same bus as pages and papers.

Invalid `@chunk` blocks are skipped with a lint warning (`data/meta/code-lint.json`). Ingest does not crash.

## Tool catalog (same as GET /api/tools)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Process + LAN URLs |
| GET | `/api/tools` | This catalog |
| GET | `/api/meta` | Metadata bus index (`?q=&type=&tag=&citation=&related=`; `type=code` is `@chunk`) |
| GET | `/a
