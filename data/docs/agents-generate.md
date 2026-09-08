---
title: Generation agent
slug: agents-generate
id: page:agents-generate
type: page
nav: Generate
order: 18
gist: Draft from a random or chosen in-DB paperId. No crawl. Different judge. Hand off to fetch to ground.
summaryShort: In-DB seed only
summaryLong: Live generate mash. POST /api/generate/seed returns a catalog paper that exists. Draft MD citing that id. 404 if not in DB. No Caesar crawl. Judge is cite-or-fetch, tests, or human.
tags:
  - agents
  - generate
related:
  - page:agents
  - page:agents-fetch
  - page:papers
  - diagram:flagged-schemes-generate
updated: 2026-09-06
parent: page:agents
questions:
  - What if the chosen paperId is missing?
  - Who judges the draft?
  - Why not crawl?
glossary:
  - term: generate seed
    def: An in-DB paperId plus gist from POST /api/generate/seed.
citations:
  - living-papers-heer-2023
  - arxiv-2605-18661
  - arxiv-2603-15914
  - swe-agent-2024
embeds:
  - diagrams:flagged-schemes-generate
---

# Generation agent

Skill: `.cursor/skills/research-generate/SKILL.md`. Ideate / diverge / draft. **Not** retrieve-and-cite.

Creation-phase split is in this paper DB [@arxiv-2605-18661]. The Agentic Researcher guide is cited as files-over-apps context, not a crew to import [@arxiv-2603-15914].

## What shipped

| Piece | Path |
| --- | --- |
| Skill | `.cursor/skills/research-generate/SKILL.md` |
| Seed API | `POST /api/generate/seed` `{ "paperId"?: "…" }` |
| Persist | `backend/persist/generate-seed.ts` |
| Drawing-loop | clarify generate vs fetch; generate must seed first |

`generate-seed` reads `loadPaperDb()`. Random pick if no id. Chosen id that is missing → **404 / not in DB**. No URL fetch. No SSRF. Caesar crawl stays out.

## How a generate turn runs

1. Clarify if needed.
2. `POST /api/generate/seed`.
3. Draft to `data/md/sandbox/` (`sandboxLane: idea` or `research`) citing that `paperId` and any **retrieved** ids only. Chat only points at `/site/<slug>`.
4. Different judge: cite-or-fetch, tests, or the human — not same-model self-review.
5. Need grounding? Hand off to [fetch](/site/agents-fetch) on a later turn.

## Insights from building

- Random-in-DB is the whole “force remote combination” we can do honestly. A model-picked analogical paper would invent.
- Reusing `loadPaperRecord` kept generate from growing a second catalog.
- Seed gist is the paper DB summary (curated or extracted). It is not a generated abstract.

## Caveats

Serendipity / combinatorial-creativity / CycleReviewer papers are **not in DB**. Caesar **is** in DB as `arxiv-2604-20855` (abstract only) — still **do not run** the crawl or quote extra numbers from outside that extract. Diagram: `diagram:flagged-schemes-generate`.
