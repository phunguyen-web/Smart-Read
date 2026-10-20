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
- `#/edit` rotate 90°/180°, reverse order, stamp page numbers, watermark, crop margins, grayscale, odd/even select, delete, duplicate, extract selected pages, keep only the selection, split every N pages into a ZIP, insert a blank page or PNG/JPEG, drag a multi-select as one block (or send it to start/end), undo/redo (persisted), merge (choose insert position), title/author/subject, click-to-place text overlay, forget local copy; reload restores the last local PDF and undo stack; TXT/MD/HTML and PNG/JPEG uploads become a PDF
- `#/convert` TXT, HTML, Markdown, RTF, JSON, CSV, DOCX/DOC, EPUB (nav + per-page spine), MOBI, PNG, JPEG; invalid page ranges error instead of clamping; optional editor multi-select export; TXT/MD/HTML and PNG/JPEG can be imported as PDF first

Editor keyboard: ← → page, R rotate 90°, Shift+R rotate 180°, Delete remove page, Alt+↑↓ reorder, Ctrl+Z undo, Ctrl+Y redo.

pdfjs-dist and `docx` load in their own chunks. MOBI POSTs EPUB to `/api/mobi`; the Vite plugin runs Calibre `ebook-convert` when that binary exists, otherwise the UI downloads EPUB.
