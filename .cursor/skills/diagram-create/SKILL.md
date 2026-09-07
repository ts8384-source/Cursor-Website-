---
name: diagram-create
description: >-
  Author diagram nodes with shared metadata. Use when creating or editing
  data/diagrams JSON, React Flow nodes, /site/diagrams, or connecting a node
  to a page or paper by id.
---

# Diagram create (metadata on every node)

When creating nodes, always attach metadata; canvas stays **minimal**; full summary lives in meta + panel below; connect papers/pages via ids.

## Rules

1. Write `data/diagrams/<id>.json`. Each node keeps a short `label` only on the canvas.
2. Always set `meta`:

```json
{
  "summaryShort": "four to eight words",
  "summaryLong": "Full prose for the panel and GET /api/meta.",
  "pageId": "page:hybrid-rag",
  "paperIds": ["colpali-2024", "living-papers-heer-2023"],
  "related": ["page:diagrams", "module:search"]
}
```

3. Node record id is `node:<diagramId>:<nodeId>` (example: `node:hybrid-rag-loop:hybrid`).
4. Do **not** put `summaryLong` in the React Flow node. Optional expand is title + `summaryShort` (4–8 words). Click opens the panel **below** the graph.
5. Connectivity is ids: `pageId` → `/site/<slug>`, `paperIds` → `/site/papers#<id>`. Confirm with `GET /api/meta/:id`.
6. Hybrid RAG node must explain isolated grounds / no cross-RRF and link `page:hybrid-rag` plus ColPali / Living Papers if those paper ids exist.
7. After edits: `GET /api/diagrams` and `GET /api/meta?type=node`.

## Regions (hybrid local-site loop only)

On **hybrid-rag-loop**, the only partitions are three high-level layers (`regions` / `blankets` — same schema). Every node belongs to one of them. Do not push leftover clusters or theory-heavy labels.

```json
{
  "id": "ipad",
  "label": "iPad",
  "nodeIds": ["scribble"],
  "source": "user"
}
```

- **iPad** — scribble / inbox / pad / pencil
- **website** — site / wiki / vis / frontend
- **local PC** — everything else on this loop
- API (`backend/persist/blankets.ts`) fills leftovers into those three. User JSON membership wins; unclaimed hybrid nodes still join one of the three (default **local PC**).
- Do not invent a fourth region. Do **not** attach these layers to RSNN or other non-loop graphs.
- Visual: one dotted overlay per layer, labeled “iPad”, “local PC”, “website”. Keep nodes small.

Authors may override membership. Omit `regions` on the hybrid loop to accept inference.

## Directed edges (no fat terminal arrows)

Do **not** put a large closed arrowhead on the target node (`markerEnd` ArrowClosed ~22×22). That cap sits on the node pad, occludes the box, and reads as a blob.

Holten & van Wijk (EuroVis 2009): **mid-edge cues** beat fat terminal arrowheads. This site does **not** use a Holten taper ribbon (width falling off toward the target). That taper read as a sharp / weird half-stroke.

Default encoding in `GraphCanvas` / `DirectedEdge`:

- Uniform skinny stroke (same width source → target). No taper.
- Small pointy open chevrons along the path at ~**72px** spacing (half the old ~36px density), inset from both ends so they sit in **open space**, not on the node.
- One neon `#00e8ff` on stroke, chevrons, and a **directed freshen** (dash-offset traveling along the edge, always on). No rust/black contrast, color key, dual travelers, pulses, or Animate/Show buttons. Honor `prefers-reduced-motion` (static neon + chevrons only).
- Treat as feedback only when the edge is explicit: `kind` is `feedback`, `stop-grad`, `loop`, `back`, or `backward`; `direction` is backward/feedback/reverse/loop; `reversed: true`; or the **label** is loop/back/feedback. Do **not** infer from rank or “looks like it goes left.” Feedback still uses a step route.

Keep marks small and thin. Do not grow the region overlays to dodge arrows.

## If a paper exists, fetch into paper DB

When a node or its `pageId` cites a catalog id or arXiv id, upsert it into the permanent paper DB (the parked “PowerPoint database”).

1. Collect `meta.paperIds`, arXiv-shaped strings, and the linked page’s `citations`.
2. Skip ids already in `GET /api/papers` / `GET /api/papers/db`.
3. Otherwise `POST /api/papers/fetch` with `{ "arxiv": "…" }` (or `{ "id": "…" }` / `{ "url": "…" }`). OA only.
4. Confirm `GET /api/papers/db`. Park/ask (`POST /api/ask`) runs the same ensure after writing the diagram.

Schema: `data/meta/schema.json`. Park loop: [drawing-loop](../drawing-loop/SKILL.md).
