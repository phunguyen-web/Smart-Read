---
description: Use when designing or changing the Smart-Read web app shell, routes, upload flow, or shared client state.
---

# Web app architecture

Smart-Read is a Vite + React + TypeScript SPA in `apps/web`.

## Routes

- `/` landing: Edit PDF and Convert file.
- `/edit` PDF editor: upload PDF or TXT/MD/HTML, page list, rotate 90/180 / reverse order / page numbers / odd-even select / delete / duplicate / extract selected pages / keep selection / split every N pages to ZIP / insert blank / drag a multi-select as one block or send it to start/end / undo-redo / merge-at-position / click-to-place text overlay / forget local copy, download. Reload restores the last PDF and undo stack from IndexedDB.
- `/convert` converter: upload PDF or TXT/MD/HTML, pick TXT / HTML / Markdown / DOCX / EPUB / MOBI, validate from–to range or export the editor's multi-page selection, download. EPUB is built in the browser; MOBI uses `/api/mobi` (Calibre) when available.

## Rules

- Keep PDF bytes in memory and mirror them plus a bounded undo stack to this-browser IndexedDB (no cloud store). Reject files over 20 MB.
- Share a document store: filename, `Uint8Array` bytes, page count. Hydrate from IndexedDB before first paint.
- Client-side `pdf-lib` for mutations; lazy `pdfjs-dist` for preview and text extraction; lazy `docx` for Word export.
- Split vendor chunks in `apps/web/vite.config.ts` (`pdfjs`, `docx`, `pdf-lib`, `jszip`). Lazy-load Editor and Convert pages.
- Do not add auth, accounts, or a database in this slice.
- Vietnamese UI copy. Keep code identifiers in English.
