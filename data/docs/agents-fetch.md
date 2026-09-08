---
title: Fetching agent
slug: agents-fetch
id: page:agents-fetch
type: page
nav: Fetch
order: 16
gist: Retrieve, cite, extract. Lantern as a wiki verb. Graph neighborhood then real pages. Sufficiency-then-stop.
summaryShort: Cite-or-fetch plus wiki graph
summaryLong: Live fetch mash. Isolated grounds, cite-or-fetch, session cites, GET /api/graph/neighborhood, then GET /api/pages or papers. Not generate. Not a second RAG.
tags:
  - agents
  - fetch
  - retrieve
related:
  - page:agents
  - page:knowledge-graph
  - page:hybrid-rag
  - page:papers
  - module:search
  - diagram:flagged-schemes-fetch
updated: 2026-09-06
parent: page:agents
questions:
  - What tools does fetch actually call?
  - When does it stop?
  - What is still not in the paper DB?
glossary:
  - term: cite-or-fetch
    def: Retrieve first; cite a hit id; missing → say not in DB and POST /api/papers/fetch.
  - term: sufficiency
    def: Stop when session cites already answer the question.
citations:
  - hm-rag-2025
  - gorilla-2023
  - swe-agent-2024
  - living-papers-heer-2023
  - graphrag-2024
  - paper-plain-august-2023
embeds:
  - diagrams:flagged-schemes-fetch
---

# Fetching agent

Skill: `.cursor/skills/research-fetch/SKILL.md`. This is the retrieve / cite / extract hat. It is **not** generate and **not** coding.

## What shipped

Paper Lantern is a **wiki verb** on MD + `GET /api/meta` — not an MCP [@gorilla-2023]. Fetch uses the existing retrieve stack plus the new graph view.

| Piece | Path |
| --- | --- |
| Skill | `.cursor/skills/research-fetch/SKILL.md` |
| Search / ask | `GET /api/search`, `POST /api/ask` |
| Graph | `GET /api/graph`, `GET /api/graph/neighborhood?id=` |
| Papers | `GET /api/papers`, `POST /api/papers/fetch` |
| Drawing-loop hook | `.cursor/skills/drawing-loop/SKILL.md` (fetch vs generate clarify) |

Hits stay labeled by ground (`papers`, `code`, `scribble`, `cursor`, `md`, `meta`, `graph`). No cross-ground RRF [@hm-rag-2025]. `ground: graph` is neighborhood context; the next step is `GET /api/pages/:slug` or `GET /api/papers/:id`.

## How a fetch turn runs

1. Clarify if the user said only “do the research.”
2. Search / ask. Read `citeOrFetch` and `grounding.unsupported` as cheap overlap, not a verdict you can ignore.
3. If a seed id is on the board: `GET /api/graph/neighborhood?id=page:…` then open those records.
4. Cite every factual claim. Session cites only.
5. Missing named OA work → **not in DB** + `POST /api/papers/fetch`. Do not invent.
6. Sufficiency-then-stop.
7. **Required:** write the fetch log to `data/md/sandbox/` (`sandboxLane: research`). Chat only points at `/site/<slug>`.

## Why

Fetch without a lab page becomes a chat dump. Living Papers wants the log on disk [@living-papers-heer-2023]. Cite-or-fetch without a session file loses the hit ids on the next turn.

## Tools / MD paths

Skill `.cursor/skills/research-fetch/SKILL.md`. How-to: [How the lab works](/site/sandbox-how-the-lab-works). Recipe: [Papers ingest](/site/papers-ingest).

## Worked example

A fetch that opened `paper-plain-august-2023` writes those ids on a research-lane child, not in the parent transcript. Condensed return: ids + gist via `POST /api/condensed`.

## Insights from building

- The graph is cheap because `listMeta()` already assembled related + citations. The new persist (`backend/persist/graph.ts`) only **filters** those links. Inventing entity extraction would have been a second corpus.
- Neighborhood must be a **subset of the same edge list**. A per-query reconstructed graph would violate jump-to-node.
- Boards were excluded from the wiki graph. Tied-board keys explode and are not articles. Papers still do not decay.
- Several flagged schemes (IntrAgent, RA–FSM, Paper Lantern product) remain **not in DB**. This page does not quote their vendor numbers.

## Caveats

OA fetch can fail (blocked host, paywall). Then the honest line is still **not in DB**. Do not scrape. Diagram: `diagram:flagged-schemes-fetch`.
