# @chunk
# id: code:demo.hybrid_search
# type: function
# implements: page:hybrid-rag
# citations: [hm-rag-2025]
# tags: [retrieve, rrf]
# summary: RRF fuse of BM25 and dense
# @end
def hybrid_search(query: str) -> list[str]:
    return [query]


# @chunk id=code:demo.tokenize type=function tags=[tokenize]
def tokenize(text: str) -> list[str]:
    return text.split()


def unmarked_helper() -> int:
    return 1
