---
title: Tutorial
slug: tutorial
id: page:tutorial
nav: Tutorial
order: 3
depth: long
pageBudget: 900
gist: Fork this framework, use chat and the pad as the interface, seed documents, keep the summary empty until the Lab bench says what belongs.
questions:
  - How do I start after a fork?
  - How do I seed papers without inventing?
  - How do I organize pages?
  - How do I drop the framework manual later?
glossary:
  - term: seed
    def: Local documents and OA papers that start a wiki. The summary stays empty until the operator chooses what enters it.
  - term: cite-or-fetch
    def: Retrieve first; cite a hit id; if it is not in the DB, fetch — do not invent.
  - term: Lab bench
    def: /site/sandbox. Working nest. Agents write children here.
citations:
  - living-papers-heer-2023
  - gorilla-2023
  - paper-plain-august-2023
  - dashboard-design-patterns-2022
related:
  - page:overview
  - page:summary
  - page:sandbox
  - page:implement
  - page:control
  - page:papers-ingest
---

# Tutorial

You have a **local coding-agents application**. You **fork this framework**. **Chat and the pad** are the interface. You do not retype a whiteboard that already parked. This page is the boot-wiki start guide. Framework internals live on the optional [Framework docs](/docs/docs-home) site and can be thrown away later.

## What

This repo is a **framework**, not a finished research encyclopedia dumped into a new fork. After a fork you get two bins:

| Bin | Folder | Site | Whose pages? |
| --- | --- | --- | --- |
| Boot | `data/md/` | `/site/...` | The project wiki you fill |
| Doc | `data/docs/` | `/docs/...` | Framework explanation that ships once |

The **summary starts empty**. Typical work begins with a pile of documents and papers as a **seed**. You use the [Lab bench](/site/sandbox) to shove what should go into the [Summary](/site/summary). You log and **correct** internet material in detail. You do not invent citations.

Markdown is the site [@living-papers-heer-2023]. Chrome gists stay collapsed; the article is the long form [@paper-plain-august-2023]. Agents call structured tools, not the DOM [@gorilla-2023].

## Why

A house wiki that explains the framework is useful the first week and heavy forever. If the project should stay light, **delete `data/docs`** (or use **Remove doc wiki** after Are you sure?). Boot pages, papers, and boards stay. If you keep the folder, the doc site still pops up.

Do not treat the Lab bench as a deleted “worker bench” product. The bench is this nest plus [To-implement](/site/implement) and paper fetch.

## How — first hour

1. Run the pad on **5174** and the API on **5175**. Do not steal 5173. Canvas is `/`. Boot wiki is `/site/overview`.
2. Talk in chat or park ink on the pad. A park writes `inbox/PENDING`. The drawing is the spec.
3. Drop or pass documents (PDFs, notes) into the repo or paste them in chat. Ask the framework to **file** them as pages or paper records.
4. Fetch academic papers as seed (OA only):

```
POST /api/papers/fetch
{ "arxiv": "2407.01449" }
```

or `{ "url": "https://arxiv.org/pdf/2407.01449.pdf" }`. Confirm with `GET /api/papers` and `GET /api/papers/db`. Already-ingested ids skip download.

5. Leave [Summary](/site/summary) empty until the Lab bench note says what belongs there. Promote is a later phrase (`promote to main`), not the first write.
6. Put tickets on [To-implement](/site/implement). Put explorations under [Lab bench](/site/sandbox).

## How — collect and correct from the internet

**Cite-or-fetch.** Retrieve first (`GET /api/search?q=`, `POST /api/ask`). Every factual claim names a hit id (paper, page, or chunk). If the work is **not in the DB**, say so and fetch. Do not fill gaps from memory.

Correct a wrong local note by writing a new Lab-bench page that cites the fetch, then update the standing page. User/project memory can `POST /api/memory` with `supersedes` when a parked correction contradicts a decaying note. **Encyclopedia pages and papers do not decay.**

Pass a document in chat: name the file or paste the excerpt, say which slug it should become, and ask the coding hat to write `data/md/<slug>.md` (boot) with frontmatter. Do not ask the agent to invent a paper that was not fetched.

Detailed ingest recipe (optional, lives in the doc wiki): [Papers from the internet](/docs/papers-ingest).

## How — organize the wiki

One nest source: the **child** sets `parent: page:<slug>`. Parents do not list children. The Overview map and the left TOC both read `GET /api/pages?bin=boot` [@dashboard-design-patterns-2022].

| Field | Use |
| --- | --- |
| `depth` | `short` / `standard` / `long`. New architecture pages default long. |
| `pageBudget` | Optional word target. 0 = depth default. |
| `related` / `citations` | Same ids as `GET /api/meta`. Graph is labeled retrieve, not new facts. |
| `sandbox: true` | Lab child. Stays off Overview peers until promote. |

Graph neighborhood: `GET /api/graph/neighborhood?id=page:tutorial` then open the real page. Do not invent edges.

Forker pages go in **boot** (`data/md/`). Framework explain edits go in **doc** (`data/docs/`). Do not mix.

## How — dump the doc wiki later

When the project is heavy enough without a manual:

1. Open [Framework docs](/docs/docs-home) and press **Remove doc wiki**. Confirm **Are you sure?**
2. Or delete the folder `data/docs` and reboot the API.

Boot wiki still answers 200. Doc routes disappear. Restore the folder (from version control) and the doc site pops up again.

The **Framework docs** link on the boot header is hidden when `GET /api/bins` says `present: false`.

## Tools / MD paths

| Tool | Role |
| --- | --- |
| `GET /api/pages?bin=boot` | This wiki’s tree |
| `GET /api/pages?bin=doc` | Framework tree (if `data/docs` exists) |
| `GET /api/bins` | Whether the doc folder is present |
| `POST /api/docs/remove` | One-click dump after Are you sure |
| `POST /api/papers/fetch` | OA paper seed |
| `GET /api/implement` | To-implement queue |
| `GET /api/sandbox` | Lab nest + git labs |

Files: `data/md/tutorial.md` (this page), `data/md/summary.md`, `data/md/overview.md`, `data/md/sandbox/`, `data/docs/` (optional). ACI: `content/CONTROL.md` (also `/docs/control` while docs exist).

## Worked example

The operator parks: “seed three OA papers on Living Papers, keep summary empty, note what should enter it.” The fetch hat runs `POST /api/papers/fetch` three times, writes a Lab-bench log at `/site/<slug>` with hit ids, and leaves `/site/summary` blank. A later park says which claims belong in the summary. The coding hat copies only those cited claims. If the house manual is in the way, the operator deletes `data/docs`. The summary page still exists.
