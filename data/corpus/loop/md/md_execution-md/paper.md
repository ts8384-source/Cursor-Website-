# execution.md

---
title: How paper ideas are executed
slug: execution
nav: Execution
order: 11
gist: Each ingested paper maps to the files that actually implement its idea in this repo — or to an explicit non-implementation.
questions:
  - Which file is Living Papers here?
  - What did we refuse to build but still cite?
  - How do I add a new execution row?
glossary:
  - term: executedIn
    def: Curated { path, how } rows on a paper in the permanent DB.
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - swe-agent-2024
  - gorilla-2023
  - agent-workflow-memory-2024
  - vidorag-2025
---

# How paper ideas are executed

The board: **how the paper’s idea is executed.** The website is the purpose; include the code.

The table under this article is `GET /api/execution` (same rows as the permanent DB). It is curated in `backend/persist/paper-curated.ts` so a rebuild cannot invent a fake wiring. After you implement a new paper idea, add a row there, rebuild the DB, and cite the paper from the MD page.

## Examples already wired

| Idea | Execution |
| --- | --- |
| MD → web + list API [@living-papers-heer-2023] | `backend/persist/pages.ts`, `data/md/` |
| Gists and key questions [@paper-plain-august-2023] | Site rail + section gist toggles |
| Designed ACI [@swe-agent-2024] | `content/CONTROL.md`, `GET /api/tools` |
| Tool catalog [@gorilla-2023] | `backend/persist/tool-catalog.ts` |
| Memory apart from chat [@agent-workflow-memory-2024] | `backend/persist/memory.ts` (decay, not full AWM) |
| Diagram-native retrieve [@vidorag-2025] | **Cited only** — see [Gaps](/site/gaps) |

## Add a row

1. Implement the behavior in `frontend/` or `backend/`.
2. Append `executedIn` on that paper id in `paper-curated.ts`.
3. `POST /api/papers/db/rebuild`.
4. Optionally `POST /api/maps/fetch` so math/diagram queries find the new file.
