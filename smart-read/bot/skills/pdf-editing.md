---
description: Use when implementing or changing PDF page operations, the editor canvas, or pdf-lib / pdfjs usage.
---

# PDF editing

Operate on `PDFDocument` from `pdf-lib`. Never rewrite PDF bytes by hand.

## Supported operations

1. Rotate selected pages by 90° clockwise (current page or multi-select).
2. Delete selected pages (keep at least one page).
3. Reorder pages (move up / down, drag a thumbnail, or Alt+↑↓). Dragging a selected thumbnail moves the whole selection as one contiguous block (`reorderPageBlock` / `movePages`).
4. Undo / redo page operations (Ctrl+Z / Ctrl+Y); keep a bounded in-memory snapshot stack. Persist the current PDF in IndexedDB so reload restores the file; do not persist the undo stack.
5. Merge another PDF at a chosen index (start, after current page, or end) using `insertPage`.
6. Draw a short text overlay at a click or preset ratio on the page (`xRatio` / `yRatio` from the top-left of the preview).

## Implementation notes

- After every mutation, save the document and refresh page count + preview.
- Preview with dynamically imported `pdfjs-dist`; do not block the UI on the full file. Use `previewScaleForPage` so small/sparse pages render larger, and draw a thumbnail strip with `renderPageThumbnail` (higher contrast and scale on sparse pages).
- Merge copies pages with `copyPages` then `insertPage`.
- Text overlay uses `drawText`. Prefer an embedded Unicode font (`LiberationSans`) via `@pdf-lib/fontkit`; fall back to Helvetica.
- Keyboard: ArrowLeft/Right page, R rotate, Delete remove, Alt+ArrowUp/Down reorder, Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo (ignore when focus is in an input).
- Download with a `Blob` of `application/pdf`.
