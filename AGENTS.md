# Smart-Read coding agents

Build the PDF editor and converter in this order. Do not skip a stage unless the user names a later specialist.

1. **product-planner** — scope, routes, limits, definition of done.
2. **web-engineer** — Vite/React shell in `apps/web`, hash routes, upload, in-memory document store mirrored to IndexedDB with undo history.
3. **pdf-editor** — `pdf-lib` mutations and `pdfjs-dist` preview (thumbnail strip, block drag-reorder, rotate 90/180, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number, label, or dest name), remove no-text or duplicate-text pages, fit to A4/Letter/A5, invert selection, duplicate/extract/keep/split/blank page, PNG/JPEG/WEBP insert, metadata, outline bookmarks (including dest-less nested folders (depth 3, per-folder collapse, rename/remove, move up/down, indent/outdent, retarget dest, named destinations including dest-page input retarget/rename/duplicate/remove/clear/selection dests and `/Kids` name trees that keep Kids when merging a foreign tree, including nested intermediate `/Kids` when leaves exceed the fanout) that can collapse or clear, booklet print-sheet preview), page labels (on thumbnails; go to a label), extract embedded images, open a password-protected PDF, password-protect a download copy, redact selected pages).
4. **format-converter** — TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, MPEG-7, AES57, IEEE LOM, IMS CP, NewsML, NITF, SportsML, EventsML, NewsML-G2, rNews, PRISM, hNews, IPTC, ANPA, NINJS, JSON Feed, Activity Streams, GeoJSON, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI from extracted text; PNG/JPEG/WEBP/CBZ page images; TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/EAC-CPF/CIDOC CRM/METS Rights/TextMD/PBCore/EBUCore/MPEG-7/AES57/IEEE LOM/IMS CP/NewsML/NITF/SportsML/EventsML/NewsML-G2/rNews/PRISM/hNews/IPTC/ANPA/NINJS/JSON Feed/Activity Streams/GeoJSON/RTF, DOCX, ODT, ODS, XLSX, PPTX, ODP, FB2, EPUB, CBZ, and PNG/JPEG/WEBP can also be imported as PDF.
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
