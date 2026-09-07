# sandbox/research.md

---
title: Sandbox — research
slug: sandbox-research
id: page:sandbox-research
type: page
nav: Research
order: 3
parent: page:sandbox
sandbox: true
sandboxLane: research
depth: long
pageBudget: 500
gist: Lab bench for fetch logs and generate drafts. Session hits only. Not a crawl.
summaryShort: Disposable research lane
summaryLong: Fetch writes a session-hit log here. Generate drafts cite an in-DB seed here. Hats stay separate. Promote copies the note to main after promote to main.
tags:
  - sandbox
  - fetch
  - generate
  - temporary
related:
  - page:sandbox
  - page:agents-fetch
  - page:agents-generate
  - page:wiki-writing
  - page:sandbox-idea
  - page:sandbox-code
updated: 2026-09-06
questions:
  - Where does a fetch log go?
  - How is a generate seed labeled?
glossary:
  - term: research lane
    def: Sandbox tab for fetch logs and generate drafts. Not coding.
citations:
  - living-papers-heer-2023
  - paper-plain-august-2023
  - knowrag-2026
---

# Sandbox — research

Fetch and generate **output onto this website**, not as a long chat. This lane is the default tray.

## What

Write `data/md/sandbox/<slug>.md` with `sandboxLane: research`, `depth: long`, citations that you actually opened. Living Papers: the file is the article [@living-papers-heer-2023]. Paper Plain gists stay collapsed chrome; the body is the long form [@paper-plain-august-2023].

## Why

Cite-or-fetch: session hits only; missing work is **not in DB** [@knowrag-2026]. A chat dump loses ids. A sandbox page keeps them.

## How

1. **Fetch hat** — retrieve, then write the fetch log here (session hits). Do not implement.
2. **Generate hat** — `POST /api/generate/seed`, draft here, label the seed combinatorial.
3. Do not mix hats on one page if the user asked for isolation.
4. Promote: `POST /api/sandbox/promote` with phrase **promote to main**.

## Tools / MD paths

`.cursor/skills/research-fetch/SKILL.md`, `.cursor/skills/research-generate/SKILL.md`. [Wiki writing](/site/wiki-writing) is the standing house style (already on main). New research notes start here.

## Worked example

This pass’s fetch already cited `page:metadata`, `paper-plain-august-2023`, `living-papers-heer-2023`. Generate seed was `dashboard-design-patterns-2022`. Those facts belong on a research note like this one, then upstairs only if he promotes.
