---
title: Agent-computer interface
slug: control
nav: Control
order: 5
gist: Structured tools plus this file are the ACI. Agents must not scrape the site DOM.
questions:
  - How do I run the pad, backend, and RAG index?
  - How should retrieve, render, and test agents stay modular?
  - How do I add a paper or a Markdown page and rebuild?
glossary:
  - term: ACI
    def: Agent-computer interface — a small, structured action space (SWE-agent, NeurIPS 2024).
  - term: ground
    def: An isolated retrieve index. This repo never runs RRF across grounds.
  - term: seed
    def: Copy drop-folder files into data/corpus so rebuild can index them.
citations:
  - swe-agent-2024
  - gorilla-2023
  - webarena-2024
  - mind2web-2023
  - agent-workflow-memory-2024
  - living-papers-heer-2023
---

# Agent-computer interface

This file is the **primary control surface** for humans and agents. It is Markdown on disk (`content/CONTROL.md`) and a page on the site (`/site/control`). That is the Living Papers idea applied to operations: one source, machine-readable list via `GET /api/pages`, not a hidden wiki in chat [@living-papers-heer-2023].

SWE-agent shows that agents fail when the interface is a raw shell or an unbounded webpage. Give them a designed ACI [@swe-agent-2024]. WebArena and Mind2Web show the same failure mode on the open web: HTML is too large; filter, then act on structured controls [@webarena-2024] [@mind2web-2023]. Gorilla is the catalog pattern: list tools, then call them [@gorilla-2023].

**Do not scrape this site’s DOM.** Use `GET /api/tools` and the routes below.

## How to run

Node is `C:\Program Files\nodejs`. From the repo root:

1. Backend API on **5175**: `npm run dev:backend` (or `npm run dev`, which starts both).
2. Pad + site on **5174**: `npm run dev:frontend`. Canvas is `/`. Scholarly site is `/site`.
3. RAG (Python): `pip install -r requirements-rag.txt`, then `python -m rag.cli seed` and `python -m rag.cli rebuild`.

LAN URLs (this machine): `http://127.0.0.1:5174/` and `http://10.17.3.251:5174/`. API is proxied as `/api` on the pad host, or `http://127.0.0.1:5175/api/...` directly.

Health check: `GET /api/health`.

## Process map

| Process | Port | Role |
| --- | --- | --- |
| Vite frontend | 5174 | tldraw pad at `/`; MD site at `/site` |
| Node backend | 5175 | HTTP tools only — no canvas |
| `python -m rag.cli` | none | seed, rebuild, search, ask, site JSON |

Keep `frontend/` vs `backend/` vs `rag/`. Do not invent a second vector store.

## Multi-agent scheme (modular)

Split work by **tool**, not by scraping pages. Suggested hats:

- **Retrieve** — `GET /api/search?q=...`, `GET /api/papers`, `GET /api/pages/:slug`. Reads isolated grounds. Never invents a toy JSON index.
- **Render** — writes Markdown under `data/md/` or `content/`. The site compiles from disk. Does not restyle chrome from taste.
- **Test** — `curl` the new routes; run `npx tsx --test scholar.test.ts` in `backend/`. Fix failures in the module that broke.
- **Fix** — one small file at a time. If search misses a new paper, seed and rebuild the **papers** ground, then re-query.

Do not stand up a Co-Assistant research crew. Workflow memory, if any, is this file plus `data/bookkeep` [@agent-workflow-memory-2024].

## Software engineering

- Small modules: `backend/persist/*` for disk, `backend/http/routes.ts` for HTTP, `frontend/src/site/*` for chrome, `rag/` for retrieve.
- Site **source is Markdown**. React only renders and hosts Paper Plain / Semantic Reader chrome.
- Test the contract (JSON routes), not the pixels, unless you changed hit targets.
- If both a fix and an exploit are requested, do the fix only.

## How an agent adds a paper

**On-demand (preferred when network is up):** `POST /api/fetch` or `POST /api/papers/fetch` with `{ "arxiv": "2407.01449" }` or `{ "url": "https://arxiv.org/pdf/2407.01449.pdf" }` (OA PDF or arXiv abs/pdf). The server downloads only OA, blocks localhost / private nets / link-local metadata IPs, writes `data/papers/<id>.md` (and `data/papers/pdf/` when a PDF arrives), updates `CATALOG.md`, then `python -m rag.cli seed` and `rebuild --grounds papers`. Already-ingested ids skip download and return `{ ok: true, skipped: true }`. Failures are non-200 with `{ ok: false, error }`.

**Offline drop folder:**

1. Write `data/papers/<id>.md` with the catalog header (`id`, `list`, `authors`, `year`, `venue`, `oa_url`) plus extracted text under 400 KB. Optional PDF in `data/papers/pdf/`.
2. Update `data/papers/CATALOG.md` with one line.
3. `python -m rag.cli seed` (drop folder → `data/corpus/loop/papers`).
4. `python -m rag.cli rebuild --grounds papers` (or full `rebuild`).
5. Confirm with `GET /api/papers` and `GET /api/search?q=<title keywords>`.

## How an agent adds a page

1. Create `data/md/<slug>.md` (or edit this file under `content/`) with YAML frontmatter: `title`, `slug`, `nav`, `order`, `gist`, `questions`, `glossary`, `citations`.
2. The site lists it immediately: `GET /api/pages`. Open `/site/<slug>`.
3. Seed + rebuild so the **md** ground can retrieve the new prose.
4. Cite ingested papers as `[@paper-id]` so the rail can show Semantic Reader cards.

## Tool catalog (same as GET /api/tools)

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Process + LAN URLs |
| GET | `/api/tools` | This catalog |
| GET | `/api/pages` | Machine-readable page list |
| GET | `/api/pages/:slug` | One page, Markdown + meta |
| GET | `/api/overview` | Short “what is this site” from MD + paper catalog |
| GET | `/api/papers` | Ingested OA catalog (disk, not a toy store) |
| GET | `/api/search?q=` | Hybrid retrieve, labeled per ground |
| POST | `/api/ask` | Ingest scribble, retrieve, write latest ask article |
| GET | `/api/scripts` | Allowlisted RAG scripts |
| POST | `/api/scripts` | `{ "name": "seed" \| "rebuild" \| "ask" \| "site" }` |
| POST | `/api/fetch` | OA arXiv id or PDF URL → disk + papers ingest |
| POST | `/api/papers/fetch` | Same as `/api/fetch` |
| POST | `/api/snapshot` | iPad park payload |

## What not to do

- Do not rebuild `/demo` or React Flow `/projects`. Those routes redirect here.
- Do not RRF across grounds.
- Do not treat the canvas at `/` as a settings dump.
- Do not require a ColPali/ViDoRAG VLM index this pass; cite it as future diagram-native retrieve.
