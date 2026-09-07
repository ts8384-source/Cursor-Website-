---
title: Fork bins — boot wiki vs doc wiki
slug: sandbox-fork-bins
id: page:sandbox-fork-bins
nav: Fork bins
order: 2
parent: page:sandbox
sandbox: true
sandboxLane: code
depth: long
pageBudget: 850
gist: This turn split the framework into two disk bins. Boot is the user wiki. Doc is a disposable explain site.
summaryShort: Two folders, two sites
summaryLong: Forkers get data/md (boot) and data/docs (doc). Deleting data/docs removes the framework manual with zero effect on the boot wiki. Lab notes stay in data/md/sandbox/.
tags:
  - sandbox
  - ia
  - fork
related:
  - page:sandbox
  - page:tutorial
  - page:overview
  - page:summary
  - page:docs-home
  - page:control
citations:
  - living-papers-heer-2023
  - gorilla-2023
  - dashboard-design-patterns-2022
  - paper-plain-august-2023
questions:
  - Which folder is the one-click delete?
  - Where do new forker pages go?
  - What happens if data/docs is missing?
glossary:
  - term: boot
    def: User project wiki. data/md. Routes under /site.
  - term: doc
    def: Framework explain wiki. data/docs. Routes under /docs.
  - term: Remove doc wiki
    def: POST /api/docs/remove after Are you sure. Deletes data/docs.
---

# Fork bins — boot wiki vs doc wiki

This Lab-bench note is the turn record. Chat only points here. The product change is on disk: two trees, two sites, one disposable folder [@living-papers-heer-2023].

Handbook **13:2** (label the button), **13:11** (anticipate a destructive error), **7:1** (give a nav option that can disappear), **5:1** (each site has a homepage). The dump control is named **Remove doc wiki**, not an icon-only trash.

## What

A fork is a **framework**. It must not ship the current house encyclopedia as if it were the user’s project.

1. **Boot wiki** — `data/md/` → `/site/...`. Empty-ish starter: Overview, Tutorial, empty Summary, Lab bench, To-implement. New forker pages land here.
2. **Doc wiki** — `data/docs/` → `/docs/...`. Framework explain: Control (from `content/CONTROL.md` while the folder exists), How the lab works, Future work, wiki-writing, Gaps, agents, papers, graphs, and the rest of the old house tour.

`GET /api/pages` records carry `bin` and `href`. Routes do not conceptually collide: the same slug is not used in both bins for Overview (boot `overview` vs doc `docs-home`). Old `/site/control` bookmarks redirect to `/docs/control` in the chrome.

Workbench stays **removed**. Speech that says “worker bench” maps to this Lab bench plus To-implement and paper fetch.

## Why

If the project gets heavy, the operator should **literally throw the doc site away**. Missing `data/docs` → boot still 200; `GET /api/bins` `{ present: false }`; `/docs/...` has nothing to render. Restore the folder → the doc site pops up again. Papers DB and `data/boards` are not in that folder.

Encyclopedia and papers still do not decay. Hats stay separate. MGM is hire-only.

## How

`backend/persist/pages.ts` walks `data/md` as `bin: boot`. If `docsPresent()`, it also walks `data/docs` as `bin: doc` and loads `content/CONTROL.md` as the Control page. `ensureDataDirs` does **not** recreate `data/docs`.

`GET /api/overview` defaults to boot. `GET /api/overview?bin=doc` is the framework map. `GET /api/pages?bin=boot|doc|all`.

`POST /api/docs/remove` `{ "confirm": true, "phrase": "Are you sure" }` runs `rmSync` on `data/docs`. Agents must not call this unless the operator asked.

Promote still copies Lab MD onto `data/md/` (boot), never onto `data/docs`.

## Tools / MD paths

| Path | Role |
| --- | --- |
| `data/md/` | Boot wiki |
| `data/md/sandbox/` | Lab children (this file) |
| `data/docs/` | Doc wiki — **the one-click delete folder** |
| `content/CONTROL.md` | ACI; shown on the doc site only while `data/docs` exists |
| `backend/persist/docs.ts` | `docsPresent`, `removeDocWiki` |
| `GET /api/bins` | `{ present, dir, href }` |
| `POST /api/docs/remove` | Delete the doc folder |

Frontend: `/site/:slug` loads `?bin=boot`. `/docs/:slug` loads `?bin=doc`. Header link **Framework docs** hides when the folder is gone.

## Worked example

A fork starts. Overview lists Tutorial, Summary (empty), Lab bench, To-implement — not Agents / Hybrid RAG / Knowledge graph. The operator seeds two arXiv ids via `POST /api/papers/fetch`, writes a Lab note, and later deletes `data/docs`. `/site/overview` still 200. `/docs/docs-home` is gone. Papers remain in `GET /api/papers/db`.
