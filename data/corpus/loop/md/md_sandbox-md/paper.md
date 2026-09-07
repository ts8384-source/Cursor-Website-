# sandbox.md

---
title: Sandbox — the lab nest
slug: sandbox
id: page:sandbox
type: page
nav: Sandbox
order: 2
highlight: lab
depth: long
pageBudget: 700
gist: Visible petri dish. Explorations nest here as children until promote to main. Not encyclopedia peers.
summaryShort: Lab nest under Overview
summaryLong: First-class wiki parent right under Overview. Children stay sandbox until promote to main. The olive Lab badge is text plus color (handbook 7:2 / 9:1). Lanes and explorations expand like Agents.
tags:
  - sandbox
  - wiki
  - ia
related:
  - page:overview
  - page:workbench-sandbox
  - page:wiki-writing
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
  - term: Lab nest
    def: page:sandbox in the left TOC. Children are visible under this parent only.
  - term: promote to main
    def: Lock phrase for POST /api/sandbox/promote. Copies MD; does not merge git.
---

# Sandbox — the lab nest

This page is the **interface for adding things to the wiki**. Overview is the cream map. This is the olive petri. Explorations are **subpages**, not tabs buried on every article [@dashboard-design-patterns-2022] [@treereader-2025].

Handbook **7:2** (group navigation) and **9:1** (clear labels): the **Lab** badge is text, not color-only. Cream Start and slate Queue stay different on purpose.

## What

`data/md/sandbox.md` is a **main** parent (`sandbox: false`). Children under `data/md/sandbox/` keep `sandbox: true` and `parent: page:sandbox`. They appear in this nest. They do **not** sit as peer encyclopedia pages until `POST /api/sandbox/promote` with the phrase **promote to main**.

Living Papers: the file is the page [@living-papers-heer-2023]. Paper Plain gists stay collapsed chrome [@paper-plain-august-2023].

## Why

Agents write to sandbox pages; chat only points at `/site/<slug>`. A lane-only IA hid work in an olive block on every article. the operator’s IA is **parent + children**, the same twist as [Agents](/site/agents).

The on-page olive block can stay as a pointer. It is not the nest.

## How

1. New exploration → `data/md/sandbox/<slug>.md` with `sandbox: true`, `parent: page:sandbox`, `depth: long`.
2. Optional lane: `sandboxLane: idea|code|research` (tabs in the olive block).
3. Chat URL: `/site/<slug>`.
4. Promote copies to `data/md/`. Source stays. Git lab merge is still discuss.

## Tools / MD paths

| Tool | Role |
| --- | --- |
| `GET /api/pages` | Tree includes this nest and its children |
| `GET /api/sandbox` | Git labs + lane lists |
| `POST /api/sandbox/fork` | Branch / worktree |
| `POST /api/sandbox/promote` | Copy MD after the lock phrase |

Files: `data/md/sandbox.md`, `data/md/sandbox/*.md`, `data/site/highlights.json` (`lab`), `backend/persist/pages.ts`. Operator git lab: [Sandbox fork](/site/workbench-sandbox). House style: [Wiki writing](/site/wiki-writing).

## Worked example

[Memory & token optimization](/site/sandbox-memory) is a child of this page. It is a long exploration, not a main encyclopedia article. [Papers from the internet](/site/papers-ingest) is **not** a sandbox child — that recipe sits next to [Papers](/site/papers).
