"""Render PDF pages to PNG. Tries PyMuPDF, then pypdfium2."""

from __future__ import annotations

import sys
from pathlib import Path


def render(pdf_path: Path, out_dir: Path, max_pages: int, max_bytes: int) -> int:
    written = 0
    total = 0
    try:
        import fitz  # type: ignore

        doc = fitz.open(pdf_path)
        for i, page in enumerate(doc):
            if i >= max_pages:
                break
            pix = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
            blob = pix.tobytes("png")
            if total + len(blob) > max_bytes and written:
                break
            dest = out_dir / f"page-{i + 1:02d}.png"
            dest.write_bytes(blob)
            written += 1
            total += len(blob)
        return written
    except ImportError:
        pass

    import pypdfium2 as pdfium  # type: ignore

    doc = pdfium.PdfDocument(str(pdf_path))
    count = min(len(doc), max_pages)
    for i in range(count):
        page = doc[i]
        bitmap = page.render(scale=1.4)
        pil = bitmap.to_pil()
        dest = out_dir / f"page-{i + 1:02d}.png"
        pil.save(dest, format="PNG")
        size = dest.stat().st_size
        if total + size > max_bytes and written:
            dest.unlink(missing_ok=True)
            break
        written += 1
        total += size
    return written


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: pdf_pages.py <pdf> <outdir> [max_pages] [max_bytes]", file=sys.stderr)
        return 2
    pdf = Path(sys.argv[1])
    out = Path(sys.argv[2])
    max_pages = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    max_bytes = int(sys.argv[4]) if len(sys.argv) > 4 else 8 * 1024 * 1024
    out.mkdir(parents=True, exist_ok=True)
    try:
        n = render(pdf, out, max_pages, max_bytes)
    except ImportError:
        return 3
    except Exception as exc:  # noqa: BLE001
        print(str(exc), file=sys.stderr)
        return 1
    print(n)
    return 0 if n else 1


if __name__ == "__main__":
    raise SystemExit(main())
