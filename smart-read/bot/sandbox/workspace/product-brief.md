# Smart-Read product brief

Web app to edit PDFs in the browser and convert them to other reading/editing formats.

## Must have

- Upload a PDF (max 20 MB), preview pages (stronger scale on small/sparse pages).
- Edit: thumbnail strip (strong contrast on sparse pages), multi-select rotate 90°/180°, reverse page order, stamp page numbers, watermark, crop margins, odd/even select, delete/duplicate, extract selected pages as a new PDF, keep only the selection, split every N pages into a ZIP of PDFs, insert a blank page, drag a selection as one block (or send it to start/end), undo/redo (persisted locally), merge at a chosen position, click-to-place text overlay; download the result as PDF. Reload in the same browser restores the last PDF and undo stack locally; the user can forget that copy.
- Convert: TXT, HTML, Markdown, RTF, DOCX/DOC, EPUB, MOBI, PNG, JPEG, optional page range with explicit empty/invalid-range errors, or the editor's multi-page selection (including non-contiguous pages). Opening TXT/Markdown/HTML builds a PDF first so those formats can round-trip.

## Out of scope for v1

- Accounts, cloud storage, OCR of scanned-only PDFs, collaborative editing.
