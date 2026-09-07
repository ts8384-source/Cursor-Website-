"""Parse @chunk comment metadata without executing source.

Comment-only. Same record shape as GET /api/meta (type=code).
"""

from __future__ import annotations

import json
import re
import warnings
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

from rag import DOMAIN
from rag.paths import DATA, ROOT

KINDS = frozenset({"function", "class", "module", "block", "const", "type", "method"})
ID_RE = re.compile(r"^code:[A-Za-z0-9][A-Za-z0-9._:-]*$")
FIELD_LINE = re.compile(r"^([A-Za-z][A-Za-z0-9_]*)\s*[:=]\s*(.*)$")
ATTR = re.compile(r"([A-Za-z][A-Za-z0-9_]*)\s*[:=]\s*(\[[^\]]*\]|[^\s]+)")
PY_DEF = re.compile(r"^(async\s+def|def|class)\s+")
TS_DEF = re.compile(
    r"^(export\s+)?(default\s+)?(async\s+)?(function\s+|class\s+|const\s+|let\s+|type\s+|interface\s+)"
)

CODE_EXTS = {".py", ".ts", ".tsx", ".js", ".jsx"}
DEFAULT_ROOTS = ("rag", "backend")
DEFAULT_EXCLUDE = (
    "node_modules",
    ".git",
    "dist",
    "data",
    "__pycache__",
    ".venv",
    "chroma",
    "coverage",
)

KNOWN_KEYS = {
    "id",
    "type",
    "kind",
    "title",
    "summary",
    "summary_long",
    "summarylong",
    "tags",
    "citations",
    "related",
    "implements",
    "derived_from",
    "derivedfrom",
    "updated",
    "glossary",
}


@dataclass
class ParseWarning:
    path: str
    line: int
    message: str

    def as_dict(self) -> dict[str, Any]:
        return {"path": self.path, "line": self.line, "message": self.message}


@dataclass
class RawChunk:
    fields: dict[str, str]
    start_line: int  # 1-based, @chunk line
    body_start: int  # 1-based first source line after metadata
    body_end: int  # 1-based inclusive
    body: str


@dataclass
class ScanResult:
    records: list[dict[str, Any]] = field(default_factory=list)
    warnings: list[ParseWarning] = field(default_factory=list)
    files: int = 0
    chunks: int = 0


def scan_config_path() -> Path:
    return DATA / "meta" / "code-scan.json"


def records_path() -> Path:
    return DATA / "meta" / "code.json"


def lint_path() -> Path:
    return DATA / "meta" / "code-lint.json"


def load_scan_config() -> dict[str, Any]:
    path = scan_config_path()
    if not path.exists():
        return {
            "roots": list(DEFAULT_ROOTS),
            "extensions": sorted(CODE_EXTS),
            "exclude": list(DEFAULT_EXCLUDE),
        }
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        warnings.warn(f"code-scan.json unreadable, using defaults: {exc}", stacklevel=2)
        return {
            "roots": list(DEFAULT_ROOTS),
            "extensions": sorted(CODE_EXTS),
            "exclude": list(DEFAULT_EXCLUDE),
        }
    roots = data.get("roots") or list(DEFAULT_ROOTS)
    exts = data.get("extensions") or sorted(CODE_EXTS)
    exclude = data.get("exclude") or list(DEFAULT_EXCLUDE)
    return {"roots": list(roots), "extensions": list(exts), "exclude": list(exclude)}


def write_default_scan_config() -> Path:
    path = scan_config_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text(
            json.dumps(
                {
                    "roots": list(DEFAULT_ROOTS),
                    "extensions": sorted(CODE_EXTS),
                    "exclude": list(DEFAULT_EXCLUDE),
                    "note": "Forks add roots here (repo-relative). Never list node_modules.",
                },
                indent=2,
            )
            + "\n",
            encoding="utf-8",
        )
    return path


def _comment_kind(suffix: str) -> str:
    if suffix == ".py":
        return "hash"
    return "c"


def _strip_line_comment(line: str, kind: str) -> str | None:
    raw = line.rstrip("\n")
    stripped = raw.strip()
    if kind == "hash":
        if stripped.startswith("#"):
            return stripped[1:].lstrip()
        return None
    if stripped.startswith("//"):
        return stripped[2:].lstrip()
    if stripped.startswith("*") and not stripped.startswith("*/"):
        return stripped[1:].lstrip()
    if stripped.startswith("/*"):
        inner = stripped[2:]
        if inner.rstrip().endswith("*/"):
            inner = inner.rstrip()[:-2].rstrip()
        return inner.lstrip()
    if stripped.endswith("*/") and not stripped.startswith("//"):
        inner = stripped[:-2].rstrip()
        if inner.startswith("*"):
            inner = inner[1:].lstrip()
        return inner
    return None


def _is_comment_or_blank(line: str, kind: str) -> bool:
    if not line.strip():
        return True
    return _strip_line_comment(line, kind) is not None


def _parse_list(raw: str) -> list[str]:
    text = raw.strip()
    if not text:
        return []
    if text.startswith("[") and text.endswith("]"):
        text = text[1:-1]
    parts = [p.strip().strip("\"'") for p in text.split(",")]
    return [p for p in parts if p]


def _parse_attrs(text: str) -> dict[str, str]:
    out: dict[str, str] = {}
    rest = text.strip()
    if rest.startswith("@chunk"):
        rest = rest[len("@chunk") :].strip()
    for key, val in ATTR.findall(rest):
        out[key.lower()] = val.strip()
    return out


def _normalize_fields(fields: dict[str, str]) -> dict[str, str]:
    norm: dict[str, str] = {}
    for key, val in fields.items():
        k = key.lower()
        if k == "summarylong":
            k = "summary_long"
        if k == "derivedfrom":
            k = "derived_from"
        if k == "kind":
            k = "type"
        norm[k] = val
    return norm


def parse_comment_chunks(text: str, *, path: str = "mem.py", suffix: str | None = None) -> tuple[list[RawChunk], list[ParseWarning]]:
    """Extract @chunk blocks from source text. Never executes code."""
    kind = _comment_kind(suffix or Path(path).suffix.lower() or ".py")
    lines = text.replace("\r\n", "\n").split("\n")
    warns: list[ParseWarning] = []
    raws: list[RawChunk] = []
    i = 0
    n = len(lines)
    in_block = False
    block_fields: dict[str, str] = {}
    block_start = 1
    saw_end = False

    def flush_unclosed(at: int) -> None:
        nonlocal in_block, block_fields
        if in_block:
            if block_fields.get("id"):
                # Treat as one-liner / implicit end before next chunk or EOF.
                body_start = at + 1
                body_end, body = _capture_body(lines, at, kind)
                raws.append(
                    RawChunk(
                        fields=dict(block_fields),
                        start_line=block_start,
                        body_start=body_start,
                        body_end=body_end,
                        body=body,
                    )
                )
            else:
                warns.append(ParseWarning(path, block_start, "unclosed @chunk without id; skipped"))
        in_block = False
        block_fields = {}

    while i < n:
        comment = _strip_line_comment(lines[i], kind)
        if comment is None:
            if in_block and not _is_comment_or_blank(lines[i], kind):
                # Code started without @end — implicit close.
                body_end, body = _capture_body(lines, i, kind)
                if block_fields.get("id"):
                    raws.append(
                        RawChunk(
                            fields=dict(block_fields),
                            start_line=block_start,
                            body_start=i + 1,
                            body_end=body_end,
                            body=body,
                        )
                    )
                else:
                    warns.append(ParseWarning(path, block_start, "@chunk missing id; skipped"))
                in_block = False
                block_fields = {}
            i += 1
            continue

        if comment.startswith("@chunk"):
            if in_block:
                flush_unclosed(i)
            block_start = i + 1
            inline = _parse_attrs(comment)
            block_fields = _normalize_fields(inline)
            rest = comment[len("@chunk") :].strip()
            # One-liner: attrs on the @chunk line and next non-comment is code, or @end next.
            nxt = _next_nonempty(lines, i + 1)
            nxt_comment = _strip_line_comment(lines[nxt], kind) if nxt < n else None
            if rest and (nxt >= n or nxt_comment is None or nxt_comment.startswith("@chunk")):
                body_end, body = _capture_body(lines, nxt if nxt < n else i + 1, kind)
                if block_fields.get("id"):
                    raws.append(
                        RawChunk(
                            fields=dict(block_fields),
                            start_line=block_start,
                            body_start=min(nxt + 1, n + 1) if nxt < n else i + 2,
                            body_end=body_end,
                            body=body,
                        )
                    )
                else:
                    warns.append(ParseWarning(path, block_start, "@chunk missing id; skipped"))
                in_block = False
                block_fields = {}
                i += 1
                continue
            if rest and nxt_comment == "@end":
                body_end, body = _capture_body(lines, nxt + 1, kind)
                if block_fields.get("id"):
                    raws.append(
                        RawChunk(
                            fields=dict(block_fields),
                            start_line=block_start,
                            body_start=nxt + 2,
                            body_end=body_end,
                            body=body,
                        )
                    )
                else:
                    warns.append(ParseWarning(path, block_start, "@chunk missing id; skipped"))
                in_block = False
                block_fields = {}
                i = nxt + 1
                continue
            in_block = True
            i += 1
            continue

        if comment == "@end":
            if not in_block:
                warns.append(ParseWarning(path, i + 1, "stray @end; ignored"))
                i += 1
                continue
            body_end, body = _capture_body(lines, i + 1, kind)
            if block_fields.get("id"):
                raws.append(
                    RawChunk(
                        fields=dict(block_fields),
                        start_line=block_start,
                        body_start=i + 2,
                        body_end=body_end,
                        body=body,
                    )
                )
            else:
                warns.append(ParseWarning(path, block_start, "@chunk missing id; skipped"))
            in_block = False
            block_fields = {}
            saw_end = True
            i += 1
            continue

        if in_block:
            m = FIELD_LINE.match(comment)
            if m:
                key, val = m.group(1), m.group(2)
                lk = key.lower()
                if lk not in KNOWN_KEYS:
                    warns.append(ParseWarning(path, i + 1, f"unknown field {key!r}; kept"))
                block_fields = {**block_fields, **_normalize_fields({lk: val})}
            elif comment and not comment.startswith("@"):
                warns.append(ParseWarning(path, i + 1, f"non-field comment in @chunk: {comment[:40]!r}"))
        i += 1

    if in_block:
        flush_unclosed(n)

    _ = saw_end
    return raws, warns


def _next_nonempty(lines: list[str], start: int) -> int:
    i = start
    while i < len(lines) and not lines[i].strip():
        i += 1
    return i


def _is_def(line: str, kind: str) -> bool:
    s = line.rstrip()
    if not s:
        return False
    left = s.lstrip()
    if kind == "hash":
        return bool(PY_DEF.match(left))
    return bool(TS_DEF.match(left))


def _capture_body(lines: list[str], start: int, kind: str) -> tuple[int, str]:
    """Take the following definition (indent / braces) or a short run of lines."""
    i = _next_nonempty(lines, start)
    if i >= len(lines):
        return max(start, 0), ""
    if _strip_line_comment(lines[i], kind) and _strip_line_comment(lines[i], kind).startswith("@chunk"):
        return start, ""
    if not _is_def(lines[i], kind):
        end = min(len(lines), i + 40)
        for j in range(i + 1, end):
            c = _strip_line_comment(lines[j], kind)
            if c and c.startswith("@chunk"):
                end = j
                break
        piece = "\n".join(lines[i:end]).rstrip()
        return end, piece

    if kind == "hash":
        indent = len(lines[i]) - len(lines[i].lstrip(" "))
        j = i + 1
        while j < len(lines):
            s = lines[j]
            c = _strip_line_comment(s, kind)
            if c and c.startswith("@chunk"):
                break
            if not s.strip():
                j += 1
                continue
            lead = len(s) - len(s.lstrip(" "))
            if s.strip() and lead <= indent and j > i:
                break
            j += 1
        return j, "\n".join(lines[i:j]).rstrip()

    depth = 0
    started = False
    j = i
    while j < len(lines):
        s = lines[j]
        c = _strip_line_comment(s, kind)
        if c and c.startswith("@chunk") and started and depth == 0:
            break
        for ch in s:
            if ch == "{":
                depth += 1
                started = True
            elif ch == "}":
                depth -= 1
        j += 1
        if started and depth <= 0:
            break
        if not started and j > i + 80:
            break
    return j, "\n".join(lines[i:j]).rstrip()


def record_from_raw(raw: RawChunk, *, rel_path: str, warns: list[ParseWarning]) -> dict[str, Any] | None:
    fields = _normalize_fields(raw.fields)
    cid = fields.get("id", "").strip()
    if not cid:
        warns.append(ParseWarning(rel_path, raw.start_line, "missing id; skipped"))
        return None
    if not ID_RE.match(cid):
        warns.append(ParseWarning(rel_path, raw.start_line, f"invalid id {cid!r}; skipped"))
        return None
    kind = fields.get("type", "block").strip().lower()
    if kind == "code":
        kind = "block"
    if kind not in KINDS:
        warns.append(ParseWarning(rel_path, raw.start_line, f"invalid type/kind {kind!r}; skipped"))
        return None
    title = fields.get("title", "").strip() or cid.split(".")[-1].replace("_", " ")
    short = fields.get("summary", "").strip() or title
    long = fields.get("summary_long", "").strip() or short
    tags = _parse_list(fields.get("tags", ""))
    if kind not in tags:
        tags = [kind, *tags]
    citations = _parse_list(fields.get("citations", ""))
    related = _parse_list(fields.get("related", ""))
    implements = _parse_list(fields.get("implements", ""))
    derived = _parse_list(fields.get("derived_from", ""))
    for extra in implements + derived:
        if extra and extra not in related:
            related.append(extra)
    updated = fields.get("updated", "").strip() or datetime.now(timezone.utc).date().isoformat()
    glossary: list[dict[str, str]] = []
    if fields.get("glossary"):
        warns.append(ParseWarning(rel_path, raw.start_line, "glossary in comments is ignored (use related pages)"))
    return {
        "id": cid,
        "type": "code",
        "title": title,
        "href": f"/site/code-meta#{cid}",
        "summary": {"short": short, "long": long},
        "tags": tags,
        "citations": citations,
        "related": related,
        "glossary": glossary,
        "updated": updated,
        "kind": kind,
        "implements": implements,
        "derived_from": derived,
        "path": rel_path.replace("\\", "/"),
        "pageId": next((x for x in implements if x.startswith("page:")), None),
        "paperIds": [c for c in citations if c],
    }


def iter_source_files(root: Path | None = None, config: dict[str, Any] | None = None) -> Iterable[Path]:
    cfg = config or load_scan_config()
    base = root or ROOT
    exclude = {str(x).replace("\\", "/").strip("/") for x in cfg["exclude"]}
    exts = {e if str(e).startswith(".") else f".{e}" for e in cfg["extensions"]}
    for rel in cfg["roots"]:
        folder = base / rel
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if not path.is_file():
                continue
            if path.suffix.lower() not in exts:
                continue
            try:
                parts = path.relative_to(base).parts
            except ValueError:
                continue
            if any(p in exclude for p in parts):
                continue
            if path.stat().st_size > 400_000:
                continue
            yield path


def scan_tree(root: Path | None = None, config: dict[str, Any] | None = None) -> ScanResult:
    base = root or ROOT
    cfg = config or load_scan_config()
    result = ScanResult()
    seen: dict[str, str] = {}
    for path in iter_source_files(base, cfg):
        result.files += 1
        rel = path.relative_to(base).as_posix()
        try:
            text = path.read_text(encoding="utf-8", errors="ignore")
        except OSError as exc:
            result.warnings.append(ParseWarning(rel, 1, f"unreadable: {exc}"))
            continue
        raws, warns = parse_comment_chunks(text, path=rel, suffix=path.suffix.lower())
        result.warnings.extend(warns)
        for raw in raws:
            rec = record_from_raw(raw, rel_path=rel, warns=result.warnings)
            if rec is None:
                continue
            if rec["id"] in seen:
                result.warnings.append(
                    ParseWarning(rel, raw.start_line, f"duplicate id {rec['id']} (first {seen[rec['id']]}); skipped")
                )
                continue
            seen[rec["id"]] = rel
            rec["_body"] = raw.body
            rec["_startLine"] = raw.start_line
            result.records.append(rec)
            result.chunks += 1
    return result


def public_record(rec: dict[str, Any]) -> dict[str, Any]:
    return {k: v for k, v in rec.items() if not k.startswith("_")}


def write_bus(result: ScanResult) -> Path:
    DATA.joinpath("meta").mkdir(parents=True, exist_ok=True)
    payload = {
        "schema": "data/meta/schema.json",
        "bus": "Same GET /api/meta records; type=code.",
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(result.records),
        "records": [public_record(r) for r in result.records],
    }
    dest = records_path()
    dest.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    lint_path().write_text(
        json.dumps({"count": len(result.warnings), "warnings": [w.as_dict() for w in result.warnings]}, indent=2)
        + "\n",
        encoding="utf-8",
    )
    for w in result.warnings:
        warnings.warn(f"{w.path}:{w.line}: {w.message}", stacklevel=2)
    return dest


def ingest_code_chunks(domain: str = DOMAIN) -> dict[str, Any]:
    """Scan allowlisted source, upsert meta bus file, write code-ground corpus docs."""
    from rag.ingest import write_doc

    write_default_scan_config()
    result = scan_tree()
    write_bus(result)
    n = 0
    for rec in result.records:
        body = rec.get("_body") or rec["summary"]["long"]
        header = [
            f"# {rec['title']}",
            "",
            f"id: {rec['id']}",
            f"type: code",
            f"kind: {rec.get('kind', 'block')}",
            f"path: {rec.get('path', '')}",
            f"implements: {', '.join(rec.get('implements') or [])}",
            f"citations: {', '.join(rec.get('citations') or [])}",
            f"tags: {', '.join(rec.get('tags') or [])}",
            f"summary: {rec['summary']['short']}",
            "",
            body,
        ]
        write_doc(
            ground="code",
            doc_id=rec["id"],
            title=f"{rec.get('path', '')} {rec['id']}".strip(),
            text="\n".join(header),
            domain=domain,
            source="code-meta",
        )
        n += 1
    return {
        "files": result.files,
        "chunks": result.chunks,
        "warnings": len(result.warnings),
        "records_path": str(records_path().relative_to(ROOT)).replace("\\", "/"),
    }
