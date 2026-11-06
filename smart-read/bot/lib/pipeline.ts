export const PIPELINE_STAGES = [
  {
    id: "product-planner",
    subagent: "product-planner",
    title: "Product planner",
    summary:
      "Lock scope, UX flows, and the data model for the Smart-Read PDF editor and converter.",
  },
  {
    id: "web-engineer",
    subagent: "web-engineer",
    title: "Web engineer",
    summary:
      "Build the web app shell: routing, upload, layout, and shared client state.",
  },
  {
    id: "pdf-editor",
    subagent: "pdf-editor",
    title: "PDF editor",
    summary:
      "Implement in-browser PDF page operations: rotate, reverse, interleave halves / split odd-even, 2-up / 4-up, booklet impose with a print-sheet preview, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number, viewer label, or dest name), remove blank or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split, split by outline bookmarks, keep the selected outline item, insert blank or images, reorder, merge (optional outline bookmark), metadata, persist undo, text overlay, redact selected pages (line/block/page at overlay position), highlight, underline, strikeout, sign selected pages, add fillable text fields (`addTextFields`), add sticky-note comments (`addStickyNotes`), add fillable checkboxes (`addCheckboxes`), add file attachments (`addFileAttachments`), and add fillable radio buttons (`addRadioButtons`), and add URI link annotations (`addLinkAnnotations`) (same sizes at the overlay point), list/extract file attachments (`listFileAttachments` / `extractFileAttachments`), outline bookmarks (including dest-less nested folders (depth 3, per-folder collapse, rename/remove, move up/down, indent/outdent, retarget dest, named destinations via addNamedDest / listNamedDests / renameNamedDest / setNamedDestPage / parseNamedDestPageInput / setNamedDestView / setNamedDestXyz / parseNamedDestXyzInput / namedDestXyzFromPaper / namedDestXyzFromDestPage / namedDestXyzFromZoomPreset / namedDestXyzFromAxisPreset / namedDestXyzAxisNeedsPageSize / namedDestXyzFromAxisDestPage / namedDestXyzZoomFromDestPage / destNamesForPage / duplicateNamedDest / addNamedDestsForSelection / namedDestNameForPage / clearNamedDests / removeNamedDest / setOutlineNamedDest) that can collapse or clear), page labels (shown on thumbnails), extract embedded images, list/extract file attachments, open a password-protected PDF, and password-protect a download copy.",
  },
  {
    id: "format-converter",
    subagent: "format-converter",
    title: "Format converter",
    summary:
      "Convert PDF (and extracted text) to TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, MPEG-7, AES57, IEEE LOM, IMS CP, NewsML, NITF, SportsML, EventsML, NewsML-G2, rNews, PRISM, hNews, IPTC, ANPA, NINJS, JSON Feed, Activity Streams, GeoJSON, KML, GPX, OSM, GeoRSS, WKT, GML, TopoJSON, SVG, DXF, MapML, CityJSON, IndoorGML, CityGML, LandXML, IFC-XML, gbXML, BCF, COBie, LandInfra, InfraGML, OpenDRIVE, RailML, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, and MOBI; raster pages to PNG/JPEG/WEBP/CBZ; import TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/EAC-CPF/CIDOC CRM/METS Rights/TextMD/PBCore/EBUCore/MPEG-7/AES57/IEEE LOM/IMS CP/NewsML/NITF/SportsML/EventsML/NewsML-G2/rNews/PRISM/hNews/IPTC/ANPA/NINJS/JSON Feed/Activity Streams/GeoJSON/KML/GPX/OSM/GeoRSS/WKT/GML/TopoJSON/SVG/DXF/MapML/CityJSON/IndoorGML/CityGML/LandXML/IFC-XML/gbXML/BCF/COBie/LandInfra/InfraGML/OpenDRIVE/RailML/RTF/DOCX/ODT/ODS/XLSX/PPTX/ODP/FB2/EPUB/CBZ/PNG/JPEG/WEBP as PDF.",
  },
  {
    id: "qa-reviewer",
    subagent: "qa-reviewer",
    title: "QA reviewer",
    summary:
      "Verify the editor and converter: tests, upload limits, accessibility, and regressions.",
  },
] as const;

export const STAGE_IDS = [
  "product-planner",
  "web-engineer",
  "pdf-editor",
  "format-converter",
  "qa-reviewer",
] as const;

export type StageId = (typeof STAGE_IDS)[number];

export const KV_STAGE_KEY = "pipeline/stage";
export const KV_PLAN_KEY = "pipeline/plan";

export type PipelineState = {
  stage: StageId;
  updatedAt: string;
};

export type ProductPlan = {
  goal: string;
  notes: string;
  recordedAt: string;
};

export function isStageId(value: string): value is StageId {
  return (STAGE_IDS as readonly string[]).includes(value);
}

export function stageIndex(id: StageId): number {
  return STAGE_IDS.indexOf(id);
}

export function nextStage(id: StageId): StageId | null {
  const index = stageIndex(id);
  return index >= 0 && index < STAGE_IDS.length - 1 ? STAGE_IDS[index + 1] : null;
}

export function readStage(value: unknown): StageId {
  if (
    typeof value === "object" &&
    value !== null &&
    "stage" in value &&
    typeof value.stage === "string" &&
    isStageId(value.stage)
  ) {
    return value.stage;
  }
  return "product-planner";
}

export function readPlan(value: unknown): ProductPlan | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const record = value as Record<string, unknown>;
  if (typeof record.goal !== "string" || typeof record.notes !== "string") {
    return null;
  }
  return {
    goal: record.goal,
    notes: record.notes,
    recordedAt: typeof record.recordedAt === "string" ? record.recordedAt : "",
  };
}

export const SUPPORTED_FORMATS = [
  {
    id: "pdf",
    label: "PDF",
    role: "edit",
    notes: "Source format. Page rotate 90/180, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose (bookletPreviewSheets shows print order without mutating), flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number, viewer label, or dest name), remove no-text or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split to ZIP, split by outline bookmarks (`splitByOutline` / `outlineSplitRanges`), keep the selected outline item (`keepOutlineItem` / `outlineItemRange`), insert blank or PNG/JPEG/WEBP, reorder, merge (optional outline bookmark via `mergePdfWithBookmark`), metadata, persist undo, text overlay, redact selected pages (line/block/page at overlay position), highlight, underline, strikeout, sign selected pages, add fillable text fields (`addTextFields`), add sticky-note comments (`addStickyNotes`), add fillable checkboxes (`addCheckboxes`), add file attachments (`addFileAttachments`), and add fillable radio buttons (`addRadioButtons`), and add URI link annotations (`addLinkAnnotations`) (same sizes at the overlay point), list/extract file attachments (`listFileAttachments` / `extractFileAttachments`), outline bookmarks (nested dest-less folders via addOutlineFolder (optional parentIndex, max depth 3, no /Dest on the folder); per-folder collapse via setOutlineFolderOpen; collapse all with setOutlineFoldersOpen; renameOutlineItem; removeOutlineItem promotes children; moveOutlineItem swaps a sibling subtree; indentOutlineItem nests under the previous sibling; outdentOutlineItem lifts a subtree after its parent; setOutlineDest retargets a leaf to an explicit page (clears destName); addNamedDest / listNamedDests / renameNamedDest / setNamedDestPage / parseNamedDestPageInput / setNamedDestView (XYZ, Fit, FitH, FitV, FitR, FitB, FitBH, FitBV) / setNamedDestXyz / parseNamedDestXyzInput / destNamesForPage / duplicateNamedDest / addNamedDestsForSelection / namedDestNameForPage / clearNamedDests / removeNamedDest / setOutlineNamedDest read and write catalog `/Dests` plus the `/Names` `/Dests` name tree (`/Kids` when dests exceed NAMED_DEST_LEAF_SIZE or the source tree already has `/Kids`, including nested intermediate `/Kids` when leaves exceed the fanout); clearOutline), page labels (1 / i, ii / Trang, or front matter then 1; shown on thumbnails with dest names via destNamesForPage; click a dest name to select it; Tới trang suggests dest names and page labels via gotoSuggestions), extract embedded JPEG/PNG, list/extract file attachments, open a password-protected PDF (working copy stays decrypted), and password-protect a download copy.",
  },
  {
    id: "txt",
    label: "Plain text",
    role: "export",
    notes: "Extracted page text. Uploading TXT builds a PDF first so it can round-trip to other formats. PNG/JPEG/WEBP, DOCX, ODT, ODS, XLSX, PPTX, ODP, EPUB, CBZ, FB2, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom/RSS, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, and NBIB uploads also become PDF pages.",
  },
  {
    id: "html",
    label: "HTML",
    role: "export",
    notes: "Readable HTML document from extracted text. Uploading HTML builds a PDF first.",
  },
  {
    id: "md",
    label: "Markdown",
    role: "export",
    aliases: ["markdown"],
    notes: "Markdown document with one heading per page. Uploading Markdown builds a PDF first.",
  },
  {
    id: "rtf",
    label: "RTF",
    role: "export",
    notes: "Rich Text from extracted page text. Opens in Word and most editors. Uploading RTF builds a PDF first.",
  },
  {
    id: "json",
    label: "JSON",
    role: "export",
    notes: "Structured { title, pages: [{ page, text }] } from extracted page text. Uploading JSON builds a PDF first.",
  },
  {
    id: "yaml",
    label: "YAML",
    role: "export",
    aliases: ["yml"],
    notes: "Structured title + pages[].text from extracted page text. Uploading YAML builds a PDF first.",
  },
  {
    id: "xml",
    label: "XML",
    role: "export",
    notes: "document/title/page XML from extracted page text. Uploading XML builds a PDF from <page> bodies.",
  },
  {
    id: "csv",
    label: "CSV",
    role: "export",
    notes: "page,text rows from extracted page text. Fields with commas are quoted. Uploading CSV builds a PDF first.",
  },
  {
    id: "tsv",
    label: "TSV",
    role: "export",
    notes: "Tab-separated page and text rows from extracted page text. Fields with tabs or quotes are quoted. Uploading TSV builds a PDF first.",
  },
  {
    id: "toml",
    label: "TOML",
    role: "export",
    notes: "title plus [[pages]] tables with page and text. Uploading TOML builds a PDF from text = entries. JSON-shaped TOML uses pagesFromJson.",
  },
  {
    id: "org",
    label: "Org",
    role: "export",
    notes: "Org-mode outline with * title and ** Trang n headings. Uploading Org builds a PDF from those sections. JSON-shaped Org uses pagesFromJson.",
  },
  {
    id: "tex",
    label: "LaTeX",
    aliases: ["latex"],
    role: "export",
    notes: "article document with one section per page. Uploading .tex/.latex builds a PDF from section bodies. JSON-shaped LaTeX uses pagesFromJson.",
  },
  {
    id: "jsonl",
    label: "JSONL",
    aliases: ["ndjson"],
    role: "export",
    notes: "One { page, text } JSON object per line. Uploading JSONL builds a PDF from those lines. A single JSON array or { pages } document uses pagesFromJson.",
  },
  {
    id: "ini",
    label: "INI",
    aliases: ["cfg"],
    role: "export",
    notes: "[document] title plus [page.n] text = entries. Uploading INI or .cfg builds a PDF from text = values. JSON-shaped INI uses pagesFromJson.",
  },
  {
    id: "adoc",
    label: "AsciiDoc",
    aliases: ["asciidoc"],
    role: "export",
    notes: "= title plus == Trang n sections. Uploading .adoc/.asciidoc builds a PDF from those sections. JSON-shaped AsciiDoc uses pagesFromJson.",
  },
  {
    id: "rst",
    label: "RST",
    aliases: ["rest"],
    role: "export",
    notes: "reStructuredText title underline plus Trang n sections. Uploading .rst/.rest builds a PDF from those sections. JSON-shaped RST uses pagesFromJson.",
  },
  {
    id: "textile",
    label: "Textile",
    aliases: ["txtl"],
    role: "export",
    notes: "h1. title plus h2. Trang n sections. Uploading .textile/.txtl builds a PDF from those sections. JSON-shaped Textile uses pagesFromJson.",
  },
  {
    id: "wiki",
    label: "MediaWiki",
    aliases: ["mediawiki"],
    role: "export",
    notes: "= title = plus == Trang n == sections. Uploading .wiki/.mediawiki builds a PDF from those sections. JSON-shaped MediaWiki uses pagesFromJson.",
  },
  {
    id: "dokuwiki",
    label: "DokuWiki",
    aliases: ["dw"],
    role: "export",
    notes: "====== title ====== plus === Trang n === sections. Uploading .dokuwiki/.dw builds a PDF from those sections. JSON-shaped DokuWiki uses pagesFromJson.",
  },
  {
    id: "dbk",
    label: "DocBook",
    aliases: ["docbook"],
    role: "export",
    notes: "DocBook 5 article with one section per page. Uploading .dbk/.docbook builds a PDF from section/para bodies. JSON-shaped DocBook uses pagesFromJson.",
  },
  {
    id: "opml",
    label: "OPML",
    role: "export",
    notes: "OPML 2 outline with Trang n text and _note body. Uploading .opml builds a PDF from those notes. JSON-shaped OPML uses pagesFromJson.",
  },
  {
    id: "atom",
    label: "Atom",
    aliases: ["rss"],
    role: "export",
    notes: "Atom feed with one entry per page. Uploading .atom builds a PDF from content bodies. RSS .rss item/description is the same kind. JSON-shaped Atom uses pagesFromJson.",
  },
  {
    id: "typ",
    label: "Typst",
    aliases: ["typst"],
    role: "export",
    notes: "#set document(title) plus == Trang n sections. Uploading .typ builds a PDF from those sections. JSON-shaped Typst uses pagesFromJson.",
  },
  {
    id: "gmi",
    label: "Gemtext",
    aliases: ["gemini"],
    role: "export",
    notes: "# title plus ## Trang n sections. Uploading .gmi/.gemini builds a PDF from those sections. JSON-shaped Gemtext uses pagesFromJson.",
  },
  {
    id: "pod",
    label: "POD",
    role: "export",
    notes: "=head1 title plus =head2 Trang n sections. Uploading .pod builds a PDF from those sections. JSON-shaped POD uses pagesFromJson.",
  },
  {
    id: "bbcode",
    label: "BBCode",
    aliases: ["bb"],
    role: "export",
    notes: "[h1]title[/h1] plus [h2]Trang n[/h2] sections. Uploading .bbcode/.bb builds a PDF from those sections. JSON-shaped BBCode uses pagesFromJson.",
  },
  {
    id: "fountain",
    label: "Fountain",
    aliases: ["spmd"],
    role: "export",
    notes: "Title: plus # Trang n sections. Uploading .fountain/.spmd builds a PDF from those sections. JSON-shaped Fountain uses pagesFromJson.",
  },
  {
    id: "tid",
    label: "TiddlyWiki",
    aliases: ["tiddlywiki", "tiddly"],
    role: "export",
    notes: "! title plus !! Trang n sections. Uploading .tid/.tiddlywiki/.tiddly builds a PDF from those sections. JSON-shaped TiddlyWiki uses pagesFromJson.",
  },
  {
    id: "texinfo",
    label: "Texinfo",
    aliases: ["texi", "txi"],
    role: "export",
    notes: "\\\\input texinfo plus @settitle and @section Trang n. Uploading .texinfo/.texi/.txi builds a PDF from those sections. JSON-shaped Texinfo uses pagesFromJson.",
  },
  {
    id: "roff",
    label: "roff",
    aliases: ["man"],
    role: "export",
    notes: ".TH title plus .SH Trang n sections. Uploading .roff/.man builds a PDF from those sections. JSON-shaped roff uses pagesFromJson.",
  },
  {
    id: "ipynb",
    label: "Jupyter",
    aliases: ["jupyter"],
    role: "export",
    notes: "Notebook nbformat 4 with one markdown cell per page. Uploading .ipynb builds a PDF from markdown/code cell sources. Match .ipynb before JSON. A { pages } document uses pagesFromJson.",
  },
  {
    id: "bib",
    label: "BibTeX",
    aliases: ["bibtex"],
    role: "export",
    notes: "@comment title plus @misc{pageN} note bodies. Uploading .bib/.bibtex builds a PDF from those notes. JSON-shaped BibTeX uses pagesFromJson.",
  },
  {
    id: "srt",
    label: "SRT",
    role: "export",
    notes: "SubRip cues, 4 seconds each, one cue per page. Uploading .srt builds a PDF from cue text. JSON-shaped SRT uses pagesFromJson.",
  },
  {
    id: "vtt",
    label: "VTT",
    aliases: ["webvtt"],
    role: "export",
    notes: "WebVTT with NOTE title plus 4-second cues. Uploading .vtt builds a PDF from cue text. JSON-shaped VTT uses pagesFromJson.",
  },
  {
    id: "lrc",
    label: "LRC",
    role: "export",
    notes: "Timed lyrics [mm:ss.xx], 4 seconds each, plus [ti:title]. Uploading .lrc builds a PDF from lyric lines. JSON-shaped LRC uses pagesFromJson.",
  },
  {
    id: "ics",
    label: "ICS",
    aliases: ["ical", "icalendar"],
    role: "export",
    notes: "iCalendar with one VEVENT per page (4-second slots from epoch). Uploading .ics builds a PDF from DESCRIPTION or SUMMARY. JSON-shaped ICS uses pagesFromJson.",
  },
  {
    id: "cue",
    label: "CUE",
    role: "export",
    notes: "Cue sheet TITLE plus TRACK AUDIO / INDEX 01, 4 seconds each. Uploading .cue builds a PDF from track TITLE. JSON-shaped CUE uses pagesFromJson.",
  },
  {
    id: "ass",
    label: "ASS",
    aliases: ["ssa"],
    role: "export",
    notes: "Advanced SubStation Dialogue lines, 4 seconds each. Uploading .ass/.ssa builds a PDF from Dialogue text (Events Format Text column, including SSA Marked= extras, or Style: Dialogue in [Events] without a Format line). JSON-shaped ASS uses pagesFromJson.",
  },
  {
    id: "ttml",
    label: "TTML",
    aliases: ["dfxp"],
    role: "export",
    notes: "Timed Text Markup Language with one p cue per page, 4 seconds each. Uploading .ttml/.dfxp builds a PDF from p bodies. JSON-shaped TTML uses pagesFromJson.",
  },
  {
    id: "sbv",
    label: "SBV",
    role: "export",
    notes: "YouTube SubViewer cues, 4 seconds each. Uploading .sbv builds a PDF from cue text. JSON-shaped SBV uses pagesFromJson.",
  },
  {
    id: "sami",
    label: "SAMI",
    aliases: ["smi"],
    role: "export",
    notes: "Synchronized Accessible Media Interchange with one SYNC cue per page, 4 seconds each. Uploading .sami/.smi builds a PDF from SYNC/P bodies. JSON-shaped SAMI uses pagesFromJson.",
  },
  {
    id: "sub",
    label: "SUB",
    role: "export",
    notes: "SubViewer 2.0 cues, 4 seconds each, plus [TITLE]. Uploading .sub builds a PDF from cue text or MicroDVD {start}{end} lines. JSON-shaped SUB uses pagesFromJson (only { is JSON; MicroDVD is {0}{n}).",
  },
  {
    id: "stl",
    label: "STL",
    role: "export",
    notes: "Spruce subtitle lines, 4 seconds each (hh:mm:ss:ff). Uploading .stl builds a PDF from cue text. JSON-shaped STL uses pagesFromJson.",
  },
  {
    id: "scc",
    label: "SCC",
    role: "export",
    notes: "Scenarist Closed Caption lines, 4 seconds each (hh:mm:ss:ff plus tab text). Uploading .scc builds a PDF from cue text. JSON-shaped SCC uses pagesFromJson.",
  },
  {
    id: "usf",
    label: "USF",
    role: "export",
    notes: "Universal Subtitle Format XML with one subtitle/text cue per page, 4 seconds each. Uploading .usf builds a PDF from text bodies. JSON-shaped USF uses pagesFromJson.",
  },
  {
    id: "rt",
    label: "RT",
    aliases: ["realtext"],
    role: "export",
    notes: "RealText <time begin end/> cues, 4 seconds each. Uploading .rt builds a PDF from time bodies. JSON-shaped RT uses pagesFromJson. Match .rt before .rtf.",
  },
  {
    id: "mpl",
    label: "MPL",
    aliases: ["mpl2"],
    role: "export",
    notes: "MPL2 [start][end] cues in deciseconds, 4 seconds each. Uploading .mpl builds a PDF from cue text. JSON-shaped MPL uses pagesFromJson.",
  },
  {
    id: "djvu",
    label: "DjVu",
    aliases: ["djv"],
    role: "export",
    notes: "DJVU-TEXT dump with one @page per PDF page. Uploading .djvu / .djv builds a PDF from page bodies. JSON-shaped DjVu uses pagesFromJson.",
  },
  {
    id: "ps",
    label: "PS",
    aliases: ["eps", "postscript"],
    role: "export",
    notes: "PostScript %!PS-Adobe-3.0 with one %%Page and (text) = per page. Uploading .ps / .eps builds a PDF from those strings. JSON-shaped PS uses pagesFromJson.",
  },
  {
    id: "tei",
    label: "TEI",
    role: "export",
    notes: "TEI XML with one div type=page and p bodies per PDF page. Uploading .tei builds a PDF from those paragraphs. JSON-shaped TEI uses pagesFromJson. Match .tei before generic XML.",
  },
  {
    id: "jats",
    label: "JATS",
    aliases: ["nxml"],
    role: "export",
    notes: "JATS article XML with one sec id=page-n and p bodies per PDF page. Uploading .jats / .nxml builds a PDF from those paragraphs. JSON-shaped JATS uses pagesFromJson. Match .jats / .nxml before generic XML.",
  },
  {
    id: "ris",
    label: "RIS",
    role: "export",
    notes: "Research Information Systems records (TY GEN + T2 title + TI Trang n + N1 body). Newlines become |. Uploading .ris builds a PDF from N1 (then AB, then TI). JSON-shaped RIS uses pagesFromJson.",
  },
  {
    id: "enw",
    label: "ENW",
    aliases: ["endnote"],
    role: "export",
    notes: "EndNote tagged records (%0 Generic + %B title + %T Trang n + %Z body). Newlines become |. Uploading .enw builds a PDF from %Z (then %X, then %T). JSON-shaped ENW uses pagesFromJson.",
  },
  {
    id: "csljson",
    label: "CSL-JSON",
    aliases: ["csl"],
    role: "export",
    notes: "CSL-JSON array of document items (container-title + title Trang n + note body). Uploading .csljson / .csl.json builds a PDF from note (then abstract, then title). JSON objects use pagesFromJson. Match .csljson / .csl.json before generic JSON.",
  },
  {
    id: "nbib",
    label: "NBIB",
    aliases: ["pubmed"],
    role: "export",
    notes: "PubMed/MEDLINE tagged records (PMID + TI Trang n + JT title + AB body). Newlines become |. Uploading .nbib builds a PDF from AB (then NAB, then TI). JSON-shaped NBIB uses pagesFromJson.",
  },
  {
    id: "cslyaml",
    label: "CSL-YAML",
    aliases: ["csl.yml", "csl.yaml"],
    role: "export",
    notes: "CSL YAML document items (container-title + title Trang n + note body). Uploading .cslyaml / .csl.yaml / .csl.yml builds a PDF from note (then abstract, then title). JSON objects use pagesFromJson. Match .cslyaml / .csl.yaml / .csl.yml before generic YAML.",
  },
  {
    id: "enxml",
    label: "EndNote XML",
    aliases: ["endnote.xml"],
    role: "export",
    notes: "EndNote XML records (<record> + secondary-title + title Trang n + notes body). Uploading .enxml / .endnote.xml builds a PDF from notes (then abstract, then title). JSON-shaped EndNote XML uses pagesFromJson. Match .enxml / .endnote.xml before generic XML.",
  },
  {
    id: "mods",
    label: "MODS",
    aliases: ["mods.xml"],
    role: "export",
    notes: "MODS XML records (<mods> + relatedItem host title + title Trang n + note body). Uploading .mods / .mods.xml builds a PDF from note (then abstract, then title). JSON-shaped MODS uses pagesFromJson. Match .mods / .mods.xml before generic XML.",
  },
  {
    id: "cff",
    label: "CFF",
    aliases: ["citation.cff"],
    role: "export",
    notes: "Citation File Format YAML (cff-version + title + references with title Trang n + notes body). Uploading .cff / .citation.cff builds a PDF from notes (then abstract, then title). JSON objects use pagesFromJson. Match .cff / .citation.cff before generic YAML.",
  },
  {
    id: "datacite",
    label: "DataCite",
    aliases: ["datacite.xml"],
    role: "export",
    notes: "DataCite XML resources (<resource> + publisher title + title Trang n + description body). Uploading .datacite / .datacite.xml builds a PDF from description (then abstract, then title). JSON-shaped DataCite uses pagesFromJson. Match .datacite / .datacite.xml before generic XML.",
  },
  {
    id: "marcxml",
    label: "MARCXML",
    aliases: ["mrcx", "marc.xml"],
    role: "export",
    notes: "MARCXML records (<record> + 490 title + 245 Trang n + 520 body). Uploading .marcxml / .mrcx / .marc.xml builds a PDF from 520 (then 500, then 245). JSON-shaped MARCXML uses pagesFromJson. Match .marcxml / .mrcx / .marc.xml before generic XML.",
  },
  {
    id: "dublincore",
    label: "Dublin Core",
    aliases: ["dublincore.xml", "dc.xml"],
    role: "export",
    notes: "Dublin Core XML records (<dc> + dc:publisher title + dc:title Trang n + dc:description body). Uploading .dublincore / .dublincore.xml / .dc.xml builds a PDF from description (then abstract, then title). JSON-shaped Dublin Core uses pagesFromJson. Match .dublincore / .dublincore.xml / .dc.xml before generic XML.",
  },
  {
    id: "onix",
    label: "ONIX",
    aliases: ["onix.xml"],
    role: "export",
    notes: "ONIX XML products (<Product> + Collection TitleText title + TitleText Trang n + Text body). Uploading .onix / .onix.xml builds a PDF from Text (then Annotation, then TitleText). JSON-shaped ONIX uses pagesFromJson. Match .onix / .onix.xml before generic XML.",
  },
  {
    id: "unixref",
    label: "Unixref",
    aliases: ["unixref.xml", "crossref.xml"],
    role: "export",
    notes: "Crossref Unixref XML records (<doi_record> + journal full_title + title Trang n + description body). Uploading .unixref / .unixref.xml / .crossref.xml builds a PDF from description (then abstract, then title). JSON-shaped Unixref uses pagesFromJson. Match .unixref / .unixref.xml / .crossref.xml before generic XML. <doi_record\\b> does not match doi_records.",
  },
  {
    id: "bibjson",
    label: "BibJSON",
    aliases: ["bib.json"],
    role: "export",
    notes: "BibJSON array of article items (journal.name title + title Trang n + note body). Uploading .bibjson / .bib.json builds a PDF from note (then abstract, then title). JSON objects use pagesFromJson. Match .bibjson / .bib.json before generic JSON.",
  },
  {
    id: "pubmed",
    label: "PubMed",
    aliases: ["pubmed.xml"],
    role: "export",
    notes: "PubMed XML articles (<PubmedArticle> + Journal Title + ArticleTitle Trang n + AbstractText body). Uploading .pubmed / .pubmed.xml builds a PDF from AbstractText (then abstract, then ArticleTitle). JSON-shaped PubMed uses pagesFromJson. Match .pubmed / .pubmed.xml before generic XML. <PubmedArticle\\b> does not match PubmedArticleSet.",
  },
  {
    id: "jsonld",
    label: "JSON-LD",
    aliases: ["json-ld"],
    role: "export",
    notes: "JSON-LD array of schema.org CreativeWork items (publisher.name title + name Trang n + description body). Uploading .jsonld / .json-ld builds a PDF from description (then abstract, then name). JSON objects use pagesFromJson. Match .jsonld / .json-ld before generic JSON.",
  },
  {
    id: "bibframe",
    label: "BIBFRAME",
    aliases: ["bibframe.xml", "bf.xml"],
    role: "export",
    notes: "BIBFRAME RDF/XML works (<bf:Work> + bf:mainTitle title + bf:title Trang n + bf:note body). Uploading .bibframe / .bibframe.xml / .bf.xml builds a PDF from bf:note (then abstract, then bf:title). JSON-shaped BIBFRAME uses pagesFromJson. Match .bibframe / .bibframe.xml / .bf.xml before generic XML. <bf:Work\\b> does not match rdf:RDF.",
  },
  {
    id: "crossref",
    label: "Crossref",
    aliases: ["crossref.json"],
    role: "export",
    notes: "Crossref REST JSON work-list (message-type work-list + container-title title + title Trang n + abstract body). Uploading .crossref / .crossref.json builds a PDF from abstract (then note, then title). JSON objects without a work-list envelope use pagesFromJson. Match .crossref / .crossref.json before generic JSON. .crossref.xml stays Unixref.",
  },
  {
    id: "ead",
    label: "EAD",
    aliases: ["ead.xml"],
    role: "export",
    notes: "EAD XML components (<c> + titleproper/unittitle title + unittitle Trang n + scopecontent p body). Uploading .ead / .ead.xml builds a PDF from p/scopecontent (then abstract, then unittitle). JSON-shaped EAD uses pagesFromJson. Match .ead / .ead.xml before generic XML. <ead\\b> does not match as a <c> record.",
  },
  {
    id: "mets",
    label: "METS",
    aliases: ["mets.xml"],
    role: "export",
    notes: "METS XML descriptive metadata (<dmdSec> + publisher/agent name title + title Trang n + abstract body). Uploading .mets / .mets.xml builds a PDF from abstract (then note, then title). JSON-shaped METS uses pagesFromJson. Match .mets / .mets.xml before generic XML. <mets\\b> / metsHdr do not match as a <dmdSec> record.",
  },
  {
    id: "premis",
    label: "PREMIS",
    aliases: ["premis.xml"],
    role: "export",
    notes: "PREMIS XML objects (<object> + agentName title + originalName Trang n + significantPropertiesValue body). Uploading .premis / .premis.xml builds a PDF from significantPropertiesValue (then note, then originalName). JSON-shaped PREMIS uses pagesFromJson. Match .premis / .premis.xml before generic XML. <premis\\b> / objectIdentifier do not match as an <object> record.",
  },
  {
    id: "mix",
    label: "MIX",
    aliases: ["mix.xml"],
    role: "export",
    notes: "NISO MIX XML image capture metadata (<ImageCaptureMetadata> + imageProducer title + sourceType Trang n + note body). Uploading .mix / .mix.xml builds a PDF from note (then imageProducer, then sourceType). JSON-shaped MIX uses pagesFromJson. Match .mix / .mix.xml before generic XML. <mix\\b> / BasicDigitalObjectInformation do not match as an <ImageCaptureMetadata> record.",
  },
  {
    id: "alto",
    label: "ALTO",
    aliases: ["alto.xml"],
    role: "export",
    notes: "ALTO XML layout pages (<Page> + fileName title + String body). Uploading .alto / .alto.xml builds a PDF from String (then TextLine, then fileName). JSON-shaped ALTO uses pagesFromJson. Match .alto / .alto.xml before generic XML. <alto\\b> / Description / Layout do not match as a <Page> record.",
  },
  {
    id: "page",
    label: "PAGE",
    aliases: ["page.xml", "pcgts"],
    role: "export",
    notes: "PAGE XML regions (<Page> + Creator title + imageFilename Trang n + Unicode body). Uploading .page / .page.xml / .pcgts builds a PDF from Unicode (then TextEquiv, then imageFilename). JSON-shaped PAGE uses pagesFromJson. Match .page / .page.xml / .pcgts before generic XML. <PcGts\\b> / Metadata do not match as a <Page> record.",
  },
  {
    id: "foxml",
    label: "FOXML",
    aliases: ["foxml.xml"],
    role: "export",
    notes: "Fedora Object XML datastreams (<datastreamVersion> + property label title + LABEL Trang n + text body). Uploading .foxml / .foxml.xml builds a PDF from text (then xmlContent, then title). JSON-shaped FOXML uses pagesFromJson. Match .foxml / .foxml.xml before generic XML. <digitalObject\\b> / objectProperties do not match as a <datastreamVersion> record.",
  },
  {
    id: "edm",
    label: "EDM",
    aliases: ["edm.xml"],
    role: "export",
    notes: "Europeana Data Model RDF/XML (<edm:ProvidedCHO> + dc:publisher title + dc:title Trang n + dc:description body). Uploading .edm / .edm.xml builds a PDF from dc:description (then abstract, then dc:title). JSON-shaped EDM uses pagesFromJson. Match .edm / .edm.xml before generic XML. <rdf:RDF> does not match as an <edm:ProvidedCHO> record.",
  },
  {
    id: "lido",
    label: "LIDO",
    aliases: ["lido.xml"],
    role: "export",
    notes: "LIDO museum XML (<lido> + repository appellationValue title + titleSet Trang n + descriptiveNoteValue body). Uploading .lido / .lido.xml builds a PDF from descriptiveNoteValue (then objectDescriptionSet, then appellationValue). JSON-shaped LIDO uses pagesFromJson. Match .lido / .lido.xml before generic XML. <lidoWrap\\b> does not match as a <lido> record.",
  },
  {
    id: "vra",
    label: "VRA",
    aliases: ["vra.xml", "vracore", "vracore.xml"],
    role: "export",
    notes: "VRA Core XML (<work> + agent name title + title Trang n + description body). Uploading .vra / .vra.xml / .vracore / .vracore.xml builds a PDF from description (then note, then title). JSON-shaped VRA uses pagesFromJson. Match .vra / .vra.xml / .vracore / .vracore.xml before generic XML. <vra\\b> does not match as a <work> record.",
  },
  {
    id: "cdwa",
    label: "CDWA Lite",
    aliases: ["cdwa.xml", "cdwalite", "cdwalite.xml"],
    role: "export",
    notes: "CDWA Lite museum XML (<object> + displayCreator title + title Trang n + descriptiveNote body). Uploading .cdwa / .cdwa.xml / .cdwalite / .cdwalite.xml builds a PDF from descriptiveNote (then indexingNote, then title). JSON-shaped CDWA uses pagesFromJson. Match .cdwa / .cdwa.xml / .cdwalite / .cdwalite.xml before generic XML. <cdwalite\\b> does not match as an <object> record.",
  },
  {
    id: "spectrum",
    label: "SPECTRUM",
    aliases: ["spectrum.xml"],
    role: "export",
    notes: "SPECTRUM museum XML (<record> + objectName title + objectNumber Trang n + briefDescription body). Uploading .spectrum / .spectrum.xml builds a PDF from briefDescription (then description, then objectName). JSON-shaped SPECTRUM uses pagesFromJson. Match .spectrum / .spectrum.xml before generic XML. <spectrum\\b> does not match as a <record> record.",
  },
  {
    id: "dwc",
    label: "Darwin Core",
    aliases: ["dwc.xml", "darwincore", "darwincore.xml"],
    role: "export",
    notes: "Darwin Core XML (<SimpleDarwinRecord> + institutionName title + catalogNumber Trang n + dcterms:description body). Uploading .dwc / .dwc.xml / .darwincore / .darwincore.xml builds a PDF from description (then occurrenceRemarks, then scientificName). JSON-shaped Darwin Core uses pagesFromJson. Match .dwc / .dwc.xml / .darwincore / .darwincore.xml before generic XML. <DarwinRecordSet\\b> does not match as a <SimpleDarwinRecord> record.",
  },
  {
    id: "objectid",
    label: "Object ID",
    aliases: ["objectid.xml", "oid"],
    role: "export",
    notes: "Object ID XML (<object> + title + objectNumber Trang n + distinguishingFeatures body). Uploading .objectid / .objectid.xml / .oid builds a PDF from distinguishingFeatures (then description, then title). JSON-shaped Object ID uses pagesFromJson. Match .objectid / .objectid.xml / .oid before generic XML. <objectid\\b> does not match as an <object> record.",
  },
  {
    id: "eac",
    label: "EAC-CPF",
    aliases: ["eac.xml", "eac-cpf", "eac-cpf.xml", "cpf"],
    role: "export",
    notes: "EAC-CPF archival XML (<cpfDescription> + agency/date title + part Trang n + biogHist body). Uploading .eac / .eac.xml / .eac-cpf / .eac-cpf.xml / .cpf builds a PDF from biogHist (then abstract, then part). JSON-shaped EAC-CPF uses pagesFromJson. Match .eac / .eac.xml / .eac-cpf / .eac-cpf.xml / .cpf before generic XML. <eac-cpf\\b> does not match as a <cpfDescription> record.",
  },
  {
    id: "crm",
    label: "CIDOC CRM",
    aliases: ["crm.xml", "cidoc", "cidoc.xml", "cidoc-crm"],
    role: "export",
    notes: "CIDOC CRM RDF/XML (<E31_Document> + P102_has_title title + P1_is_identified_by Trang n + P3_has_note body). Uploading .crm / .crm.xml / .cidoc / .cidoc.xml / .cidoc-crm builds a PDF from P3_has_note (then rdfs:comment, then P102_has_title). JSON-shaped CIDOC CRM uses pagesFromJson. Match .crm / .crm.xml / .cidoc / .cidoc.xml / .cidoc-crm before generic XML. <rdf:RDF> does not match as an <E31_Document> record.",
  },
  {
    id: "rights",
    label: "METS Rights",
    aliases: ["rights.xml", "metsrights", "metsrights.xml", "rmd"],
    role: "export",
    notes: "METS Rights XML (<RightsDeclaration> + RightsHolderName title + UserName Trang n + ConstraintDescription body). Uploading .rights / .rights.xml / .metsrights / .metsrights.xml / .rmd builds a PDF from ConstraintDescription (then OtherConstraintDescription, then RightsHolderName). JSON-shaped METS Rights uses pagesFromJson. Match .rights / .rights.xml / .metsrights / .metsrights.xml / .rmd before generic XML. <RightsDeclarationMD> does not match as a <RightsDeclaration> record.",
  },
  {
    id: "textmd",
    label: "TextMD",
    aliases: ["textmd.xml", "tmd"],
    role: "export",
    notes: "NISO TextMD XML (<encoding> + encoding_platform title + encoding_software Trang n + textNote body). Uploading .textmd / .textmd.xml / .tmd builds a PDF from textNote (then processingNote, then encoding_platform). JSON-shaped TextMD uses pagesFromJson. Match .textmd / .textmd.xml / .tmd before generic XML. <textMD> does not match as an <encoding> record.",
  },
  {
    id: "pbcore",
    label: "PBCore",
    aliases: ["pbcore.xml", "pbc"],
    role: "export",
    notes: "PBCore XML (<pbcoreDescriptionDocument> + pbcoreTitle title + pbcoreIdentifier Trang n + pbcoreDescription body). Uploading .pbcore / .pbcore.xml / .pbc builds a PDF from pbcoreDescription (then pbcoreAnnotation, then pbcoreTitle). JSON-shaped PBCore uses pagesFromJson. Match .pbcore / .pbcore.xml / .pbc before generic XML. <pbcoreCollection> does not match as a <pbcoreDescriptionDocument> record.",
  },
  {
    id: "ebucore",
    label: "EBUCore",
    aliases: ["ebucore.xml", "ebu"],
    role: "export",
    notes: "EBUCore XML (<coreMetadata> + title title + identifier Trang n + description body). Uploading .ebucore / .ebucore.xml / .ebu builds a PDF from description (then alternative, then title). JSON-shaped EBUCore uses pagesFromJson. Match .ebucore / .ebucore.xml / .ebu before generic XML. <ebuCoreMain> does not match as a <coreMetadata> record.",
  },
  {
    id: "mpeg7",
    label: "MPEG-7",
    aliases: ["mpeg7.xml", "mp7"],
    role: "export",
    notes: "MPEG-7 XML (<MultimediaContent> + Title title + EntityIdentifier Trang n + FreeTextAnnotation body). Uploading .mpeg7 / .mpeg7.xml / .mp7 builds a PDF from FreeTextAnnotation (then Abstract, then Title). JSON-shaped MPEG-7 uses pagesFromJson. Match .mpeg7 / .mpeg7.xml / .mp7 before generic XML. <Mpeg7> does not match as a <MultimediaContent> record.",
  },
  {
    id: "aes57",
    label: "AES57",
    aliases: ["aes57.xml", "aes"],
    role: "export",
    notes: "AES57 XML (<audioObject> + title title + identifier Trang n + description body). Uploading .aes57 / .aes57.xml / .aes builds a PDF from description (then note, then title). JSON-shaped AES57 uses pagesFromJson. Match .aes57 / .aes57.xml / .aes before generic XML. <aes> does not match as an <audioObject> record.",
  },
  {
    id: "lom",
    label: "IEEE LOM",
    aliases: ["lom.xml", "ieee-lom"],
    role: "export",
    notes: "IEEE LOM XML (<lom> + title string + entry Trang n + description string body). Uploading .lom / .lom.xml / .ieee-lom builds a PDF from description (then keyword, then title). JSON-shaped IEEE LOM uses pagesFromJson. Match .lom / .lom.xml / .ieee-lom before generic XML. <lomCollection> does not match as a <lom> record.",
  },
  {
    id: "imscp",
    label: "IMS CP",
    aliases: ["imscp.xml", "ims"],
    role: "export",
    notes: "IMS Content Packaging XML (<item> + organization title + item title Trang n + description body). Uploading .imscp / .imscp.xml / .ims / imsmanifest.xml builds a PDF from description (then note, then title). JSON-shaped IMS CP uses pagesFromJson. Match .imscp / .imscp.xml / .ims / .imsmanifest.xml before generic XML. <manifest> does not match as an <item> record.",
  },
  {
    id: "newsml",
    label: "NewsML",
    aliases: ["newsml.xml", "nml"],
    role: "export",
    notes: "NewsML XML (<newsItem> + HeadLine title + NewsItemId Trang n + DataContent body). Uploading .newsml / .newsml.xml / .nml builds a PDF from DataContent (then slugline, then HeadLine). JSON-shaped NewsML uses pagesFromJson. Match .newsml / .newsml.xml / .nml before generic XML. <newsML> does not match as a <newsItem> record.",
  },
  {
    id: "nitf",
    label: "NITF",
    aliases: ["nitf.xml"],
    role: "export",
    notes: "NITF XML (<nitf> + title title + hl1 Trang n + p body). Uploading .nitf / .nitf.xml builds a PDF from p (then abstract, then hl1, then title). JSON-shaped NITF uses pagesFromJson. Match .nitf / .nitf.xml before generic XML. <nitfCollection> does not match as a <nitf> record.",
  },
  {
    id: "sportsml",
    label: "SportsML",
    aliases: ["sportsml.xml", "sml"],
    role: "export",
    notes: "SportsML XML (<sportsEvent> + name title + eventId Trang n + narrative body). Uploading .sportsml / .sportsml.xml / .sml builds a PDF from narrative (then slugline, then name). JSON-shaped SportsML uses pagesFromJson. Match .sportsml / .sportsml.xml / .sml before generic XML. <sportsML> does not match as a <sportsEvent> record.",
  },
  {
    id: "eventsml",
    label: "EventsML",
    aliases: ["eventsml.xml"],
    role: "export",
    notes: "EventsML XML (<eventsItem> + name title + eventId Trang n + description body). Uploading .eventsml / .eventsml.xml builds a PDF from description (then note, then name). JSON-shaped EventsML uses pagesFromJson. Match .eventsml / .eventsml.xml before generic XML. <eventsML> does not match as an <eventsItem> record.",
  },
  {
    id: "newsmlg2",
    label: "NewsML-G2",
    aliases: ["newsmlg2.xml", "newsml-g2", "nar"],
    role: "export",
    notes: "NewsML-G2 XML (<packageItem> + headline title + itemId Trang n + body). Uploading .newsmlg2 / .newsmlg2.xml / .newsml-g2 / .nar builds a PDF from body (then description, then headline). JSON-shaped NewsML-G2 uses pagesFromJson. Match .newsmlg2 / .newsmlg2.xml / .newsml-g2 / .nar before generic XML and before NewsML .newsml. <newsMessage> does not match as a <packageItem> record. Do not reuse <newsItem> (NewsML 1.2).",
  },
  {
    id: "rnews",
    label: "rNews",
    aliases: ["rnews.xml"],
    role: "export",
    notes: "rNews XML (<NewsArticle> + headline title + identifier Trang n + articleBody). Uploading .rnews / .rnews.xml builds a PDF from articleBody (then description, then headline). JSON-shaped rNews uses pagesFromJson. Match .rnews / .rnews.xml before generic XML. <rNews> does not match as a <NewsArticle> record.",
  },
  {
    id: "prism",
    label: "PRISM",
    aliases: ["prism.xml"],
    role: "export",
    notes: "PRISM XML (<article> + title title + identifier Trang n + body). Uploading .prism / .prism.xml builds a PDF from body (then description, then title). JSON-shaped PRISM uses pagesFromJson. Match .prism / .prism.xml before generic XML. <prism> does not match as an <article> record.",
  },
  {
    id: "hnews",
    label: "hNews",
    aliases: ["hnews.xml"],
    role: "export",
    notes: "hNews XML (<entry> + headline title + identifier Trang n + content). Uploading .hnews / .hnews.xml builds a PDF from content (then description, then headline). JSON-shaped hNews uses pagesFromJson. Match .hnews / .hnews.xml before generic XML. <hnews> does not match as an <entry> record. Do not use .hn as an hNews alias.",
  },
  {
    id: "iptc",
    label: "IPTC",
    aliases: ["iptc.xml"],
    role: "export",
    notes: "IPTC 7901 XML (<iptcItem> + headline title + identifier Trang n + body). Uploading .iptc / .iptc.xml builds a PDF from body (then description, then headline). JSON-shaped IPTC uses pagesFromJson. Match .iptc / .iptc.xml before generic XML. <iptc> does not match as an <iptcItem> record. Do not use .ipt as an IPTC alias.",
  },
  {
    id: "anpa",
    label: "ANPA",
    aliases: ["anpa.xml"],
    role: "export",
    notes: "ANPA XML (<anpaStory> + headline title + identifier Trang n + text). Uploading .anpa / .anpa.xml builds a PDF from text (then description, then headline). JSON-shaped ANPA uses pagesFromJson. Match .anpa / .anpa.xml before generic XML. <anpa> does not match as an <anpaStory> record. Do not use .anp as an ANPA alias.",
  },
  {
    id: "ninjs",
    label: "NINJS",
    aliases: ["ninjs.json"],
    role: "export",
    notes: "IPTC News in JSON (items + headline title + profile Trang n + body_text). Uploading .ninjs / .ninjs.json builds a PDF from body_text (then description, then headline). JSON objects without a ninjs/items envelope use pagesFromJson. Match .ninjs / .ninjs.json before generic JSON. Do not use .nj as a NINJS alias.",
  },
  {
    id: "jsonfeed",
    label: "JSON Feed",
    aliases: ["jsonfeed.json"],
    role: "export",
    notes: "JSON Feed 1.1 (items + title + content_text). Uploading .jsonfeed / .jsonfeed.json builds a PDF from content_text (then summary, then title). JSON objects without a jsonfeed.org version/items envelope use pagesFromJson. Match .jsonfeed / .jsonfeed.json before generic JSON. Do not use .jf as a JSON Feed alias.",
  },
  {
    id: "as2",
    label: "Activity Streams",
    aliases: ["as2.json"],
    role: "export",
    notes: "Activity Streams 2.0 OrderedCollection (orderedItems + name Trang n + content). Uploading .as2 / .as2.json builds a PDF from content (then summary, then name). JSON objects without an activitystreams/@context or OrderedCollection envelope use pagesFromJson. Match .as2 / .as2.json before generic JSON. Do not use .as as an Activity Streams alias.",
  },
  {
    id: "geojson",
    label: "GeoJSON",
    aliases: ["geojson.json"],
    role: "export",
    notes: "GeoJSON FeatureCollection (features + title + name Trang n + description). Uploading .geojson / .geojson.json builds a PDF from properties.description (then text, then name). JSON objects without a FeatureCollection/features envelope use pagesFromJson. Match .geojson / .geojson.json before generic JSON. Do not use .geo as a GeoJSON alias.",
  },
  {
    id: "kml",
    label: "KML",
    aliases: ["kml.xml"],
    role: "export",
    notes: "KML 2.2 Document (Placemark + name Trang n + description). Uploading .kml / .kml.xml builds a PDF from description (then text, then name). JSON-shaped KML uses pagesFromJson. Match .kml / .kml.xml before generic XML. <kml> does not match as a <Placemark> record. Do not use .km as a KML alias. KMZ ZIP is out of v1.",
  },
  {
    id: "gpx",
    label: "GPX",
    aliases: ["gpx.xml"],
    role: "export",
    notes: "GPX 1.1 waypoints (wpt + name Trang n + desc, lat/lon 0). Uploading .gpx / .gpx.xml builds a PDF from desc (then cmt, then name). JSON-shaped GPX uses pagesFromJson. Match .gpx / .gpx.xml before generic XML. <gpx> does not match as a <wpt> record. Do not use .gp as a GPX alias. Real GPS tracks/CRS are out of v1.",
  },
  {
    id: "osm",
    label: "OSM",
    aliases: ["osm.xml"],
    role: "export",
    notes: "OSM XML 0.6 nodes (node + name Trang n + text tag, lat/lon 0). Uploading .osm / .osm.xml builds a PDF from tag text (then description, then name). JSON-shaped OSM uses pagesFromJson. Match .osm / .osm.xml before generic XML. <osm> does not match as a <node> record. Do not use .os as an OSM alias. Full OSM ways/relations/history are out of v1.",
  },
  {
    id: "georss",
    label: "GeoRSS",
    aliases: ["georss.xml"],
    role: "export",
    notes: "GeoRSS Atom feed (entry + title Trang n + summary, georss:point 0 0). Uploading .georss / .georss.xml builds a PDF from summary (then content, then title). JSON-shaped GeoRSS uses pagesFromJson. Match .georss / .georss.xml before generic XML. <feed> does not match as an <entry> record. Do not use .geo as a GeoRSS alias. Full GeoRSS GML/simple geometry is out of v1.",
  },
  {
    id: "wkt",
    label: "WKT",
    aliases: ["wkt.txt"],
    notes: "Well-Known Text (POINT (0 0) plus page text). Uploading .wkt / .wkt.txt builds a PDF from text after each POINT. JSON objects use pagesFromJson ({ only). Match .wkt / .wkt.txt before generic TXT. Do not use .wk as a WKT alias. Full WKT geometry/CRS is out of v1.",
  },
  {
    id: "gml",
    label: "GML",
    aliases: ["gml.xml"],
    notes: "GML FeatureCollection (featureMember + name Trang n + description, pos 0 0). Uploading .gml / .gml.xml builds a PDF from description (then text, then name). JSON-shaped GML uses pagesFromJson. Match .gml / .gml.xml before generic XML. <FeatureCollection> does not match as a <featureMember> record. Do not use .gm as a GML alias. Full GML geometry/CRS is out of v1.",
  },
  {
    id: "topojson",
    label: "TopoJSON",
    aliases: ["topo.json"],
    role: "export",
    notes: "TopoJSON Topology (GeometryCollection of Point geometries whose properties.text is page text). Uploading .topojson / .topo.json builds a PDF from text (then description, then name). JSON objects without a Topology envelope use pagesFromJson. Match .topojson / .topo.json before generic JSON. Do not use .topo as a TopoJSON alias. Full TopoJSON arcs/transform is out of v1.",
  },
  {
    id: "svg",
    label: "SVG",
    aliases: ["svg.xml"],
    role: "export",
    notes: "SVG groups (g + title Trang n + desc). Uploading .svg / .svg.xml builds a PDF from desc (then text, then title). JSON-shaped SVG uses pagesFromJson. Match .svg / .svg.xml before generic XML. <svg> does not match as a <g> record. Do not use .sv as an SVG alias. Full SVG graphics/CSS is out of v1.",
  },
  {
    id: "dxf",
    label: "DXF",
    aliases: ["dxf.txt"],
    role: "export",
    notes: "AutoCAD DXF TEXT entities (group 1 page text; newlines |). Uploading .dxf / .dxf.txt builds a PDF from TEXT (then MTEXT). JSON objects use pagesFromJson ({ only). Match .dxf / .dxf.txt before generic TXT. Do not use .dx as a DXF alias. Full DXF geometry/BLOCKS is out of v1.",
  },
  {
    id: "mapml",
    label: "MapML",
    aliases: ["mapml.xml"],
    role: "export",
    notes: "MapML features (feature + name Trang n + description, coordinates 0 0). Uploading .mapml / .mapml.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .mapml / .mapml.xml before generic XML. <mapml> does not match as a <feature> record. Do not use .ma or .map as a MapML alias. Full MapML extents/tiles is out of v1.",
  },
  {
    id: "cityjson",
    label: "CityJSON",
    aliases: ["city.json"],
    role: "export",
    notes: "CityJSON 2.0 (Building CityObjects whose attributes.description is page text). Uploading .cityjson / .city.json builds a PDF from description (then text, then name). JSON objects without a CityJSON envelope use pagesFromJson. Match .cityjson / .city.json before generic JSON. Do not use .city as a CityJSON alias. Full CityJSON geometry/appearance is out of v1.",
  },
  {
    id: "indoorgml",
    label: "IndoorGML",
    aliases: ["indoorgml.xml"],
    role: "export",
    notes: "IndoorGML CellSpace (cellSpaceMember + name Trang n + description). Uploading .indoorgml / .indoorgml.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .indoorgml / .indoorgml.xml before generic XML. <IndoorFeatures> does not match as a <cellSpaceMember> record. Do not use .in or .indoor as an IndoorGML alias. Full IndoorGML geometry/navigation is out of v1.",
  },
  {
    id: "citygml",
    label: "CityGML",
    aliases: ["citygml.xml"],
    role: "export",
    notes: "CityGML 2.0 Building (cityObjectMember + name Trang n + description). Uploading .citygml / .citygml.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .citygml / .citygml.xml before generic XML. <CityModel> does not match as a <cityObjectMember> record. Do not use .cg or .city as a CityGML alias. Full CityGML geometry/appearance is out of v1.",
  },
  {
    id: "landxml",
    label: "LandXML",
    aliases: ["landxml.xml"],
    role: "export",
    notes: "LandXML Parcel (Parcel + name Trang n + Desc). Uploading .landxml / .landxml.xml builds a PDF from Desc (then description, then name). JSON objects use pagesFromJson. Match .landxml / .landxml.xml before generic XML. <LandXML> does not match as a <Parcel> record. Do not use .land or .lx as a LandXML alias. Full LandXML survey/geometry is out of v1.",
  },
  {
    id: "ifcxml",
    label: "IFC-XML",
    aliases: ["ifc.xml"],
    role: "export",
    notes: "IFC-XML IfcBuilding (IfcBuilding + Name Trang n + Description). Uploading .ifcxml / .ifc.xml builds a PDF from Description (then text, then name). JSON objects use pagesFromJson. Match .ifcxml / .ifc.xml before generic XML. <ifcXML> does not match as an <IfcBuilding> record. Do not use .ifc or .if as an IFC-XML alias (.ifc is STEP). Full IFC geometry/relationships is out of v1.",
  },
  {
    id: "gbxml",
    label: "gbXML",
    aliases: ["gbxml.xml"],
    role: "export",
    notes: "gbXML BuildingStorey (BuildingStorey + Name Trang n + Description). Uploading .gbxml / .gbxml.xml builds a PDF from Description (then text, then name). JSON objects use pagesFromJson. Match .gbxml / .gbxml.xml before generic XML. <gbXML> does not match as a <BuildingStorey> record. Do not use .gb or .gbx as a gbXML alias. Full gbXML geometry/HVAC is out of v1.",
  },
  {
    id: "bcfxml",
    label: "BCF",
    aliases: ["bcf.xml"],
    role: "export",
    notes: "BCF Markup Topic (Topic + Title Trang n + Description). Uploading .bcfxml / .bcf.xml builds a PDF from Description (then Comment, then Title). JSON objects use pagesFromJson. Match .bcfxml / .bcf.xml before generic XML. <Markup> does not match as a <Topic> record. Do not use .bcf or .bc as a BCF XML alias (.bcf is the ZIP). Full BCF viewpoints/BIM snippets is out of v1.",
  },
  {
    id: "cobiexml",
    label: "COBie",
    aliases: ["cobie.xml"],
    role: "export",
    notes: "COBie Component (Component + Name Trang n + Description). Uploading .cobiexml / .cobie.xml builds a PDF from Description (then text, then name). JSON objects use pagesFromJson. Match .cobiexml / .cobie.xml before generic XML. <COBie> does not match as a <Component> record. Do not use .cobie or .cob as a COBie XML alias (.cobie is often XLSX). Full COBie spreadsheet/relationships is out of v1.",
  },
  {
    id: "landinfra",
    label: "LandInfra",
    aliases: ["landinfra.xml"],
    role: "export",
    notes: "LandInfra Feature (Feature + name Trang n + description). Uploading .landinfra / .landinfra.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .landinfra / .landinfra.xml before generic XML. <LandInfra> does not match as a <Feature> record. Do not use .land or .li as a LandInfra alias. Full LandInfra geometry/survey is out of v1.",
  },
  {
    id: "infragml",
    label: "InfraGML",
    aliases: ["infragml.xml"],
    role: "export",
    notes: "InfraGML featureMember (featureMember + name Trang n + description). Uploading .infragml / .infragml.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .infragml / .infragml.xml before generic XML. <InfraGML> does not match as a <featureMember> record. Do not use .infra or .ig as an InfraGML alias. Full InfraGML geometry/alignment is out of v1.",
  },
  {
    id: "opendrive",
    label: "OpenDRIVE",
    aliases: ["opendrive.xml", "xodr"],
    role: "export",
    notes: "OpenDRIVE road (road + name Trang n + description). Uploading .opendrive / .opendrive.xml / .xodr builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .opendrive / .opendrive.xml / .xodr before generic XML. <OpenDRIVE> does not match as a <road> record. Do not use .od or .odr as an OpenDRIVE alias. Full OpenDRIVE geometry/road network is out of v1.",
  },
  {
    id: "railml",
    label: "RailML",
    aliases: ["railml.xml"],
    role: "export",
    notes: "RailML line (line + name Trang n + description). Uploading .railml / .railml.xml builds a PDF from description (then text, then name). JSON objects use pagesFromJson. Match .railml / .railml.xml before generic XML. <railml> does not match as a <line> record. Do not use .rail or .rml as a RailML alias. Full RailML timetable/infrastructure is out of v1.",
  },
  {
    id: "xlsx",
    label: "XLSX",
    role: "export",
    notes: "Excel workbook with page,text columns. Uploading XLSX builds a PDF from those rows. Binary .xls is rejected.",
  },
  {
    id: "docx",
    label: "DOCX / DOC",
    role: "export",
    aliases: ["doc"],
    notes: "Word document generated from extracted text. Uploading DOCX (Office Open XML) builds a PDF first; binary .doc is rejected.",
  },
  {
    id: "odt",
    label: "ODT",
    role: "export",
    notes: "OpenDocument Text ZIP. Uploading ODT builds a PDF from content.xml.",
  },
  {
    id: "ods",
    label: "ODS",
    role: "export",
    notes: "OpenDocument Spreadsheet ZIP with page,text columns. Uploading ODS builds a PDF from those rows.",
  },
  {
    id: "pptx",
    label: "PPTX",
    role: "export",
    notes: "PowerPoint Office Open XML, one slide per page. Uploading PPTX builds a PDF from slide text. Binary .ppt is rejected.",
  },
  {
    id: "odp",
    label: "ODP",
    role: "export",
    notes: "OpenDocument Presentation ZIP, one slide per page. Uploading ODP builds a PDF from draw:page text.",
  },
  {
    id: "fb2",
    label: "FB2",
    role: "export",
    notes: "FictionBook XML ebook. Uploading FB2 builds a PDF from section bodies.",
  },
  {
    id: "epub",
    label: "EPUB",
    role: "export",
    notes: "Reflowable ebook from extracted text. Uploading EPUB builds a PDF from the spine XHTML.",
  },
  {
    id: "mobi",
    label: "MOBI",
    role: "export",
    notes: "Kindle-oriented export. POSTs EPUB to /api/mobi for Calibre ebook-convert when available; otherwise EPUB fallback.",
  },
  {
    id: "png",
    label: "PNG",
    role: "export",
    notes: "Raster of each selected page. One page downloads a PNG; several pages download a ZIP. Uploading PNG builds a PDF page first.",
  },
  {
    id: "jpg",
    label: "JPEG",
    role: "export",
    aliases: ["jpeg"],
    notes: "Raster of each selected page with a white background. Several pages download a ZIP. Uploading JPEG builds a PDF page first.",
  },
  {
    id: "webp",
    label: "WEBP",
    role: "export",
    notes: "Raster of each selected page as WEBP. Several pages download a ZIP. Uploading WEBP is decoded to PNG then embedded as a PDF page.",
  },
  {
    id: "cbz",
    label: "CBZ",
    role: "export",
    notes: "Comic Book ZIP of JPEG page rasters named 001.jpg, 002.jpg, …. Always a ZIP, even for one page. Uploading CBZ builds a PDF from PNG/JPEG/WEBP images in the archive.",
  },
] as const;
