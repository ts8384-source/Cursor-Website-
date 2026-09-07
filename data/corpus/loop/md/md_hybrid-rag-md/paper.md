# hybrid-rag.md

---
title: Hybrid RAG and seeding
slug: hybrid-rag
id: page:hybrid-rag
type: page
nav: Hybrid RAG
order: 3
gist: Co-Assistant retrieve copied into rag/ — isolated grounds, in-ground RRF, no toy JSON store.
summaryShort: Isolated grounds, in-ground RRF
summaryLong: Hybrid RAG runs five isolated libraries. Dense, BM25, and HyDE fuse with RRF only inside a ground. Metadata title and tags are a cheap boost; they are not a second vector store.
tags:
  - rag
  - retrieve
  - grounds
related:
  - page:diagrams
  - page:papers
  - node:hybrid-rag-loop:hybrid
  - colpali-2024
  - living-papers-heer-2023
  - page:code-meta
  - page:knowledge-graph
updated: 2026-09-05
questions:
  - How does a query actually run?
  - What is a ground, and why no cross-ground RRF?
  - When do I seed versus rebuild?
glossary:
  - term: HyDE
    def: Hypothetical document embeddings — a per-ground template abstract used at query time.
  - term: RRF
    def: Reciprocal Rank Fusion. Here it only mixes lists that belong to the same ground.
  - term: BM25
    def: Sparse lexical ranker (Okapi). Uses the shared hyphen-aware tokenizer.
citations:
  - hm-rag-2025
  - heta-rag-2025
  - ma-rag-2025
  - graphrag-2024
  - vidorag-2025
  - colpali-2024
  - living-papers-heer-2023
---

# Hybrid RAG and seeding

Retrieve is not a demo keyword search. `rag/` is a copy of the Co-Assistant hybrid stack: chunk, embed, BM25, HyDE, extra lexical lists, **in-ground** RRF, labeled merge. The site **reads** `GET /api/search` and `POST /api/ask`. It does not keep a second vector database.

## Isolated grounds

| Ground | What lands there | Drop / write path |
| --- | --- | --- |
| `papers` | OA shortlist + HHS/GSA handbook chapters | `data/papers`, `refs/ui-rag` |
| `code` | Retrieve scripts and optional `data/code` | `data/code`, seeded repo files |
| `scribble` | Parked canvas text | `inbox/message.md` via ask/park |
| `cursor` | Loop notes | `data/cursor` |
| `md` | Site articles and CONTROL | `data/md`, `content/` |

Hits are labeled with `ground`. Ask treats each list as a different library. Heterogeneous-store papers (HM-RAG, HetaRAG) motivate **multiple stores**; they do not license fusing ranks across libraries [@hm-rag-2025] [@heta-rag-2025].

## Query path

1. Chunk text heading-aware on MD/papers (fences and `@chunk` stay intact). Unmarked blobs use 1200 / 150 with a `[title | ground]` prefix.
2. Dense: Chroma + `BAAI/bge-small-en-v1.5`.
3. Sparse: BM25Okapi, hyphen tokenizer (`e-prop` stays one token).
4. Query-time HyDE per ground (template abstract; no required LLM).
5. Lexical query is **goal + short bias**. Seeder bags are **extra RRF lists**, not one stuffed BM25 string.
6. RRF inside that ground only.
7. Local rerank is a stub (no cross-encoder after RRF).

MA-RAG’s planner/extractor chain is a literature neighbor, not this runtime [@ma-rag-2025]. Agents here call `GET /api/search?q=` and read `per_ground`.

## Seed versus rebuild

- **seed** (`python -m rag.cli seed` or `POST /api/scripts` `{ "name": "seed" }`) copies drop folders into `data/corpus/loop/<ground>/`. Handbook Markdown is ingested into **papers**. `data/md` and `content/` go into **md**. Allowlisted `@chunk` comments become **code** corpus docs plus `data/meta/code.json` (same `GET /api/meta` records; see `/site/code-meta`).
- **rebuild** rebuilds Chroma + BM25 for every ground. After new papers, you must seed **and** rebuild or search will miss them.
- **ask** ingests the latest scribble, retrieves, writes `data/md/architecture.md` (latest ask article, not the scholarly TOC).

Index size on this machine is on the order of ~1895 chunks. Do not replace it with an in-memory toy.

## What this pass does not build

GraphRAG-style community summaries are not computed [@graphrag-2024]. ViDoRAG / ColPali diagram-as-page retrieve is **cited**, not indexed — no new VLM this pass [@vidorag-2025]. If a figure-heavy question fails lexical+dense text, that is an expected gap (see [Gaps](/site/gaps)).
