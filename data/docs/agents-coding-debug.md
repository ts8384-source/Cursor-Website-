---
title: Debugging and code collection
slug: agents-coding-debug
id: page:agents-coding-debug
type: page
nav: Debug and collection
order: 2
parent: page:agents-coding
gist: Collect traces and lessons from the lab. On-demand MGM is a hired bouncer. Human check before merge.
summaryShort: Debug, lessons, hire MGM
summaryLong: Nested under Coding. How we debug, keep comparative lessons, arm MGM only when the operator says hire, and never auto-merge a lab.
tags:
  - agents
  - coding
  - debug
  - mgm
related:
  - page:agents-coding
  - page:agents-coding-generate
  - page:sandbox
  - page:control
  - page:implement
  - diagram:agents-coding-debug
updated: 2026-09-06
questions:
  - Where do lab lessons live?
  - Who arms MGM?
  - What happens before merge?
glossary:
  - term: hired bouncer
    def: MGM on demand. Not everyday mash. User starts the call.
  - term: lineage
    def: A lesson that points at a parent attempt so we compare, not replay blindly.
citations:
  - swe-agent-2024
  - knowrag-2026
  - arxiv-2505-16067
embeds:
  - diagrams:agents-coding-debug
---

# Debugging and code collection

Parent: [Coding](/site/agents-coding). Sibling: [Code generation](/site/agents-coding-generate).

This page is **debug + collect**, not write-the-feature.

## Debugging approach

1. Stay on the **lab** (`GET /api/sandbox`). Do not “fix main” from a stuck mash.
2. Keep the tape cheap: test output, assertion text, a lesson note. Experience-following warns that replaying “what worked” copies errors [@arxiv-2505-16067].
3. Comparative lineage: `POST /api/sandbox/lessons` or `POST /api/tripwires/lesson` with `parentId` of the last attempt. Store in `data/sandbox/lessons.json`.
4. If still stuck, **ask the operator** before suggesting MGM. Do not silently arm.

## On-demand MGM (bouncer)

- Default: `GET /api/tripwires` → `mgm.armed: false`.
- User starts it: park / “hire MGM” / `POST /api/tripwires/hire` `{ "phrase": "hire MGM" }`.
- Skill: `.cursor/skills/mgm-hire/SKILL.md`.
- Not a Mendel Gödel Machine. No scaffold self-rewrite. Never “production.”
- `POST /api/tripwires/disarm` when the hire window closes.

## Human check before merge

`POST /api/sandbox/propose` `{ "id" or "name", "note" }` sets **human-check-pending**. The API **does not merge**. Owner of Judgment is the operator [@swe-agent-2024].

## Tools

| Tool | Why |
| --- | --- |
| `GET /api/sandbox` | Active labs + lessons |
| `POST /api/sandbox/propose` | Review request. No merge |
| `POST /api/sandbox/lessons` | Lab notebook row |
| `GET /api/tripwires` | Armed? Implemented hook? Docker still false |
| `POST /api/tripwires/hire` | Explicit phrase only |
| `POST /api/tripwires/lesson` | Same lesson store, MGM window |

## Skills and MD

- `.cursor/skills/coding-agent/SKILL.md`
- `.cursor/skills/mgm-hire/SKILL.md`
- [Lab bench](/site/sandbox) · [CONTROL](/site/control)

Diagram: `diagram:agents-coding-debug`.
