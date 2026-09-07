# gaps.md

---
title: Gaps the literature does not settle
slug: gaps
nav: Gaps
order: 6
gist: The shortlist licenses chrome and tools. It does not pick a full GraphRAG, a VLM index, or a WebArena gym for this repo.
questions:
  - What did we refuse to invent?
  - Which catalog items are cited but not built?
  - What would be a next cheap experiment?
glossary:
  - term: ColPali
    def: Page-as-image retrieval (ICLR 2025). Relevant to diagrams; not indexed here yet.
  - term: CiteSee
    def: Citation-context reading UI (CHI 2023). Paywalled; not ingested.
citations:
  - graphrag-2024
  - vidorag-2025
  - scrollyvis-2023
  - living-papers-heer-2023
  - webarena-2024
  - paper-plain-august-2023
---

# Gaps the literature does not settle

The OA shortlist is a **constraint set**, not a complete architecture. These items were left open on purpose.

## Not built this pass

- **Full GraphRAG communities.** We ship `GET /api/graph` as a view over meta links ([Knowledge graph](/site/knowledge-graph)). We do not compute community summaries [@graphrag-2024].
- **ColPali / ViDoRAG index.** Diagram-native retrieve is cited. No new VLM corpus unless a later pass is cheap [@vidorag-2025].
- **Living Papers runtime.** We compile MD → HTML + `/api/pages`. We do not ship Fidyll/Living Papers custom elements or PDF export [@living-papers-heer-2023].
- **Site-as-scroll.** One guided section on Overview. Whole-site scrollytelling is an authoring choice ScrollyVis studies; it is a poor default for an ACI [@scrollyvis-2023].
- **WebArena gym.** We did not wrap this host as an agent eval. We did add a tool catalog so agents are not forced into raw HTML [@webarena-2024].
- **CiteSee.** No reliable author PDF; citation cards are Semantic Reader / Paper Plain grade, not CiteSee’s citation-context model.
- **Co-Assistant crew.** Isolated grounds stay. The hierarchical research crew is not rebuilt.
- **Full AWM induction.** `/site/memory` is half-life decay plus CONTROL workflows, not Mind2Web/WebArena workflow mining.
- **Karpathy wiki compiler.** [Wiki memory (temp)](/site/wiki-memory) compares the April 2026 cluster. We did not add a `wiki/` compile step or a two-process crew. Gists and the llm-wiki-memory-template wiki are still **not in the paper DB** (not OA PDFs).
- **Imported later hats.** [Agents](/site/agents) are thin isolated skills. Paper Lantern MCP / IntrAgent / Caesar / MGM evolution stay unbuilt. The flagged-schemes dump is retired. Temporary Workbench children discuss sandbox / MGM; [ClawVM](/site/workbench-clawvm) is explore-only.
- **ColPali still missing as a local PDF** in `data/papers/` (catalog names it; DB lists it under `missingFromDisk`).

## Tensions the papers disagree on

- **Fusion.** Heterogeneous RAG papers add stores. This repo keeps **no cross-ground RRF**. That is a local rule, not a result from one paper.
- **How much NLP chrome.** Paper Plain’s gists help medical consumers [@paper-plain-august-2023]. Over-glossing a systems paper can hide the actual retrieve contract. Gists stay short and sourced from frontmatter, not a hallucinated model.
- **MD versus AST.** Living Papers wants a richer compiler. A student loop can start with Git-friendly MD and a list API. We chose the smaller compiler.

## Cheap next experiments

1. Drop a ColPali-style page image only for `data/diagrams/latest.json` if a local embedder is already installed.
2. Add CiteSee if an OA PDF appears.
3. Measure whether agents using `/api/tools` beat DOM-only agents on a three-step “add paper, search, cite” task — a tiny WebArena, not a product.
