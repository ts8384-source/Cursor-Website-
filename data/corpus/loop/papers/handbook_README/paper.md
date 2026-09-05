# README

# UI handbook RAG (faster than the PDF)

Chunked text from `refs/ui-hci-survey.pdf` (HHS/GSA 2006, public domain). Vite already ignores `refs/**`.

## Retrieve (do this, not the 22MB PDF)

```text
python refs/ui-rag/retrieve.py "navigation buttons hit target"
```

Then **read only the listed `chXX-*.md` files**. Open the PDF only for a figure or a missing guideline.

- `index.json` — topics, guideline titles, page map
- `00-how-to-use.md` — how the ratings work
- `ch01-*.md` … `ch18-*.md` — one chapter per file, headings per guideline
- `_build.py` — re-extract with local PyMuPDF (`python refs/ui-rag/_build.py`)
