# workbench-mgm.md

---
title: "Temporary — MGM on-demand"
slug: workbench-mgm
id: page:workbench-mgm
type: page
nav: MGM (temp)
order: 23
parent: page:workbench
gist: Hire hook implemented. MGM is a separate hired bouncer, not everyday mash. User starts the call. If stuck, ask the operator. Never “production.” No evolution loop.
summaryShort: Hire MGM only when asked
summaryLong: Temporary child of Architect’s Workbench. GET /api/tripwires.mgm.armed stays false until POST /api/tripwires/hire. Operators who stall must ask, not auto-arm. No Mendel Gödel Machine evolution and no scaffold self-rewrite.
tags:
  - temporary
  - mgm
  - agents
  - tripwires
related:
  - page:workbench
  - page:implement
  - page:workbench-round3
  - page:workbench-sandbox
  - page:agents-coding
  - page:agents
  - page:control
  - page:gaps
  - diagram:workbench-ia
updated: 2026-09-06
questions:
  - Who is allowed to arm MGM?
  - What happens if the coding hat is stuck?
  - Which score numbers are actually in the paper DB?
glossary:
  - term: MGM
    def: Workbench / author shorthand for a hired bouncer. Hire hook is implemented. Evolution is not.
  - term: hired bouncer
    def: A separate mash that is not coding, not fetch, and not generate. It does not sit in the everyday park.
  - term: armed
    def: GET /api/tripwires mgm.armed. Stays false until POST /api/tripwires/hire with an explicit phrase. Never production.
citations:
  - knowrag-2026
  - swe-agent-2024
  - arxiv-2602-06875
  - arxiv-2505-16067
---

# Temporary — MGM on-demand

**This section is temporary.** The **on-demand bouncer** framing stays. The hire hook is **implemented**; evolution is not. Do **not** call this production.

MGM is **not** in the everyday coding mash. It is a **separate hired bouncer**. On demand. Not always-on. Seeded on [To-implement](/site/implement).

Parent: [Architect’s Workbench](/site/workbench).

## Strict boundary

| Everyday park | MGM call |
| --- | --- |
| One agent, one hat (coding / fetch / generate) | A different mash, only if hired |
| A3 turn-control, tests, cite-or-fetch | External-ish check they wanted instead of self-grade |
| Writes the wiki | Must not rewrite the scaffold “to get a higher score” |

Workbench wanted “no same-model self-review.” We already agree: `grounding.unsupported` is token overlap, not a judge [@knowrag-2026]. Hiring MGM to **evolve the agent** (Mendel Gödel Machine loop, scaffold self-rewrite) is a different product. **Do not implement evolution.** The hire flag is the will-implement slice.

## Who starts the call

1. **User starts the MGM call.** Phrase like “hire MGM” / “arm the bouncer” / park. Until then `GET /api/tripwires` → `mgm.armed: false`.
2. **If stuck for a while**, the operator **asks the operator** — “maybe use MGM?” — so the flag is not forgotten. **Do not auto-arm.**
3. There is **no** always-on watcher that flips `armed` after N failures.
4. Arm: `POST /api/tripwires/hire` `{ "phrase": "hire MGM" }`. Other phrases are refused. Disarm: `POST /api/tripwires/disarm`. Lessons: `POST /api/tripwires/lesson` `{ note, parentId? }`.

Skill: `.cursor/skills/mgm-hire/SKILL.md`.

## Author-only numbers — **not in DB**

Workbench / coworker copy mentioned score lifts (68.3→78.3, HLLM, MGM). Those figures are **their claim**. They are **not in `GET /api/papers` / `GET /api/papers/db`**. Cite-or-fetch: do not repeat them as facts. Offer `POST /api/papers/fetch` if an OA id appears.

What **is** in DB and nearby:

- TraceCoder abstract reports a Pass@1 relative lift on **their** debug crew — not an MGM hire [@arxiv-2602-06875].
- Experience-following warns that replaying “what worked” copies errors [@arxiv-2505-16067].
- KnowRAG’s coverage-gap result is our **fetch** rule, not a bouncer score [@knowrag-2026].

## What “on-demand” means in CONTROL

Skill paths: `.cursor/skills/coding-agent/SKILL.md`, `.cursor/skills/drawing-loop/SKILL.md`.

- Default mash: **do not run MGM.**
- `mgm.userStartsCall: true`
- `mgm.askUserBeforeSuggesting: true`
- No Mendel Gödel Machine evolution loop.
- No scaffold self-rewrite.

SWE-agent still applies: keep the ACI small [@swe-agent-2024]. A second always-on evolution agent is the opposite.

## See also

- [Coding](/site/agents-coding)
- [Sandbox](/site/workbench-sandbox) — isolation is not MGM
- [Gaps](/site/gaps)
