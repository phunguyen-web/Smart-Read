import { defineAgent } from "@cursor/bdk";

export default defineAgent({
  description:
    "Stage 3 — PDF editor: implement in-browser PDF page rotate, reverse, page numbers, header/footer, cover page, page border, unify mixed sizes, reading tint, auto-crop whitespace, find text, fit to A4/Letter/A5, pad margins, outline bookmarks (including dest-less nested folders (depth 3, per-folder collapse, rename/remove, move up/down, indent/outdent, retarget dest) that can collapse or clear), page labels on thumbnails, open encrypted PDFs, delete, reorder, merge, text overlay (including top-right / bottom-center / bottom-right presets), and redact, highlight, underline, strikeout, sign selected pages, add fillable text fields, add sticky-note comments, add fillable checkboxes, add file attachments, add fillable radio buttons, add fillable dropdowns, URI link annotations, add URI link annotations.",
});
