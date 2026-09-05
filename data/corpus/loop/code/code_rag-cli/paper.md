# RAG CLI and hybrid index

Live retrieve path: rag/retrieve.py HybridIndex.
Node wraps it via server/vector-store.ts → python -m rag.cli.
Scripts: rebuild, seed, refresh-site. Tokenizer keeps hyphen tokens (e-prop).
Chunk size 1200 overlap 150. Collection name hybrid_chunks. Embed BAAI/bge-small-en-v1.5.
