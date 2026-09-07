# workbench.md

---
title: "Temporary — Architect's Workbench"
slug: workbench
id: page:workbench
type: page
nav: Workbench (temp)
order: 20
gist: Temporary parent. To-implement queue first, then sandbox as fork/lab, runtimes, MGM (will-implement), ClawVM explore-only. Never “production.”
summaryShort: Temporary parent, us vs spec
summaryLong: Temporary Living Papers parent. Maps HITL, hats, cite-or-fetch, memory, wiki, Docker, Caesar, MGM, tablet intent. Children nest with parent page:workbench. Named papers missing stay not in DB.
tags:
  - temporary
  - agents
  - wiki
  - retrieve
  - memory
  - compare
related:
  - page:implement
  - page:workbench-sandbox
  - page:workbench-runtimes
  - page:workbench-mgm
  - page:workbench-clawvm
  - page:workbench-round3
  - page:agents
  - page:agents-fetch
  - page:agents-coding
  - page:agents-generate
  - page:knowledge-graph
  - page:wiki-memory
  - page:memory
  - page:hybrid-rag
  - page:metadata
  - page:control
  - page:gaps
  - diagram:workbench-compare
  - diagram:workbench-ia
updated: 2026-09-06
questions:
  - What does this wiki already ship that the Workbench spec also wants?
  - What did we refuse, and why?
  - Which named papers are actually in the paper DB?
  - What is interesting but too costly or lock-breaking to add now?
glossary:
  - term: Owner of Judgment
    def: Workbench phrase — a human keeps the last call. Here that is the park plus tests and cite-or-fetch, not an LLM judge.
  - term: workbench spec
    def: A pasted co-author architecture (HITL, 1–3 agents, metabolic wiki, Docker, Caesar, MGM). Not implemented as a runtime in this repo.
  - term: citation-cocoon
    def: Risk of only retrieving what the wiki already cites. Cite-or-fetch breaks the cocoon by saying not in DB and offering OA fetch.
  - term: lock conflict
    def: A Workbench idea that would overwrite a rule we already locked (MD does not decay; no community skills; no Caesar crawl).
  - term: temporary nest
    def: This parent and its children. Sidebar expand uses child parent page:workbench. Chrome shows a temporary banner.
citations:
  - living-papers-heer-2023
  - swe-agent-2024
  - gorilla-2023
  - hm-rag-2025
  - graphrag-2024
  - knowrag-2026
  - paper-plain-august-2023
  - dashboard-design-patterns-2022
  - webarena-2024
  - arxiv-2605-18661
  - arxiv-2604-12034
  - arxiv-2601-18642
  - arxiv-2305-10250
  - arxiv-2602-06875
  - arxiv-2604-22861
  - arxiv-2604-20855
  - arxiv-2601-16206
  - arxiv-2505-16067
---

# Temporary — Architect's Workbench

**This section is temporary.** We will rewrite the nest later. It stays the **parent** for the To-implement queue, sandbox, runtimes, MGM, ClawVM, and round-3 notes. A coworker LLM pasted an **Architect’s Workbench** spec (HITL, 1–3 agents, retrieve ≠ generate, metabolic decay, Docker sandboxes, no self-grading, LLM Wiki, TraceCoder + MGM, IntrAgent + Caesar, SemaClaw / ToxicSkills, ClawVM / FadeMem, tablet as primary intent). We treat that spec as **their view of this project**. We do **not** hire their runtime.

Wiki status words (never “production”): **discuss** = thinking; **will-implement** = decided, not built; **implemented** = done.

## Temporary children (index)

Nest is child frontmatter `parent: page:workbench`. Overview and the left TOC pick them up. Diagram: `diagram:workbench-ia`. **To-implement is first** (`order` above Sandbox). That queue is the work list; Overview remains the page tree.

| Child | Path | Status |
| --- | --- | --- |
| To-implement | [To-implement](/site/implement) | **Live queue** (write/erase). Not Overview. Highlight **Queue**. TraceCoder archived/abandoned. |
| Sandbox as fork / lab | [Sandbox](/site/workbench-sandbox) | **implemented** hook. `POST /api/sandbox/fork`. Human check; no auto-merge. Security subsection. No Docker headline. |
| Paper runtimes | [Runtimes](/site/workbench-runtimes) | TraceCoder **abandoned** (we looked, we dropped it). Other paper runtimes stay mapped. |
| MGM on-demand | [MGM](/site/workbench-mgm) | **implemented** hire hook. User starts the call; if stuck, ask the operator. Not evolution. Never production. |
| ClawVM | [ClawVM](/site/workbench-clawvm) | **Explore-only.** Not on the will-implement list. Do not implement. |
| Round 3 thinking | [Round 3](/site/workbench-round3) | **Temporary notes** from the operator’s third-round feedback. |

CONTROL one-liner: temporary Workbench nest — To-implement queue first, then sandbox fork/lab, runtimes (TraceCoder abandoned), MGM hire hook, ClawVM explore-only. Never “production.”

Voice is two sides: **This wiki (us)** versus **Workbench spec (them)**. Claims that need a paper name a catalog id. If the named work is missing, the row says **not in DB** — do not invent [@knowrag-2026].

Diagram: `diagram:workbench-compare` on [Diagrams](/site/diagrams). CONTROL pointer only: [Agent-computer interface](/site/control).

## How to read this

| | This wiki (us) | Workbench spec (them) |
| --- | --- | --- |
| Object | Living Papers MD is the site. React is chrome. Park is the turn [@living-papers-heer-2023]. | A local-elaboration workbench: tablet intent in, isolated agents, compiled wiki, sandboxed tools, external verify. |
| Human | iPad park is the spec. Autosave does not write the site. | HITL / Owner of Judgment. Tablet intent is immutable. |
| Agents | One park → one Cursor agent. Three **hats** (fetch / generate / coding), not three processes. | Single-agent by default; 1–3 only if a mash bottlenecks. |
| Grounding | Cite-or-fetch + tests + human. `grounding.unsupported` is token overlap, not a judge. | No same-model self-grade. External verify. |
| Memory | Decay only on `/api/memory` scratch. Articles and papers stay. | Metabolic / Ebbinghaus decay, often on **wiki claims**. |

## Named papers — in DB or not

Cite-or-fetch before we map blocks.

| Name they used | In `GET /api/papers` / `db`? | Id if yes |
| --- | --- | --- |
| Memory as Metabolism (Miteski) | **Yes** (short extract) | `arxiv-2604-12034` |
| FadeMem | **Yes** (chat-memory extract). **Not** ClawVM paging. | `arxiv-2601-18642` |
| MemoryBank | **Yes** (abstract stub) | `arxiv-2305-10250` |
| TraceCoder | **Yes** (abstract) | `arxiv-2602-06875` |
| IntrAgent / IntraView | **Yes** (abstract) | `arxiv-2604-22861` |
| Caesar | **Yes** (abstract). Runtime still refused. | `arxiv-2604-20855` |
| LLM-in-Sandbox | **Yes** (abstract) | `arxiv-2601-16206` |
| Idea vs grounded research agent | **Yes** | `arxiv-2605-18661` |
| Living Papers / SWE-agent / Gorilla / HM-RAG / GraphRAG / KnowRAG | **Yes** | catalog ids in frontmatter |
| Tang & Yang 2026 | **Not in DB** | — |
| Hitzig | **Not in DB** | — |
| WikiZZ / 5W1H compiler | **Not in DB** | — |
| ClawVM | **Not in DB** | — |
| ToxicSkills | **Not in DB** | — |
| SemaClaw / ChainGuard / ABAC papers | **Not in DB** | — |
| Paper Lantern (product / MCP) | **Not in DB** | — |
| HLLM / MGM 68.3→78.3 | **Not in DB** — treat as **their claim** | — |
| Karpathy LLM Wiki / LLM Wiki v2 source | **Not in DB** (gists, not OA PDFs) | — |

[Generate](/site/agents-generate) notes the Caesar extract and still refuses the crawl.

## Block map

### Vision / local-elaboration / HITL / Owner of Judgment

| This wiki | Workbench |
| --- | --- |
| The website **is** the project. A student loop elaborates locally: park → retrieve → write MD. Owner of Judgment is the human who parks and the tests we run — not an LLM score [@swe-agent-2024] [@paper-plain-august-2023]. | Local-elaboration bias. HITL. A human owns the last call. |
| **Agree** on HITL. **Different object:** we elaborate a Living Papers wiki, not a compiled coworker wiki they control. Hitzig is **not in DB**; we do not cite a Hitzig argument. |

### Single-agent by default

| This wiki | Workbench |
| --- | --- |
| One parked turn is one agent. Hats are isolated skills in this repo. Hierarchy only if one mash bottlenecks. Imported crews stay off. | 1–3 agents. Default one. |
| **Agree.** Do not stand up a three-process crew for a park. |

### Retrieve ≠ generate

| This wiki | Workbench |
| --- | --- |
| Implemented. Fetch vs generate vs coding are three walls. “Do the research” **must clarify** before acting [@arxiv-2605-18661]. Generate seeds an **in-DB** `paperId` (`POST /api/generate/seed`). | Same wall: retrieve is not draft. |
| **Implemented here.** Their wording matches our hats more than a new runtime would. |

### Paper Lantern / IntrAgent

| This wiki | Workbench |
| --- | --- |
| Paper Lantern is a **wiki verb**: search / meta / write grounded MD. Plus cite-or-fetch and `GET /api/graph/neighborhood`, then open the real page or paper [@gorilla-2023] [@graphrag-2024]. IntrAgent **shape** (rank sections, read, stop) is operator copy — **not** the IntraBench agent. | Paper Lantern as MCP / IntrAgent as the retrieve agent. |
| **Not implemented:** Lantern MCP, second corpus, IntrAgent runtime. IntraView abstract is in DB; we still do not hire the agent [@arxiv-2604-22861]. |

### Metabolic memory / Ebbinghaus

| This wiki | Workbench |
| --- | --- |
| Half-life decay **only** on `GET /api/memory` user/project lanes. `touch`, `supersedes`, forget-lane `AUDIT`. Papers and `data/md` **do not decay**. Park intent is protected (the board is the spec). | Metabolic / Ebbinghaus fade, often on **claims inside the wiki**. Tablet intent they also call immutable. |
| **Partial agree, lock conflict on articles.** Scratch decay is already Metabolism-shaped at small scale [@arxiv-2604-12034] [@arxiv-2305-10250]. **Claim-score decay on papers or `/site/*` would hide the pages the next park extends.** FadeMem in this DB is chat-memory fade, not wiki-article fade [@arxiv-2601-18642]. Their “immutable tablet intent” **aligns** with park; their “wiki-claim decay” **does not**. |

### Disposable Docker / ToxicSkills

| This wiki | Workbench |
| --- | --- |
| A4 = lazy **hand-authored** `SKILL.md` in this repo. No community / GitHub skills. No Docker sandbox mandate. Coding edits the real tree and tests contracts. | Disposable Docker. ToxicSkills / untrusted community packs. LLM-in-Sandbox as environment. |
| **will-implement as fork/lab, not Docker.** Temporary child: [sandbox as fork / lab](/site/workbench-sandbox). Headline is GitHub-style separate work + human merge. LLM-in-Sandbox is in DB as an abstract; it licenses *sandbox as environment*, not Docker Desktop on this pad host [@arxiv-2601-16206]. ToxicSkills is **not in DB**. A4 still holds. |

### External verification / no self-grade

| This wiki | Workbench |
| --- | --- |
| Cite-or-fetch + `npx tsx --test` + human. No LLM-as-judge. MGM is `GET /api/tripwires` (`implemented: false`, `armed: false`). | No same-model self-review. External verify. MGM as evolution / bouncer. |
| **Agree on no self-grade.** **MGM is an on-demand bouncer** — status **will-implement**, not “production.” Temporary child: [MGM](/site/workbench-mgm). User starts the hire; if stuck, ask the operator. Score lifts are **their claim** — **not in DB**. KnowRAG’s coverage-gap result is already our fetch rule, not a judge loop [@knowrag-2026]. |

### LLM Wiki + WikiZZ 5W1H + Discovery + claim confidence decay

| This wiki | Workbench |
| --- | --- |
| Collaborative MD + meta bus. Heading-aware chunks. `supersedes` on **memory**, not articles. Focused edit of the current intent. No compiler. See temporary [Wiki memory](/site/wiki-memory). | Compiled LLM Wiki, WikiZZ 5W1H, Discovery Phase, confidence decay on claims. |
| **WikiZZ / 5W1H / Karpathy gist: not in DB.** We already have the Living Papers layer they would compile into [@living-papers-heer-2023]. A second compiler plus claim decay is a **lock conflict** with “MD is source and does not rot.” |

### TraceCoder / HLLM / MGM

| This wiki | Workbench |
| --- | --- |
| Coding PED is **A3 turn-control**: one change-set, re-fetch tools, no LLM history rewriter. Implement against wiki/fetch already on the page. MGM flag only. | TraceCoder traces + Historical Lesson Learning; HLLM / MGM score lifts. |
| TraceCoder **is in DB** (abstract: traces, causal analysis, rollback; reports up to 34.43% relative Pass@1) [@arxiv-2602-06875]. We did **not** instrument a TraceCoder crew. HLLM / MGM numbers **not in DB**. Experience-following warns that replaying traces copies errors — another reason not to make TraceCoder the source of truth [@arxiv-2505-16067]. |

### IntrAgent + Caesar (MCTS / GFlowNet web graph)

| This wiki | Workbench |
| --- | --- |
| OA fetch mash, yes-moral, allowlisted hosts. Neighborhood on **our** meta graph. **Caesar crawl refused** (SSRF + cite-or-fetch). | IntrAgent on literature + Caesar deep web graph (policy + adversarial synthesis). |
| Caesar **is in DB** (abstract: web traversal → dynamic KG; they report 13–23% creative-synthesis lift) [@arxiv-2604-20855]. **We still refuse the crawl.** Expensive, open-web, fights “no sight, no claim” on un-ingested pages. IntrAgent abstract is the sufficiency neighbor, not a hire [@arxiv-2604-22861]. |

### SemaClaw / ChainGuard / ABAC

| This wiki | Workbench |
| --- | --- |
| SemaClaw **moral only**: lazy-load the matching hand-authored skill. ACI is `GET /api/tools` + CONTROL [@swe-agent-2024] [@webarena-2024]. | SemaClaw + ChainGuard + ABAC on tool rights. |
| SemaClaw / ChainGuard / ABAC papers are **not in DB**. We keep the lazy-load moral. No capability language runtime. |

### ClawVM / FadeMem knapsack paging

| This wiki | Workbench |
| --- | --- |
| **Not implemented.** Context is the live wiki + labeled retrieve hits. | ClawVM / knapsack paging of memory pages (FadeMem-adjacent). |
| FadeMem **in DB** is dual-layer chat fade, not a VM pager [@arxiv-2601-18642]. **ClawVM is not in DB.** **Explore-only** child: [ClawVM](/site/workbench-clawvm) (Oblivion also **not in DB**). Interesting as research; expensive; **fights “MD is source”** if the pager becomes a second store agents read instead of `/site/*`. Do **not** implement. |

### Tablet layer

| This wiki | Workbench |
| --- | --- |
| **Already primary intent.** Pad `/` on :5174. Park writes `inbox/`. Tied boards (clean / stamped). Drawing-loop skill. | Tablet as the intent surface; immutable vs decaying wiki. |
| **Agree, already shipped.** Their tablet story is our park. Do not add a second intent bus. |

## Execution-trace compare

Their spec’s five-step coworker loop, mapped onto what a park actually does here.

| Step | Workbench spec (them) | This wiki (us) |
| --- | --- | --- |
| 1 | Tablet intent (immutable) | Park: `inbox/PENDING` + `message.md` + `latest.png` + `meta.json`. Autosave ≠ write. |
| 2 | Retrieve agent (Lantern / IntrAgent / web graph) | **Clarify hat** if “do the research.” Fetch: isolated grounds + labeled `graph` neighborhood. No cross-ground RRF [@hm-rag-2025]. |
| 3 | Generate or code in a sandbox | Generate only from in-DB seed. Coding implements the page already retrieved. No Docker mandate. |
| 4 | External verify (not self-grade) | Cite-or-fetch envelope + tests + human. No LLM judge. MGM not in the mash. |
| 5 | Write / decay the compiled wiki | Write `data/md` + same-id meta. Nest via `parent:`. **No article decay.** Delete `PENDING`. |

We do not add their missing steps (Discovery Phase compiler, claim-score cron, Caesar policy, MGM evolution).

## What’s different (short)

1. **Same HITL, different wiki.** They compile a coworker wiki with claim decay. We grow Living Papers MD that humans already read; only scratch memory decays.
2. **Same retrieve ≠ generate.** We shipped it as skills + clarify, not as 1–3 OS processes.
3. **Lantern is a verb, not an MCP.** Graph is meta links, not GraphRAG communities and not a Caesar web KG [@graphrag-2024].
4. **Citation-cocoon vs cite-or-fetch.** A compiled wiki that only re-ingests itself becomes a cocoon. Our rule is the opposite: missing named work → say **not in DB** → `POST /api/papers/fetch` (OA). That is cheaper than a Discovery Phase that rewrites every entity page.
5. **Tablet is not a proposal.** It is the pad.

## What’s implemented here

- Park loop, CONTROL ACI, `GET /api/tools` [@gorilla-2023]
- Isolated hats + generate-vs-fetch clarify [@arxiv-2605-18661]
- Hybrid RAG, isolated grounds, heading-aware chunks [@hm-rag-2025]
- Cite-or-fetch + cheap `unsupported` overlap [@knowrag-2026]
- Wiki nest (`parent:`) + Overview live tree + sidebar
- Meta bus + wiki knowledge graph (no invented edges)
- Paper DB (permanent) vs `/api/memory` (decays)
- SemaClaw-style lazy **hand-authored** skills
- MGM **flag** only
- iPad as primary intent (tied boards)

## What’s not implemented

- Paper Lantern MCP / second corpus
- IntrAgent / IntraBench runtime
- Caesar crawl / MCTS / GFlowNet web graph
- MGM evolution / HLLM / scaffold self-rewrite
- WikiZZ 5W1H compiler / Discovery Phase / claim-score decay on articles
- Community / GitHub / ToxicSkills packs
- Docker disposable sandboxes as the coding environment
- ClawVM / knapsack paging
- ChainGuard / ABAC
- Same-model self-review
- Imported coding-scheme / co-scientist crews

## Interesting but costly — skip for now

| Idea | Why it looks good | Why not now |
| --- | --- | --- |
| Claim-score decay on wiki (WikiZZ / v2) | Stale bugs fade | **Lock conflict.** Articles are the shared source. Decay belongs on `/api/memory`. Tokens + hide-the-page risk. WikiZZ **not in DB**. |
| Caesar web graph | Serendipity they report in the abstract [@arxiv-2604-20855] | SSRF, unbounded tokens, cite-or-fetch violation on un-ingested HTML. **Refused.** |
| MGM / HLLM evolution | Their score story | Numbers **not in DB**. Same-model rewrite can drop cites. Flag only. |
| TraceCoder crew | Traces beat binary pass/fail [@arxiv-2602-06875] | Multi-agent debug loop vs A3 diet. Wiki + tests are cheaper. Trace replay can ossify errors [@arxiv-2505-16067]. |
| Docker / LLM-in-Sandbox | Isolation [@arxiv-2601-16206] | Ops cost on this host. Coding already edits the real repo. |
| ToxicSkills / community packs | Fast skill market | A4 lock. ToxicSkills **not in DB**. |
| ClawVM paging | Context knapsack | **Not in DB.** Second store vs MD-as-source. FadeMem is the wrong paper for a VM. |
| Lantern MCP + IntrAgent | Fancy retrieve ACI | We already have tools + neighborhood. MCP sidecar is a second corpus. |
| Citation-cocoon compiler | Compounding wiki | Fights cite-or-fetch. We grow focused pages instead of rewriting the whole wiki. |

## What we would tell that co-author

You and we agree on the cheap parts: **one agent by default**, **retrieve ≠ generate**, **no self-grade**, **tablet intent is sacred**, **lazy skills not a skill zoo**.

The expensive parts of your spec (Docker, Caesar, MGM evolution, claim decay, ClawVM, 5W1H compiler) either **break locks we already wrote into CONTROL** or **cost more than a student loop gets back**. Explain our system as: park is the human stroke; hats are isolated; MD + meta is the wiki; papers never forget; fetch says **not in DB** instead of spinning a web graph.

If you want to keep talking, talk on this page — do not silently rewrite CONTROL into the Workbench.

## See also

- [Isolated agents](/site/agents) · [Fetch](/site/agents-fetch) · [Coding](/site/agents-coding) · [Generate](/site/agents-generate)
- [Wiki knowledge graph](/site/knowledge-graph) · [Wiki memory (temp)](/site/wiki-memory) · [Memory](/site/memory)
- [Gaps](/site/gaps) · [CONTROL](/site/control)
