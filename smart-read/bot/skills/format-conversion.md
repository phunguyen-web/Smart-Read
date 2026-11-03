---
description: Use when implementing or changing PDF export to TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI, PNG, JPEG, WEBP, or CBZ.
---

# Format conversion

Extract text with `pdfjs-dist` (`getTextContent` per page), then build the target format from that text. Do not rasterize pages into a fake Word file. Import `docx` only inside `toDocx` so the Convert route can code-split it.

## Targets

| Format | How |
| --- | --- |
| TXT | Join page text with form-feed or blank lines between pages. |
| HTML | Semantic document: title, one `<section>` per page. |
| Markdown | `# title` plus `## Trang n` sections (`toMarkdown`). |
| RTF | `toRtf` / `escapeRtf` from extracted text (Unicode as `\\uN?`). Uploading RTF uses `pagesFromRtf`. |
| JSON | `toJson` — `{ title, pages: [{ page, text }] }`. Uploading JSON rebuilds a PDF via `pagesFromJson`. |
| YAML | `toYaml` / `escapeYaml` — quoted `title` + `pages[].text`. Uploading YAML uses `pagesFromYaml`. |
| XML | `toXml` — `<document><title/><page n="…">`. Uploading XML uses `pagesFromXml`. |
| CSV | `toCsv` / `escapeCsv` — `page,text` rows. Uploading CSV rebuilds a PDF via `pagesFromCsv`. |
| TSV | `toTsv` / `escapeTsv` — tab-separated `page` / `text` rows. Uploading TSV rebuilds a PDF via `pagesFromTsv`. |
| TOML | `toToml` / `escapeToml` — `title` plus `[[pages]]` with `text =`. Uploading TOML uses `pagesFromToml`. JSON-shaped TOML falls through to `pagesFromJson`. |
| Org | `toOrg` — `* title` plus `** Trang n` sections. Uploading Org uses `pagesFromOrg`. JSON-shaped Org falls through to `pagesFromJson`. |
| LaTeX | `toLatex` / `escapeLatex` — article with one `\\section*` per page. Uploading `.tex` / `.latex` uses `pagesFromLatex`. JSON-shaped LaTeX falls through to `pagesFromJson`. |
| JSONL | `toJsonl` — one `{ page, text }` object per line. Uploading JSONL / NDJSON uses `pagesFromJsonl`. A single JSON array or `{ pages }` document falls through to `pagesFromJson`. |
| INI | `toIni` / `escapeIni` — `[document]` title plus `[page.n]` `text =`. Uploading INI / `.cfg` uses `pagesFromIni`. JSON-shaped INI falls through to `pagesFromJson`. |
| AsciiDoc | `toAdoc` — `= title` plus `== Trang n` sections. Uploading `.adoc` / `.asciidoc` uses `pagesFromAdoc`. JSON-shaped AsciiDoc falls through to `pagesFromJson`. |
| RST | `toRst` — title underline plus `Trang n` sections. Uploading `.rst` / `.rest` uses `pagesFromRst`. JSON-shaped RST falls through to `pagesFromJson`. |
| Textile | `toTextile` — `h1. title` plus `h2. Trang n` sections. Uploading `.textile` / `.txtl` uses `pagesFromTextile`. JSON-shaped Textile falls through to `pagesFromJson`. |
| MediaWiki | `toWiki` — `= title =` plus `== Trang n ==` sections. Uploading `.wiki` / `.mediawiki` uses `pagesFromWiki`. JSON-shaped MediaWiki falls through to `pagesFromJson`. |
| DokuWiki | `toDokuwiki` — `====== title ======` plus `=== Trang n ===` sections. Uploading `.dokuwiki` / `.dw` uses `pagesFromDokuwiki`. JSON-shaped DokuWiki falls through to `pagesFromJson`. |
| DocBook | `toDocbook` — DocBook 5 `<article>` with one `<section>` per page. Uploading `.dbk` / `.docbook` uses `pagesFromDocbook`. JSON-shaped DocBook falls through to `pagesFromJson`. |
| OPML | `toOpml` — OPML 2 `<outline text="Trang n" _note="…"/>`. Uploading `.opml` uses `pagesFromOpml`. JSON-shaped OPML falls through to `pagesFromJson`. |
| Atom | `toAtom` — Atom `<feed>` with one `<entry>` per page. Uploading `.atom` uses `pagesFromAtom`. RSS `.rss` `<item>` / `<description>` is the same kind. JSON-shaped Atom falls through to `pagesFromJson`. |
| XLSX | `toXlsx` — Office Open XML workbook with `page,text` columns (`inlineStr`). Uploading XLSX uses `pagesFromXlsx`. Binary `.xls` is rejected. |
| PNG / JPEG / WEBP | Raster each selected page with `renderPageToBlob`. One page is a single image; several pages are a ZIP (`imagePageName` / `imageZipName`). JPEG paints a white background. Uploading PNG/JPEG builds a PDF via `imagesToPdf`. WEBP import is decoded to PNG with `rasterToPng` first. |
| CBZ | `toCbz` / `comicPageName` — ZIP of JPEG rasters (`001.jpg`, …). Always a ZIP. Uploading `.cbz` uses `imagesFromCbz` then `imagesToPdf`. WEBP images inside CBZ are decoded to PNG first. |
| DOCX / DOC | Dynamic `import('docx')` `Document` / `Packer`. Same bytes for `.doc` download name if the user picked DOC. Uploading DOCX uses `pagesFromDocx` (binary `.doc` is rejected). |
| ODT | `toOdt` — OpenDocument ZIP (`mimetype` STORE, `content.xml`, `styles.xml`, `meta.xml`, manifest). Uploading ODT uses `pagesFromOdt`. |
| ODS | `toOds` — OpenDocument Spreadsheet ZIP with `page,text` columns. Uploading ODS uses `pagesFromOds`. |
| PPTX | `toPptx` — PowerPoint Office Open XML, one slide per page (`Trang n` title + body). Uploading PPTX uses `pagesFromPptx`. Binary `.ppt` is rejected. |
| ODP | `toOdp` — OpenDocument Presentation ZIP, one `draw:page` per page (`Trang n` title + body). Uploading ODP uses `pagesFromOdp`. |
| FB2 | `toFb2` — FictionBook XML with one `<section>` per page. Uploading FB2 uses `pagesFromFb2`. |
| EPUB | EPUB 3 ZIP: uncompressed `mimetype`, `container.xml`, CSS, `nav.xhtml` (toc + landmarks), `toc.ncx`, one XHTML file per page, OPF with `dc:creator`, `dc:date`, `dcterms:modified`. Uploading EPUB uses `pagesFromEpub` (spine XHTML, skip nav). |
| MOBI | POST the EPUB to `/api/mobi`. The Vite plugin runs Calibre `ebook-convert` when present. If it is missing or fails, download EPUB and explain the fallback. |

## Rules

- Preserve page order. Validate the from–to range with `parsePageRange` (empty, non-integer, inverted, or out of bounds must show an error and block export). Slice extracted pages with `slicePageRange` only after the range is valid. If the editor has a multi-page subset selected, `slicePagesByIndexes` may export those pages instead (including a non-contiguous set).
- TXT, Markdown, HTML, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, RTF, and FB2 uploads become a PDF via `pagesFromImportedText` + `textPagesToPdf` so they can then export to the other formats. DOCX, ODT, ODS, XLSX, PPTX, ODP, and EPUB uploads use `pagesFromDocx` / `pagesFromOdt` / `pagesFromOds` / `pagesFromXlsx` / `pagesFromPptx` / `pagesFromOdp` / `pagesFromEpub`. CBZ uploads use `imagesFromCbz` then `imagesToPdf`. PNG and JPEG uploads become a PDF via `imagesToPdf`. WEBP uploads use `rasterToPng` then `imagesToPdf`. `pdfFromLoadedSource` is the shared entry. RTF import uses `rtfToPlain` / `pagesFromRtf`. YAML import uses `pagesFromYaml`. XML import uses `pagesFromXml`. TSV import uses `pagesFromTsv`. TOML import uses `pagesFromToml`. Org import uses `pagesFromOrg`. LaTeX import uses `pagesFromLatex`. JSONL import uses `pagesFromJsonl`. INI import uses `pagesFromIni`. AsciiDoc import uses `pagesFromAdoc`. RST import uses `pagesFromRst`. Textile import uses `pagesFromTextile`. MediaWiki import uses `pagesFromWiki`. DokuWiki import uses `pagesFromDokuwiki`. DocBook import uses `pagesFromDocbook`. OPML import uses `pagesFromOpml`. Atom/RSS import uses `pagesFromAtom`.
- Strip NULs and cap extracted text so a huge PDF cannot freeze the tab.
- Name downloads from the source filename plus the new extension.
- Never upload the file to a third-party conversion API.
