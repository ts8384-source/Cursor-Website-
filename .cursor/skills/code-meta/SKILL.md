---
name: code-meta
description: >-
  Comment-block metadata on code chunks so ingest/RAG/agents treat functions
  like pages and papers. Use when marking Python/TS with @chunk, forking this
  template, or wiring code into GET /api/meta.
---

# Code chunk metadata (fork convention)

This is the **canonical** way future coding engines attach metadata to source.
Comments only. Never changes runtime. One bus: the same records as `GET /api/meta`.
Page records also expose `href`, `parent`, `nest` (`encyclopedia` | `sandbox` | `hidden`), `flags`, and computed `graphDegree`. Set `implements` / `related` on `@chunk` so degree is real.

Skill for forks: copy this file. Parser: `rag/code_meta.py`. Scan roots: `data/meta/code-scan.json`.

## Grammar

Ids: `code:<project-or-domain>.<symbol>` (dot or colon after the prefix). Examples: `code:loop.hybrid_search`, `code:loop.tokenize`, `code:mysite.auth.verify_token`.

Comment `type` is the **kind** (`function` | `class` | `module` | `block` | `const` | `type` | `method`). The metadata-bus `type` is always `code`.

### Block (preferred)

Python `#`, TypeScript/JavaScript `//` or `/* */`:

```python
# @chunk
# id: code:loop.hybrid_search
# type: function
# title: Hybrid search
# implements: page:hybrid-rag
# derived_from: []
# citations: [hm-rag-2025]
# related: [module:search]
# tags: [retrieve, rrf]
# summary: RRF fuse of BM25 and dense
# summary_long: Optional longer prose for the panel.
# updated: 2026-09-06
# @end
def hybrid_search(...):
    ...
```

Same keys, `//` or `/* * /` fences, in `.ts` / `.js`.

### One-liner (tiny helpers)

```python
# @chunk id=code:loop.tokenize type=function tags=[tokenize] implements=page:hybrid-rag
def tokenize(text: str) -> list[str]:
    ...
```

`key=value` or `key:value` on the `@chunk` line. Lists: `[a, b]` or `a, b`.

## Field map → bus

| Comment | `GET /api/meta` |
| --- | --- |
| `id` | `id` (must match `^code:[A-Za-z0-9][A-Za-z0-9._:-]*$`) |
| _(implicit)_ | `type`: `code` |
| `title` / last id segment | `title` |
| `summary` / `summary_long` | `summary.short` / `summary.long` |
| `tags` | `tags` (kind is prepended) |
| `citations` | `citations` + `paperIds` |
| `related` | `related` (also unions `implements`, `derived_from`) |
| `implements` | `implements` (optional schema field) |
| `derived_from` | `derived_from` |
| `updated` | `updated` |
| `type` (kind) | `kind` |
| source path | `path` |
| — | `glossary`: `[]` |

Invalid blocks: skip + lint warning (`data/meta/code-lint.json`). Ingest does not crash.

Unmarked `def` / `class` / headings: fallback chunking is **SHOULD**, not required. v1 indexes whole allowlisted files as today; only `@chunk` upserts bus records.

## Enable in a fork

1. Keep `rag/code_meta.py` and this skill.
2. Edit `data/meta/code-scan.json`: add repo-relative `roots` (e.g. `src`, `lib`). Do **not** add `node_modules`.
3. Mark a few functions with `@chunk`. Do not annotate every helper.
4. `python -m rag.cli seed` then `python -m rag.cli rebuild --grounds code`.
5. Confirm `GET /api/meta?type=code` and `GET /api/meta/code:loop.hybrid_search`.

Do not invent a second YAML/JSON sidecar for the same facts. Do not execute comments.
