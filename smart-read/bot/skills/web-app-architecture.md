---
description: Use when designing or changing the Smart-Read web app shell, routes, upload flow, or shared client state.
---

# Web app architecture

Smart-Read is a Vite + React + TypeScript SPA in `apps/web`.

## Routes

- `/` landing: Edit PDF and Convert file.
- `/edit` PDF editor: upload, page list, rotate / delete / reorder / merge / text overlay, download.
- `/convert` converter: upload PDF, pick TXT / HTML / DOCX / EPUB / MOBI, download.

## Rules

- Keep PDF bytes in memory (no cloud store). Reject files over 20 MB.
- Share a document store: filename, `Uint8Array` bytes, page count.
- Client-side `pdf-lib` for mutations; `pdfjs-dist` for preview and text extraction.
- Do not add auth, accounts, or a database in this slice.
- Vietnamese UI copy. Keep code identifiers in English.
