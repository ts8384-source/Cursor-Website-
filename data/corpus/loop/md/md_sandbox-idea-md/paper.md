# sandbox/idea.md

---
title: Sandbox — ideas
slug: sandbox-idea
id: page:sandbox-idea
type: page
nav: Ideas
order: 1
parent: page:sandbox
sandbox: true
sandboxLane: idea
depth: long
pageBudget: 500
gist: Lab bench for half-baked ideas. Not the encyclopedia. Promote only when the operator says so.
summaryShort: Disposable idea lane
summaryLong: Agents write idea drafts here under data/md/sandbox/. Chat points at this URL. Main articles do not decay; these pages can be thrown out. Promote copies MD to data/md/ after the phrase promote to main.
tags:
  - sandbox
  - temporary
related:
  - page:sandbox
  - page:workbench-sandbox
  - page:wiki-writing
  - page:sandbox-code
  - page:sandbox-research
updated: 2026-09-06
questions:
  - Where do idea drafts live?
  - How do they reach main?
glossary:
  - term: idea lane
    def: Sandbox tab for combinatorial or half-specified notions. Not fetch. Not coding.
citations:
  - living-papers-heer-2023
  - dashboard-design-patterns-2022
---

# Sandbox — ideas

This is a **lab bench**, not the encyclopedia. The article on a main page stays upstairs. This lane is where an agent parks an idea so the operator can look at it on the website instead of in a chat dump.

## What

Markdown under `data/md/sandbox/` with `sandbox: true` and `sandboxLane: idea`. Living Papers still applies: the file is the page [@living-papers-heer-2023]. This lane nests under [Sandbox](/site/sandbox). It is not an encyclopedia peer. The olive block on articles is a pointer, not the IA.

## Why

Main articles do not decay. Idea drafts can. Keeping them in this namespace stops a slogan from pretending it is house style.

**Combinatorial analog (not a fact about this repo):** Dashboard Design Patterns’ catalog-then-detail is the shape — gist/Overview is the catalog; this lane is a detail drawer [@dashboard-design-patterns-2022].

## How

1. Write `data/md/sandbox/<slug>.md` with `parent: page:sandbox-idea`, `sandboxFor: page:<host>`, `depth: long`.
2. Point the chat at `/site/<slug>`.
3. the operator reads it here. If it should live on main: `POST /api/sandbox/promote` `{ "slug", "phrase": "promote to main", "destSlug"? }`.
4. That **copies** MD to `data/md/`. It does **not** merge a git lab.

## Tools / MD paths

`GET /api/sandbox` (labs + lanes). `POST /api/sandbox/promote`. Skill copy: `.cursor/skills/drawing-loop/SKILL.md`. Operator: [Sandbox](/site/workbench-sandbox), [Wiki writing](/site/wiki-writing).

## Worked example

A generate seed belongs here first. Cite the in-DB `paperId`. Label it combinatorial. Do not invent.
