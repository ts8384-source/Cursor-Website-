# UI / HCI reference (legal, open)

## Saved file

- **Path:** `refs/ui-hci-survey.pdf`
- **Title:** Research-Based Web Design & Usability Guidelines (2006 edition)
- **Authors / editors:** U.S. Department of Health and Human Services (HHS) and U.S. General Services Administration (GSA). Forewords by Michael O. Leavitt (HHS) and Ben Shneiderman. Research/review contributors include Sanjay J. Koyani, Robert W. Bailey, Carol Barnum, Janice (Ginny) Redish, Bonnie John, James R. Lewis, and others.
- **Year:** 2006 (second edition; 209 guidelines)
- **Source URL (live host, now a 404 HTML page):** https://www.usability.gov/sites/default/files/documents/guidelines_book.pdf
- **Download used:** Internet Archive snapshot (2017-01-30), raw PDF  
  https://web.archive.org/web/20170130134938id_/https://www.usability.gov/sites/default/files/documents/guidelines_book.pdf
- **License / open-access status:** U.S. federal government work. Text is public domain under 17 U.S.C. § 105. HHS/GSA seals and logos are restricted; do not reuse those marks. This is **not** an ACM/IEEE/Elsevier publisher PDF.
- **File check:** `%PDF-1.6`, 21.8 MB, ~292 pages, embedded fonts (typeset / vector text, not a CNN or vision paper).
- **RAG (use this first):** `refs/ui-rag/` — chapter chunks + `index.json` + `python refs/ui-rag/retrieve.py "…"`. Do not open the full PDF unless a chunk is missing.
- **Portable pack (copy to other repos):** `packs/ui-hci/` — `README.md`, `howto.md`, `manifest.json`. iPad/Pencil rules are `packs/ui-hci/bindings.ipad-cursor.json`, not the handbook core.

## Why this is the “proper way” reference

A ~50-page academic *survey of general HCI* that is legally free as a single PDF is rare: the classic textbooks (Dix, Sharp/Preece/Rogers, Shneiderman *Designing the User Interface*) and ACM/IEEE handbook chapters are paywalled. This handbook is the best legal stand-in for “how user interfaces are supposed to be done.”

- It is a practitioner handbook, not a literature-review of GenAI or computer vision.
- It states 209 guidelines with a **relative importance** rating and a **strength of evidence** rating, each tied to cited empirical work.
- Scope matches core UI/HCI craft: design process and evaluation, optimizing UX, accessibility, homepage, page layout, navigation, scrolling/paging, headings and labels, links, text appearance, lists, widgets/controls, graphics and multimedia, writing, content organization / information architecture, search, and usability testing.
- Ben Shneiderman’s involvement ties it to mainstream HCI (direct manipulation, consistency, user control) rather than a niche subfield.
- Guidelines are written as decisions a designer can apply (what to do on a screen, why, and how strongly the research supports it).
- It is one coherent official volume, not a pile of blog posts or course slides.
- Public-domain status means later agents can keep, quote, and re-read the PDF without publisher DRM.
- Dated (2006, mostly informational websites). Treat specifics like Flash or 800×600 as historical; treat IA, navigation, labeling, controls, writing, and testing as still the baseline.

## What was *not* saved

- No ACM Digital Library / IEEE / Elsevier closed PDFs.
- No CNN / ML-vision papers.
- No copyrighted books (*The Humane Interface*, *Don’t Make Me Think*, Dix HCI textbook).
- Author-posted ACM papers (e.g. Myers/Hudson/Pausch on UI tools) were skipped because ACM still restricts republication into a repo.
