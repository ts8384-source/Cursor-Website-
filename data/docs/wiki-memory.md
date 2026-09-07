---
title: Wiki-based LLM memory
slug: wiki-memory
id: page:wiki-memory
type: page
nav: Wiki memory
order: 11
depth: long
gist: Wiki is Living Papers MD plus the meta bus, shaped collaboratively on the focused pages. No article decay. No compiler.
summaryShort: Collaborative wiki-memory basis
summaryLong: Locked grounding is collaborative-basis — pad and Cursor agent edit the same MD, retrieve by current intent, grow the wiki, decay only scratch /api/memory. Comparison of Karpathy / MemPalace / v2 / Metabolism stays below. No compiler and no later hats.
tags:
  - memory
  - wiki
  - papers
related:
  - page:memory
  - page:overview
  - page:hybrid-rag
  - page:control
  - page:diagrams
  - page:gaps
  - page:agents
  - page:knowledge-graph
  - diagram:wiki-memory-compare
  - diagram:wiki-memory-grounding
  - arxiv-2604-12034
  - arxiv-2604-21284
updated: 2026-09-06
questions:
  - What is each wiki-memory approach actually storing?
  - How do agents read and write, and what decays?
  - What is the locked grounding basis on this fork?
  - What should organize a wiki on this fork first?
  - Which §8 papers are in the DB, and which are still missing?
glossary:
  - term: compiled wiki
    def: Interlinked markdown the LLM maintains between raw sources and the human. Karpathy’s layer 2.
  - term: schema (wiki)
    def: The instruction file that defines wiki structure and ingest/query/lint workflows (CLAUDE.md / CONTROL.md).
  - term: grounding basis
    def: The first organization we treat as canonical here. Combinations come after, not before.
  - term: collaborative-basis
    def: Human (pad) and Cursor agent edit the same Living Papers MD. When focused, retrieve and change only the pages for that intent.
  - term: focus
    def: The current park or task. Retrieve related pages and papers; do not rewrite the whole wiki.
  - term: finalized page
    def: Encyclopedia article that is no longer marked Temporary. Diagrams stay think-through, not a compiler.
citations:
  - arxiv-2604-12034
  - arxiv-2604-21284
  - living-papers-heer-2023
  - treereader-2025
  - graphrag-2024
  - hm-rag-2025
  - heta-rag-2025
  - swe-agent-2024
  - gorilla-2023
  - agent-workflow-memory-2024
  - paper-plain-august-2023
---

# Wiki-based LLM memory

This is the standing compare of compiled-wiki memory vs this fork. It is not a Karpathy compiler, not a two-process research crew, and not coding-scheme. Chrome stays Paper Plain / Living Papers; the graphs sit below this article and also on [Diagrams](/site/diagrams) [@paper-plain-august-2023] [@living-papers-heer-2023].

## What

A **wiki-memory** design stores interlinked Markdown the agent and human share. This page records what the April 2026 cluster proposed (when the paper is in DB) and what this repo already locked: collaborative Living Papers MD, focused retrieve, no article decay.

The notes file (`research-agent-architecture-notes.md` §8) says several projects converged in April 2026 on a **compiled wiki as agent memory**. The open frontier they flag is how to plug that pattern into a multi-agent scheme. This page stays on the wiki pattern itself.

Cite-or-fetch: claims below name catalog ids. If a named project is **not in the paper DB**, the page says so.

## Grounding basis (locked)

The operator tried the **collaborative-basis** idea against this repo’s structure. **When we focus**, the wiki should follow **intent** and be **shaped collaboratively** (human + agent on the same Markdown). That is the locked pick. It beats decay on wiki pages, and it beats standing up a second Karpathy compiler beside the site we already have.

| Rule | What it means here |
| --- | --- |
| Wiki | Existing Living Papers MD (`data/md/`, `content/CONTROL.md`) plus the metadata bus (`GET /api/meta`, diagram node ids, `@chunk`). The wiki **can grow**. Articles and papers **do not decay** [@living-papers-heer-2023]. |
| Decay | Scratch only: `GET /api/memory` user/project lanes. Half-life, touch, forget. Not on `/site/*` articles. Not on `GET /api/papers/db`. |
| Collaborative | The iPad pad and the Cursor agent edit **the same files**. No hidden `wiki/` the human never sees. Park is the human stroke; the agent writes MD after retrieve. |
| Focus / intent | Retrieve and edit the pages (and papers) related to the **current park or task**. Cite-or-fetch on those hits. Do not rewrite the whole wiki every turn [@hm-rag-2025] [@swe-agent-2024]. |
| Later hats | coding-scheme and research-assistant stay **not enabled**. [CONTROL](/site/control) already says so. Do not import those skills this pass. |

Karpathy’s three layers already map onto this repo without a second compiler: immutable inputs (papers / inbox / code) → site MD humans already read → schema in CONTROL and the drawing-loop skill. Graph structure is id links on the meta bus, not an Obsidian vault and not GraphRAG communities [@graphrag-2024] [@living-papers-heer-2023].

Combining schemes is allowed **later**: name existing tools Query / Ingest / Lint; hang MemPalace-style hierarchy off metadata tags; run Metabolism TRIAGE/DECAY/AUDIT only on forgetting lanes. Do not combine first. Do not implement a wiki compiler or a two-process crew on this pass.

Coding- and research-assistant patterns that must share this wiki live on [Agents](/site/agents) and the [knowledge graph](/site/knowledge-graph). The old flagged-schemes dump is retired from nav.

A librarian that rewrites every entity page would drift from the articles the human already parks on. Focused collaborative edit of the same MD is the fork-shaped version of “compiled wiki.”

## Ingest status for §8 names

| Name in the notes | In `GET /api/papers` / `db`? | What we have |
| --- | --- | --- |
| Memory as Metabolism (Miteski, 2026) | **Yes** — `arxiv-2604-12034` | OA arXiv PDF + abstract extract |
| MemPalace (Jovovich & Sigman, 2026) | **No original paper** | GitHub project, not an OA PDF. Analysis paper **yes**: `arxiv-2604-21284` |
| Spatial metaphors / MemPalace analysis (Dey & Viradecha) | **Yes** — `arxiv-2604-21284` | OA arXiv; local PDF string extract was thin, abstract restored from the abs page |
| Karpathy LLM Wiki | **Not in DB** | Public gist / HTML. Fetch API only accepts OA PDFs |
| LLM Wiki v2 | **Not in DB** | Public gist / HTML. Same fetch limit |
| llm-wiki-memory-template | **Not in DB** | GitHub wiki HTML. Same fetch limit |
| FadeMem / MemoryBank (notes §4, cited by §8 cluster) | Files exist (`arxiv-2601-18642`, `arxiv-2305-10250`) | Ingest stubs; arXiv API timed out; **do not treat as readable papers** |

Comparison diagrams: `wiki-memory-compare` and `wiki-memory-grounding` under `data/diagrams/`. Regions on the grounding graph reuse the loop labels **iPad / local PC / website**. The compare graph uses author regions (compiled wiki / spatial retrieve / lifecycle) because it is not the hybrid-loop partition.

## Each approach

### Karpathy LLM Wiki (flagship in the notes; gist not in DB)

**What it is.** A librarian pattern: the LLM incrementally compiles raw sources into interlinked markdown instead of re-deriving an answer from chunks on every query. The notes and the Metabolism abstract treat this as the April 2026 flagship [@arxiv-2604-12034]. The gist itself is **not in this paper DB**.

**How memory is structured.** Three layers: (1) raw sources, immutable; (2) compiled wiki the LLM owns; (3) a schema document (`CLAUDE.md` / `AGENTS.md`) that states conventions and workflows. Graph structure is supposed to *emerge* from links; Obsidian is a renderer, not the design goal.

**How agents read/write.** Ingest reads a new source and updates many wiki pages. Query reads `index.md` then drills into pages (small-to-mid scale, no required embedding store). Lint keeps structure consistent. Humans curate sources and ask; the LLM writes the wiki layer.

**Decay.** None in the original pattern. Everything compiled stays equally live until a human or lint pass edits it.

### llm-wiki-memory-template (repo wiki; not in DB)

**What it is.** An open template that turns the Karpathy pattern into a project-local durable wiki plus agent surfaces. **Not in the paper DB** (HTML wiki, not an OA PDF).

**How memory is structured.** Persistent, LLM-maintained, cross-linked markdown. The notes record an explicit “compounding wiki vs RAG” tradeoff.

**How agents read/write.** Three operations: **Query, Ingest, Lint**. That is an ACI-shaped verb list, closer to this repo’s `GET /api/tools` stance than to a chat dump [@swe-agent-2024] [@gorilla-2023].

**Decay.** Not specified in the notes beyond the compounding-vs-RAG tradeoff. Treat as “durable wiki” unless a later OA source says otherwise.

### LLM Wiki v2 (gist; not in DB)

**What it is.** An extension of Karpathy’s gist: lifecycle on top of compile. **Not in the paper DB.** The Metabolism paper names it as part of the April 2026 cluster [@arxiv-2604-12034].

**How memory is structured.** Same three layers, plus confidence on claims, supersession, and four consolidation tiers: working → episodic → semantic → procedural.

**How agents read/write.** Same ingest/query/lint loop; promotion between tiers as evidence accumulates (typically an LLM pass, not a deterministic frontmatter clock).

**Decay.** Yes. Ebbinghaus-style exponential fade: unused claims are deprioritized, not always deleted. Reinforcement (access or a new confirming source) resets the curve. Architecture facts decay slowly; transient bugs decay fast. That is the closest literature neighbour to [Memory](/site/memory) on this site.

### MemPalace (project not in DB; analysis paper is)

**What it is.** Hierarchical *spatial* memory (method of loci): Wings → Rooms → Closets → Drawers. Notes quote 96.6% R@5 on LongMemEval. The original repo is **not an ingested paper**. What we can cite is Dey & Viradecha, *Spatial Metaphors for LLM Memory* [@arxiv-2604-21284].

**How memory is structured.** Verbatim storage. The palace is a spatial metaphor over a vector database. The analysis paper says Wings/Rooms/Drawers map to metadata filters on Chroma, and that headline recall is mostly verbatim + default embeddings, not the metaphor itself [@arxiv-2604-21284].

**How agents read/write.** Write path: deterministic, zero LLM, cheap wake-up. Read path: nearest-neighbor (plus optional hybrid heuristics / rerank). This is RAG with hierarchy, not a compiled markdown wiki.

**Decay.** Not the v2 forgetting curve. Compression / AAAK is discussed in the analysis; it is not this repo’s half-life lanes.

### Memory as Metabolism (in DB)

**What it is.** Miteski (CODE University Berlin, April 2026) situates the Karpathy / MemPalace / LLM Wiki v2 cluster against RAG and production stores (MemGPT, Mem0, Zep, A-Mem, MemMachine, SleepGate, Second Me) and proposes a *companion* governance profile [@arxiv-2604-12034].

**How memory is structured.** A single-user compiled wiki is assumed. The contribution is obligations and invariants against **entrenchment**: the wiki should mirror the user operationally and compensate on epistemic failure (contradiction suppression, ossification).

**How agents read/write.** Five named operations: **TRIAGE, DECAY, CONTEXTUALIZE, CONSOLIDATE, AUDIT**, plus memory gravity and minority-hypothesis retention. Contradictory evidence should have a structural path to update a protected dominant interpretation over multiple cycles.

**Decay.** Yes — DECAY is a first-class op, but the point is governance of drift, not “delete unused chat.” Papers in this repo still do not enter the forget log.

### This project today (already built)

| Layer | Where it lives | Decays? | Who writes it |
| --- | --- | --- | --- |
| Raw | `data/papers`, inbox park, code | No (papers permanent) | Fetch / park / `@chunk` |
| Compiled wiki | `data/md/`, `content/CONTROL.md` | **No** (grows) | Pad + agent, same files, **focused** |
| Schema | CONTROL + drawing-loop skill | No | Human + agent |
| Query | Isolated hybrid RAG + meta title/tags | N/A | Cite-or-fetch on the current intent |
| Forget | `GET /api/memory` user/project lanes | **Yes** (scratch only) | Memory API, not wiki pages |

This is Living Papers (MD is the site) plus TreeReader-like TOC, not an Obsidian compile step [@living-papers-heer-2023] [@treereader-2025]. Hybrid retrieve stays HM-RAG / HetaRAG *cited* as multi-store inspiration; grounds stay isolated [@hm-rag-2025] [@heta-rag-2025]. Workflow memory is CONTROL, not AWM induction [@agent-workflow-memory-2024].

## Paper summaries (cite-or-fetch)

**`arxiv-2604-12034` — Memory as Metabolism.** In DB. RAG remains the default persist pattern; April 2026 produced a visible cluster of personal compiled wikis (Karpathy, MemPalace, LLM Wiki v2). The paper’s own design is a companion governance profile: mirror the user on operational dimensions, compensate on epistemic failure modes, implement TRIAGE / DECAY / CONTEXTUALIZE / CONSOLIDATE / AUDIT, and keep a path for contradictory evidence to move a centrality-protected interpretation. Single-agent safety is explicitly partial [@arxiv-2604-12034].

**`arxiv-2604-21284` — Spatial Metaphors for LLM Memory.** In DB (OA abs + local PDF). MemPalace stores conversations verbatim, organizes them Wings→Rooms→Drawers, and claims 96.6% LongMemEval R@5 with no LLM on write. Independent analysis: that recall is mostly verbatim Chroma (`all-MiniLM-L6-v2`) plus metadata filters; the palace metaphor is organizational. Still credited: verbatim-first storage, ~170-token wake-up, deterministic write path, systematic spatial metaphor. Benchmarks were over-claimed in launch marketing [@arxiv-2604-21284].

**`living-papers-heer-2023`.** In DB. Markdown is the scholarly source; compile to web + extraction API. That is why `data/md` is the wiki here [@living-papers-heer-2023].

**`treereader-2025`.** In DB. Hierarchical Wikipedia-like reader. Licenses the left TOC, not a compiled entity wiki [@treereader-2025].

**`graphrag-2024`.** In DB. Content graph vs flat chunks. We cite it and still do **not** build community summaries; `GET /api/meta` is the cheap id graph [@graphrag-2024].

**`hm-rag-2025` / `heta-rag-2025`.** In DB. Hierarchical / heterogeneous retrieve. License isolated grounds, not a palace [@hm-rag-2025] [@heta-rag-2025].

**`swe-agent-2024` / `gorilla-2023`.** In DB. Structured ACI and tool catalogs. Query/Ingest/Lint should stay tool names if we ever adopt them [@swe-agent-2024] [@gorilla-2023].

**`agent-workflow-memory-2024`.** In DB. Reusable workflows on web tasks. Not what `/site/memory` implements [@agent-workflow-memory-2024].

**Not in DB (do not invent from the gist):** Karpathy LLM Wiki source text, LLM Wiki v2 source text, llm-wiki-memory-template pages, MemPalace README as a paper. **In DB but unusable extracts:** `arxiv-2601-18642` (FadeMem), `arxiv-2305-10250` (MemoryBank).

## Diagrams

Two React Flow graphs (click a node for `summaryLong` and id links):

1. **Wiki-memory approaches (temporary)** — `diagram:wiki-memory-compare`. Three author regions: compiled wiki, spatial retrieve, lifecycle.
2. **Grounding basis on this fork (temporary)** — `diagram:wiki-memory-grounding`. iPad / local PC / website. Park sets focus; pad + agent write the same site MD; meta bus and hybrid RAG retrieve those pages; decaying lanes do not rot articles.

Directed edges stay two-tone: teal forward, orange feedback (decay / govern / cite-or-fetch). No compiler pipeline is drawn as if it were implemented.

## What we are not doing

- No `wiki/` compiler, no ingest that rewrites the whole wiki or every entity page from raw PDFs.
- No decay clock on articles or papers. Decay stays on `/api/memory`.
- No two-agent idea vs solver crew, no coding-scheme or research-assistant import.
- No MemPalace Chroma palace beside the existing grounds.
- No Metabolism AUDIT cron.
- This page is **finalized encyclopedia**. Diagrams remain think-through, not an implemented compiler.
