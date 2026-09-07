---
title: "To-implement"
slug: implement
id: page:implement
type: page
nav: To-implement
order: 19
highlight: queue
gist: Live write/erase work queue. Not Overview’s page tree. discuss / will-implement / implemented — never “production.”
summaryShort: Work queue, not page map
summaryLong: Permanent-ish implement list as its own Queue highlight. GET/POST /api/implement. Completing an item archives it (?done=1). Distinct slate/teal chrome, not the Overview structure board.
tags:
  - implement-queue
  - agents
related:
  - page:sandbox
  - page:memory
  - page:overview
  - page:control
updated: 2026-09-06
questions:
  - What is on the active will-implement list?
  - How is this different from Overview?
  - What happens when an item is implemented?
glossary:
  - term: discuss
    def: Thinking. Not a build decision yet.
  - term: will-implement
    def: Decided we will build it. Not built yet. MGM belongs here.
  - term: implemented
    def: Done. Hidden from the default queue; kept as archive/audit (like memory supersedes).
  - term: To-implement
    def: The write/erase work queue. Not the Overview page-structure tree.
citations:
  - living-papers-heer-2023
---

# To-implement

This is the **work queue**, not the wiki map. Overview (`/site/overview`) is the live page tree. This page is the list of things we **will implement**, with write and erase.

The live list is the **slate board below** (`GET /api/implement`). Completing a row calls `POST /api/implement/complete` — it leaves the default list and stays on disk. `?done=1` is the implemented archive.

## Status vocabulary (whole wiki)

| Word | Means |
| --- | --- |
| **discuss** | Thinking |
| **will-implement** | Decided, not built |
| **implemented** | Done; can leave the active list |
| ~~production~~ | **Do not use.** Lazy. Discuss first, then will-implement. |

ClawVM stays **explore** on its own page. It is **not** a will-implement seed.

## Tools

- `GET /api/implement` — active items
- `GET /api/implement?done=1` — include implemented
- `POST /api/implement` `{ title, note?, status: discuss\|will-implement, supersedes? }`
- `POST /api/implement/complete` `{ id }`

This queue is a **root** page (`highlight: queue`), not a Workbench child. Lab notes live under [Lab bench](/site/sandbox).
