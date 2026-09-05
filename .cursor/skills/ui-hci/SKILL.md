---
name: ui-hci
description: >-
  Forces retrieval from the local HHS/GSA usability handbook RAG before any
  user-interface work. Use when changing UI, UX, React/tsx chrome, CSS, layout,
  typography, interaction, explorer, HUD, lasso popup, canvas chrome, iPad or
  Apple Pencil hit targets, ink tools, or visual styling in this repo.
---

# UI / HCI (handbook first)

Pack: `packs/ui-hci/` (`README.md`, `howto.md`). **You must retrieve from the RAG before UI edits.** Do not slurp the 22MB PDF by default.

## Before any UI change

1. Read `packs/ui-hci/manifest.json`. Then read the bindings file it names (`bindings`, relative to that pack). If `bindings` is empty, use `packs/ui-hci/bindings.json` if present. Apply those rules only — do not import another project’s overlay.
2. Run `python refs/ui-rag/retrieve.py "<task keywords>"` (e.g. `buttons feedback scrolling labels`).
3. Read the top matching chapter markdown under `refs/ui-rag/` (and `index.json` `topics` if retrieve is unavailable).
4. Apply handbook guidelines **and** the bindings. Quote guideline ids (e.g. `13:1`) when they steer a decision.
5. Open `refs/ui-hci-survey.pdf` only if a chunk is missing, garbled, or you need a figure. Page map: `index.json`.

Corpus: `refs/ui-rag/README.md`. Handbook is public domain (no HHS/GSA seals).

## After edits

Verify the changed UI path: targets, contrast, labels, and that existing interaction still works.
