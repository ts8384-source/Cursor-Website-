from __future__ import annotations

import json
from datetime import datetime, timezone

from rag import DOMAIN, GROUNDS
from rag.ingest import write_doc
from rag.paths import BOOKKEEP, DIAGRAMS, INBOX, MD, ensure_dirs
from rag.retrieve import lookup_idea, rebuild_all_grounds
from rag.seed_architecture import ARCHITECTURE_MD, DIAGRAM


def _bookkeep(kind: str, detail: dict) -> None:
    ensure_dirs()
    event = {"at": datetime.now(timezone.utc).isoformat(), "kind": kind, "detail": detail}
    with (BOOKKEEP / "log.jsonl").open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event) + "\n")


def _inbox_scribble() -> tuple[str, str]:
    msg = INBOX / "message.md"
    text = msg.read_text(encoding="utf-8", errors="ignore") if msg.exists() else ""
    png = INBOX / "latest.png"
    note = f"PNG parked: {png.exists()} ({png.stat().st_size if png.exists() else 0} bytes)"
    return text, note


def _article(query: str, retrieved: dict) -> str:
    lines = [
        "# Hybrid RAG local-site loop",
        "",
        f"_Ask:_ {query}",
        "",
        f"_Retrieved {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}. Isolated grounds, labeled merge only._",
        "",
        "## Architecture (from the iPad)",
        "",
        "Papers + Code (Fetch) + Scribbling + Cursor → **Hybrid RAG** → **ask** → **Diagram** → **md** ↔ vector DB.",
        "Save and Book keep write back into the index. The local site is Wikipedia-like + a 3b1b visual.",
        "",
        "## Retrieved by source",
        "",
    ]
    for ground, hits in (retrieved.get("per_ground") or {}).items():
        lines.append(f"### {ground}")
        lines.append("")
        if not hits:
            lines.append("_No hits in this ground yet. Drop files or park again after rebuild._")
            lines.append("")
            continue
        for hit in hits[:5]:
            title = hit.get("title") or hit.get("doc_id")
            hid = hit.get("chunk_id") or hit.get("doc_id")
            snippet = (hit.get("text") or "").replace("\n", " ")[:240]
            lines.append(f"- **[{hid}]** {title} ({hit.get('score'):.4f}) — {snippet}")
        lines.append("")
    cites = []
    for ground, hits in (retrieved.get("per_ground") or {}).items():
        for hit in hits[:5]:
            hid = hit.get("chunk_id") or hit.get("doc_id")
            if hid:
                cites.append(f"{hid} ({ground})")
    lines.append("## Citations")
    lines.append("")
    if cites:
        for c in cites:
            lines.append(f"- `{c}`")
    else:
        lines.append("_No hits. Not in DB — POST /api/papers/fetch. Do not invent._")
    lines.append("")
    lines.append("## How the loop is wired")
    lines.append("")
    lines.append(ARCHITECTURE_MD.split("## What goes in", 1)[-1] if "## What goes in" in ARCHITECTURE_MD else "")
    return "\n".join(lines).strip() + "\n"


def run_ask(query: str | None = None, *, rebuild: bool = False) -> dict:
    ensure_dirs()
    scribble, png_note = _inbox_scribble()
    idea = (query or "").strip() or "hybrid RAG ask diagram md vector DB local website"
    if scribble:
        write_doc(
            ground="scribble",
            doc_id="scribble:latest-park",
            title="Latest parked canvas",
            text=f"{idea}\n\n{png_note}\n\n{scribble[:12_000]}",
            source="inbox",
        )
    from rag.retrieve import HybridIndex

    if rebuild:
        rebuild_all_grounds(DOMAIN)
    else:
        HybridIndex(DOMAIN, "scribble").rebuild()

    retrieved = lookup_idea(idea, domain=DOMAIN, grounds=GROUNDS, k=6)
    article = _article(idea, retrieved)
    MD.mkdir(parents=True, exist_ok=True)
    md_path = MD / "architecture.md"
    md_path.write_text(article, encoding="utf-8")
    write_doc(
        ground="md",
        doc_id="md:architecture-loop",
        title="Hybrid RAG local-site loop",
        text=article,
        source="ask",
    )
    HybridIndex(DOMAIN, "md").rebuild()

    dest = DIAGRAMS / "latest.json"
    existing: dict = {}
    if dest.exists():
        try:
            loaded = json.loads(dest.read_text(encoding="utf-8"))
            if isinstance(loaded, dict) and loaded.get("nodes"):
                existing = loaded
        except json.JSONDecodeError:
            existing = {}
    diagram = dict(existing or DIAGRAM)
    diagram.setdefault("id", "hybrid-rag-loop")
    diagram["updatedAt"] = datetime.now(timezone.utc).isoformat()
    diagram["query"] = idea
    DIAGRAMS.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(diagram, indent=2), encoding="utf-8")

    hit_n = sum(len(v) for v in retrieved["per_ground"].values())
    _bookkeep(
        "ask",
        {"query": idea, "hits": hit_n, "md": str(md_path), "png": png_note},
    )
    return {
        "ok": True,
        "query": idea,
        "hits": hit_n,
        "md": "data/md/architecture.md",
        "diagram": "data/diagrams/latest.json",
        "retrieved": retrieved,
        "citeOrFetch": {
            "mustCite": True,
            "notInDb": None if hit_n else "No hits. POST /api/papers/fetch — do not invent.",
            "fetch": "POST /api/papers/fetch",
        },
    }


def latest_site() -> dict:
    ensure_dirs()
    md = MD / "architecture.md"
    diagram = DIAGRAMS / "latest.json"
    log = BOOKKEEP / "log.jsonl"
    events = []
    if log.exists():
        for line in log.read_text(encoding="utf-8").splitlines()[-20:]:
            try:
                events.append(json.loads(line))
            except json.JSONDecodeError:
                continue
    return {
        "article": md.read_text(encoding="utf-8") if md.exists() else ARCHITECTURE_MD,
        "diagram": json.loads(diagram.read_text(encoding="utf-8")) if diagram.exists() else DIAGRAM,
        "bookkeep": list(reversed(events)),
        "articlePath": "data/md/architecture.md",
    }
