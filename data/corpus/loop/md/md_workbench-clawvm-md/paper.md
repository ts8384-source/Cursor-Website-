# workbench-clawvm.md

---
title: "Exploration only — ClawVM (not shipping)"
slug: workbench-clawvm
id: page:workbench-clawvm
type: page
nav: ClawVM (explore)
order: 24
parent: page:workbench
gist: EXPLORATION ONLY. Not an implement-now decision. ClawVM is interesting and not fully obvious — typed pages under a token budget. Oblivion and FadeMem are adjacent memory/forgetting papers. Do not build this.
summaryShort: Explore only — do not implement
summaryLong: Temporary explore-only child of Architect’s Workbench. Plain-language ClawVM (harness-managed virtual memory for agent state). Multi-tenant state space as isolated tenants/pages versus this repo’s isolated retrieve grounds plus one wiki. Oblivion (arXiv 2604.00131) looked up independently — not in the paper DB. FadeMem is in DB and is the wrong paper for a VM. Not a shipping feature.
tags:
  - temporary
  - exploration-only
  - clawvm
  - memory
  - wiki
related:
  - page:workbench
  - page:wiki-memory
  - page:memory
  - page:hybrid-rag
  - page:knowledge-graph
  - page:workbench-runtimes
  - diagram:workbench-ia
  - arxiv-2601-18642
  - arxiv-2604-12034
updated: 2026-09-06
questions:
  - What is ClawVM in plain language?
  - Is Oblivion in our paper DB?
  - What did they mean by multi-tenant state space?
  - Why would a pager fight MD-as-source?
glossary:
  - term: exploration-only
    def: Read and compare. Do not implement from this page. Not a roadmap item this pass.
  - term: ClawVM
    def: Paper idea — the agent harness treats the context window like RAM and durable notes like disk, with typed pages that can shrink but not silently vanish. Not in this paper DB at write time. Not implemented here.
  - term: typed page
    def: ClawVM unit of state with an id, scope, provenance, and a minimum-fidelity floor (full → compressed → structured → pointer).
  - term: multi-tenant state space
    def: Coworker phrasing. Isolated tenants or memory pages that must not leak into each other, versus our isolated retrieve grounds plus one shared wiki.
  - term: Oblivion
    def: Independent lookup — Rana et al., arXiv 2604.00131, decay-driven activation of agent memory (not hard delete). Not in this paper DB at write time.
citations:
  - arxiv-2601-18642
  - arxiv-2604-12034
  - arxiv-2305-10250
  - living-papers-heer-2023
  - hm-rag-2025
---

# Exploration only — ClawVM (not shipping)

**EXPLORATION ONLY. NOT A SHIPPING FEATURE. NOT AN IMPLEMENT-NOW DECISION.**

the operator finds this interesting and does not fully get it. This page explains it in plain language so the idea is not lost. **Do not implement ClawVM, Oblivion, or a second memory VM** from this article. Parent: [Architect’s Workbench](/site/workbench).

Chrome on this slug uses the **exploration** banner (`tags: exploration-only`), stronger than the ordinary temporary strip.

## Plain language — what problem they think they have

Long-running tool agents treat the **context window as working memory**. Harnesses already prune, summarize (“compaction”), and flush notes to disk. Those steps are **best-effort**. Field reports (in their paper, not our DB) sound like: after a summary, the agent forgets the current step of a plan; on reset it never wrote the dirty notes; a flush **overwrites** instead of merging.

Operating systems solved “fast scarce RAM + slow disk” with **virtual memory**. ClawVM says: put that contract on the **harness** (the thing that builds the prompt and sees compact / reset), not on the weights.

Cite-or-fetch: **ClawVM is not in `GET /api/papers` / `db` at write time.** The public OA target is arXiv **2604.10352** (Rafique & Bindschaedler, EuroMLSys 2026 workshop framing; GitHub `mpi-dsg/clawvm`). Until it is ingested, treat details below as **independent lookup**, not a catalog extract. Offer `POST /api/papers/fetch` `{ "arxiv": "2604.10352" }`. Do not invent extra numbers.

## The metaphor (without the systems jargon pile-up)

Imagine each important fact is a **card**:

- **Full** — the whole quote or tool dump.
- **Compressed** — a shorter paraphrase already computed.
- **Structured** — just the fields you promised to keep (the constraint, the id).
- **Pointer** — “this lives in file X; I can fetch it.”

A **token budget** is the table size. Under pressure, cards **shrink along that chain**. They are not allowed to fall through the floor: a constraint card must stay at least structured; a pointer must still resolve. Before compact or reset, dirty cards go through **staged writeback** (stage → validate → commit) so you do not smash the durable file with a bad flush.

That is ClawVM: **typed pages + minimum fidelity + writeback + observable faults** (they name faults like refetch, duplicate-tool, flush-miss). The harness is the kernel. The model is not asked to remember to flush.

We already have a weaker, human version of “do not silently drop the spec”: **park is the spec**, autosave does not write the site, articles do not decay [@living-papers-heer-2023]. That is why a pager that became the **real** store agents read would fight this wiki.

## Multi-tenant state space (their fascinating phrase)

Coworker language: **multi-tenant state space** — isolated tenants / pages that do not leak.

Read it two ways. Neither is a build order.

### Their view (ClawVM / OpenClaw-adjacent)

ClawVM pages carry **scope** (session-private vs project-shared) and **provenance** (which tool call). That is a *single-agent* tenancy of **memory pages**. Separately, OpenClaw-style hosting docs talk about **cells** — one hardened container per tenant so untrusted users do not share one process. That second story is infrastructure isolation, not the VM paper. **Those hosting docs are not in our paper DB.**

A “fascinating” state space is: many page identities, many scopes, one token budget, faults when a page of tenant A would be needed and is gone. It is a **coworker OS view** of memory.

### Our view (this wiki)

We already isolate **retrieve grounds** (`papers`, `code`, `scribble`, `cursor`, `md`, labeled `meta` / `graph`). We never RRF across them [@hm-rag-2025]. We have **one** Living Papers wiki humans read. Scratch memory decays on `GET /api/memory`; articles and the paper DB do not.

| | Isolated tenants / pages (them) | Isolated grounds + one wiki (us) |
| --- | --- | --- |
| Unit | Typed memory page in a harness pager | Retrieve index, or an MD article |
| Leak fear | Tenant A’s session state in tenant B’s prompt | Cross-ground rank soup; or decaying the article the next park needs |
| Shared object | Token budget / page table | The website |
| Human | Often the harness user | iPad park + the same MD |

**Agree** that isolation is interesting. **Disagree** that we should add a second page table agents consult instead of `/site/*`.

## Oblivion — looked up independently; **not in DB**

Independent search (not in `GET /api/papers` at write time): **Oblivion: Self-Adaptive Agentic Memory Control through Decay-Driven Activation** — Rana, Hung, Sun, Kunkel, Lawrence; arXiv **2604.00131**; code `nec-research/oblivion`.

Plain language:

- Human memory fades in **accessibility**, not always as hard delete. You can still reactivate a faded trace.
- Oblivion splits **read** (when to consult memory — uncertainty, buffer enough?) from **write** (what to strengthen — only traces that helped the answer).
- Unused items **decay**; useful ones get reinforced. Hierarchy (summaries / semantic / episodic in their package notes) so strategy stays and details load on demand.
- Adjacent to **FadeMem** (dual-layer chat fade) and to **paging/eviction** talk, but Oblivion is a **control loop**, not a virtual-memory pager.

**FadeMem is in DB** (`arxiv-2601-18642`): biologically inspired differential decay on chat-like agent memory; storage reduction story. It is **not** ClawVM paging [@arxiv-2601-18642].

**Metabolism / Miteski is in DB** (`arxiv-2604-12034`): memory as metabolism — closer to our scratch-lane half-life than to a VM [@arxiv-2604-12034].

**MemoryBank** stub is in DB (`arxiv-2305-10250`).

| Name | In DB? | Role next to ClawVM |
| --- | --- | --- |
| ClawVM (2604.10352) | **Not in DB** | Pager / harness VM |
| Oblivion (2604.00131) | **Not in DB** | Decay-driven activation; adjacent forgetting |
| FadeMem | **Yes** | Chat fade; wrong paper for a VM |
| Miteski Metabolism | **Yes** | Scratch decay analog |
| MemoryBank | **Yes** (stub) | Early memory bank |

Do not fetch-invent. OA ids above can go through `POST /api/papers/fetch` on a later park if the operator wants them on disk.

## Why this stays explore-only

- **Lock:** MD + paper DB do not decay. A pager that hides articles is a lock conflict (same as claim-score decay on [wiki memory](/site/wiki-memory)).
- **Cost:** OpenClaw-shaped harness + page table + fault oracle is a second runtime. This site is the drawing-loop wiki.
- **Honesty:** ClawVM and Oblivion were **not in DB** when this page was written. Implementing from a web skim would violate cite-or-fetch.
- **the operator:** interesting, not fully owned. Exploration pages exist so the next park can point here instead of re-deriving the metaphor.

## See also

- [Wiki memory (temp)](/site/wiki-memory) · [Memory](/site/memory)
- [Paper runtimes](/site/workbench-runtimes) — implement-discussion without this pager
- [Hybrid RAG](/site/hybrid-rag)
