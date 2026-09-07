# workbench-sandbox.md

---
title: "Temporary — sandbox as fork / lab"
slug: workbench-sandbox
id: page:workbench-sandbox
type: page
nav: Sandbox (temp)
order: 21
parent: page:workbench
gist: Temporary. Main point is GitHub-style separation of work — fork from main, experiment, human check, merge. Security still matters; it is not the headline. No Docker mandate.
summaryShort: Fork/lab first, security second
summaryLong: Temporary child of Architect’s Workbench. Sandbox here means a local building environment you fork from main — explore an idea apart from new implementation, get results, check with the operator, then merge. A4 and fetch SSRF stay as a short security subsection. Git worktree/branch now; optional container later. No fake Docker.
tags:
  - temporary
  - sandbox
  - agents
  - wiki
related:
  - page:workbench
  - page:implement
  - page:workbench-round3
  - page:workbench-runtimes
  - page:workbench-mgm
  - page:agents-coding
  - page:control
  - page:gaps
  - diagram:workbench-ia
  - arxiv-2601-16206
  - swe-agent-2024
updated: 2026-09-06
questions:
  - What is the fork / lab story, in GitHub words?
  - What can we do now without a container?
  - What security rules still apply?
  - Why is Docker not the headline?
glossary:
  - term: fork / lab
    def: A local building environment branched from main. Explore and implement there; merge only after a human check.
  - term: Owner of Judgment
    def: the operator reviews results on the fork before they come back to main.
  - term: A4
    def: Lazy-load hand-authored SKILL.md files in this repo only. No community or GitHub skill packs.
citations:
  - arxiv-2601-16206
  - swe-agent-2024
  - webarena-2024
  - gorilla-2023
  - living-papers-heer-2023
---

# Temporary — sandbox as fork / lab

**This section is temporary.** the operator likes this page; the **point** changed. The sandbox is not a Docker product pitch. It is **rigorous separation of work**, the way you contribute to a large open-source repo.

Parent: [Architect’s Workbench](/site/workbench). Queue: [To-implement](/site/implement) (this child sits **after** that queue). Round-3 notes: [Round 3](/site/workbench-round3).

Status: **implemented** (hook + first website slice). `POST /api/sandbox/fork` `{ name? }` → branch + optional worktree from main/master. `GET /api/sandbox` lists labs **and** wiki lanes. `POST /api/sandbox/propose` records human-check-pending. **Does not merge.** `POST /api/sandbox/promote` copies a sandbox MD file to `data/md/` only if the phrase is **promote to main**. Never “production.” Coding works **in the lab** until the operator says send back. Agents write the readable deliverable onto the **website sandbox nest** ([Sandbox](/site/sandbox) and its children); chat only points at the URL.

## The point — GitHub-style lab

Separate **exploration of an idea** from **new implementation of code**.

1. **Fork from main.** A local building environment (branch or `git worktree`), not edits smuggled into the everyday mash.
2. **Make it work at the bottom line.** Smallest honest slice on that fork.
3. **Experiment. Get results.** Tests and lesson notes stay **on the fork** (`POST /api/sandbox/lessons`). TraceCoder is abandoned.
4. **Check with the operator (human).** Owner of Judgment. Do not self-merge a “score.”
5. **Send back / merge.** Lessons and patches return only after that check.

That is contributing to a large OSS tree: fork, branch, PR, review. The pad and wiki stay the shared main. The lab is where you try the risky idea.

## What we can do now vs later

| Now (honest) | Later (optional) |
| --- | --- |
| `git` branch or worktree from main; keep experiments off the park that writes `data/md` until he checks | Isolated process (child Node, no network, scratch cwd) |
| Write the experiment on a page + tests; cite-or-fetch already on that page | Optional container **if** we ever need a kernel wall — not required for the pad |
| `GET /api/sandbox` + `POST /api/sandbox/fork`. `requireDocker: false` | A fail-closed isolate that says **not isolated** if missing — never a green badge on the host |

LLM-in-Sandbox is **in DB as an abstract**: sandbox-as-environment, not a mandate to install Docker Desktop on this Windows pad host [@arxiv-2601-16206]. A container that mounts the real repo is not a lab. A container that cannot see the repo cannot implement the wiki.

**Do not** fake Docker. **Do not** make `:5174` depend on Docker Desktop.

## Security (still required — not the headline)

Personal project ≠ skip security. Keep this **below** the fork story.

| Rule | Why it stays |
| --- | --- |
| **A4** — hand-authored skills in this repo only | Community / GitHub packs are untrusted text. ToxicSkills is **not in DB**; we still refuse the market. |
| **Fetch SSRF** — `backend/ingest/fetch-safe.ts` | OA hosts; no localhost / private / link-local / `100.64/10` on outbound paper fetch. |
| **No Caesar crawl** | Un-ingested HTML is not sight. Cite-or-fetch, not a sandbox feature. |
| **Untrusted snippet ≠ everyday mash** | Generated exploit text or a downloaded skill does not run in coding. Isolate or refuse. |
| **MGM is not this page** | Separate hired bouncer, [will-implement](/site/workbench-mgm). |

SWE-agent: agents fail on a raw shell [@swe-agent-2024]. Our ACI is `GET /api/tools` + CONTROL [@gorilla-2023]. The lab is a **branch of the same ACI**, not “here is Docker, figure it out.”

## Mapping to hats

- **Coding** implements trusted work on the tree he asked for. New risky implementation belongs on a **fork**, then a human check.
- **Fetch** already has the network wall. Do not weaken it “for the lab.”
- **Generate** seeds in-DB paper ids. Generated prose is not executed.

## Website sandbox (first slice)

The **IA** is the [Sandbox](/site/sandbox) parent (`highlight: lab`) plus children. Lanes remain as those children (and as tabs in the olive pointer):

| Lane | URL | Frontmatter |
| --- | --- | --- |
| Ideas | `/site/sandbox-idea` | `sandboxLane: idea` |
| Code | `/site/sandbox-code` | `sandboxLane: code` |
| Research | `/site/sandbox-research` | `sandboxLane: research` |

Write explorations under `data/md/sandbox/` with `sandbox: true`, `parent: page:sandbox`, optional `sandboxLane`, `sandboxFor: page:<host>`, `depth: long`. `GET /api/pages` tree shows them **under Sandbox**, not as encyclopedia peers. The olive block on every article is a pointer (Handbook 7:2 / 7:6 / 9:1).

**Promote:** look at the sandbox page → type **promote to main** → `POST /api/sandbox/promote` `{ "slug", "phrase", "destSlug"? }`. Copies the file to `data/md/<dest>.md`. Source stays. **Does not** merge `lab/…` branches. That merge is still [discuss](/site/implement).

## See also

- [To-implement](/site/implement) — fork/lab archived as implemented (`impl-sandbox-fork-lab`)
- [Paper runtimes](/site/workbench-runtimes) — traces live on the fork
- [MGM](/site/workbench-mgm) — bouncer, not isolation
- [Coding](/site/agents-coding) · [CONTROL](/site/control)
