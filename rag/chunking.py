from __future__ import annotations

import re
from dataclasses import dataclass

@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    title: str
    text: str
    source: str = ""
    ground: str = ""


DEFAULT_SIZE = 1200
DEFAULT_OVERLAP = 150

_AT_CHUNK = re.compile(r"^\s*(?:#|//|\*)\s*@chunk\b")
_AT_END = re.compile(r"^\s*(?:#|//|\*)\s*@end\b")
_MD_HEADING = re.compile(r"^(#{1,6})\s+\S")
_AUTHOR_LINE = re.compile(
    r"""^(?:
        (?:Abstract|Introduction|Background|Related\s+Works?|Preliminaries|
           Methods?|Methodology|Experiments?|Results?|Discussion|
           Conclusions?|Acknowledgments?|References|Appendix|Limitations|
           Future\s+Work)\.?
        |
        \d{1,2}(?:\.\d+){0,3}[.)]?\s+[A-Z][\w].{0,80}
        |
        [IVX]+\.\s+[A-Z][\w].{0,80}
    )$""",
    re.IGNORECASE | re.VERBOSE,
)
_AUTHOR_INLINE = re.compile(
    r"^(Abstract|Introduction|Background|Related\s+Works?|Conclusion|References)\.\s+\S",
    re.IGNORECASE,
)
_FENCE = re.compile(r"^```")


# @chunk
# id: code:loop.chunk_text
# type: function
# implements: page:hybrid-rag
# citations: [arxiv-2410-13070]
# tags: [ingest, chunk]
# summary: Heading-aware MD/paper splits; 1200/150 only on unmarked blobs
# @end
def chunk_text(
    text: str,
    *,
    doc_id: str,
    title: str,
    ground: str = "",
    size: int = DEFAULT_SIZE,
    overlap: int = DEFAULT_OVERLAP,
) -> list[Chunk]:
    if not text or not text.strip():
        return []
    pieces = _split_document(text, size=size, overlap=overlap)
    prefix = f"[{title} | {ground or doc_id}] "
    chunks: list[Chunk] = []
    for i, piece in enumerate(pieces):
        if not piece:
            continue
        chunks.append(
            Chunk(
                chunk_id=f"{doc_id}#{i}",
                doc_id=doc_id,
                title=title,
                text=prefix + piece,
                source=doc_id,
                ground=ground,
            )
        )
    return chunks


def _split_document(text: str, *, size: int, overlap: int) -> list[str]:
    if _has_at_chunk(text):
        out: list[str] = []
        for kind, block in _split_at_chunk_regions(text):
            if kind == "chunk":
                collapsed = _collapse(block)
                if collapsed:
                    out.append(collapsed)
            else:
                out.extend(_structure_or_fixed(block, size=size, overlap=overlap))
        return out
    return _structure_or_fixed(text, size=size, overlap=overlap)


def _has_at_chunk(text: str) -> bool:
    return any(_AT_CHUNK.match(line) for line in text.splitlines())


def _split_at_chunk_regions(text: str) -> list[tuple[str, str]]:
    """@chunk…@end plus following source until the next @chunk is one atomic chunk."""
    lines = text.splitlines()
    regions: list[tuple[str, str]] = []
    buf: list[str] = []
    kind = "plain"

    def flush() -> None:
        nonlocal buf, kind
        if buf:
            regions.append((kind, "\n".join(buf)))
        buf = []

    i = 0
    while i < len(lines):
        line = lines[i]
        if _AT_CHUNK.match(line):
            if kind == "plain":
                flush()
            kind = "chunk"
            buf.append(line)
            i += 1
            while i < len(lines) and not _AT_CHUNK.match(lines[i]):
                buf.append(lines[i])
                if _AT_END.match(lines[i]):
                    i += 1
                    while i < len(lines) and not _AT_CHUNK.match(lines[i]):
                        buf.append(lines[i])
                        i += 1
                    break
                i += 1
            flush()
            kind = "plain"
            continue
        buf.append(line)
        i += 1
    flush()
    return regions


def _structure_or_fixed(text: str, *, size: int, overlap: int) -> list[str]:
    sections = _split_on_headings(text)
    if len(sections) <= 1:
        body = _collapse(sections[0] if sections else text)
        return _fixed_window(body, size=size, overlap=overlap) if body else []
    out: list[str] = []
    for sec in sections:
        body = _collapse(sec)
        if not body:
            continue
        if len(body) <= size:
            out.append(body)
        else:
            out.extend(_fixed_window(body, size=size, overlap=overlap))
    return out


def _split_on_headings(text: str) -> list[str]:
    body, prefix = _strip_frontmatter(text)
    lines = body.splitlines()
    sections: list[list[str]] = [[]]
    in_fence = False
    saw_heading = False

    for line in lines:
        if _FENCE.match(line.strip()):
            in_fence = not in_fence
            sections[-1].append(line)
            continue
        if not in_fence and _is_heading(line):
            if saw_heading or any(s.strip() for s in sections[-1]):
                sections.append([line])
            else:
                sections[-1].append(line)
            saw_heading = True
            continue
        sections[-1].append(line)

    texts = ["\n".join(s).strip() for s in sections if any(x.strip() for x in s)]
    if prefix.strip() and texts:
        texts[0] = prefix.strip() + "\n\n" + texts[0]
    elif prefix.strip():
        texts = [prefix.strip()]
    return texts


def _strip_frontmatter(text: str) -> tuple[str, str]:
    if not text.startswith("---"):
        return text, ""
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return text, ""
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            fm = "\n".join(lines[: i + 1])
            rest = "\n".join(lines[i + 1 :])
            return rest, fm
    return text, ""


def _is_heading(line: str) -> bool:
    s = line.strip()
    if not s or _AT_CHUNK.match(s) or _AT_END.match(s):
        return False
    if _MD_HEADING.match(s):
        return True
    if _AUTHOR_LINE.match(s):
        return True
    if _AUTHOR_INLINE.match(s):
        return True
    return False


def _collapse(text: str) -> str:
    return " ".join(text.split())


def _fixed_window(clean: str, *, size: int, overlap: int) -> list[str]:
    if not clean:
        return []
    pieces: list[str] = []
    start = 0
    while start < len(clean):
        end = min(len(clean), start + size)
        pieces.append(clean[start:end])
        if end == len(clean):
            break
        start = max(end - overlap, start + 1)
    return pieces
