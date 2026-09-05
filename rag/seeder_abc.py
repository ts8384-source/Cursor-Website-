"""Swanson ABC (intersection). Adapted from Co-Assistant seeder/abc.py without pydantic."""

from __future__ import annotations

from dataclasses import dataclass, field

from rag.tokenize import tokenize


@dataclass
class BTerm:
    term: str
    score: float
    df_a: int = 0
    df_c: int = 0


@dataclass
class PairABC:
    ground_a: str
    ground_c: str
    mode: str = "closed"
    b_terms: list[BTerm] = field(default_factory=list)


def _salient(texts: list[str], extra: list[str], top_n: int, min_df: int) -> dict[str, float]:
    import math
    from collections import Counter

    docs = [tokenize(t, drop_stop=True) for t in texts]
    n = max(len(docs), 1)
    df: Counter[str] = Counter()
    tf: Counter[str] = Counter()
    for doc in docs:
        tf.update(doc)
        df.update(set(doc))
    extra_toks: set[str] = set()
    for phrase in extra:
        extra_toks.update(tokenize(phrase, drop_stop=True))
    scores: dict[str, float] = {}
    for term, c in tf.items():
        if df[term] < min_df and term not in extra_toks:
            continue
        idf = math.log((n + 1) / (df[term] + 0.5))
        scores[term] = c * idf
    for phrase in extra:
        for tok in tokenize(phrase, drop_stop=True):
            scores[tok] = scores.get(tok, 0) + 50.0
    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    return dict(ranked[:top_n])


def _df(texts: list[str], term: str) -> int:
    t = term.lower()
    return sum(1 for text in texts if t in text.lower())


def closed_abc(
    texts_a: list[str],
    texts_c: list[str],
    *,
    extra_a: list[str] | None = None,
    extra_c: list[str] | None = None,
    top_n: int = 80,
    max_b: int = 20,
    min_df: int = 2,
    ground_a: str = "A",
    ground_c: str = "C",
) -> PairABC:
    sa = _salient(texts_a, extra_a or [], top_n, min_df)
    sc = _salient(texts_c, extra_c or [], top_n, min_df)
    overlap = set(sa) & set(sc)
    scored: list[BTerm] = []
    for term in overlap:
        score = (sa[term] * sc[term]) ** 0.5
        scored.append(BTerm(term=term, score=score, df_a=_df(texts_a, term), df_c=_df(texts_c, term)))
    scored.sort(key=lambda b: b.score, reverse=True)
    return PairABC(ground_a=ground_a, ground_c=ground_c, mode="closed", b_terms=scored[:max_b])
