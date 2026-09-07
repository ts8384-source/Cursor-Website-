# rag/chunking.py code:loop.chunk_text

# chunk text

id: code:loop.chunk_text
type: code
kind: function
path: rag/chunking.py
implements: page:hybrid-rag
citations: arxiv-2410-13070
tags: function, ingest, chunk
summary: Heading-aware MD/paper splits; 1200/150 only on unmarked blobs

def chunk_text(
    text: str,
    *,
    doc_id: str,
    title: str,
    ground: str = "",
    size: int = DEFAULT_SIZE,
    overlap: int = DEFAULT_OVERLAP,
