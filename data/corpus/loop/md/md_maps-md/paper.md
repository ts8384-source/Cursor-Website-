# maps.md

---
title: Math and diagram to code
slug: maps
nav: Maps
order: 9
gist: Fetch code on demand from a math term or diagram label, then keep a bidirectional map.
questions:
  - How do I ask for the code that implements RRF or a gist rail?
  - What is already curated versus fetched this session?
  - Why is this not a second vector database?
glossary:
  - term: map edge
    def: A labeled link from math, diagram, or paper id to a repo path.
  - term: on-demand fetch
    def: POST /api/maps/fetch searches the code ground and local files, then writes data/maps.
citations:
  - gorilla-2023
  - hm-rag-2025
  - living-papers-heer-2023
  - paper-plain-august-2023
---

# Math and diagram to code

The board’s core loop: **fetch the code within the project on demand from math and diagram, then map code to diagram or math.**

`$RRF$`, `gist`, `ACI`, and figure labels are first-class queries. They are not a dump of the whole `code` ground into this column. You type a term (required), optionally mark it math or diagram, and the server:

1. Looks through curated execution rows (how each paper is wired here).
2. Greps a small allowlist of implementation files.
3. If the hybrid index is up, searches the **code** ground only (labeled merge still applies) [@hm-rag-2025].
4. Writes new edges to `data/maps/edges.json`.

Gorilla’s pattern: list, then call [@gorilla-2023]. The map catalog is `GET /api/maps`. Do not scrape the article DOM for edges.

## Math → terms

Paper Plain links unfamiliar words to definitions [@paper-plain-august-2023]. This site also turns `$…$` in Markdown into links at `/site/maps#math-<slug>` and exposes `GET /api/math`.

## Include code

The website is the purpose; code is part of the literature chrome, not a hidden folder. Execution detail lives on [Execution](/site/execution). Seed extra repo files into the code ground via `rag/ingest.py` so on-demand search can see `backend/` and `frontend/src/site/`.
