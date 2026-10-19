import { defineTool } from "@cursor/bdk/tools";
import * as z from "zod/v4";
import { SUPPORTED_FORMATS } from "../lib/pipeline.js";

export default defineTool({
  description:
    "List the PDF edit surface and export formats Smart-Read supports (TXT, HTML, DOCX/DOC, EPUB, MOBI).",
  effect: "read",
  inputSchema: z.object({}),
  async execute() {
    return { formats: SUPPORTED_FORMATS };
  },
});
