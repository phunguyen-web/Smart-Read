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
      "Implement in-browser PDF page operations: rotate, reverse, interleave halves / split odd-even, 2-up / 4-up, booklet impose with a print-sheet preview, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number, viewer label, or dest name), remove blank or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split, insert blank or images, reorder, merge, metadata, persist undo, text overlay, outline bookmarks (including dest-less nested folders (depth 3, per-folder collapse, rename/remove, move up/down, indent/outdent, retarget dest, named destinations via addNamedDest / listNamedDests / renameNamedDest / setNamedDestPage / parseNamedDestPageInput / setNamedDestView / setNamedDestXyz / parseNamedDestXyzInput / namedDestXyzFromPaper / namedDestXyzFromDestPage / namedDestXyzFromZoomPreset / namedDestXyzFromAxisPreset / namedDestXyzAxisNeedsPageSize / namedDestXyzFromAxisDestPage / namedDestXyzZoomFromDestPage / destNamesForPage / duplicateNamedDest / addNamedDestsForSelection / namedDestNameForPage / clearNamedDests / removeNamedDest / setOutlineNamedDest) that can collapse or clear), page labels (shown on thumbnails), extract embedded images, open a password-protected PDF, and password-protect a download copy.",
  },
  {
    id: "format-converter",
    subagent: "format-converter",
    title: "Format converter",
    summary:
      "Convert PDF (and extracted text) to TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, Typst, Gemtext, POD, BBCode, Fountain, TiddlyWiki, Texinfo, roff, Jupyter, BibTeX, SRT, VTT, LRC, ICS, CUE, ASS, TTML, SBV, SAMI, SUB, STL, SCC, USF, RT, MPL, DjVu, PS, TEI, JATS, RIS, ENW, CSL-JSON, NBIB, CSL-YAML, EndNote XML, MODS, CFF, DataCite, MARCXML, Dublin Core, ONIX, Unixref, BibJSON, PubMed, JSON-LD, BIBFRAME, Crossref, EAD, METS, PREMIS, MIX, ALTO, PAGE, FOXML, EDM, LIDO, VRA, CDWA Lite, SPECTRUM, Darwin Core, Object ID, EAC-CPF, CIDOC CRM, METS Rights, TextMD, PBCore, EBUCore, MPEG-7, AES57, IEEE LOM, IMS CP, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, and MOBI; raster pages to PNG/JPEG/WEBP/CBZ; import TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/Typst/Gemtext/POD/BBCode/Fountain/TiddlyWiki/Texinfo/roff/Jupyter/BibTeX/SRT/VTT/LRC/ICS/CUE/ASS/TTML/SBV/SAMI/SUB/STL/SCC/USF/RT/MPL/DjVu/PS/TEI/JATS/RIS/ENW/CSL-JSON/NBIB/CSL-YAML/EndNote XML/MODS/CFF/DataCite/MARCXML/Dublin Core/ONIX/Unixref/BibJSON/PubMed/JSON-LD/BIBFRAME/Crossref/EAD/METS/PREMIS/MIX/ALTO/PAGE/FOXML/EDM/LIDO/VRA/CDWA Lite/SPECTRUM/Darwin Core/Object ID/EAC-CPF/CIDOC CRM/METS Rights/TextMD/PBCore/EBUCore/MPEG-7/AES57/IEEE LOM/IMS CP/RTF/DOCX/ODT/ODS/XLSX/PPTX/ODP/FB2/EPUB/CBZ/PNG/JPEG/WEBP as PDF.",
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
    notes: "Source format. Page rotate 90/180, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose (bookletPreviewSheets shows print order without mutating), flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number, viewer label, or dest name), remove no-text or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split to ZIP, insert blank or PNG/JPEG/WEBP, reorder, merge, metadata, persist undo, text overlay, outline bookmarks (nested dest-less folders via addOutlineFolder (optional parentIndex, max depth 3, no /Dest on the folder); per-folder collapse via setOutlineFolderOpen; collapse all with setOutlineFoldersOpen; renameOutlineItem; removeOutlineItem promotes children; moveOutlineItem swaps a sibling subtree; indentOutlineItem nests under the previous sibling; outdentOutlineItem lifts a subtree after its parent; setOutlineDest retargets a leaf to an explicit page (clears destName); addNamedDest / listNamedDests / renameNamedDest / setNamedDestPage / parseNamedDestPageInput / setNamedDestView (XYZ, Fit, FitH, FitV, FitR, FitB, FitBH, FitBV) / setNamedDestXyz / parseNamedDestXyzInput / destNamesForPage / duplicateNamedDest / addNamedDestsForSelection / namedDestNameForPage / clearNamedDests / removeNamedDest / setOutlineNamedDest read and write catalog `/Dests` plus the `/Names` `/Dests` name tree (`/Kids` when dests exceed NAMED_DEST_LEAF_SIZE or the source tree already has `/Kids`, including nested intermediate `/Kids` when leaves exceed the fanout); clearOutline), page labels (1 / i, ii / Trang, or front matter then 1; shown on thumbnails with dest names via destNamesForPage; click a dest name to select it; Tới trang suggests dest names and page labels via gotoSuggestions), extract embedded JPEG/PNG, open a password-protected PDF (working copy stays decrypted), and password-protect a download copy.",
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
