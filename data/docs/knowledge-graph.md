---
title: Wiki knowledge graph
slug: knowledge-graph
id: page:knowledge-graph
type: page
nav: Knowledge graph
order: 19
depth: long
gist: One graph over MD and GET /api/meta links. Agents take a neighborhood, then open real pages and papers. Jump focuses this same graph.
summaryShort: One graph, jump to focus
summaryLong: GET /api/graph builds nodes and edges only from existing related, citations, implements, derived_from, pageId, and paperIds. Search prepends labeled graph hits. The board below is the same graph; a hash or Show on knowledge graph only moves the camera.
tags:
  - graph
  - meta
  - retrieve
related:
  - page:agents
  - page:metadata
  - page:hybrid-rag
  - page:diagrams
  - module:knowledge-graph
  - module:search
  - diagram:flagged-schemes-graph
updated: 2026-09-06
questions:
  - Where do edges come from?
  - How does jump-to-node work?
  - Why is this not GraphRAG communities?
glossary:
  - term: wiki knowledge graph
    def: A view over meta links. Not a fourth agent and not a new vector store.
  - term: jump-to-node
    def: Focus an existing id on /site/knowledge-graph. Never rebuild a per-section graph.
citations:
  - graphrag-2024
  - living-papers-heer-2023
  - hm-rag-2025
  - paper-plain-august-2023
  - gorilla-2023
embeds:
  - knowledge-graph
  - diagrams:flagged-schemes-graph
---

# Wiki knowledge graph

## What

GraphRAG argues for a content graph over flat chunks [@graphrag-2024]. This site ships the **shape** (entity / related traversal on ids we already have), **not** Microsoft community detection and **not** a second index. `GET /api/meta` now also prints `graphDegree` — an undirected count of those same allowed edges. That number is computed, not a scholarly claim.

The interactive board is **this page**. The camera starts zoomed out on a few **type clusters**; zoom or scroll reveals **local clusters** (hub neighborhoods on existing edges), then individual records. That clustering is a view — it does not add edges. Click a record to focus it. [Show on knowledge graph](/site/knowledge-graph#page:knowledge-graph) on any article is the same camera move (`#<id>`).

## Tools

| Method | Path | Role |
| --- | --- | --- |
| GET | `/api/graph` | Full graph. Optional `?focus=&hops=` annotates a neighborhood. |
| GET | `/api/graph/neighborhood?id=` | BFS subset of **that same graph**. 404 if the id is missing. |
| GET | `/api/search?q=` | Prepends labeled `ground: graph` hits. No RRF into other grounds [@hm-rag-2025]. |
| GET | `/api/meta/:id` | The record the edge came from [@gorilla-2023]. |

Persist: `backend/persist/graph.ts`. UI: `frontend/src/site/KnowledgeGraphBoard.tsx`.

## Edges we allow

Only if **both** ends exist on `listMeta()` (boards excluded):

`related`, `citations` → `cites`, `implements`, `derived_from`, `pageId` → `page`, `paperIds` → `paper`.

No inferred “looks related.” No community summary nodes.

## How agents should use it

1. Neighborhood for the page or paper id.
2. Open those hrefs (`/site/<slug>`, `/site/papers#<id>`).
3. Cite those ids. Do not treat the graph panel text as a reconstructed paper.

## Jump-to-node

`/site/knowledge-graph#page:hybrid-rag` (or any meta id). The board always fetches `/api/graph` once. Hash changes only `focus`. Handbook: descriptive label (9:1), button chrome (13), graphic has a type legend and counts (14).

## Insights from building

- Including every tied board made the canvas unreadable; boards are pad keys, not wiki articles.
- Diagram **nodes** stay on the graph (they carry `pageId` / `paperIds`). That is how a section control can name `node:…` and still land here.
- Empty / error states are copy on this board (retry button, filter-empty note, 404 neighborhood in the API).
- Overview’s old “graph-lite” (`GET /api/overview`) remains a catalog blurb. This page is the real graph.

Design sketch (rehomed): `diagram:flagged-schemes-graph`.

## Why

Agents were rebuilding mini-graphs in chat. One bus + one view keeps cite-or-fetch honest: if there is no edge, do not invent one. Clustering JS on this page is owned by another agent — this article is the **page text**.

## How

1. `GET /api/graph/neighborhood?id=page:metadata`.
2. Open each neighbor href.
3. Cite those ids.
4. Optional: `GET /api/meta?related=page:metadata` for the same links as records.

## Tools / MD paths

`backend/persist/graph.ts`, `backend/persist/meta.ts` (`graphDegree`), `frontend/src/site/KnowledgeGraphBoard.tsx`. Page: `data/md/knowledge-graph.md`.

## Worked example

`page:sandbox-idea` should show `parent: page:sandbox` on the bus and a parent edge in the graph. Degree rises when related/citations exist on both ends. Boards stay off the canvas.
