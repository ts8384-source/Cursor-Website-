# papers-ingest.md

---
title: How we get papers from the internet
slug: papers-ingest
id: page:papers-ingest
type: page
nav: Internet → local
order: 1
parent: page:papers
depth: long
pageBudget: 900
gist: OA fetch only. POST /api/papers/fetch, isolated papers ground, cite-or-fetch. Paywalls and blogs stay not in DB.
summaryShort: OA fetch recipe on this site
summaryLong: Standing operator page for internet to local paper ingest. Allowlisted OA download, seed, rebuild papers ground, then search and ask. Refuses paywall scrape and blog crawl. Worked examples live in the fetch log below.
tags:
  - papers
  - fetch
  - rag
related:
  - page:papers
  - page:hybrid-rag
  - page:agents-fetch
  - page:control
  - page:sandbox-memory
  - diagram:papers-ingest
citations:
  - living-papers-heer-2023
  - colpali-2024
  - paper-plain-august-2023
  - gorilla-2023
questions:
  - What does POST /api/papers/fetch actually do?
  - How does hybrid RAG see a new paper?
  - What is refused?
glossary:
  - term: cite-or-fetch
    def: Cite a retrieve hit id or say not in DB and offer OA fetch. Do not invent.
  - term: papers ground
    def: Isolated hybrid index over handbook plus data/papers. No cross-ground RRF.
---

# How we get papers from the internet

This is a **standing encyclopedia page**, not a sandbox note. Parent: [Papers](/site/papers). The catalog lists what is on disk. This child is the **recipe**.

## What

`POST /api/papers/fetch` (alias `POST /api/fetch`) accepts `{ "arxiv": "…" }` or `{ "url": "…" }` or `{ "id": "…" }`. The server downloads **open access only**. It writes `data/papers/<id>.md` (and a PDF under `data/papers/pdf/` when one arrives), updates `CATALOG.md`, then runs `python -m rag.cli seed` and `rebuild --grounds papers` [@gorilla-2023].

The permanent paper DB is `GET /api/papers/db` — summaries, figures, math, execution rows. Forgetting never applies here. Living Papers still holds: the MD file is the local paper record [@living-papers-heer-2023].

**Cite-or-fetch:** every factual claim names a hit id. If the work is missing, say **not in DB** and call this route. Do not invent. Do not use an LLM as a judge.

The **papers** ground stays isolated. Search and ask label hits `ground: papers`. No cross-ground RRF. ColPali is named in the catalog as future diagram-native retrieve; it does not replace this text ingest [@colpali-2024].

## Why

Agents fail when the interface is “go browse the web” [@gorilla-2023]. The ACI is this allowlisted POST plus `GET /api/tools`. Paywall HTML is not sight. A blog post is not a paper. Caesar crawl is refused.

## How (after fetch)

1. Confirm `GET /api/papers` and `GET /api/papers/db` contain the id.
2. Seed + rebuild already ran on a successful fetch. You can repeat: `python -m rag.cli seed` then `python -m rag.cli rebuild --grounds papers`.
3. Retrieve: `GET /api/search?q=…` and/or `POST /api/ask`. Hits stay labeled.
4. Neighborhood: `GET /api/graph/neighborhood?id=<paper-id>` then open the real record. Graph hits are labeled `graph`, not a second soup.
5. Write cites onto the page that needed the paper. Rebuild notes belong next to the id, not in chat.

## What is refused

| Refused | Why |
| --- | --- |
| Paywall scrape | Not OA. Status typically 502 / not an OA PDF. **Not in DB.** |
| Blogs, random HTML | Not a paper. No Caesar crawl. |
| Localhost / private / link-local / CGNAT `100.64/10` on outbound | SSRF wall in `backend/ingest/fetch-safe.ts`. Incoming pad heartbeat is not this check. |
| Invented abstracts | Cite-or-fetch. Missing work stays **not in DB**. |

CiteSee (CHI 2023) is the house example of a paywall that stayed out. ScrollyVis was taken from arXiv 2207.03616, not IEEE HTML.

## Tools / MD paths

| Step | Tool |
| --- | --- |
| Fetch OA | `POST /api/papers/fetch` `{ "arxiv" }` |
| Catalog | `GET /api/papers` |
| Permanent DB | `GET /api/papers/db` |
| Search | `GET /api/search?q=` |
| Ask + cite envelope | `POST /api/ask` |
| Meta | `GET /api/meta/:id` |
| Graph | `GET /api/graph/neighborhood?id=` |
| Offline drop | `data/papers/<id>.md` + `python -m rag.cli seed` + `rebuild --grounds papers` |

Code: `backend/ingest/paper-fetch.ts`, `backend/ingest/fetch-safe.ts`, `backend/http/routes.ts`. Operator: [CONTROL](/site/control), [Fetch hat](/site/agents-fetch), [Hybrid RAG](/site/hybrid-rag). Diagram: [papers-ingest](/site/diagrams) (`diagram:papers-ingest`).

## Worked example

Fetch Hybrid RAG’s usual demo: `{ "arxiv": "2407.01449" }` (or any id already on the catalog). Success returns `{ ok: true, id, skipped? }`. Already-ingested ids skip download.

Paper Plain section-gist stays collapsed chrome; this body is the long form [@paper-plain-august-2023].

## Fetch log (memory / token pass)

Tried via `POST /api/papers/fetch` for the [sandbox optimization](/site/sandbox-memory) exploration. Update this table when a call returns.

| Work | Asked id | Result |
| --- | --- | --- |
| FadeMem | `2601.18642` / `arxiv-2601-18642` | **Already in DB** |
| MemoryBank | `2305.10250` / `arxiv-2305-10250` | **Already in DB** |
| Memory as Metabolism (Miteski) | `2604.12034` / `arxiv-2604-12034` | **Already in DB** |
| Memobrain | `2601.08079` | pending this turn |
| ClawVM (Rafique & Bindschaedler) | `2604.10352` (confirm) | pending this turn |
| Context Rot (Chroma Research) | OA lookup | pending this turn |
| CompactRAG | OA lookup | pending this turn |
| Learning to Share | OA lookup | pending this turn |
| SemaClaw | — | **not in DB** before this turn |

Paywall or failed OA → **not in DB**. Do not paste invented abstracts.
