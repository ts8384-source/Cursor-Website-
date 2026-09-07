# workbench-runtimes.md

---
title: "Temporary — paper runtimes"
slug: workbench-runtimes
id: page:workbench-runtimes
type: page
nav: Runtimes (temp)
order: 22
parent: page:workbench
gist: Temporary implement-discussion. How papers propose execution, REPL, sandbox, and harness — mapped onto this repo’s coding hat and cite-or-fetch. What we would actually run.
summaryShort: What papers would run here
summaryLong: Temporary child of Architect’s Workbench. TraceCoder is abandoned (we looked, we dropped it). LLM-in-Sandbox as environment, SemaClaw/ToxicSkills (not in DB), versus A3 turn-control, A4 skills, and GET /api/execution. Caesar stays refused. No ClawVM runtime.
tags:
  - temporary
  - runtime
  - papers
  - coding
related:
  - page:workbench
  - page:workbench-sandbox
  - page:implement
  - page:workbench-round3
  - page:execution
  - page:agents-coding
  - page:agents-fetch
  - page:maps
  - diagram:workbench-ia
  - arxiv-2602-06875
  - arxiv-2601-16206
updated: 2026-09-06
questions:
  - What does each named paper actually execute?
  - What would we run on a park if we were honest?
  - Which names are still not in the paper DB?
glossary:
  - term: paper runtime
    def: How a paper wants code or tools to run — trace, REPL, container, capability check — not our GET /api/execution notes page.
  - term: harness
    def: The control plane that assembles prompts, mediates tools, and sees lifecycle events. Here that is Cursor plus CONTROL, not OpenClaw.
citations:
  - arxiv-2602-06875
  - arxiv-2601-16206
  - arxiv-2505-16067
  - arxiv-2604-20855
  - arxiv-2604-22861
  - swe-agent-2024
  - gorilla-2023
  - living-papers-heer-2023
  - knowrag-2026
---

# Temporary — paper runtimes

**This section is temporary.** **TraceCoder is abandoned** — we looked at the abstract, we dropped it. It is not a method we use. This page stays the long home for “how papers propose execution.” Sibling [sandbox as fork / lab](/site/workbench-sandbox) is the GitHub-style lab. [ClawVM](/site/workbench-clawvm) is **explore-only** and stays off the will-implement list.

Cite-or-fetch: every named work below is **in DB** or marked **not in DB**. Do not invent a SemaClaw API from the name.

## What this repo already runs (so we do not hallucinate a second engine)

| Surface | What it is | What it is not |
| --- | --- | --- |
| Coding hat | Edits the real tree. A3: one change-set. Tests `scholar.test.ts`. | Not TraceCoder. Not a REPL-in-the-wiki. |
| `GET /api/execution` | Paper *idea* → repo file notes | Not executing the paper’s code |
| `POST /api/maps/fetch` | Math/diagram → code edges | Not a sandboxed interpreter |
| `GET /api/scripts` | Allowlisted `rag.cli` names | Not arbitrary shell |
| Fetch | OA PDF → `data/papers` | Not a web gym |
| Generate seed | In-DB `paperId` only | Not a research agent runtime |

Living Papers is the site compiler story we **do** use (MD is source) [@living-papers-heer-2023]. We do not run the papers’ own experiment harnesses.

## TraceCoder — abandoned (`arxiv-2602-06875`)

**We looked. We dropped it.** One-liner only: their flight-recorder traces vs pass/fail were interesting; we will not run their crew. Archived on [To-implement](/site/implement?done=1) as `impl-tracecoder-understand`. Do not add more TraceCoder diagrams.

**Analogy — flight data recorder.** After a crash you do not sit in a meeting and *guess* why the plane went down. You read the black box: airspeed, altitude, what the crew touched. TraceCoder’s claim is the same for generated code: a lone pass/fail bit is a crash report with no tape. They instrument the run, keep a **lab notebook of failed patches**, and roll back a “fix” that made things worse [@arxiv-2602-06875].

The abstract on disk (do not invent extra numbers): self-debug that only sees pass/fail is **stateless** and repeats mistakes; **fine-grained runtime traces**; causal analysis; Historical Lesson Learning from failed repairs; rollback so each iteration is a strict improvement; they report up to **34.43% relative Pass@1** [@arxiv-2602-06875].

### Tiny example (this repo, not their harness)

| Blind retry | With a tape |
| --- | --- |
| Test fails. Model rewrites the same function. Fails again. | Test fails. You keep the assertion text + stack (the tape). Next edit targets *that* line. |
| “It worked on my prompt” — no record of the bad patch | Lab notebook: “tried changing `order` to 21; children still sorted wrong because parent order is separate.” Do not replay that failed patch. |
| Merge because the model says 90 | Tape stays on the **fork**. the operator reads it. Then merge. |

Experience-following warns that replaying traces can **copy errors** — another reason the notebook is not the source of truth [@arxiv-2505-16067].

### Map to *his* sandbox (fork / lab)

Traces live on the **fork**. Lessons come back **only after he checks**. That is the [sandbox as fork/lab](/site/workbench-sandbox) story, not Docker.

| They run | We would actually run |
| --- | --- |
| A multi-agent debug crew on instrumented code | A3 diet: one change-set, re-fetch tools, **no** LLM history rewriter |
| Trace store + their lesson mechanism | Wiki page + test failure text on the branch. Cheaper. |
| Rollback of a bad repair | `git` on the fork. This turn does not commit. |

**Moral:** traces beat a lone boolean. **We still do not** stand up their crew. Abandoned.

## LLM-in-Sandbox — in DB (`arxiv-2601-16206`)

Abstract: an LLM given a **code sandbox as environment** (not merely a tool) generalizes better even on non-code tasks and uses the filesystem for long context [@arxiv-2601-16206].

| They run | We would actually run |
| --- | --- |
| Sandbox = the world | Everyday mash = the real repo. That is how the wiki grows. |
| Filesystem as extra context | Living Papers MD + meta bus. Second FS would fight “MD is source.” |
| Gated write-back from the sandbox | Park → write `data/md`. Autosave never writes. |

**Implement-path moral:** isolation-as-environment is the [sandbox](/site/workbench-sandbox) should-do. **Not** “give the model a toy FS and let it be the wiki.”

## SemaClaw / ChainGuard / ABAC — **not in DB**

Workbench wants capability language on tool rights. We **do not invent** their checks. Our moral is already shipped: lazy-load the matching **hand-authored** skill; ACI is the tool catalog [@swe-agent-2024] [@gorilla-2023].

If those PDFs become OA, `POST /api/papers/fetch` — do not cite fake ABAC numbers.

## ToxicSkills — **not in DB**

Name-only threat: malicious community packs. Our answer is **A4**, not a scanner product we did not ingest. See sandbox page.

## IntrAgent + Caesar — in DB, runtime refused

IntraView / IntrAgent abstract: rank, read, stop [@arxiv-2604-22861]. Caesar abstract: web traversal → dynamic KG; they report 13–23% creative-synthesis lift [@arxiv-2604-20855]. **We still refuse the crawl.** Fetch is allowlisted OA. Neighborhood is **our** meta graph, then open the real page.

That is a retrieve decision, not a coding runtime. It sits here so nobody “implements a paper runner” that is actually Caesar.

## What we would actually run (if a later park is cheap)

Order of honesty:

1. **Trusted coding** on the real tree (today).
2. **Untrusted snippet** → isolated process, no network, scratch cwd, fail closed ([sandbox](/site/workbench-sandbox)).
3. **Tests + cite-or-fetch envelope** as verify — not same-model grade [@knowrag-2026].
4. **On-demand MGM** only after the operator says hire ([MGM](/site/workbench-mgm)).
5. Never: ClawVM pager, Oblivion controller, Caesar, community skill market.

## See also

- [Execution](/site/execution) — paper idea → files
- [Maps](/site/maps) — math/diagram ↔ code
- [Fetch](/site/agents-fetch) · [Coding](/site/agents-coding)
