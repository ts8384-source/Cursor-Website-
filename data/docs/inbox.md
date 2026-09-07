---
title: iPad inbox and park
slug: inbox
nav: Inbox
order: 3
gist: The tldraw pad is the input surface. Park writes inbox files; agents read those, not a retyped prompt.
questions:
  - What files appear when I park?
  - Why is the canvas not the website?
  - How does PENDING interact with a turn?
  - How does a tied board from the site differ from Home scratch?
glossary:
  - term: inbox
    def: Repo folder that holds the latest canvas snapshot for the coding agent.
  - term: PENDING
    def: Flag file meaning a parked turn is waiting. Delete it when the turn is done.
citations:
  - webarena-2024
  - swe-agent-2024
---

# iPad inbox and park

## What

The pad host is `npm run dev` on port **5174**. `/` is tldraw. That surface is the interface; typed chat is optional. Site chrome must not fight ink, pan, or tool lock. After Park, agents write the site — including a Lab-bench child — from those files. Autosave never writes MD.

## Snapshot files

Park (HUD **Park for agent**) POSTS `/api/snapshot`. Typical writes:

| File | Role |
| --- | --- |
| `inbox/message.md` | Extracted labels, notes, shape list |
| `inbox/latest.png` | Raster of freehand ink |
| `inbox/latest.json` | Raw snapshot |
| `inbox/meta.json` | Timestamps, `hasPng`, `parked`, and tied-board ids when the pad was opened from the site |
| `inbox/PENDING` | Present only while a turn is parked |

If `PENDING` exists, the agent treats `message.md` plus `latest.png` as the user message, runs `.cursor/skills/drawing-loop/SKILL.md` (hybrid RAG, MD pages, paper DB, maps, memory, CONTROL), then **deletes `PENDING`**. Do not ask the user to retype what is already on the canvas.

**Tied boards (on-demand).** [Open on iPad](/site/tied-boards) has two buttons. **Clean** is a pristine empty board plus metadata. **With page/paper** stamps a frontend JPEG of the diagram, a frontend PDF of the article (server-rasters pages), or the existing paper PDF. The pad is not preloaded. Opening `/` is still today’s canvas until a live send writes `ACTIVE` and the open pad picks it up. The site button does not open a PC tab. Autosave may keep ink + `meta`; it never applies Markdown. Only Park starts an agent turn. On a stamped park, `latest.png` is ink on the figure.

**No live writeback.** Strokes do not rewrite articles. Communicate with the site by parking.

## Why the site is a different route

WebArena-style agents fail when the only interface is a giant interactive page [@webarena-2024]. The canvas stays an ink tool. The scholarly site is a **reading and control** surface with a tool API [@swe-agent-2024]. Mixing them (dumping settings onto home, hijacking scroll) violates the iPad bindings and handbook 8 / canvas `no-scroll-steal`.

## Ask from park

Park may trigger retrieve + write of `data/md/architecture.md`. That file is the **latest ask dump**. It is not the Living Papers TOC. Scholarly pages live beside it in `data/md/*.md` with frontmatter, plus `content/CONTROL.md`. New work still also lands under [Lab bench](/site/sandbox).

## How

1. Park → `inbox/PENDING` + message + PNG + meta.
2. Agent reads those files (this turn had no PENDING; `parked: false`).
3. Retrieve, write Lab-bench MD, update named encyclopedia pages, delete PENDING.

## Tools / MD paths

`POST /api/snapshot`, `GET /api/boards/pending`. Files: `inbox/`, `.cursor/skills/drawing-loop/SKILL.md`.

## Worked example

`inbox/meta.json` on this machine named tied board `board:dashboard-design-patterns-2022-mtqe2gjz-6dej` (`surface: stamped`, paper `dashboard-design-patterns-2022`). Without PENDING, that snapshot is context only — not a live site write.
