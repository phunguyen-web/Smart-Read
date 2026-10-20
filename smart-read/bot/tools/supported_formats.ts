import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { SUPPORTED_FORMATS } from "../lib/pipeline.js";

export default defineTool({
  description:
    "List the PDF edit surface and export formats Smart-Read supports (TXT, HTML, Markdown, RTF, JSON, CSV, XLSX, DOCX/DOC, ODT, FB2, EPUB, MOBI, PNG, JPEG, WEBP), including RTF/DOCX/ODT/XLSX/FB2/EPUB/JSON/CSV/WEBP import.",
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    return { formats: SUPPORTED_FORMATS };
  },
});
