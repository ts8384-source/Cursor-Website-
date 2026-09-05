from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Chunk:
    chunk_id: str
    doc_id: str
    title: str
    text: str
    source: str = ""
    ground: str = ""


def chunk_text(
    text: str,
    *,
    doc_id: str,
    title: str,
    ground: str = "",
    size: int = 1200,
    overlap: int = 150,
) -> list[Chunk]:
    clean = " ".join(text.split())
    if not clean:
        return []
    prefix = f"[{title} | {ground or doc_id}] "
    chunks: list[Chunk] = []
    start = 0
    i = 0
    while start < len(clean):
        end = min(len(clean), start + size)
        piece = prefix + clean[start:end]
        chunks.append(
            Chunk(
                chunk_id=f"{doc_id}#{i}",
                doc_id=doc_id,
                title=title,
                text=piece,
                source=doc_id,
                ground=ground,
            )
        )
        if end == len(clean):
            break
        start = max(end - overlap, start + 1)
        i += 1
    return chunks
