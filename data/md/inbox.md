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

The pad host is `npm run dev` on port **5174**. `/` is tldraw. That surface is the interface; typed chat is optional. Site chrome must not fight ink, pan, or tool lock.

## Snapshot files

Park (HUD **Park for agent**) POSTS `/api/snapshot`. Typical writes:

| File | Role |
| --- | --- |
| `inbox/message.md` | Extracted labels, notes, shape list |
| `inbox/latest.png` | Raster of freehand ink |
| `inbox/latest.json` | Raw snapshot |
| `inbox/meta.json` | Timestamps, `hasPng`, `parked` |
| `inbox/PENDING` | Present only while a turn is parked |

If `PENDING` exists, the agent treats `message.md` plus `latest.png` as the user message, does the work, then **deletes `PENDING`**. Do not ask the user to retype what is already on the canvas.

## Why the site is a different route

WebArena-style agents fail when the only interface is a giant interactive page [@webarena-2024]. The canvas stays an ink tool. The scholarly site is a **reading and control** surface with a tool API [@swe-agent-2024]. Mixing them (dumping settings onto home, hijacking scroll) violates the iPad bindings and handbook 8 / canvas `no-scroll-steal`.

## Ask from park

Park may trigger retrieve + write of `data/md/architecture.md`. That file is the **latest ask dump**. It is not the Living Papers TOC. Scholarly pages live beside it in `data/md/*.md` with frontmatter, plus `content/CONTROL.md`.
