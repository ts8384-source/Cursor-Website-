from pathlib import Path

from rag.code_meta import ID_RE, parse_comment_chunks, record_from_raw, scan_tree

FIXTURES = Path(__file__).resolve().parent / "fixtures" / "code_meta"


def test_python_block_and_oneliner():
    text = (FIXTURES / "good.py").read_text(encoding="utf-8")
    raws, warns = parse_comment_chunks(text, path="good.py", suffix=".py")
    ids = [r.fields["id"] for r in raws]
    assert ids == ["code:demo.hybrid_search", "code:demo.tokenize"]
    assert "def hybrid_search" in raws[0].body
    assert "def tokenize" in raws[1].body
    assert "unmarked_helper" not in raws[0].body
    recs = []
    for raw in raws:
        rec = record_from_raw(raw, rel_path="good.py", warns=warns)
        assert rec is not None
        recs.append(rec)
    assert recs[0]["type"] == "code"
    assert recs[0]["kind"] == "function"
    assert recs[0]["implements"] == ["page:hybrid-rag"]
    assert recs[0]["citations"] == ["hm-rag-2025"]
    assert "rrf" in recs[0]["tags"]
    assert recs[1]["id"] == "code:demo.tokenize"


def test_ts_line_and_block_comments():
    text = (FIXTURES / "good.ts").read_text(encoding="utf-8")
    raws, warns = parse_comment_chunks(text, path="good.ts", suffix=".ts")
    ids = [r.fields["id"] for r in raws]
    assert ids == ["code:demo.fuse", "code:demo.note", "code:demo.tiny"]
    assert "export function fuse" in raws[0].body
    rec = record_from_raw(raws[1], rel_path="good.ts", warns=warns)
    assert rec and rec["kind"] == "const"


def test_invalid_blocks_skip_without_raise():
    text = (FIXTURES / "bad.py").read_text(encoding="utf-8")
    raws, warns = parse_comment_chunks(text, path="bad.py", suffix=".py")
    recs = [record_from_raw(r, rel_path="bad.py", warns=warns) for r in raws]
    assert all(r is None for r in recs) or not any(
        (r or {}).get("id") == "not-a-code-id" for r in recs if r
    )
    messages = " ".join(w.message for w in warns)
    assert "missing id" in messages or any("id" in w.message for w in warns)
    for raw in raws:
        record_from_raw(raw, rel_path="bad.py", warns=warns)
    assert any("invalid id" in w.message or "missing id" in w.message or "invalid type" in w.message for w in warns)


def test_id_grammar():
    assert ID_RE.match("code:loop.hybrid_search")
    assert ID_RE.match("code:mysite.auth.verify_token")
    assert not ID_RE.match("loop.hybrid_search")
    assert not ID_RE.match("code:")


def test_scan_allowlist_skips_other_trees(tmp_path: Path):
    (tmp_path / "rag").mkdir()
    (tmp_path / "node_modules" / "pkg").mkdir(parents=True)
    (tmp_path / "rag" / "hit.py").write_text(
        "# @chunk id=code:tmp.hit type=function\ndef hit():\n    return 1\n",
        encoding="utf-8",
    )
    (tmp_path / "node_modules" / "pkg" / "skip.py").write_text(
        "# @chunk id=code:tmp.skip type=function\ndef skip():\n    return 0\n",
        encoding="utf-8",
    )
    result = scan_tree(
        tmp_path,
        {"roots": ["rag", "node_modules"], "extensions": [".py"], "exclude": ["node_modules"]},
    )
    assert [r["id"] for r in result.records] == ["code:tmp.hit"]
