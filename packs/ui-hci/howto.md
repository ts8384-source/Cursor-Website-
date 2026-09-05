# How to use the UI / HCI pack

## Retrieve (normal path)

From the **repo root** (same layout as this project):

```text
python refs/ui-rag/retrieve.py "buttons feedback scrolling labels"
```

The script prints ranked `refs/ui-rag/chXX-*.md` paths and matching guideline titles. **Read those files** (and `index.json` `topics` if retrieve fails). Quote guideline ids (e.g. `13:1`) when they steer a decision.

No network, no embeddings. `retrieve.py` scores `index.json` topics and titles.

## When to open the PDF

Keep `refs/ui-hci-survey.pdf` in the **source** repo. Other projects do not need it if `refs/ui-rag/` is already built.

Open the PDF only if:

- a chunk is missing or garbled,
- you need a figure,
- you are rebuilding RAG (`python refs/ui-rag/_build.py` with local PyMuPDF).

Page map: `refs/ui-rag/index.json` (`pdf_pages` / `pdf_page` on chunks).

## Project overlay (bindings)

Core skill + RAG are generic. Extra product rules go in a JSON overlay:

1. Copy `bindings.schema.json` (already in this pack).
2. Add `packs/ui-hci/bindings.<project>.json` with `project` and `rules` (`id` + `text`).
3. Set `manifest.json` `"bindings"` to that filename (relative to this pack).
4. Do **not** leave `bindings.ipad-cursor.json` as the active overlay unless this is the iPad-Cursor app.

Agents discover the overlay by reading `packs/ui-hci/manifest.json` → `bindings`. If that field is empty, they look for `packs/ui-hci/bindings.json`.

This repo’s overlay: `bindings.ipad-cursor.json` (Pencil, ~44px targets, no canvas scroll-steal, GoodNotes-like ink, scratch Home).

## Dated handbook

Treat Flash / 800×600 as historical. Keep labeling, grouping, feedback, errors, information architecture, and testing. Project overlays may list extra `ignoreFromHandbook` strings.
