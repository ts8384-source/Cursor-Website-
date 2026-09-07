"""Shared hyphen-aware tokenizer (keeps e-prop style tokens). Copied from Co-Assistant seeder/terms."""

from __future__ import annotations

import re

STOP = frozenset(
    """
    a an the of to and in for on with from by as at or is are was were be been being
    this that these those it its their our your they them we you i not no nor so if
    than then also such into over after before when where which who what how
    paper papers et al fig figure table shown show shows using used use based
    approach approaches proposed propose results result method methods however
    therefore thus hence respectively different several many both most more less
    well new first second third one two three can may might should would could
    data set sets model models network networks via per between among
    """.split()
)

TOKEN = re.compile(r"[a-z][a-z0-9\-]{2,}")


# @chunk id=code:loop.tokenize type=function tags=[tokenize] implements=page:hybrid-rag
def tokenize(text: str, *, drop_stop: bool = False) -> list[str]:
    toks = TOKEN.findall(text.lower())
    if not drop_stop:
        return toks
    return [t for t in toks if t not in STOP and not t.isdigit()]
