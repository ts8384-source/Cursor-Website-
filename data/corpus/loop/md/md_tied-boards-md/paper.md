# tied-boards.md

---
title: Tied iPad boards
slug: tied-boards
id: page:tied-boards
nav: Tied boards
order: 12
tags:
  - ipad
  - meta
  - park
related:
  - page:inbox
  - page:control
  - module:diagrams
summaryShort: Clean or stamped on-demand pad board
summaryLong: Two website buttons. Clean sends an empty whiteboard tied only by metadata to the already-open iPad pad. Stamped writes a PNG or paper page images under data/boards/<id>/ and the live pad stamps them. One click, one board. The PC site stays on the article. Park still goes through the agent.
gist: Open on iPad (clean) or (with page/paper). One click, one board. No dump.
questions:
  - How do I scribble on a paper or diagram from the site?
  - What metadata does the pad keep?
  - Why does autosave not change Markdown?
glossary:
  - term: tied board
    def: A tldraw persistence key plus metadata (id, source type, page/paper ids) created from the site and received by the open pad.
  - term: Open on iPad
    def: Two site controls. They POST a board and write ACTIVE for the live LAN pad. They do not open a PC tab. Clean is empty + ids. Stamped places artifact images.
citations:
  - living-papers-heer-2023
  - swe-agent-2024
  - paper-plain-august-2023
---

# Tied iPad boards

The parked canvas asked for a **page/paper tied board for the iPad**, sent from a website button. That is **on-demand**. The pad at `/` stays the same draw / scratch / lasso / park surface. Nothing is auto-ingested. Papers, diagrams, and math are **not** pushed at startup.

## From the site

Two 44px buttons (handbook 9:1, 13:1) sit on that article, paper row, diagram, or math term.

- **Open on iPad (clean)** — `POST /api/boards` `{ surface: "clean" }`. Empty tldraw board. Metadata only (`pageId`, `paperIds`, `sourceType`). Park tells the agent what you were annotating; the picture is not on the pad.
- **Open on iPad (with page/paper)** — `{ surface: "stamped" }`. After a 4s-capped frontend capture, the site POSTs `{ imageBase64 }` (on-screen React Flow JPEG) or `{ pdfBase64 }` (article PDF). Papers skip capture and use the local PDF. The server **prefers the client JPEG/PDF** and only then falls back to the dummy SVG raster. The pad switches to that new `persistenceKey`, then stamps **only if the live editor is that board** (`activeBoardId === boardId`). It never writes image shapes onto Home or a previous whiteboard.

One click → **that** source only → `data/boards/ACTIVE` + `GET /api/boards/pending`. Press again for another artifact. There is no “send everything” path.

The PC site **stays on the article** and shows **Sent — open the pad if it doesn’t appear** plus the Tailscale URL (handbook 9:1, 13:1). It does not `window.open` or navigate to `/?board=`. The iPad tab already on `:5174` (Tailscale `http://100.107.135.79:5174/`) polls `GET /api/boards/pending` every 1.5s (that poll marks the pad seen) and also POSTs heartbeat. When a new ACTIVE id appears, it switches `persistenceKey` first and stamps images only on **that** remounted store. A send always writes ACTIVE even if Safari is not polling yet. Old stored boards stay untouched.

## On the pad

The canvas stays pencil-first. A 44px HUD chip names the source and whether the board is **clean** or **on picture**. Chrome stays out of the ink (iPad bindings: 44px, no-scroll-steal on the draw surface).

## Park, not autosave

Autosave may snapshot ink and the same `meta` into `inbox/`. That does **not** mutate `data/md` or pages. **Park for agent** sets `PENDING`. The drawing-loop skill reads the tie (`inbox/meta.json`) and then writes Markdown, papers, or diagrams.

```
id, type=board, related, citations, boardKey, sourceSlug, sourceType, pageId, paperIds
```
