---
description: Use when implementing or changing PDF page operations, the editor canvas, or pdf-lib / pdfjs usage.
---

# PDF editing

Operate on `PDFDocument` from `pdf-lib`. Never rewrite PDF bytes by hand.

## Supported operations

1. Rotate selected pages by 90° clockwise.
2. Delete selected pages (keep at least one page).
3. Reorder pages (move up / down or via the page list).
4. Merge another PDF by copying its pages onto the end.
5. Draw a short text overlay at a page position.

## Implementation notes

- After every mutation, save the document and refresh page count + preview.
- Preview with `pdfjs-dist`; do not block the UI on the full file.
- Merge copies pages with `copyPages` then `addPage`.
- Text overlay uses `drawText` with a standard font (Helvetica).
- Download with a `Blob` of `application/pdf`.
