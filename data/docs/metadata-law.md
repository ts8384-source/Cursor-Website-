---
title: Metadata is the index
slug: metadata-law
id: page:metadata-law
nav: Metadata law
order: 6
depth: long
pageBudget: 800
gist: Every grouping in the framework is a field on the object, read at runtime. Never a list of ids kept by hand in a component.
summaryShort: Categorize with metadata, not hardcoded lists
summaryLong: Pages, papers, code chunks and diagrams all carry machine-readable metadata on disk and expose it over GET /api/*. When a new category is needed, add a field with a derivation default, parse it into the record, and let the UI group by reading it. A component may own labels and order; it must never own membership.
tags:
  - docs
  - metadata
  - schema
related:
  - page:docs-home
  - page:control
  - page:code-meta
citations:
  - living-papers-heer-2023
  - gorilla-2023
questions:
  - Where does metadata live for each kind of object?
  - How do I add a new category without rewriting every file?
  - Why not just keep the list in the component?
glossary:
  - term: Derivation default
    def: A rule that classifies objects with no explicit field, so a new category needs no migration.
  - term: Shelf
    def: A paper's top-level grouping, from its collection field — framework or project.
---

# Metadata scheme

The standing law is in [Control](/docs/control): **every grouping is metadata, read at runtime.**
This page is the reference for what that means in practice.

## Why not a list in the component

A hardcoded list of ids is a second source of truth. It goes stale the moment an object is added
without editing it, and an agent cannot discover it through the API — which is the whole point of
publishing a machine-readable catalog rather than expecting a client to scrape the page
[@gorilla-2023]. One source on disk, many views, is the Living Papers position applied to operations
[@living-papers-heer-2023].

## Where metadata lives

| Object | On disk | Format | API |
| --- | --- | --- | --- |
| Page (boot) | `data/md/` | YAML frontmatter | `GET /api/pages?bin=boot` |
| Page (doc) | `data/docs/` | YAML frontmatter | `GET /api/pages?bin=doc` |
| Paper | `data/papers/<id>.md` | `- **key:** value` header | `GET /api/papers` |
| Code chunk | source comments | `# @chunk` fence | `GET /api/meta?type=code` |
| Diagram node | `data/diagrams/*.json` | JSON | `GET /api/diagrams` |

## Adding a category

1. **Add a field** named for the question it answers. Do not stretch an existing field past its
   meaning.
2. **Give it a derivation default** so everything already on disk classifies without a migration.
   An explicit value only overrules the default.
3. **Parse it** into the record type so it reaches the API. An unparsed header key is decoration:
   `local_pdf` has been written into every paper file for a long time and still reaches no client,
   because nothing parses it.
4. **Group by reading the field.** The component owns labels and display order. It must not own
   membership.

## Worked example — paper shelves

Papers needed splitting into what built the framework and what a project fetched. No file was
rewritten to do it.

The field is `collection`, either `framework` or `project`. The derivation default reads the older
`list` field, so all 72 papers on disk classified themselves the moment the field existed:

```
- **id:** arxiv-2601-08079
- **list:** fetched
- **collection:** project
```

| `list` | Derived `collection` |
| --- | --- |
| `frontend` | framework |
| `backend` | framework |
| anything else | project |

Newly fetched papers get `collection: project` written explicitly. To move one paper onto the
framework shelf, set its header line — do not touch the catalog component.

## Worked example — deep dives

A child page folds into its parent topic as an in-page section by default. Some children should not:
a single-paper study, an experiment log, appendix material. The field is `subpage`, default false:

```yaml
parent: page:<topic>
subpage: true
```

The topic lists those children under **Deep dives** and they keep their own route. The left rail
lists the documents a page is stitched from, which is the same metadata — the page nest — read for
navigation instead of for grouping.

## Worked example — live widgets on a page

Some pages carry a live board rather than only prose: the diagram canvas, the paper catalog, the
implement queue, a math-render comparison. The page names what it mounts, in `embeds`:

```yaml
embeds:
  - diagrams:wiki-memory
  - math-compare
```

A name is a registry key, optionally followed by `:argument`. `frontend/src/site/embeds.tsx` maps
each key to a renderer — `diagrams:<prefix>` shows only diagrams whose id starts with the prefix,
`papers` mounts the catalog, and so on. The registry knows how to draw a board; it never knows which
page wanted one. An unknown name is skipped with a console warning, so a typo costs you a widget, not
the page.

This replaced a ladder of 26 `slug === '...'` checks inside `SiteApp.tsx`. That ladder was membership
held in a component, and it failed exactly the way this rule predicts: the doc page added at
this page silently inherited an empty diagram board, because the framework's **Metadata bus** page
already owned the slug `metadata` and the ladder was written for that one.

The same move applies one level down. A diagram's caption is `note` in its own JSON, not a
prefix-matched string in `DiagramsBoard.tsx`.

## Page fields

`parent`, `children`, `highlight`, `sandbox`, `sandboxLane`, `sandboxFor`, `bin`, `project`,
`depth`, `pageBudget`, `tags`, `related`, `citations`, `questions`, `glossary`, `hidden`, `subpage`,
`embeds`, `nav`, `order`, `gist`, `summaryShort`, `summaryLong`, `scrolly`.

Extend this set rather than inventing a parallel scheme beside it.
