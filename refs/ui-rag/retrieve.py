"""Keyword retrieve over the handbook RAG index (no embeddings, no network)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def main() -> None:
    query = " ".join(sys.argv[1:]).strip().lower()
    if not query:
        print('usage: python refs/ui-rag/retrieve.py "hit targets buttons feedback"')
        sys.exit(2)

    index = json.loads((ROOT / "index.json").read_text(encoding="utf-8"))
    q_tokens = set(re.findall(r"[a-z0-9]{3,}", query))
    scores: dict[str, int] = {}

    for topic, cids in index.get("topics", {}).items():
        keys = {topic, *topic.split("-")}
        if keys & q_tokens or topic.replace("-", " ") in query:
            for cid in cids:
                scores[cid] = scores.get(cid, 0) + 5

    for tok in q_tokens:
        for cid in index.get("title_terms", {}).get(tok, []):
            scores[cid] = scores.get(cid, 0) + 2

    for chunk in index["chunks"]:
        cid = chunk["id"]
        blob = chunk["title"].lower()
        for g in chunk.get("guidelines", []):
            blob += " " + g["title"].lower()
        overlap = sum(1 for t in q_tokens if t in blob)
        if overlap:
            scores[cid] = scores.get(cid, 0) + overlap

    ranked = sorted(scores.items(), key=lambda kv: (-kv[1], kv[0]))[:6]
    if not ranked:
        print("No hits. Open refs/ui-rag/index.json (topics) or refs/ui-hci-survey.pdf.")
        return

    by_id = {c["id"]: c for c in index["chunks"]}
    for cid, sc in ranked:
        chunk = by_id[cid]
        print(f"{sc:4}  {chunk['path']}  — {chunk['title']}")
        for g in chunk.get("guidelines", []):
            if any(t in g["title"].lower() for t in q_tokens):
                print(f"      {g['id']} {g['title']}")


if __name__ == "__main__":
    main()
