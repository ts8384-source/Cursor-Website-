---
name: coding-agent
description: >-
  Coding hat: implement, test, edit the repo. A3 PED turn-control. Implements
  against wiki/fetch results already on the page. Use when writing backend,
  frontend, tests, or MD chrome — not when fetching papers or generating drafts.
---

# Coding agent (this repo)

This is the **coding** mash. It is not fetch and not generate.

Coding implements against **fetch results already on the wiki** (pages, paper DB, graph ids). If a technique is missing, **cite-or-fetch** (say not in DB + offer `POST /api/papers/fetch`). Do not become the fetch agent and wander OA.

## A3 PED (turn-control / trajectory diet)

Keep the coding trajectory short. This is performance, not Lantern.

- Cap a coding turn: retrieve what you need, edit the module that broke, test that contract.
- Isolated helpers (Task / cloud subagents) return **ids + gist** only. Record via `POST /api/condensed`. Do not dump the child transcript.
- Do **not** replay expired tool dumps into the next step. Re-call `GET /api/tools` / the route if you need a fresh payload.
- Do **not** run an LLM “diet” that rewrites chat history and can drop cites. Prefer the live wiki + citations list.
- Turn budget (soft): one focused change-set per hat; if you stall, stop and report. See CONTROL.

## A4 lazy skills

Load **hand-authored** skills in this repo when the task names them (drawing-loop, research-fetch, research-generate, ui-hci, diagram-create, code-meta, mgm-hire). Shared injector = read the matching `SKILL.md`. **No community or GitHub skills.**

## Sandbox (fork / lab)

Headline is **fork / lab**, not Docker. `POST /api/sandbox/fork` `{ "name"? }` creates a branch + optional worktree from main/master. `GET /api/sandbox` lists labs. **Work in the lab** until the operator says send back. `POST /api/sandbox/propose` records human-check-pending. **Do not auto-merge. Do not force-push.**

**Website Lab bench (required):** write the coding **note** to `data/md/sandbox/` (`sandbox: true`, `sandboxLane: code`, `depth: long`). **Do not leave the writeup only in chat.** Chat only points at `/site/<slug>`. `POST /api/sandbox/promote` copies that MD after “promote to main” into **boot** — it does not merge the git lab. How-to: `/docs/sandbox-how-the-lab-works`. Work queue: `/site/implement`. Forker pages → `data/md/`. Framework explain → `data/docs/`. Trash: `POST /api/sandbox/trash` **only if the operator asked** to dump a lab page. Never encyclopedia. Untrusted skill/code stays out of the everyday process. `requireDocker: false`. A4 + fetch SSRF still apply.

## MGM tripwire (on-demand hire)

`GET /api/tripwires` — `mgm.armed` is false until `POST /api/tripwires/hire` `{ "phrase": "hire MGM" }`. The hire **hook** is implemented; evolution is not. Never “production.”

The **user** starts the call. If you are stuck, **ask the operator** whether to hire — do not auto-arm. Skill: `.cursor/skills/mgm-hire/SKILL.md`. Lessons: `POST /api/tripwires/lesson` with optional `parentId`. **Do not rewrite the scaffold.** See `/site/agents-coding-debug`.

## How to code here

1. Read `content/CONTROL.md` and the page you are implementing (`GET /api/pages/:slug`). Honor `depth` / `pageBudget` (architecture default **long**). Do not stop at one-liners. House style: `/docs/wiki-writing`. Boot vs doc bins: do not mix.
2. Optional: `GET /api/graph/neighborhood?id=page:<slug>` then open those real records.
3. Cite-or-fetch for techniques (`GET /api/search`). Missing → not in DB.
4. Match existing style (`backend/persist/*`, `backend/http/routes.ts`, `frontend/src/site/*`).
5. UI: `.cursor/skills/ui-hci/SKILL.md` + `refs/ui-rag` before React/CSS.
6. Diagrams: `.cursor/skills/diagram-create/SKILL.md`.
7. Test contracts: `npx tsx --test scholar.test.ts` in `backend/`. Browser-verify `/site` if chrome changed.
8. Ports: pad :5174, API :5175. Do not steal :5173.

Details: `/site/agents-coding` (generation: `/site/agents-coding-generate`; debug: `/site/agents-coding-debug`).
