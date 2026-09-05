"""Extract HHS/GSA handbook text into chapter chunks + keyword index."""

from __future__ import annotations

import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

import pymupdf

ROOT = Path(__file__).resolve().parent
PDF = ROOT.parent / "ui-hci-survey.pdf"
PRINT_TO_PDF = 24  # printed p.1 == PDF p.25

CHAPTERS = {
    1: "Design Process and Evaluation",
    2: "Optimizing the User Experience",
    3: "Accessibility",
    4: "Hardware and Software",
    5: "The Homepage",
    6: "Page Layout",
    7: "Navigation",
    8: "Scrolling and Paging",
    9: "Headings, Titles, and Labels",
    10: "Links",
    11: "Text Appearance",
    12: "Lists",
    13: "Screen-Based Controls (Widgets)",
    14: "Graphics, Images, and Multimedia",
    15: "Writing Web Content",
    16: "Content Organization",
    17: "Search",
    18: "Usability Testing",
}

NOISE = re.compile(
    r"^(?:Research-Based Web Design & Usability Guidelines|"
    r"Headings, Titles, and Labels|Links|Contributors|Table of Contents|"
    r"See page xxii|for detailed descriptions|of the rating scales)\s*$",
    re.I,
)
GUIDE_ID = re.compile(r"^(\d{1,2}):(\d{1,2})\b")
CHAPTER_LINE = re.compile(r"^Chapter\s+(\d+)[—–-]\s*(.+)$", re.I)
PRINT_PAGE = re.compile(r"^(\d{1,3})$")
SOFT_HYPHEN = "\u00ad"
STOP = {
    "a", "an", "the", "and", "or", "of", "to", "for", "in", "on", "with",
    "that", "this", "from", "by", "is", "are", "be", "as", "at", "use",
    "using", "used", "when", "users", "user", "web", "site", "page", "pages",
}

SYNONYMS: dict[str, list[str]] = {
    "navigation": ["navigation", "menu", "breadcrumb", "tabs"],
    "buttons": ["button", "pushbutton", "control", "widget"],
    "hit-target": ["clickable", "checkbox", "radio", "button", "select"],
    "feedback": ["feedback", "wait", "progress", "timeout"],
    "error": ["error", "warning", "warn"],
    "layout": ["layout", "alignment", "whitespace", "columns", "frames"],
    "accessibility": ["accessibility", "508", "assistive", "alt"],
    "search": ["search", "query"],
    "forms": ["form", "field", "entry", "input"],
    "scrolling": ["scroll", "scrolling", "paging"],
    "homepage": ["homepage", "first impression"],
    "headings": ["heading", "title", "label"],
    "links": ["link", "links"],
    "typography": ["font", "text appearance", "readability", "prose"],
    "lists": ["list", "bullets"],
    "graphics": ["image", "graphic", "multimedia", "photo", "thumbnail"],
    "writing": ["jargon", "wording", "instructions", "acronym"],
    "information-architecture": ["organize", "scanning", "grouping"],
    "usability-testing": ["testing", "participants", "iterative", "walkthrough"],
    "process": ["requirements", "goals", "personas", "parallel"],
    "performance": ["download", "workload", "working memory"],
    "touch": ["click", "select", "pointing"],
}


def clean_line(line: str) -> str:
    line = line.replace(SOFT_HYPHEN, "").replace("\u00a0", " ")
    line = unicodedata.normalize("NFKC", line)
    return re.sub(r"[ \t]+", " ", line).strip()


def page_lines(doc: pymupdf.Document, pdf_index: int) -> list[str]:
    raw = doc[pdf_index].get_text() or ""
    kept: list[str] = []
    for line in raw.splitlines():
        line = clean_line(line)
        if not line or NOISE.match(line):
            continue
        if re.fullmatch(r"[ivxlcdm]+", line, re.I):
            continue
        kept.append(line)
    return kept


def parse_toc(doc: pymupdf.Document) -> list[dict]:
    items: list[dict] = []
    pending_id: str | None = None
    pending_page: int | None = None
    last_num: int | None = None

    for pdf_i in range(9, 16):
        for line in page_lines(doc, pdf_i):
            if CHAPTER_LINE.match(line) or line.lower().startswith("chapter "):
                pending_id = None
                continue
            m_id = GUIDE_ID.match(line)
            if m_id:
                pending_id = f"{int(m_id.group(1))}:{int(m_id.group(2))}"
                rest = line[m_id.end() :].strip()
                if rest:
                    items.append({"id": pending_id, "title": rest, "printed": pending_page or last_num or 1})
                    pending_id = None
                continue
            if PRINT_PAGE.match(line):
                last_num = int(line)
                if pending_id is None:
                    pending_page = last_num
                continue
            if pending_id and re.search(r"[A-Za-z]", line):
                items.append({"id": pending_id, "title": line, "printed": pending_page or last_num or 1})
                pending_id = None

    seen: set[str] = set()
    uniq: list[dict] = []
    for it in items:
        if it["id"] in seen:
            continue
        seen.add(it["id"])
        uniq.append(it)
    return uniq


def slug(ch: int, name: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return f"ch{ch:02d}-{s[:48]}"


def tokens(s: str) -> list[str]:
    return [w for w in re.findall(r"[a-z0-9]{3,}", s.lower()) if w not in STOP]


def main() -> None:
    doc = pymupdf.open(PDF)
    guidelines = parse_toc(doc)
    if len(guidelines) < 180:
        raise SystemExit(f"TOC parse weak: {len(guidelines)} guidelines")

    # Full body with page markers (printed 1–197 ≈ PDF 25–221)
    parts: list[str] = []
    for printed in range(1, 198):
        pdf_i = printed + PRINT_TO_PDF - 1
        if pdf_i >= doc.page_count:
            break
        parts.append(f"\n<!-- pdf-page {pdf_i + 1} printed {printed} -->\n")
        parts.append("\n".join(page_lines(doc, pdf_i)))
    body = "\n".join(parts)

    # Locate each guideline id in order (first occurrence after previous).
    positions: list[tuple[int, dict]] = []
    cursor = 0
    for g in guidelines:
        m = re.search(rf"\b{re.escape(g['id'])}\b", body[cursor:])
        if not m:
            # retry from start of this chapter region
            m = re.search(rf"\b{re.escape(g['id'])}\b", body)
            if not m:
                positions.append((cursor, g))
                continue
            pos = m.start()
        else:
            pos = cursor + m.start()
        positions.append((pos, g))
        cursor = pos + 1

    # How-to / methodology (PDF 17–24)
    how = "\n".join("\n".join(page_lines(doc, i)) for i in range(16, 24))
    (ROOT / "00-how-to-use.md").write_text(
        "# How to use the HHS/GSA usability guidelines\n\n"
        "Source: `refs/ui-hci-survey.pdf` (U.S. government work, public domain).\n"
        "Each guideline has Relative Importance and Strength of Evidence ratings.\n"
        "Dated 2006 — treat Flash / 800×600 as historical; keep IA, labeling, controls, writing, testing.\n\n"
        + how
        + "\n",
        encoding="utf-8",
    )

    by_ch: dict[int, list[tuple[dict, str]]] = defaultdict(list)
    for i, (pos, g) in enumerate(positions):
        end = positions[i + 1][0] if i + 1 < len(positions) else len(body)
        chunk = body[pos:end].strip()
        ch = int(g["id"].split(":")[0])
        by_ch[ch].append((g, chunk))

    # Chapter overviews: text between previous chapter end and first guideline
    overviews: dict[int, str] = {}
    for ch in sorted(by_ch):
        first_pos = next(p for p, g in positions if int(g["id"].split(":")[0]) == ch)
        prev = [p for p, g in positions if int(g["id"].split(":")[0]) == ch - 1]
        start = (prev[-1] if prev else body.find("<!-- pdf-page 25 "))
        # walk back to a chapter-ish heading if present
        window = body[max(0, start):first_pos]
        overviews[ch] = window.strip()[-1800:]

    # Remove stale chunk markdown (keep scripts/index we rewrite)
    for old in ROOT.glob("ch*.md"):
        old.unlink()

    index_chunks: list[dict] = [
        {
            "id": "00-how-to-use",
            "path": "refs/ui-rag/00-how-to-use.md",
            "title": "How to use this book and the guidelines",
            "chapter": 0,
            "guidelines": [],
            "pdf_pages": [17, 24],
        }
    ]
    title_terms: dict[str, list[str]] = defaultdict(list)

    def index_title(cid: str, text: str) -> None:
        seen: set[str] = set()
        for t in tokens(text):
            if t in seen:
                continue
            seen.add(t)
            title_terms[t].append(cid)

    index_title("00-how-to-use", "how to use guidelines ratings evidence methodology")

    for ch, recs in by_ch.items():
        title = CHAPTERS[ch]
        fname = f"{slug(ch, title)}.md"
        first_p = recs[0][0]["printed"]
        last_p = recs[-1][0]["printed"]
        lines = [
            f"# Chapter {ch} — {title}\n",
            f"Source: `refs/ui-hci-survey.pdf` printed pp. {first_p}–{last_p}.\n",
            "## Chapter overview\n",
            overviews.get(ch, "") + "\n",
        ]
        gmeta = []
        for g, text in recs:
            pdf_p = g["printed"] + PRINT_TO_PDF
            lines.append(f"## {g['id']} {g['title']}\n")
            lines.append(f"PDF page ~{pdf_p} (printed {g['printed']}).\n")
            lines.append(text + "\n")
            gmeta.append(
                {
                    "id": g["id"],
                    "title": g["title"],
                    "printed": g["printed"],
                    "pdf_page": pdf_p,
                }
            )
        (ROOT / fname).write_text("\n".join(lines), encoding="utf-8")
        cid = fname[:-3]
        index_chunks.append(
            {
                "id": cid,
                "path": f"refs/ui-rag/{fname}",
                "title": f"Chapter {ch} — {title}",
                "chapter": ch,
                "guidelines": gmeta,
                "pdf_pages": [recs[0][0]["printed"] + PRINT_TO_PDF, recs[-1][0]["printed"] + PRINT_TO_PDF],
            }
        )
        index_title(cid, title + " " + " ".join(g["title"] for g, _ in recs))

    topics: dict[str, list[str]] = {}
    for topic, keys in SYNONYMS.items():
        hits: list[str] = []
        for chunk in index_chunks:
            blob = (
                chunk["title"].lower()
                + " "
                + " ".join(g["title"].lower() for g in chunk.get("guidelines", []))
            )
            if any(k in blob for k in keys) and chunk["id"] not in hits:
                hits.append(chunk["id"])
        topics[topic] = hits

    index = {
        "source": {
            "pdf": "refs/ui-hci-survey.pdf",
            "title": "Research-Based Web Design & Usability Guidelines (2006)",
            "license": "U.S. government work, 17 U.S.C. § 105 public domain (do not reuse HHS/GSA seals)",
            "pages": doc.page_count,
            "guidelines": len(guidelines),
            "extraction": "pymupdf; chunked by chapter and guideline id",
        },
        "retrieve": "python refs/ui-rag/retrieve.py \"hit targets buttons feedback\"",
        "chunks": index_chunks,
        "topics": topics,
        "title_terms": dict(sorted(title_terms.items())),
    }
    (ROOT / "index.json").write_text(json.dumps(index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"guidelines={len(guidelines)} chapters={len(by_ch)}")


if __name__ == "__main__":
    main()
