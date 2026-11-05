---
description: Use when designing or changing the Smart-Read web app shell, routes, upload flow, or shared client state.
---

# Web app architecture

Smart-Read is a Vite + React + TypeScript SPA in `apps/web`.

## Routes

- `/` landing: Edit PDF and Convert file.
- `/edit` PDF editor: upload PDF, TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, or PNG/JPEG/WEBP; page list, rotate 90/180 / reverse order / interleave halves / split odd-even / 2-up / 4-up / booklet / flip horizontal-vertical / split in half / orient portrait-landscape / scale 50-75-125-150 / page numbers / watermark / header-footer / cover page / page border / crop or pad margins / unify mixed page sizes / reading tint / page background / auto-crop whitespace / grayscale / find text / go to page / remove no-text or duplicate-text pages / fit to A4 Letter A5 / odd-even-invert select / delete / duplicate / extract selected pages / keep selection / split every N pages to ZIP / insert blank or images / drag a multi-select as one block or send it to start/end / undo-redo / merge-at-position / metadata / click-to-place text overlay / outline bookmarks (dest-less nested folders to depth 3; per-folder collapse; rename / remove / move / indent / outdent / retarget dest; collapse / expand / clear) / booklet print-sheet preview / page labels on thumbnails / go to a page label / extract embedded images / open encrypted PDF / forget local copy, download. Reload restores the last PDF and undo stack from IndexedDB.
- `/convert` converter: upload PDF, TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, or PNG/JPEG/WEBP; pick TXT / HTML / Markdown / RTF / JSON / JSONL / YAML / XML / CSV / TSV / TOML / Org / LaTeX / INI / AsciiDoc / RST / Textile / MediaWiki / DokuWiki / DocBook / OPML / Atom / Typst / Gemtext / POD / BBCode / Fountain / TiddlyWiki / Texinfo / roff / Jupyter / BibTeX / SRT / VTT / LRC / ICS / CUE / ASS / TTML / SBV / SAMI / SUB / STL / SCC / USF / RT / MPL / DjVu / PS / TEI / JATS / RIS / ENW / CSL-JSON / NBIB / CSL-YAML / EndNote XML / MODS / CFF / DataCite / MARCXML / Dublin Core / ONIX / Unixref / BibJSON / PubMed / JSON-LD / XLSX / DOCX / ODT / ODS / PPTX / ODP / FB2 / EPUB / MOBI / PNG / JPEG / WEBP / CBZ, validate from–to range or export the editor's multi-page selection, download. EPUB is built in the browser; MOBI uses `/api/mobi` (Calibre) when available; PNG/JPEG/WEBP rasterize pages; CBZ is a ZIP of JPEG rasters.

## Rules

- Keep PDF bytes in memory and mirror them plus a bounded undo stack to this-browser IndexedDB (no cloud store). Reject files over 20 MB.
- Share a document store: filename, `Uint8Array` bytes, page count. Hydrate from IndexedDB before first paint.
- Client-side `pdf-lib` for mutations; lazy `pdfjs-dist` for preview and text extraction; lazy `docx` for Word export.
- Split vendor chunks in `apps/web/vite.config.ts` (`pdfjs`, `docx`, `pdf-lib`, `jszip`). Lazy-load Editor and Convert pages.
- Do not add auth, accounts, or a database in this slice.
- Vietnamese UI copy. Keep code identifiers in English.
