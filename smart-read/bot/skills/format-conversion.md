---
description: Use when implementing or changing PDF export to TXT, HTML, DOCX/DOC, EPUB, or MOBI.
---

# Format conversion

Extract text with `pdfjs-dist` (`getTextContent` per page), then build the target format from that text. Do not rasterize pages into a fake Word file.

## Targets

| Format | How |
| --- | --- |
| TXT | Join page text with form-feed or blank lines between pages. |
| HTML | Semantic document: title, one `<section>` per page. |
| DOCX / DOC | `docx` `Document` / `Packer`. Same bytes for `.doc` download name if the user picked DOC. |
| EPUB | ZIP of the EPUB 2/3 package (mimetype, container.xml, XHTML spine) via JSZip. |
| MOBI | Prefer `ebook-convert` (Calibre) from the EPUB. If it is missing, return EPUB and explain the fallback. |

## Rules

- Preserve page order.
- Strip NULs and cap extracted text so a huge PDF cannot freeze the tab.
- Name downloads from the source filename plus the new extension.
- Never upload the file to a third-party conversion API.
