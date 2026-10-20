# Smart-Read

Web app to edit PDFs in the browser and convert them to TXT, HTML, Markdown, RTF, JSON, CSV, DOCX/DOC, ODT, FB2, EPUB, MOBI, PNG, and JPEG.

## Layout

| Path | Role |
| --- | --- |
| `apps/web` | Vite + React UI (editor + converter) |
| `smart-read` | BDK orchestrator agent and sequenced subagents |
| `.cursor/agents` | Cursor specialists used while coding this repo |

## Agent sequence

1. `product-planner`
2. `web-engineer`
3. `pdf-editor`
4. `format-converter`
5. `qa-reviewer`

The orchestrator records the current stage (`list_pipeline`, `advance_stage`) and the product plan (`record_plan`).

## Web app

```bash
cd apps/web
npm install
npm run dev
```

Open the printed local URL. Use **Chỉnh sửa PDF** to preview a thumbnail strip, multi-select pages (click / Ctrl / Shift, plus odd/even or invert), rotate 90° / reverse / 180°, reverse page order, interleave two halves (duplex scan) or split odd/even, stamp page numbers, add a watermark, crop margins, convert selected pages to grayscale, find text, go to a page number, remove pages with no extracted text or with duplicate text, fit selected pages to A4, delete, duplicate, extract selected pages as a new PDF, keep only the selection, split every N pages into a ZIP of PDFs, insert a blank page or PNG/JPEG images, drag-reorder (a multi-select moves as one block, or send it to the start/end), undo/redo, merge (start / after current / end), edit title/author/subject, overlay text at a click or preset, and forget the local copy. Sparse pages get a higher-contrast thumbnail. Keyboard: ← →, R (90°), Shift+R (180°), Delete (selected pages), Alt+↑↓, Ctrl+Z / Ctrl+Y, Ctrl+F (search), Ctrl+G (go to page), Ctrl+I (invert selection), F3 (next hit). Use **Chuyển đổi định dạng** to export a page range to TXT, HTML, Markdown, RTF, JSON, CSV, DOCX/DOC, ODT, FB2, EPUB (nav + per-page spine), MOBI, PNG, or JPEG. You can also open TXT, Markdown, HTML, JSON, CSV, RTF, DOCX, ODT, FB2, EPUB, PNG, or JPEG to build a PDF first. Invalid from–to ranges show an error and block export. A multi-page editor selection can be exported even when the pages are not contiguous. MOBI calls `/api/mobi` which runs Calibre `ebook-convert` when installed; otherwise the app downloads EPUB. PNG/JPEG rasterize each page; more than one page downloads as a ZIP.

Uploads stay on this device. The current PDF and a bounded undo/redo stack are mirrored to IndexedDB so a reload restores them; both clear on a new upload or when you forget the local copy. Maximum size is 20 MB. There is no account or cloud store in v1.

## Orchestrator

```bash
cd smart-read
npm install
npx @cursor/bdk@0.2.27 validate --dir .
npx @cursor/bdk@0.2.27 info --dir . --json
npx @cursor/bdk@0.2.27 call list_pipeline --dir .
npx @cursor/bdk@0.2.27 dev --dir .
```

Model turns need a Cursor API key (`CURSOR_API_KEY` or `npx @cursor/bdk@0.2.27 login`). Direct tool calls do not.
