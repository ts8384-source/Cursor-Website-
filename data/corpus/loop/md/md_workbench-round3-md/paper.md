# workbench-round3.md

---
title: "Temporary — Workbench 3rd-round thinking"
slug: workbench-round3
id: page:workbench-round3
type: page
nav: Round 3 (temp)
order: 25
parent: page:workbench
gist: Temporary notes from the operator’s third-round Workbench feedback. The To-implement queue is the lasting tool; this page is think-through.
summaryShort: Temp notes from round 3
summaryLong: Temporary child of Architect’s Workbench. Records the third-round ask — sandbox as fork/lab, TraceCoder explained, MGM stays will-implement not “production,” and a write/erase implement queue above Sandbox. ClawVM stays explore. No Docker mandate.
tags:
  - temporary
  - workbench
  - agents
related:
  - page:workbench
  - page:implement
  - page:workbench-sandbox
  - page:workbench-runtimes
  - page:workbench-mgm
  - page:workbench-clawvm
  - page:control
updated: 2026-09-06
questions:
  - What did the operator change his mind about?
  - What is decided versus still discuss?
  - What stays off the will-implement list?
glossary:
  - term: fork / lab
    def: GitHub-style split — explore an idea and implement new code on a fork from main; human check before merge.
  - term: Owner of Judgment
    def: the operator checks results before lessons or patches come back to main.
citations:
  - arxiv-2602-06875
  - arxiv-2601-16206
  - living-papers-heer-2023
---

# Temporary — Workbench 3rd-round thinking

**This section is temporary.** We will rewrite it later. The lasting tool from this round is the [To-implement queue](/site/implement).

the operator’s third pass (student loop, no papers required for the queue itself):

1. **Sandbox page is good; the point was wrong.** Security still matters, but the headline is **rigorous separation of work** — explore an idea vs write new code; fork from main; make it work; experiment; get results; **check with him**; send back / merge. Like contributing to a large OSS repo. Not “run untrusted skills in Docker.”
2. **TraceCoder was opaque.** Explain with a diagram, a small analogy (flight recorder / lab notebook), and map traces to **his** fork. Cite `arxiv-2602-06875` only. Do not invent extra numbers.
3. **MGM on-demand bouncer — he likes it.** Do **not** jump to “production.” That word is lazy. Status is **will-implement** after discuss. We have not built the bouncer. We will not ship Mendel Gödel Machine evolution this pass.
4. **He wants a to-implement list built.** Permanent mechanism, write/erase, visibly not Overview, **always above Sandbox** in the Workbench nest. Seed MGM + fork-lab. TraceCoder stays understand/discuss. **ClawVM is explore — do not put it on the will-implement list.**

## What we did / did not

| Did | Did not |
| --- | --- |
| Reframe sandbox as fork/lab; security subsection below | Docker mandate, fake container |
| TraceCoder diagram + analogy on runtimes | TraceCoder multi-agent crew |
| Status vocab on wiki + MGM as will-implement | Call anything production; implement MGM evolution |
| Live `GET/POST /api/implement` queue | ClawVM, Caesar, community skills |

See [Sandbox](/site/workbench-sandbox), [Runtimes](/site/workbench-runtimes), [MGM](/site/workbench-mgm), [To-implement](/site/implement).
