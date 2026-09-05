from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
CORPUS = DATA / "corpus"
INDEX = DATA / "index"
MD = DATA / "md"
DIAGRAMS = DATA / "diagrams"
BOOKKEEP = DATA / "bookkeep"
PAPERS_DROP = DATA / "papers"
CODE_DROP = DATA / "code"
CURSOR_DROP = DATA / "cursor"
CONTENT = ROOT / "content"
INBOX = ROOT / "inbox"
REFS_UI = ROOT / "refs" / "ui-rag"


def ensure_dirs() -> None:
    for p in (CORPUS, INDEX, MD, DIAGRAMS, BOOKKEEP, PAPERS_DROP, CODE_DROP, CURSOR_DROP, INBOX):
        p.mkdir(parents=True, exist_ok=True)
