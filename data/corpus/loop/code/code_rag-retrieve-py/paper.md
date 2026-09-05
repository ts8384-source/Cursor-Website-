# rag/retrieve.py

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

# Copied/adapted from Cursor Co-Assistant src/research_env/retrieve.py (isolated HybridIndex).
from rag.chunking import Chunk, chunk_text
from rag.paths import CORPUS, INDEX, ensure_dirs
from rag.rrf import rrf_fuse
from rag.tokenize import tokenize

COLLECTION = "hybrid_chunks"
EMBED_MODEL = "BAAI/bge-small-en-v1.5"
BM25_ONLY = os.environ.get("RAG_BM25_ONLY", "").strip() in {"1", "true", "yes"}


class HybridIndex:
    def __init__(self, domain: str, ground: str) -> None:
        if not domain or not ground:
            raise ValueError("HybridIndex needs domain and ground — corpora are not merged")
        ensure_dirs()
        self.domain = domain
        self.ground = ground
        root = INDEX / domain / ground
        root.mkdir(parents=True, exist_ok=True)
        self._chroma_dir = str(root / "chroma")
        self._bm25_path = root / "bm25.json"
        self._col = None
        self._client = None
        if not BM25_ONLY:
            import chromadb
            from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction

            self._embed = SentenceTransformerEmbeddingFunction(model_name=EMBED_MODEL)
            self._client = chromadb.PersistentClient(path=self._chroma_dir)
            self._col = self._client.get_or_create_collection(
                name=COLLECTION,
                embedding_function=self._embed,
                metadata={"hnsw:space": "cosine"},
            )
        self._bm25 = None
        self._bm25_ids: list[str] = []
        self._chunk_meta: dict[str, dict[str, Any]] = {}
        self._load_bm25()

    def empty(self) -> bool:
        return not self._bm25_ids and self._col_count() == 0

    def _col_count(self) -> int:
        if self._col is None:
            return 0
        return int(self._col.count())

    def _load_bm25(self) -> None:
        if not self._bm25_path.exists():
            return
        from rank_bm25 import BM25Okapi

        payload = json.loads(self._bm25_path.read_text(encoding="utf-8"))
        self._bm25_ids = payload["ids"]
        self._chunk_meta = payload.get("meta", {})
        corpus = payload["tokens"]
        if corpus:
            self._bm25 = BM25Okapi(corpus)

    def _persist_bm25(self, ids: list[str], tokens: list[list[str]], meta: dict) -> None:
        self._bm25_path.parent.mkdir(parents=True, exist_ok=True)
        self._bm25_path.write_text(
            json.dumps({"ids": ids, "tokens": tokens, "meta": meta}),
            encoding="utf-8",
        )

    def _corpus_root(self):
        return CORPUS / self.domain / self.ground

    def rebuild(self) -> int:
        from rank_bm25 import BM25Okapi

        root = self._corpus_root()
        chunks: list[Chunk] = []
        if root.exists():
            for meta_path in root.rglob("meta.json"):
                meta = json.loads(meta_path.read_text(encoding="utf-8"))
                raw_path = meta.get("text_path")
                md = Path(raw_path) if raw_path else meta_path.parent / "paper.md"
                if not md.exists():
                    md = meta_path.parent / "paper.md"
                if not md.exists():
                    continue
                text = md.read_text(encoding="utf-8", errors="ignore")
                chunks.extend(
                    chunk_text(
                        text,
                        doc_id=meta["doc_id"],
                        title=meta.get("title") or meta["doc_id"],
                        ground=self.ground,
                    )
                )
        if self._client is not None:
            try:
                self._client.delete_collection(COLLECTION)
            except Exception:
                pass
            self._col = self._client.get_or_create_collection(
                name=COLLECTION,
                embedding_function=self._embed,
                metadata={"hnsw:space": "cosine"},
            )
        if not chunks:
            self._bm25 = None
            self._bm25_ids = []
            self._chunk_meta = {}
            self._persist_bm25([], [], {})
            return 0

        ids = [c.chunk_id for c in chunks]
        docs = [c.text for c in chunks]
        metadatas = [
            {"doc_id": c.doc_id, "title": c.title, "source": c.source, "ground": c.ground} for c in chunks
        ]
        if self._col is not None:
            batch = 64
            for i in range(0, len(ids), batch):
                self._col.add(
                    ids=ids[i : i + batch],
                    documents=docs[i : i + batch],
                    metadatas=metadatas[i : i + batch],
                )
        tokens = [tokenize(t) for t in docs]
        self._bm25 = BM25Okapi(tokens)
        self._bm25_ids = ids
        self._chunk_meta = {
            c.chunk_id: {
                "doc_id": c.doc_id,
                "title": c.title,
                "text": c.text,
                "source": c.source,
                "ground": c.ground,
            }
            for c in chunks
        }
        self._persist_bm25(ids, tokens, self._chunk_meta)
        return len(chunks)

    def _dense_ids(self, query: str, n: int) -> list[str]:
        if self._col is None or self._col_count() == 0:
            return []
        n = min(n, max(self._col_count(), 1))
        res = self._col.query(query_texts=[query], n_results=n)
        return list(res["ids"][0]) if res["ids"] else []

    def _sparse_ids(self, query: str, n: int) -> list[str]:
        if self._bm25 is None or not self._bm25_ids:
            return []
        scores = self._bm25.get_scores(tokenize(query))
        ranked = sorted(
            zip(self._bm25_ids, scores, strict=True),
            key=lambda x: x[1],
            reverse=True,
        )
        return [i for i, s in ranked[:n] if s > 0]

    def search(
        self,
        query: str,
        k: int = 8,
        *,
        lexical_query: str | None = None,
        extra_lists: list[str] | None = None,
        hyde_text: str | None = None,
        bm25_weight_hint: bool = True,
    ) -> list[dict[str, Any]]:
        n = k * 4
        lexical = lexical_query if lexical_query is not None else query
        ranked: list[list[str]] = []
        dense = self._dense_ids(query, n)
        sparse = self._sparse_ids(lexical, n)
        if dense:
            ranked.append(dense)
        if sparse:
            ranked.append(sparse)
        if hyde_text:
            h_dense = self._dense_ids(hyde_text, n)
            h_sparse = self._sparse_ids(hyde_text, n)
            if h_dense:
                ranked.append(h_dense)
            if h_sparse:
                ranked.append(h_sparse)
        # Bags / Query2doc phrases are extra RRF lists — never stuffed into one BM25 query.
        for phrase in extra_lists or []:
            phrase = phrase.strip()
            if len(phrase) < 3:
                continue
            extra = self._sparse_ids(phrase, n)
            if extra:
                ranked.append(extra)
        _ = bm25_weight_hint
        fused = rrf_fuse(ranked) if ranked else []
        out: list[dict[str, Any]] = []
        for cid, score in fused[:k]:
            meta = self._chunk_meta.get(cid)
            if meta is None and self._col is not None:
                got = self._col.get(ids=[cid], include=["documents", "metadatas"])
                if not got["ids"]:
                    continue
                meta = {
                    "doc_id": got["metadatas"][0].get("doc_id"),
                    "title": got["metadatas"][0].get("title"),
                    "text": got["documents"][0],
                    "source": got["metadatas"][0].get("source"),
                    "ground": got["metadatas"][0].get("ground"),
                }
            if meta is None:
                continue
            out.append(
                {
                    "chunk_id": cid,
                    "score": score,
                    "doc_id": meta["doc_id"],
                    "title": meta["title"],
                    "text": meta["text"],
                    "source": meta.get("source") or meta["doc_id"],
                    "ground": meta.get("ground") or self.ground,
                    "domain": self.domain,
                }
            )
        return local_rerank(lexical, out)


def local_rerank(query: str, hits: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Co-Assistant has no local cross-encoder after RRF. Stub keeps RRF order."""
    _ = query
    return hits


def rebuild_all_grounds(domain: str, grounds: tuple[str, ...] | None = None) -> dict[str, int]:
    from rag import GROUNDS

    counts: dict[str, int] = {}
    for ground in grounds or GROUNDS:
        counts[ground] = HybridIndex(domain, ground).rebuild()
    return counts


def lookup_idea(idea: str, *, domain: str, grounds: tuple[str, ...], k: int = 6) -> dict[str, Any]:
    """Same query against each ground separately. Never a fused ranking across fields."""
    from rag.hyde import hyde_document
    from rag.seeder import bias_for, extra_rrf_lists, lexical_query

    per_ground: dict[str, list[dict[str, Any]]] = {}
    for ground in grounds:
        idx = HybridIndex(domain, ground)
        bias = bias_for(ground)
        lexical = lexical_query(idea, bias)
        hypo = hyde_document(idea, ground, bias)
        extras = extra_rrf_lists(ground, idea)
        hits = idx.search(idea, k=k, lexical_query=lexical, extra_lists=extras, hyde_text=hypo)
        slim = []
        for h in hits:
            slim.append(
                {
                    "doc_id": h.get("doc_id"),
                    "chunk_id": h.get("chunk_id"),
                    "title": h.get("title"),
                    "score": h.get("score"),
                    "ground": ground,
                    "text": (h.get("text") or "")[:700],
                }
            )
        per_ground[ground] = slim
    return {
        "idea": idea,
        "domain": domain,
        "merge": "labeled-only",
        "rule": "Do not RRF across grounds. Ask reads each list as a different library.",
        "per_ground": per_ground,
    }
