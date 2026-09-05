# Hybrid RAG local-site loop

_Ask:_ RSNN SF MLP one-hot Frame Loss stop gradient parallel architecture from iPad canvas

_Retrieved 2026-09-05 22:01 UTC. Isolated grounds, labeled merge only._

## Architecture (from the iPad)

Papers + Code (Fetch) + Scribbling + Cursor → **Hybrid RAG** → **ask** → **Diagram** → **md** ↔ vector DB.
Save and Book keep write back into the index. The local site is Wikipedia-like + a 3b1b visual.

## Retrieved by source

### papers

- **README** (0.0814) — [README | papers] # README # UI handbook RAG (faster than the PDF) Chunked text from `refs/ui-hci-survey.pdf` (HHS/GSA 2006, public domain). Vite already ignores `refs/**`. ## Retrieve (do this, not the 22MB PDF) ```text python refs/ui-rag/
- **ch04 hardware and software** (0.0587) — [ch04 hardware and software | papers] # ch04 hardware and software # Chapter 4 — Hardware and Software Source: `refs/ui-hci-survey.pdf` printed pp. 30–33. ## Chapter overview allows users to scroll through the information section without di
- **ch01 design process and evaluation** (0.0479) — [ch01 design process and evaluation | papers] e goal that information will be found eighty percent of the time and in less than one minute. Sources: Baca and Cassidy, 1999; Bradley and Johnk, 1995; Grose, et al., 1999; Sears, 1995. Strength
- **ch01 design process and evaluation** (0.0476) — [ch01 design process and evaluation | papers] 001; Ovaska and Raiha, 1995; Zimmerman, et al., 2002. ## 1:10 Use Parallel Design PDF page ~31 (printed 7). 1:10 Use Parallel Design Strength of Evidence: Relative Importance: Design Process and
- **ch18 usability testing** (0.0469) — [ch18 usability testing | papers]  of misses, but is also increases the number of false positives. Generally, the more expert the usability specialists, the more useful the results. Performance usability testing with users: – Early in the 

### code

- **server/inbox-plugin.ts** (0.0889) — [server/inbox-plugin.ts | code] # server/inbox-plugin.ts import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs' import { networkInterfaces } from 'node:os' import { dirname, join } from 'node:path' import 
- **rag/retrieve.py** (0.0787) — [rag/retrieve.py | code] # rag/retrieve.py from __future__ import annotations import json import os from pathlib import Path from typing import Any from rag.chunking import Chunk, chunk_text from rag.paths import CORPUS, INDEX, ensure_dirs 
- **RAG CLI and hybrid index** (0.0780) — [RAG CLI and hybrid index | code] # RAG CLI and hybrid index Live retrieve path: rag/retrieve.py HybridIndex. Node wraps it via server/vector-store.ts → python -m rag.cli. Scripts: rebuild, seed, refresh-site. Tokenizer keeps hyphen tokens 
- **rag/retrieve.py** (0.0749) — [rag/retrieve.py | code] lient = chromadb.PersistentClient(path=self._chroma_dir) self._col = self._client.get_or_create_collection( name=COLLECTION, embedding_function=self._embed, metadata={"hnsw:space": "cosine"}, ) self._bm25 = None sel
- **server/inbox-plugin.ts** (0.0737) — [server/inbox-plugin.ts | code] : incomingShapes }) void runAsk('parked canvas architecture').then((ask) => { bookkeep('ask', { via: 'park', ok: ask.ok, error: ask.error ?? null }) }) } json(res, 200, { ok: true, ask: payload.parked ? 'star

### scribble

- **Latest parked canvas** (0.2285) — [Latest parked canvas | scribble] # Latest parked canvas RSNN SF MLP one-hot Frame Loss stop gradient parallel architecture from iPad canvas PNG parked: True (2349629 bytes) # iPad canvas 154 shapes, 154 freehand strokes. - draw (499, -195)
- **iPad architecture sketch** (0.1142) — [iPad architecture sketch | scribble] # iPad architecture sketch Parked iPad diagram: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor feed Hybrid RAG. Output goes to ask, then Diagram, then md. md talks to Fetch and the vector D
- **iPad architecture sketch** (0.0945) — [iPad architecture sketch | scribble] t.png` | | Cursor | `cursor` | Notes from this loop and optional `data/cursor` drops | Optional URL fetch exists on `/api/fetch` (size-capped, no localhost). Prefer drop folders so the loop works offlin
- **iPad architecture sketch** (0.0945) — [iPad architecture sketch | scribble] icle) - write `data/diagrams/latest.json` (the 3b1b-ish visual) - bookkeep the event - index the new md + scribble so the next search can find them **Save** and **Book keep** are the same write-back: ar
- **Latest parked canvas** (0.0615) — [Latest parked canvas | scribble]  (329, 1019) - draw (-1415, 1068) - draw (-1252, 945) - draw (-1248, 965) - draw (-1278, 1191) - draw (-1177, 1033) - draw (-1156, 1047) - draw (-1226, 1083) - draw (-1130, 1038) - draw (-1123, 1063) - draw

### cursor

- **Confirmed loop from Cursor** (0.0328) — [Confirmed loop from Cursor | cursor] # Confirmed loop from Cursor Confirmed architecture (Cursor + iPad): Inputs: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor → Hybrid RAG → output → ask → Diagram → md ↔ Fetch vector DB Also

### md

- **Hybrid RAG local-site loop** (0.0961) — [Hybrid RAG local-site loop | md] y-time HyDE per ground (template abstract; LLM optional later). 5. Lexical query is **goal + short bias** only. Seeder bags / Query2doc phrases are **extra RRF lists**, not one stuffed BM25 string. 6. Recip
- **Hybrid RAG local-site loop** (0.0952) — [Hybrid RAG local-site loop | md] # Hybrid RAG local-site loop # Hybrid RAG local-site loop _Ask:_ parked canvas architecture _Retrieved 2026-09-05 21:51 UTC. Isolated grounds, labeled merge only._ ## Architecture (from the iPad) Papers + C
- **Hybrid RAG local-site loop** (0.0789) — [Hybrid RAG local-site loop | md] instanceof Error ? error.message : 'bad ask' }) } return } ### scribble - **iPad architecture sketch** (0.1450) — [iPad architecture sketch | scribble] # iPad architecture sketch Parked iPad diagram: Papers
- **Hybrid RAG local-site loop** (0.0783) — [Hybrid RAG local-site loop | md]  (-4908, -2165) - draw (-4944, -2181) - draw (-4441, -2344) - draw (-4428, -2344) - draw (-4453, -2185) - draw (-4345, -1491) - draw (-4450, -151 - **Latest parked canvas** (0.0933) — [Latest parked canvas 
- **Hybrid RAG local-site loop** (0.0754) — [Hybrid RAG local-site loop | md] hin, work-ish) - **Coding agent** — allowlisted scripts: rebuild index, refresh site, seed. - **Web coding agent** — same scripts via `/api/scripts`, not arbitrary remote code. ## Try it 1. `pip install -r 

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

`/site` is Wikipedia-like on the left (TOC + article) and a dark 3Blue1Brown-style
diagram on the right. Search talks to the hybrid index. HUD **Local site** on the
canvas opens this page. Home stays available from every site page.

## Agents (thin, work-ish)

- **Coding agent** — allowlisted scripts: rebuild index, refresh site, seed.
- **Web coding agent** — same scripts via `/api/scripts`, not arbitrary remote code.

## Try it

1. `pip install -r requirements-rag.txt`
2. `python -m rag.cli seed` then `python -m rag.cli rebuild`
3. `npm run dev` on port **5174**
4. Draw on the canvas, **Park for agent**, then open **Local site**
