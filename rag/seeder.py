"""Light seeder: short lexical bias + bags as extra RRF lists. No crew required."""

from __future__ import annotations

from rag.seeder_abc import closed_abc
from rag.tokenize import tokenize

# Short retrieve bias per architecture source (not a dump of every synonym).
BIAS: dict[str, list[str]] = {
    "papers": ["hybrid RAG", "usability handbook", "retrieval", "BM25"],
    "code": ["chromadb", "rank-bm25", "vite", "inbox-plugin", "e-prop"],
    "scribble": ["iPad", "park", "architecture", "scribbling", "diagram"],
    "cursor": ["ask", "coding agent", "book keep", "cursor"],
    "md": ["local website", "wikipedia", "3Blue1Brown", "vector DB", "markdown"],
}


def bias_for(ground: str) -> list[str]:
    return list(BIAS.get(ground, []))


def lexical_query(goal: str, bias: list[str]) -> str:
    """Goal + short bias only. Never concatenate a full seeder bag."""
    short = " ".join(bias[:6])
    return f"{goal} {short}".strip()


def extra_rrf_lists(ground: str, goal: str = "") -> list[str]:
    """Each bag phrase is its own BM25 ranking, fused later with RRF."""
    phrases = list(bias_for(ground))
    for tok in tokenize(goal, drop_stop=True)[:8]:
        if tok not in {p.lower() for p in phrases}:
            phrases.append(tok)
    return phrases[:16]


def abc_bridge(texts_a: list[str], texts_c: list[str], ground_a: str, ground_c: str) -> list[str]:
    pair = closed_abc(
        texts_a,
        texts_c,
        extra_a=bias_for(ground_a),
        extra_c=bias_for(ground_c),
        max_b=12,
        min_df=1,
        ground_a=ground_a,
        ground_c=ground_c,
    )
    return [b.term for b in pair.b_terms]
