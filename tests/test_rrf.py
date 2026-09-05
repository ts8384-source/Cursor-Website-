from rag.chunking import chunk_text
from rag.rrf import rrf_fuse
from rag.tokenize import tokenize


def test_chunk_overlap_and_title_ground_prefix():
    chunks = chunk_text("abcdefghij" * 50, doc_id="d", title="t", ground="papers", size=80, overlap=20)
    assert len(chunks) >= 2
    assert chunks[0].doc_id == "d"
    assert chunks[0].text.startswith("[t | papers] ")


def test_rrf_prefers_items_in_both_lists():
    fused = rrf_fuse([["a", "b", "c"], ["c", "a", "d"]])
    ids = [i for i, _ in fused]
    assert ids[0] in {"a", "c"}
    assert set(ids) == {"a", "b", "c", "d"}


def test_hyphen_tokenizer_keeps_e_prop():
    assert "e-prop" in tokenize("RSNN e-prop and LSNN credit-assignment")
