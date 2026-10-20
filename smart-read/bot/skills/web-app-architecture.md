---
description: Use when designing or changing the Smart-Read web app shell, routes, upload flow, or shared client state.
---

# Web app architecture

Smart-Read is a Vite + React + TypeScript SPA in `apps/web`.

## Routes

- `/` landing: Edit PDF and Convert file.
- `/edit` PDF editor: upload PDF, TXT/MD/HTML/JSON/CSV, DOCX, EPUB, or PNG/JPEG; page list, rotate 90/180 / reverse order / page numbers / watermark / crop / grayscale / find text / go to page / remove no-text pages / fit to A4 / odd-even select / delete / duplicate / extract selected pages / keep selection / split every N pages to ZIP / insert blank or images / drag a multi-select as one block or send it to start/end / undo-redo / merge-at-position / metadata / click-to-place text overlay / forget local copy, download. Reload restores the last PDF and undo stack from IndexedDB.
- `/convert` converter: upload PDF, TXT/MD/HTML/JSON/CSV, DOCX, EPUB, or PNG/JPEG; pick TXT / HTML / Markdown / RTF / JSON / CSV / DOCX / EPUB / MOBI / PNG / JPEG, validate from–to range or export the editor's multi-page selection, download. EPUB is built in the browser; MOBI uses `/api/mobi` (Calibre) when available; PNG/JPEG rasterize pages.

## Rules

- Keep PDF bytes in memory and mirror them plus a bounded undo stack to this-browser IndexedDB (no cloud store). Reject files over 20 MB.
- Share a document store: filename, `Uint8Array` bytes, page count. Hydrate from IndexedDB before first paint.
- Client-side `pdf-lib` for mutations; lazy `pdfjs-dist` for preview and text extraction; lazy `docx` for Word export.
- Split vendor chunks in `apps/web/vite.config.ts` (`pdfjs`, `docx`, `pdf-lib`, `jszip`). Lazy-load Editor and Convert pages.
- Do not add auth, accounts, or a database in this slice.
- Vietnamese UI copy. Keep code identifiers in English.
