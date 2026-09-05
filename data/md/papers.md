---
title: Papers corpus
slug: papers
nav: Papers
order: 4
gist: About twenty OA papers in data/papers, indexed on the papers ground. The live catalog is GET /api/papers.
questions:
  - Which papers are actually on disk?
  - How do I search instead of scrolling every PDF?
  - What was skipped or not ingested?
glossary:
  - term: papers ground
    def: Isolated hybrid index over handbook chapters plus data/papers Markdown.
  - term: CATALOG.md
    def: Human shortlist of the OA ingest. Not itself a research paper.
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - semantic-reader-project-2023
  - colpali-2024
---

# Papers corpus

Permanent store: `data/papers` (Markdown under 400 KB for seed; PDFs in `data/papers/pdf/`). The handbook chapters in `refs/ui-rag` also land on the **papers** ground. This page does not paste retrieve hits. The list below the article is `GET /api/papers`. Search the corpus box (hybrid RAG) and filter the catalog — overview first, passages on demand. Use **Fetch paper** for an arXiv id or OA PDF URL (`POST /api/papers/fetch`).

## How to read them here

Paper Plain: key questions and section gists on every scholarly page [@paper-plain-august-2023]. Semantic Reader: citation cards in the rail, links keyed by paper id [@semantic-reader-project-2023]. Click a catalog row to jump its anchor; use search for passages.

## Frontend / visual IA (shortlist)

Living Papers, Fidyll, ScrollyVis, Dashboard Design Patterns, Semantic Reader, Paper Plain, InReAcTable, VADIS, TreeReader. These license **MD → pages**, overview-then-detail, left TOC, gists, citation cards — not a personal aesthetic.

## Backend / agent-connect (shortlist)

ViDoRAG, HM-RAG, HetaRAG, MA-RAG, GraphRAG, WebArena, Mind2Web, SWE-agent, Agent Workflow Memory, Gorilla. ColPali is **named** in the catalog as future diagram-native retrieve; the PDF was not on disk this pass [@colpali-2024].

## Skipped

CiteSee (CHI 2023) stayed paywalled. ScrollyVis was taken from arXiv 2207.03616, not IEEE HTML.

## Add another paper

Use the form on this page or `POST /api/papers/fetch` with `{ "arxiv": "2407.01449" }`. The pipeline writes Markdown + optional PDF, seeds, and rebuilds the **papers** ground. Manual drop-folder steps remain in [CONTROL.md](/site/control).
