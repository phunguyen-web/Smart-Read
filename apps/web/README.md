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
- `#/edit` rotate 90°/180°, reverse order, stamp page numbers, odd/even select, delete, duplicate, extract selected pages, insert a blank page, drag a multi-select as one block (or send it to start/end), undo/redo, merge (choose insert position), click-to-place text overlay, forget local copy; reload restores the last local PDF
- `#/convert` TXT, HTML, Markdown, DOCX/DOC, EPUB (nav + per-page spine), MOBI; invalid page ranges error instead of clamping; optional editor multi-select export

Editor keyboard: ← → page, R rotate 90°, Shift+R rotate 180°, Delete remove page, Alt+↑↓ reorder, Ctrl+Z undo, Ctrl+Y redo.

pdfjs-dist and `docx` load in their own chunks. MOBI POSTs EPUB to `/api/mobi`; the Vite plugin runs Calibre `ebook-convert` when that binary exists, otherwise the UI downloads EPUB.
