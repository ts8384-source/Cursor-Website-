# architecture.md

# Hybrid RAG local-site loop

_Ask:_ hybrid RAG ask diagram md vector DB local website

_Retrieved 2026-09-06 22:18 UTC. Isolated grounds, labeled merge only._

## Architecture (from the iPad)

Papers + Code (Fetch) + Scribbling + Cursor → **Hybrid RAG** → **ask** → **Diagram** → **md** ↔ vector DB.
Save and Book keep write back into the index. The local site is Wikipedia-like + a 3b1b visual.

## Retrieved by source

### papers

- **[papers:hm-rag-2025-md#13]** hm-rag-2025.md (0.0941) — [hm-rag-2025.md | papers] ector-space embeddings and topological re- lationships to model complex document structures, enabling the retrieval of semantically coherent contexts that go beyond simple text fragments [12, 42, 53]. Graph-based R
- **[papers:graphrag-2024-md#9]** graphrag-2024.md (0.0940) — [graphrag-2024.md | papers] Background 2.1 RAG Approaches and Systems RAG generally refers to any system where a user query is used to retrieve relevant information from external data sources, whereupon this information is incorporated into
- **[papers:db-json#12]** db.json (0.0871) — [db.json | papers] /hybrid.ts", "how": "Labeled merge only" } ], "permanent": true }, { "id": "hm-rag-2025", "title": "HM-RAG: Hierarchical Multi-Agent Multimodal Retrieval Augmented Generation", "list": "backend", "authors": "Pei Liu, Xin 
- **[papers:heta-rag-2025-md#2]** heta-rag-2025.md (0.0850) — [heta-rag-2025.md | papers] ## Extracted text (local RAG ingest) HetaRAG: Hybrid Deep Retrieval-Augmented Generation across Heterogeneous Data Stores Guohang Yan, Yue Zhang, Pinlong Cai∗, Ding Wang, Song Mao, Hongwei Zhang Yaoze Zhang, Hair
- **[papers:heta-rag-2025-md#24]** heta-rag-2025.md (0.0748) — [heta-rag-2025.md | papers] ph aggregation approach to abstract fine-grained entities and relations into a semantically rich, navigable network. These graphs are subsequently used for down- stream graph-based retrieval and reasoning tasks. 

### code

- **[code:rag-cli-py#0]** rag/cli.py (0.1399) — [rag/cli.py | code] # rag/cli.py from __future__ import annotations import argparse import json import sys from rag import DOMAIN, GROUNDS from rag.ask import latest_site, run_ask from rag.ingest import ingest_all_local from rag.retrieve im
- **[code:server-vector-store-ts#1]** server/vector-store.ts (0.1259) — [server/vector-store.ts | code] nd: payload.per_ground ?? {} } } export async function runAsk(query = '') { const args = ['ask'] if (query.trim()) args.push('--query', query) return runRag(args, 240_000) } export function siteFallback() { c
- **[code:rag-cli#0]** RAG CLI and hybrid index (0.1121) — [RAG CLI and hybrid index | code] # RAG CLI and hybrid index Live retrieve path: rag/retrieve.py HybridIndex. Node wraps it via server/vector-store.ts → python -m rag.cli. Scripts: rebuild, seed, refresh-site. Tokenizer keeps hyphen tokens 
- **[code:rag-retrieve-py#0]** rag/retrieve.py (0.1114) — [rag/retrieve.py | code] # rag/retrieve.py from __future__ import annotations import json import os from pathlib import Path from typing import Any from rag.chunking import Chunk, chunk_text from rag.paths import CORPUS, INDEX, ensure_dirs 
- **[code:rag-cli-py#1]** rag/cli.py (0.1041) — [rag/cli.py | code] _local(DOMAIN), indent=2)) return 0 if args.cmd == "rebuild": print(json.dumps(rebuild_all_grounds(DOMAIN, GROUNDS), indent=2)) return 0 if args.cmd == "search": print(json.dumps(lookup_idea(args.query, domain=DOMAIN, gr

### scribble

- **[scribble:ipad-architecture#0]** iPad architecture sketch (0.2212) — [iPad architecture sketch | scribble] # iPad architecture sketch Parked iPad diagram: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor feed Hybrid RAG. Output goes to ask, then Diagram, then md. md talks to Fetch and the vector D
- **[scribble:latest-park#0]** Latest parked canvas (0.1763) — [Latest parked canvas | scribble] # Latest parked canvas hybrid RAG ask diagram md vector DB local website PNG parked: True (1650946 bytes)
- **[scribble:ipad-architecture#1]** iPad architecture sketch (0.1581) — [iPad architecture sketch | scribble] # Hybrid RAG local-site loop This page is the playable outline of the architecture drawn on the iPad canvas. Park a drawing (or POST `/api/ask`) to refresh the article from Hybrid RAG.
- **[scribble:ipad-architecture#9]** iPad architecture sketch (0.1548) — [iPad architecture sketch | scribble] ## Ask → Diagram → md ↔ vector DB Park or `/api/ask` runs: - ingest the latest scribble - retrieve each ground - write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual)
- **[scribble:ipad-architecture#10]** iPad architecture sketch (0.1341) — [iPad architecture sketch | scribble] ## Local website `/site` is a Living Papers–style Markdown reader (left TOC, article, Paper Plain rail). Search talks to the hybrid index. Canvas HUD **Site** opens it. `/` stays the scratch pad.

### cursor

- **[cursor:confirmed-loop#0]** Confirmed loop from Cursor (0.0328) — [Confirmed loop from Cursor | cursor] # Confirmed loop from Cursor Confirmed architecture (Cursor + iPad): Inputs: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor → Hybrid RAG → output → ask → Diagram → md ↔ Fetch vector DB Also

### md

- **[md:architecture-md#2]** architecture.md (0.1709) — [architecture.md | md] ## Architecture (from the iPad) Papers + Code (Fetch) + Scribbling + Cursor → **Hybrid RAG** → **ask** → **Diagram** → **md** ↔ vector DB. Save and Book keep write back into the index. The local site is Wikipedia-like
- **[md:architecture-loop#10]** Hybrid RAG local-site loop (0.1371) — [Hybrid RAG local-site loop | md] ## Local website `/site` is a Living Papers–style Markdown reader (left TOC, article, Paper Plain rail). Search talks to the hybrid index. Canvas HUD **Site** opens it. `/` stays the scratch pad.
- **[md:hybrid-rag-md#1]** hybrid-rag.md (0.1303) — [hybrid-rag.md | md] # Hybrid RAG and seeding Retrieve is not a demo keyword search. `rag/` is a copy of the Co-Assistant hybrid stack: chunk, embed, BM25, HyDE, extra lexical lists, **in-ground** RRF, labeled merge. The site **reads** `GET
- **[md:architecture-loop#9]** Hybrid RAG local-site loop (0.1210) — [Hybrid RAG local-site loop | md] ## Ask → Diagram → md ↔ vector DB Park or `/api/ask` runs: - ingest the latest scribble - retrieve each ground - write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual) - b
- **[md:architecture-md#20]** architecture.md (0.1166) — [architecture.md | md] ## Ask → Diagram → md ↔ vector DB Park or `/api/ask` runs: - ingest the latest scribble - retrieve each ground - write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual) - bookkeep the

## Citations

- `papers:hm-rag-2025-md#13 (papers)`
- `papers:graphrag-2024-md#9 (papers)`
- `papers:db-json#12 (papers)`
- `papers:heta-rag-2025-md#2 (papers)`
- `papers:heta-rag-2025-md#24 (papers)`
- `code:rag-cli-py#0 (code)`
- `code:server-vector-store-ts#1 (code)`
- `code:rag-cli#0 (code)`
- `code:rag-retrieve-py#0 (code)`
- `code:rag-cli-py#1 (code)`
- `scribble:ipad-architecture#0 (scribble)`
- `scribble:latest-park#0 (scribble)`
- `scribble:ipad-architecture#1 (scribble)`
- `scribble:ipad-architecture#9 (scribble)`
- `scribble:ipad-architecture#10 (scribble)`
- `cursor:confirmed-loop#0 (cursor)`
- `md:architecture-md#2 (md)`
- `md:architecture-loop#10 (md)`
- `md:hybrid-rag-md#1 (md)`
- `md:architecture-loop#9 (md)`
- `md:architecture-md#20 (md)`

## How the loop is wired



Four inputs feed retrieve. Each is its own isolated index (a “ground”). Hits are
labeled and merged after search — they are never fused with RRF across sources.

| Input | Ground | How it lands |
| --- | --- | --- |
| Papers | `papers` | Drop files in `data/papers`, or the HHS/GSA handbook seed in `refs/ui-rag` |
| Code | `code` | Drop files in `data/code`, plus a few repo retrieve scripts |
| Scribbling | `scribble` | iPad park writes `inbox/message.md` + `inbox/latest.png` |
| Cursor | `cursor` | Notes from this loop and optional `data/cursor` drops |

Optional URL fetch exists on `/api/fetch` (size-capped, no localhost). Prefer drop folders so the loop works offline.

## Hybrid RAG

Copied from Cursor Co-Assistant’s retrieve stack, not a token-overlap toy:

1. Chunk text at 1200/150 with a `[title | ground]` prefix.
2. Dense search: Chroma + `BAAI/bge-small-en-v1.5`.
3. Sparse search: BM25Okapi with the shared hyphen tokenizer (`e-prop` stays one token).
4. Query-time HyDE per ground (template abstract; LLM optional later).
5. Lexical query is **goal + short bias** only. Seeder bags / Query2doc phrases are **extra RRF lists**, not one stuffed BM25 string.
6. Reciprocal Rank Fusion inside that ground.
7. Local rerank is a stub (Co-Assistant does not run a cross-encoder after RRF).

Rebuild: `python -m rag.cli rebuild` (after `pip install -r requirements-rag.txt`).

## Ask → Diagram → md ↔ vector DB

Park or `/api/ask` runs:

- ingest the latest scribble
- retrieve each ground
- write `data/md/` (this article)
- write `data/diagrams/latest.json` (the 3b1b-ish visual)
- bookkeep the event
- index the new md + scribble so the next search can find them

**Save** and **Book keep** are the same write-back: artifacts re-enter the isolated indexes.

## Local website

`/site` is a Living Papers–style Markdown reader (left TOC, article, Paper Plain
rail). Search talks to the hybrid index. Canvas HUD **Site** opens it. `/` stays
the scratch pad.

## Agents (thin, work-ish)

- **Coding agent** — allowlisted scripts: rebuild index, refresh site, seed.
- **Web coding agent** — same scripts via `/api/scripts`, not arbitrary remote code.

## Try it

1. `pip install -r requirements-rag.txt`
2. `python -m rag.cli seed` then `python -m rag.cli rebuild`
3. `npm run dev` on port **5174**
4. Draw on the canvas, **Park for agent**, then open **Local site**
