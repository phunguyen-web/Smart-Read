# Smart-Read coding agents

Build the PDF editor and converter in this order. Do not skip a stage unless the user names a later specialist.

1. **product-planner** — scope, routes, limits, definition of done.
2. **web-engineer** — Vite/React shell in `apps/web`, hash routes, upload, in-memory document store mirrored to IndexedDB.
3. **pdf-editor** — `pdf-lib` mutations and `pdfjs-dist` preview (thumbnail strip, block drag-reorder, rotate 90/180, reverse order, page numbers, duplicate/extract/blank page).
4. **format-converter** — TXT, HTML, Markdown, DOCX/DOC, EPUB, MOBI from extracted text.
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
