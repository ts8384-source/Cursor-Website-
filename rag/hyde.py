"""Query-time HyDE per isolated ground. Template fallback if no LLM is wired."""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from rag.retrieve import HybridIndex

FIELD_FOR = {
    "papers": "research papers and usability handbook chapters",
    "code": "source code and scripts in a local Vite + Python loop",
    "scribble": "iPad canvas ink and parked architecture sketches",
    "cursor": "Cursor agent notes and chat decisions",
    "md": "generated markdown articles on the local site",
}


def template_hyde(goal: str, ground: str, bias: list[str]) -> str:
    field = FIELD_FOR.get(ground, ground)
    terms = ", ".join(bias[:8]) or "hybrid retrieval, BM25, Chroma, reciprocal rank fusion"
    return (
        f"Hypothetical {field} abstract for: {goal}. "
        f"Key vocabulary: {terms}. "
        f"The {ground} corpus is searched alone. Dense BGE embeddings and BM25 "
        f"are fused with reciprocal rank fusion. Labeled hits merge after retrieve; "
        f"lists are never RRF-fused across sources. Save and bookkeep write back "
        f"into the vector index so later asks can find this outline."
    )


def hyde_document(goal: str, ground: str, bias: list[str] | None = None) -> str:
    # LLM complete() is optional; Co-Assistant returns empty without a backend.
    return template_hyde(goal, ground, bias or [])


def hyde_search(index: HybridIndex, goal: str, ground: str, k: int = 8, bias: list[str] | None = None):
    hypo = hyde_document(goal, ground, bias)
    if not hypo:
        return "", []
    if index.empty():
        return hypo, []
    return hypo, index.search(hypo, k=k, lexical_query=goal)
