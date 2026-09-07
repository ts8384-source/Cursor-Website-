# sandbox/memory.md

---
title: Memory and token optimization
slug: sandbox-memory
id: page:sandbox-memory
type: page
nav: Memory & tokens
order: 10
parent: page:sandbox
sandbox: true
sandboxLane: research
depth: long
pageBudget: 1100
gist: Lab exploration. Three sections — the paste, fetching agent, generative agent. Few agents, little context, grounded. Not a 12-agent crew.
summaryShort: Sandbox exploration of context diet
summaryLong: Temporary child of the Sandbox nest. Tracking list stays ⚠️. Fetch hat logs session hits only. Generate hat seeds in-DB paperIds and drops crawl/novelty slogans. Goal is few agents, low context, fast, grounded.
tags:
  - sandbox
  - temporary
  - exploration-only
  - memory
related:
  - page:sandbox
  - page:papers-ingest
  - page:memory
  - page:wiki-memory
  - page:agents-fetch
  - page:agents-generate
  - page:hybrid-rag
  - page:workbench-clawvm
  - diagram:sandbox-ia
citations:
  - arxiv-2601-18642
  - arxiv-2305-10250
  - arxiv-2604-12034
  - living-papers-heer-2023
  - paper-plain-august-2023
questions:
  - What is on the operator’s tracking list, and what is still ⚠️?
  - After ingest, what did fetch actually hit?
  - Which generate ideas stay, and which drop?
glossary:
  - term: Context Rot
    def: Named reason the list matters. OA fetch attempted this turn — see ingest log.
  - term: session hits
    def: Ids retrieved this turn only. Not a crawl of the open web.
---

# Memory and token optimization

**Exploration only — not a shipping feature.** Temporary child of [Sandbox](/site/sandbox). Permanent fetch recipe lives on [Papers from the internet](/site/papers-ingest). No ClawVM/MGM evolution runtime. No Caesar crawl.

Goal (his words, not a 12-agent crew): **few agents, little context, fast, no wasted compute, grounded in literature.**

Living Papers: this file is the page [@living-papers-heer-2023]. Paper Plain gists stay collapsed [@paper-plain-august-2023].

## 1. The paste

Faithful tracking list. Status of the whole list: **⚠️**. Why it matters: **Context Rot (Chroma)** — if that paper is not OA, the name stays a pointer, not a cite.

| Item | How he framed it | Status |
| --- | --- | --- |
| ClawVM | EuroMLSys 2026, Rafique & Bindschaedler; arXiv **2604.10352** if that is the one (confirm) | ⚠️ explore — not will-implement |
| Memobrain | CoRR **2601.08079** | ⚠️ |
| Context editing + memory tool | Anthropic-style context editing; treat as discuss, not ship | ⚠️ discuss |
| Learning to Share | Named on the list | ⚠️ |
| Isolated-subagent condensed returns | Return a short packet, not a replay of the child dump | ⚠️ |
| CompactRAG | Named on the list | ⚠️ |
| Tool/skill curation / SemaClaw | Curation, not a scanner product | ⚠️ SemaClaw **not in DB** before this turn |
| Mem0 | **Benchmark, not adopt** | ⚠️ |
| Graph-memory survey | Survey pointer | ⚠️ |

Already in this repo’s paper DB before the fetch hat (catalog ids):

- FadeMem `arxiv-2601-18642`
- Miteski / Memory as Metabolism `arxiv-2604-12034`
- MemoryBank `arxiv-2305-10250`

Those three are **in DB**. They are not a license to invent the rest.

ClawVM stays **explore** ([ClawVM page](/site/workbench-clawvm)). Context-editing is **discuss** on the implement queue if seeded. Do not mark will-implement unless he already decided — he did not.

## 2. Fetching agent

Run **after** internet ingest. This section is the fetch hat: retrieve, cite, extract. Not generation.

Rules: session hits only. In DB vs not in DB. Neighborhood, then the real page or paper. No invented facts.

### Before the hats — OA fetch attempts

See the table on [papers-ingest](/site/papers-ingest). This turn’s fetch calls are filled after `POST /api/papers/fetch`.

### Session retrieve (to be filled)

Queries this hat will actually run:

- `GET /api/search?q=FadeMem forgetting agent memory`
- `GET /api/search?q=MemoryBank Ebbinghaus`
- `GET /api/search?q=Memory as Metabolism Miteski`
- `GET /api/graph/neighborhood?id=arxiv-2601-18642`
- `GET /api/papers/db` confirm ids

**In DB (pre-fetch, catalog):** `arxiv-2601-18642`, `arxiv-2305-10250`, `arxiv-2604-12034`.

**Not in DB (pre-fetch):** SemaClaw; Context Rot; CompactRAG; Learning to Share; Memobrain `2601.08079`; ClawVM `2604.10352` (unconfirmed). Paywall → stay not in DB.

Neighborhood of FadeMem is a labeled `graph` list. Open `/site/papers#arxiv-2601-18642` — do not treat the graph as a second abstract.

## 3. Generative agent

`POST /api/generate/seed` — **in-DB `paperId` only**. If 404, hand off to fetch. Combinatorial ideas for **few agents, low context, fast, grounded**. Different judge = fetch hits / tests / human. Drop crawl. Drop “please be novel.”

### Seed (to be filled)

Seed payload and `paperId` land here after the generate hat.

### Kept vs dropped (provisional until seed)

**Keep (combinatorial, not repo facts):**

- Isolated subagent returns a **condensed packet** (ids + one gist), not the child transcript — analog to FadeMem’s selective fade [@arxiv-2601-18642].
- Few hats (fetch / generate / code), one mash per role, stop when session cites suffice.
- Mem0 as a **benchmark to compare against**, not a product to install.
- Neighborhood then real record — do not stuff the full graph into context.

**Drop:**

- Caesar crawl / “read the internet for novelty.”
- 12-agent research crew.
- ClawVM / MGM evolution runtime.
- Same-model self-review as a judge.
- Adopting Mem0 or SemaClaw as house memory.

## Tools / MD paths

`POST /api/papers/fetch`, `GET /api/search`, `POST /api/ask`, `POST /api/generate/seed`, `GET /api/implement`. This file: `data/md/sandbox/memory.md`. Parent: `data/md/sandbox.md`. Recipe: `data/md/papers-ingest.md`.

## Worked example

1. Confirm FadeMem is in DB (`GET /api/papers/db`).
2. Fetch Memobrain `{ "arxiv": "2601.08079" }` — land or **not in DB**.
3. Seed generate on an **in-DB** id (FadeMem or MemoryBank).
4. Write kept/dropped ideas on **this** page. Chat only points at `/site/sandbox-memory`.
