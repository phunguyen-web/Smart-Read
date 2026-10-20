---
description: Use when implementing or changing PDF page operations, the editor canvas, or pdf-lib / pdfjs usage.
---

# PDF editing

Operate on `PDFDocument` from `pdf-lib`. Never rewrite PDF bytes by hand.

## Supported operations

1. Rotate selected pages by 90° clockwise, 180°, or counterclockwise (`rotatePagesBy`; current page or multi-select). Reverse the whole document with `reversePages` and remap selection via `reversedIndexes`.
2. Delete selected pages (keep at least one page). Odd/even select uses `oddPageIndexes` / `evenPageIndexes`. Stamp page numbers with `addPageNumbers` (`n`, `n-of-total`, `trang-n` at a footer/header preset).
3. Duplicate selected pages (`duplicatePages`) by inserting copies after the last selected index.
4. Extract selected pages (`extractPages`) as a separate PDF download without mutating the current document.
5. Insert a blank page after the current page (`insertBlankPage`), matching that page's size.
6. Reorder pages (move up / down, drag a thumbnail, send a block to start/end, or Alt+↑↓). Dragging a selected thumbnail moves the whole selection as one contiguous block (`reorderPageBlock` / `movePages` / `blockEdgeDropTo`).
7. Undo / redo page operations (Ctrl+Z / Ctrl+Y); keep a bounded in-memory snapshot stack. Persist the current PDF in IndexedDB so reload restores the file; do not persist the undo stack. Offer **Xóa khỏi trình duyệt** to forget the local copy.
8. Merge another PDF at a chosen index (start, after current page, or end) using `insertPage`.
9. Draw a short text overlay at a click or preset ratio on the page (`xRatio` / `yRatio` from the top-left of the preview).

## Implementation notes

- After every mutation, save the document and refresh page count + preview.
- Preview with dynamically imported `pdfjs-dist`; do not block the UI on the full file. Use `previewScaleForPage` so small/sparse pages render larger, and draw a thumbnail strip with `renderPageThumbnail` (higher contrast and scale on sparse pages).
- Merge copies pages with `copyPages` then `insertPage`.
- Text overlay uses `drawText`. Prefer an embedded Unicode font (`LiberationSans`) via `@pdf-lib/fontkit`; fall back to Helvetica.
- Keyboard: ArrowLeft/Right page, R rotate 90°, Shift+R rotate 180°, Delete remove, Alt+ArrowUp/Down reorder, Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo (ignore when focus is in an input).
- Download with a `Blob` of `application/pdf`.
