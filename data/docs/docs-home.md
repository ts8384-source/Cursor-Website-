---
title: Framework docs
slug: docs-home
id: page:docs-home
nav: Framework docs
order: 1
highlight: start
depth: standard
gist: Explanation of this framework. Separate from the boot wiki. Delete data/docs to throw this site away.
questions:
  - What is this folder?
  - Does deleting it break the boot wiki?
  - Where is the agent ACI?
glossary:
  - term: doc wiki
    def: Framework explain pages under data/docs plus content/CONTROL.md while this folder exists.
  - term: one-click dump
    def: Remove doc wiki after Are you sure. Or delete the data/docs folder and reboot.
citations:
  - living-papers-heer-2023
  - gorilla-2023
---

# Framework docs

This site explains **the framework**, not the fork’s project. The boot wiki (the thing a fork fills) lives at `/site/overview` in `data/md/`. These pages live in `data/docs/`. Living Papers: the files are the pages [@living-papers-heer-2023].

If this folder is present, this site is available. If it is missing, the boot wiki still runs and these routes go away. Tools stay structured (`GET /api/tools`) [@gorilla-2023].

## Throw it away

1. Use **Remove doc wiki** on this page (Are you sure?).
2. Or delete the folder `data/docs` and restart the API.

Papers (`data/papers`), boards (`data/boards`), and boot pages (`data/md`) stay.

## Operator entry

- [Agent-computer interface](/docs/control) — `content/CONTROL.md`
- [How the lab works](/docs/sandbox-how-the-lab-works)
- [Wiki writing](/docs/wiki-writing)
- [Future work](/docs/future)
- [Gaps](/docs/gaps)

The live map below is `GET /api/pages?bin=doc`.
