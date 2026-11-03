import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { SUPPORTED_FORMATS } from "../lib/pipeline.js";

export default defineTool({
  description:
    "List the PDF edit surface and export formats Smart-Read supports (TXT, HTML, Markdown, RTF, JSON, JSONL, YAML, XML, CSV, TSV, TOML, Org, LaTeX, INI, AsciiDoc, RST, XLSX, DOCX/DOC, ODT, ODS, PPTX, ODP, FB2, EPUB, MOBI, PNG, JPEG, WEBP), including RTF/DOCX/ODT/ODS/XLSX/PPTX/ODP/FB2/EPUB/JSON/JSONL/YAML/XML/CSV/TSV/TOML/Org/LaTeX/INI/AsciiDoc/RST/WEBP import.",
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    return { formats: SUPPORTED_FORMATS };
  },
});
