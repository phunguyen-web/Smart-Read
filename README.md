# Smart-Read

Web app to edit PDFs in the browser and convert them to TXT, HTML, Markdown, RTF, JSON, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI, PNG, JPEG, WEBP, and CBZ.

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

Open the printed local URL. Use **Chỉnh sửa PDF** to preview a thumbnail strip, multi-select pages (click / Ctrl / Shift, plus odd/even or invert), rotate 90° / reverse / 180°, reverse page order, interleave two halves (duplex scan) or split odd/even, pack 2 or 4 pages onto A4 sheets, impose a saddle-stitch booklet, flip pages horizontally or vertically, split a page in half (top/bottom or left/right), rotate selected pages to portrait or landscape, scale pages by 50/75/125/150%, stamp page numbers, add a watermark, add a header and/or footer, add an A4 cover page, stroke an inset page border, crop or add margins, unify mixed page sizes, convert selected pages to grayscale, overlay a reading tint, paint a page background, find text, go to a page number, remove pages with no extracted text or with duplicate text, fit selected pages to A4, Letter, or A5, delete, duplicate, extract selected pages as a new PDF, keep only the selection, split every N pages into a ZIP of PDFs, insert a blank page or PNG/JPEG/WEBP images, drag-reorder (a multi-select moves as one block, or send it to the start/end), undo/redo, merge (start / after current / end), edit title/author/subject, overlay text at a click or preset, add outline bookmarks (**Đánh dấu**), set page labels (**Nhãn trang**: 1 / i, ii / Trang, or **Mở đầu i, ii** for a selected prefix), extract embedded JPEG/PNG (**Tải ảnh nhúng**), open a password-protected PDF (working copy is decrypted), password-protect a download copy (**Tải PDF khóa**; the working file stays readable), and forget the local copy. Sparse pages get a higher-contrast thumbnail. Keyboard: ← →, R (90°), Shift+R (180°), Delete (selected pages), Alt+↑↓, Ctrl+Z / Ctrl+Y, Ctrl+A (select all), Ctrl+F (search), Ctrl+G (go to page), Ctrl+I (invert selection), F3 (next hit). Use **Chuyển đổi định dạng** to export a page range to TXT, HTML, Markdown, RTF, JSON, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB (nav + per-page spine), MOBI, PNG, JPEG, WEBP, or CBZ. You can also open TXT, Markdown, HTML, JSON, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, PNG, JPEG, or WEBP to build a PDF first. Invalid from–to ranges show an error and block export. A multi-page editor selection can be exported even when the pages are not contiguous. MOBI calls `/api/mobi` which runs Calibre `ebook-convert` when installed; otherwise the app downloads EPUB. PNG/JPEG/WEBP rasterize each page; more than one page downloads as a ZIP. CBZ is always a ZIP of JPEG rasters named `001.jpg`. CBZ import reads PNG/JPEG/WEBP images in the archive (skips `__MACOSX`). Binary `.xls` is rejected; upload XLSX. Binary `.ppt` is rejected; upload PPTX. WEBP import is decoded to PNG before embedding. TSV import skips a `page,text` header (tab-separated). TOML import reads `text =` entries (`toToml` round-trips quoted strings; JSON-shaped TOML uses `pagesFromJson`). Org import reads `** Trang n` sections (`toOrg` round-trips; JSON-shaped Org uses `pagesFromJson`). LaTeX import reads `\\section*` bodies (`toLatex` round-trips escaped specials; JSON-shaped LaTeX uses `pagesFromJson`). AsciiDoc import reads `== Trang n` sections (`toAdoc` round-trips; JSON-shaped AsciiDoc uses `pagesFromJson`; `.asciidoc` is the same kind as `.adoc`). RST import reads underlined `Trang n` sections (`toRst` round-trips; JSON-shaped RST uses `pagesFromJson`; `.rest` is the same kind as `.rst`). Textile import reads `h2. Trang n` sections (`toTextile` round-trips; JSON-shaped Textile uses `pagesFromJson`; `.txtl` is the same kind as `.textile`). MediaWiki import reads `== Trang n ==` sections (`toWiki` round-trips; JSON-shaped MediaWiki uses `pagesFromJson`; `.mediawiki` is the same kind as `.wiki`).

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
