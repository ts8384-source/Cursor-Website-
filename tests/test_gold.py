"""Tiny regression: architecture seed + extra-list RRF stay isolated."""

from rag.rrf import rrf_fuse
from rag.seed_architecture import ARCHITECTURE_MD
from rag.seeder import extra_rrf_lists, lexical_query
from rag.tokenize import tokenize


def test_architecture_seed_has_loop_terms():
    toks = set(tokenize(ARCHITECTURE_MD))
    for term in ("hybrid", "rag", "vector", "diagram"):
        assert term in toks
    assert any(t.startswith("wikipedia") for t in toks)


def test_lexical_is_short_not_full_bag():
    bias = ["hybrid RAG", "BM25", "chroma"]
    bag = extra_rrf_lists("papers", "hybrid RAG ask diagram")
    lex = lexical_query("outline the architecture", bias)
    assert "outline the architecture" in lex
    assert "hybrid RAG" in lex
    assert len(lex) < 200
    assert len(bag) >= 3


def test_extra_lists_rrf_not_one_query():
    # Simulate three bag lists + a goal list; fusion should promote overlap.
    fused = rrf_fuse(
        [
            ["hybrid#0", "other#1"],
            ["wiki#0", "hybrid#0"],
            ["hybrid#0", "diagram#0"],
        ]
    )
    assert fused[0][0] == "hybrid#0"
