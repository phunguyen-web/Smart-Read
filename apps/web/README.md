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
- `#/edit` rotate, delete, drag a multi-select as one block, undo/redo, merge (choose insert position), click-to-place text overlay; reload restores the last local PDF
- `#/convert` TXT, HTML, DOCX/DOC, EPUB (nav + per-page spine), MOBI; invalid page ranges error instead of clamping

Editor keyboard: ← → page, R rotate, Delete remove page, Alt+↑↓ reorder, Ctrl+Z undo, Ctrl+Y redo.

pdfjs-dist and `docx` load in their own chunks. MOBI POSTs EPUB to `/api/mobi`; the Vite plugin runs Calibre `ebook-convert` when that binary exists, otherwise the UI downloads EPUB.
