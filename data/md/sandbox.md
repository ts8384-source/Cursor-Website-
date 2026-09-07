---
title: Lab bench
slug: sandbox
id: page:sandbox
type: page
nav: Lab bench
order: 2
highlight: lab
depth: long
pageBudget: 700
project: framework
gist: Working nest. Agents write children here. How-to is a separate child, not a lane.
summaryShort: Where work is written
summaryLong: First-class wiki parent under Overview. Children stay in the lab until promote to main. Olive Lab badge is text plus color (handbook 7:2 / 9:1). Lanes are Ideas, Code, Research. Explain page is How the lab works.
tags:
  - sandbox
  - wiki
  - ia
related:
  - page:overview
  - page:sandbox-how-the-lab-works
  - page:sandbox-fork-bins
  - page:tutorial
  - page:implement
  - page:control
  - diagram:sandbox-ia
citations:
  - living-papers-heer-2023
  - dashboard-design-patterns-2022
  - treereader-2025
  - paper-plain-august-2023
questions:
  - Where do new explorations live?
  - How do they stay off the encyclopedia?
  - When do they become main pages?
glossary:
  - term: Lab bench
    def: page:sandbox in the left TOC. Children are visible under this parent only.
  - term: How the lab works
    def: Nest child that explains the bench. Not an Ideas/Code/Research lane.
  - term: promote to main
    def: Lock phrase for POST /api/sandbox/promote. Copies MD; does not merge git.
---

# Lab bench

This page is the **working nest**, not a manual. Children are the work. The operator manual is [How the lab works](/docs/sandbox-how-the-lab-works) on the disposable doc site. Overview is the cream **boot** map. This is the olive **Lab** nest [@dashboard-design-patterns-2022] [@treereader-2025]. New forker pages go to `data/md/`. Framework explain pages go to `data/docs/`.

Handbook **7:2** (group navigation) and **9:1** (clear labels): the **Lab** badge is text, not color-only. “Lab bench” is the category. “How the lab works” is the explain child. Ideas / Code / Research are optional lanes on children.

## What

`data/md/sandbox.md` is a **boot** parent (`sandbox: false`, `highlight: lab`). Children under `data/md/sandbox/` keep `sandbox: true` and `parent: page:sandbox`. They appear in this nest. They do **not** sit as peer encyclopedia pages until `POST /api/sandbox/promote` with the phrase **promote to main** (copies into `data/md/`, the boot wiki).

Living Papers: the file is the page [@living-papers-heer-2023]. Paper Plain gists stay collapsed chrome [@paper-plain-august-2023].

## Why

Agents write to lab pages; chat only points at `/site/<slug>`. A parent that both *held work* and *explained sandbox* made the word “Sandbox” mean two things. Split:

- **This page** — bench index.
- **How the lab works** — rules.
- **Git lab** — `POST /api/sandbox/fork` branches, not MD children.
- **Trash bin** — `GET/POST /api/sandbox/trash`. Lab pages only; forgotten after two weeks. Encyclopedia does not decay.

## How

1. New exploration → `data/md/sandbox/<slug>.md` with `sandbox: true`, `parent: page:sandbox`, `depth: long`.
2. Optional lane: `sandboxLane: idea|code|research` (tabs in the olive block). Omit lane on how-to pages.
3. Chat URL: `/site/<slug>`.
4. Promote copies to `data/md/`. Source stays. Git lab merge is still discuss.

## Tools / MD paths

| Tool | Role |
| --- | --- |
| `GET /api/pages` | Tree includes this nest and its children |
| `GET /api/meta?nest=sandbox` | Lab records |
| `GET /api/sandbox` | Git labs + lane lists |
| `GET /api/sandbox/flags` | Flagged explorations (interesting, not will-implement) |
| `POST /api/sandbox/flag` | Flag / unflag `{ slug\|id, flagged, note? }` |
| `POST /api/sandbox/fork` | Branch / worktree |
| `POST /api/sandbox/promote` | Copy MD after the lock phrase |
| `GET/POST /api/sandbox/trash` | Lab Trash bin |

Files: `data/md/sandbox.md`, `data/md/sandbox/*.md`, `data/site/highlights.json` (`lab`), `backend/persist/pages.ts`. House style: [Wiki writing](/docs/wiki-writing). Fork bins: [Fork bins](/site/sandbox-fork-bins).

## Worked example

[How the lab works](/docs/sandbox-how-the-lab-works) and [Future work](/docs/future) now live in the **doc** bin. This nest keeps working notes such as [Fork bins](/site/sandbox-fork-bins). [Papers from the internet](/docs/papers-ingest) is not a lab child.

The **Flagged explorations** list on this parent is “come back to this,” not the [To-implement](/site/implement) queue. Agents pick the list up with `GET /api/sandbox/flags`.
