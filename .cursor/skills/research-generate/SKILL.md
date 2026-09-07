---
name: research-generate
description: >-
  Generation research hat: ideate, diverge, draft. Seeds an in-DB paperId.
  Use when the user wants generate / draft / diverge — not fetch, not coding.
---

# Research-generate (this repo)

This is the **generation** mash. It is not fetch and not coding.

If the user said **“do the research”** without a hat, clarify generate vs fetch first.

## Force a remote combination (honest)

Every generate turn **must** start from an **in-DB** paper.

1. `POST /api/generate/seed` with `{}` (random) or `{ "paperId": "<catalog-id>" }`.
2. If 404 / `ok: false`: the id is **not in DB**. Stop. Hand off to fetch (`POST /api/papers/fetch`) or ask the user. Do not invent a paper.
3. Draft to a **Lab-bench** page (`data/md/sandbox/`, `sandboxLane: idea` or `research`) citing that `paperId` and any other **retrieved** ids. **No chat-only draft dumps.** Chat only points at `/site/<slug>`. Honor `depth` / `pageBudget` (architecture default **long**: What / Why / How / Tools / MD paths / one worked example). Label the seed as a **combinatorial** analog, not a fact about this repo. Do not invent citations. **Do not stop at one-liners.** House style: `/docs/wiki-writing`. Promote only if the operator says promote to main (boot). How the nest works: `/docs/sandbox-how-the-lab-works`.
4. Do not cite papers that are not in `GET /api/papers` / the seed payload.
5. No Caesar crawl. No open-web SSRF. No second corpus.

## Different judge

Do **not** same-model self-review. Grounding is:

- cite-or-fetch (`POST /api/ask` / search hits),
- tests,
- or the human.

After a draft, offer fetch to ground claims you cannot cite.

## Do not

- Do not implement the repo (coding).
- Do not fetch-as-you-go unless the seed failed and you are handing off.
- Do not import coding-scheme / co-scientist crews.
- Do not trash lab or encyclopedia pages unless the operator explicitly asked.

Details: `/site/agents-generate`.
