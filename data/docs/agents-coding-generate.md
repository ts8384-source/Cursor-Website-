---
title: Code generation
slug: agents-coding-generate
id: page:agents-coding-generate
type: page
nav: Code generation
order: 1
parent: page:agents-coding
depth: long
pageBudget: 700
gist: Methods we use to write new code — A3, A4, cite-or-fetch, graph aim, sandbox lab. Not fetch. Not MGM.
summaryShort: How we generate code here
summaryLong: Nested under Coding. Everyday implement path. Tools, skills, and the fork/lab so new work stays off main until the operator says send back.
tags:
  - agents
  - coding
  - generate
related:
  - page:agents-coding
  - page:agents-coding-debug
  - page:sandbox
  - page:control
  - page:code-meta
  - page:implement
  - page:wiki-writing
  - diagram:agents-coding-generate
  - diagram:flagged-schemes-coding
updated: 2026-09-06
questions:
  - Which tools does a coding turn call first?
  - Where does new code live until merge?
  - What stays out of generation?
  - How long should the wiki note for a change be?
glossary:
  - term: lab
    def: A git branch or worktree forked from main. Coding writes here until a human check.
  - term: A3 PED
    def: One focused change-set. Re-fetch tools. No LLM history rewriter.
citations:
  - swe-agent-2024
  - gorilla-2023
  - living-papers-heer-2023
  - hm-rag-2025
embeds:
  - diagrams:agents-coding-generate
---

# Code generation

Parent: [Coding](/site/agents-coding). Sibling: [Debugging and code collection](/site/agents-coding-debug). House style for page length: [Wiki writing](/site/wiki-writing).

This page is the **write new code** path. `GET /api/meta/page:agents-coding-generate` already said that: nested under Coding, everyday implement, stay off main until the operator says send back. It is not fetch and not the MGM bouncer.

## What

Coding implements against **wiki and fetch results that already exist** (pages, paper DB, graph ids). The ACI is [CONTROL](/site/control) plus `GET /api/tools` — list the catalog, then call [@gorilla-2023]. SWE-agent’s point is the same: a designed action space, not an unbounded page scrape [@swe-agent-2024]. Living Papers means the note for a change is Markdown on disk, not a chat-only summary [@living-papers-heer-2023].

Related records already on this page’s meta (open them; do not invent new edges): [Lab bench](/site/sandbox), [Code meta](/site/code-meta), [To-implement](/site/implement), diagrams `diagram:agents-coding-generate` and `diagram:flagged-schemes-coding`.

## Why

A3 PED keeps the trajectory short so the coder does not replay expired dumps or become the fetch hat. Hybrid retrieve stays labeled; no cross-ground RRF when you aim with the graph [@hm-rag-2025]. The lab exists so risky work is a branch / worktree until a human check — `POST /api/sandbox/propose` does not merge.

Wiki notes for architecture work follow `depth: long` unless the page is Overview or the implement queue. The gist on this page is chrome. The body has to say how the tools actually run.

## How

1. Read CONTROL and the page you are implementing (`GET /api/pages/:slug`). Honor that page’s `depth` / `pageBudget`.
2. Aim with `GET /api/graph/neighborhood?id=page:…` then open the real records. Labeled `graph` hits only [@hm-rag-2025].
3. Cite-or-fetch techniques already on the wiki. Missing → say not in DB. Do not wander OA as the coder.
4. If the work is **new / risky**, open a lab (`POST /api/sandbox/fork`) and stay there until the operator says send back.
5. A3: one change-set. A4: hand-authored skills in this repo only [@swe-agent-2024].
6. If the change needs an article, write the MD body (not only `gist` / `summaryShort`). Expand `summaryLong` and `related` from `GET /api/meta/:id`.

## Tools

| Tool | Why |
| --- | --- |
| `GET /api/tools` | ACI catalog. Do not scrape the DOM [@gorilla-2023]. |
| `GET /api/pages/:slug` | The page you are implementing, including `depth`. |
| `GET /api/meta/:id` | `summary.long`, `related`, citations already fetched. |
| `GET /api/graph/neighborhood` | Aim, then open `/site/<slug>`. |
| `GET /api/search` / `POST /api/ask` | Cite-or-fetch. Sight or no claim. |
| `POST /api/sandbox/fork` | Named branch + optional worktree from main/master. |
| `GET /api/sandbox` | See which lab is active. |
| `POST /api/sandbox/propose` | Human-check-pending. Does not merge. |
| `GET /api/implement` | Queue, not the Overview map. |

## MD paths

- Skill: `.cursor/skills/coding-agent/SKILL.md`
- Park loop: `.cursor/skills/drawing-loop/SKILL.md`
- Code comments: `.cursor/skills/code-meta/SKILL.md` → [Code meta](/site/code-meta)
- This article: `data/md/agents-coding-generate.md`
- Parent: `data/md/agents-coding.md`
- Length: `data/md/wiki-writing.md`, `content/CONTROL.md`

## Worked example

This expansion is the example. Before, the meta bus already had `summaryLong` and eight `related` ids; the article was a short numbered list. After expand-from-meta, those ids are **in the body** with the same four catalog cites (`swe-agent-2024`, `gorilla-2023`, `living-papers-heer-2023`, `hm-rag-2025`). No new paper facts.

## What we refuse here

TraceCoder crew — **abandoned** (we looked, we dropped it). Docker-as-headline. Caesar crawl. Auto-merge from the lab. MGM in the everyday mash. Coding-as-fetch.

Diagram: `diagram:agents-coding-generate`.
