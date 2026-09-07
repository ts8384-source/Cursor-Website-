---
name: research-fetch
description: >-
  Fetching research hat: retrieve, cite, extract. Paper Lantern as a wiki verb
  on MD and GET /api/meta. Cite-or-fetch. Use when the user wants research-fetch,
  grounding, citations, or paper ingest — not generation, not coding.
---

# Research-fetch (this repo)

This is the **fetching** mash. It is not generate and not coding.

If the user said **“do the research”** and did not pick a hat, stop and ask: generate vs fetch. Then run only this skill when they pick fetch.

## Backbone

Paper Lantern is a **wiki verb**, not an MCP and not a second corpus.

1. Retrieve isolated grounds: `GET /api/search?q=` and/or `POST /api/ask`. Grounds stay labeled (`papers`, `code`, `scribble`, `cursor`, `md`, plus labeled `meta` and `graph`). **No cross-ground RRF.**
2. **Cite-or-fetch.** Every factual claim names a hit id. If the work is missing: say **not in DB** and `POST /api/papers/fetch` (OA only). Do not invent. Do not use an LLM as judge.
3. Sufficiency-then-stop. When the session already cites enough ids for the question, stop retrieving. Do not keep expanding.
4. Session cites only — list the ids you actually retrieved this turn. That list **is** the condensed return (`ids` + one gist). Optional: `POST /api/condensed`. Do not paste paper extracts into chat.
5. **Every fetch turn that does work writes a Lab-bench page.** Honor `depth` / `pageBudget` (architecture default **long**). Write the **fetch log** to `data/md/sandbox/<slug>.md` (`sandbox: true`, `sandboxLane: research`, `parent: page:sandbox`). **Do not leave the log only in chat.** Chat only points at `/site/<slug>`. A fetch log is session hits only. **Do not stop at one-liners.** Body is the long form; Paper Plain gists stay collapsed chrome. Expand `summaryLong`, `related`, citations, and graph neighbors that you actually opened. Missing work → not in DB. House style: `/docs/wiki-writing`. Promote only if the operator says promote to main (boot). How the nest works: `/docs/sandbox-how-the-lab-works`. Do **not** `POST /api/sandbox/trash` unless the operator asked to dump a lab page.

## Knowledge graph (shared retrieve surface)

The graph is **one** view over meta links. Do not build a mini-graph in chat.

1. `GET /api/graph` — full wiki graph.
2. `GET /api/graph/neighborhood?id=<meta-id>&hops=1` — neighbors of a page, paper, node, or module.
3. Search/ask already prepend labeled `ground: graph` hits. Use those ids, then **open the real page or paper** (`GET /api/pages/:slug`, `GET /api/papers/:id`, `/site/<slug>`).
4. Jump on the site is `/site/knowledge-graph#<id>` — same graph, focus only.

## Tools (no DOM scrape)

`GET /api/tools`. Typical fetch path:

| Step | Tool |
| --- | --- |
| Search | `GET /api/search?q=` |
| Ask + cite envelope | `POST /api/ask` |
| Meta record | `GET /api/meta/:id` |
| Graph neighborhood | `GET /api/graph/neighborhood?id=` |
| Page | `GET /api/pages/:slug` |
| Paper | `GET /api/papers/:id` / `GET /api/papers/db` |
| Missing OA | `POST /api/papers/fetch` `{ "arxiv" }` |

## Do not

- Do not draft speculative papers (that is generate).
- Do not implement repo changes (that is coding).
- Do not crawl the open web. OA fetch is allowlisted.
- Do not import community/GitHub skills. A4 lazy-loads **hand-authored** skills in this repo only (this file, drawing-loop, coding-agent, research-generate).
- Do not stand up Paper Lantern MCP.

Details: `/site/agents-fetch`, `content/CONTROL.md`.
