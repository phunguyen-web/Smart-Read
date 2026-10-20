# Smart-Read web

Vite + React UI for in-browser PDF editing and conversion.

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

- `#/` landing
- `#/edit` rotate 90°/180°, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, stamp page numbers, watermark, crop margins, grayscale, find text, go to page, remove no-text or duplicate-text pages, fit selected pages to A4, odd/even/invert select, delete, duplicate, extract selected pages, keep only the selection, split every N pages into a ZIP, insert a blank page or PNG/JPEG/WEBP, drag a multi-select as one block (or send it to start/end), undo/redo (persisted), merge (choose insert position), title/author/subject, click-to-place text overlay, forget local copy; reload restores the last local PDF and undo stack; TXT/MD/HTML/JSON/CSV/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, and PNG/JPEG/WEBP uploads become a PDF
- `#/convert` TXT, HTML, Markdown, RTF, JSON, CSV, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB (nav + per-page spine), MOBI, PNG, JPEG, WEBP; invalid page ranges error instead of clamping; optional editor multi-select export; TXT/MD/HTML/JSON/CSV/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, and PNG/JPEG/WEBP can be imported as PDF first

Editor keyboard: ← → page, R rotate 90°, Shift+R rotate 180°, Delete remove page, Alt+↑↓ reorder, Ctrl+Z undo, Ctrl+Y redo, Ctrl+F search, Ctrl+G go to page, Ctrl+I invert selection, F3 next hit.

pdfjs-dist and `docx` load in their own chunks. MOBI POSTs EPUB to `/api/mobi`; the Vite plugin runs Calibre `ebook-convert` when that binary exists, otherwise the UI downloads EPUB.
