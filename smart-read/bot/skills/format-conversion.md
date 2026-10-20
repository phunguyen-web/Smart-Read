---
description: Use when implementing or changing PDF export to TXT, HTML, Markdown, DOCX/DOC, EPUB, or MOBI.
---

# Format conversion

Extract text with `pdfjs-dist` (`getTextContent` per page), then build the target format from that text. Do not rasterize pages into a fake Word file. Import `docx` only inside `toDocx` so the Convert route can code-split it.

## Targets

| Format | How |
| --- | --- |
| TXT | Join page text with form-feed or blank lines between pages. |
| HTML | Semantic document: title, one `<section>` per page. |
| Markdown | `# title` plus `## Trang n` sections (`toMarkdown`). |
| RTF | `toRtf` / `escapeRtf` from extracted text (Unicode as `\\uN?`). |
| PNG / JPEG | Raster each selected page with `renderPageToBlob`. One page is a single image; several pages are a ZIP (`imagePageName` / `imageZipName`). JPEG paints a white background. |
| DOCX / DOC | Dynamic `import('docx')` `Document` / `Packer`. Same bytes for `.doc` download name if the user picked DOC. |
| EPUB | EPUB 3 ZIP: uncompressed `mimetype`, `container.xml`, CSS, `nav.xhtml` (toc + landmarks), `toc.ncx`, one XHTML file per page, OPF with `dc:creator`, `dc:date`, `dcterms:modified`. |
| MOBI | POST the EPUB to `/api/mobi`. The Vite plugin runs Calibre `ebook-convert` when present. If it is missing or fails, download EPUB and explain the fallback. |

## Rules

- Preserve page order. Validate the from–to range with `parsePageRange` (empty, non-integer, inverted, or out of bounds must show an error and block export). Slice extracted pages with `slicePageRange` only after the range is valid. If the editor has a multi-page subset selected, `slicePagesByIndexes` may export those pages instead (including a non-contiguous set).
- TXT, Markdown, and HTML uploads become a PDF via `pagesFromImportedText` + `textPagesToPdf` so they can then export to the other formats.
- Strip NULs and cap extracted text so a huge PDF cannot freeze the tab.
- Name downloads from the source filename plus the new extension.
- Never upload the file to a third-party conversion API.
