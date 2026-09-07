---
title: Code chunk metadata
slug: code-meta
id: page:code-meta
type: page
nav: Code meta
order: 13
gist: Comment-only @chunk blocks give each function the same metadata record as a page or paper.
summaryShort: @chunk comments on the meta bus
summaryLong: A language-aware comment parser extracts id, kind, tags, citations, implements, and summary without executing code. Seed writes data/meta/code.json. GET /api/meta?type=code. Forks enable extra roots in data/meta/code-scan.json.
tags:
  - code
  - meta
  - rag
related:
  - page:hybrid-rag
  - page:maps
  - module:code-meta
  - module:search
updated: 2026-09-06
questions:
  - What is the exact @chunk grammar?
  - How does a fork turn this on without a second metadata bus?
  - Which ids are already marked in this template?
glossary:
  - term: "@chunk"
    def: Comment fence. Parser-only. Runtime ignores it.
  - term: kind
    def: function, class, module, block, const, type, or method. Bus type stays code.
citations:
  - hm-rag-2025
  - living-papers-heer-2023
  - gorilla-2023
---

# Code chunk metadata

Future coding engines (outside this repo) need a **rigorous** way to hang metadata on a Python — or TypeScript — **chunk**, the same way Living Papers hangs metadata on an article [@living-papers-heer-2023]. The facts live in **comments**. A parser reads them. The process never executes the file to learn the id.

This is not a second catalog. Records are the shared bus: `data/meta/schema.json`, `GET /api/meta`, `GET /api/meta/:id` [@gorilla-2023]. Filter `?type=code`.

Convention for forks: `.cursor/skills/code-meta/SKILL.md`. Parser: `rag/code_meta.py`. Allowlist: `data/meta/code-scan.json`.

## Grammar

Ids look like `code:<project>.<symbol>`:

| Example | Meaning |
| --- | --- |
| `code:loop.hybrid_search` | Hybrid retrieve method in this template (`loop` domain) |
| `code:loop.tokenize` | Hyphen-aware tokenizer |
| `code:mysite.auth.verify_token` | A fork’s own project prefix |

Comment `type` is **kind**. Bus `type` is always `code`.

### Block

```python
# @chunk
# id: code:loop.hybrid_search
# type: function
# implements: page:hybrid-rag
# citations: [hm-rag-2025]
# tags: [retrieve, rrf]
# summary: RRF fuse of BM25 and dense
# @end
def hybrid_search(...):
    ...
```

`//` and `/* */` are accepted in `.ts` / `.js`.

### One-liner

```python
# @chunk id=code:loop.tokenize type=function tags=[tokenize]
def tokenize(text: str) -> list[str]:
    ...
```

Keys may use `=` or `:`. Lists may be `[a, b]` or `a, b`.

## Fields

Required: `id`. Recommended: kind (`type`), `summary`, `implements` or `related`, `citations` when a paper licenses the idea.

Invalid fences are **skipped**. Seed prints warnings and writes `data/meta/code-lint.json`. Ingest continues [@hm-rag-2025].

Unmarked code still lands in the **code** ground as whole files (existing seed). Heading / `def` / `class` fallback split is optional, not required for v1.

## How a fork enables it

1. Copy `rag/code_meta.py` and `.cursor/skills/code-meta/SKILL.md`.
2. Set `roots` in `data/meta/code-scan.json` (never `node_modules`).
3. Mark a small number of functions.
4. `python -m rag.cli seed` then `rebuild --grounds code`.
5. `GET /api/meta?type=code`.

Do not add another metadata file format for the same ids. Do not build a coding agent inside this template.
