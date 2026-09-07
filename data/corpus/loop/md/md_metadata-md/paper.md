# metadata.md

---
title: Metadata bus
slug: metadata
id: page:metadata
type: page
nav: Metadata
order: 14
gist: One shared record per id — hand frontmatter, @chunk, GET /api/meta. Full SOTA pipelines stay declined; we steal heading-aware splits, supersedes, forget-lane AUDIT, cite-or-fetch, and touch/forget.
summaryShort: One schema, many writers
summaryLong: data/meta/schema.json is the contract. listMeta() assembles pages, the paper DB, diagram graphs and node meta, hardcoded modules, tied boards, and seed-written code.json. GET /api/meta filters that live index. Search prepends labeled meta hits and boosts titles/tags without cross-ground RRF. Full MetaRAG / semantic-chunker / chat-decay pipelines stay off. We still take explicit fields, cite-or-fetch, heading-aware ingest, memory supersedes, and forget-lane AUDIT.
tags:
  - metadata
  - aci
  - living-papers
related:
  - page:code-meta
  - page:tied-boards
  - page:control
  - page:hybrid-rag
  - page:diagrams
  - page:memory
  - page:wiki-memory
  - page:knowledge-graph
  - page:agents
  - module:code-meta
  - module:search
updated: 2026-09-06
questions:
  - What do the in-DB SOTA papers propose for metadata and memory?
  - What does this fork actually use?
  - Which elements do we still take, and what is already do vs now do?
  - Why skip those pipelines on a small collaborative wiki?
  - What fields does every metadata record share?
  - Who writes page, paper, node, board, and code records?
  - How do GET /api/meta filters and search boost work?
  - How does cite-or-fetch use those ids?
  - How do the diagram panel and Open on iPad consume meta?
  - How should a fork mark new pages and code?
glossary:
  - term: metadata bus
    def: One assembled index of records that share data/meta/schema.json. Not a second vector store.
  - term: id
    def: Stable key such as page:<slug>, a paper catalog id, node:<diagramId>:<nodeId>, diagram:<id>, module:<name>, board:<…>, or code:<domain>.<symbol>.
  - term: "@chunk"
    def: Comment-only fence. Seed writes type=code records onto this same bus.
  - term: naive 1200/150
    def: Fallback fixed-size ingest (1200 chars, 150 overlap) for unmarked blobs only. Heading-aware splits run first.
  - term: MetaRAG
    def: LLM-generated per-chunk metadata plus prefix-fusion / TF-IDF embeddings (arxiv-2512-05411). Not this bus.
citations:
  - living-papers-heer-2023
  - swe-agent-2024
  - gorilla-2023
  - paper-plain-august-2023
  - dashboard-design-patterns-2022
  - arxiv-2512-05411
  - arxiv-2410-13070
  - knowrag-2026
  - arxiv-2505-16067
  - arxiv-2601-18642
  - arxiv-2305-10250
  - arxiv-2604-12034
---

# Metadata bus

This architecture has **one** metadata bus. Living Papers already treats Markdown as extractable scholarly source [@living-papers-heer-2023]. The same *id* is reused for pages, papers, diagram nodes, modules, diagrams, tied iPad boards, and `@chunk` code. Agents list tools, then fetch records — Gorilla’s catalog pattern, SWE-agent’s designed ACI — instead of scraping the article DOM or inventing a sidecar YAML store [@gorilla-2023] [@swe-agent-2024].

Contract on disk: `data/meta/schema.json`. Live index: `GET /api/meta`. One record: `GET /api/meta/:id`. Assembler: `backend/persist/meta.ts` (`listMeta`). Operator copy: [CONTROL](/site/control). Skill: `.cursor/skills/drawing-loop/SKILL.md`.

Do **not** add a second bus. Code comments, node `meta`, and page frontmatter all compile into these records.

**Honesty (temporary):** this page names SOTA *ideas* from `GET /api/papers/db`. We do **not** run those pipelines. If a catalog file is abstract-only, the row says so. Do not treat the literature table as a feature list.

## Proposed SOTA (papers in this DB)

High-level only. Claims cite catalog ids. Sight: `GET /api/search` hits on `papers:arxiv-2512-05411-md`, `papers:arxiv-2410-13070-md`, `papers:catalog-md`, and the paper MD files below.

| Id | What it proposes | Extract in this DB |
| --- | --- | --- |
| `arxiv-2512-05411` (MetaRAG) | LLM writes **content / technical / semantic** annotations per chunk, then folds them into retrieval via TF-IDF-weighted embeddings or **prefix-fusion**. $3\times 3$ matrix of naive / recursive / semantic chunking. Reports 82.5% precision (recursive + TF-IDF) and NDCG 0.813 (naive + prefix-fusion) on enterprise docs [@arxiv-2512-05411]. | Long extract (abstract + methods). |
| `arxiv-2410-13070` | Asks whether **semantic chunking** (breakpoint or clustering) beats **fixed-size + overlap**. Across document retrieval, evidence retrieval, and answer generation, gains are inconsistent and often fail to pay the extra embed cost [@arxiv-2410-13070]. | Long extract (abstract + experiments). |
| `knowrag-2026` | Zero-shot scientific RAG plus **LLM-as-judge** diagnostics: most errors are **knowledge-base coverage gaps** (>46%), generation failures ~4%. When the base does not cover the case, say so rather than invent [@knowrag-2026]. | **Abstract stub** (OA PDF on disk; MD is the abstract). |
| `arxiv-2505-16067` | Empirical **experience-following**: high similarity between a new task and a stored memory yields a similar agent output. Risks: **error propagation** and misaligned replay. Quality of the memory bank matters; append-only stores leave old and new facts side by side [@arxiv-2505-16067]. | **Abstract stub**. |
| `arxiv-2601-18642` (FadeMem) | Agent **chat** memory with **active forgetting**: dual-layer hierarchy, exponential decay by relevance / frequency / time, LLM conflict merge, prune when strength drops. Aimed at Multi-Session Chat / LoCoMo-style unbounded dialogue, not a named wiki [@arxiv-2601-18642]. | Long extract (abstract + methodology). |
| `arxiv-2305-10250` (MemoryBank) | Long-term companionship memory: retrieve, continuously update, adapt personality; **Ebbinghaus-style** forget/reinforce by time and significance (SiliconFriend) [@arxiv-2305-10250]. | **Abstract stub**. |
| `arxiv-2604-12034` (Memory as Metabolism) | Companion-wiki **governance** ops — TRIAGE, DECAY, CONTEXTUALIZE, CONSOLIDATE, AUDIT — so a single-user compiled wiki metabolizes notes. Targets chat/companion knowledge, not this site’s articles [@arxiv-2604-12034]. | **Short abstract / extract**. |
| `living-papers-heer-2023` | Markdown is the scholarly source. Parse once; emit web, PDF, and an **extraction API for content and metadata**. Humans and machines share the same article [@living-papers-heer-2023]. | Full paper. |
| `swe-agent-2024` | Agents need a **designed ACI** (small structured actions), not a raw shell or unbounded HTML. Sight-then-act [@swe-agent-2024]. | Full paper. |
| `gorilla-2023` | **List a catalog, then call** — retrieve-aware API use so the model does not invent function names [@gorilla-2023]. | Full paper. |

## What we use

Fork template, one bus, no silent tags.

1. **Hand frontmatter** on `data/md/<slug>.md` and `content/*.md` — `id`, `tags`, `related`, summaries, `citations` (catalog ids only). That is the page record.
2. **`@chunk` comments** on allowlisted code — parser-only (`rag/code_meta.py` → `data/meta/code.json`). Bus `type=code`. Skill: `.cursor/skills/code-meta/SKILL.md`.
3. **One `GET /api/meta` bus** — `listMeta()` in `backend/persist/meta.ts` joins pages, papers, nodes, diagrams, modules, boards, and code. Schema: `data/meta/schema.json`. Not a second vector store. Search prepends labeled `ground: "meta"` hits and boosts titles/tags; **no cross-ground RRF**.
4. **Heading-aware ingest** — `rag/chunking.py` splits MD/papers on markdown and author headings (fences keep `#` comments intact; `@chunk` blocks stay atomic). Unmarked blobs still use 1200 / 150 with a `[title | ground]` prefix. Dense Chroma + BM25 inside each ground. Not MetaRAG prefix-fusion and not a semantic chunker [`code:loop.chunk_text`].

Cite-or-fetch already grounds claims: retrieve, name a hit id, or `POST /api/papers/fetch` if the work is missing. KnowRAG’s coverage-gap result is the same rule, already implemented as tools — not as an LLM judge [@knowrag-2026].

Wiki articles and the paper DB **do not decay**. Half-life forgetting is only `GET /api/memory` (user/project lanes). See [Memory](/site/memory) and the temporary [Wiki memory](/site/wiki-memory) compare.

## Why we are not using those pipelines

| Pipeline | Why this fork skips it |
| --- | --- |
| MetaRAG LLM tags + prefix-fusion | **Explicit > silent LLM tags.** A generated keyword/intent layer is another place to hallucinate. Humans and agents already write YAML and `@chunk` on the files they share. |
| Semantic / recursive chunkers | The semantic-chunking study **questions the cost**; we use heading/author structure, then 1200/150 only on unmarked blobs [@arxiv-2410-13070]. |
| KnowRAG judge loop | **Cite-or-fetch already covers grounding.** `notInDb` + fetch is cheaper than an LLM-as-judge on every ask. |
| Experience-following memory banks | We do not replay past *agent traces* as the source of truth. The wiki is the source. Append-only chat logs are the failure mode that paper flags [@arxiv-2505-16067]. |
| FadeMem / MemoryBank / Metabolism decay | Those stacks target **unbounded chat / companion** memory. This wiki is **named pages**. Articles must not fade. Decay stays on scratch lanes only [@arxiv-2601-18642] [@arxiv-2305-10250] [@arxiv-2604-12034]. |
| Living Papers / SWE-agent / Gorilla | We **do** take their *shape*: MD as source + extraction API, designed ACI, list-then-call. We do not take a second compiler or a second catalog. |

This is a **fork template**. Extra silent machinery is hard to explain to the next operator and easy to fork wrong.

## Perspective: SOTA may not even make sense here

The literature is built for **large, dirty, enterprise or chat** corpora. This repo is a **small local wiki** that a human (pad) and an agent (Cursor) edit as the **same files**. Scale arguments that justify LLM-written chunk metadata do not transfer.

MetaRAG’s contribution is an extra generated layer on top of chunks so a vector store can find the right segment in a huge S3 dump [@arxiv-2512-05411]. Here the “segments” already have **ids you can type**: `page:metadata`, `code:loop.hybrid_search`, `living-papers-heer-2023`. Adding an LLM summary of those ids is a **second hallucinated catalog** next to the first. Cite-or-fetch exists because we already distrust ungrounded model text; we should not feed retrieve a model-authored tag cloud.

Qu, Tu, and Bao’s own result is that semantic breakpoints often **do not beat** fixed-size overlap enough to justify the embed pass — especially when documents are not artificially stitched topic salads [@arxiv-2410-13070]. Our MD and papers are already sectioned. Heading-aware splits use that structure; 1200/150 remains the fallback for unmarked blobs.

FadeMem, MemoryBank, and Metabolism optimize **retention vs overload** when the store is an ever-growing dialogue. A Living Papers site is the opposite object: **named, collaborative, permanent** articles [@living-papers-heer-2023]. Applying DECAY or dual-layer fade to `/site/*` would hide the very pages the next park is supposed to extend. Experience-following would push the agent to copy last turn’s mistakes instead of re-reading the current MD [@arxiv-2505-16067].

So the interesting SOTA question is not “which metadata enricher to plug in.” It is whether **plug-in enrichers belong at all** when the corpus fits in a git repo and every record already has a shared id.

## What we take from those papers

Full pipelines stay off (table above). These **elements** still make sense on this stack. Each row is one steal: catalog id, mapping, status. Status is **already do** or **now do**. We do **not** add MetaRAG LLM tags, semantic embed chunkers, FadeMem dual-layer, or Metabolism wiki decay.

- **Explicit per-chunk fields** — `arxiv-2512-05411` (MetaRAG *idea*). They generate content / technical / semantic annotations per segment, then fuse them into retrieve [@arxiv-2512-05411]. We keep the *fields*, not the LLM tagger: YAML frontmatter and hand-authored `@chunk` (`id`, tags, related, citations, summaries). **Already do.** Parser: `rag/code_meta.py` → `GET /api/meta?type=code`. Do not add silent model tags.

- **Prefer cheap structure splits over semantic embed chunkers** — `arxiv-2410-13070`. Breakpoint / clustering semantic chunkers do not consistently beat fixed-size + overlap; the extra embed pass often fails to pay, especially off stitched topic salads [@arxiv-2410-13070]. **Now do:** heading- and author-section splits in `rag/chunking.py` (MD `#`, paper `Abstract.` / numbered sections). Fenced code is not a heading source. `@chunk` blocks stay one chunk. **Already do (fallback):** naive 1200 / 150 with a `[title | ground]` prefix on unmarked blobs only. Not Vectara-style semantic breakpoints.

- **Cite-or-refuse / not-in-DB → fetch** — `knowrag-2026`. Their diagnostic: most errors are knowledge-base coverage gaps (>46%), generation ~4%; when the base does not cover the case, say so [@knowrag-2026]. MD is an abstract stub; we do not claim their judge loop. **Already do:** cite-or-fetch — retrieve, name a hit id, or `citeOrFetch.notInDb` + `POST /api/papers/fetch`. Not an LLM-as-judge.

- **Do not replay known-wrong memory** — `arxiv-2505-16067` (experience-following). High similarity to a stored trace yields a similar agent output; error propagation; append-only leaves old and new facts side by side [@arxiv-2505-16067]. Abstract stub. **Already do:** wiki/MD is source of truth, not agent traces; `POST /api/memory/forget` zeros strength on scratch lanes. **Now do:** `supersedes` on `MemoryItem` and `data/meta/schema.json`. `POST /api/memory` `{ "supersedes": "<old-id>" }` marks the old row; default `GET /api/memory` and retrieve hide it; `/site/memory` shows the link. Disk keeps the audit trail.

- **Touch / recency reinforce** — `arxiv-2305-10250` (MemoryBank). Retrieve, update, and Ebbinghaus-style forget/reinforce by time and significance [@arxiv-2305-10250]. Abstract stub only — do not invent SiliconFriend internals. **Already do:** half-life decay + `POST /api/memory/touch`. Papers and `/site/*` articles never enter this lane.

- **AUDIT on forget-lanes only** — `arxiv-2604-12034` (Memory as Metabolism). Companion ops TRIAGE / DECAY / CONTEXTUALIZE / CONSOLIDATE / AUDIT target a compiled personal wiki, not this site’s articles [@arxiv-2604-12034]. **Already do (policy):** no DECAY or AUDIT cron on named pages or `GET /api/papers/db`. **Now do:** `POST /api/memory/forget` appends bookkeep `AUDIT` (`who` / `what` / `why` / `related`) on user/project lanes only — not wiki decay.

- **Query / Ingest / Lint as ACI verbs** — April 2026 wiki-cluster naming (Karpathy / template). **That gist is not a paper in this DB**; Metabolism names the cluster — do not invent the source text [@arxiv-2604-12034]. **Already do:** existing tools, not a compiler. Query ≈ `GET /api/search` / `POST /api/ask`. Ingest ≈ `POST /api/scripts` `{ "name": "seed" | "rebuild" }` and `POST /api/papers/fetch`. Lint ≈ CONTROL + cite-or-fetch / `grounding.unsupported`.

- **Markdown is the scholarly source** — `living-papers-heer-2023`. Parse once; humans and machines share the article; extraction API for content and metadata [@living-papers-heer-2023]. **Already do:** `data/md` + `GET /api/pages` / `GET /api/meta`. No second Living Papers compiler.

- **Designed ACI, not a raw shell** — `swe-agent-2024`. Small structured actions; sight then act [@swe-agent-2024]. **Already do:** `content/CONTROL.md` (`/site/control`).

- **List the catalog, then call** — `gorilla-2023`. Retrieve-aware API use so the model does not invent function names [@gorilla-2023]. **Already do:** `GET /api/tools`.

## Schema

Required on every record: `id`, `type`, `title`, `summary` (`short` + `long`), `tags`, `citations`, `related`, `glossary`, `updated`. Extra fields are allowed only when they appear in the schema (`additionalProperties: false`).

| Field | Role |
| --- | --- |
| `id` | Stable key. Pages `page:<slug>`. Papers = catalog id. Nodes `node:<diagramId>:<nodeId>`. Diagrams `diagram:<id>`. Modules `module:<name>`. Boards `board:<source>-<suffix>`. Code `code:<domain>.<symbol>`. |
| `type` | `page` \| `paper` \| `node` \| `module` \| `diagram` \| `board` \| `code` |
| `title` | Human name (page title, paper title, node label, …) |
| `slug` / `href` | Optional URL slug; site path or hash (`/site/hybrid-rag`, `/site/papers#colpali-2024`) |
| `summary.short` | 4–8 words for a one-line expand |
| `summary.long` | Panel prose and agent fetch |
| `tags` | Free strings (search boost prefers them) |
| `citations` | Paper catalog ids |
| `related` | Other meta ids (pages, papers, nodes, modules, …) |
| `glossary` | `{ term, def }` pairs (pages copy frontmatter; papers copy math terms) |
| `updated` | ISO or empty when the source has none |
| `supersedes` | Optional id this record replaces (memory corrections; same name on `MemoryItem`) |
| `pageId` | Nodes and boards: linked `page:<slug>` |
| `paperIds` | Nodes and boards: same paper ids as citations |
| `boardKey` / `sourceSlug` / `sourceType` / `surface` / `assetPath` | Tied iPad board |
| `kind` | Code only: `function` \| `class` \| `module` \| `block` \| `const` \| `type` \| `method`. Bus `type` stays `code`. |
| `implements` | Meta ids this record implements |
| `derived_from` | Upstream meta ids |
| `path` | Repo-relative source for `type=code` |

`GET /api/meta/:id` also accepts short aliases (`hybrid-rag` → `page:hybrid-rag`, `code:loop.hybrid_search`, and a few diagram/node prefixes) via `aliasesFor`.

## Who writes what

Nothing is a hidden second index. Writers feed `listMeta()`:

| Writer | What lands on the bus | How |
| --- | --- | --- |
| **MD frontmatter** | `type=page` | YAML on `data/md/<slug>.md` or `content/*.md`: `title`, `slug`, `id` (`page:<slug>`), `tags`, `related`, `summaryShort` / `summaryLong`, `nav`, `order`, `gist`, `questions`, `glossary`, `citations`. `listPages()` → `fromPage`. `architecture.md` is skipped (ask dump, not TOC). |
| **Paper catalog / DB** | `type=paper` | `data/papers/*.md` + `GET /api/papers/db`. Id is the catalog id. `related` is pages that cite that paper. Glossary is extracted math terms. |
| **Diagram node `meta`** | `type=node` | `data/diagrams/<id>.json` node `meta`: `summaryShort`, `summaryLong`, `pageId`, `paperIds`, `related`. Canvas label stays short. Skill: `.cursor/skills/diagram-create/SKILL.md`. |
| **Diagram file** | `type=diagram` | One record per graph (`diagram:<id>`), `related` = its node ids. |
| **Modules** | `type=module` | Curated rows in `backend/persist/meta.ts` (`module:search`, `module:diagrams`, `module:code-meta`, …). Not a second schema. |
| **Open on iPad** | `type=board` | `POST /api/boards` writes a tied board; `fromBoard` copies `pageId`, `paperIds`, `boardKey`, `surface`, `assetPath`. |
| **`@chunk` comments** | `type=code` | `rag/code_meta.py` on seed → `data/meta/code.json`. Grammar: `.cursor/skills/code-meta/SKILL.md` and [Code meta](/site/code-meta). |
| **Park / ask** | Updates writers above | Park reads `inbox/meta.json` (tied `boardId` / `pageId` / `paperIds`). Ask writes MD + diagram JSON and returns a **citations** list of retrieve hit ids. Autosave does not write the bus. |

Park step 3b in CONTROL: after MD, **write metadata** with the same ids. Creating a node without `meta` still gets a stub record from the label; the panel will say there is no long summary.

## APIs

### Index and one record

`GET /api/meta` returns `{ schema, bus, count, records }` from `metaIndex`. Filters (query string):

| Param | Effect |
| --- | --- |
| `q` | Token match on id, title, both summaries, tags, citations (any token or all tokens) |
| `type` | One of `page` `paper` `node` `module` `diagram` `board` `code` |
| `tag` | Tag equals or contains (case-insensitive) |
| `citation` | Record lists that paper id |
| `related` | Record id **or** its `related` array contains that id |

`GET /api/meta/:id` returns one record or `{ ok: false, error: "meta not found" }` (404).

Examples: `GET /api/meta?type=code`, `GET /api/meta?citation=living-papers-heer-2023`, `GET /api/meta/page:metadata`.

### Search boost (not a new ground fusion)

`GET /api/search` and `POST /api/ask` call `hybridSearch` / `runAsk` in `backend/retrieve/hybrid.ts`:

1. Isolated grounds (`papers`, `code`, `scribble`, `cursor`, `md`) stay labeled. **No cross-ground RRF.**
2. `metaAsHits(q)` prepends up to 8 bus records as hits with `ground: "meta"` and `chunk_id` / `doc_id` = the meta id.
3. `boostByMeta` adds a small score to *existing* ground hits when titles or tags overlap the query or matching meta titles. That is preference, not RRF into other libraries.
4. `askBias` appends a few matching meta titles onto the ask query.

If the Python index is down, search still returns those meta hits so agents are not empty-handed.

### Tools catalog

`GET /api/tools` lists the same routes as CONTROL (Gorilla: list, then call) [@gorilla-2023]. Meta rows:

- `GET /api/meta` — index + filters
- `GET /api/meta/:id` — one record

Related: `GET /api/pages`, `GET /api/pages/:slug`, `GET /api/papers/db`, `GET /api/diagrams`, `GET /api/boards`, `POST /api/ask` (hits + `citeOrFetch` + `grounding`).

## Cite-or-fetch uses ids

Sight or vision: retrieve first, then cite. No sight, no claim [@swe-agent-2024].

1. **Retrieve** — `GET /api/search?q=` and/or `POST /api/ask`. Hits carry `chunk_id`, `doc_id`, `ground`, `title`.
2. **Cite the id** — each factual claim names a hit id. Park/ask JSON `citations` is `doc_id` or `chunk_id` (`citationIds`). Meta hits therefore cite `page:…`, paper catalog ids, `node:…`, or `code:…` the same way as corpus chunks.
3. **Named refs** — `[@paper-id]` and arXiv-shaped tokens in the query are checked against the **paper catalog**. Missing → `citeOrFetch.notInDb` and `POST /api/papers/fetch` (OA only). Do not invent a paper that is not in `GET /api/papers` / `GET /api/papers/db`.
4. **Ask envelope** — `citeOrFetch: { mustCite: true, hits, notInDb, fetch }` plus `grounding: { cited[], unsupported[] }`. `unsupported` is cheap token overlap against hit text, not an LLM judge.

This page cites only catalog ids that are in the DB: `living-papers-heer-2023`, `swe-agent-2024`, `gorilla-2023`, `paper-plain-august-2023`, `arxiv-2512-05411`, `arxiv-2410-13070`, `knowrag-2026`, `arxiv-2505-16067`, `arxiv-2601-18642`, `arxiv-2305-10250`, `arxiv-2604-12034`. Abstract-only rows are flagged in the SOTA table above.

## Diagram click-panel and Open on iPad

React Flow stays compact: whole object, then detail on click [@dashboard-design-patterns-2022]. Key questions and gists stay in the rail [@paper-plain-august-2023]. Click a node:

1. `DiagramsBoard` loads `GET /api/diagrams` and the full `GET /api/meta` catalog.
2. `NodeMetaPanel` looks up `node:<graphId>:<nodeId>`.
3. The dock below the graph shows `summary.long`, then **Pages** (`pageId` + `related` that start with `page:`) and **Papers** (`paperIds` ∪ `citations`). Links use `href` on the record, or `/site/<slug>` / `/site/papers#<id>`.

**Open on iPad** (`frontend/src/site/OpenOnIpad.tsx`) POSTs those same fields onto a tied board:

- From an article: `sourceType=page`, `sourceId` = `page.id` or `page:<slug>`, `paperIds` = page `citations`.
- From a node: `sourceType=node`, `pageId` / `paperIds` / `related` / `citations` / `gist` from the meta record. Clean = empty pad + ids. Stamped = diagram JPEG (or page PDF / paper PDF). The pad HUD and later park `inbox/meta.json` keep those ids so the agent does not need the picture on a clean board.

See [Tied boards](/site/tied-boards).

## How a fork should mark new pages and code

Keep this bus. Do not add a parallel `meta.yaml` next to every file.

**New page**

1. `data/md/<slug>.md` with `id: page:<slug>`, `nav` (visible TOC), `order`, `gist`, `questions`, `citations` (only ids already in the paper DB, or fetch first), `related` to existing meta ids.
2. Confirm `GET /api/pages` and `GET /api/meta/page:<slug>`.
3. Seed + rebuild the **md** ground if you need retrieve.

**New code**

1. Allowlist roots in `data/meta/code-scan.json` (never `node_modules`).
2. Fence the function: `id: code:<your-domain>.<symbol>`, comment `type` = kind, `implements: page:…`, `citations` when a paper licenses the idea.
3. `python -m rag.cli seed` then `rebuild --grounds code`.
4. `GET /api/meta?type=code` and `GET /api/meta/code:<your-domain>.<symbol>`.

**New diagram node** — attach `meta` with `pageId` / `paperIds`; confirm `GET /api/meta?type=node`. If a cited paper is missing, `POST /api/papers/fetch`, do not invent.

Full grammar: [Code meta](/site/code-meta) and `.cursor/skills/code-meta/SKILL.md`. Nodes: `.cursor/skills/diagram-create/SKILL.md`.

## Operator files

| Path | Role |
| --- | --- |
| `content/CONTROL.md` (`/site/control`) | ACI: tools, park loop step 3b, cite-or-fetch, how to add a page or `@chunk` |
| `.cursor/skills/drawing-loop/SKILL.md` | Park → retrieve → MD → **same-id metadata** → papers → close PENDING |
| `.cursor/skills/drawing-loop/reference.md` | Id table and type enum |
| `.cursor/skills/code-meta/SKILL.md` | Comment grammar and fork enable list |
| `.cursor/skills/diagram-create/SKILL.md` | Node `meta`, regions only on the hybrid loop, paper upsert |
| `data/meta/schema.json` | JSON Schema for one record |
| `backend/persist/meta.ts` | Assembler, filters, boost, `metaAsHits` |
| `backend/retrieve/cite-or-fetch.ts` | `mustCite`, `notInDb`, grounding overlap |

The graph below is this bus, not a second catalog. Hybrid-loop **iPad / local PC / website** regions stay on that loop diagram only.
