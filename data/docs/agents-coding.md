---
title: Coding agent
slug: agents-coding
id: page:agents-coding
type: page
nav: Coding
order: 17
gist: Parent index. Nested Code generation vs Debugging and collection. A3 / A4. Lab until send-back. MGM hire only on demand.
summaryShort: Coding nest — generate vs debug
summaryLong: Live coding mash splits into generation (write on a lab) and debug/collection (lessons, hire MGM, human check). Do not become fetch.
tags:
  - agents
  - coding
related:
  - page:agents
  - page:agents-coding-generate
  - page:agents-coding-debug
  - page:control
  - page:code-meta
  - page:knowledge-graph
  - diagram:flagged-schemes-coding
  - diagram:agents-coding-generate
  - diagram:agents-coding-debug
updated: 2026-09-06
parent: page:agents
questions:
  - What is the turn budget?
  - When is MGM hired?
  - How does coding use the graph without becoming fetch?
glossary:
  - term: A3 PED
    def: Turn caps and no replay of expired tool dumps. Not Lantern.
  - term: A4
    def: Lazy load of hand-authored SKILL.md files in this repo only.
citations:
  - swe-agent-2024
  - gorilla-2023
  - living-papers-heer-2023
  - hm-rag-2025
---

# Coding agent

Skill: `.cursor/skills/coding-agent/SKILL.md`. Implement / test / edit. **Not** fetch-as-coder.

## Nested pages

| Child | Path | Job |
| --- | --- | --- |
| **Code generation** | [Code generation](/site/agents-coding-generate) | Methods we use to write new code, tools, sandbox fork, A3/A4 |
| **Debugging and collection** | [Debug and collection](/site/agents-coding-debug) | Lab tape, lesson lineage, hire MGM, human check before merge |

## What shipped

| Piece | Path |
| --- | --- |
| Skill | `.cursor/skills/coding-agent/SKILL.md` |
| ACI | `content/CONTROL.md`, `GET /api/tools` |
| Graph (read-only) | `GET /api/graph/neighborhood?id=page:…` then open the page |
| Tripwire | `GET /api/tripwires` — hire hook implemented; `armed: false` until `POST /api/tripwires/hire`. Sandbox fork is live (`GET /api/sandbox`). Never production. |
| Lab | `POST /api/sandbox/fork` — work in the lab until send-back. `POST /api/sandbox/propose` does not merge. |
| Tests | `backend/scholar.test.ts` graph + generate-seed + tripwires |

Coding reads **fetch results already on the wiki** (MD, paper DB, cited ids). If a technique is unnamed in the DB, say not in DB and offer fetch — do not wander OA as the coder [@swe-agent-2024].

## A3 turn-control (PED)

CONTROL turn budget: one focused change-set; re-call tools instead of pasting expired dumps; **no LLM history rewriter** (it can drop the cite you needed). AgentDiet remains **not in DB**.

## A4 lazy skills

The injector is “read the matching `.cursor/skills/*/SKILL.md`.” Shared with fetch and generate. **No community or GitHub skills.**

## MGM

Not in the default mash. Hire hook is **implemented**; evolution is not. **User starts the hire.** If stuck, ask the operator first — do not auto-arm. Never “production.” [Debug nest](/site/agents-coding-debug).

## Sandbox

Fork / lab first (`POST /api/sandbox/fork`). Work **in the lab** until the operator says send back. Human check (`propose`); no auto-merge. No Docker mandate. [Lab bench](/site/sandbox). [Generation nest](/site/agents-coding-generate). Queue: [To-implement](/site/implement).

## Insights from building

- The graph API made coding *faster to aim* (which page/paper ids exist) without turning coding into retrieve. Neighborhood hits are labeled `graph`; they are not fused into `code` ground ranks.
- Jump-to-node is a hash on `/site/knowledge-graph`. The React board always loads `GET /api/graph` once — focus is camera + outline, not a new layout graph.
- UI chrome had to go through the handbook first (9:1 labels, 13 widgets, 14 labeled graphics, 44px targets). The graph is literature chrome, not a neon dashboard.
- `hidden` frontmatter was the smallest way to retire flagged-schemes without 404s.

## Caveats

Do not import coding-scheme. If :5175 hangs, restart the backend only. Do not steal :5173. Diagram: `diagram:flagged-schemes-coding`.
