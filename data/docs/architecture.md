# Hybrid RAG local-site loop

_Ask:_ parked canvas architecture Diagrams Working Scribble Wiki writing length

_Retrieved 2026-09-07 00:55 UTC. Isolated grounds, labeled merge only._

## Architecture (from the iPad)

Papers + Code (Fetch) + Scribbling + Cursor → **Hybrid RAG** → **ask** → **Diagram** → **md** ↔ vector DB.
Save and Book keep write back into the index. The local site is Wikipedia-like + a 3b1b visual.

## Retrieved by source

### papers

- **[papers:db-json#12]** db.json (0.0628) — [db.json | papers] /hybrid.ts", "how": "Labeled merge only" } ], "permanent": true }, { "id": "hm-rag-2025", "title": "HM-RAG: Hierarchical Multi-Agent Multimodal Retrieval Augmented Generation", "list": "backend", "authors": "Pei Liu, Xin 
- **[papers:heta-rag-2025-md#3]** heta-rag-2025.md (0.0559) — [heta-rag-2025.md | papers] ration (RAG) systems are text-only and often rely on a single storage backend—typically a vector database. In practice, this monolithic design suffers from unavoidable trade-offs: vector search captures se- manti
- **[papers:heta-rag-2025-md#24]** heta-rag-2025.md (0.0540) — [heta-rag-2025.md | papers] ph aggregation approach to abstract fine-grained entities and relations into a semantically rich, navigable network. These graphs are subsequently used for down- stream graph-based retrieval and reasoning tasks. 
- **[papers:vidorag-2025-md#33]** vidorag-2025.md (0.0462) — [vidorag-2025.md | papers] end-to-end perfor- mance from various perspectives. 7.2 Time Efficiency How does dynamic retrieval balance latency and accuracy? In traditional RAG systems, using a small top-K value may result in missing critical
- **[papers:vidorag-2025-md#32]** vidorag-2025.md (0.0459) — [vidorag-2025.md | papers] relevant information within a shorter context while minimizing the impact of noise and reduc- ing computational cost without losing valuable in- formation. Dynamic retrieval can achieve better recall performance w

### code

- **[code:server-inbox-plugin-ts#4]** server/inbox-plugin.ts (0.0957) — [server/inbox-plugin.ts | code] nboxDir, 'latest.json') if (existsSync(existing)) { try { const prev = JSON.parse(readFileSync(existing, 'utf8')) as { snapshot?: unknown } if (countShapes(prev.snapshot) > 0) { json(res, 200, { ok: true, ski
- **[code:server-inbox-plugin-ts#5]** server/inbox-plugin.ts (0.0928) — [server/inbox-plugin.ts | code] : incomingShapes }) void runAsk('parked canvas architecture').then((ask) => { bookkeep('ask', { via: 'park', ok: ask.ok, error: ask.error ?? null }) }) } json(res, 200, { ok: true, ask: payload.parked ? 'star
- **[code:server-inbox-plugin-ts#6]** server/inbox-plugin.ts (0.0763) — [server/inbox-plugin.ts | code] const result = await runAsk(payload.query ?? '') json(res, result.ok ? 200 : 503, result) } catch (error) { json(res, 400, { ok: false, error: error instanceof Error ? error.message : 'bad ask' }) } return } 
- **[code:server-inbox-plugin-ts#0]** server/inbox-plugin.ts (0.0615) — [server/inbox-plugin.ts | code] # server/inbox-plugin.ts import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs' import { networkInterfaces } from 'node:os' import { dirname, join } from 'node:path' import 
- **[code:rag-cli-py#0]** rag/cli.py (0.0602) — [rag/cli.py | code] # rag/cli.py from __future__ import annotations import argparse import json import sys from rag import DOMAIN, GROUNDS from rag.ask import latest_site, run_ask from rag.ingest import ingest_all_local from rag.retrieve im

### scribble

- **[scribble:latest-park#0]** Latest parked canvas (0.1619) — [Latest parked canvas | scribble] # Latest parked canvas parked canvas architecture Diagrams Working Scribble Wiki writing length PNG parked: True (722289 bytes)
- **[scribble:ipad-architecture#0]** iPad architecture sketch (0.1254) — [iPad architecture sketch | scribble] # iPad architecture sketch Parked iPad diagram: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor feed Hybrid RAG. Output goes to ask, then Diagram, then md. md talks to Fetch and the vector D
- **[scribble:ipad-architecture#9]** iPad architecture sketch (0.1230) — [iPad architecture sketch | scribble] ## Ask → Diagram → md ↔ vector DB Park or `/api/ask` runs: - ingest the latest scribble - retrieve each ground - write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual)
- **[scribble:ipad-architecture#13]** iPad architecture sketch (0.1092) — [iPad architecture sketch | scribble] 4. Draw on the canvas, **Park for agent**, then open **Local site**
- **[scribble:ipad-architecture#1]** iPad architecture sketch (0.1089) — [iPad architecture sketch | scribble] # Hybrid RAG local-site loop This page is the playable outline of the architecture drawn on the iPad canvas. Park a drawing (or POST `/api/ask`) to refresh the article from Hybrid RAG.

### cursor

_No hits in this ground yet. Drop files or park again after rebuild._

### md

- **[md:architecture-loop#8]** Hybrid RAG local-site loop (0.1240) — [Hybrid RAG local-site loop | md] ### scribble - **[scribble:ipad-architecture#0]** iPad architecture sketch (0.2212) — [iPad architecture sketch | scribble] # iPad architecture sketch Parked iPad diagram: Papers + Code (internet Fetch) + S
- **[md:architecture-md#8]** architecture.md (0.1221) — [architecture.md | md] ### scribble - **Latest parked canvas** (0.1455) — [Latest parked canvas | scribble] # Latest parked canvas parked canvas architecture Diagrams ask Diagram Scribbling (iPad) PNG parked: True (944070 bytes) # iPad canv
- **[md:architecture-loop#9]** Hybrid RAG local-site loop (0.1151) — [Hybrid RAG local-site loop | md] write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual) - **[scribble:ipad-architecture#10]** iPad architecture sketch (0.1341) — [iPad architecture sketch | scribble] ## L
- **[md:architecture-md#11]** architecture.md (0.0863) — [architecture.md | md] ### md - **Hybrid RAG local-site loop** (0.2090) — [Hybrid RAG local-site loop | md] eof Error ? error.message : 'bad ask' }) } return } ### scribble - **iPad architecture sketch** (0.1744) — [iPad architecture sketch
- **[md:architecture-loop#12]** Hybrid RAG local-site loop (0.0861) — [Hybrid RAG local-site loop | md] k` runs: - ingest the latest scribble - retrieve each ground - write `data/md/` (this article) - write `data/diagrams/latest.json` (the 3b1b-ish visual) - b - **[md:architecture-md#20]** architecture.md (0.

## Citations

- `papers:db-json#12 (papers)`
- `papers:heta-rag-2025-md#3 (papers)`
- `papers:heta-rag-2025-md#24 (papers)`
- `papers:vidorag-2025-md#33 (papers)`
- `papers:vidorag-2025-md#32 (papers)`
- `code:server-inbox-plugin-ts#4 (code)`
- `code:server-inbox-plugin-ts#5 (code)`
- `code:server-inbox-plugin-ts#6 (code)`
- `code:server-inbox-plugin-ts#0 (code)`
- `code:rag-cli-py#0 (code)`
- `scribble:latest-park#0 (scribble)`
- `scribble:ipad-architecture#0 (scribble)`
- `scribble:ipad-architecture#9 (scribble)`
- `scribble:ipad-architecture#13 (scribble)`
- `scribble:ipad-architecture#1 (scribble)`
- `md:architecture-loop#8 (md)`
- `md:architecture-md#8 (md)`
- `md:architecture-loop#9 (md)`
- `md:architecture-md#11 (md)`
- `md:architecture-loop#12 (md)`

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
