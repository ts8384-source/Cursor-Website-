from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path

from rag import DOMAIN
from rag.paths import CODE_DROP, CONTENT, CORPUS, CURSOR_DROP, MD, PAPERS_DROP, REFS_UI, ROOT, ensure_dirs


def _slug(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s[:80] or "doc"


def write_doc(
    *,
    ground: str,
    doc_id: str,
    title: str,
    text: str,
    domain: str = DOMAIN,
    source: str = "local",
) -> Path:
    ensure_dirs()
    folder = CORPUS / domain / ground / doc_id.replace(":", "_")
    folder.mkdir(parents=True, exist_ok=True)
    md = folder / "paper.md"
    md.write_text(f"# {title}\n\n{text.strip()}\n", encoding="utf-8")
    meta = {
        "doc_id": doc_id,
        "title": title,
        "source": source,
        "domain": domain,
        "ground": ground,
        "text_path": str(md),
        "saved_at": datetime.now(timezone.utc).isoformat(),
    }
    (folder / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return folder


def ingest_handbook(domain: str = DOMAIN) -> int:
    if not REFS_UI.exists():
        return 0
    n = 0
    for path in sorted(REFS_UI.glob("*.md")):
        text = path.read_text(encoding="utf-8", errors="ignore")
        if len(text.strip()) < 40:
            continue
        write_doc(
            ground="papers",
            doc_id=f"handbook:{path.stem}",
            title=path.stem.replace("-", " "),
            text=text,
            domain=domain,
            source="refs/ui-rag",
        )
        n += 1
    return n


def ingest_drop_folder(drop: Path, ground: str, domain: str = DOMAIN) -> int:
    if not drop.exists():
        return 0
    n = 0
    for path in drop.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".md", ".txt", ".py", ".ts", ".tsx", ".js", ".json"}:
            continue
        if path.stat().st_size > 400_000:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        rel = path.relative_to(drop).as_posix()
        write_doc(
            ground=ground,
            doc_id=f"{ground}:{_slug(rel)}",
            title=rel,
            text=text,
            domain=domain,
            source=str(drop.name),
        )
        n += 1
    return n


def seed_architecture(domain: str = DOMAIN) -> None:
    from rag.seed_architecture import ARCHITECTURE_MD, DIAGRAM, CURSOR_NOTE, CODE_NOTE

    write_doc(
        ground="md",
        doc_id="md:architecture-loop",
        title="Hybrid RAG local-site loop",
        text=ARCHITECTURE_MD,
        domain=domain,
        source="seed",
    )
    write_doc(
        ground="scribble",
        doc_id="scribble:ipad-architecture",
        title="iPad architecture sketch",
        text=(
            "Parked iPad diagram: Papers + Code (internet Fetch) + Scribbling (iPad) + Cursor "
            "feed Hybrid RAG. Output goes to ask, then Diagram, then md. md talks to Fetch "
            "and the vector DB. Save and Book keep write into the vector DB. Right side: "
            "Wikipedia + 3Blue1Brown-like visual UI on a local website, plus a coding agent "
            "for scripts and a web coding agent.\n\n" + ARCHITECTURE_MD
        ),
        domain=domain,
        source="seed",
    )
    write_doc(
        ground="cursor",
        doc_id="cursor:confirmed-loop",
        title="Confirmed loop from Cursor",
        text=CURSOR_NOTE,
        domain=domain,
        source="seed",
    )
    write_doc(
        ground="code",
        doc_id="code:rag-cli",
        title="RAG CLI and hybrid index",
        text=CODE_NOTE,
        domain=domain,
        source="seed",
    )
    from rag.paths import DIAGRAMS

    DIAGRAMS.mkdir(parents=True, exist_ok=True)
    (DIAGRAMS / "latest.json").write_text(json.dumps(DIAGRAM, indent=2), encoding="utf-8")


def ingest_all_local(domain: str = DOMAIN) -> dict[str, int]:
    seed_architecture(domain)
    from rag.code_meta import ingest_code_chunks

    counts: dict[str, int] = {
        "handbook": ingest_handbook(domain),
        "papers_drop": ingest_drop_folder(PAPERS_DROP, "papers", domain),
        "code_drop": ingest_drop_folder(CODE_DROP, "code", domain),
        "cursor_drop": ingest_drop_folder(CURSOR_DROP, "cursor", domain),
        "md_pages": ingest_drop_folder(MD, "md", domain) + ingest_drop_folder(CONTENT, "md", domain),
    }
    meta_chunks = ingest_code_chunks(domain)
    counts["code_meta"] = int(meta_chunks.get("chunks") or 0)
    counts["code_meta_warnings"] = int(meta_chunks.get("warnings") or 0)
    # A few live source files so the code ground is not only the seed note.
    for rel in (
        "rag/retrieve.py",
        "rag/cli.py",
        "backend/http/routes.ts",
        "backend/persist/pages.ts",
        "backend/persist/paper-db.ts",
        "backend/persist/memory.ts",
        "backend/persist/code-map.ts",
        "backend/persist/tool-catalog.ts",
        "frontend/src/site/SiteApp.tsx",
        "frontend/src/site/markdown.ts",
        "content/CONTROL.md",
        "server/inbox-plugin.ts",
        "server/vector-store.ts",
    ):
        path = ROOT / rel
        if path.exists():
            write_doc(
                ground="code",
                doc_id=f"code:{_slug(rel)}",
                title=rel,
                text=path.read_text(encoding="utf-8", errors="ignore")[:18_000],
                domain=domain,
                source="repo",
            )
            counts["repo_code"] = counts.get("repo_code", 0) + 1
    return counts
