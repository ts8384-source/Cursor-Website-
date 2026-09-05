# iPad architecture sketch

Parked iPad diagram: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor feed Hybrid RAG. Output goes to ask, then Diagram, then md. md talks to Fetch and the vector DB. Save and Book keep write into the vector DB. Right side: Wikipedia + 3Blue1Brown-like visual UI on a local website, plus a coding agent for scripts and a web coding agent.

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
