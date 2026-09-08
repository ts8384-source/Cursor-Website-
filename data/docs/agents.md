---
title: Isolated agents
slug: agents
id: page:agents
type: page
nav: Agents
order: 15
depth: long
gist: Three isolated hats — coding, fetch, generate — share one wiki knowledge graph at retrieve. Later imported crews stay off.
summaryShort: Three hats, one graph
summaryLong: Coding, fetch, and generate are thin isolated skills. The wiki knowledge graph is a retrieve surface over GET /api/meta, not a fourth agent. Clarify generate vs fetch when the user says do the research.
tags:
  - agents
  - aci
  - retrieve
related:
  - page:agents-coding
  - page:agents-coding-generate
  - page:agents-coding-debug
  - page:agents-fetch
  - page:agents-generate
  - page:knowledge-graph
  - page:sandbox
  - page:control
  - page:hybrid-rag
  - page:metadata
  - module:agents
  - diagram:flagged-schemes-loop
updated: 2026-09-06
questions:
  - When the user says do the research, which hat?
  - How do agents reach real pages after a graph hop?
  - What stayed off (MGM, MCP, crawl, imported crews)?
glossary:
  - term: isolated hat
    def: Coding, fetch, or generate run one mash. Do not collapse them at inference.
  - term: wiki verb
    def: Paper Lantern shape on this wiki — search, meta, MD write. Not an MCP sidecar.
  - term: later hats
    def: coding-scheme and co-scientist crews. Still off as imported runtimes.
citations:
  - swe-agent-2024
  - gorilla-2023
  - living-papers-heer-2023
  - hm-rag-2025
  - graphrag-2024
  - arxiv-2605-18661
embeds:
  - diagrams:flagged-schemes-loop
---

# Isolated agents

## What

Three hats. One wiki. **Clarify generate vs fetch** before “do the research” runs [@arxiv-2605-18661]. Coding is a third wall — it does not fetch papers and it does not draft speculative cites [@swe-agent-2024]. Every hat that does work still writes a [Lab bench](/site/sandbox) child. Chat is a pointer.

| Hat | Skill | Site page | Start tool |
| --- | --- | --- | --- |
| Fetch | `.cursor/skills/research-fetch/SKILL.md` | [Fetch](/site/agents-fetch) | `GET /api/search`, `GET /api/graph/neighborhood` |
| Coding | `.cursor/skills/coding-agent/SKILL.md` | [Coding](/site/agents-coding) | wiki page + tests |
| Generate | `.cursor/skills/research-generate/SKILL.md` | [Generate](/site/agents-generate) | `POST /api/generate/seed` |

The shared retrieve surface is the [knowledge graph](/site/knowledge-graph): `GET /api/graph` then **open the real MD or paper**. Isolated grounds stay labeled. No cross-ground RRF [@hm-rag-2025]. ACI is still `GET /api/tools` plus [CONTROL](/site/control) [@gorilla-2023].

## What is live

- One wiki graph over meta links (no invented edges, no community detection).
- Jump-to-node on every page (`Show on knowledge graph`) focuses that id on the **same** graph.
- Thin skills for the three hats. A4 = read a hand-authored `SKILL.md` in this repo. No community/GitHub skills.
- Generate seed is in-DB only. Fetch remains cite-or-fetch. Coding PED is turn-control in CONTROL + the coding skill.
- MGM: `GET /api/tripwires` hire hook. User starts the hire; if stuck, ask first. Lab: [Lab bench](/site/sandbox).
- **Lab writes:** every working turn also leaves a page under [Lab bench](/site/sandbox). Chat only points at `/site/<slug>`.

## What is not live

Imported coding-scheme / co-scientist crews, Paper Lantern MCP, MGM evolution, Caesar crawl, IntrAgent runtime, Microsoft GraphRAG communities. Those stay later-or-never.

Diagram below is the index board (`diagram:flagged-schemes-loop`), rehomed from the retired dump. Per-hat diagrams live on the child pages.

## Why

SWE-agent and Gorilla want a small ACI, not three processes that scrape the same DOM [@swe-agent-2024] [@gorilla-2023]. Collapsing generate into fetch invents cites. Collapsing coding into fetch wanders OA.

## How

1. Name the hat.
2. Fetch: search → neighborhood → real page/paper → lab research note.
3. Generate: `POST /api/generate/seed` → lab idea/research draft.
4. Coding: implement against wiki ids already on the page → lab code note + tests.

## Tools / MD paths

`GET /api/tools`, skills under `.cursor/skills/`. Pages: `data/md/agents*.md`. CONTROL hats section.

## Worked example

User says “do the research.” Stop. Ask generate vs fetch. If fetch, do not call `POST /api/generate/seed`. If generate, do not `POST /api/papers/fetch` unless the seed 404s.
