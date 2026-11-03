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
      "Implement in-browser PDF page operations: rotate, reverse, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number or viewer label), remove blank or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split, insert blank or images, reorder, merge, metadata, persist undo, text overlay, outline bookmarks (including nested folders that can collapse or clear), page labels (shown on thumbnails), extract embedded images, open a password-protected PDF, and password-protect a download copy.",
  },
  {
    id: "format-converter",
    subagent: "format-converter",
    title: "Format converter",
    summary:
      "Convert PDF (and extracted text) to TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, Atom, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, and MOBI; raster pages to PNG/JPEG/WEBP/CBZ; import TXT/MD/HTML/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/Textile/MediaWiki/DokuWiki/DocBook/OPML/Atom/RSS/RTF/DOCX/ODT/ODS/XLSX/PPTX/ODP/FB2/EPUB/CBZ/PNG/JPEG/WEBP as PDF.",
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
    notes: "Source format. Page rotate 90/180, reverse order, interleave halves / split odd-even, 2-up / 4-up, booklet impose, flip horizontal/vertical, split pages in half, orient portrait/landscape, scale 50/75/125/150%, page numbers, watermark, header/footer, cover page, page border, crop or pad margins, unify mixed page sizes, reading tint, page background color, auto-crop whitespace, grayscale, find text, go to page (number or viewer label), remove no-text or duplicate-text pages, fit to A4/Letter/A5, invert selection, delete, duplicate, extract, keep, split to ZIP, insert blank or PNG/JPEG/WEBP, reorder, merge, metadata, persist undo, text overlay, outline bookmarks (nested folders via addOutlineFolder; collapse with negative Count via setOutlineFoldersOpen; clearOutline), page labels (1 / i, ii / Trang, or front matter then 1; shown on thumbnails), extract embedded JPEG/PNG, open a password-protected PDF (working copy stays decrypted), and password-protect a download copy.",
  },
  {
    id: "txt",
    label: "Plain text",
    role: "export",
    notes: "Extracted page text. Uploading TXT builds a PDF first so it can round-trip to other formats. PNG/JPEG/WEBP, DOCX, ODT, ODS, XLSX, PPTX, ODP, EPUB, CBZ, FB2, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, Textile, MediaWiki, DokuWiki, DocBook, OPML, and Atom/RSS uploads also become PDF pages.",
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
