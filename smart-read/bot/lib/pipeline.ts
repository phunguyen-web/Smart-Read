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
      "Implement in-browser PDF page operations: rotate, reverse, page numbers, delete, duplicate, extract, keep, split, insert blank, reorder, merge, persist undo, and text overlay.",
  },
  {
    id: "format-converter",
    subagent: "format-converter",
    title: "Format converter",
    summary:
      "Convert PDF (and extracted text) to TXT, HTML, Markdown, DOCX/DOC, EPUB, and MOBI; import TXT/MD/HTML as PDF.",
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
    notes: "Source format. Page rotate 90/180, reverse order, page numbers, delete, duplicate, extract, keep, split to ZIP, insert blank, reorder, merge, persist undo, and text overlay.",
  },
  {
    id: "txt",
    label: "Plain text",
    role: "export",
    notes: "Extracted page text. Uploading TXT builds a PDF first so it can round-trip to other formats.",
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
    id: "docx",
    label: "DOCX / DOC",
    role: "export",
    aliases: ["doc"],
    notes: "Word document generated from extracted text.",
  },
  {
    id: "epub",
    label: "EPUB",
    role: "export",
    notes: "Reflowable ebook from extracted text.",
  },
  {
    id: "mobi",
    label: "MOBI",
    role: "export",
    notes: "Kindle-oriented export. POSTs EPUB to /api/mobi for Calibre ebook-convert when available; otherwise EPUB fallback.",
  },
] as const;
