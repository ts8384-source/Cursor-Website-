---
title: Overview
slug: overview
id: page:overview
nav: Overview
order: 1
highlight: start
depth: standard
gist: Starter map for this wiki. Empty summary, tutorial, Lab bench. Framework explain pages live on a separate doc site.
questions:
  - What is this wiki for?
  - Where do I start?
  - Where did the framework manual go?
glossary:
  - term: boot wiki
    def: The user project pages in data/md. This Overview belongs here.
  - term: doc wiki
    def: Optional framework explain site in data/docs. One-folder delete.
  - term: Lab bench
    def: Working nest at /site/sandbox. Agents write children here.
citations:
  - living-papers-heer-2023
  - dashboard-design-patterns-2022
embeds:
  - page-structure
  - diagrams-compact
---

# Overview

This is the **boot wiki** — the project wiki that ships empty-ish so a fork can fill it. Markdown on disk (`data/md/`) is the site [@living-papers-heer-2023]. The page list below is the live map from `GET /api/pages?bin=boot` [@dashboard-design-patterns-2022].

## Start here

1. Read the [Tutorial](/site/tutorial). Chat and the pad are the interface.
2. Seed papers and documents. The [Summary](/site/summary) starts empty.
3. Use the [Lab bench](/site/sandbox) to decide what enters the summary. The [To-implement](/site/implement) queue is the ticket list, not this map.

## Two bins

Framework explanation (Control, how the lab works, house style, agent hats) is a **separate doc wiki**. If that folder is present, open [Framework docs](/docs/docs-home). Deleting `data/docs` removes that site and leaves this wiki running.
