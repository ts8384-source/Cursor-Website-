---
title: Long-term memory and forgetting
slug: memory
id: page:memory
type: page
nav: Memory
order: 10
depth: long
gist: User and project memory decay on a half-life. Corrections supersede old ids. Forget writes AUDIT. Papers never enter this log.
questions:
  - What is still active, and what has fallen below the threshold?
  - How do I strengthen a memory without rewriting it?
  - How does a correction supersede an old note?
  - Why are papers excluded?
glossary:
  - term: half-life
    def: Hours until strength is multiplied by one half if the item is not touched.
  - term: touch
    def: Retrieval practice — POST /api/memory/touch raises strength and resets lastAccess.
  - term: supersedes
    def: New memory id that replaces an old one. The old row stays on disk and is hidden from default GET and retrieve.
  - term: AUDIT
    def: Bookkeep record written only when a forget-lane item is forgotten (who/what/why/related).
citations:
  - agent-workflow-memory-2024
  - swe-agent-2024
---

# Long-term memory and forgetting

## What

The board asked for **long-term memory of the user** and **of the project**, both **use forgetting**, and a **must-need permanent Paper DB** beside them.

Those are two stores:

| Store | Path | Forgets? |
| --- | --- | --- |
| Papers | `data/papers`, `GET /api/papers/db` | No |
| User memory | `data/memory/user.jsonl` | Yes |
| Project memory | `data/memory/project.jsonl` | Yes |
| Bookkeep | `data/bookkeep/log.jsonl` | No (event log, not recall) |

Decay is $S \cdot 2^{-t/h}$ where $h$ is `halfLifeHours`. Default threshold $0.08$. Below that, the item is **forgotten** from the default list (`GET /api/memory`) but still on disk. Pass `?forgotten=1` to see the archive. `POST /api/memory/touch` is retrieval practice.

A parked correction that **contradicts** a note must not sit beside the old fact. `POST /api/memory` `{ "lane", "text", "supersedes": "<old-id>" }` writes the new row and marks the old one (`supersededBy`). Default list and search `ground: memory` hide superseded items. `?superseded=1` shows the trail. `/site/memory` prints the link.

`POST /api/memory/forget` zeros strength and appends a bookkeep **AUDIT** (`who`, `what`, `why`, `related`) on these lanes only. Papers and `data/md` never decay.

This is **not** Agent Workflow Memory’s induce-then-reuse pipeline on WebArena [@agent-workflow-memory-2024]. AWM licenses the idea of a memory *apart from the transcript*. The operator workflows themselves stay in [CONTROL](/site/control) (SWE-agent ACI) [@swe-agent-2024].

Compiled-wiki designs (Karpathy, v2 decay, MemPalace, Metabolism) are compared on [Wiki memory](/site/wiki-memory). That page is the standing compare, not a second memory store.

## Lanes

- **User** — parks, preferences, “what the operator asked for.” Shorter half-life (days).
- **Project** — architecture decisions for this website. Longer half-life (weeks).

Do not put paper abstracts here. Put them in [Summaries](/site/summaries).

## Why

AWM licenses memory *apart from the transcript* [@agent-workflow-memory-2024]. This fork keeps that split: scratch lanes decay; wiki articles and papers do not. Applying FadeMem-style fade to `/site/*` would hide the pages the next park extends. See [Wiki memory](/site/wiki-memory).

## How

1. `GET /api/memory?lane=user` or `project`.
2. Add with `POST /api/memory`. Corrections use `supersedes`.
3. `POST /api/memory/touch` to reinforce.
4. `POST /api/memory/forget` zeros strength and writes `AUDIT`.

## Tools / MD paths

`GET/POST /api/memory`, `POST /api/memory/touch`, `POST /api/memory/forget`. Files: `data/memory/`, `backend/persist/memory.ts`, `data/md/memory.md`. Meta module: `module:memory`.

## Worked example

A parked “do not decay articles” correction should `supersede` any older note that said otherwise. Default GET hides the old id; `?superseded=1` still shows the trail. The [Wiki memory](/site/wiki-memory) page is encyclopedia and does not enter this log.
