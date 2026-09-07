# rag/retrieve.py code:loop.hybrid_search

# hybrid search

id: code:loop.hybrid_search
type: code
kind: method
path: rag/retrieve.py
implements: page:hybrid-rag
citations: hm-rag-2025
tags: method, retrieve, rrf
summary: RRF fuse of BM25 and dense

    def search(
        self,
        query: str,
        k: int = 8,
        *,
        lexical_query: str | None = None,
        extra_lists: list[str] | None = None,
        hyde_text: str | None = None,
        bm25_weight_hint: bool = True,
