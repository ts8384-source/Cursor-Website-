---
title: How the lab works
slug: sandbox-how-the-lab-works
id: page:sandbox-how-the-lab-works
type: page
nav: How the lab works
order: 0
parent: page:docs-home
sandbox: false
depth: long
pageBudget: 700
gist: Operator explain page for the Lab bench. Not an Ideas / Code / Research lane. Not a Git fork.
summaryShort: Explain the nest, not a lane
summaryLong: Child of Lab bench. Tells agents and the operator where work is written, how lanes differ from this how-to, and how promote to main works. Chat still only points at /site/sandbox-how-the-lab-works.
tags:
  - sandbox
  - ia
  - agents
related:
  - page:sandbox
  - page:future
  - page:wiki-writing
  - page:control
  - page:overview
  - page:implement
updated: 2026-09-06
questions:
  - What is the Lab bench versus this page?
  - Where do Ideas, Code, and Research live?
  - When does a page leave the nest?
glossary:
  - term: Lab bench
    def: /site/sandbox. Parent where agents write children. highlight lab.
  - term: how-to child
    def: This page. Explains the nest. No sandboxLane, so it is not a lane tab.
citations:
  - living-papers-heer-2023
  - dashboard-design-patterns-2022
  - gorilla-2023
  - paper-plain-august-2023
---

# How the lab works

This page **explains** the nest. It is not the bench index and it is not a lane. Handbook-style labels: the working lab and the pages about the lab are two titles.

## What

| Surface | URL | Role |
| --- | --- | --- |
| **Lab bench** | [Lab bench](/site/sandbox) | Parent. `highlight: lab`. Children are written here. |
| **How the lab works** | this page | Operator copy. No `sandboxLane`. |
| **Lanes** | frontmatter `sandboxLane: idea\|code\|research` | Tabs on lab children. Optional. |
| **Git lab** | `POST /api/sandbox/fork` | Branch / worktree. Not MD children. |
| **Trash bin** | `GET/POST /api/sandbox/trash` | Lab dump. Forgotten after 14 days. Encyclopedia refused. |
| **Encyclopedia** | `/site/overview` peers | Promoted pages only. |
| **Future work** | [Future work](/site/future) | v1 snapshot and later list. |

Living Papers: the file is the page [@living-papers-heer-2023]. Overview-then-detail: the bench is the overview of work in progress; this article is the how [@dashboard-design-patterns-2022].

## Why

Agents were dumping encyclopedia prose in chat and calling the parent both “petri dish” and “docs about sandbox.” The fix is **two names**:

1. **Lab bench** — write work (`data/md/sandbox/…`).
2. **How the lab works** — read the rules (this file).

Chat still only points at `/site/<slug>`. CONTROL and the drawing-loop skill say the same thing [@gorilla-2023].

## How (write a turn)

1. Create `data/md/sandbox/<slug>.md`.
2. Frontmatter: `sandbox: true`, `parent: page:sandbox` (or a lane parent if one exists), `depth: long`.
3. Set `sandboxLane: idea|code|research` unless the page is how-to like this one.
4. Body: What / Why / How / Tools / MD paths / one worked example ([Wiki writing](/site/wiki-writing)).
5. In chat, give the URL only.
6. Flag interesting come-backs with `POST /api/sandbox/flag`. Not the [To-implement](/site/implement) queue.
7. Leave the nest only with phrase **promote to main**.
8. Dump a lab page only when the operator asks: `POST /api/sandbox/trash` `{ "slug" }`. Never encyclopedia.

## Tools / MD paths

| Tool | Role |
| --- | --- |
| `GET /api/pages` | Tree. This child sits under `page:sandbox`. |
| `GET /api/meta?nest=sandbox` | Lab records only. |
| `GET /api/meta/:id` | `parent`, `nest`, `flags`, `graphDegree`. |
| `GET /api/sandbox` | Git labs + lane lists. |
| `POST /api/sandbox/promote` | Copy MD after the lock phrase. |
| `POST /api/sandbox/fork` | Git branch / worktree. |
| `GET/POST /api/sandbox/trash` | Lab Trash bin. Agents only when the operator asks. |

Files: `data/md/sandbox.md` (bench), `data/md/sandbox/how-the-lab-works.md` (this), `data/md/sandbox/future-work.md` (v1 / later), `content/CONTROL.md`.

## Worked example

A coding turn writes `data/md/sandbox/<slug>.md`, then the chat names `/site/<slug>`. [Future work](/site/future) is the standing v1 page in this nest. This page stays the explain child. Neither is an Overview peer until promote.

Paper Plain gists stay collapsed chrome [@paper-plain-august-2023].
