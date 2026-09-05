from __future__ import annotations

from collections import defaultdict


def rrf_fuse(
    ranked_lists: list[list[str]],
    *,
    k: int = 60,
) -> list[tuple[str, float]]:
    """Reciprocal Rank Fusion. ranked_lists are ordered ids, best first."""
    scores: dict[str, float] = defaultdict(float)
    for ranking in ranked_lists:
        for rank, item_id in enumerate(ranking, start=1):
            scores[item_id] += 1.0 / (k + rank)
    return sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
