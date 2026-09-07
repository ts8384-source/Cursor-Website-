# overview.md

---
title: What this site is
slug: overview
id: page:overview
nav: Overview
order: 1
highlight: start
gist: One local loop — iPad ink parks into hybrid RAG, Markdown is the site. This page is the live wiki map.
questions:
  - What pages exist right now?
  - Which pages nest under a parent?
  - Where does drawing stop and the scholarly site start?
glossary:
  - term: Living Papers
    def: Markdown compiled to web, PDF, and an extraction API (Heer et al., UIST 2023).
  - term: park
    def: Snapshot the iPad canvas into inbox/ so an agent can read ink without retyping.
  - term: wiki nest
    def: Child frontmatter parent. Sidebar and this map both read GET /api/pages.
citations:
  - living-papers-heer-2023
  - fidyll-conlen-2022
  - dashboard-design-patterns-2022
  - treereader-2025
  - paper-plain-august-2023
  - semantic-reader-project-2023
  - scrollyvis-2023
  - graphrag-2024
  - agent-workflow-memory-2024
scrolly: false
---

# What this site is

This website **is** the project. Articles are Markdown on disk (`data/md/`, `content/`). The renderer is thin Living Papers / Fidyll chrome [@living-papers-heer-2023] [@fidyll-conlen-2022]. The pad at `/` stays a scratch board. `/site` is the scholarly site and agent control surface.

The **page structure** below is the object Dashboard Design Patterns wants first: the whole IA, then detail [@dashboard-design-patterns-2022]. It is generated from `GET /api/pages` (`parent` / `children`). It is not a hand-maintained bullet list. TreeReader-style hierarchy lives in the left TOC as well [@treereader-2025]. Immediately under this cream **Start** map sits the olive **Lab** nest — [Sandbox](/site/sandbox). Explorations expand there like [Agents](/site/agents) children. They are not encyclopedia peers until promote to main.

The citation / related graph is a different map: [Knowledge graph](/site/knowledge-graph) (`GET /api/graph`) [@graphrag-2024]. Do not treat this Overview tree as that graph.

## How a nest is declared

One source of truth on the **child**:

```
parent: page:agents
```

Parents do not list children in frontmatter. Hidden pages (`hidden: true`, e.g. flagged-schemes) stay off the tree. Paper Plain questions and gists stay in the rail [@paper-plain-august-2023].
