# Smart-Read coding agents

Build the PDF editor and converter in this order. Do not skip a stage unless the user names a later specialist.

1. **product-planner** — scope, routes, limits, definition of done.
2. **web-engineer** — Vite/React shell in `apps/web`, hash routes, upload, in-memory document store mirrored to IndexedDB with undo history.
3. **pdf-editor** — `pdf-lib` mutations and `pdfjs-dist` preview (thumbnail strip, block drag-reorder, rotate 90/180, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, page numbers, watermark, crop, grayscale, find text, go to page, remove no-text or duplicate-text pages, fit to A4, invert selection, duplicate/extract/keep/split/blank page, PNG/JPEG/WEBP insert, metadata).
4. **format-converter** — TXT, HTML, Markdown, RTF, JSON, CSV, XLSX, DOCX/DOC, ODT, PPTX, FB2, EPUB, MOBI from extracted text; PNG/JPEG/WEBP page images; TXT/MD/HTML/JSON/CSV/RTF, DOCX, ODT, XLSX, PPTX, FB2, EPUB, and PNG/JPEG/WEBP can also be imported as PDF.
5. **qa-reviewer** — tests, 20 MB limit, accessibility, regressions.

Cursor specialists live in `.cursor/agents/`. The BDK orchestrator (playground / HTTP) lives in `smart-read/` and tracks the same sequence with `list_pipeline` / `advance_stage`.

Run the web app with Node, never Bun:

```bash
cd apps/web
npm install
npm run dev
```

Run the orchestrator:

```bash
cd smart-read
npx @cursor/bdk@0.2.27 validate --dir .
npx @cursor/bdk@0.2.27 call list_pipeline --dir .
```
