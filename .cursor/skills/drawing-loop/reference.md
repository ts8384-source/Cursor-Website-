# Drawing-loop reference

## Park files

| Path | Role |
| --- | --- |
| `inbox/PENDING` | Parked turn flag. Delete when done. |
| `inbox/message.md` | Labels, notes, shape list |
| `inbox/latest.png` | Raster of the pad (ink, and on stamped boards the figure underneath) |
| `inbox/meta.json` | `savedAt`, `hasPng`, `parked`, plus tied-board `boardId` / `pageId` / `paperIds` / `sourceType` / `surface` / `assetPath` |
| `inbox/latest.json` | Raw tldraw snapshot |

## Grounds (never cross-RRF)

`papers`, `code`, `scribble`, `cursor`, `md`. Rebuild: `python -m rag.cli seed` then `python -m rag.cli rebuild`.

## Permanent vs decaying

- **Permanent:** `data/papers/*.md`, `data/papers/db.json` (summaries, figures, math terms, execution notes). Future reference. Never run forgetting on papers.
- **Decaying:** `data/memory/user.jsonl`, `data/memory/project.jsonl`. Strength halves on a per-item half-life. Retrieval (`POST /api/memory/touch`) boosts strength. Below threshold items are forgotten from the default list but stay in the archive file. A correction that contradicts a note must `POST /api/memory` with `supersedes: <old-id>` (old row stays on disk, hidden from default GET and retrieve). `POST /api/memory/forget` appends a named bookkeep `AUDIT` (`who` / `what` / `why` / `related`) on forget-lanes only — never on papers, `data/md`, or `data/docs`.

Forgetting here is Ebbinghaus-style decay for a student loop. It is **not** a full Agent Workflow Memory induction pipeline. Cite AWM; do not claim we induce web workflows.

## Code on demand

`POST /api/maps/fetch` with `{ "q": "RRF", "kind": "math" }` (or `diagram`). Searches the **code** ground when the index is up, always merges the curated execution table, writes `data/maps/edges.json`. Bidirectional: math/diagram ↔ repo path.

## Metadata bus

Shared records (not extra YAML for humans only):

| Field | Role |
| --- | --- |
| `id` | `page:<slug>`, paper catalog id, `node:<diagramId>:<nodeId>`, `diagram:<id>`, `module:<name>`, `board:<source>-<suffix>`, `code:<domain>.<symbol>` |
| `type` | `page` \| `paper` \| `node` \| `module` \| `diagram` \| `board` \| `code` |
| `boardKey` / `sourceSlug` | tldraw persistence key and originating page slug (tied boards) |
| `summary.short` / `summary.long` | One-line canvas expand vs panel / agent fetch |
| `citations` / `related` | Paper ids and other meta ids |
| wiki graph | `GET /api/graph` and `GET /api/graph/neighborhood?id=` — same meta links, no invented edges |

Park loop must write or update these. Creating nodes: `.cursor/skills/diagram-create/SKILL.md`.

## The-scheme language (adapted)

Hats are **tools**, not a research crew:

1. **Read the board** — inbox PNG + MD.
2. **Retrieve** — isolated grounds, labeled merge. Cite-or-fetch: every fact cites a hit id; missing work → `POST /api/papers/fetch`, do not invent.
3. **Write MD** — Living Papers source of truth. **Working turns write `data/md/sandbox/` first.** Chat only points at `/site/<slug>`. No chat-only encyclopedia dumps. Lab bench = `/site/sandbox`. How-to = `/docs/sandbox-how-the-lab-works`. Boot = `data/md` `/site`. Doc = `data/docs` `/docs`. Trash bin = `POST /api/sandbox/trash` (lab only).
4. **Ingest** — named OA papers; rebuild papers ground.
5. **Map** — math/diagram to code; paper idea to execution files.
6. **Remember** — project/user memory with forgetting; papers stay permanent. Contradictions write `supersedes`, not a second append.
7. **Close** — delete PENDING; CONTROL.md matches the new tools.

Do not stand up RSNN / Co-Assistant specialist agents.

## Condensed returns + RAM

Isolated Task helpers return **ids + gist** (`POST /api/condensed`). One pad `:5174`, one API `:5175`. API RAG is BM25-only unless `RAG_DENSE=1`. Do not rebuild indexes every park. v1 snapshot: `/site/future`.
