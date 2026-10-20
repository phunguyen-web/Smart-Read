---
description: Use when implementing or changing PDF page operations, the editor canvas, or pdf-lib / pdfjs usage.
---

# PDF editing

Operate on `PDFDocument` from `pdf-lib`. Never rewrite PDF bytes by hand.

## Supported operations

1. Rotate selected pages by 90° clockwise, 180°, or counterclockwise (`rotatePagesBy`; current page or multi-select). Reverse the whole document with `reversePages` and remap selection via `reversedIndexes`. Interleave two halves (duplex scan: fronts then backs) with `interleaveHalvesOrder` / `applyPageOrder`, or split odds then evens with `deinterleaveOddEvenOrder`. Remap the selection with `remapAfterOrder`. Pack selected (or all) pages onto 2-up / 4-up A4 sheets with `nUpPages` / `nUpCellRects`. Impose a saddle-stitch booklet with `imposeBooklet` / `bookletSlotOrder` (pad to a multiple of 4, 2-up landscape). Flip selected pages with `flipPages` (horizontal or vertical). Split selected pages in half with `splitPagesInHalf` (`horizontal` = top then bottom, `vertical` = left then right) and remap via `remapAfterSplitHalf`; refuse if a half is smaller than `MIN_CROP_REMAINING`.
2. Delete selected pages (keep at least one page). Odd/even select uses `oddPageIndexes` / `evenPageIndexes`. Invert the selection with `invertPageIndexes` (Ctrl+I). Stamp page numbers with `addPageNumbers` (`n`, `n-of-total`, `trang-n` at a footer/header preset). Stamp a watermark with `addWatermark` (`diagonal` / `footer` / `header`). Crop selected pages with `cropPages` and `CROP_MARGINS` (`narrow` / `medium` / `wide`); `cropBoxAfterMargin` refuses a leftover box smaller than `MIN_CROP_REMAINING`. Convert selected pages to grayscale with `grayscalePagePngs` + `replacePagesWithPngs` (flatten to an opaque PNG overlay; `grayscaleRgba` uses Rec. 709 luma). Find text with `findPagesWithText` / `foldSearch` (Vietnamese diacritics fold). Jump with `parseGotoPage`. Remove pages whose extracted text is empty (`blankPageIndexes`); refuse if every page is empty (scanned/image PDF). Remove later pages whose folded text already appeared (`repeatedPageIndexes`); keep the first copy. Fit selected pages onto A4 with `fitPagesToA4` / `fittedPageRect` (landscape pages use landscape A4).
3. Duplicate selected pages (`duplicatePages`) by inserting copies after the last selected index.
4. Extract selected pages (`extractPages`) as a separate PDF download without mutating the current document. Keep only the selection with `keepPages`. Split every N pages with `splitEvery` and download a ZIP (`zipPdfParts`).
5. Insert a blank page after the current page (`insertBlankPage`), matching that page's size. Import TXT/Markdown/HTML/JSON/CSV/RTF, DOCX, ODT, XLSX, PPTX, FB2, or EPUB with `pdfFromLoadedSource` (`pagesFromDocx` / `pagesFromOdt` / `pagesFromXlsx` / `pagesFromPptx` / `pagesFromEpub` / `pagesFromImportedText` then `textPagesToPdf`). Import PNG/JPEG/WEBP as pages with `imagesToPdf` / `insertImages` (`imagePageSize` caps the long edge at `IMAGE_PAGE_MAX_EDGE`; WEBP is decoded to PNG with `rasterToPng`). Edit title/author/subject with `setMetadata` / `readMetadata`.
6. Reorder pages (move up / down, drag a thumbnail, send a block to start/end, or Alt+↑↓). Dragging a selected thumbnail moves the whole selection as one contiguous block (`reorderPageBlock` / `movePages` / `blockEdgeDropTo`).
7. Undo / redo page operations (Ctrl+Z / Ctrl+Y); keep a bounded snapshot stack in IndexedDB (`persistHistory`, cap `MAX_PERSISTED_HISTORY`) so reload restores undo. Persist the current PDF in IndexedDB so reload restores the file. Offer **Xóa khỏi trình duyệt** to forget the local copy and history.
8. Merge another PDF at a chosen index (start, after current page, or end) using `insertPage`.
9. Draw a short text overlay at a click or preset ratio on the page (`xRatio` / `yRatio` from the top-left of the preview).

## Implementation notes

- After every mutation, save the document and refresh page count + preview.
- Preview with dynamically imported `pdfjs-dist`; do not block the UI on the full file. Use `previewScaleForPage` so small/sparse pages render larger, and draw a thumbnail strip with `renderPageThumbnail` (higher contrast and scale on sparse pages).
- Merge copies pages with `copyPages` then `insertPage`.
- Text overlay uses `drawText`. Prefer an embedded Unicode font (`LiberationSans`) via `@pdf-lib/fontkit`; fall back to Helvetica.
- Keyboard: ArrowLeft/Right page, R rotate 90°, Shift+R rotate 180°, Delete remove, Alt+ArrowUp/Down reorder, Ctrl+Z undo, Ctrl+Y / Ctrl+Shift+Z redo, Ctrl+F focus search, Ctrl+G go to page, Ctrl+I invert selection, F3 / Shift+F3 next/previous hit (ignore when focus is in an input, except Ctrl+F/G/I still apply from the canvas).
- Download with a `Blob` of `application/pdf`.
