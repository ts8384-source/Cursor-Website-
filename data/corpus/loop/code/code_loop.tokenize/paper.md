# rag/tokenize.py code:loop.tokenize

# tokenize

id: code:loop.tokenize
type: code
kind: function
path: rag/tokenize.py
implements: page:hybrid-rag
citations: 
tags: function, tokenize
summary: tokenize

def tokenize(text: str, *, drop_stop: bool = False) -> list[str]:
    toks = TOKEN.findall(text.lower())
    if not drop_stop:
        return toks
    return [t for t in toks if t not in STOP and not t.isdigit()]
