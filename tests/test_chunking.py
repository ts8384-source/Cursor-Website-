from pathlib import Path

from rag.chunking import chunk_text
from rag.paths import ROOT

CONTROL = ROOT / "content" / "CONTROL.md"
FENCE = Path(__file__).resolve().parent / "fixtures" / "chunking" / "fence.md"


def test_heading_aware_control_md():
    text = CONTROL.read_text(encoding="utf-8")
    chunks = chunk_text(text, doc_id="md:control", title="ACI", ground="md")
    joined = " ".join(c.text for c in chunks)
    assert len(chunks) >= 6
    assert any("How to run" in c.text for c in chunks)
    assert any("Cite-or-fetch" in c.text for c in chunks)
    assert any("Tool catalog" in c.text or "GET /api/tools" in c.text for c in chunks)
    assert joined.count("[ACI | md]") == len(chunks)
    how = next(c for c in chunks if "How to run" in c.text)
    assert "5175" in how.text
    cite = next(c for c in chunks if "Cite-or-fetch (sight or vision)" in c.text or "Cite-or-fetch" in c.text)
    assert "mustCite" in cite.text or "notInDb" in cite.text or "retrieve first" in cite.text.lower()


def test_fence_hash_is_not_a_heading():
    text = FENCE.read_text(encoding="utf-8")
    chunks = chunk_text(text, doc_id="fix:fence", title="fence", ground="md")
    assert len(chunks) >= 2
    first = next(c for c in chunks if "Prose before the fence" in c.text)
    assert "# not a heading" in first.text
    assert "def demo" in first.text
    later = next(c for c in chunks if "After fence" in c.text)
    assert "More prose after the fenced block" in later.text
    assert "# not a heading" not in later.text


def test_at_chunk_blocks_are_atomic():
    text = (
        "preamble unmarked helper\n\n"
        "# @chunk\n"
        "# id: code:demo.hybrid_search\n"
        "# @end\n"
        "def hybrid_search():\n"
        "    return 1\n\n"
        "# @chunk id=code:demo.tokenize type=function\n"
        "def tokenize():\n"
        "    return []\n"
    )
    chunks = chunk_text(text, doc_id="code:src", title="src.py", ground="code")
    bodies = [c.text for c in chunks]
    assert any("code:demo.hybrid_search" in b and "def hybrid_search" in b for b in bodies)
    hybrid = next(c for c in chunks if "hybrid_search" in c.text and "@chunk" in c.text)
    assert "def tokenize" not in hybrid.text
    assert any("preamble unmarked helper" in c.text for c in chunks)


def test_unmarked_blob_still_uses_overlap():
    chunks = chunk_text("abcdefghij" * 50, doc_id="d", title="t", ground="papers", size=80, overlap=20)
    assert len(chunks) >= 2
    assert chunks[0].text.startswith("[t | papers] ")
