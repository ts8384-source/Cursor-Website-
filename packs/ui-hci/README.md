# UI / HCI pack (handbook + skill)

Local HHS/GSA *Research-Based Web Design & Usability Guidelines* (2006, public domain) plus a short Cursor skill that **retrieves from the RAG before any UI edit**. This folder is the handoff. It is not an npm package.

iPad / Pencil / tldraw rules are **not** part of the core. They live in `bindings.ipad-cursor.json`. Other repos add `bindings.<project>.json` and point `manifest.json` at it.

## Copy into another repo

Keep the same relative paths (or update `manifest.json` if you move them).

1. Copy `.cursor/skills/ui-hci/SKILL.md` to the same path in the new repo.
2. Copy the whole `refs/ui-rag/` folder (chunks, `index.json`, `retrieve.py`).
3. Copy this folder: `packs/ui-hci/` (`manifest.json`, `howto.md`, `bindings.schema.json`, this README).
4. **Do not** copy `bindings.ipad-cursor.json` unless you want those rules. Write `packs/ui-hci/bindings.<your-project>.json` and set `manifest.json` `"bindings"` to that filename.
5. Skip `refs/ui-hci-survey.pdf` (~22MB) if RAG is already built. Copy the PDF only for figures or to rebuild chunks (`_build.py`).
6. Tell agents: before UI work, read `packs/ui-hci/manifest.json`, then the bindings file it names, then run retrieve (see skill).

License: handbook text is public domain (17 U.S.C. § 105). Do not reuse HHS/GSA seals.

## Agents (before UI edits)

See `.cursor/skills/ui-hci/SKILL.md`. Short version: **manifest → bindings → `python refs/ui-rag/retrieve.py "…"` → read listed chapter md**. Do not slurp the PDF by default.

More detail: `howto.md`.
