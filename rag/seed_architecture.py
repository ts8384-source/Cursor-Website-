"""Work-ish outline of the iPad architecture (homepage article + diagram)."""

ARCHITECTURE_MD = """\
# Hybrid RAG local-site loop

This page is the playable outline of the architecture drawn on the iPad canvas.
Park a drawing (or POST `/api/ask`) to refresh the article from Hybrid RAG.

## What goes in

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
"""

CURSOR_NOTE = """\
Confirmed architecture (Cursor + iPad):

Inputs: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor
→ Hybrid RAG → output → ask → Diagram → md ↔ Fetch vector DB
Also: Save and Book keep into vector DB
Right side: Wikipedia + 3Blue1Brown-like visual UI, local website,
coding agent (handles scripts), web coding agent.

Pad host: npm run dev on port 5174. Do not steal 5173 from original iPad Cursor.
Retrieve is Co-Assistant HybridIndex (Chroma + BM25 + RRF), isolated grounds,
labeled merge only.
"""

CODE_NOTE = """\
Live retrieve path: rag/retrieve.py HybridIndex.
Node wraps it via server/vector-store.ts → python -m rag.cli.
Scripts: rebuild, seed, refresh-site. Tokenizer keeps hyphen tokens (e-prop).
Chunk size 1200 overlap 150. Collection name hybrid_chunks. Embed BAAI/bge-small-en-v1.5.
"""

DIAGRAM = {
    "title": "Hybrid RAG local-site loop",
    "updatedAt": "",
    "nodes": [
        {"id": "papers", "label": "Papers", "group": "in", "x": 8, "y": 18},
        {"id": "code", "label": "Code / Fetch", "group": "in", "x": 8, "y": 36},
        {"id": "scribble", "label": "Scribbling (iPad)", "group": "in", "x": 8, "y": 54},
        {"id": "cursor", "label": "Cursor", "group": "in", "x": 8, "y": 72},
        {"id": "hybrid", "label": "Hybrid RAG", "group": "core", "x": 36, "y": 45},
        {"id": "ask", "label": "ask", "group": "core", "x": 56, "y": 28},
        {"id": "diagram", "label": "Diagram", "group": "core", "x": 56, "y": 48},
        {"id": "md", "label": "md", "group": "core", "x": 56, "y": 68},
        {"id": "vdb", "label": "vector DB", "group": "store", "x": 78, "y": 45},
        {"id": "save", "label": "Save / Book keep", "group": "store", "x": 78, "y": 68},
        {"id": "wiki", "label": "Wikipedia UI", "group": "site", "x": 36, "y": 88},
        {"id": "vis", "label": "3b1b visual", "group": "site", "x": 56, "y": 88},
        {"id": "site", "label": "local website", "group": "site", "x": 76, "y": 88},
        {"id": "agent", "label": "coding agent", "group": "agent", "x": 92, "y": 28},
        {"id": "webagent", "label": "web coding agent", "group": "agent", "x": 92, "y": 48},
    ],
    "edges": [
        ["papers", "hybrid"],
        ["code", "hybrid"],
        ["scribble", "hybrid"],
        ["cursor", "hybrid"],
        ["hybrid", "ask"],
        ["ask", "diagram"],
        ["diagram", "md"],
        ["md", "vdb"],
        ["vdb", "md"],
        ["save", "vdb"],
        ["md", "wiki"],
        ["diagram", "vis"],
        ["wiki", "site"],
        ["vis", "site"],
        ["agent", "code"],
        ["webagent", "site"],
    ],
}
